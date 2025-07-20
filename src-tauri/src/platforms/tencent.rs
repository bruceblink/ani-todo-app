use crate::platforms::{AniItem, AniResult};
use crate::utils::date_utils::{get_week_day_of_today, today_iso_date_ld};
use crate::utils::extract_number;
use crate::utils::http_client::http_client;
use base64::engine::general_purpose;
use base64::Engine;
use log::{debug, info, warn};
use reqwest::Client;
use scraper::{Html, Selector};
use serde_json::Value;
use std::collections::HashMap;
use std::error::Error;

#[tauri::command]
pub async fn fetch_qq_image(url: String) -> Result<String, String> {
    // 新建异步 Reqwest 客户端
    let client = http_client()?;
    let resp = client
        .get(&url)
        .header("Referer", "https://v.qq.com/")
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
    Ok(format!("data:{};base64,{}", ct, b64))
}

/// 获取腾讯视频动漫频道今日更新数据
#[tauri::command]
pub async fn fetch_qq_ani_data(url: String) -> Result<String, String> {
    let client = Client::new();
    let resp = client
        .get(&url)
        .header("Referer", "https://v.qq.com/")
        .send()
        .await
        .map_err(|e| e.to_string())?;
    let text = resp.text().await.map_err(|e| e.to_string())?;
    debug!(
        "解析从 腾讯视频 获取到的 HTML，前 200 字符：\n{}",
        &text[..200.min(text.len())]
    );
    // 1. 从 HTML 中提取嵌入的 JSON 数据
    let data: Value = extract_vikor_json(text).map_err(|e| e.to_string())?;
    let pinia = data
        .get("_piniaState")
        .and_then(Value::as_object)
        .cloned()
        .unwrap_or_default();

    // 2. 找到“每日更新”模块
    let daily = find_daily_card(&pinia);
    if daily.is_none() {
        warn!("未找到“每日更新”模块，返回空结果。");
        return Ok(serde_json::to_string(&HashMap::<String, Vec<AniItem>>::new()).unwrap());
    }
    info!("成功获取腾讯视频动漫追番表数据");
    let daily = daily.unwrap();

    // 3. 提取今日更新视频列表
    let tab_id = daily
        .get("selectedTabId")
        .and_then(Value::as_str)
        .unwrap_or("");
    let today_videos = daily
        .get("videoBannerMap")
        .and_then(Value::as_object)
        .and_then(|m| m.get(tab_id))
        .and_then(Value::as_object)
        .and_then(|m| m.get("videoList"))
        .and_then(Value::as_array)
        .cloned()
        .unwrap_or_default();

    // 4. 构建结果并记录日志
    let mut comics: Vec<AniItem> = Vec::new();
    for item in today_videos.iter().filter_map(|v| build_aniitem(v)) {
        info!("识别到更新：{}, {}", item.title, item.update_info);
        comics.push(item);
    }

    // 5. 存储并返回
    let weekday = get_week_day_of_today();
    info!("成功提取到 {} 部今日更新的动漫", comics.len());
    let mut result: AniResult = HashMap::new();
    result.insert(weekday, comics);

    serde_json::to_string(&result).map_err(|e| e.to_string())
}

/// 从页面 HTML 中提取 window.__vikor__context__ 嵌入的 JSON
pub fn extract_vikor_json(html: String) -> Result<Value, Box<dyn Error>> {
    // 解析 HTML 文档
    let document = Html::parse_document(&html);

    // 创建 script 标签选择器
    let selector = Selector::parse("script").unwrap();

    // 查找包含目标变量的脚本标签
    let target_script = document
        .select(&selector)
        .filter_map(|script| script.text().next())
        .find(|script_text| script_text.contains("window.__vikor__context__"));

    let script = match target_script {
        Some(s) => s,
        None => {
            warn!("未找到包含 window.__vikor__context__ 的 <script> 标签。");
            return Err("未找到包含 window.__vikor__context__ 的 <script> 标签。".into());
        }
    };

    // 提取 JSON 字符串部分
    let prefix = "window.__vikor__context__=";
    let raw_json = script
        .split_once(prefix)
        .ok_or("脚本内容格式不正确，无法提取 JSON。")?
        .1
        .trim_end_matches(';'); // 移除可能存在的结尾分号

    // 替换 undefined 为 null 并解析 JSON
    let fixed_json = raw_json.replace("undefined", "null");
    let data: Value = serde_json::from_str(&fixed_json)?;

    Ok(data)
}

/// 在 _piniaState 中定位 moduleTitle 为 “每日更新” 的卡片数据
fn find_daily_card(pinia: &serde_json::Map<String, Value>) -> Option<Value> {
    let cards = pinia
        .get("channelPageData")
        .and_then(Value::as_object)
        .and_then(|m| m.get("channelsModulesMap"))
        .and_then(Value::as_object)
        .and_then(|m| m.get("100119"))
        .and_then(Value::as_object)
        .and_then(|m| m.get("cardListData"))
        .and_then(Value::as_array)
        .cloned()
        .unwrap_or_default();
    cards
        .into_iter()
        .find(|c| c.get("moduleTitle").and_then(Value::as_str) == Some("每日更新"))
}

/// 根据 JSON 构建 AniItem
fn build_aniitem(item: &Value) -> Option<AniItem> {
    let platform = "tencent".to_string();
    let title = item
        .get("title")
        .and_then(Value::as_str)
        .unwrap_or("")
        .trim()
        .to_string();

    let uni_img = item.get("uniImgTag").and_then(Value::as_str).unwrap_or("");
    let update_info_obj: Value = serde_json::from_str(uni_img).ok()?;
    let update_count = update_info_obj
        .get("tag_4")
        .and_then(Value::as_object)
        .and_then(|o| o.get("text"))
        .and_then(Value::as_str)
        .unwrap_or("");
    let update_count = extract_number(update_count)?.to_string();

    let update_count_info = format!("更新至{}集", update_count);
    let update_info = item
        .get("topicLabel")
        .and_then(Value::as_str)
        .unwrap_or("")
        .trim()
        .to_string();

    let update_info = format!("{} {}", update_count_info, update_info);

    let image_url = item
        .get("coverPic")
        .and_then(Value::as_str)
        .unwrap_or("")
        .trim()
        .to_string();

    let cid = item.get("cid").and_then(Value::as_str).unwrap_or("");
    let detail_url = get_qq_video_url(cid);

    let update_time = today_iso_date_ld();

    Some(AniItem {
        platform,
        title,
        update_count,
        update_info,
        image_url,
        detail_url,
        update_time,
        watched: false,
    })
}

/// 生成腾讯视频播放链接
fn get_qq_video_url(cid: &str) -> String {
    format!("https://v.qq.com/x/cover/{}.html", cid)
}
