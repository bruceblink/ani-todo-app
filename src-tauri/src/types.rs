use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use std::collections::HashMap;

#[derive(Serialize, Debug, Clone)]
pub struct ApiResponse<T = serde_json::Value> {
    pub status: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub message: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub data: Option<T>,
}

impl<T> ApiResponse<T> {
    pub fn ok(data: T) -> Self {
        Self {
            status: "ok".into(),
            message: None,
            data: Some(data),
        }
    }

    pub fn err<E: ToString>(msg: E) -> Self {
        Self {
            status: "error".into(),
            message: Some(msg.to_string()),
            data: None,
        }
    }
}

/// 分页数据结构
#[derive(Serialize, Debug)]
pub struct PageData<T> {
    pub items: Vec<T>,  // 当前页的数据
    pub total: usize,   // 总条数
    pub page: i64,      // 当前页码（1开始）
    pub page_size: i64, // 每页数量
}

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
