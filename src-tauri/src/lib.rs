use serde::{Deserialize, Serialize};

pub mod startup;
pub mod utils;
pub mod platforms;

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