pub mod service;

use serde::Serialize;

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
