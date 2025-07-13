use std::collections::HashMap;
use log::{error, info};
use serde_json::Value;
use crate::AniItem;
use crate::utils::{clean_text, extract_number, get_week_day_of_today, today_iso_date_ld};

/// 定义结果类型：星期字符串 -> 番剧更新列表
type AniResult = HashMap<String, Vec<AniItem>>;

#[tauri::command]
pub async fn fetch_bilibili_ani_data(url: String) -> Result<String, String> {
    // 1. 发请求拿 JSON
    let client = reqwest::Client::new();
    let response = client
        .get(&url)
        .header("Referer", "https://www.bilibili.com/")
        .send()
        .await
        .map_err(|e| e.to_string())?;

    // 2. 反序列化成 serde_json::Value
    let json_value: Value = response
        .json()
        .await
        .map_err(|e| e.to_string())?;

    // 3. 初始化一个空的 result
    let mut result: AniResult = HashMap::new();

    // 4. 填充 result
    format_json_value(&json_value, &mut result);

    // 5. 序列化 result 并返回给前端
    let json_string = serde_json::to_string(&result)
        .map_err(|e| e.to_string())?;

    Ok(json_string)
}

/// 解析原始 JSON，往 `result` 中填充当天已发布的番剧更新
fn format_json_value(json_value: &Value, result: &mut AniResult) {
    // 1. code != 0 或者没有 result 字段，则记录错误并返回
    let code = json_value.get("code").and_then(Value::as_i64).unwrap_or(-1);
    if code != 0 || !json_value.get("result").map_or(false, Value::is_array) {
        error!("接口返回数据异常：{}", json_value);
        return;
    }

    // 2. 找到 is_today == 1 的那一天
    let days = json_value.get("result").unwrap().as_array().unwrap();
    let today_opt = days.iter()
        .find(|day| day.get("is_today").and_then(Value::as_i64) == Some(1));

    let today = match today_opt {
        Some(d) => d,
        None => {
            info!("今日没有更新");
            return;
        }
    };

    // 3. 筛选出 published == 1 的剧集，并生成 AniItem 推入 result
    if let Some(eps) = today.get("episodes").and_then(Value::as_array) {
        // 获取星期字符串，例如 "星期日"
        let weekday_str = get_week_day_of_today();
        for ep in eps.iter().filter(|e| e.get("published").and_then(Value::as_i64) == Some(1)) {
            let item = build_item_from_episode(ep);
            info!("识别到更新：{} {}", item.title, item.update_info);
            result
                .entry(weekday_str.clone())
                .or_default()
                .push(item);
        }
    }
}

/// 根据单个 episode JSON 构建 AniItem
fn build_item_from_episode(ep: &Value) -> AniItem {
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
    let update_info = format!("更新至{}", pub_index);

    // image_url: 优先 square_cover，否则 cover
    let image_url = ep
        .get("square_cover")
        .and_then(Value::as_str)
        .or_else(|| ep.get("cover").and_then(Value::as_str))
        .unwrap_or_default()
        .to_string();

    // detail_url
    let episode_id = ep.get("episode_id").and_then(Value::as_i64).unwrap_or_default();
    let detail_url = format!("https://www.bilibili.com/bangumi/play/ep{}", episode_id);

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
        update_time: today_iso_date_ld(),
    }
}