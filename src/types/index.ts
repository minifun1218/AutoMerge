// ==========================================
// AutoMerge - Type Definitions
// ==========================================

export type FileCategory =
  | 'Document'
  | 'Spreadsheet'
  | 'Image'
  | 'Video'
  | 'Audio'
  | 'Code'
  | 'Archive'
  | 'Executable'
  | 'Font'
  | 'Data'
  | 'Other';

export interface ScannedFile {
  id: string;
  name: string;
  path: string;
  extension: string;
  size: number;
  modified: string | null;
  category: FileCategory;
  ai_category: string | null;
  ai_summary: string | null;
  is_dir: boolean;
}

export interface AiClassification {
  file_id: string;
  category: string;
  confidence: number;
  summary: string;
  suggested_folder: string;
}

export interface AiProviderConfig {
  provider_type: 'ollama' | 'openai' | 'custom';
  base_url: string;
  api_key: string | null;
  model: string;
  enabled: boolean;
}

export interface CategoryStats {
  category: FileCategory;
  count: number;
  total_size: number;
}

export interface OrganizeTask {
  source_path: string;
  target_path: string;
  file_name: string;
  category: string;
  status: TaskStatus;
}

export type TaskStatus = 'Pending' | 'InProgress' | 'Done' | 'Failed' | 'Skipped';

export type AppView = 'dashboard' | 'files' | 'classify' | 'ai-config' | 'settings';

export type Language = 'en' | 'zh';

// Category color mapping
export const CATEGORY_COLORS: Record<FileCategory, string> = {
  Document: '#6366f1',
  Spreadsheet: '#22c55e',
  Image: '#f59e0b',
  Video: '#ef4444',
  Audio: '#8b5cf6',
  Code: '#06b6d4',
  Archive: '#f97316',
  Executable: '#ec4899',
  Font: '#14b8a6',
  Data: '#64748b',
  Other: '#94a3b8',
};

// Category icons (lucide icon names)
export const CATEGORY_ICONS: Record<FileCategory, string> = {
  Document: 'FileText',
  Spreadsheet: 'Table',
  Image: 'Image',
  Video: 'Video',
  Audio: 'Music',
  Code: 'Code',
  Archive: 'Archive',
  Executable: 'Play',
  Font: 'Type',
  Data: 'Database',
  Other: 'File',
};
