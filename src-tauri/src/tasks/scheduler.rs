use tokio::time::{sleep, Duration};
use tokio::sync::{Notify, mpsc};
use std::sync::Arc;
use chrono::{DateTime, Local};
use log::info;
use crate::tasks::task::{Task, TaskResult};

#[derive(Clone)]
pub struct Scheduler {
    pub tasks: Vec<Arc<Task>>,
    pub shutdown: Arc<Notify>, // 用于取消任务
}

impl Scheduler {
    pub fn new(tasks: Vec<Task>) -> Self {
        let tasks = tasks.into_iter().map(Arc::new).collect();
        Self {
            tasks,
            shutdown: Arc::new(Notify::new()),
        }
    }

    /// 运行任务调度器，将 TaskResult 通过 mpsc::Sender 发出
    pub async fn run(&self, sender: mpsc::Sender<TaskResult>) {
        // 1. 启动时立即执行
        for task in &self.tasks {
            self.execute_task(task, &sender).await;
        }

        // 2. Cron 循环
        loop {
            let mut next_runs: Vec<(DateTime<Local>, Arc<Task>)> = vec![];

            for task in &self.tasks {
                let schedule = task.schedule();
                if let Some(next) = schedule.upcoming(Local).next() {
                    next_runs.push((next.with_timezone(&Local), task.clone()));
                }
            }

            if next_runs.is_empty() {
                break;
            }

            if let Some((next_time, task)) = next_runs.iter().min_by_key(|(time, _)| *time) {
                let duration = (*next_time - Local::now())
                    .to_std()
                    .unwrap_or(Duration::from_secs(0));

                tokio::select! {
                    _ = sleep(duration) => {
                        self.execute_task(task, &sender).await;
                    }
                    _ = self.shutdown.notified() => {
                        println!("调度器已取消");
                        break;
                    }
                }
            }
        }
    }

    async fn execute_task(&self, task: &Task, sender: &mpsc::Sender<TaskResult>) {
        let mut error: Option<String> = None;

        // task.retry_times 是 u8，所以这里显式用 u8 范围
        for attempt in 0u8..=task.retry_times {
            // 调用 TaskAction 的异步方法 run()
            match task.action.run().await {
                Ok(resp) => {
                    // 如果需要可以在这里处理 _resp（ApiResponse<AniItemResult>）
                    info!("任务 [{}] 执行成功", task.name);
                    let success = true;

                    // 发送任务结果到通道
                    let result = TaskResult {
                        name: task.name.clone(),
                        result: Some(resp.data.unwrap_or_default()),
                        success,
                        error,
                        timestamp: Local::now(),
                    };
                    let _ = sender.send(result).await;
                    break;
                }
                Err(e) => {
                    info!(
                        "任务 [{}] 执行失败: {}, 重试 {}/{}",
                        task.name, e, attempt, task.retry_times
                    );
                    error = Some(e);
                    if attempt < task.retry_times {
                        // 重试间隔
                        sleep(Duration::from_secs(5)).await;
                    }
                }
            }
        }
    }

    pub fn shutdown(&self) {
        self.shutdown.notify_waiters();
    }
}



#[cfg(test)]
mod tests {
    use super::*;
    use crate::command::ApiResponse;
    use crate::platforms::AniItemResult;
    use crate::tasks::commands::{build_cmd_map, CmdFn};
    // scheduler 模块的内容
    use crate::tasks::task::{build_tasks_from_meta, TaskMeta};
    use std::collections::HashMap;
    use tokio::sync::mpsc;

    // --- Mock 命令：用于测试（替代真实的 fetch_agedm_ani_data） ---
    async fn mock_success(url: String) -> Result<ApiResponse<AniItemResult>, String> {
        println!("mock_success called with url={}", url);
        // 假设你不能构造 ApiResponse 这里用 Err 也可；如果能构造则返回 Ok(...)
        Err("mock returning Err to simplify test".to_string())
    }

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

        // 取消调度器
        scheduler.shutdown();
    }
}