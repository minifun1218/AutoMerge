import { invoke } from '@tauri-apps/api/core';
import type {
    ScannedFile,
    CategoryStats,
    AiClassification,
    AiProviderConfig,
    OrganizeTask,
} from '../types';

// ==========================================
// File Operations
// ==========================================

export async function scanDirectory(
    directory: string,
    recursive: boolean,
    maxDepth?: number
): Promise<ScannedFile[]> {
    return invoke('scan_directory', { directory, recursive, maxDepth });
}

export async function getFileStats(files: ScannedFile[]): Promise<CategoryStats[]> {
    return invoke('get_file_stats', { files });
}

export async function readFileContent(
    filePath: string,
    maxSize?: number
): Promise<string> {
    return invoke('read_file_content', { filePath, maxSize });
}

export async function organizeFiles(
    tasks: OrganizeTask[],
    mode: string
): Promise<OrganizeTask[]> {
    return invoke('organize_files', { tasks, mode });
}

export async function suggestOrganization(
    files: ScannedFile[],
    targetBase: string
): Promise<[string, string][]> {
    return invoke('suggest_organization', { files, targetBase });
}

// ==========================================
// AI Operations
// ==========================================

export async function classifyFile(
    filePath: string,
    fileName: string,
    fileId: string,
    extension: string,
    config: AiProviderConfig
): Promise<AiClassification> {
    return invoke('classify_file', { filePath, fileName, fileId, extension, config });
}

export async function checkAiHealth(config: AiProviderConfig): Promise<boolean> {
    return invoke('check_ai_health', { config });
}

export async function listAiModels(config: AiProviderConfig): Promise<string[]> {
    return invoke('list_ai_models', { config });
}

export async function batchClassifyFiles(
    files: [string, string, string, string][],
    config: AiProviderConfig
): Promise<AiClassification[]> {
    return invoke('batch_classify_files', { files, config });
}

// ==========================================
// Utility Functions
// ==========================================

export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const size = (bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1);
    return `${size} ${units[i]}`;
}
