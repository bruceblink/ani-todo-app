pub mod utils;
pub mod platforms;

use crate::platforms::{fetch_bilibili_ani_data, fetch_bilibili_image};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![fetch_bilibili_image, fetch_bilibili_ani_data])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}