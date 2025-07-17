use anyhow::{Context, Error, Result};
use log::info;
use sqlx::{sqlite::{SqliteConnectOptions, SqlitePoolOptions}, FromRow, Pool, Sqlite, SqlitePool};
use std::fs;
use std::str::FromStr;
use tauri::{path::BaseDirectory, AppHandle, Manager};

/// 获取tauri应用 的应用数据目录
fn get_app_data_dir(app: &AppHandle) -> std::path::PathBuf {
    app.path()
        .resolve("data", BaseDirectory::AppData) // 自动处理跨平台路径
        .expect("Failed to resolve path")
}

/// 获取数据库文件路径
fn get_or_set_db_path(app_data_dir: std::path::PathBuf) -> Result<String> {
    // 构建数据库路径
    let db_path = app_data_dir.join("app_data.db");
    info!("数据库文件存放路径为{:?}", db_path);
    // 转换为字符串
    db_path.to_str()
        .map(|s| s.to_string())
        .ok_or_else(|| anyhow::anyhow!("无效的数据库路径"))
}

/// 初始化数据库连接池
async fn init_db(app: &AppHandle) -> Result<Pool<Sqlite>> {
    // 确保应用数据目录存在
    let app_data_dir = get_app_data_dir(app);
    if !app_data_dir.exists() {  // 目录不存在则创建
        fs::create_dir_all(&app_data_dir)?;
    }
    // 获取数据库路径
    let db_path = get_or_set_db_path(app_data_dir)?;
    // 创建数据库连接池
    let pool = creat_database_connection_pool(db_path).await.expect("创建数据库连接池失败");

    // 初始化数据库结构
    init_db_schema(&pool).await?;

    Ok(pool)
}

/// 创建数据库连接池 
/// # 参数
/// - `db_path`: 为.db文件的路径 eg:"C:\Users\likanug\AppData\Roaming\com.likanug.dev\data\app_data.db"
/// # 返回值
/// 返回一个 Pool<Sqlite> 类型的Result
async fn creat_database_connection_pool(db_path: String) -> Result<Pool<Sqlite>, Error> {
    // 创建连接选项
    let connect_options = SqliteConnectOptions::from_str(&format!("file:{}?mode=rwc", db_path))?
        .create_if_missing(true)
        .journal_mode(sqlx::sqlite::SqliteJournalMode::Wal)
        .synchronous(sqlx::sqlite::SqliteSynchronous::Normal)
        .busy_timeout(std::time::Duration::from_secs(5));

    // 创建连接池
    let pool = SqlitePoolOptions::new()
        .max_connections(5)
        .connect_with(connect_options)
        .await
        .with_context(|| format!("无法连接数据库: {}", db_path));
    pool
}

/// 初始化数据库结构
async fn init_db_schema(pool: &SqlitePool) -> Result<()> {
    let init_sql = r#"
        CREATE TABLE IF NOT EXISTS users (
            id   INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            age  INTEGER NOT NULL
        );
        "#;
    sqlx::query(init_sql)
        .execute(pool)
        .await?;
    Ok(())
}

// 初始化逻辑
pub async fn setup_app_db(app: &mut tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    let app_handle = app.handle();
    init_db(&app_handle).await.expect("database init failed!");
    Ok(())
}

#[derive(Debug, FromRow)]
pub struct User {
    pub id: i64,
    pub name: String,
    pub age: i32,
}


#[cfg(test)]
mod tests {
    use crate::db::sqlite::{creat_database_connection_pool, init_db_schema, User};
    use sqlx::{Pool, Sqlite, SqlitePool};
    use std::fs::File;
    use std::io::{Seek, SeekFrom, Write};
    use tempfile::NamedTempFile;

    #[test]
    fn test_with_temp_file() -> std::io::Result<()> {
        // 创建临时文件，自动位于系统临时目录，测试结束后自动删除
        let mut tmp_file = NamedTempFile::new()?;
        println!("{:?}", tmp_file);

        // 写入数据
        writeln!(tmp_file, "line 1")?;
        writeln!(tmp_file, "line 2")?;

        // 为了演示，重新打开临时文件以读取内容
        let mut file = File::open(tmp_file.path())?;
        file.seek(SeekFrom::Start(0))?;

        // 执行测试断言逻辑...
        let content = std::fs::read_to_string(tmp_file.path())?;
        assert!(content.contains("line 1"));

        Ok(())
    }

    async fn get_test_db_connection_pool() -> Pool<Sqlite>{
        let tmp_file = NamedTempFile::new();
        let db_url = tmp_file.unwrap().path().to_str().unwrap().to_string();
        //let db_url = "C:\\Users\\likanug\\AppData\\Roaming\\com.likanug.dev\\data\\app_data.db".to_string();
        creat_database_connection_pool(db_url).await.unwrap()
    }

    #[tokio::test]
    async fn test_get_db_connecting_pool() {
        let pool = get_test_db_connection_pool();
        assert_eq!(pool.await.size(), 1);
    }

    #[tokio::test]
    async fn db_operation() {
        // 获取数据库连接池
        let pool = SqlitePool::connect("sqlite::memory:").await.unwrap();
        init_db_schema(&pool).await.expect("建表失败");
        // 执行sql
        sqlx::query("INSERT INTO users (name, age) VALUES (?, ?)")
            .bind("Alice")
            .bind(30i32)
            .execute(&pool)
            .await
            .unwrap();
        sqlx::query("INSERT INTO users (name, age) VALUES (?, ?)")
            .bind("John")
            .bind(18i32)
            .execute(&pool)
            .await
            .unwrap();

        let users = sqlx::query_as::<_, User>("SELECT id, name, age FROM users;")
            .fetch_all(&pool)
            .await
            .unwrap();
        assert_eq!(users.len(), 2);
        assert_eq!(users[0].name, "Alice");

        let user = sqlx::query_as::<_, User>("SELECT id, name, age FROM users WHERE name = ?;")
            .bind("John")
            .fetch_one(&pool)
            .await
            .unwrap();
        assert_eq!(user.age, 18);

        // update sql 测试
        sqlx::query("UPDATE users SET age = ? WHERE name = ?;")
            .bind(21)
            .bind("John")
            .execute(&pool)
            .await
            .unwrap();
        let user = sqlx::query_as::<_, User>("SELECT id, name, age FROM users WHERE name = ?;")
            .bind("John")
            .fetch_one(&pool)
            .await
            .unwrap();
        assert_eq!(user.age, 21);

        sqlx::query("DELETE FROM users WHERE NAME = ?")
            .bind("Alice")
            .execute(&pool)
            .await
            .unwrap();

        // 查询一个不存在的用户
        let user = sqlx::query_as::<_, User>("SELECT id, name, age FROM users WHERE name = ?")
            .bind("Alice")
            .fetch_optional(&pool)
            .await
            .expect("数据库查询出错");

        // 断言确实为空
        assert!(user.is_none(), "期望用户不存在，但查询到了结果");
    }

}