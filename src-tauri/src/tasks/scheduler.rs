use crate::tasks::task::{Task, TaskResult};
use chrono::Local;
use log::{info, warn};
use std::sync::{Arc, Mutex};
use tokio::sync::{mpsc, Notify, Semaphore};
use tokio::time::{sleep, Duration};
use tokio::task::JoinHandle;

#[derive(Clone)]
pub struct Scheduler {
    pub tasks: Vec<Arc<Task>>,
    shutdown: Arc<Notify>,
    task_handles: Arc<Mutex<Vec<JoinHandle<()>>>>,
    semaphore: Arc<Semaphore>,  // 控制并发的信号量
}

impl Scheduler {
    pub fn new(tasks: Vec<Task>, max_concurrent_tasks: Option<usize>) -> Self {
        // 获取系统的 CPU 核心数
        let default_max_concurrent_tasks = num_cpus::get();

        // 使用传入的值，或者默认值
        let max_concurrent_tasks = max_concurrent_tasks.unwrap_or(default_max_concurrent_tasks);

        Self {
            tasks: tasks.into_iter().map(Arc::new).collect(),
            shutdown: Arc::new(Notify::new()),
            task_handles: Arc::new(Mutex::new(vec![])),
            semaphore: Arc::new(Semaphore::new(max_concurrent_tasks)),  // 限制并发任务数
        }
    }

    /// 运行任务调度器，将 TaskResult 通过 mpsc::Sender 发出
    pub async fn run(&self, sender: mpsc::Sender<TaskResult>) {
        // 启动时立即执行任务
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
                        // 获取信号量许可
                        let permit = self.semaphore.clone().acquire_owned().await.unwrap();
                        // 执行任务
                        let t = task.clone();
                        let s = sender.clone();
                        tokio::spawn(async move {
                            let _permit = permit; // 确保在任务执行期间保持许可有效
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
                    info!("任务 [{}] 执行成功", task.name);
                    let result = TaskResult {
                        name: task.name.clone(),
                        result: Some(resp.data.unwrap_or_default()),
                    };
                    let _ = sender.send(result).await;
                    break;
                }
                Err(e) => {
                    info!(
                        "任务 [{}] 执行失败: {}, 重试 {}/{}",
                        task.name, e, attempt + 1, task.retry_times
                    );
                    if attempt < task.retry_times {
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
    use crate::tasks::task::{build_tasks_from_meta, TaskMeta};
    use std::collections::HashMap;
    use tokio::sync::mpsc;

    #[tokio::test]
    async fn test_scheduler_with_meta_to_task() {
        let metas = vec![
            TaskMeta {
                name: "任务A".into(),
                cmd: "fetch_agedm_ani_data".into(),
                arg: "https://example.com/a".into(),
                cron_expr: "0/10 * * * * * *".into(), // 每10s
                retry_times: 1,
            },
            TaskMeta {
                name: "任务B".into(),
                cmd: "unknown_cmd".into(),
                arg: "https://example.com/b".into(),
                cron_expr: "0/15 * * * * * *".into(),
                retry_times: 0,
            },
        ];

        let cmd_map: HashMap<String, CmdFn> = build_cmd_map();
        let tasks = build_tasks_from_meta(&metas, &cmd_map);
        let scheduler = Scheduler::new(tasks, Some(2)); // 限制最大并发任务数为 2
        let (tx, mut rx) = mpsc::channel(100);

        let scheduler_clone = scheduler.clone();
        tokio::spawn(async move {
            scheduler_clone.run(tx).await;
        });

        tokio::spawn(async move {
            while let Some(res) = rx.recv().await {
                println!("收到 TaskResult: {:?}", res.name);
            }
        });

        // 等待 25 秒观察若干次触发
        sleep(Duration::from_secs(25)).await;
    }
}