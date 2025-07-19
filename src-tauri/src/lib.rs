pub mod utils;
pub mod platforms;
pub mod configuration;
pub mod db;

use crate::platforms::{fetch_bilibili_ani_data, fetch_bilibili_image};
use chrono::Local; 
use std::fmt;
use tauri::async_runtime::block_on;
use tauri_plugin_log::fern;
use crate::db::{query_ani_item_data_list, remove_ani_item_data, save_ani_item_data};
use crate::db::sqlite::setup_app_db;
use crate::platforms::agedm::{fetch_agedm_ani_data, fetch_agedm_image};
use crate::platforms::iqiyi::{fetch_iqiyi_ani_data, fetch_iqiyi_image};
use crate::platforms::mikanani::{fetch_mikanani_ani_data, fetch_mikanani_image};
use crate::platforms::tencent::{fetch_qq_ani_data, fetch_qq_image};
use crate::platforms::youku::{fetch_youku_ani_data, fetch_youku_image};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            // 同步执行数据库初始化
            block_on(setup_app_db(app))?;
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
            fetch_mikanani_ani_data,
            fetch_qq_image,
            fetch_qq_ani_data,
            fetch_youku_image,
            fetch_youku_ani_data,
            save_ani_item_data,
            remove_ani_item_data,
            fetch_agedm_ani_data,
            fetch_agedm_image,
            query_ani_item_data_list,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}