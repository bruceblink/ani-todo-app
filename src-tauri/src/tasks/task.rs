use std::sync::Arc;
use std::str::FromStr;
use chrono::{DateTime, Local};
use std::collections::HashMap;
use std::future::Future;
use std::pin::Pin;
use async_trait::async_trait;
use cron::Schedule;
use crate::command::ApiResponse;
use crate::platforms::AniItemResult;

/// -----------------
/// 配置层 TaskMeta
/// -----------------
#[derive(Clone, Debug)]
pub struct TaskMeta {
    pub name: String,
    pub cmd: String,
    pub arg: String,
    pub cron_expr: String,
    pub retry_times: u8,
}

impl TaskMeta {
    pub fn schedule(&self) -> Schedule {
        Schedule::from_str(&self.cron_expr).expect("Invalid cron expression")
    }
}

/// -----------------
/// 异步任务 trait
/// -----------------
#[async_trait]
pub trait TaskAction: Send + Sync {
    async fn run(&self) -> Result<ApiResponse<AniItemResult>, String>;
}

#[async_trait]
impl<F, Fut> TaskAction for F
where
    F: Fn() -> Fut + Send + Sync + 'static,
    Fut: std::future::Future<Output = Result<ApiResponse<AniItemResult>, String>> + Send,
{
    async fn run(&self) -> Result<ApiResponse<AniItemResult>, String> {
        self().await
    }
}

/// -----------------
/// 运行时 Task
/// -----------------
#[derive(Clone)]
pub struct Task {
    pub name: String,
    pub cron_expr: String,
    pub action: Arc<dyn TaskAction>,
    pub retry_times: u8,
}

impl Task {
    pub fn new<F, Fut>(meta: &TaskMeta, action: F) -> Self
    where
        F: Fn() -> Fut + Send + Sync + 'static,
        Fut: Future<Output = Result<ApiResponse<AniItemResult>, String>> + Send + 'static,
    {
        Self {
            name: meta.name.clone(),
            cron_expr: meta.cron_expr.clone(),
            action: Arc::new(action),
            retry_times: meta.retry_times,
        }
    }

    pub fn schedule(&self) -> Schedule {
        Schedule::from_str(&self.cron_expr).expect("Invalid cron expression")
    }
}

/// CmdFn 类型（和你之前约定一致）
pub type CmdFn = Arc<
    dyn Fn(String) -> Pin<Box<dyn Future<Output = Result<ApiResponse<AniItemResult>, String>> + Send>>
    + Send
    + Sync,
>;

/// 将 TaskMeta 列表和命令表合并，生成运行时 Task 列表
pub fn build_tasks_from_meta(metas: &[TaskMeta], cmd_map: &HashMap<String, CmdFn>) -> Vec<Task> {
    let mut tasks = Vec::new();

    for meta in metas {
        // 先克隆出 TaskMeta 中将要使用到的字段（避免在闭包里借用 meta）
        let name = meta.name.clone();
        let cmd = meta.cmd.clone();
        let arg = meta.arg.clone();
        let cron_expr = meta.cron_expr.clone();
        let retry_times = meta.retry_times;

        if let Some(cmd_fn) = cmd_map.get(&cmd) {
            // 找到命令：把 cmd_fn 和 arg 克隆到闭包里
            let cmd_fn = cmd_fn.clone();
            let arg_for_closure = arg.clone();

            // 构造 Task 使用原始 meta（Task::new 会 clone 需要的元数据）
            // 注意：这里传入 meta（引用）给 Task::new，但闭包不再捕获 meta，
            // 闭包只捕获 cmd_fn 和 arg_for_closure（它们是 owned / Arc 克隆的）
            let task = Task::new(
                &TaskMeta {
                    name: name.clone(),
                    cmd: cmd.clone(),
                    arg: arg.clone(),
                    cron_expr: cron_expr.clone(),
                    retry_times,
                },
                move || {
                    let cmd_fn = cmd_fn.clone();
                    let arg = arg_for_closure.clone();
                    async move {
                        // 直接调用命令函数并返回它的结果
                        cmd_fn(arg).await
                    }
                },
            );

            tasks.push(task);
        } else {
            // 未找到命令：构造一个立即返回 Err 的 action（closure 只捕获字符串，不借用 meta）
            let missing_cmd = cmd.clone();
            let task = Task::new(
                &TaskMeta {
                    name: name.clone(),
                    cmd: cmd.clone(),
                    arg: arg.clone(),
                    cron_expr: cron_expr.clone(),
                    retry_times,
                },
                move || {
                    let missing_cmd = missing_cmd.clone();
                    let name = name.clone();
                    async move {
                        Err(format!("cmd '{}' not found for task '{}'", missing_cmd, name))
                    }
                },
            );

            tasks.push(task);
        }
    }

    tasks
}

#[derive(Clone, Debug)]
pub struct TaskResult {
    pub name: String,
    pub success: bool,
    pub error: Option<String>,
    pub timestamp: DateTime<Local>,
}