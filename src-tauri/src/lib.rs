pub mod commands;
pub mod models;
pub mod services;

use commands::file_ops;
use commands::ai_ops;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            // File operations
            file_ops::scan_directory,
            file_ops::get_file_stats,
            file_ops::read_file_content,
            file_ops::organize_files,
            file_ops::suggest_organization,
            // AI operations
            ai_ops::classify_file,
            ai_ops::check_ai_health,
            ai_ops::list_ai_models,
            ai_ops::batch_classify_files,
        ])
        .run(tauri::generate_context!())
        .expect("error while running AutoMerge");
}
