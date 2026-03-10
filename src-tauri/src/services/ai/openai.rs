use crate::models::{AiProviderConfig, OpenAiChatRequest, OpenAiChatResponse, ChatMessage};
use reqwest::Client;

/// Call OpenAI-compatible API for classification
pub async fn classify_with_openai(
    config: &AiProviderConfig,
    prompt: &str,
) -> Result<String, String> {
    let client = Client::new();
    let url = format!("{}/v1/chat/completions", config.base_url);

    let request = OpenAiChatRequest {
        model: config.model.clone(),
        messages: vec![ChatMessage {
            role: "user".to_string(),
            content: prompt.to_string(),
        }],
        temperature: Some(0.3),
        max_tokens: Some(500),
    };

    let mut req_builder = client.post(&url).json(&request);

    if let Some(ref api_key) = config.api_key {
        req_builder = req_builder.header("Authorization", format!("Bearer {}", api_key));
    }

    let response = req_builder
        .send()
        .await
        .map_err(|e| format!("OpenAI request failed: {}", e))?;

    if !response.status().is_success() {
        let status = response.status();
        let body = response.text().await.unwrap_or_default();
        return Err(format!("OpenAI API error ({}): {}", status, body));
    }

    let chat_response: OpenAiChatResponse = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse OpenAI response: {}", e))?;

    chat_response
        .choices
        .and_then(|choices| choices.into_iter().next())
        .map(|choice| choice.message.content)
        .ok_or_else(|| "No choices in OpenAI response".to_string())
}

/// Check if the OpenAI-compatible API is available
pub async fn check_openai_health(config: &AiProviderConfig) -> Result<bool, String> {
    let client = Client::new();
    let url = format!("{}/v1/models", config.base_url);

    let mut req_builder = client.get(&url);
    if let Some(ref api_key) = config.api_key {
        req_builder = req_builder.header("Authorization", format!("Bearer {}", api_key));
    }

    match req_builder.send().await {
        Ok(resp) => Ok(resp.status().is_success()),
        Err(_) => Ok(false),
    }
}
