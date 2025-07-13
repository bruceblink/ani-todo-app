pub mod bilibili;

use serde::{Deserialize, Serialize};
pub use bilibili::{fetch_bilibili_image, fetch_bilibili_ani_data};

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