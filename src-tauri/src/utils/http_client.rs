use reqwest::header::{HeaderMap, HeaderValue};
use reqwest::Client;

/// 构造带通用请求头的 Reqwest 客户端
/// 返回错误时，会转换为字符串
pub fn http_client() -> Result<Client, String> {
    let mut headers = HeaderMap::new();
    headers.insert("Accept", HeaderValue::from_static(
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7"
    ));
    // headers.insert("Accept-Encoding", HeaderValue::from_static("gzip, deflate, br, zstd"));
    headers.insert(
        "Accept-Language",
        HeaderValue::from_static("zh-CN,zh;q=0.9,en;q=0.8"),
    );
    headers.insert("Cache-Control", HeaderValue::from_static("no-cache"));
    headers.insert("Cookie", HeaderValue::from_static("cleanMode=0"));
    headers.insert("DNT", HeaderValue::from_static("1"));
    headers.insert("Pragma", HeaderValue::from_static("no-cache"));
    headers.insert("priority", HeaderValue::from_static("u=0, i"));
    headers.insert(
        "Sec-Ch-Ua",
        HeaderValue::from_static(
            "Not)A;Brand\";v=\"8\", \"Chromium\";v=\"138\", \"Google Chrome\";v=\"138\"",
        ),
    );
    headers.insert(
        "sec-ch-ua-platform",
        HeaderValue::from_static("\"Windows\""),
    );
    headers.insert("Sec-Fetch-Dest", HeaderValue::from_static("document"));
    headers.insert("Sec-Fetch-Mode", HeaderValue::from_static("navigate"));
    headers.insert("Sec-Fetch-Site", HeaderValue::from_static("none"));
    headers.insert("Sec-Fetch-User", HeaderValue::from_static("?1"));
    headers.insert("Upgrade-Insecure-Requests", HeaderValue::from_static("1"));
    headers.insert("User-Agent", HeaderValue::from_static(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36"
    ));

    Client::builder()
        .default_headers(headers)
        .build()
        .map_err(|e| e.to_string())
}
