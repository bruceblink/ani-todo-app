use crate::platforms::{AniItem, AniItemResult};
use crate::utils::date_utils::{get_week_day_of_today, today_iso_date_ld};
use crate::utils::extract_number;
use crate::utils::http_client::http_client;
use base64::{engine::general_purpose, Engine as _};
use log::{debug, info};
use scraper::{Html, Selector};
use std::collections::HashMap;

#[tauri::command]
pub async fn fetch_agedm_image(url: String) -> Result<String, String> {
    // 新建异步 Reqwest 客户端
    let client = reqwest::Client::new();
    let resp = client
        .get(&url)
        .header("Referer", "https://www.agedm.vip/")
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
pub async fn fetch_agedm_ani_data(url: String) -> Result<AniItemResult, String> {
    // 1. 发请求拿 响应
    let client = http_client()?;
    let response = client
        .get(&url)
        // .header("User-Agent",
        // "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36")
        .header("Referer", "https://www.agedm.vip/")
        .send()
        .await
        .map_err(|e| e.to_string())?;

    // 2. 将响应解析成text的html
    let body = response.text().await.map_err(|e| e.to_string())?;
    debug!(
        "解析从AGE动漫获取到的 HTML，前 200 字符：\n{}",
        &body[..200.min(body.len())]
    );
    info!("成功获取AGE动漫今日更新数据");
    // 解析 HTML
    let document = Html::parse_document(&body);
    // 1. 找到那个包含“今天 (土曜日)”按钮的 <div class="video_list_box recent_update ...">
    let list_box_sel = Selector::parse("div.video_list_box.recent_update").unwrap();
    let button_sel = Selector::parse("button.btn-danger").unwrap();

    // 遍历所有最近更新块，选第一个按钮文本以“今天”开头的那个
    // 先尝试找 “今天” 对应的列表节点
    let maybe_today_box = document
        .select(&list_box_sel)
        .find(|box_node| {
            box_node
                .select(&button_sel)
                .any(|btn| btn.text().any(|t| t.trim().starts_with("今天")))
        });
    // 如果找到了就处理，否则直接返回空 Vec
    let today_box = if let Some(box_node) = maybe_today_box {
        box_node
    } else {
        // 没有找到 “今天” 的节点，返回空结果
        return Ok(HashMap::new());
    };

    // 2. 在这个块里，选出所有的视频单元
    let col_sel = Selector::parse("div.row > div.col").unwrap();
    let img_sel = Selector::parse("img.video_thumbs").unwrap();
    let span_sel = Selector::parse("span.video_item--info").unwrap();
    let a_sel = Selector::parse("div.video_item-title a").unwrap();

    // 3. 初始化一个空的 result
    let mut result: AniItemResult = HashMap::new();
    let weekday_str = get_week_day_of_today();
    // 今天的日期，比如 "2025/07/13"
    let today_date = today_iso_date_ld();
    // 动漫aniitem的列表
    let mut comics: Vec<AniItem> = Vec::new();
    // 过滤出符合条件的 <div class="col g-2 position-relative">
    for col in today_box.select(&col_sel) {
        // 封面
        let image_url = col
            .select(&img_sel)
            .next()
            .and_then(|img| {
                img.value()
                    .attr("data-original")
                    .or(img.value().attr("src"))
            })
            .unwrap_or_default()
            .to_string();

        // 当前更新到第几集
        let update_info = col
            .select(&span_sel)
            .next()
            .map(|span| span.text().collect::<Vec<_>>().join("").trim().to_string())
            .unwrap_or_default();

        //更新集数字
        let update_count = extract_number(&update_info)
            .map(|n| n.to_string())
            .unwrap_or_default();

        // 标题和详情链接
        let (title, detail_url) = col
            .select(&a_sel)
            .next()
            .map(|a| {
                let href = a
                    .value()
                    .attr("href")
                    .unwrap_or_default() // &str
                    .replacen("http://", "https://", 1) // 先把协议换好
                    .replacen("/detail/", "/play/", 1) // 再把路径段换好
                    .trim_end_matches('/') // 去掉末尾多余斜杠（可选）
                    .to_string(); // 拷贝成 String
                let href = format!("{}/1/{}", href, update_count);

                let txt = a.text().collect::<Vec<_>>().join("").trim().to_string();
                (txt, href)
            })
            .unwrap_or_default();
        // 构建 AniItem 并加入结果
        let ani_item = AniItem {
            title,
            detail_url,
            update_time: today_date.to_string(),
            platform: "agedm".to_string(),
            image_url,
            update_count,
            update_info,
        };
        info!("识别到更新：{} {}", ani_item.title, ani_item.update_info);
        comics.push(ani_item);
    }
    info!("成功提取到 {} 部今日更新的动漫", comics.len());
    result.insert(weekday_str, comics);
    
    Ok(result)
}
