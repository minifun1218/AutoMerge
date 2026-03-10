import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import { classifyFile, organizeFiles } from '../services/tauriCommands';
import { open } from '@tauri-apps/plugin-dialog';
import {
    Wand2,
    Loader,
    FileSearch,
    CheckCircle,
    FolderInput,
    FolderOutput,
    CheckCircle2,
} from 'lucide-react';
import type { OrganizeTask } from '../types';

export default function ClassifyPanel() {
    const { t } = useTranslation();
    const {
        scannedFiles,
        selectedFileIds,
        aiConfig,
        isClassifying,
        setIsClassifying,
        classifyProgress,
        setClassifyProgress,
        classifications,
        addClassification,
        clearClassifications,
        updateFileAiResult,
        isOrganizing,
        setIsOrganizing,
        organizeTasks,
        setOrganizeTasks,
    } = useAppStore();

    const selectedFiles = scannedFiles.filter(
        (f) => selectedFileIds.has(f.id) && !f.is_dir
    );

    const handleClassify = async () => {
        if (selectedFiles.length === 0) return;
        setIsClassifying(true);
        clearClassifications();
        setClassifyProgress({ current: 0, total: selectedFiles.length });

        for (let i = 0; i < selectedFiles.length; i++) {
            const file = selectedFiles[i];
            setClassifyProgress({ current: i + 1, total: selectedFiles.length });

            try {
                const result = await classifyFile(
                    file.path,
                    file.name,
                    file.id,
                    file.extension,
                    aiConfig
                );
                addClassification(result);
                updateFileAiResult(file.id, result.category, result.summary);
            } catch (error) {
                console.error(`Failed to classify ${file.name}:`, error);
                addClassification({
                    file_id: file.id,
                    category: 'Error',
                    confidence: 0,
                    summary: String(error),
                    suggested_folder: '',
                });
            }
        }

        setIsClassifying(false);
    };

    // One-click organize all classified files
    const handleOrganizeAll = async () => {
        const classifiedResults = classifications.filter(
            (c) => c.category !== 'Error' && c.suggested_folder
        );
        if (classifiedResults.length === 0) return;

        try {
            const selected = await open({
                directory: true,
                multiple: false,
                title: t('organize.selectTarget'),
            });

            if (!selected) return;

            setIsOrganizing(true);

            const tasks: OrganizeTask[] = classifiedResults.map((c) => {
                const file = scannedFiles.find((f) => f.id === c.file_id);
                return {
                    source_path: file?.path || '',
                    target_path: `${selected}\\${c.suggested_folder}\\${file?.name || ''}`,
                    file_name: file?.name || '',
                    category: c.category,
                    status: 'Pending' as const,
                };
            }).filter((t) => t.source_path);

            const results = await organizeFiles(tasks, 'move');
            setOrganizeTasks(results);
            setIsOrganizing(false);
        } catch (error) {
            console.error('Organize error:', error);
            setIsOrganizing(false);
        }
    };

    const progressPercent =
        classifyProgress.total > 0
            ? Math.round((classifyProgress.current / classifyProgress.total) * 100)
            : 0;

    const getConfidenceClass = (confidence: number) => {
        if (confidence >= 0.7) return 'confidence-high';
        if (confidence >= 0.4) return 'confidence-medium';
        return 'confidence-low';
    };

    const successCount = classifications.filter((c) => c.category !== 'Error').length;

    return (
        <div className="fade-in">
            {/* Action Bar */}
            <div className="card" style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                    <div>
                        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
                            {t('classify.title')}
                        </h3>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                            {selectedFiles.length > 0
                                ? `${selectedFiles.length} ${t('files.selected')}`
                                : t('classify.noSelection')}
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button
                            className="btn btn-primary"
                            onClick={handleClassify}
                            disabled={isClassifying || selectedFiles.length === 0}
                        >
                            {isClassifying ? (
                                <>
                                    <Loader size={16} className="spin" />
                                    {t('classify.classifying')}
                                </>
                            ) : (
                                <>
                                    <Wand2 size={16} />
                                    {t('classify.startClassify')}
                                </>
                            )}
                        </button>

                        {/* One-click organize button */}
                        {successCount > 0 && !isClassifying && (
                            <button
                                className="btn btn-secondary"
                                onClick={handleOrganizeAll}
                                disabled={isOrganizing}
                                style={{ borderColor: 'rgba(34, 197, 94, 0.3)', color: 'var(--success)' }}
                            >
                                {isOrganizing ? (
                                    <>
                                        <Loader size={16} className="spin" />
                                        {t('organize.organizing')}
                                    </>
                                ) : (
                                    <>
                                        <FolderOutput size={16} />
                                        {t('organize.oneClickOrganize')} ({successCount})
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* Progress */}
                {(isClassifying || classifyProgress.total > 0) && (
                    <div style={{ marginTop: 16 }}>
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
                        </div>
                        <p className="progress-text">
                            {classifyProgress.current} / {classifyProgress.total} ({progressPercent}%)
                        </p>
                    </div>
                )}
            </div>

            {/* Organize result feedback */}
            {organizeTasks.length > 0 && (
                <div className="card" style={{ marginBottom: 20, borderColor: 'rgba(34, 197, 94, 0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <CheckCircle2 size={18} style={{ color: 'var(--success)' }} />
                        <span style={{ fontWeight: 600, fontSize: 14 }}>
                            {t('organize.organized')}: {organizeTasks.filter(t => t.status === 'Done').length}/{organizeTasks.length}
                        </span>
                        {organizeTasks.filter(t => t.status === 'Failed').length > 0 && (
                            <span style={{ fontSize: 12, color: 'var(--error)', marginLeft: 8 }}>
                                ⚠ {organizeTasks.filter(t => t.status === 'Failed').length} failed
                            </span>
                        )}
                    </div>
                    <div style={{ marginTop: 10, maxHeight: 200, overflowY: 'auto', fontSize: 12 }}>
                        {organizeTasks.map((task, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', color: task.status === 'Done' ? 'var(--success)' : task.status === 'Failed' ? 'var(--error)' : 'var(--text-muted)' }}>
                                <span>{task.status === 'Done' ? '✓' : task.status === 'Failed' ? '✗' : '—'}</span>
                                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.file_name}</span>
                                <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>→ {task.category}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Results */}
            {classifications.length > 0 && (
                <div>
                    {classifications.map((c, index) => {
                        const file = scannedFiles.find((f) => f.id === c.file_id);
                        return (
                            <div key={c.file_id + '-' + index} className="classify-result">
                                <div className="classify-header">
                                    <div className="classify-file-name" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        {c.category === 'Error' ? (
                                            <span style={{ color: 'var(--error)' }}>✗</span>
                                        ) : (
                                            <CheckCircle size={14} style={{ color: 'var(--success)' }} />
                                        )}
                                        {file?.name || c.file_id}
                                    </div>
                                    <span className={`classify-confidence ${getConfidenceClass(c.confidence)}`}>
                                        {Math.round(c.confidence * 100)}%
                                    </span>
                                </div>

                                <div className="classify-details">
                                    <div className="classify-detail-item">
                                        <span className="classify-detail-label">{t('classify.result')}</span>
                                        <span className="classify-detail-value">{c.category}</span>
                                    </div>
                                    <div className="classify-detail-item">
                                        <span className="classify-detail-label">{t('classify.suggestedFolder')}</span>
                                        <span className="classify-detail-value" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <FolderInput size={12} />
                                            {c.suggested_folder || '—'}
                                        </span>
                                    </div>
                                </div>

                                {c.summary && (
                                    <div className="classify-summary">{c.summary}</div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {classifications.length === 0 && !isClassifying && (
                <div className="card">
                    <div className="empty-state">
                        <FileSearch size={64} className="empty-state-icon" />
                        <p className="empty-state-text">{t('classify.noSelection')}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
