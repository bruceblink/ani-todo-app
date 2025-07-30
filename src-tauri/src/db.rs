use sqlx::SqlitePool;

pub mod sqlite;
pub mod po;
pub mod common;

use crate::db::po::Ani;

pub fn ge_db_pool(pool: &SqlitePool) -> &SqlitePool { pool }