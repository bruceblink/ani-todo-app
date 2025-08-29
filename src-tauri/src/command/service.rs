use crate::command::{ApiResponse, PageData};
pub use crate::db::common::save_ani_item_data_db;
use crate::db::ge_db_pool;
use crate::db::po::{AniColl, AniDto, AniIResult, AniWatch};
use crate::db::sqlite::{
    delete_ani_collect, list_all_ani_history_data, list_all_ani_info_watched_today,
    list_all_ani_update_today, list_all_follow_ani_update_today, upsert_ani_collect,
    upsert_ani_watch_history,
};
use crate::platforms::AniItemResult;
use crate::utils::date_utils::{
    get_today_slash, get_today_weekday, get_unix_timestamp_millis_now, parse_date_to_millis,
};
use crate::AppState;
use log::debug;
use serde_json::json;
use std::collections::HashMap;
use std::sync::Arc;
use tauri::State;

/// 保存动漫数据到数据库
#[tauri::command]
pub async fn save_ani_item_data(
    state: State<'_, Arc<AppState>>,
    ani_data: AniItemResult,
) -> Result<ApiResponse, String> {
    // state.inner() -> &Arc<AppState>; state.db 是 Arc<SqlitePool>
    let db = state.db.clone();
    save_ani_item_data_db(db, ani_data).await
}

/// 插入动漫观看历史数据到数据库
#[tauri::command]
pub async fn watch_ani_item(
    state: State<'_, Arc<AppState>>,
    ani_id: i64,
) -> Result<ApiResponse, String> {
    let pool = ge_db_pool(&state.db);
    let record = AniWatch {
        user_id: "".to_string(),
        ani_item_id: ani_id,
        watched_time: get_unix_timestamp_millis_now(),
    };

    if let Err(e) = upsert_ani_watch_history(pool, &record).await {
        return Ok(ApiResponse::err(format!("写入观看记录失败：{e}")));
    }
    debug!("观看历史已写入：id={ani_id}");
    Ok(ApiResponse::ok(json!({ "message": "watch success" })))
}

/// 查询今天更新的动漫列表
#[tauri::command]
pub async fn query_today_update_ani_list(
    state: State<'_, Arc<AppState>>,
) -> Result<ApiResponse, String> {
    let pool = ge_db_pool(&state.db);

    // 1. 解析今日时间戳
    let today = get_today_slash();
    let ts = match parse_date_to_millis(&today, true) {
        Ok(v) => v,
        Err(e) => return Ok(ApiResponse::err(format!("时间解析失败：{e}"))),
    };

    // 2. 查询数据
    let raw = match list_all_ani_update_today(pool, ts).await {
        Ok(v) => v,
        Err(e) => return Ok(ApiResponse::err(format!("查询失败：{e}"))),
    };

    // 3. 转 DTO 并组织结果
    let dtos: Vec<AniDto> = raw.into_iter().map(AniDto::from).collect();
    let mut map: AniIResult = HashMap::new();
    let weekday = get_today_weekday().name_cn.to_string();
    map.insert(weekday.clone(), dtos.clone());

    debug!("今日更新动漫（{weekday}）：{dtos:?}");
    Ok(ApiResponse::ok(json!(map)))
}

/// 查询今天已经观看的动漫列表
#[tauri::command]
pub async fn query_watched_ani_item_list(
    state: State<'_, Arc<AppState>>,
) -> Result<ApiResponse, String> {
    let pool = ge_db_pool(&state.db);

    // 1. 解析今日时间戳
    let today = get_today_slash();
    let ts = match parse_date_to_millis(&today, true) {
        Ok(v) => v,
        Err(e) => return Ok(ApiResponse::err(format!("时间解析失败：{e}"))),
    };

    // 2. 查询数据
    let list = match list_all_ani_info_watched_today(pool, ts).await {
        Ok(v) => v,
        Err(e) => return Ok(ApiResponse::err(format!("查询失败：{e}"))),
    };

    debug!("今日观看历史：{list:?}");
    Ok(ApiResponse::ok(json!(list)))
}

/// 获取关注动漫今日更新列表
#[tauri::command]
pub async fn query_favorite_ani_update_list(
    state: State<'_, Arc<AppState>>,
) -> Result<ApiResponse, String> {
    let pool = ge_db_pool(&state.db);

    // 1. 解析今日时间戳
    let today = get_today_slash();
    let ts = match parse_date_to_millis(&today, true) {
        Ok(v) => v,
        Err(e) => return Ok(ApiResponse::err(format!("时间解析失败：{e}"))),
    };

    // 2. 查询数据
    let list = match list_all_follow_ani_update_today(pool, ts).await {
        Ok(v) => v,
        Err(e) => return Ok(ApiResponse::err(format!("查询失败：{e}"))),
    };

    debug!("关注动漫今日更新：{list:?}");
    Ok(ApiResponse::ok(json!(list)))
}

/// 关注动漫
#[tauri::command]
pub async fn collect_ani_item(
    state: State<'_, Arc<AppState>>,
    ani_id: i64,
    ani_title: String,
) -> Result<ApiResponse, String> {
    let pool = ge_db_pool(&state.db);
    let record = AniColl {
        user_id: "".to_string(),
        ani_item_id: ani_id,
        ani_title: ani_title.clone(),
        collect_time: get_today_slash(),
        is_watched: false,
    };

    if let Err(e) = upsert_ani_collect(pool, &record).await {
        return Ok(ApiResponse::err(format!("插入或更新失败：{e}")));
    }
    debug!("已收藏动漫：《{ani_title}》");
    Ok(ApiResponse::ok(json!({ "message": "collect success" })))
}

/// 取消关注动漫
#[tauri::command]
pub async fn cancel_collect_ani_item(
    state: State<'_, Arc<AppState>>,
    ani_id: i64,
    ani_title: String,
) -> Result<ApiResponse, String> {
    let pool = ge_db_pool(&state.db);
    if let Err(e) = delete_ani_collect(pool, ani_id, ani_title.clone()).await {
        return Ok(ApiResponse::err(format!("删除失败：{e}")));
    }

    debug!("已取消收藏：《{ani_title}》(id={ani_id})");
    Ok(ApiResponse::ok(json!({ "message": "cancel success" })))
}

/// 查询动漫历史更新信息列表
#[tauri::command]
pub async fn query_ani_history_list(
    state: State<'_, Arc<AppState>>,
    page: i64,
    page_size: i64,
) -> Result<ApiResponse, String> {
    let pool = ge_db_pool(&state.db);
    //查询数据
    let list = match list_all_ani_history_data(pool, page, page_size).await {
        Ok(v) => v,
        Err(e) => return Ok(ApiResponse::err(format!("查询失败：{e}"))),
    };
    if list.is_empty() {
        return Ok(ApiResponse::ok(json!({ "message": "没有历史更新数据" })));
    }
    let total_count: i64 = list[0].total_count;
    debug!("历史更新数据：{list:?}");
    // 3. 组织分页数据
    let data = PageData {
        items: list,
        total: total_count as usize,
        page,
        page_size,
    };
    Ok(ApiResponse::ok(json!(data)))
}
