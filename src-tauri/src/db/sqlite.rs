use std::fs;
use sqlx::{sqlite::{SqliteConnectOptions, SqlitePoolOptions}, FromRow, Pool, Sqlite, SqlitePool};
use anyhow::{Result, Context, Error};
use std::str::FromStr;
use log::info;
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
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS users (
            id   INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            age  INTEGER NOT NULL
        );
        "#,
        )
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
    use sqlx::sqlite::SqlitePoolOptions;
    use crate::db::sqlite::init_db;

    #[tokio::test]
    async fn test_insert2db() {
        todo!()
    }

}