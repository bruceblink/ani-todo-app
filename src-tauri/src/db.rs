use log::info;
use serde_json::json;
use sqlx::{Pool, Sqlite};
use std::collections::HashMap;

pub mod sqlite;
pub mod po;
use crate::db::sqlite::{creat_database_connection_pool, get_app_data_dir, get_or_set_db_path};
use crate::platforms::{AniItemResult};
use crate::utils::date_utils::{get_week_day_of_today, today_iso_date_ld};
use tauri::AppHandle;
use crate::db::po::{Ani, AniIResult, AniWatchHistory};

#[tauri::command]
pub async fn save_ani_item_data(app: AppHandle, ani_data: AniItemResult) -> Result<String, String> {
    let db_path = get_or_set_db_path(get_app_data_dir(&app)).map_err(|e| e.to_string())?;
    let pool: Pool<Sqlite> = creat_database_connection_pool(db_path)
        .await
        .map_err(|e| e.to_string())?;

    let ani_items = ani_data.get(&get_week_day_of_today()).ok_or("获取今日动漫数据失败")?;

    if ani_items.is_empty() {
        return Ok(json!({
            "status": "ok",
            "message": "没有可插入的数据"
        })
        .to_string());
    }

    for item in ani_items {
        sqlx::query(
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
        .bind(&item.update_time)
        .bind(&item.platform)
        .execute(&pool)
        .await
        .map_err(|e| format!("插入或更新失败: {}", e))?;
    }

    Ok(json!({
        "status": "ok",
        "message": "save success"
    })
    .to_string())
}

#[tauri::command]
pub async fn watch_ani_item(
    app: AppHandle,
    ani_id: i64
) -> Result<String, String> {
    // 1. 打开数据库
    let db_path = get_or_set_db_path(get_app_data_dir(&app))
        .map_err(|e| e.to_string())?;
    let pool: Pool<Sqlite> = creat_database_connection_pool(db_path)
        .await
        .map_err(|e| e.to_string())?;

    // 3. 执行更新
    // 开启事务
    let mut tx = pool.begin().await.map_err(|e| e.to_string())?;
    // 更新ani_item表中的watched状态
    sqlx::query(
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
        .bind("")  // 用户ID，暂时留空
        .bind(&ani_id)
        .bind(today_iso_date_ld())  // 当前时间
        .execute(&mut *tx)
        .await
        .map_err(|e| format!("插入或更新失败: {}", e))?;
/*    // 更新ani_collect表中的watched状态
    sqlx::query("UPDATE ani_collect SET watched = 1 WHERE ani_item_id = ?")
        .bind(ani_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| format!("插入或更新失败: {}", e))?;*/
    // 提交事务
    tx.commit().await.map_err(|e| e.to_string())?;
    info!("标记 watched: id = {}", ani_id);
    // 4. 返回统一的 JSON 字符串
    Ok(json!({
        "status":  "ok",
        "message": "remove success"
    })
        .to_string())
}

#[tauri::command]
pub async fn query_today_update_ani_list(app: AppHandle) -> Result<AniIResult, String> {
    let db_path = get_or_set_db_path(get_app_data_dir(&app)).map_err(|e| e.to_string())?;
    let pool: Pool<Sqlite> = creat_database_connection_pool(db_path)
        .await
        .map_err(|e| e.to_string())?;
    // 今天的日期，比如 "2025/07/13"
    let today_date = today_iso_date_ld();
    // 查询当前更新的动漫
    let ani_items = sqlx::query_as::<_, Ani>(r#"
                SELECT ai.id,
                       ai.title,
                       ai.update_count,
                       ai.update_info,
                       ai.image_url,
                       ai.detail_url,
                       ai.update_time,
                       ai.platform
                FROM ani_info ai
                WHERE ai.update_time = ?
           ;"#,
        )
        .bind(&today_date)
        .fetch_all(&pool)
        .await
        .map_err(|e| format!("查询错误: {}", e))?;

    let weekday = get_week_day_of_today();
    let mut result: AniIResult = HashMap::new();
    result.insert(weekday, ani_items);
    Ok(result)
}


#[tauri::command]
pub async fn query_watched_ani_item_list(app: AppHandle) -> Result<Vec<AniWatchHistory>, String> {
    let db_path = get_or_set_db_path(get_app_data_dir(&app)).map_err(|e| e.to_string())?;
    let pool: Pool<Sqlite> = creat_database_connection_pool(db_path)
        .await
        .map_err(|e| e.to_string())?;
    // 今天的日期，比如 "2025/07/13"
    let today_date = today_iso_date_ld();
    // 查询当前更新的动漫
    let ani_items = sqlx::query_as::<_, AniWatchHistory>(
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
        )
        .bind(today_date)
        .bind("") // 用户ID，暂时留空
        .fetch_all(&pool)
        .await
        .map_err(|e| format!("查询错误: {}", e))?;
    
    Ok(ani_items)
}

/// 获取关注动漫今日更新列表
#[tauri::command]
pub async fn query_favorite_ani_update_list(app: AppHandle ) -> Result<Vec<Ani>, String> {
    // 1. 打开数据库
    let db_path = get_or_set_db_path(get_app_data_dir(&app))
        .map_err(|e| e.to_string())?;
    let pool: Pool<Sqlite> = creat_database_connection_pool(db_path)
        .await
        .map_err(|e| e.to_string())?;

    let ani_collectors = sqlx::query_as::<_, Ani>(
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
        .bind(today_iso_date_ld())
        .fetch_all(&pool)
        .await
        .map_err(|e| format!("查询错误: {}", e))?;

    Ok(ani_collectors)
}


/// 关注动漫
#[tauri::command]
pub async fn collect_ani_item(app: AppHandle, ani_id: i64, ani_title: String) -> Result<String, String> {
    // 1. 打开数据库
    let db_path = get_or_set_db_path(get_app_data_dir(&app))
        .map_err(|e| e.to_string())?;
    let pool: Pool<Sqlite> = creat_database_connection_pool(db_path)
        .await
        .map_err(|e| e.to_string())?;

        sqlx::query(
            r#"
                INSERT INTO ani_collect (
                    user_id,
                    ani_item_id,
                    ani_title,
                    collect_time
                ) VALUES (?, ?, ?, ?)
                ON CONFLICT(user_id, ani_item_id)
                DO UPDATE SET
                    collect_time = excluded.collect_time
            "#,
        )
        .bind("")  // 用户ID，暂时留空
        .bind(ani_id)
        .bind(&ani_title)
        .bind(today_iso_date_ld())
        .execute(&pool)
    .await
    .map_err(|e| format!("插入或更新失败: {}", e))?;

    info!("动漫《{}》标记为collected", ani_title);
    // 4. 返回统一的 JSON 字符串
    Ok(json!({
        "status":  "ok",
        "message": "collect success"
    }).to_string())
}

/// 取消关注动漫
#[tauri::command]
pub async fn cancel_collect_ani_item(app: AppHandle, ani_id: i64, ani_title: String) -> Result<String, String> {
    // 1. 打开数据库
    let db_path = get_or_set_db_path(get_app_data_dir(&app))
        .map_err(|e| e.to_string())?;
    let pool: Pool<Sqlite> = creat_database_connection_pool(db_path)
        .await
        .map_err(|e| e.to_string())?;
    // 开启事务
    let mut tx = pool.begin().await.map_err(|e| e.to_string())?;
    // 删除ani_collect表中的记录
    sqlx::query(r#"DELETE FROM ani_collect
                          WHERE
                              ani_item_id = ? OR
                              ani_title = ?
                  ;"#)
        .bind(&ani_id)
        .bind(&ani_title)
        .execute(&mut *tx) // ⭐️ 显式解引用
        .await
        .map_err(|e| format!("删除失败: {}", e))?;
    // 提交事务
    tx.commit().await.map_err(|e| e.to_string())?;

    info!("动漫《{}》ani_id = {}标记为 取消collected", ani_title, ani_id);
    // 4. 返回统一的 JSON 字符串
    Ok(json!({
        "status":  "ok",
        "message": "cancel success"
    }).to_string())
}

/// 更新动漫关注状态为已观看
#[tauri::command]
pub async fn update_collected_ani_item(app: AppHandle, ani_id: i64, ani_title: String) -> Result<String, String> {
    // 1. 打开数据库
    let db_path = get_or_set_db_path(get_app_data_dir(&app))
        .map_err(|e| e.to_string())?;
    let pool: Pool<Sqlite> = creat_database_connection_pool(db_path)
        .await
        .map_err(|e| e.to_string())?;
    // 开启事务
    let mut tx = pool.begin().await.map_err(|e| e.to_string())?;
    // 更新ani_collect表中的记录
    sqlx::query(r#" UPDATE ani_collect
                        SET is_watched = 1
                        WHERE ani_item_id = ?
                        "#)
        .bind(&ani_id)
        .execute(&mut *tx) // ⭐️ 显式解引用
        .await
        .map_err(|e| format!("删除失败: {}", e))?;
    // 提交事务
    tx.commit().await.map_err(|e| e.to_string())?;

    info!("动漫《{}》ani_id = {}标记为已观看", ani_title, ani_id);
    // 4. 返回统一的 JSON 字符串
    Ok(json!({
        "status":  "ok",
        "message": "cancel success"
    }).to_string())
}