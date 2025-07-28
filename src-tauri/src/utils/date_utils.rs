use chrono::{DateTime, Datelike, Local, TimeZone, Weekday, NaiveDate, Utc};

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

/// 将 Unix 时间戳（秒）转换为 "2025-07-18 00:00:00 +08:00" 格式的时间戳
pub fn unix_seconds_to_timestamp(t: i64) -> DateTime<Local> {
    let dt = Local.timestamp_opt(t, 0).unwrap();
    dt
}

/// 获取当前时间的 Unix 时间戳（秒）
pub fn get_unix_timestamp_millis_now() -> i64 {
    Local::now().timestamp_millis()
}

/// 将毫秒级时间戳转换为指定格式的本地时间字符串
///
/// # 参数
/// - ts: 毫秒级 Unix 时间戳
/// - fmt: chrono 支持的格式字符串
///
/// # 示例
/// ```
/// use app_lib::utils::date_utils::format_timestamp;
/// let s = format_timestamp(1620000000123, "%Y-%m-%d %H:%M:%S");
/// ```
pub fn format_timestamp(ts: i64, fmt: &str) -> String {
    Local.timestamp_millis_opt(ts)
        .single()
        .unwrap_or_else(|| Local.timestamp_millis_opt(0).unwrap())
        .format(fmt)
        .to_string()
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

use thiserror::Error;

#[derive(Debug, Error)]
pub enum DateParseError {
    #[error("failed to parse date: {0}")]
    ChronoParse(#[from] chrono::ParseError),
    #[error("invalid time components for date: {0}")]
    InvalidTime(String),
    #[error("ambiguous local time for date: {0}")]
    AmbiguousLocalTime(String),
}

/// 将 `YYYY/MM/DD` 格式的字符串，解析成 Unix 毫秒时间戳。
///
/// # 参数
/// - `s`：要解析的日期字符串，格式必须是 `%Y/%m/%d`
/// - `use_local`：如果 `true`，按本地时区；否则按 UTC 时区
///
/// # 返回
/// 成功时返回从 1970-01-01T00:00:00 起的毫秒数；失败返回 `DateParseError`。
pub fn parse_date_to_millis(
    s: &str,
    use_local: bool
) -> Result<i64, DateParseError> {
    // 1. 把字符串解析成 NaiveDate
    let date = NaiveDate::parse_from_str(s, "%Y/%m/%d")?;

    // 2. 拼接成午夜 NaiveDateTime（and_hms_opt 返回 Option）
    let dt_naive = date
        .and_hms_opt(0, 0, 0)
        .ok_or_else(|| DateParseError::InvalidTime(s.to_string()))?;

    // 3. 根据时区转换并获取毫秒
    let millis = if use_local {
        match Local.from_local_datetime(&dt_naive) {
            chrono::LocalResult::Single(dt_local) => dt_local.timestamp_millis(),
            _ => return Err(DateParseError::AmbiguousLocalTime(s.to_string())),
        }
    } else {
        let dt_utc: DateTime<Utc> = Utc.from_utc_datetime(&dt_naive);
        dt_utc.timestamp_millis()
    };

    Ok(millis)
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

    #[test]
    fn test_unix_seconds_to_timestamp() {
        let dt = get_unix_timestamp_millis_now();
        let formatted = format_timestamp(dt, "%Y-%m-%d %H:%M:%S");
        let now = Local::now();
        assert_eq!(formatted, now.format("%Y-%m-%d %H:%M:%S").to_string());
    }

    #[test]
    fn test_parse_utc() {
        let ms = parse_date_to_millis("2025/06/17", false).unwrap();
        assert_eq!(ms, 1750118400_i64 * 1000);
    }

    #[test]
    fn test_parse_local() {
        // 假设本地时区是 UTC+8
        let ms_local = parse_date_to_millis("2025/06/17", true).unwrap();
        // UTC+8 零点即 UTC 2025-06-16T16:00:00 -> 1750089600s * 1000
        assert_eq!(ms_local, 1750089600_i64 * 1000);
    }
}
