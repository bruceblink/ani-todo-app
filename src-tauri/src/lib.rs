pub mod configuration;
pub mod db;
pub mod platforms;
pub mod utils;

use crate::db::sqlite::{init_and_migrate_db};
use crate::db::{cancel_collect_ani_item, collect_ani_item, query_favorite_ani_update_list, query_watched_ani_item_list, query_today_update_ani_list, watch_ani_item, save_ani_item_data, update_collected_ani_item};
use crate::platforms::agedm::{fetch_agedm_ani_data, fetch_agedm_image};
use crate::platforms::iqiyi::{fetch_iqiyi_ani_data, fetch_iqiyi_image};
use crate::platforms::mikanani::{fetch_mikanani_ani_data, fetch_mikanani_image};
use crate::platforms::tencent::{fetch_qq_ani_data, fetch_qq_image};
use crate::platforms::youku::{fetch_youku_ani_data, fetch_youku_image};
use crate::platforms::{fetch_bilibili_ani_data, fetch_bilibili_image};
use chrono::Local;
use std::fmt;
use std::sync::Arc;
use log::info;
use tauri::async_runtime::block_on;
use tauri::Manager;
use tauri_plugin_log::fern;
use crate::db::common::AppState;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {

            if cfg!(debug_assertions) {
                // 自定义日志格式（使用本地时区）
                let format = move |out: fern::FormatCallback,
                                   message: &fmt::Arguments,
                                   record: &log::Record| {
                    let now = Local::now(); // 获取本地时间
                    out.finish(format_args!(
                        "[{}][{}][{}] {}",
                        now.format("%Y-%m-%d %H:%M:%S%.3f"), // 格式化为本地时间
                        record.level(),
                        record.target(),
                        message
                    ))
                };
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .format(format) // 应用自定义格式
                        .build(),
                )?;
                info!("日志组件已经初始化完成");
            }
            let handle = app.handle();
            // 同步执行数据库初始化
            let pool = block_on(init_and_migrate_db(&handle))?;
            // 注入全局状态
            handle.manage(AppState { db: Arc::new(pool) });
            info!("数据库连接池已注册到全局状态");
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
            watch_ani_item,
            fetch_agedm_ani_data,
            fetch_agedm_image,
            query_today_update_ani_list,
            query_watched_ani_item_list,
            query_favorite_ani_update_list,
            collect_ani_item,
            cancel_collect_ani_item,
            update_collected_ani_item,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
