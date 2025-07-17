use sqlx::{Arguments, Pool, Sqlite};
use sqlx::sqlite::SqliteArguments;

pub mod sqlite;

use crate::db::sqlite::{creat_database_connection_pool, get_app_data_dir, get_or_set_db_path};
use crate::platforms::{AniItem, AniResult};
use crate::utils::date_utils::get_week_day_of_today;
use tauri::AppHandle;

#[tauri::command]
pub async fn save_update_ani_item_data(app: AppHandle, ani_data: &str) -> Result<String, String> {
    let db_path = get_or_set_db_path(get_app_data_dir(&app)).map_err(|e| e.to_string())?;
    let pool: Pool<Sqlite> = creat_database_connection_pool(db_path)
        .await
        .map_err(|e| e.to_string())?;

    let ani_map: AniResult = serde_json::from_str(ani_data).map_err(|e| e.to_string())?;
    let ani_items: &Vec<AniItem> = ani_map
        .get(&get_week_day_of_today())
        .ok_or("获取今日动漫数据失败")?;

    if ani_items.is_empty() {
        return Ok("没有可插入的数据".to_string());
    }

    let mut sql = String::from("INSERT INTO ani_items (
        title, update_count, update_info, image_url, detail_url, update_time, platform
    ) VALUES ");

    let mut args = SqliteArguments::default();

    for (i, ani_item) in ani_items.iter().enumerate() {
        if i > 0 {
            sql.push_str(", ");
        }
        sql.push_str("(?, ?, ?, ?, ?, ?, ?)");

        args.add(&ani_item.title).expect("获取title失败");
        args.add(&ani_item.update_count).expect("获取update_count失败");
        args.add(&ani_item.update_info).expect("获取update_info失败");
        args.add(&ani_item.image_url).expect("获取image_url失败");
        args.add(&ani_item.detail_url).expect("获取detail_url失败");
        args.add(&ani_item.update_time).expect("获取update_time失败");
        args.add(&ani_item.platform).expect("获取platform失败");
    }

    sqlx::query_with(&sql, args)
        .execute(&pool)
        .await
        .map_err(|e| format!("插入数据失败: {}", e))?;

    Ok("save success".to_string())
}
