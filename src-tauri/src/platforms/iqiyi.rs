use std::collections::HashMap;
use chrono::{Datelike, Local};
use log::{error, info};
use serde_json::Value;
use crate::platforms::{AniItem, AniResult};
use crate::utils::{clean_text, extract_number};
use base64::{engine::general_purpose, Engine as _};
use crate::utils::date_utils::{get_week_day_of_today, today_iso_date_ld};

#[tauri::command]
pub async fn fetch_iqiyi_image(url: String) -> Result<String, String> {
    // 新建异步 Reqwest 客户端
    let client = reqwest::Client::new();
    let resp = client
        .get(&url)
        .header("Referer", "https://www.iqiyi.com/")
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


#[tauri::command]
pub async fn fetch_iqiyi_ani_data(url: String) -> Result<String, String> {
    // 1. 发请求拿 JSON
    let client = reqwest::Client::new();
    let response = client
        .get(&url)
        .header("Referer", "https://www.iqiyi.com/")
        .send()
        .await
        .map_err(|e| e.to_string())?;

    // 2. 反序列化成 serde_json::Value
    let json_value: Value = response
        .json()
        .await
        .map_err(|e| e.to_string())?;

    // 3. 初始化一个空的 result
    let mut result:AniResult = HashMap::new();

    // 4. 填充 result
    process_json_value(&json_value, &mut result);

    // 5. 序列化 result 并返回给前端
    let json_string = serde_json::to_string(&result)
        .map_err(|e| e.to_string())?;

    Ok(json_string)
}

fn process_json_value(json_value: &Value, result: &mut AniResult) {
    if json_value.get("code") != Some(&Value::from(0)) || !json_value.get("items").map_or(false, |v| v.is_array()) {
        error!("接口返回异常: {}", json_value);
        return;
    }

    info!("成功获取爱奇艺追番表数据");

    let current_weekday = Local::now().weekday().num_days_from_monday() as usize;

    if let Some(items) = json_value.get("items").and_then(|v| v.as_array()) {
        let weekday_str = get_week_day_of_today();
        for item in items {
            if item.get("title") == Some(&Value::from("追番表")) {
                if let Some(video_list) = item.get("video").and_then(|v| v.as_array()) {
                    if let Some(today_data) = video_list.get(current_weekday) {
                        if let Some(today_list) = today_data.get("data").and_then(|v| v.as_array()) {
                            if today_list.is_empty() {
                                info!("今日没有更新");
                                result.insert(weekday_str, vec![]);
                                return;
                            }

                            let results: Vec<AniItem> = today_list.iter()
                                .filter_map(|ep| parse_item(ep))
                                .inspect(|res| {
                                    info!("识别到更新：{} {}", res.title, res.update_info);
                                })
                                .collect();

                            result.insert(weekday_str, results);
                            return;
                        }
                    }
                }
            }
        }
    }
}

fn parse_item(ep: &Value) -> Option<AniItem> {
    let title = ep.get("display_name")?.as_str().unwrap_or("").to_string();
    let raw_update_info = ep.get("dq_updatestatus")?.as_str().unwrap_or("").trim().to_string();
    let update_count = extract_number(&raw_update_info)?.to_string();

    let image_url = ep.get("image_cover")
        .or_else(|| ep.get("image_url_normal"))
        .and_then(|v| v.as_str())
        .unwrap_or("")
        .to_string();
    //let image_url = image_url.replace("http", "https");

    let detail_url = ep.get("page_url").and_then(|v| v.as_str()).unwrap_or("").to_string();

    Some(AniItem {
        platform: "iqiyi".to_string(), // 平台名可以写死或传参
        title: clean_text(&title),
        update_count,
        update_info: raw_update_info,
        image_url,
        detail_url,
        update_time: today_iso_date_ld(),
    })
}