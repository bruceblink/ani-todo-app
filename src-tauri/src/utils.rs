use chrono::{Datelike, Local, Weekday};

pub fn get_week_day_of_today() -> String{
    // 获取本地当前日期/时间
    let now = Local::now();

    // 取出 Weekday 枚举
    let today: Weekday = now.weekday();

    // 如果你只想要数字（0 = Mon, …, 6 = Sun）
    let num = today.number_from_monday() - 1;
    // 或者：从周日开始 0..6
    let num_sun = today.num_days_from_sunday();

    println!("Today is {:?} (from Monday = {}, from Sunday = {})", today, num, num_sun);

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



/// 从文本中提取第一个连续数字序列，解析为 i32，若没有则返回 None。
pub fn extract_number(text: &str) -> Option<i32> {
    use once_cell::sync::Lazy;
    use regex::Regex;

    static DIGIT_RE: Lazy<Regex> = Lazy::new(|| Regex::new(r"\d+").unwrap());
    DIGIT_RE.find(text)
        .and_then(|m| m.as_str().parse::<i32>().ok())
}

/// 清理文本的示例
pub fn clean_text(s: &str) -> String {
    // 这里可以去掉多余空白、HTML 实体等
    s.trim().to_string()
}


/// 封装常见的日期/时间格式
#[derive(Debug)]
pub struct DateFormats {
    pub iso_date:        String, // "2025-06-17"
    pub iso_date_dd:     String, // "2025_06_17"
    pub iso_date_ld:     String, // "2025/06/17"
    pub iso_datetime:    String, // "2025-06-17 10:23:45"
    pub chinese_date:    String, // "2025年06月17日"
    pub compact:         String, // "250617"
    pub weekday:         String, // "Tuesday"
    pub weekday_today_cn:String, // "星期三"
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_formats() {
        let df = "";
        // 这里只打印看看，实际测试可根据当前日期断言
        println!("{:#?}", df);
    }
}