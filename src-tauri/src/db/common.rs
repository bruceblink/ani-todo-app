use anyhow::Result;
use sqlx::{
    query::QueryAs,
    sqlite::{SqliteArguments, SqliteRow},
    FromRow, Sqlite, SqlitePool,
};
use std::sync::Arc;
use serde_json::json;
use crate::command::ApiResponse;
use crate::db::ge_db_pool;
use crate::db::sqlite::upsert_ani_info;
use crate::platforms::AniItemResult;
use crate::utils::date_utils::get_today_weekday;

/// 通用查询：接收一个已经 bind 好参数的 `QueryAs`，执行并返回 Vec<T>
pub async fn run_query<'q, T>(
    pool: &SqlitePool,                                       // 要求 T 能从 SqliteRow 构造
    query: QueryAs<'q, Sqlite, T, SqliteArguments<'q>> ) -> Result<Vec<T>> where
        for<'r> T: FromRow<'r, SqliteRow> + Send + Unpin {
    let rows = query
        .fetch_all(pool)
        .await
        .map_err(|e| {
            anyhow::anyhow!(
            "query error: {:?}" ,e)
        })?;
    Ok(rows)
}

// 内部通用函数：接受 Arc<SqlitePool>，可被后台任务/命令/测试调用
pub async fn save_ani_item_data_db(
    db: Arc<SqlitePool>,
    ani_data: AniItemResult,
) -> Result<ApiResponse, String> {
    let pool = ge_db_pool(&db);
    let weekday = get_today_weekday().name_cn.to_string();

    let items = match ani_data.get(&weekday) {
        Some(v) if !v.is_empty() => v,
        Some(_) => return Ok(ApiResponse::ok(json!({ "message": "没有可插入的数据" }))),
        None => return Ok(ApiResponse::err("获取今日动漫数据失败")),
    };

    for item in items {
        if let Err(e) = upsert_ani_info(&pool, item).await {
            return Ok(ApiResponse::err(format!("插入失败：{}", e)));
        }
    }

    Ok(ApiResponse::ok(json!({ "message": "save success" })))
}