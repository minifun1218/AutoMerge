pub mod ollama;
pub mod openai;

use crate::models::AiClassification;

/// Build the classification prompt for a file
pub fn build_classification_prompt(filename: &str, content: &str, extension: &str) -> String {
    format!(
        r#"You are a file classification AI assistant. Analyze the following file and provide a classification.

File name: {}
File extension: .{}
File content (partial):
---
{}
---

Based on the file name and content above, please respond ONLY with a valid JSON object (no markdown, no extra text):
{{
  "category": "<a descriptive category name in English, e.g. 'Financial Report', 'Resume', 'Source Code', 'Meeting Notes', 'Legal Contract', 'Photo', 'Music', 'Research Paper'>",
  "confidence": <a number between 0 and 1>,
  "summary": "<a brief 1-2 sentence description of the file content in both English and Chinese, format: 'EN description | 中文描述'>",
  "suggested_folder": "<suggested folder name to organize this file>"
}}

Respond ONLY with the JSON object, nothing else."#,
        filename, extension, content
    )
}

/// Parse the AI response JSON into AiClassification
pub fn parse_classification_response(file_id: &str, response: &str) -> Result<AiClassification, String> {
    // Try to extract JSON from the response (handle markdown code blocks)
    let json_str = if response.contains("```") {
        response
            .split("```")
            .nth(1)
            .unwrap_or(response)
            .trim_start_matches("json")
            .trim()
    } else {
        response.trim()
    };

    match serde_json::from_str::<serde_json::Value>(json_str) {
        Ok(val) => Ok(AiClassification {
            file_id: file_id.to_string(),
            category: val["category"].as_str().unwrap_or("Other").to_string(),
            confidence: val["confidence"].as_f64().unwrap_or(0.5) as f32,
            summary: val["summary"].as_str().unwrap_or("").to_string(),
            suggested_folder: val["suggested_folder"].as_str().unwrap_or("Other").to_string(),
        }),
        Err(_e) => {
            // Fallback: use the raw response as a summary
            Ok(AiClassification {
                file_id: file_id.to_string(),
                category: "Other".to_string(),
                confidence: 0.3,
                summary: response.chars().take(200).collect(),
                suggested_folder: "Other".to_string(),
            })
        }
    }
}
