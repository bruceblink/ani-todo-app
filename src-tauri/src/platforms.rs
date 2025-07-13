pub mod bilibili;
pub mod iqiyi;

use std::collections::HashMap;
use serde::{Deserialize, Serialize};
pub use bilibili::{fetch_bilibili_image, fetch_bilibili_ani_data};

/// 定义结果类型：星期字符串 -> 番剧更新列表
pub type AniResult = HashMap<String, Vec<AniItem>>;

#[derive(Debug, Deserialize, Serialize)]
pub struct AniItem {
    pub title: String,
    pub update_count: String,
    pub update_info: String,
    pub image_url: String,
    pub detail_url: String,
    pub update_time: String,
    pub platform: String,
}