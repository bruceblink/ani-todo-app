use crate::types::{AniItem, AniItemResult, ApiResponse};
use crate::utils::date_utils::{get_today_slash, get_today_weekday};
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
    Ok(format!("data:{ct};base64,{b64}"))
}

#[tauri::command]
pub async fn fetch_agedm_ani_data(url: String) -> Result<ApiResponse<AniItemResult>, String> {
    // 1. 发请求拿响应
    let client = http_client()?; // 若失败会 early-return Err(String)
    let response = client
        .get(&url)
        .header("Referer", "https://www.agedm.tv")
        .send()
        .await
        .map_err(|e| e.to_string())?;

    // 2. 解析成 HTML 文本
    let body = response.text().await.map_err(|e| e.to_string())?;
    debug!(
        "解析从 AGE 动漫获取到的 HTML，前 200 字符：\n{}",
        &body[..200.min(body.len())]
    );
    info!("成功获取 AGE 动漫今日更新数据");

    // 3. 解析 HTML，找「今天」区块
    let document = Html::parse_document(&body);
    // 1. 找到那个包含“今天 (土曜日)”按钮的 <div class="video_list_box recent_update ...">
    let list_box_sel = Selector::parse("div.video_list_box.recent_update").unwrap();
    let button_sel = Selector::parse("button.btn-danger").unwrap();

    // 遍历所有最近更新块，选第一个按钮文本以“今天”开头的那个
    // 先尝试找 “今天” 对应的列表节点
    let maybe_today_box = document.select(&list_box_sel).find(|bx| {
        bx.select(&button_sel)
            .any(|btn| btn.text().any(|t| t.trim().starts_with("今天")))
    });

    // 4. 如果没找到「今天」区块，返回空结果
    let today_box = if let Some(bx) = maybe_today_box {
        bx
    } else {
        let empty: AniItemResult = HashMap::new();
        return Ok(ApiResponse::ok(empty));
    };

    // 2. 在这个块里，选出所有的视频单元
    let col_sel = Selector::parse("div.row > div.col").unwrap();
    let img_sel = Selector::parse("img.video_thumbs").unwrap();
    let span_sel = Selector::parse("span.video_item--info").unwrap();
    let a_sel = Selector::parse("div.video_item-title a").unwrap();

    // 3. 初始化一个空的 result
    let weekday_str = get_today_weekday().name_cn.to_string();
    // 今天的日期，比如 "2025/07/13"
    let today_date = get_today_slash();
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

        // 更新信息
        let update_info = col
            .select(&span_sel)
            .next()
            .map(|sp| sp.text().collect::<String>().trim().to_string())
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
                let href = format!("{href}/1/{update_count}");
                let txt = a.text().collect::<String>().trim().to_string();
                (txt, href)
            })
            .unwrap_or_default();

        info!("识别到更新：{title} {update_info}");
        comics.push(AniItem {
            title,
            detail_url,
            update_time: today_date.clone(),
            platform: "agedm".to_string(),
            image_url,
            update_count,
            update_info,
        });
    }

    info!("成功提取到 {} 部今日更新的动漫", comics.len());

    // 6. 构建并返回结果
    let mut result: AniItemResult = HashMap::new();
    result.insert(weekday_str, comics);
    Ok(ApiResponse::ok(result))
}
