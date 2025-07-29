use anyhow::Result;
use sqlx::{
    query::QueryAs,
    sqlite::{SqliteArguments, SqliteRow},
    FromRow, Sqlite, SqlitePool,
};

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

use std::sync::Arc;

pub struct AppState {
    pub db: Arc<SqlitePool>,
}
