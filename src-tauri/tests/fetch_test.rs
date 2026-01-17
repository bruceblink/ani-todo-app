use app_lib::command::platforms::agedm::fetch_agedm_ani_data;
use app_lib::command::platforms::bilibili::fetch_bilibili_ani_data;
use app_lib::command::platforms::iqiyi::fetch_iqiyi_ani_data;
use app_lib::command::platforms::mikanani::fetch_mikanani_ani_data;
use app_lib::command::platforms::tencent::fetch_qq_ani_data;
use app_lib::command::platforms::youku::fetch_youku_ani_data;

#[tokio::test]
async fn test_fetch_bilibili_ani_data() {
    let url = "https://api.bilibili.com/pgc/web/timeline?types=4&before=6&after=6".to_string();
    let res = fetch_bilibili_ani_data(url).await.unwrap();
    println!("{:?}", res);
}

#[tokio::test]
async fn test_iqiyi_ani_data() {
    let url = "https://mesh.if.iqiyi.com/portal/lw/v7/channel/cartoon".to_string();
    let res = fetch_iqiyi_ani_data(url).await.unwrap();
    println!("{:?}", res);
}

#[tokio::test]
async fn test_mikanani_ani_data() {
    let url = "https://mikanani.me".to_string();
    let res = fetch_mikanani_ani_data(url).await.unwrap();
    println!("{:?}", res);
}

#[tokio::test]
async fn test_qq_cartoon_data() {
    let url = "https://v.qq.com/channel/cartoon".to_string();
    let res = fetch_qq_ani_data(url).await.unwrap();
    println!("{:?}", res);
}

#[tokio::test]
async fn test_youku_cartoon_data() {
    let url = "https://www.youku.com/ku/webcomic".to_string();
    let res = fetch_youku_ani_data(url).await.unwrap();
    println!("{:?}", res);
}

#[tokio::test]
async fn test_agedm_data() {
    let url = "https://www.agedm.tv/update".to_string();
    let res = fetch_agedm_ani_data(url).await.unwrap();
    println!("{:?}", res);
}
