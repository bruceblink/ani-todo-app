use serde_json::Value;

#[tauri::command]
pub async fn fetch_bilibili_ani_data(url: String) -> Result<Value, String> {
    // 新建异步 Reqwest 客户端
    let client = reqwest::Client::new();
    let response = client
        .get(&url)
        .header("Referer", "https://www.bilibili.com/")
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let res: Value = response
        .json()
        .await
        .expect("Failed to parse JSON");
    Ok(res)
}