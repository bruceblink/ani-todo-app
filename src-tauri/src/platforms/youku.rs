use crate::platforms::{AniItem, AniItemResult};
use crate::utils::date_utils::{get_today_weekday, get_today_slash};
use crate::utils::extract_number;
use crate::utils::http_client::http_client;
use anyhow::{anyhow, Context, Result};
use base64::{engine::general_purpose, Engine as _};
use log::{debug, info};
use reqwest::header;
use scraper::{Html, Selector};
use serde_json::Value;
use std::collections::HashMap;

/// 全局 HTTP 客户端复用
fn client() -> Result<reqwest::Client> {
    http_client().map_err(|e| anyhow!("创建 HTTP 客户端失败: {}", e))
}

/// 获取图片并转为 Base64 Data URL
async fn fetch_image_base64(url: &str, referer: &str) -> Result<String> {
    let resp = client()?
        .get(url)
        .header(header::REFERER, referer)
        .send()
        .await
        .context("请求图片失败")?;

    let headers = resp.headers().clone();
    let bytes = resp.bytes().await.context("读取图片字节失败")?;
    let content_type = headers
        .get(header::CONTENT_TYPE)
        .and_then(|v| v.to_str().ok())
        .unwrap_or("application/octet-stream");

    let b64 = general_purpose::STANDARD.encode(&bytes);
    Ok(format!("data:{};base64,{}", content_type, b64))
}

#[tauri::command]
pub async fn fetch_youku_image(url: String) -> Result<String, String> {
    fetch_image_base64(&url, "https://www.youku.com/")
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn fetch_youku_ani_data(url: String) -> Result<AniItemResult, String> {
    let client = client().map_err(|e| e.to_string())?;
    let html = client
        .get(&url)
        .header(header::REFERER, "https://www.youku.com/")
        .send()
        .await
        .map_err(|e| e.to_string())?
        .text()
        .await
        .map_err(|e| e.to_string())?;

    debug!("HTML 前200字符: {}", &html[..html.len().min(200)]);
    let data = extract_initial_data(&html).map_err(|e| e.to_string())?;

    let modules = data
        .get("moduleList")
        .and_then(Value::as_array)
        .ok_or_else(|| "缺少 moduleList 数组".to_string())?;

    let comics = process_module_list(modules).map_err(|e| e.to_string())?;
    info!("提取到 {} 部今日更新动漫", comics.len());

    let mut result = AniItemResult::new();
    result.insert(get_today_weekday().name_cn.to_string(), comics);
    Ok(result)
}

/// 提取 Initial Data
fn extract_initial_data(html: &str) -> Result<Value> {
    let doc = Html::parse_document(html);
    // 不能使用 context，因为 SelectorErrorKind 不满足 StdError
    let script_sel = Selector::parse("script")
        .map_err(|e| anyhow!("解析 <script> 选择器失败: {}", e))?;

    let content = doc.select(&script_sel)
        .filter_map(|s| s.text().next())
        .find(|t| t.contains("__INITIAL_DATA__"))
        .context("未找到 __INITIAL_DATA__ 脚本块")?;

    let json_part = content
        .split_once("window.__INITIAL_DATA__ =")
        .and_then(|(_, rest)| rest.strip_suffix(';'))
        .context("提取 JSON 部分失败")?;

    let fixed = json_part.replace("undefined", "null");
    let value: Value = serde_json::from_str(&fixed).context("解析 JSON 失败")?;
    Ok(value)
}

/// 处理模块列表，提取 "每日更新" 项
fn process_module_list(modules: &[Value]) -> Result<Vec<AniItem>> {
    let mut found = Vec::new();
    let mut seen = HashMap::new();

    for comp in modules.iter()
        .filter_map(|m| m.get("components").and_then(Value::as_array))
        .flat_map(|arr| arr.iter())
        .filter(|comp| comp.get("title").and_then(Value::as_str) == Some("每日更新"))
    {
        if let Some(items) = comp.get("itemList").and_then(Value::as_array) {
            for item in items.iter().flat_map(|v| {
                if let Value::Array(arr) = v {
                    arr.iter().collect::<Vec<_>>()
                } else {
                    vec![v]
                }
            }) {
                if item.get("updateTips").and_then(Value::as_str) == Some("有更新") {
                    if let Some(map) = item.as_object() {
                        let ani = build_aniitem(map);
                        if seen.insert(ani.title.clone(), ()).is_none() {
                            info!("识别到更新: {} {}", ani.title, ani.update_info);
                            found.push(ani);
                        }
                    }
                }
            }
        }
    }

    Ok(found)
}

/// 构建 AniItem
fn build_aniitem(map: &serde_json::Map<String, Value>) -> AniItem {
    let title = map.get("title").and_then(Value::as_str).unwrap_or_default().trim().to_string();
    let update_info = map.get("lbTexts").map(|v| match v {
        Value::String(s) => s.trim().to_string(),
        Value::Array(arr) => arr
            .iter()
            .filter_map(Value::as_str)
            .map(str::trim)
            .collect::<Vec<_>>()
            .join(" "),
        _ => String::new(),
    }).unwrap_or_default();

    let update_count = map.get("updateCount").and_then(|v| v.as_str().and_then(|s| s.parse::<u32>().ok())
        .or_else(|| v.as_u64().map(|n| n as u32)))
        .map(|n| n.to_string())
        .unwrap_or_else(|| extract_number(&update_info).unwrap_or(1).to_string());

    AniItem {
        platform: "youku".into(),
        title,
        update_count,
        update_info,
        image_url: map.get("img").and_then(Value::as_str).unwrap_or_default().trim().to_string(),
        detail_url: "https://www.youku.com/ku/webcomic".into(),
        update_time: get_today_slash(),
    }
}
