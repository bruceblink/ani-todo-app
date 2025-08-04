use crate::db::po::{AniWatch, AniWatchHistory};
use crate::db::po::AniColl;
use crate::db::common::run_query;
use crate::db::Ani;
use anyhow::{Context, Error, Result};
use log::info;
use sqlx::migrate::Migrator;
use sqlx::{
    sqlite::{SqliteConnectOptions, SqlitePoolOptions},
    Pool, Sqlite, SqlitePool,
};
use std::fs;
use std::str::FromStr;
use tauri::{path::BaseDirectory, AppHandle, Manager};
use crate::db::po::AniCollect;

pub static MIGRATOR: Migrator = sqlx::migrate!(); // 自动读取 src-tauri/migrations 目录下的所有sql脚本
/// 获取tauri应用 的应用数据目录
pub fn get_app_data_dir(app: &AppHandle) -> std::path::PathBuf {
    app.path()
        .resolve("data", BaseDirectory::AppData) // 自动处理跨平台路径
        .expect("Failed to resolve path")
}

/// 获取数据库文件路径
pub fn get_or_set_db_path(app_data_dir: std::path::PathBuf) -> Result<String> {
    // 构建数据库路径
    let db_path = app_data_dir.join("app_data.db");
    info!("数据库文件存放路径为{:?}", db_path);
    // 转换为字符串
    db_path
        .to_str()
        .map(|s| s.to_string())
        .ok_or_else(|| anyhow::anyhow!("无效的数据库路径"))
}

/// 初始化数据库连接池
pub async fn init_and_migrate_db(app: &AppHandle) -> Result<Pool<Sqlite>> {
    // 确保应用数据目录存在
    let app_data_dir = get_app_data_dir(app);
    if !app_data_dir.exists() {
        fs::create_dir_all(&app_data_dir).context("创建应用数据目录失败")?;
    }

    let db_path = get_or_set_db_path(app_data_dir).context("获取数据库路径失败")?;
    let pool = creat_database_connection_pool(db_path)
        .await
        .context("创建数据库连接池失败")?;

    // 运行迁移
    MIGRATOR.run(&pool).await.context("数据库迁移或初始化失败!")?;

    info!("数据库初始化成功");
    Ok(pool)
}

/// 创建数据库连接池
/// # 参数
/// - `db_path`: 为.db文件的路径 eg:"C:\Users\likanug\AppData\Roaming\com.likanug.dev\data\app_data.db"
/// # 返回值
/// 返回一个 Pool<Sqlite> 类型的Result
pub async fn creat_database_connection_pool(db_path: String) -> Result<Pool<Sqlite>, Error> {
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
    info!("获取数据库连接池成功");
    pool
}


#[allow(dead_code)]
/// 测试初始化数据库结构
async fn test_init_db_schema(pool: &SqlitePool) -> Result<()> {
    // 读取 migrations 目录下的所有 SQL 脚本
    MIGRATOR.run(pool)
        .await
        .context("数据库迁移失败")

}

// 初始化逻辑
pub async fn setup_app_db(app: &mut tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    let app_handle = app.handle();
    init_and_migrate_db(&app_handle)
        .await
        .expect("database init or migrate failed!");
    Ok(())
}

use crate::platforms::AniItem;
use crate::utils::date_utils::parse_date_to_millis;

/// 动漫信息插入新记录
pub async fn upsert_ani_info(pool: &SqlitePool, item: &AniItem) -> Result<()> {
    let update_time = parse_date_to_millis(&item.update_time, true)?;
    let _ = sqlx::query(
                r#"
                    INSERT INTO ani_info (
                        title,
                        update_count,
                        update_info,
                        image_url,
                        detail_url,
                        update_time,
                        platform
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(title, platform, update_count) DO UPDATE SET
                        update_info = excluded.update_info,
                        image_url = excluded.image_url,
                        detail_url = excluded.detail_url
                "#,
            )
        .bind(&item.title)
        .bind(&item.update_count)
        .bind(&item.update_info)
        .bind(&item.image_url)
        .bind(&item.detail_url)
        .bind(update_time)
        .bind(&item.platform)
        .execute(pool)
        .await
        .map_err(|e| {
            anyhow::anyhow!("插入或更新 ani_info {:?} 失败: {}",item,e)
            }
        )?;

    Ok(())
}

/// 根据 id 查询单条
pub async fn get_ani_info_by_id(pool: &SqlitePool, id: i64) -> Result<Ani> {
    let rec = sqlx::query_as::<_, Ani>(
        r#" SELECT id,
                    title,
                    update_count,
                    update_info,
                    image_url,
                    detail_url,
                    update_time,
                    platform
                FROM ani_info
                WHERE
                  id = ?
            ;"#
         )
        .bind(id)
        .fetch_optional(pool)
        .await?
        .context(format!("查询番剧 ID={} 不存在", id))?;
    Ok(rec)
}


/// 查询所有动漫信息
pub async fn list_all_ani_info<>(pool: &SqlitePool) -> Result<Vec<Ani>> {
    // 构造带绑定参数的 QueryAs
    let query = sqlx::query_as::<_, Ani>(
        r#"
                SELECT id,
                    title,
                    update_count,
                    update_info,
                    image_url,
                    detail_url,
                    update_time,
                    platform
                FROM ani_info
                "#
              );
    // 调用通用的 run_query
    let list = run_query(pool, query).await?;
    Ok(list)
}


/// 查询所有今天观看过的动漫信息
pub async fn list_all_ani_info_watched_today<>(pool: &SqlitePool, update_time:i64) -> Result<Vec<AniWatchHistory>> {
    // 构造带绑定参数的 QueryAs
    let query = sqlx::query_as::<_, AniWatchHistory>(
        r#"SELECT id,
                      user_id,
                      ani_item_id,
                      watched_time
                FROM ani_watch_history
                WHERE
                    watched_time = ? AND
                    user_id = ?
                ORDER BY
                    watched_time DESC
           ;"#,
         ).bind(update_time)
          .bind(""); // 用户ID，暂时留空
    // 调用通用的 run_query
    let list = run_query(pool, query).await?;
    Ok(list)
}


/// 根据更新时间查询所有记录，按更新时间降序
pub async fn list_all_ani_info_by_update_time<>(pool: &SqlitePool, update_time:i64) -> Result<Vec<Ani>> {
    // 构造带绑定参数的 QueryAs
    let query = sqlx::query_as::<_, Ani>(
                r#"
                SELECT id,
                    title,
                    update_count,
                    update_info,
                    image_url,
                    detail_url,
                    update_time,
                    platform
                FROM ani_info
                WHERE
                   update_time >= ?
                ORDER BY update_time DESC
                "#
               ).bind(update_time);
    // 调用通用的 run_query
    let list = run_query(pool, query).await?;
    Ok(list)
}

/// 更新除 id 外的所有字段
pub async fn update_ani_info(pool: &SqlitePool, item: &Ani) -> Result<u64> {
    let res = sqlx::query(
        r#" UPDATE ani_info SET
                        title = ?,
                        update_count = ?,
                        update_info = ?,
                        image_url = ?,
                        detail_url = ?,
                        update_time = ?,
                        platform = ?
                  WHERE id = ?
            "#)
            .bind(&item.title)
            .bind(&item.update_count)
            .bind(&item.update_info)
            .bind(&item.image_url)
            .bind(&item.detail_url)
            .bind(item.update_time)
            .bind(&item.platform)
            .bind(&item.id)
            .execute(pool)
            .await
            .context(format!("更新番剧 ID={} 失败", item.id))?;

    Ok(res.rows_affected())
}

/// 删除指定 id
pub async fn delete_ani_info(pool: &SqlitePool, id: i64) -> Result<u64> {
    let res = sqlx::query(
        "DELETE FROM ani_info WHERE id = ?"
       )
        .bind(id)
        .execute(pool)
        .await
        .context(format!("删除番剧 ID={} 失败", id))?;

    Ok(res.rows_affected())
}


/// 动漫关注插入新记录
pub async fn upsert_ani_collect(pool: &SqlitePool, item: &AniColl) -> Result<i64> {
    let update_time = parse_date_to_millis(&item.collect_time, true)?;
    let res = sqlx::query(
        r#"
                INSERT INTO ani_collect (
                    user_id,
                    ani_item_id,
                    ani_title,
                    collect_time,
                    is_watched
                ) VALUES (?, ?, ?, ?, ?)
                ON CONFLICT(user_id, ani_item_id)
                DO UPDATE SET
                    collect_time = excluded.collect_time
             "#,
         )
        .bind(&item.user_id)
        .bind(&item.ani_item_id)
        .bind(&item.ani_title)
        .bind(update_time)
        .bind(&item.is_watched)
        .execute(pool)
        .await
        .context(format!("插入或者更新 ani_collect ={:?} 失败", item))?;

    Ok(res.last_insert_rowid())
}

/// 删除指定的动漫收藏
pub async fn delete_ani_collect(pool: &SqlitePool, ani_id: i64, ani_title: String) -> Result<u64> {
    let res = sqlx::query(
        r#"DELETE FROM ani_collect
                      WHERE
                            ani_item_id = ? OR
                            ani_title = ?
                  ;"#)
        .bind(&ani_id)
        .bind(&ani_title)
        .execute(pool)
        .await
        .context(format!("删除番剧收藏 ani_id={} ani_title ={}失败", ani_id, ani_title))?;

    Ok(res.rows_affected())
}

/// 查询所有关注的动漫列表
pub async fn list_all_ani_collect<>(pool: &SqlitePool) -> Result<Vec<AniCollect>> {
    // 构造带绑定参数的 QueryAs
    let query = sqlx::query_as::<_, AniCollect>(
        r#"
                SELECT id,
                    user_id,
                    ani_item_id,
                    ani_title,
                    collect_time,
                    is_watched
                FROM ani_collect
                "#
    );
    // 调用通用的 run_query
    let list = run_query(pool, query).await?;
    Ok(list)
}

/// 查询所有今日更新的动漫
pub async fn list_all_ani_update_today<>(pool: &SqlitePool, today_ts: i64) -> Result<Vec<Ani>> {
    // 构造带绑定参数的 QueryAs
    let sql = sqlx::query_as::<_, Ani>(r#"
                SELECT ai.id,
                       ai.title,
                       ai.update_count,
                       ai.update_info,
                       ai.image_url,
                       ai.detail_url,
                       ai.update_time,
                       ai.platform
                FROM ani_info ai
                WHERE ai.update_time >= ?
           ;"#,
        )
        .bind(&today_ts);
    // 调用通用的 run_query
    let list = run_query(pool, sql).await?;
    Ok(list)
}



pub async fn upsert_ani_watch_history(pool: &SqlitePool, item: &AniWatch) -> Result<()> {
    let watched_time = parse_date_to_millis(&item.watched_time, true)?;
    let _ = sqlx::query(
        r#"
                INSERT INTO ani_watch_history (
                    user_id,
                    ani_item_id,
                    watched_time
                ) VALUES (?, ?, ?)
                ON CONFLICT(user_id, ani_item_id) DO UPDATE SET
                    watched_time = excluded.watched_time
            "#,
        )
        .bind(&item.user_id)
        .bind(&item.ani_item_id)
        .bind(watched_time)
        .execute(pool)
        .await
        .map_err(|e| {
            anyhow::anyhow!(
            "插入或更新 ani_watch_history {:?} 失败: {}",
            item,
            e
        )
        })?;
    Ok(())
}

/// 查询所有关注的动漫今日的更新
pub async fn list_all_follow_ani_update_today<>(pool: &SqlitePool, today_ts: i64) -> Result<Vec<Ani>> {
    // 构造带绑定参数的 QueryAs
    let sql = sqlx::query_as::<_, Ani>(
        r#"
                SELECT
                    ai.id,
                    ai.title,
                    ai.update_count,
                    ai.update_info,
                    ai.image_url,
                    ai.detail_url,
                    ai.update_time,
                    ai.platform
                FROM ani_info ai
                WHERE
                    ai.update_time = ?
                  AND EXISTS (
                      SELECT 1
                      FROM ani_collect ac
                      WHERE ac.ani_title = ai.title
                        AND ac.is_watched = 0
                );
           ;"#,
         )
        .bind(today_ts);
    // 调用通用的 run_query
    let list = run_query(pool, sql).await?;
    Ok(list)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::utils::date_utils::parse_date_to_millis;
    use crate::db::Ani;
    use crate::db::sqlite::{upsert_ani_info};
    use crate::db::sqlite::{creat_database_connection_pool, test_init_db_schema};
    use crate::platforms::AniItem;
    use sqlx::{Pool, Sqlite, SqlitePool};
    use std::fs::File;
    use std::io::{Seek, SeekFrom, Write};
    use anyhow::Context;
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

    async fn get_test_db_connection_pool() -> Pool<Sqlite> {
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

    // 初始化测试数据
    async fn init_test_table_data(pool: &Pool<Sqlite>) -> anyhow::Result<()>{
        // 初始化数据库表结构
        test_init_db_schema(pool).await.context("初始化测试表失败")?;

        let ani_info1 = AniItem{
            title: "名侦探柯南".to_string(),
            update_count: "1234".to_string(),
            update_info: "2025/07/13 更新".to_string(),
            image_url: "https://mikanani.me/images/Bangumi/201310/91d95f43.jpg?width=400&height=400&format=webp".to_string(),
            detail_url: "https://mikanani.me/Home/Bangumi/227".to_string(),
            update_time: "2025/07/13".to_string(), // 2025/07/13 的时间戳
            platform: "mikanani".to_string(),
        };
        let ani_info2 = AniItem{
            title: "You and idol 光之美少女♪".to_string(),
            update_count: "2".to_string(),
            update_info: "2025/07/13 更新".to_string(),
            image_url: "https://mikanani.me/images/Bangumi/202502/4462a4be.jpg?width=400&height=400&format=webp".to_string(),
            detail_url: "https://mikanani.me/Home/Bangumi/3570".to_string(),
            update_time: "2025/07/13".to_string(), // 2025/07/13 的时间戳
            platform: "mikanani".to_string(),
        };

        let ani_info3 = AniItem{
            title: "魔女守护者".to_string(),
            update_count: "2".to_string(),
            update_info: "2025/07/13 更新".to_string(),
            image_url: "https://mikanani.me/images/Bangumi/202504/ff5c2429.jpg?width=400&height=400&format=webp".to_string(),
            detail_url: "https://mikanani.me/Home/Bangumi/3587".to_string(),
            update_time: "2025/07/13".to_string(), // 2025/07/13 的时间戳
            platform: "mikanani".to_string(),
        };

        let ani_info4 = AniItem{
            title: "凸变英雄X".to_string(),
            update_count: "21".to_string(),
            update_info: "2025/07/13 更新".to_string(),
            image_url: "https://mikanani.me/images/Bangumi/202504/9b18d132.jpg?width=400&height=400&format=webp".to_string(),
            detail_url: "https://mikanani.me/Home/Bangumi/3640".to_string(),
            update_time: "2025/07/13".to_string(), // 2025/07/13 的时间戳
            platform: "mikanani".to_string(),
        };


        let ani_info5 = AniItem{
            title: "琉璃的宝石".to_string(),
            update_count: "".to_string(), // 空字符串表示未更新
            update_info: "2025/07/13 更新".to_string(),
            image_url: "https://mikanani.me/images/Bangumi/202507/18470785.jpg?width=400&height=400&format=webp".to_string(),
            detail_url: "https://mikanani.me/Home/Bangumi/3663".to_string(),
            update_time: "2025/07/13".to_string(), // 2025/07/13 的时间戳
            platform: "mikanani".to_string(),
        };


        // 执行sql
        let _ = upsert_ani_info(pool, &ani_info1).await.context("插入数据失败");
        let _ = upsert_ani_info(pool, &ani_info2).await.context("插入数据失败");
        let _ = upsert_ani_info(pool, &ani_info3).await.context("插入数据失败");
        let _ = upsert_ani_info(pool, &ani_info4).await.context("插入数据失败");
        let _ = upsert_ani_info(pool, &ani_info5).await.context("插入数据失败");
        Ok(())
    }

    #[tokio::test]
    async fn test_unique_insert_diff_update_time() {
        // 获取数据库连接池
        let pool = SqlitePool::connect("sqlite::memory:").await.unwrap();
        let _ = init_test_table_data(&pool).await;
        let ani_item1 = AniItem {
            title: "琉璃的宝石".to_string(),
            update_count: "18".to_string(),
            update_info: "2025/07/13 更新".to_string(),
            image_url: "https://mikanani.me/images/Bangumi/202507/18470785.jpg?width=400&height=400&format=webp".to_string(),
            detail_url: "https://mikanani.me/Home/Bangumi/3663".to_string(),
            update_time: "2025/07/13".to_string(), // 2025/07/13 的时间戳
            platform: "mikanani".to_string(),
        };
        upsert_ani_info(&pool, &ani_item1).await.expect("插入数据失败");
        let ani_item2 = AniItem {
            title: "琉璃的宝石".to_string(),
            update_count: "18".to_string(),
            update_info: "2025/07/14 更新".to_string(),
            image_url: "https://mikanani.me/images/Bangumi/202507/18470785.jpg?width=400&height=400&format=webp".to_string(),
            detail_url: "https://mikanani.me/Home/Bangumi/3663".to_string(),
            update_time: "2025/07/14".to_string(), // 2025/07/14 的时间戳
            platform: "mikanani".to_string(),
        };
        // 插入第一条记录
        upsert_ani_info(&pool, &ani_item2).await.expect("插入数据失败");
        // 测试违反唯一约束更新更新数据
        let ani_items = sqlx::query_as::<_, Ani>(
            r#" SELECT id,
                           title,
                           update_count, 
                           update_info, 
                           platform, 
                           image_url, 
                           detail_url, 
                           update_time, 
                           platform
                    FROM ani_info WHERE 
                          title = ? 
             "#
        )
        .bind("琉璃的宝石")
        .fetch_all(&pool)
        .await
        .unwrap();
        println!("{:?}", ani_items);
        assert_eq!(ani_items.len(), 2);
        let ani_item = &ani_items[1];
        assert_eq!(ani_item.update_count, "18");
        assert_eq!(ani_item.update_time, parse_date_to_millis("2025/07/13", true).unwrap());
    }

    #[tokio::test]
    async fn test_db_select_by_id(){
        // 获取数据库连接池
        let pool = SqlitePool::connect("sqlite::memory:").await.unwrap();
        let _ = init_test_table_data(&pool).await;

        // 这里要求查询字段与结构体AniItem中 定义的字段个数和名称要一致
        let ani_item = get_ani_info_by_id(&pool, 1).await;
        match ani_item {
            Ok(ani) => {
                assert_eq!(ani.title, "名侦探柯南");
                assert_eq!(ani.update_count, "1234");
                assert_eq!(ani.update_info, "2025/07/13 更新");
                assert_eq!(ani.platform, "mikanani");
                assert_eq!(ani.image_url, "https://mikanani.me/images/Bangumi/201310/91d95f43.jpg?width=400&height=400&format=webp");
                assert_eq!(ani.detail_url, "https://mikanani.me/Home/Bangumi/227");
                assert_eq!(ani.update_time, parse_date_to_millis("2025/07/13", true).unwrap());
            },
            Err(e) => eprintln!("出错: {}", e),
        }


    }

    #[tokio::test]
    async fn test_db_select_all() {
        // 获取数据库连接池
        let pool = SqlitePool::connect("sqlite::memory:").await.unwrap();
        let _ = init_test_table_data(&pool).await;
        let update_time = parse_date_to_millis("2025/07/13", true).unwrap();
        // 这里要求查询字段与结构体AniItem中 定义的字段个数和名称要一致
        let ani_items = list_all_ani_info_by_update_time(&pool, update_time).await.unwrap();
        assert_eq!(ani_items.len(), 5);
        assert_eq!(ani_items[0].title, "琉璃的宝石");
    }

    #[tokio::test]
    async fn test_db_update_ani_info() {
        let pool = SqlitePool::connect("sqlite::memory:").await.unwrap();
        let _ = init_test_table_data(&pool).await;
        let ani_item = Ani {
            id: 1,
            title: "名侦探柯南-剧场版".to_string(),
            update_count: "2100".to_string(),
            update_info: "2025/07/14 更新".to_string(),
            image_url: "https://mikanani.me/images/Bangumi/201310/91d95f43.jpg?width=400&height=400&format=webp".to_string(),
            detail_url: "https://mikanani.me/Home/Bangumi/227".to_string(),
            update_time: parse_date_to_millis("2025/07/14", true).unwrap(),
            platform: "tencent".to_string(),
        };
        // update sql 测试
        update_ani_info(&pool, &ani_item)
            .await
            .expect("更新数据失败");
        let new_ani_item = get_ani_info_by_id(&pool, 1).await.unwrap();

        assert_eq!(new_ani_item.title, "名侦探柯南-剧场版");
        assert_eq!(new_ani_item.update_count, "2100");
        assert_eq!(new_ani_item.update_time, parse_date_to_millis("2025/07/14", true).unwrap());
        assert_eq!(new_ani_item.platform, "tencent".to_string());
    }

    #[tokio::test]
    async fn test_db_delete_ani_info() {
        // 获取数据库连接池
        let pool = SqlitePool::connect("sqlite::memory:").await.unwrap();
        let _ = init_test_table_data(&pool).await;

        delete_ani_info(&pool, 1).await.unwrap();

        // 查询一个不存在的用户
        let ani_item = get_ani_info_by_id(&pool, 1).await;
        
        // 断言：确实查不到，返回的是 Err
        assert!(ani_item.is_err(), "查询了不存在的番剧 ID，但却没有报错");

        let ani_items = list_all_ani_info(&pool).await.unwrap();
        assert_eq!(ani_items.len(), 4);
        assert_ne!(ani_items[0].image_url, "名侦探柯南");
    }

    #[tokio::test]
    async fn test_collect_ani_item() {
        // 获取数据库连接池
        let pool = SqlitePool::connect("sqlite::memory:").await.unwrap();
        let _ = init_test_table_data(&pool).await;

        let ani_collect = AniColl {
            user_id: "test_user".to_string(),
            ani_item_id: 1,
            ani_title: "名侦探柯南".to_string(),
            collect_time: "2025/07/21".to_string(), // 2025/07/21 的时间戳
            is_watched: false,
        };
        let _ =  upsert_ani_collect(&pool, &ani_collect).await.map_err(|e| e.to_string());
        // 测试取消关注
        // 开启事务
/*        let mut tx = pool.begin().await.map_err(|e| e.to_string()).unwrap();
        let _ = sqlx::query("UPDATE ani_info SET is_favorite = ? WHERE id = ?")
            .bind(false)
            .bind(1)
            .execute(&mut *tx) // ⭐️ 显式解引用
            .await
            .map_err(|e| e.to_string());


        let _ = sqlx::query("DELETE FROM main.ani_collect WHERE id = ?")
            .bind(1)
            .execute(&mut *tx) // ⭐️ 显式解引用
            .await
            .map_err(|e| e.to_string());
        // 提交事务
        let _ = tx.commit().await.map_err(|e| e.to_string());*/

        let ani_collects = list_all_ani_collect(&pool).await.unwrap();
        assert_eq!(ani_collects.len(), 1);
        let ani_collect = &ani_collects[0];
        let collect_time = parse_date_to_millis("2025/07/21", true).unwrap();
        assert_eq!(ani_collect.ani_title, "名侦探柯南");
        assert_eq!(ani_collect.user_id, "test_user");
        assert_eq!(ani_collect.ani_item_id, 1);
        assert_eq!(ani_collect.collect_time, collect_time);
    }

}
