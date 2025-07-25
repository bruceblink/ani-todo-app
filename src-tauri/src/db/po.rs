use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use std::collections::HashMap;

#[derive(Debug, Clone, FromRow, Deserialize, Serialize)]
pub struct Ani {
    pub id: i64,
    pub title: String,
    pub update_count: String,
    pub update_info: String,
    pub image_url: String,
    pub detail_url: String,
    pub update_time: String,
    pub platform: String,
}

pub type AniIResult = HashMap<String, Vec<Ani>>;

#[derive(Debug, Clone, FromRow, PartialEq, Deserialize, Serialize)]
pub struct AniCollect {
    pub id: i64,
    pub user_id: String,
    pub ani_item_id: i64,
    pub ani_title: String,
    pub collect_time: String,
    pub is_watched: bool,
}

#[derive(Debug, Clone, FromRow, PartialEq, Deserialize, Serialize)]
pub struct AniWatchHistory {
    pub id: i64,
    pub user_id: String,
    pub ani_item_id: i64,
    pub watched_time: String,
}