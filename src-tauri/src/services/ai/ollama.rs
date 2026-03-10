use crate::models::{AiProviderConfig, OllamaChatRequest, OllamaChatResponse, ChatMessage};
use reqwest::Client;

/// Call Ollama chat API for classification
pub async fn classify_with_ollama(
    config: &AiProviderConfig,
    prompt: &str,
) -> Result<String, String> {
    let client = Client::new();
    let url = format!("{}/api/chat", config.base_url);

    let request = OllamaChatRequest {
        model: config.model.clone(),
        messages: vec![ChatMessage {
            role: "user".to_string(),
            content: prompt.to_string(),
        }],
        stream: false,
    };

    let response = client
        .post(&url)
        .json(&request)
        .send()
        .await
        .map_err(|e| format!("Ollama request failed: {}", e))?;

    if !response.status().is_success() {
        let status = response.status();
        let body = response.text().await.unwrap_or_default();
        return Err(format!("Ollama API error ({}): {}", status, body));
    }

    let chat_response: OllamaChatResponse = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse Ollama response: {}", e))?;

    chat_response
        .message
        .map(|m| m.content)
        .ok_or_else(|| "No message in Ollama response".to_string())
}

/// Check if Ollama is available
pub async fn check_ollama_health(base_url: &str) -> Result<bool, String> {
    let client = Client::new();
    let url = format!("{}/api/tags", base_url);

    match client.get(&url).send().await {
        Ok(resp) => Ok(resp.status().is_success()),
        Err(_) => Ok(false),
    }
}

/// List available Ollama models
pub async fn list_ollama_models(base_url: &str) -> Result<Vec<String>, String> {
    let client = Client::new();
    let url = format!("{}/api/tags", base_url);

    let response = client
        .get(&url)
        .send()
        .await
        .map_err(|e| format!("Failed to connect to Ollama: {}", e))?;

    let body: serde_json::Value = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse response: {}", e))?;

    let models = body["models"]
        .as_array()
        .map(|arr| {
            arr.iter()
                .filter_map(|m| m["name"].as_str().map(|s| s.to_string()))
                .collect()
        })
        .unwrap_or_default();

    Ok(models)
}
