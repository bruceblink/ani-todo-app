use reqwest::header::USER_AGENT;
use serde::{Deserialize, Serialize};

const CURRENT_VERSION: &str = env!("CARGO_PKG_VERSION");
const RELEASES_API: &str =
    "https://api.github.com/repos/bruceblink/ani-todo-app/releases/latest";

#[derive(Debug, Serialize)]
pub struct UpdateStatus {
    pub available: bool,
    pub current_version: String,
    pub latest_version: Option<String>,
    pub release_notes: Option<String>,
    pub release_url: Option<String>,
    pub published_at: Option<String>,
}

#[derive(Debug, Deserialize)]
struct GhRelease {
    tag_name: String,
    body: Option<String>,
    html_url: String,
    published_at: Option<String>,
    prerelease: bool,
    draft: bool,
}

/// Compare semver strings; returns true if `latest` is strictly newer than `current`.
fn is_newer(current: &str, latest: &str) -> bool {
    let parse = |v: &str| -> Vec<u64> {
        v.trim_start_matches('v')
            .split('.')
            .filter_map(|p| p.parse().ok())
            .collect()
    };
    parse(latest) > parse(current)
}

#[tauri::command]
pub async fn check_for_update() -> Result<UpdateStatus, String> {
    let client = reqwest::Client::new();

    let release: GhRelease = client
        .get(RELEASES_API)
        .header(USER_AGENT, "ani-todo-app-updater")
        .send()
        .await
        .map_err(|e| format!("网络请求失败: {e}"))?
        .json()
        .await
        .map_err(|e| format!("解析响应失败: {e}"))?;

    if release.draft || release.prerelease {
        return Ok(UpdateStatus {
            available: false,
            current_version: CURRENT_VERSION.to_string(),
            latest_version: None,
            release_notes: None,
            release_url: None,
            published_at: None,
        });
    }

    let latest = release.tag_name.trim_start_matches('v').to_string();
    let available = is_newer(CURRENT_VERSION, &latest);

    Ok(UpdateStatus {
        available,
        current_version: CURRENT_VERSION.to_string(),
        latest_version: Some(latest),
        release_notes: release.body,
        release_url: Some(release.html_url),
        published_at: release.published_at,
    })
}
