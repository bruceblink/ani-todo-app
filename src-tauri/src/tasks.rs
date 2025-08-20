use std::path::PathBuf;
use crate::configuration::load_configuration;
use crate::tasks::task::{build_tasks_from_meta, TaskMeta, TaskResult};
use std::sync::Arc;
use log::warn;
use tauri::{AppHandle, Manager};
use tokio::sync::mpsc;
use crate::AppState;
use crate::command::service::{save_ani_item_data_db};
use crate::tasks::commands::build_cmd_map;
use crate::tasks::scheduler::Scheduler;

pub mod task;
pub(crate) mod scheduler;
pub mod commands;

///从配置文件加载定时作业的配置数据
pub fn load_timer_tasks_config(config_path: PathBuf) -> Vec<TaskMeta>{
    let configuration = load_configuration(config_path).expect("Failed to read configuration.");
    let anime_sources = configuration
        .datasource
        .get("anime")
        .expect("Missing anime category");

    let mut tasks: Vec<TaskMeta> = Vec::new();
    for datasource in anime_sources {
        tasks.push(
            TaskMeta {
              name: datasource.name.clone(),
              cron_expr: datasource.cron_expr.clone(),
              cmd: datasource.cmd.clone(),
              arg: datasource.url.clone(),
              retry_times: datasource.retry_times,
            }
        );
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
                            warn!("task {} 保存失败：{}",res.name, e);
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
        assert_eq!(task_metas[0].cron_expr, "0 30 8,9,10,11,12,16,17,18,19,20,21,22,23 * * * *");
        assert_eq!(task_metas[0].arg, "https://api.bilibili.com/pgc/web/timeline?types=4&before=6&after=6");
    }
}