use crate::tasks::task::{Task, TaskResult};
use chrono::Local;
use log::{info, warn};
use std::sync::{Arc, Mutex};
use tokio::sync::{mpsc, Notify};
use tokio::time::{sleep, Duration};
use tokio::task::JoinHandle;

#[derive(Clone)]
pub struct Scheduler {
    pub tasks: Vec<Arc<Task>>,
    shutdown: Arc<Notify>,
    // 保存 spawn 的子任务句柄
    task_handles: Arc<Mutex<Vec<JoinHandle<()>>>>,
}

impl Scheduler {
    pub fn new(tasks: Vec<Task>) -> Self {
        Self {
            tasks: tasks.into_iter().map(Arc::new).collect(),
            shutdown: Arc::new(Notify::new()),
            task_handles: Arc::new(Mutex::new(vec![])),
        }
    }

    /// 运行任务调度器，将 TaskResult 通过 mpsc::Sender 发出
    pub async fn run(&self, sender: mpsc::Sender<TaskResult>) {
        // 1. 启动时立即执行
        for task in &self.tasks {
            let t = task.clone();
            let s = sender.clone();
            let handle = tokio::spawn(async move {
                Self::execute_task(t, s).await;
            });
            self.task_handles.lock().unwrap().push(handle);
        }

        loop {
            let mut next_runs: Vec<(chrono::DateTime<Local>, Arc<Task>)> = vec![];
            for task in &self.tasks {
                let schedule = task.schedule();
                if let Some(next) = schedule.upcoming(Local).next() {
                    next_runs.push((next.with_timezone(&Local), task.clone()));
                }
            }

            if next_runs.is_empty() {
                break;
            }

            next_runs.sort_by_key(|(time, _)| *time); // 按时间升序排序
            // 遍历所有已排序的任务
            for (next_time, task) in next_runs {
                let duration = (next_time - Local::now())
                    .to_std()
                    .unwrap_or(Duration::from_secs(0)); // 计算任务等待时间

                tokio::select! {
                    _ = sleep(duration) => {
                        // 执行任务
                        let t = task.clone();
                        let s = sender.clone();
                        tokio::spawn(async move {
                            Self::execute_task(t, s).await;
                        });
                    }
                    _ = self.shutdown.notified() => {
                        // 收到停止通知，退出调度
                        warn!("调度器已收到停止通知");
                        break;
                    }
                }
            }
        }
    }

    async fn execute_task(task: Arc<Task>, sender: mpsc::Sender<TaskResult>) {


        for attempt in 0..=task.retry_times {
            match task.action.run().await {
                Ok(resp) => {
                    // 如果需要可以在这里处理 _resp（ApiResponse<AniItemResult>）
                    info!("任务 [{}] 执行成功", task.name);
                    // 发送任务结果到通道
                    let result = TaskResult {
                        result: Some(resp.data.unwrap_or_default()),
                    };
                    let _ = sender.send(result).await;
                    break;
                }
                Err(e) => {
                    info!(
                        "任务 [{}] 执行失败: {}, 重试 {}/{}",
                        task.name, e, attempt, task.retry_times
                    );
                    if attempt < task.retry_times {
                        // 重试间隔
                        sleep(Duration::from_secs(5)).await;
                    }
                }
            }
        }
    }
}



#[cfg(test)]
mod tests {
    use super::*;
    use crate::tasks::commands::{build_cmd_map, CmdFn};
    // scheduler 模块的内容
    use crate::tasks::task::{build_tasks_from_meta, TaskMeta};
    use std::collections::HashMap;
    use tokio::sync::mpsc;

    #[tokio::test]
    async fn test_scheduler_with_meta_to_task() {
        // 1. 构造 TaskMeta 列表（通常由解析配置得到）
        let metas = vec![
            TaskMeta {
                name: "任务A".into(),
                cmd: "fetch_agedm_ani_data".into(),
                arg: "https://example.com/a".into(),
                cron_expr: "0/10 * * * * * *".into(), // 每10s（视 cron crate 语法）
                retry_times: 1,
            },
            TaskMeta {
                name: "任务B".into(),
                cmd: "unknown_cmd".into(), // 故意一个未注册的 cmd，测试 fallback
                arg: "https://example.com/b".into(),
                cron_expr: "0/15 * * * * * *".into(),
                retry_times: 0,
            },
        ];

        // 2. 构建 cmd_map（用 mock）
        let cmd_map: HashMap<String, CmdFn> = build_cmd_map();

        // 如果你还有真实函数，可像上面那样插入

        // 3. 从 meta -> task
        let tasks = build_tasks_from_meta(&metas, &cmd_map);

        // 4. 创建调度器并运行（复用你现有的 Scheduler）
        let scheduler = Scheduler::new(tasks);
        let (tx, mut rx) = mpsc::channel(100);

        // 启动调度器
        let scheduler_clone = scheduler.clone();
        tokio::spawn(async move {
            scheduler_clone.run(tx).await;
        });

        // 接收并打印 TaskResult
        tokio::spawn(async move {
            while let Some(res) = rx.recv().await {
                println!("收到 TaskResult: {:?}", res);
            }
        });

        // 等待 25 秒观察若干次触发
        sleep(Duration::from_secs(25)).await;

    }
}