use chrono::{Local};
use cron::Schedule;
use std::str::FromStr;

pub fn run_cron_task() {
    // 获取当前的系统时间的时区
    let now = Local::now().timezone();
    //            每天从 8 点到 23 点的每个小时的第 30 分钟执行
    //                     sec  min   hour   day of month    month   day of week   year
    let expression = "0 30 8,9,10,11,12,16,17,18,19,20,21,22,23 * * * *";
    // 定义 Cron 表达式
    let schedule = Schedule::from_str(expression).unwrap(); 

    // 获取任务执行的时间
    for datetime in schedule.upcoming(now).take(10) {
        println!("任务触发: {:?}", datetime);
    }
}

#[cfg(test)]
mod tests {
    use crate::tasks::cron_task::run_cron_task;

    #[test]
    fn test_run_cron_task() {
        run_cron_task()
    }

}
