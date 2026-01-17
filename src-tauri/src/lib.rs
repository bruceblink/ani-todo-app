pub mod command;
pub mod configuration;
pub mod db;
mod startup;
pub mod state;
mod tasks;
pub mod types;
pub mod utils;

use crate::command::service::{
    cancel_collect_ani_item, collect_ani_item, query_ani_history_list,
    query_favorite_ani_update_list, query_today_update_ani_list, query_watched_ani_item_list,
    save_ani_item_data, watch_ani_item,
};
use crate::configuration::init_config;
use crate::db::sqlite::init_and_migrate_db;
use crate::startup::{init_logger, init_system_tray};
use crate::state::AppState;
use crate::tasks::start_async_timer_task;
use command::platforms::agedm::{fetch_agedm_ani_data, fetch_agedm_image};
use command::platforms::bilibili::{fetch_bilibili_ani_data, fetch_bilibili_image};
use command::platforms::iqiyi::{fetch_iqiyi_ani_data, fetch_iqiyi_image};
use command::platforms::mikanani::{fetch_mikanani_ani_data, fetch_mikanani_image};
use command::platforms::tencent::{fetch_qq_ani_data, fetch_qq_image};
use command::platforms::youku::{fetch_youku_ani_data, fetch_youku_image};
use log::info;
use std::sync::Arc;
use tauri::async_runtime::block_on;
use tauri::Manager;
use tauri_plugin_dialog::{DialogExt, MessageDialogKind};
use tauri_plugin_single_instance::init;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            // 日志组件初始化
            init_logger(app)?;
            //托盘初始化
            init_system_tray(app)?;
            // 初始化配置
            let config_path = init_config(app).expect("配置文件初始化失败!");
            let handle = app.handle();
            // 同步执行数据库初始化
            let pool = block_on(init_and_migrate_db(handle))?;
            // 注入全局状态
            handle.manage(Arc::new(AppState { db: Arc::new(pool) }));
            info!("数据库连接池已注册到全局状态");
            start_async_timer_task(handle, config_path);
            info!("执行异步获取动漫更新数据的任务");
            Ok(())
        })
        .plugin(init(|app, _args, _cwd| {
            if let Some(window) = app.get_webview_window("main") {
                window.show().unwrap();
                window.set_focus().unwrap();
            } else {
                app.dialog()
                    .message("程序正在运行中...")
                    .kind(MessageDialogKind::Error)
                    .title("Warning")
                    .blocking_show();
            }
        }))
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
            query_ani_history_list,
        ])
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                // 阻止窗口关闭
                window.hide().unwrap();
                api.prevent_close();
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
