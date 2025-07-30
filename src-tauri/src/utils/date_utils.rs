use chrono::{DateTime, Datelike, Local, NaiveDate, TimeZone, Utc};
use once_cell::sync::Lazy;
use std::sync::RwLock;
use thiserror::Error;

/// 常用日期格式枚举
pub enum DateFormat {
    Iso,       // "%Y-%m-%d"
    Slash,     // "%Y/%m/%d"
    Underline, // "%Y_%m_%d"
    Chinese,   // "%Y年%m月%d日"
    Compact,   // "%y%m%d"
}

fn get_format_str(fmt: DateFormat) -> &'static str {
    match fmt {
        DateFormat::Iso => "%Y-%m-%d",
        DateFormat::Slash => "%Y/%m/%d",
        DateFormat::Underline => "%Y_%m_%d",
        DateFormat::Chinese => "%Y年%m月%d日",
        DateFormat::Compact => "%y%m%d",
    }
}

/// 格式化当前时间为指定格式
pub fn format_now(fmt: DateFormat) -> String {
    Local::now().format(get_format_str(fmt)).to_string()
}

/// 将时间戳（秒）转为字符串
pub fn timestamp_to_date_string(t: i64, fmt: DateFormat) -> String {
    let dt = unix_seconds_to_timestamp(t);
    dt.format(get_format_str(fmt)).to_string()
}

/// 将时间戳(毫秒)格式化为字符串 自定义形式
pub fn format_timestamp_millis2(ts: i64, fmt: &str) -> String {
    Local.timestamp_millis_opt(ts)
        .single()
        .unwrap_or_else(|| Local.timestamp_millis_opt(0).unwrap())
        .format(fmt)
        .to_string()
}


/// 将时间戳(毫秒)格式化为字符串 : "2025/07/18"形式
pub fn format_timestamp_millis(ts: i64) -> String {
    Local.timestamp_millis_opt(ts)
        .single()
        .unwrap_or_else(|| Local.timestamp_millis_opt(0).unwrap())
        .format("%Y/%m/%d")
        .to_string()
}

/// 缓存今天的日期（Slash 格式 ：2025/05/25），避免频繁格式化
static TODAY_SLASH_CACHE: Lazy<RwLock<String>> = Lazy::new(|| {
    let today = Local::now().format("%Y/%m/%d").to_string();
    RwLock::new(today)
});

/// 获取每天自动更新的“今天”字符串（格式：2025/07/28）
///
/// 多线程安全，读性能较好，跨天自动刷新缓存。
pub fn get_today_slash() -> String {
    let now_str = format_now(DateFormat::Slash).to_string();

    {
        let read_cache = TODAY_SLASH_CACHE.read().unwrap();
        if *read_cache == now_str {
            // 缓存是最新，直接返回克隆
            return read_cache.clone();
        }
        // 读锁范围结束，准备升级为写锁
    }

    // 需要刷新缓存，写锁更新
    let mut write_cache = TODAY_SLASH_CACHE.write().unwrap();
    if *write_cache != now_str {
        *write_cache = now_str.clone();
    }
    write_cache.clone()
}

/// 当前时间戳（毫秒）
pub fn get_unix_timestamp_millis_now() -> i64 {
    Local::now().timestamp_millis()
}

/// 将秒时间戳转换为本地时间对象
pub fn unix_seconds_to_timestamp(t: i64) -> DateTime<Local> {
    Local.timestamp_opt(t, 0).unwrap()
}


/// 星期信息结构
pub struct WeekdayInfo {
    pub name_cn: &'static str,
    pub num_from_mon: u32,
    pub num_from_sun: u32,
}

/// 获取今天是星期几（中文名 + 索引）
pub fn get_today_weekday() -> WeekdayInfo {
    let today = Local::now().weekday();

    // 按照 Monday=0 排列的中文星期名称数组
    const WEEKDAY_CN: [&str; 7] = [
        "星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日",
    ];

    let num_from_mon = today.number_from_monday() - 1;
    let name_cn = WEEKDAY_CN[num_from_mon as usize];
    let num_from_sun = today.num_days_from_sunday();

    WeekdayInfo {
        name_cn,
        num_from_mon,
        num_from_sun,
    }
}

/// 错误类型：日期解析
#[derive(Debug, Error)]
pub enum DateParseError {
    #[error("failed to parse date: {0}")]
    ChronoParse(#[from] chrono::ParseError),
    #[error("invalid time components for date: {0}")]
    InvalidTime(String),
    #[error("ambiguous local time for date: {0}")]
    AmbiguousLocalTime(String),
}

/// 将 `YYYY/MM/DD` 格式字符串解析为 Unix 毫秒时间戳
pub fn parse_date_to_millis(s: &str, use_local: bool) -> Result<i64, DateParseError> {
    let date = NaiveDate::parse_from_str(s, "%Y/%m/%d")?;
    let dt_naive = date
        .and_hms_opt(0, 0, 0)
        .ok_or_else(|| DateParseError::InvalidTime(s.to_string()))?;

    let millis = if use_local {
        match Local.from_local_datetime(&dt_naive) {
            chrono::LocalResult::Single(dt_local) => dt_local.timestamp_millis(),
            _ => return Err(DateParseError::AmbiguousLocalTime(s.to_string())),
        }
    } else {
        let dt_utc = Utc.from_utc_datetime(&dt_naive); // ✅ 新写法
        dt_utc.timestamp_millis()
    };

    Ok(millis)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_format_timestamp() {
        let ts = 1752768000000; // 2025-07-18 00:00:00 +08:00
        let formatted = format_timestamp_millis2(ts, "%Y-%m-%d %H:%M:%S");
        assert_eq!(formatted, "2025-07-18 00:00:00");
    }

    #[test]
    fn test_parse_date_to_millis_utc() {
        let ts = parse_date_to_millis("2025/06/17", false).unwrap();
        assert_eq!(ts, 1750118400000);
    }

    #[test]
    fn test_parse_date_to_millis_local() {
        let ts = parse_date_to_millis("2025/06/17", true).unwrap();
        assert_eq!(ts, 1750089600000); // UTC+8
    }

    #[test]
    fn test_today_format() {
        let s = format_now(DateFormat::Chinese);
        assert!(s.contains("年") && s.contains("月"));
    }

    #[test]
    fn test_weekday() {
        let w = get_today_weekday();
        assert!(w.name_cn.starts_with("星期"));
    }

    #[test]
    fn test_timestamp_to_date_string() {
        let s = timestamp_to_date_string(1752768000, DateFormat::Slash);
        assert_eq!(s, "2025/07/18");
    }

    #[test]
    fn test_get_today_slash() {
        let today = get_today_slash();
        assert!(today.contains('/'));
        assert_eq!(today.len(), 10); // 格式为 YYYY/MM/DD
        println!("{}", today);

        let ts = format_timestamp_millis(1753718400000);
        assert_eq!(ts, "2025/07/29");
    }
}
