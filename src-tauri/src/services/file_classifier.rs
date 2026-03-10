use crate::models::{ScannedFile, CategoryStats, FileCategory};
use std::collections::HashMap;

/// Generate statistics for scanned files
pub fn compute_stats(files: &[ScannedFile]) -> Vec<CategoryStats> {
    let mut map: HashMap<String, (FileCategory, usize, u64)> = HashMap::new();

    for file in files {
        if file.is_dir {
            continue;
        }
        let key = format!("{:?}", file.category);
        let entry = map.entry(key).or_insert((file.category.clone(), 0, 0));
        entry.1 += 1;
        entry.2 += file.size;
    }

    let mut stats: Vec<CategoryStats> = map
        .into_values()
        .map(|(category, count, total_size)| CategoryStats {
            category,
            count,
            total_size,
        })
        .collect();

    stats.sort_by(|a, b| b.count.cmp(&a.count));
    stats
}

/// Generate target folder name for a category
pub fn category_folder_name(category: &FileCategory) -> String {
    category.label_en().to_string()
}

/// Suggest target paths for organizing files
pub fn suggest_organization(
    files: &[ScannedFile],
    target_base: &str,
) -> Vec<(String, String)> {
    // Returns Vec<(source_path, suggested_target_path)>
    files
        .iter()
        .filter(|f| !f.is_dir)
        .map(|f| {
            let folder = if let Some(ref ai_cat) = f.ai_category {
                ai_cat.clone()
            } else {
                category_folder_name(&f.category)
            };
            let target = format!("{}/{}/{}", target_base, folder, f.name);
            (f.path.clone(), target)
        })
        .collect()
}
