use tokio::time::{sleep, Duration};
use tokio::sync::Notify;
use std::sync::Arc;
use chrono::{DateTime, Local};
use crate::tasks::task::Task;

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

    pub async fn run(&self) {
        // ---------- 1. 应用启动立即执行 ----------
        for task in &self.tasks {
            self.execute_task(task).await;
        }

        // ---------- 2. Cron 循环 ----------
        loop {
            //let now = Local::now().timezone();
            let mut next_runs: Vec<(DateTime<Local>, Arc<Task>)> = vec![];

            for task in &self.tasks {
                let schedule = task.schedule();
                if let Some(next) = schedule.upcoming(Local).next() {
                    next_runs.push((next.with_timezone(&Local), task.clone()));
                }
            }

            if next_runs.is_empty() {
                break; // 没有任务
            }

            // 找出最早执行时间
            if let Some((next_time, task)) = next_runs.iter().min_by_key(|(time, _)| *time) {
                let duration = (*next_time - Local::now())
                    .to_std()
                    .unwrap_or(Duration::from_secs(0));

                // 等待或取消
                tokio::select! {
                    _ = sleep(duration) => {
                        self.execute_task(task).await;
                    }
                    _ = self.shutdown.notified() => {
                        println!("调度器已取消");
                        break;
                    }
                }
            }
        }
    }

    async fn execute_task(&self, task: &Task) {
        for attempt in 0..=task.retry_times {
            match (task.action)() {
                Ok(_) => {
                    println!("任务 [{}] 执行成功", task.name);
                    break;
                }
                Err(e) => {
                    println!("任务 [{}] 执行失败: {}, 重试 {}/{}", task.name, e, attempt, task.retry_times);
                    if attempt < task.retry_times {
                        sleep(Duration::from_secs(5)).await; // 重试间隔
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
    use std::time::Duration;
    use crate::tasks::scheduler::Scheduler;
    use crate::tasks::task::Task;

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

        tokio::spawn({
            let scheduler = scheduler.clone();
            async move {
                scheduler.run().await;
            }
        });

        // 模拟 1 分钟后取消任务
        tokio::time::sleep(Duration::from_secs(60)).await;
        scheduler.clone().shutdown();
    }
}