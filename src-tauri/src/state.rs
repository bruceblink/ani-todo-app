use sqlx::SqlitePool;
use std::sync::Arc;

/// tauri 的全局App状态
pub struct AppState {
    pub db: Arc<SqlitePool>,
}
