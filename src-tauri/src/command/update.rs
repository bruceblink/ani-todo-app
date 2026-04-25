use serde::Serialize;
use tauri::Emitter;
use tauri_plugin_updater::UpdaterExt;

#[derive(Debug, Serialize)]
pub struct UpdateStatus {
    pub available: bool,
    pub current_version: String,
    pub latest_version: Option<String>,
    pub release_notes: Option<String>,
}

/// 检查是否有新版本可用
#[tauri::command]
pub async fn check_for_update(app: tauri::AppHandle) -> Result<UpdateStatus, String> {
    let updater = app.updater().map_err(|e| e.to_string())?;

    match updater.check().await.map_err(|e| e.to_string())? {
        Some(update) => Ok(UpdateStatus {
            available: true,
            current_version: env!("CARGO_PKG_VERSION").to_string(),
            latest_version: Some(update.version.clone()),
            release_notes: update.body.clone(),
        }),
        None => Ok(UpdateStatus {
            available: false,
            current_version: env!("CARGO_PKG_VERSION").to_string(),
            latest_version: None,
            release_notes: None,
        }),
    }
}

/// 下载并安装更新，通过事件向前端推送下载进度
#[derive(Clone, Serialize)]
struct DownloadProgress {
    downloaded: u64,
    total: Option<u64>,
}

#[tauri::command]
pub async fn install_update(app: tauri::AppHandle) -> Result<(), String> {
    let updater = app.updater().map_err(|e| e.to_string())?;

    let update = updater
        .check()
        .await
        .map_err(|e| e.to_string())?
        .ok_or_else(|| "没有可用的更新".to_string())?;

    let app_clone = app.clone();
    let mut downloaded: u64 = 0;

    update
        .download_and_install(
            move |chunk, total| {
                downloaded += chunk as u64;
                let _ = app_clone.emit(
                    "update:progress",
                    DownloadProgress { downloaded, total },
                );
            },
            || {},
        )
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}

/// 重启应用（延迟 300ms 确保前端收到响应后再退出）
#[tauri::command]
pub async fn restart_app(app: tauri::AppHandle) -> Result<(), String> {
    tokio::spawn(async move {
        tokio::time::sleep(std::time::Duration::from_millis(300)).await;
        app.restart();
    });
    Ok(())
}
