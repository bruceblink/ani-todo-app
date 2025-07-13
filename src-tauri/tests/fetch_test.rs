use app_lib::platforms::bilibili::fetch_bilibili_ani_data;

#[tokio::test]
async fn test_fetch_bilibili_ani_data() {
    let url = "https://api.bilibili.com/pgc/web/timeline?types=4&before=6&after=6".to_string();
    let res = fetch_bilibili_ani_data(url).await.unwrap();
    assert_eq!(res.get("code").unwrap().as_i64().unwrap(), 0);
    assert_eq!(res.get("message").unwrap().as_str(), Some("success"));
}