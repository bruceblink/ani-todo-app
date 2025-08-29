use crate::utils::date_utils::format_timestamp_millis;
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
    pub update_time: i64,
    pub platform: String,
}

pub type AniIResult = HashMap<String, Vec<AniDto>>;

#[derive(Debug, Clone, FromRow, PartialEq, Deserialize, Serialize)]
pub struct AniCollect {
    pub id: i64,
    pub user_id: String,
    pub ani_item_id: i64,
    pub ani_title: String,
    pub collect_time: i64,
    pub is_watched: bool,
}

#[derive(Debug, Clone, FromRow, PartialEq, Deserialize, Serialize)]
pub struct AniWatchHistory {
    pub id: i64,
    pub user_id: String,
    pub ani_item_id: i64,
    pub watched_time: i64,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct AniDto {
    pub id: i64,
    pub title: String,
    pub update_count: String,
    pub update_info: String,
    pub image_url: String,
    pub detail_url: String,
    pub update_time: i64,
    pub update_time_str: String, // 👈 额外加字段
    pub platform: String,
}

impl From<Ani> for AniDto {
    fn from(a: Ani) -> Self {
        Self {
            id: a.id,
            title: a.title,
            update_count: a.update_count,
            update_info: a.update_info,
            image_url: a.image_url,
            detail_url: a.detail_url,
            update_time: a.update_time,
            update_time_str: format_timestamp_millis(a.update_time), // 👈 格式化后的字符串
            platform: a.platform,
        }
    }
}

#[derive(Debug, Clone, FromRow, PartialEq, Deserialize, Serialize)]
pub struct AniColl {
    pub user_id: String,
    pub ani_item_id: i64,
    pub ani_title: String,
    pub collect_time: String,
    pub is_watched: bool,
}

#[derive(Debug, Clone, FromRow, PartialEq, Deserialize, Serialize)]
pub struct AniWatch {
    pub user_id: String,
    pub ani_item_id: i64,
    pub watched_time: i64,
}

#[derive(Serialize, Debug, Clone, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct AniHistoryInfo {
    id: i64,
    title: String,
    update_count: String,
    update_info: String,
    image_url: String,
    detail_url: String,
    is_watched: bool,
    user_id: String,
    update_time: i64,
    watched_time: Option<i64>,
    platform: String,
    pub total_count: i64,
}
