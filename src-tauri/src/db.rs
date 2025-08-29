use sqlx::SqlitePool;

pub mod common;
pub mod po;
pub mod sqlite;

use crate::db::po::Ani;

pub fn ge_db_pool(pool: &SqlitePool) -> &SqlitePool {
    pool
}
