pub mod configuration;
pub mod db;
pub mod platforms;
pub mod utils;
pub mod command;
mod tasks;

use crate::db::sqlite::{init_and_migrate_db};
use crate::platforms::agedm::{fetch_agedm_ani_data, fetch_agedm_image};
use crate::platforms::iqiyi::{fetch_iqiyi_ani_data, fetch_iqiyi_image};
use crate::platforms::mikanani::{fetch_mikanani_ani_data, fetch_mikanani_image};
use crate::platforms::tencent::{fetch_qq_ani_data, fetch_qq_image};
use crate::platforms::youku::{fetch_youku_ani_data, fetch_youku_image};
use crate::platforms::{fetch_bilibili_ani_data, fetch_bilibili_image};
use chrono::Local;
use std::{fmt, fs};
use std::sync:: Arc;
use log::{info, warn, LevelFilter};
use sqlx::SqlitePool;
use tauri::async_runtime::block_on;
use tauri::{App, Manager};
use tauri::menu::{Menu, MenuItem};
use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};
use tauri_plugin_log::{fern, Target, TargetKind};
use crate::command::service::{cancel_collect_ani_item, collect_ani_item, query_ani_history_list, query_favorite_ani_update_list, query_today_update_ani_list, query_watched_ani_item_list, save_ani_item_data, watch_ani_item};
use crate::tasks::{start_async_timer_task};
use crate::configuration::init_config;

/// tauri 的全局App状态
pub struct AppState {
    pub db: Arc<SqlitePool>,
}


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
            let pool = block_on(init_and_migrate_db(&handle))?;
            // 注入全局状态
            handle.manage(Arc::new(AppState { db: Arc::new(pool) }));
            info!("数据库连接池已注册到全局状态");
            start_async_timer_task(&handle, config_path);
            info!("执行异步获取动漫更新数据的任务");
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


/// 初始化日志组件
fn init_logger(app: &mut App) -> anyhow::Result<()> {

    // 日志存放在应用的安装目录
    let log_dir = app.path().resource_dir().unwrap_or_default().join("logs");
    if !log_dir.exists() {
        fs::create_dir_all(log_dir.clone())?
    }
    let app_name = app.handle().package_info().name.clone();
    // 设置日志文件路径
    let log_file_path = log_dir.join(app_name).to_str().unwrap().to_string();

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
            .level(LevelFilter::Info)
            .format(format) // 应用自定义格式
            .targets([
                Target::new(TargetKind::Stdout),
                Target::new(TargetKind::LogDir { file_name: Some(log_file_path) }),
                Target::new(TargetKind::Webview),
            ])
            .build(),
    )?;
    info!("日志组件已经初始化完成");
    Ok(())
}

/// 初始化系统托盘
fn init_system_tray(app: &mut App) -> anyhow::Result<()>{
    // 定义托盘菜单
    let show_i = MenuItem::with_id(app, "show", "显示窗口", true, None::<&str>)?;
    let quit_i = MenuItem::with_id(app, "quit", "退出", true, None::<&str>)?;
    let menu = Menu::with_items(app, &[&show_i, &quit_i])?;

    let tray = TrayIconBuilder::new()
        //.title(app.package_info().name.clone())
        .menu(&menu)
        .show_menu_on_left_click(true)
        .icon(app.default_window_icon().unwrap().clone())
        .build(app)?;
    // 定义托盘菜单事件
    tray.on_menu_event(|app, event| match event.id.as_ref() {

        "quit" => {
            app.exit(0);
        }
        "show" => {
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.unminimize();
                let _ = window.show();
                let _ = window.set_focus();
            }
        }
        _ => {
            warn!("menu item {:?} not handled", event.id);
        }
    });
    // 定义托盘的图标事件
    tray.on_tray_icon_event(|tray, event| match event {

        TrayIconEvent::Click {
            button: MouseButton::Left,
            button_state: MouseButtonState::Up,
            ..
        } => {
            // 当点击托盘图标时，将展示并聚焦于主窗口
            let app = tray.app_handle();

            if let Some(window) = app.get_webview_window("main") {
                let _ = window.unminimize();
                let _ = window.show();
                let _ = window.set_focus();
            }

        }
        _ => {
            let app = tray.app_handle();
            let tooltip_text = app.package_info().name.clone(); // 获取应用名称并转换为 String
            let _ = tray.set_tooltip(Some(tooltip_text)); // 传入 Some(String)
        }
    });
    Ok(())
}