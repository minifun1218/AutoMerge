use std::fs;
use std::path::Path;
use crate::models::{OrganizeTask, TaskStatus};

/// Execute file organization (move or copy)
pub fn organize_files(tasks: &mut Vec<OrganizeTask>, is_copy: bool) -> Vec<OrganizeTask> {
    for task in tasks.iter_mut() {
        task.status = TaskStatus::InProgress;

        let source = Path::new(&task.source_path);
        let target = Path::new(&task.target_path);

        // Create target directory if it doesn't exist
        if let Some(parent) = target.parent() {
            if let Err(e) = fs::create_dir_all(parent) {
                task.status = TaskStatus::Failed;
                log::error!("Failed to create directory {:?}: {}", parent, e);
                continue;
            }
        }

        // Skip directories — only organize individual files
        if source.is_dir() {
            task.status = TaskStatus::Skipped;
            log::info!("Skipping directory (preserving folder structure): {:?}", source);
            continue;
        }

        // Check if source exists
        if !source.exists() {
            task.status = TaskStatus::Failed;
            log::error!("Source file does not exist: {:?}", source);
            continue;
        }

        // Skip if target identical to source
        if source == target {
            task.status = TaskStatus::Skipped;
            continue;
        }

        // Perform operation
        let result = if is_copy {
            fs::copy(source, target).map(|_| ())
        } else {
            fs::rename(source, target).or_else(|_| {
                // If rename fails (cross-device), fall back to copy + delete
                fs::copy(source, target).and_then(|_| fs::remove_file(source))
            })
        };

        match result {
            Ok(_) => {
                task.status = TaskStatus::Done;
                log::info!("Organized: {:?} -> {:?}", source, target);
            }
            Err(e) => {
                task.status = TaskStatus::Failed;
                log::error!("Failed to organize {:?}: {}", source, e);
            }
        }
    }

    tasks.clone()
}

/// Preview organization (just validation, no file operations)
pub fn preview_organize(tasks: &[OrganizeTask]) -> Vec<OrganizeTask> {
    tasks
        .iter()
        .map(|task| {
            let source = Path::new(&task.source_path);
            let mut preview = task.clone();
            if !source.exists() {
                preview.status = TaskStatus::Failed;
            } else {
                preview.status = TaskStatus::Pending;
            }
            preview
        })
        .collect()
}
