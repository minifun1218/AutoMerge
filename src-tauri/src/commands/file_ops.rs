use crate::models::{ScannedFile, CategoryStats, OrganizeTask};
use crate::services::file_scanner;
use crate::services::file_classifier;
use crate::services::file_organizer;

/// Scan a directory and return file listing
#[tauri::command]
pub async fn scan_directory(
    directory: String,
    recursive: bool,
    max_depth: Option<usize>,
) -> Result<Vec<ScannedFile>, String> {
    file_scanner::scan_directory(&directory, recursive, max_depth)
}

/// Get file classification statistics
#[tauri::command]
pub async fn get_file_stats(files: Vec<ScannedFile>) -> Result<Vec<CategoryStats>, String> {
    Ok(file_classifier::compute_stats(&files))
}

/// Read file content for AI analysis
#[tauri::command]
pub async fn read_file_content(file_path: String, max_size: Option<usize>) -> Result<String, String> {
    let max = max_size.unwrap_or(10240); // Default 10KB
    file_scanner::read_file_content(&file_path, max)
}

/// Organize files (move/copy/preview)
#[tauri::command]
pub async fn organize_files(
    mut tasks: Vec<OrganizeTask>,
    mode: String,
) -> Result<Vec<OrganizeTask>, String> {
    match mode.as_str() {
        "preview" => Ok(file_organizer::preview_organize(&tasks)),
        "copy" => Ok(file_organizer::organize_files(&mut tasks, true)),
        "move" => Ok(file_organizer::organize_files(&mut tasks, false)),
        _ => Err("Invalid mode. Use 'move', 'copy', or 'preview'.".to_string()),
    }
}

/// Get suggested target paths
#[tauri::command]
pub async fn suggest_organization(
    files: Vec<ScannedFile>,
    target_base: String,
) -> Result<Vec<(String, String)>, String> {
    Ok(file_classifier::suggest_organization(&files, &target_base))
}
