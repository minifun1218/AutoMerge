use serde::{Deserialize, Serialize};

/// 文件分类类别
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum FileCategory {
    Document,
    Spreadsheet,
    Image,
    Video,
    Audio,
    Code,
    Archive,
    Executable,
    Font,
    Data,
    Other,
}

impl FileCategory {
    pub fn from_extension(ext: &str) -> Self {
        match ext.to_lowercase().as_str() {
            "pdf" | "docx" | "doc" | "txt" | "md" | "rtf" | "odt" | "pages" | "epub" => FileCategory::Document,
            "xlsx" | "xls" | "csv" | "ods" | "numbers" | "tsv" => FileCategory::Spreadsheet,
            "jpg" | "jpeg" | "png" | "gif" | "svg" | "webp" | "bmp" | "ico" | "tiff" | "psd" | "ai" | "raw" | "heic" => FileCategory::Image,
            "mp4" | "avi" | "mkv" | "mov" | "wmv" | "flv" | "webm" | "m4v" | "3gp" => FileCategory::Video,
            "mp3" | "wav" | "flac" | "m4a" | "aac" | "ogg" | "wma" | "aiff" => FileCategory::Audio,
            "rs" | "js" | "ts" | "tsx" | "jsx" | "py" | "go" | "java" | "c" | "cpp" | "h" | "hpp"
            | "cs" | "rb" | "php" | "swift" | "kt" | "dart" | "vue" | "html" | "css" | "scss"
            | "less" | "sql" | "sh" | "bat" | "ps1" | "yaml" | "yml" | "toml" | "json" | "xml" => FileCategory::Code,
            "zip" | "rar" | "7z" | "tar" | "gz" | "bz2" | "xz" | "zst" | "cab" | "iso" => FileCategory::Archive,
            "exe" | "msi" | "dmg" | "app" | "deb" | "rpm" | "apk" | "appimage" => FileCategory::Executable,
            "ttf" | "otf" | "woff" | "woff2" | "eot" => FileCategory::Font,
            "db" | "sqlite" | "mdb" | "accdb" | "parquet" | "arrow" => FileCategory::Data,
            _ => FileCategory::Other,
        }
    }

    pub fn label_en(&self) -> &'static str {
        match self {
            FileCategory::Document => "Documents",
            FileCategory::Spreadsheet => "Spreadsheets",
            FileCategory::Image => "Images",
            FileCategory::Video => "Videos",
            FileCategory::Audio => "Audio",
            FileCategory::Code => "Code",
            FileCategory::Archive => "Archives",
            FileCategory::Executable => "Executables",
            FileCategory::Font => "Fonts",
            FileCategory::Data => "Data",
            FileCategory::Other => "Other",
        }
    }

    pub fn label_zh(&self) -> &'static str {
        match self {
            FileCategory::Document => "文档",
            FileCategory::Spreadsheet => "表格",
            FileCategory::Image => "图片",
            FileCategory::Video => "视频",
            FileCategory::Audio => "音频",
            FileCategory::Code => "代码",
            FileCategory::Archive => "压缩包",
            FileCategory::Executable => "可执行文件",
            FileCategory::Font => "字体",
            FileCategory::Data => "数据文件",
            FileCategory::Other => "其他",
        }
    }
}

/// 扫描到的文件信息
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScannedFile {
    pub id: String,
    pub name: String,
    pub path: String,
    pub extension: String,
    pub size: u64,
    pub modified: Option<String>,
    pub category: FileCategory,
    pub ai_category: Option<String>,
    pub ai_summary: Option<String>,
    pub is_dir: bool,
}

/// AI 分类结果
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AiClassification {
    pub file_id: String,
    pub category: String,
    pub confidence: f32,
    pub summary: String,
    pub suggested_folder: String,
}

/// AI 提供商配置
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AiProviderConfig {
    pub provider_type: String, // "ollama" | "openai" | "custom"
    pub base_url: String,
    pub api_key: Option<String>,
    pub model: String,
    pub enabled: bool,
}

impl Default for AiProviderConfig {
    fn default() -> Self {
        Self {
            provider_type: "ollama".to_string(),
            base_url: "http://localhost:11434".to_string(),
            api_key: None,
            model: "llama3".to_string(),
            enabled: true,
        }
    }
}

/// 分类统计
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CategoryStats {
    pub category: FileCategory,
    pub count: usize,
    pub total_size: u64,
}

/// 整理任务
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OrganizeTask {
    pub source_path: String,
    pub target_path: String,
    pub file_name: String,
    pub category: String,
    pub status: TaskStatus,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum TaskStatus {
    Pending,
    InProgress,
    Done,
    Failed,
    Skipped,
}

/// 扫描请求
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScanRequest {
    pub directory: String,
    pub recursive: bool,
    pub max_depth: Option<usize>,
}

/// 整理请求
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OrganizeRequest {
    pub files: Vec<OrganizeTask>,
    pub mode: OrganizeMode,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum OrganizeMode {
    Move,
    Copy,
    Preview,
}

/// AI 聊天消息
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatMessage {
    pub role: String,
    pub content: String,
}

/// Ollama API 请求
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OllamaChatRequest {
    pub model: String,
    pub messages: Vec<ChatMessage>,
    pub stream: bool,
}

/// Ollama API 响应
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OllamaChatResponse {
    pub message: Option<ChatMessage>,
    pub done: Option<bool>,
}

/// OpenAI 兼容 API 请求
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OpenAiChatRequest {
    pub model: String,
    pub messages: Vec<ChatMessage>,
    pub temperature: Option<f32>,
    pub max_tokens: Option<u32>,
}

/// OpenAI 兼容 API 响应
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OpenAiChatResponse {
    pub choices: Option<Vec<OpenAiChoice>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OpenAiChoice {
    pub message: ChatMessage,
}

/// 扫描进度事件
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScanProgress {
    pub scanned: usize,
    pub total: usize,
    pub current_file: String,
}

/// AI 处理进度事件
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AiProgress {
    pub processed: usize,
    pub total: usize,
    pub current_file: String,
    pub status: String,
}
