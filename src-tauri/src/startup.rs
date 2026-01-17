use crate::command::service::save_ani_item_data_db;
use crate::configuration::load_configuration;
use crate::state::AppState;
use crate::tasks::commands::build_cmd_map;
use crate::tasks::scheduler::Scheduler;
use crate::tasks::task::{build_tasks_from_meta, TaskMeta, TaskResult};
use crate::utils::date_utils::{format_now, DateFormat};
use chrono::Local;
use log::{info, warn, LevelFilter};
use std::path::PathBuf;
use std::sync::Arc;
use std::{fmt, fs};
use tauri::menu::{Menu, MenuItem};
use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};
use tauri::{App, AppHandle, Manager};
use tauri_plugin_log::{fern, Target, TargetKind};
use tokio::sync::mpsc;

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

///从配置文件加载定时作业的配置数据
pub fn load_timer_tasks_config(config_path: PathBuf) -> Vec<TaskMeta> {
    let configuration = load_configuration(config_path).expect("Failed to read configuration.");
    let anime_sources = configuration
        .datasource
        .get("anime")
        .expect("Missing anime category");

    let mut tasks: Vec<TaskMeta> = Vec::new();
    for datasource in anime_sources {
        tasks.push(TaskMeta {
            name: datasource.name.clone(),
            cron_expr: datasource.cron_expr.clone(),
            cmd: datasource.cmd.clone(),
            arg: datasource.url.clone(),
            retry_times: datasource.retry_times,
        });
    }
    tasks
}

/// 启动异步定时任务
pub fn start_async_timer_task(handle: &AppHandle, config_path: PathBuf) {
    // 1) 构造/加载配置
    let task_metas = load_timer_tasks_config(config_path);
    // 2) 构建命令表（CmdFn 映射）
    let cmd_map = build_cmd_map();
    // 3) 从 metas -> 运行时 Tasks
    let tasks = build_tasks_from_meta(&task_metas, &cmd_map);
    // 4) 创建 Scheduler（内部使用 Arc<Task> 等）
    let scheduler = Scheduler::new(tasks, None);
    let scheduler_arc = Arc::new(scheduler);
    // 5) 把 Scheduler 放到 app state（使用 handle，注意这里是 AppHandle）
    handle.manage(scheduler_arc.clone());

    // 6) 创建 mpsc channel 用于接收 TaskResult
    let (tx, mut rx) = mpsc::channel::<TaskResult>(128);

    // 7) 从 handle 取出 Arc<AppState> （立即 clone 出 owned Arc）
    let state_arc: Arc<AppState> = handle.state::<Arc<AppState>>().inner().clone();

    // 8) 启动结果接收器（异步）
    tauri::async_runtime::spawn({
        let state_for_loop = state_arc.clone();
        async move {
            while let Some(res) = rx.recv().await {
                if let Some(ani_item_result) = res.result {
                    let db = state_for_loop.db.clone(); // Arc<SqlitePool>
                    tauri::async_runtime::spawn(async move {
                        if let Err(e) = save_ani_item_data_db(db, ani_item_result).await {
                            warn!("task {} 保存失败：{}", res.name, e);
                        }
                    });
                }
            }
        }
    });

    // 9) 启动调度器（异步）
    tauri::async_runtime::spawn({
        let scheduler_run = scheduler_arc.clone();
        async move {
            scheduler_run.run(tx).await;
        }
    });
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_get_task_metas() {
        let tmp = PathBuf::from("tmp");
        let task_metas = load_timer_tasks_config(tmp);
        assert_eq!(task_metas.len(), 6);
        assert_eq!(task_metas[0].name, "哔哩哔哩国创");
        assert_eq!(task_metas[0].cmd, "fetch_bilibili_ani_data");
        assert_eq!(
            task_metas[0].cron_expr,
            "0 30 8,9,10,11,12,16,17,18,19,20,21,22,23 * * * *"
        );
        assert_eq!(
            task_metas[0].arg,
            "https://api.bilibili.com/pgc/web/timeline?types=4&before=6&after=6"
        );
    }
}
