use serde::Deserialize;
use std::collections::HashMap;

#[derive(Debug, Deserialize)]
pub struct DataSource {
    name: String,
    url: String,
    cmd: String,
}

// 不再需要 DataSourceCategory 结构体
#[derive(Debug, Deserialize)]
pub struct AppConfig {
    datasource: HashMap<String, Vec<DataSource>>, // 直接映射到 Vec<DataSource>
}

// 读取配置文件
pub fn load_configuration() -> Result<AppConfig, config::ConfigError> {
    // 获取根目录路径
    let base_path = std::env::current_dir().expect("Failed to determine the current directory");
    // 读取配置文件目录
    let configuration_directory = base_path.join("configuration");
    let settings = config::Config::builder()
        .add_source(config::File::from(configuration_directory.join("config.yaml")))
        .add_source(config::Environment::with_prefix("APP").prefix_separator("_").separator("__"))
        .build()?;
    settings.try_deserialize::<AppConfig>()
}



#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_configuration_folder() {
        let base_path = std::env::current_dir().expect("Failed to determine the current directory");
        // "F:\Rust_Project\ani_todo_app\src-tauri"
        assert!(base_path.ends_with("src-tauri"));
    }

    #[test]
    fn test_configuration_content() {
        let configuration = load_configuration().expect("Failed to read configuration.");
        println!("{:?}", configuration);
        assert_eq!(configuration.datasource.len(), 2);

        let configuration = load_configuration().expect("Failed to read configuration.");
        println!("{:#?}", configuration);
        
        // 验证 anime 分类
        let anime_sources = configuration.datasource.get("anime").expect("Missing anime category");
        assert_eq!(anime_sources.len(), 6);
        assert_eq!(anime_sources[0].name, "哔哩哔哩国创");
        assert_eq!(anime_sources[0].url, "https://api.bilibili.com/pgc/web/timeline?types=4");
        assert_eq!(anime_sources[0].cmd, "bilibili_parser");

        // 验证 drama 分类
        let drama_sources = configuration.datasource.get("drama").expect("Missing drama category");
        assert_eq!(drama_sources.len(), 1);
        assert_eq!(drama_sources[0].name, "腾讯视频");
    }
}