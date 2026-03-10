use crate::models::{AiClassification, AiProviderConfig};
use crate::services::ai;
use crate::services::ai::ollama;
use crate::services::ai::openai;
use crate::services::file_scanner;

/// Classify a single file using AI
#[tauri::command]
pub async fn classify_file(
    file_path: String,
    file_name: String,
    file_id: String,
    extension: String,
    config: AiProviderConfig,
) -> Result<AiClassification, String> {
    // Read file content (limit to 8KB for AI processing)
    let content = file_scanner::read_file_content(&file_path, 8192)
        .unwrap_or_else(|_| format!("(binary file: {})", file_name));

    let prompt = ai::build_classification_prompt(&file_name, &content, &extension);

    let response = match config.provider_type.as_str() {
        "ollama" => ollama::classify_with_ollama(&config, &prompt).await?,
        "openai" | "custom" => openai::classify_with_openai(&config, &prompt).await?,
        _ => return Err(format!("Unknown provider type: {}", config.provider_type)),
    };

    ai::parse_classification_response(&file_id, &response)
}

/// Check AI provider health
#[tauri::command]
pub async fn check_ai_health(config: AiProviderConfig) -> Result<bool, String> {
    match config.provider_type.as_str() {
        "ollama" => ollama::check_ollama_health(&config.base_url).await,
        "openai" | "custom" => openai::check_openai_health(&config).await,
        _ => Err(format!("Unknown provider type: {}", config.provider_type)),
    }
}

/// List available models from AI provider
#[tauri::command]
pub async fn list_ai_models(config: AiProviderConfig) -> Result<Vec<String>, String> {
    match config.provider_type.as_str() {
        "ollama" => ollama::list_ollama_models(&config.base_url).await,
        _ => Ok(vec![config.model]),
    }
}

/// Batch classify multiple files
#[tauri::command]
pub async fn batch_classify_files(
    files: Vec<(String, String, String, String)>, // (path, name, id, extension)
    config: AiProviderConfig,
) -> Result<Vec<AiClassification>, String> {
    let mut results = Vec::new();

    for (path, name, id, ext) in files {
        let content = file_scanner::read_file_content(&path, 8192)
            .unwrap_or_else(|_| format!("(binary file: {})", name));

        let prompt = ai::build_classification_prompt(&name, &content, &ext);

        let response = match config.provider_type.as_str() {
            "ollama" => ollama::classify_with_ollama(&config, &prompt).await,
            "openai" | "custom" => openai::classify_with_openai(&config, &prompt).await,
            _ => Err(format!("Unknown provider: {}", config.provider_type)),
        };

        match response {
            Ok(resp) => {
                match ai::parse_classification_response(&id, &resp) {
                    Ok(classification) => results.push(classification),
                    Err(e) => log::warn!("Failed to parse classification for {}: {}", name, e),
                }
            }
            Err(e) => {
                log::warn!("Failed to classify {}: {}", name, e);
            }
        }
    }

    Ok(results)
}
