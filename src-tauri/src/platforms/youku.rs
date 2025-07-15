use std::collections::HashMap;
use std::error::Error;
use serde_json::Value;
use log::{debug, info};
use scraper::{Html, Selector};
use anyhow::{Context, anyhow};
use base64::Engine;
use base64::engine::general_purpose;
use crate::platforms::{AniItem, AniResult};
use crate::utils::date_utils::{get_week_day_of_today, today_iso_date_ld};
use crate::utils::extract_number;
use crate::utils::http_client::http_client;

#[tauri::command]
pub async fn fetch_youku_image(url: String) -> Result<String, String> {
    // 新建异步 Reqwest 客户端
    let client = http_client()?;
    let resp = client
        .get(&url)
        .header("Referer", "https://www.youku.com/")
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

// 在 fetch_youku_cartoon_today 函数中使用
#[tauri::command]
pub async fn fetch_youku_ani_data(url: String) -> Result<String, String> {
    let client = reqwest::Client::new();
    let resp = client
        .get(&url)
        .header("Referer", "https://www.youku.com/")
        .send()
        .await
        .map_err(|e| e.to_string())?;
    
    let text = resp
        .text()
        .await
        .map_err(|e| e.to_string())?;
    debug!("解析从优酷动漫获取到的 HTML，前 200 字符：\n{}", &text[..200.min(text.len())]);
    let data = extract_initial_data(text)
        .map_err(|e| format!("提取__INITIAL_DATA__数据失败: {}", e))?;

    let module_list = data.get("moduleList")
        .and_then(Value::as_array)
        .ok_or("缺少 moduleList 数组".to_string())?;

    info!("正在通过迭代器提取今日更新漫画...");
    let comics_found = process_module_list(module_list)?;
    info!("成功提取到 {} 部今日更新的动漫", comics_found.len());

    let weekday = get_week_day_of_today();
    let mut result: AniResult = HashMap::new();
    result.insert(weekday, comics_found);

    serde_json::to_string(&result).map_err(|e| e.to_string())
}


// 提取 INITIAL_DATA 函数
fn extract_initial_data(html: String) -> Result<Value, Box<dyn Error>> {
    let document = Html::parse_document(&html);
    let selector = Selector::parse("script")
        .map_err(|e| anyhow!("解析选择器失败: {}", e))?;

    let script_content = document.select(&selector)
        .filter_map(|tag| tag.text().next())
        .find(|text| text.contains("__INITIAL_DATA__"))
        .context("未找到包含 __INITIAL_DATA__ 的 <script> 标签")?;

    let prefix = "window.__INITIAL_DATA__ =";
    let json_str = script_content
        .split_once(prefix)
        .ok_or("脚本内容格式不正确，无法提取 JSON。")?
        .1;
    let json_str = json_str.trim_end_matches(';');

    let fixed_json_str = json_str.replace("undefined", "null");

    let data: Value = serde_json::from_str(&fixed_json_str)?;
    Ok(data)
}

fn process_module_list(module_list: &[Value]) -> Result<Vec<AniItem>, String> {
    // 步骤1: 找到所有 title 为 '每日更新' 的 component
    let daily_update_components = module_list.iter()
        .flat_map(|card_mod| {
            card_mod.get("components")
                .and_then(Value::as_array)
                .map(|arr| arr.iter())
                .unwrap_or_else(|| [].iter())
        })
        .filter(|comp| {
            comp.get("title")
                .and_then(Value::as_str) == Some("每日更新")
        });

    // 步骤2: 从这些 component 中提取所有 item，并扁平化
    let all_raw_items = daily_update_components
        .flat_map(|comp| {
            comp.get("itemList")
                .and_then(Value::as_array)
                .map(|arr| arr.iter())
                .unwrap_or_else(|| [].iter())
        })
        .flat_map(|item_array| {
            // 处理 itemList 中的每个元素（可能是数组或单个对象）
            if let Value::Array(items) = item_array {
                items.iter()
            } else {
                // 如果不是数组，将其视为单个项
                std::slice::from_ref(item_array).iter()
            }
        });

    // 步骤3: 过滤出 updateTips 为 '有更新' 的 item
    let updated_items = all_raw_items
        .filter(|item| {
            item.get("updateTips")
                .and_then(Value::as_str) == Some("有更新")
        })
        .filter_map(|item| item.as_object());

    // 步骤4: 根据过滤后的 item 创建 AniItem 对象
    let mut comics_found = Vec::new();
    let mut seen_titles = HashMap::new();

    for item in updated_items {
        let aniitem = build_aniitem(item);

        // 使用标题去重（更符合实际需求）
        if seen_titles.contains_key(&aniitem.title) {
            continue;
        }

        seen_titles.insert(aniitem.title.clone(), true);
        comics_found.push(aniitem);
    }

    // 记录识别到的更新
    for comic in &comics_found {
        info!("识别到更新：{} {}", comic.title, comic.update_info);
    }

    Ok(comics_found)
}

fn build_aniitem(item: &serde_json::Map<String, Value>) -> AniItem {
    let title = item.get("title")
        .and_then(Value::as_str)
        .unwrap_or("")
        .trim()
        .to_string();

    // 处理 lbTexts 可能是字符串或数组的情况
    let lb_texts = match item.get("lbTexts") {
        Some(Value::String(s)) => s.trim().to_string(),
        Some(Value::Array(arr)) => {
            arr.iter()
                .filter_map(Value::as_str)
                .map(|s| s.trim())
                .collect::<Vec<_>>()
                .join(" ")
        }
        _ => "".to_string(),
    };

    // 尝试从 updateCount 获取更新数量
    let update_count = item.get("updateCount")
        .and_then(|v| {
            if let Some(s) = v.as_str() {
                s.parse::<u32>().ok().map(|n| n.to_string())
            } else if let Some(n) = v.as_u64() {
                Some(n.to_string())
            } else if let Some(n) = v.as_i64() {
                Some(n.to_string())
            } else if let Some(n) = v.as_f64() {
                Some(n.to_string())
            } else {
                None
            }
        })
        // 如果 updateCount 不存在，尝试从 lbTexts 中提取
        .unwrap_or_else(|| {
            extract_number(&lb_texts)
                .map(|n| n.to_string())
                .unwrap_or_else(|| {
                    // 如果无法提取数字，默认为1
                    "1".to_string()
                })
        });

    let image_url = item.get("img")
        .and_then(Value::as_str)
        .unwrap_or("")
        .trim()
        .to_string();

    AniItem {
        platform: "youku".to_string(),
        title,
        update_count,
        update_info: lb_texts,
        image_url,
        detail_url: "https://www.youku.com/ku/webcomic".to_string(),
        update_time: today_iso_date_ld(),
    }
}
