use tokio::time::{sleep, Duration};
use tokio::sync::{Notify, mpsc};
use std::sync::Arc;
use chrono::{DateTime, Local};
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
        let mut success = false;
        let mut error: Option<String> = None;

        for attempt in 0..=task.retry_times {
            match (task.action)() {
                Ok(_) => {
                    println!("任务 [{}] 执行成功", task.name);
                    success = true;
                    break;
                }
                Err(e) => {
                    println!("任务 [{}] 执行失败: {}, 重试 {}/{}", task.name, e, attempt, task.retry_times);
                    error = Some(e);
                    if attempt < task.retry_times {
                        sleep(Duration::from_secs(5)).await;
                    }
                }
            }
        }

        // 发送任务结果到通道
        let result = TaskResult {
            name: task.name.clone(),
            success,
            error,
            timestamp: Local::now(),
        };
        let _ = sender.send(result).await;
    }

    pub fn shutdown(&self) {
        self.shutdown.notify_waiters();
    }
}



#[cfg(test)]
mod tests {
    use crate::tasks::scheduler::Scheduler;
    use crate::tasks::task::Task;
    use tokio::sync::mpsc;

    #[tokio::test]
    async fn test_scheduler() {
        let tasks = vec![
            Task::new("任务A", "5 * * * * * *", || {
                println!("执行任务A");
                Ok(())
            }, 3),
            Task::new("任务B", "10 * * * * * *", || {
                println!("执行任务B");
                Err("模拟失败".to_string())
            }, 2),
        ];

        let scheduler = Scheduler::new(tasks);
        let (tx, mut rx) = mpsc::channel(100);

        let scheduler_clone = scheduler.clone();
        tokio::spawn(async move {
            scheduler_clone.run(tx).await;
        });

        // 异步接收任务结果
        tokio::spawn(async move {
            while let Some(result) = rx.recv().await {
                println!("实时结果: {:?}", result);
            }
        });

        // 模拟 1 分钟后取消任务
        tokio::time::sleep(std::time::Duration::from_secs(60)).await;
        //scheduler.shutdown();
    }
}