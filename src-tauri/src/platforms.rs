pub mod agedm;
pub mod bilibili;
pub mod iqiyi;
pub mod mikanani;
pub mod tencent;
pub mod youku;

pub use bilibili::{fetch_bilibili_ani_data, fetch_bilibili_image};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use std::collections::HashMap;

/// 定义结果类型：星期字符串 -> 番剧更新列表
pub type AniItemResult = HashMap<String, Vec<AniItem>>;

#[derive(Debug, Clone, FromRow, Deserialize, Serialize)]
pub struct AniItem {
    pub title: String,
    pub update_count: String,
    pub update_info: String,
    pub image_url: String,
    pub detail_url: String,
    pub update_time: String,
    pub platform: String,
}
