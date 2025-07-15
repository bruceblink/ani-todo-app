use chrono::{Datelike, Local, Weekday};

pub fn get_week_day_of_today() -> String{
    // 获取本地当前日期/时间
    let now = Local::now();

    // 取出 Weekday 枚举
    let today: Weekday = now.weekday();

    // 如果你只想要数字（0 = Mon, …, 6 = Sun）
    let _num = today.number_from_monday() - 1;
    // 或者：从周日开始 0..6
    let _num_sun = today.num_days_from_sunday();

    // 如果想要中文输出，可以自己 match
    let cn = match today {
        Weekday::Mon => "星期一",
        Weekday::Tue => "星期二",
        Weekday::Wed => "星期三",
        Weekday::Thu => "星期四",
        Weekday::Fri => "星期五",
        Weekday::Sat => "星期六",
        Weekday::Sun => "星期日",
    };
    cn.to_string()
}

/// 获取当前时间的"2025-06-17"
pub fn today_iso_date() -> String {
    Local::now().format("%Y-%m-%d").to_string()
}

/// 获取当前时间的"2025_06_17"
pub fn today_iso_date_dd() -> String {
    Local::now().format("%Y_%m_%d").to_string()
}

/// 获取当前时间的"2025/06/17"
pub fn today_iso_date_ld() -> String {
    Local::now().format("%Y/%m/%d").to_string()
}

/// 获取当前时间的"2025-06-17 10:23:45"
pub fn today_iso_datetime() -> String {
    Local::now().format("%Y-%m-%d %H:%M:%S").to_string()
}

/// 返回 "YYYY年MM月DD日"，例如 "2025年06月17日"
pub fn today_chinese_date() -> String {
    Local::now().format("%Y年%m月%d日").to_string()
}

/// 返回 "yyMMdd"，例如 "250617"
pub fn today_compact_date() -> String {
    Local::now().format("%y%m%d").to_string()
}