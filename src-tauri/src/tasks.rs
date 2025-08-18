use crate::configuration::load_configuration;
use crate::tasks::task::TaskMeta;

mod cron_task;
pub mod task;
pub(crate) mod scheduler;
pub mod commands;

///从配置文件加载定时作业的配置数据
pub fn load_timer_tasks_config() -> Vec<TaskMeta>{
    let configuration = load_configuration().expect("Failed to read configuration.");
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_get_task_metas() {
        let task_metas = load_timer_tasks_config();
        assert_eq!(task_metas.len(), 6);
        assert_eq!(task_metas[0].name, "哔哩哔哩国创");
        assert_eq!(task_metas[0].cmd, "fetch_bilibili_ani_data");
        assert_eq!(task_metas[0].cron_expr, "0 30 8,9,10,11,12,16,17,18,19,20,21,22,23 * * * *");
        assert_eq!(task_metas[0].arg, "https://api.bilibili.com/pgc/web/timeline?types=4&before=6&after=6");
    }
}