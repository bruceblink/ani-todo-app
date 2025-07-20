use chrono::{DateTime, Datelike, Local, TimeZone, Weekday};

pub fn get_week_day_of_today() -> String {
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

pub fn unix_seconds_to_timestamp(t: i64) -> DateTime<Local> {
    let dt = Local.timestamp_opt(t, 0).unwrap();
    dt
}

/// 将"2025-07-18 00:00:00 +08:00"格式的时间戳转换成 "2025-07-18" 格式的字符串
pub fn timestamp_to_iso_date(dt: DateTime<Local>) -> String {
    dt.format("%Y-%m-%d").to_string()
}

/// 将"2025-07-18 00:00:00 +08:00"格式的时间戳转换成 "2025/07/18" 格式的字符串
pub fn timestamp_to_iso_date_ld(dt: DateTime<Local>) -> String {
    dt.format("%Y/%m/%d").to_string()
}

/// 将"2025-07-18 00:00:00 +08:00"格式的时间戳转换成 "2025_07_18" 格式的字符串
pub fn timestamp_to_iso_date_dd(dt: DateTime<Local>) -> String {
    dt.format("%Y_%m_%d").to_string()
}

/// 将"2025-07-18 00:00:00 +08:00"格式的时间戳转换成 "2025-07-18 00:00:00" 格式的字符串
pub fn timestamp_to_iso_datetime(dt: DateTime<Local>) -> String {
    dt.format("%Y-%m-%d %H:%M:%S").to_string()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_format_unix_timestamp() {
        let dt = unix_seconds_to_timestamp(1752768000);
        assert_eq!(dt.to_string(), "2025-07-18 00:00:00 +08:00");
    }

    #[test]
    fn test_timestamp_to_iso_date() {
        let dt = unix_seconds_to_timestamp(1752768000);
        let d = timestamp_to_iso_date(dt);
        assert_eq!(d, "2025-07-18")
    }

    #[test]
    fn test_timestamp_to_iso_date_ld() {
        let dt = unix_seconds_to_timestamp(1752768000);
        let d = timestamp_to_iso_date_ld(dt);
        assert_eq!(d, "2025/07/18")
    }
}
