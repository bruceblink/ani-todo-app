use crate::command::ApiResponse;
use crate::platforms::{AniItem, AniItemResult};
use crate::utils::date_utils::{get_today_slash, get_today_weekday};
use crate::utils::extract_number;
use crate::utils::http_client::http_client;
use anyhow::{anyhow, Context, Result};
use base64::{engine::general_purpose, Engine as _};
use log::{debug, info};
use reqwest::header;
use scraper::{Html, Selector};
use serde_json::Value;
use std::collections::HashMap;
use url::Url;

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
    Ok(format!("data:{content_type};base64,{b64}"))
}

#[tauri::command]
pub async fn fetch_youku_image(url: String) -> Result<String, String> {
    fetch_image_base64(&url, "https://www.youku.com/")
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn fetch_youku_ani_data(url: String) -> Result<ApiResponse<AniItemResult>, String> {
    // 1. 获取 HTTP 客户端
    let client = client().map_err(|e| e.to_string())?;
    // 2. 请求页面并读取 HTML
    let html = client
        .get(&url)
        .header(reqwest::header::REFERER, "https://www.youku.com/")
        .send()
        .await
        .map_err(|e| e.to_string())?
        .text()
        .await
        .map_err(|e| e.to_string())?;
    debug!("Youku HTML 前200字符: {}", &html[..html.len().min(200)]);

    // 3. 提取初始数据
    let data = match extract_initial_data(&html) {
        Ok(d) => d,
        Err(e) => {
            // 业务层面解析失败，返回 ApiResponse::err
            return Ok(ApiResponse::err(format!("解析初始数据失败：{e}")));
        }
    };

    // 4. 获取模块列表
    let modules = match data.get("moduleList").and_then(Value::as_array) {
        Some(arr) => arr,
        None => {
            // 没有找到模块，返回空结果
            let empty: AniItemResult = AniItemResult::new();
            return Ok(ApiResponse::ok(empty));
        }
    };

    // 5. 解析模块列表为 AniItem 列表
    let comics = match process_module_list(modules) {
        Ok(list) => list,
        Err(e) => {
            // 业务层面处理失败，同样返回 ApiResponse::err
            return Ok(ApiResponse::err(format!("处理模块列表失败：{e}")));
        }
    };

    info!("提取到 {} 部今日更新动漫", comics.len());

    // 6. 构造并返回成功结果
    let mut result = AniItemResult::new();
    result.insert(get_today_weekday().name_cn.to_string(), comics);
    Ok(ApiResponse::ok(result))
}

/// 提取 Initial Data
fn extract_initial_data(html: &str) -> Result<Value> {
    let doc = Html::parse_document(html);
    // 不能使用 context，因为 SelectorErrorKind 不满足 StdError
    let script_sel =
        Selector::parse("script").map_err(|e| anyhow!("解析 <script> 选择器失败: {}", e))?;

    let content = doc
        .select(&script_sel)
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

    let weekday = get_today_weekday().num_from_mon as usize;

    for comp in modules
        .iter()
        .filter_map(|m| m.get("components").and_then(Value::as_array))
        .flat_map(|arr| arr.iter())
        .filter(|comp| comp.get("title").and_then(Value::as_str) == Some("每日更新"))
    {
        let items = match comp.get("itemList").and_then(Value::as_array) {
            Some(v) => v,
            None => continue,
        };

        let today_items = match items.get(weekday).and_then(Value::as_array) {
            Some(v) => v,
            None => continue,
        };

        for item in today_items {
            let ani = build_aniitem(item);

            if seen.insert(ani.title.clone(), ()).is_none() {
                info!("识别到更新: {} {}", ani.title, ani.update_info);
                found.push(ani);
            }
        }
    }

    Ok(found)
}

/// 构建 AniItem
fn build_aniitem(map: &Value) -> AniItem {
    let title = map
        .get("title")
        .and_then(Value::as_str)
        .unwrap_or_default()
        .trim()
        .to_string();
    let update_info = map
        .get("lbTexts")
        .map(|v| match v {
            Value::String(s) => s.trim().to_string(),
            Value::Array(arr) => arr
                .iter()
                .filter_map(Value::as_str)
                .map(str::trim)
                .collect::<Vec<_>>()
                .join(" "),
            _ => String::new(),
        })
        .unwrap_or_default();

    let update_count = map
        .get("updateCount")
        .and_then(|v| {
            v.as_str()
                .and_then(|s| s.parse::<u32>().ok())
                .or_else(|| v.as_u64().map(|n| n as u32))
        })
        .map(|n| n.to_string())
        .unwrap_or_else(|| extract_number(&update_info).unwrap_or(1).to_string());

    AniItem {
        platform: "youku".into(),
        title,
        update_count,
        update_info,
        image_url: map
            .get("img")
            .and_then(Value::as_str)
            .unwrap_or_default()
            .trim()
            .to_string(),
        detail_url: get_youku_video_url(Option::from(map)),
        update_time: get_today_slash(),
    }
}

pub fn get_youku_video_url(item: Option<&Value>) -> String {
    let default_url = "https://www.youku.com/ku/webcomic".to_string();

    let item = match item {
        Some(v) => v,
        None => return default_url,
    };

    let action_value = match item.get("action_value").and_then(Value::as_str) {
        Some(v) => v,
        None => return default_url,
    };

    let mut url = match Url::parse("https://v.youku.com/video") {
        Ok(u) => u,
        Err(_) => return default_url,
    };

    {
        let mut query = url.query_pairs_mut();
        query.append_pair("s", action_value);

        if let Some(scm) = item.get("scm").and_then(Value::as_str) {
            query.append_pair("scm", scm);
        }

        if let Some(scg_id) = item.get("scg_id").and_then(Value::as_str) {
            query.append_pair("scg_id", scg_id);
        }
    }

    url.to_string()
}
