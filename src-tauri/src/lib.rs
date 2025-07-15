pub mod utils;
pub mod platforms;

use crate::platforms::{fetch_bilibili_ani_data, fetch_bilibili_image};
use chrono::Local; 
use std::fmt;
use tauri_plugin_log::fern;
use crate::platforms::iqiyi::{fetch_iqiyi_ani_data, fetch_iqiyi_image};
use crate::platforms::mikanani::{fetch_mikanani_ani_data, fetch_mikanani_image};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            if cfg!(debug_assertions) {
                // 自定义日志格式（使用本地时区）
                let format = move |out: fern::FormatCallback, message: &fmt::Arguments, record: &log::Record| {
                    let now = Local::now();  // 获取本地时间
                    out.finish(format_args!(
                        "[{}][{}][{}] {}",
                        now.format("%Y-%m-%d %H:%M:%S%.3f"),  // 格式化为本地时间
                        record.level(),
                        record.target(),
                        message
                    ))
                };
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .format(format)  // 应用自定义格式
                        .build(),
                )?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            fetch_bilibili_image,
            fetch_bilibili_ani_data,
            fetch_iqiyi_ani_data,
            fetch_iqiyi_image,
            fetch_mikanani_image,
            fetch_mikanani_ani_data
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}