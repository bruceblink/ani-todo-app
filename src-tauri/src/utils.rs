pub mod date_utils;
pub mod http_client;

/// 从文本中提取第一个连续数字序列，解析为 i32，若没有则返回 None。
pub fn extract_number(text: &str) -> Option<i32> {
    use once_cell::sync::Lazy;
    use regex::Regex;

    static DIGIT_RE: Lazy<Regex> = Lazy::new(|| Regex::new(r"\d+").unwrap());
    DIGIT_RE
        .find(text)
        .and_then(|m| m.as_str().parse::<i32>().ok())
}

/// 清理文本的示例
pub fn clean_text(s: &str) -> String {
    // 这里可以去掉多余空白、HTML 实体等
    s.trim().to_string()
}
#[cfg(test)]
mod tests {
    #[test]
    fn test_formats() {
        let df = "";
        // 这里只打印看看，实际测试可根据当前日期断言
        println!("{:#?}", df);
    }
}
