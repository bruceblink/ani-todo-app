use crate::types::{AniItem, AniItemResult, ApiResponse};
use crate::utils::date_utils::{get_today_slash, get_today_weekday};
use crate::utils::{clean_text, extract_number};
use base64::{engine::general_purpose, Engine as _};
use log::{error, info};
use serde_json::Value;
use std::collections::HashMap;

#[tauri::command]
pub async fn fetch_bilibili_image(url: String) -> Result<String, String> {
    // 新建异步 Reqwest 客户端
    let client = reqwest::Client::new();
    let resp = client
        .get(&url)
        .header("Referer", "https://www.bilibili.com/")
        .send()
        .await
        .map_err(|e| e.to_string())?;

    // 先把 Content-Type 拷贝到一个拥有 String
    let ct: String = resp
        .headers()
        .get(reqwest::header::CONTENT_TYPE)
        .and_then(|v| v.to_str().ok())
        .map(|s| s.to_string())
        .unwrap_or_else(|| "image/jpeg".to_string());

    // 这时 resp 不再被借用，可以放心移动
    let bytes = resp.bytes().await.map_err(|e| e.to_string())?;

    // 转 base64，并拼成 Data URL
    let b64 = general_purpose::STANDARD.encode(&bytes);
    Ok(format!("data:{ct};base64,{b64}"))
}

#[tauri::command]
pub async fn fetch_bilibili_ani_data(url: String) -> Result<ApiResponse<AniItemResult>, String> {
    let client = reqwest::Client::new();
    let response = client
        .get(&url)
        .header("Referer", "https://www.bilibili.com/")
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let json_value: Value = response.json().await.map_err(|e| e.to_string())?;

    let result: AniItemResult = process_json_value(&json_value);
    Ok(ApiResponse::ok(result))
}

/// 解析原始 JSON，往 `result` 中填充当天已发布的番剧更新
fn process_json_value(json_value: &Value) -> AniItemResult {
    // 1. 验证响应状态和数据结构
    let code = json_value.get("code").and_then(Value::as_i64).unwrap_or(-1);
    if code != 0 || !json_value.get("result").is_some_and(Value::is_array) {
        error!("接口返回数据异常：{json_value}");
        return HashMap::new();
    }
    info!("成功获取哔哩哔哩追番表数据");

    // 2. 获取结果数组
    let days = match json_value["result"].as_array() {
        Some(arr) => arr,
        None => {
            error!("result 字段不是数组: {json_value}");
            return HashMap::new();
        }
    };

    // 3. 找到今天的数据 (is_today == 1)
    let today = match days
        .iter()
        .find(|day| day.get("is_today").and_then(Value::as_i64) == Some(1))
    {
        Some(day) => day,
        None => {
            info!("今日没有更新");
            // 即使没有更新，也返回包含空列表的结果
            return create_empty_result();
        }
    };

    // 4. 处理剧集数据
    let weekday = get_today_weekday().name_cn.to_string();
    let mut comics: Vec<AniItem> = Vec::new();

    if let Some(eps) = today.get("episodes").and_then(Value::as_array) {
        for ep in eps
            .iter()
            .filter(|e| e.get("published").and_then(Value::as_i64) == Some(1))
        {
            let item = parse_item(ep);
            info!("识别到更新：{} {}", item.title, item.update_info);
            comics.push(item);
        }
    }

    info!("成功提取到 {} 部今日更新的动漫", comics.len());

    // 5. 构建结果
    let mut result = HashMap::new();
    result.insert(weekday, comics);
    result
}

// 辅助函数：创建空结果
fn create_empty_result() -> AniItemResult {
    let weekday = get_today_weekday().name_cn.to_string();
    let mut result = HashMap::new();
    result.insert(weekday, Vec::new());
    result
}
/// 根据单个 episode JSON 构建 AniItem
fn parse_item(ep: &Value) -> AniItem {
    // pub_index
    let pub_index = ep
        .get("pub_index")
        .and_then(Value::as_str)
        .unwrap_or("")
        .trim();

    // update_count
    let count = extract_number(pub_index)
        .map(|n| n.to_string())
        .unwrap_or_default();

    // update_info
    let update_info = format!("更新至{pub_index}");

    // image_url: 优先 square_cover，否则 cover
    let image_url = ep
        .get("square_cover")
        .and_then(Value::as_str)
        .or_else(|| ep.get("cover").and_then(Value::as_str))
        .unwrap_or_default()
        .to_string();

    // detail_url
    let episode_id = ep
        .get("episode_id")
        .and_then(Value::as_i64)
        .unwrap_or_default();
    let detail_url = format!("https://www.bilibili.com/bangumi/play/ep{episode_id}");

    // title 清理
    let raw_title = ep.get("title").and_then(Value::as_str).unwrap_or("");
    let title = clean_text(raw_title);

    // 构建 AniItem
    AniItem {
        platform: "bilibili".to_string(),
        title,
        update_count: count,
        update_info,
        image_url,
        detail_url,
        update_time: get_today_slash(),
    }
}
