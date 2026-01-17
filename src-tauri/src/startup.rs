use crate::utils::date_utils::{format_now, DateFormat};
use chrono::Local;
use log::{info, warn, LevelFilter};
use std::{fmt, fs};
use tauri::menu::{Menu, MenuItem};
use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};
use tauri::{App, Manager};
use tauri_plugin_log::{fern, Target, TargetKind};

/// 初始化日志组件
pub fn init_logger(app: &mut App) -> anyhow::Result<()> {
    // 日志存放在应用的安装目录
    let log_dir = app.path().resource_dir().unwrap_or_default().join("logs");
    if !log_dir.exists() {
        fs::create_dir_all(log_dir.clone())?
    }
    let log_file_name = format!(
        "{}-{}",
        app.handle().package_info().name.clone(),
        format_now(DateFormat::Number)
    );
    // 设置日志文件路径
    let log_file_path = log_dir.join(log_file_name).to_str().unwrap().to_string();

    // 自定义日志格式（使用本地时区）
    let format =
        move |out: fern::FormatCallback, message: &fmt::Arguments, record: &log::Record| {
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
                Target::new(TargetKind::LogDir {
                    file_name: Some(log_file_path),
                }),
                Target::new(TargetKind::Webview),
            ])
            .build(),
    )?;
    info!("日志组件已经初始化完成");
    Ok(())
}

/// 初始化系统托盘
pub fn init_system_tray(app: &mut App) -> anyhow::Result<()> {
    // 定义托盘菜单
    let show_i = MenuItem::with_id(app, "show", "主界面", true, None::<&str>)?;
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
