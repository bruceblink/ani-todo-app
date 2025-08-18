use std::sync::Arc;
use cron::Schedule;
use std::str::FromStr;

#[derive(Clone)]
pub struct Task {
    pub name: String,
    pub cron_expr: String,
    pub action: Arc<dyn Fn() -> Result<(), String> + Send + Sync>,
    pub retry_times: usize, // 失败重试次数
}

impl Task {
    pub fn new<N, F>(name: N, cron_expr: &str, action: F, retry_times: usize) -> Self
    where
        N: Into<String>,
        F: Fn() -> Result<(), String> + Send + Sync + 'static,
    {
        Self {
            name: name.into(),
            cron_expr: cron_expr.to_string(),
            action: Arc::new(action),
            retry_times,
        }
    }

    pub fn schedule(&self) -> Schedule {
        Schedule::from_str(&self.cron_expr).expect("Invalid cron expression")
    }
}
