use std::collections::HashMap;
use log::debug;
use serde_json::json;
use tauri::State;
use crate::db::common::AppState;
use crate::db::ge_db_pool;
use crate::db::po::{Ani, AniColl, AniDto, AniIResult, AniWatch, AniWatchHistory};
use crate::db::sqlite::{delete_ani_collect, list_all_ani_update_today, list_all_follow_ani_update_today, upsert_ani_collect, upsert_ani_info, upsert_ani_watch_history};
use crate::platforms::AniItemResult;
use crate::utils::date_utils::{get_today_slash, get_today_weekday, parse_date_to_millis};

/// 保存动漫数据到数据库
#[tauri::command]
pub async fn save_ani_item_data(state: State<'_, AppState>, ani_data: AniItemResult) -> Result<String, String> {
    // 拿到连接池
    let pool = ge_db_pool(&state.db);
    let week_day_of_today = get_today_weekday().name_cn.to_string();
    let ani_items = ani_data.get(&week_day_of_today).ok_or("获取今日动漫数据失败")?;

    if ani_items.is_empty() {
        return Ok(json!({
            "status": "ok",
            "message": "没有可插入的数据"
        })
            .to_string());
    }
    // 批量插入数据库
    for item in ani_items {
        upsert_ani_info(&pool, &item).await.map_err(|e| format!("{}", e))?;
    }
    debug!("所有今天更新的动漫：{:?} 已经更新到数据库", ani_items);
    Ok(json!({
        "status": "ok",
        "message": "save success"
    })
        .to_string())
}


/// 插入动漫观看历史数据到数据库
#[tauri::command]
pub async fn watch_ani_item(state: State<'_, AppState>, ani_id: i64) -> Result<String, String> {
    // 1. 打开数据库
    let pool = ge_db_pool(&state.db);
    let today_date = get_today_slash();
    let ani_watch = AniWatch{
        user_id: "".to_string(), // 用户ID，暂时留空
        ani_item_id: ani_id,
        watched_time: today_date,
    };
    upsert_ani_watch_history(&pool, &ani_watch).await.map_err(|e| format!("{}", e))?;
    debug!("动漫: id = {} 已经更新到数据库", ani_id);
    // 4. 返回统一的 JSON 字符串
    Ok(json!({
        "status":  "ok",
        "message": "remove success"
    }).to_string())
}


/// 查询今天更新的动漫列表
#[tauri::command]
pub async fn query_today_update_ani_list(state: State<'_, AppState>) -> Result<AniIResult, String> {
    let pool = ge_db_pool(&state.db);
    // 今天的日期，比如 "2025/07/13"
    let today_date = get_today_slash();
    let today_ts = parse_date_to_millis(&today_date, true)
        .map_err(|e| format!("时间解析失败: {}", e))?;
    // 查询当前更新的动漫
    let ani_items = list_all_ani_update_today(pool, today_ts)
        .await
        .map_err(|e| format!("{}", e))?;
    let ani_dtos: Vec<AniDto> = ani_items.into_iter().map(AniDto::from).collect();
    let weekday = get_today_weekday().name_cn.to_string();
    let mut result: AniIResult = HashMap::new();
    result.insert(weekday, ani_dtos.clone());
    debug!("获取所有今天更新的动漫：{:?}", ani_dtos);
    Ok(result)
}


/// 查询今天已经观看的动漫列表
#[tauri::command]
pub async fn query_watched_ani_item_list(state: State<'_, AppState>) -> Result<Vec<AniWatchHistory>, String> {
    let pool = ge_db_pool(&state.db);
    // 今天的日期，比如 "2025/07/13"
    let today_date = get_today_slash();
    let today_ts = parse_date_to_millis(&today_date, true)
        .map_err(|e| format!("时间解析失败: {}", e))?;
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
        .bind(today_ts)
        .bind("") // 用户ID，暂时留空
        .fetch_all(pool)
        .await
        .map_err(|e| format!("查询错误: {}", e))?;
    debug!("获取所有今天已经观看过的动漫：{:?}", ani_items);
    Ok(ani_items)
}

/// 获取关注动漫今日更新列表
#[tauri::command]
pub async fn query_favorite_ani_update_list(state: State<'_, AppState> ) -> Result<Vec<Ani>, String> {
    // 1. 打开数据库
    let pool = ge_db_pool(&state.db);
    // 2. 获取今天的日期，比如 "2025/07/13"
    let today_date = get_today_slash();
    let today_ts = parse_date_to_millis(&today_date, true)
        .map_err(|e| format!("时间解析失败: {}", e))?;
    let ani_collectors = list_all_follow_ani_update_today(pool, today_ts)
        .await
        .map_err(|e| format!("查询错误: {}", e))?;
    debug!("获取所有关注的动漫：{:?}", ani_collectors);
    Ok(ani_collectors)
}


/// 关注动漫
#[tauri::command]
pub async fn collect_ani_item(state: State<'_, AppState>, ani_id: i64, ani_title: String) -> Result<String, String> {
    // 1. 打开数据库
    let pool = ge_db_pool(&state.db);
    let today_date = get_today_slash();
    let ani_collect = AniColl {
        user_id: "".to_string(), // 用户ID，暂时留空
        ani_item_id: ani_id,
        ani_title: ani_title.clone(),
        collect_time: today_date,
        is_watched: false, // 默认未观看
    };
    // 2. 插入或更新ani_collect表中的记录
    upsert_ani_collect(pool, &ani_collect)
        .await
        .map_err(|e| format!("插入或更新失败: {}", e))?;

    debug!("动漫《{}》标记为collected", ani_title);
    // 4. 返回统一的 JSON 字符串
    Ok(json!({
        "status":  "ok",
        "message": "collect success"
    }).to_string())
}

/// 取消关注动漫
#[tauri::command]
pub async fn cancel_collect_ani_item(state: State<'_, AppState>, ani_id: i64, ani_title: String) -> Result<String, String> {
    // 1. 打开数据库
    let pool = ge_db_pool(&state.db);
    // 删除ani_collect表中的记录
    delete_ani_collect(pool, ani_id, ani_title.clone())
        .await
        .map_err(|e| format!("删除失败: {}", e))?;

    debug!("动漫《{}》ani_id = {}标记为 取消collected", ani_title, ani_id);
    // 4. 返回统一的 JSON 字符串
    Ok(json!({
        "status":  "ok",
        "message": "cancel success"
    }).to_string())
}