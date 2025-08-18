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
use std::fmt;
use std::sync:: Arc;
use log::info;
use tauri::async_runtime::block_on;
use tauri::{AppHandle, Manager};
use tauri_plugin_log::fern;
use crate::command::service::{cancel_collect_ani_item, collect_ani_item, query_ani_history_list, query_favorite_ani_update_list, query_today_update_ani_list, query_watched_ani_item_list, save_ani_item_data, watch_ani_item};
use crate::db::common::{save_ani_item_data_db, AppState};
use crate::tasks::commands::build_cmd_map;
use crate::tasks::load_timer_tasks_config;
use crate::tasks::task::{build_tasks_from_meta, TaskResult};
use crate::tasks::scheduler::Scheduler;
use tokio::sync::mpsc;

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
            handle.manage(Arc::new(AppState { db: Arc::new(pool) }));
            info!("数据库连接池已注册到全局状态");
            start_asyn_timer_task(&handle);
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
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn start_asyn_timer_task(handle: &AppHandle) {
    // 1) 构造/加载配置
    let task_metas = load_timer_tasks_config();
    // 2) 构建命令表（CmdFn 映射）
    let cmd_map = build_cmd_map();
    // 3) 从 metas -> 运行时 Tasks
    let tasks = build_tasks_from_meta(&task_metas, &cmd_map);
    // 4) 创建 Scheduler（内部使用 Arc<Task> 等）
    let scheduler = Scheduler::new(tasks);
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
                            eprintln!("保存失败：{}", e);
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