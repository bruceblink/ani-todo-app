use app_lib::platforms::bilibili::fetch_bilibili_ani_data;
use app_lib::platforms::iqiyi::fetch_iqiyi_ani_data;
use app_lib::platforms::mikanani::fetch_mikanani_ani_data;
use app_lib::platforms::tencent::fetch_qq_ani_data;

#[tokio::test]
async fn test_fetch_bilibili_ani_data() {
    let url = "https://api.bilibili.com/pgc/web/timeline?types=4&before=6&after=6".to_string();
    let res = fetch_bilibili_ani_data(url).await.unwrap();
    println!("{:?}", res.to_string());
}

#[tokio::test]
async fn test_iqiyi_ani_data() {
    let url = "https://mesh.if.iqiyi.com/portal/lw/v7/channel/cartoon".to_string();
    let res = fetch_iqiyi_ani_data(url).await.unwrap();
    println!("{:?}", res.to_string());
}

#[tokio::test]
async fn test_mikanani_ani_data() {
    let url = "https://mikanani.me".to_string();
    let res = fetch_mikanani_ani_data(url).await.unwrap();
    println!("{:?}", res.to_string());
}

#[tokio::test]
async fn test_qq_cartoon_data() {
    let url = "https://v.qq.com/channel/cartoon".to_string();
    let res = fetch_qq_ani_data(url).await.unwrap();
    println!("{:?}", res.to_string());
}