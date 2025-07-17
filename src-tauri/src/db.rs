use log::info;
use serde_json::json;
use sqlx::{Arguments, Pool, Sqlite};

pub mod sqlite;

use crate::db::sqlite::{creat_database_connection_pool, get_app_data_dir, get_or_set_db_path};
use crate::platforms::AniResult;
use crate::utils::date_utils::get_week_day_of_today;
use tauri::AppHandle;

#[tauri::command]
pub async fn save_ani_item_data(app: AppHandle, ani_data: &str) -> Result<String, String> {
    let db_path = get_or_set_db_path(get_app_data_dir(&app)).map_err(|e| e.to_string())?;
    let pool: Pool<Sqlite> = creat_database_connection_pool(db_path)
        .await
        .map_err(|e| e.to_string())?;

    let ani_map: AniResult = serde_json::from_str(ani_data).map_err(|e| e.to_string())?;
    let ani_items = ani_map
        .get(&get_week_day_of_today())
        .ok_or("获取今日动漫数据失败")?;

    if ani_items.is_empty() {
        return Ok(json!({
            "status": "ok",
            "message": "没有可插入的数据"
        }).to_string());
    }

    for item in ani_items {
        sqlx::query(r#"
            INSERT INTO ani_items (
                title,
                update_count,
                update_info,
                image_url,
                detail_url,
                update_time,
                platform
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(title, platform) DO UPDATE SET
                update_count = excluded.update_count,
                update_info = excluded.update_info,
                image_url = excluded.image_url,
                detail_url = excluded.detail_url,
                update_time = excluded.update_time;
        "#)
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
        }).to_string())
}


#[tauri::command]
pub async fn remove_ani_item_data(app: AppHandle, ani_id: &str) -> Result<String, String> {
    let db_path = get_or_set_db_path(get_app_data_dir(&app)).map_err(|e| e.to_string())?;
    let pool: Pool<Sqlite> = creat_database_connection_pool(db_path)
        .await
        .map_err(|e| e.to_string())?;
    
    if let Some((title, platform)) = ani_id.split_once("---") {
        sqlx::query("UPDATE ani_items SET watched = ? WHERE title = ? AND platform = ?")
            .bind(1u8)
            .bind(title)
            .bind(platform)
            .execute(&pool)
            .await.expect("更新失败");
        info!("已经删除 title: {}, platform: {}", title, platform);
    } else {
        info!("ani_id: {} 的格式错误", ani_id);
        
    }
    
    Ok(json!({
            "status": "ok",
            "message": "remove success"
        }).to_string())
}