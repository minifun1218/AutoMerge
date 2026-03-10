use std::path::Path;
use walkdir::WalkDir;
use crate::models::{ScannedFile, FileCategory};
use uuid::Uuid;

/// Scan a directory and collect file information
pub fn scan_directory(dir: &str, recursive: bool, max_depth: Option<usize>) -> Result<Vec<ScannedFile>, String> {
    let path = Path::new(dir);
    if !path.exists() {
        return Err(format!("Directory does not exist: {}", dir));
    }
    if !path.is_dir() {
        return Err(format!("Path is not a directory: {}", dir));
    }

    let depth = if recursive {
        max_depth.unwrap_or(usize::MAX)
    } else {
        1
    };

    let mut files: Vec<ScannedFile> = Vec::new();

    let walker = WalkDir::new(dir)
        .max_depth(depth)
        .follow_links(false)
        .into_iter()
        .filter_map(|e| e.ok());

    for entry in walker {
        let entry_path = entry.path();

        // Skip the root directory itself
        if entry_path == path {
            continue;
        }

        let is_dir = entry_path.is_dir();
        let name = entry_path
            .file_name()
            .map(|n| n.to_string_lossy().to_string())
            .unwrap_or_default();

        // Skip hidden files/dirs
        if name.starts_with('.') {
            continue;
        }

        let extension = if is_dir {
            String::new()
        } else {
            entry_path
                .extension()
                .map(|e| e.to_string_lossy().to_string())
                .unwrap_or_default()
        };

        let category = if is_dir {
            FileCategory::Other
        } else {
            FileCategory::from_extension(&extension)
        };

        let metadata = entry_path.metadata().ok();
        let size = metadata.as_ref().map(|m| m.len()).unwrap_or(0);
        let modified = metadata
            .and_then(|m| m.modified().ok())
            .map(|t| {
                let datetime: chrono::DateTime<chrono::Utc> = t.into();
                datetime.format("%Y-%m-%d %H:%M:%S").to_string()
            });

        files.push(ScannedFile {
            id: Uuid::new_v4().to_string(),
            name,
            path: entry_path.to_string_lossy().to_string(),
            extension,
            size,
            modified,
            category,
            ai_category: None,
            ai_summary: None,
            is_dir,
        });
    }

    // Sort: folders first, then by name
    files.sort_by(|a, b| {
        b.is_dir.cmp(&a.is_dir).then(a.name.to_lowercase().cmp(&b.name.to_lowercase()))
    });

    Ok(files)
}

/// Read file content (for text-based files, up to max_size bytes)
pub fn read_file_content(file_path: &str, max_size: usize) -> Result<String, String> {
    let path = Path::new(file_path);
    if !path.exists() {
        return Err(format!("File does not exist: {}", file_path));
    }

    let metadata = path.metadata().map_err(|e| e.to_string())?;
    let file_size = metadata.len() as usize;

    if file_size == 0 {
        return Ok(String::new());
    }

    let read_size = file_size.min(max_size);
    let bytes = std::fs::read(path).map_err(|e| e.to_string())?;
    let bytes_to_read = &bytes[..read_size.min(bytes.len())];

    // Try to interpret as UTF8, fallback to lossy conversion
    Ok(String::from_utf8_lossy(bytes_to_read).to_string())
}

/// Get basic file info for binary files (name + metadata description)
pub fn get_file_description(file: &ScannedFile) -> String {
    format!(
        "File: {}\nType: {}\nExtension: .{}\nSize: {} bytes",
        file.name,
        file.category.label_en(),
        file.extension,
        file.size
    )
}
