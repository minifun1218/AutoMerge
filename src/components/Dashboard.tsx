import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import { scanDirectory, getFileStats, organizeFiles } from '../services/tauriCommands';
import { formatFileSize } from '../services/tauriCommands';
import { open } from '@tauri-apps/plugin-dialog';
import React, { useMemo, useCallback } from 'react';
import {
    Files,
    HardDrive,
    FolderOpen,
    FileText,
    Image,
    Video,
    Music,
    Code,
    Archive,
    Database,
    Table,
    Play,
    Type,
    File,
    Folder,
    FolderInput,
    FolderOutput,
    Loader,
    CheckCircle2,
    ChevronRight,
    ArrowLeft,
    Home,
} from 'lucide-react';
import { CATEGORY_COLORS } from '../types';
import type { FileCategory, OrganizeTask } from '../types';

const categoryIcons: Record<FileCategory, React.ReactNode> = {
    Document: <FileText size={16} />,
    Spreadsheet: <Table size={16} />,
    Image: <Image size={16} />,
    Video: <Video size={16} />,
    Audio: <Music size={16} />,
    Code: <Code size={16} />,
    Archive: <Archive size={16} />,
    Executable: <Play size={16} />,
    Font: <Type size={16} />,
    Data: <Database size={16} />,
    Other: <File size={16} />,
};

/** Normalize path separators to forward slash and strip trailing slash */
function normPath(p: string) {
    return p.replace(/\\/g, '/').replace(/\/$/, '');
}

/** Get the parent directory of a path (normalized) */
function parentOf(p: string) {
    const n = normPath(p);
    const idx = n.lastIndexOf('/');
    return idx <= 0 ? n : n.substring(0, idx);
}

export default function Dashboard() {
    const { t } = useTranslation();
    const {
        scannedFiles,
        setScannedFiles,
        stats,
        setStats,
        isScanning,
        setIsScanning,
        currentDirectory,
        setCurrentDirectory,
        recursive,
        maxDepth,
        filterCategory,
        setFilterCategory,
        setCurrentView,
        isOrganizing,
        setIsOrganizing,
        organizeTasks,
        setOrganizeTasks,
        browsePath,
        setBrowsePath,
    } = useAppStore();

    const normalizedBrowsePath = useMemo(() => normPath(browsePath), [browsePath]);
    const rootNorm = useMemo(() => normPath(currentDirectory), [currentDirectory]);
    const isAtRoot = rootNorm === normalizedBrowsePath;

    // Files directly in the current browsePath (immediate children only)
    const currentLevelFiles = useMemo(() => {
        return scannedFiles.filter((f) => {
            const fileParent = parentOf(f.path);
            return fileParent === normalizedBrowsePath;
        });
    }, [scannedFiles, normalizedBrowsePath]);

    // Files only (no dirs) at current level — used for stats
    const currentLevelOnlyFiles = useMemo(
        () => currentLevelFiles.filter((f) => !f.is_dir),
        [currentLevelFiles]
    );

    // Folders at current level
    const currentLevelFolders = useMemo(
        () => currentLevelFiles.filter((f) => f.is_dir),
        [currentLevelFiles]
    );

    // Compute stats from current level files only
    const currentStats = useMemo(() => {
        const map = new Map<string, { category: string; count: number; total_size: number }>();
        for (const f of currentLevelOnlyFiles) {
            const cat = f.category as string;
            const entry = map.get(cat) || { category: cat, count: 0, total_size: 0 };
            entry.count += 1;
            entry.total_size += f.size;
            map.set(cat, entry);
        }
        const arr = Array.from(map.values());
        arr.sort((a, b) => b.count - a.count);
        return arr;
    }, [currentLevelOnlyFiles]);

    const totalFiles = currentLevelOnlyFiles.length;
    const totalFolders = currentLevelFolders.length;
    const totalSize = currentLevelOnlyFiles.reduce((sum, f) => sum + f.size, 0);

    // Breadcrumb segments
    const breadcrumbs = useMemo(() => {
        if (!rootNorm) return [];
        const relative = normalizedBrowsePath.startsWith(rootNorm)
            ? normalizedBrowsePath.substring(rootNorm.length).replace(/^\//, '')
            : '';
        const rootName = rootNorm.split('/').pop() || rootNorm;
        const parts: { label: string; path: string }[] = [{ label: rootName, path: rootNorm }];
        if (relative) {
            const segments = relative.split('/');
            let accum = rootNorm;
            for (const seg of segments) {
                accum += '/' + seg;
                parts.push({ label: seg, path: accum });
            }
        }
        return parts;
    }, [rootNorm, normalizedBrowsePath]);

    // Navigation
    const navigateInto = useCallback((folderPath: string) => {
        setBrowsePath(normPath(folderPath));
    }, [setBrowsePath]);

    const navigateUp = useCallback(() => {
        if (!isAtRoot) {
            setBrowsePath(parentOf(normalizedBrowsePath));
        }
    }, [isAtRoot, normalizedBrowsePath, setBrowsePath]);

    const navigateToRoot = useCallback(() => {
        setBrowsePath(rootNorm);
    }, [rootNorm, setBrowsePath]);

    const handleScanDirectory = async () => {
        try {
            const selected = await open({
                directory: true,
                multiple: false,
                title: t('dashboard.scanDir'),
            });

            if (selected) {
                setIsScanning(true);
                setCurrentDirectory(selected as string);
                const files = await scanDirectory(selected as string, recursive, maxDepth);
                setScannedFiles(files);
                const fileStats = await getFileStats(files);
                setStats(fileStats);
                setIsScanning(false);
            }
        } catch (error) {
            console.error('Scan error:', error);
            setIsScanning(false);
        }
    };

    // Re-scan and update file list
    const refreshFiles = async () => {
        if (!currentDirectory) return;
        setScannedFiles([]);
        setStats([]);
        await new Promise((r) => setTimeout(r, 200));
        const files = await scanDirectory(currentDirectory, recursive, maxDepth);
        setScannedFiles(files);
        const fileStats = await getFileStats(files);
        setStats(fileStats);
    };

    // Helper: check if a file is directly in the current browsePath
    const isInCurrentDir = (filePath: string) => {
        const fileParent = parentOf(filePath);
        return fileParent === normalizedBrowsePath;
    };

    // Organize files of a specific category in the current browsePath
    const handleOrganizeCategory = async (category: string) => {
        if (!currentDirectory) return;

        try {
            setIsOrganizing(true);

            const filesInCategory = currentLevelOnlyFiles.filter(
                (f) => f.category === category
            );

            // Use the browsePath (native separators) as base for target
            const basePath = browsePath.replace(/\//g, '\\');

            const tasks: OrganizeTask[] = filesInCategory.map((f) => ({
                source_path: f.path,
                target_path: `${basePath}\\${category}\\${f.name}`,
                file_name: f.name,
                category: category,
                status: 'Pending' as const,
            }));

            const results = await organizeFiles(tasks, 'move');
            setOrganizeTasks(results);
            await refreshFiles();
            setIsOrganizing(false);
        } catch (error) {
            console.error('Organize error:', error);
            setIsOrganizing(false);
        }
    };

    // One-click organize ALL categories in the current browsePath
    const handleOrganizeAll = async () => {
        if (!currentDirectory || currentLevelOnlyFiles.length === 0) return;

        try {
            setIsOrganizing(true);

            const basePath = browsePath.replace(/\//g, '\\');

            const tasks: OrganizeTask[] = currentLevelOnlyFiles.map((f) => ({
                source_path: f.path,
                target_path: `${basePath}\\${f.category}\\${f.name}`,
                file_name: f.name,
                category: f.category,
                status: 'Pending' as const,
            }));

            const results = await organizeFiles(tasks, 'move');
            setOrganizeTasks(results);
            await refreshFiles();
            setIsOrganizing(false);
        } catch (error) {
            console.error('Organize all error:', error);
            setIsOrganizing(false);
        }
    };

    const handleCategoryClick = (category: string) => {
        setFilterCategory(filterCategory === category ? null : category);
        setCurrentView('files');
    };

    return (
        <div className="fade-in">
            {/* Breadcrumb navigation */}
            {currentDirectory && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    marginBottom: 16,
                    padding: '8px 12px',
                    background: 'var(--bg-glass)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    fontSize: 13,
                    overflowX: 'auto',
                    whiteSpace: 'nowrap',
                }}>
                    <button
                        className="btn btn-sm"
                        style={{
                            padding: '2px 6px', minWidth: 'auto',
                            opacity: isAtRoot ? 0.4 : 1,
                            background: 'transparent', border: 'none', color: 'var(--text-primary)',
                        }}
                        disabled={isAtRoot}
                        onClick={navigateUp}
                        title="Go back"
                    >
                        <ArrowLeft size={14} />
                    </button>
                    <button
                        className="btn btn-sm"
                        style={{
                            padding: '2px 6px', minWidth: 'auto',
                            opacity: isAtRoot ? 0.4 : 1,
                            background: 'transparent', border: 'none', color: 'var(--text-primary)',
                        }}
                        disabled={isAtRoot}
                        onClick={navigateToRoot}
                        title="Go to root"
                    >
                        <Home size={14} />
                    </button>
                    <span style={{ margin: '0 4px', color: 'var(--border-color)' }}>|</span>
                    {breadcrumbs.map((bc, i) => (
                        <React.Fragment key={bc.path}>
                            {i > 0 && (
                                <ChevronRight size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                            )}
                            <span
                                style={{
                                    cursor: i < breadcrumbs.length - 1 ? 'pointer' : 'default',
                                    color: i < breadcrumbs.length - 1 ? 'var(--accent)' : 'var(--text-primary)',
                                    fontWeight: i === breadcrumbs.length - 1 ? 600 : 400,
                                }}
                                onClick={() => {
                                    if (i < breadcrumbs.length - 1) setBrowsePath(bc.path);
                                }}
                            >
                                {bc.label}
                            </span>
                        </React.Fragment>
                    ))}
                </div>
            )}

            <div className="stats-grid">
                <div className="stat-card" onClick={handleScanDirectory} style={{ cursor: 'pointer' }}>
                    <div
                        className="stat-icon"
                        style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#6366f1' }}
                    >
                        <FolderOpen size={22} />
                    </div>
                    <div className="stat-info">
                        <div className="stat-value">
                            {isScanning ? '...' : currentDirectory ? currentDirectory.split(/[\\/]/).pop() : '—'}
                        </div>
                        <div className="stat-label">
                            {isScanning ? t('dashboard.scanning') : t('dashboard.scanDir')}
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div
                        className="stat-icon"
                        style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' }}
                    >
                        <Files size={22} />
                    </div>
                    <div className="stat-info">
                        <div className="stat-value">{totalFiles.toLocaleString()}</div>
                        <div className="stat-label">{t('dashboard.totalFiles')}</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div
                        className="stat-icon"
                        style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}
                    >
                        <HardDrive size={22} />
                    </div>
                    <div className="stat-info">
                        <div className="stat-value">{formatFileSize(totalSize)}</div>
                        <div className="stat-label">{t('dashboard.totalSize')}</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div
                        className="stat-icon"
                        style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}
                    >
                        <FolderOpen size={22} />
                    </div>
                    <div className="stat-info">
                        <div className="stat-value">{totalFolders}</div>
                        <div className="stat-label">Folders</div>
                    </div>
                </div>
            </div>

            {/* Sub-folders list — clickable to navigate */}
            {currentLevelFolders.length > 0 && (
                <div className="card" style={{ marginBottom: 16 }}>
                    <div className="card-header">
                        <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Folder size={16} style={{ color: '#f59e0b' }} />
                            {t('dashboard.categories')} - Folders ({totalFolders})
                        </span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '4px 0' }}>
                        {currentLevelFolders.map((folder) => (
                            <button
                                key={folder.id}
                                className="btn btn-secondary btn-sm"
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 6,
                                    padding: '6px 12px',
                                    borderColor: 'rgba(245, 158, 11, 0.3)',
                                    color: '#f59e0b',
                                }}
                                onClick={() => navigateInto(folder.path)}
                            >
                                <Folder size={14} />
                                {folder.name}
                                <ChevronRight size={12} />
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {currentStats.length > 0 ? (
                <div className="card">
                    <div className="card-header">
                        <span className="card-title">{t('dashboard.categories')}</span>
                        {/* Global one-click organize all */}
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={handleOrganizeAll}
                            disabled={isOrganizing || totalFiles === 0}
                        >
                            {isOrganizing ? (
                                <Loader size={14} className="spin" />
                            ) : (
                                <FolderOutput size={14} />
                            )}
                            {t('organize.oneClickOrganize')}
                        </button>
                    </div>
                    <div className="category-grid">
                        {currentStats.map((stat) => (
                            <div
                                key={stat.category}
                                className={`category-item ${filterCategory === stat.category ? 'active' : ''}`}
                                style={{ flexWrap: 'wrap' }}
                            >
                                <div
                                    className="category-dot"
                                    style={{ background: CATEGORY_COLORS[stat.category] || '#64748b' }}
                                />
                                <span
                                    className="category-name"
                                    onClick={() => handleCategoryClick(stat.category)}
                                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                                >
                                    {categoryIcons[stat.category as FileCategory]}
                                    {stat.category}
                                </span>
                                <span className="category-count">
                                    {stat.count} · {formatFileSize(stat.total_size)}
                                </span>
                                {/* Per-category organize button */}
                                <button
                                    className="btn btn-sm btn-secondary"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleOrganizeCategory(stat.category);
                                    }}
                                    disabled={isOrganizing}
                                    style={{ width: '100%', justifyContent: 'center', marginTop: 6 }}
                                    title={t('organize.confirmCategory')}
                                >
                                    {isOrganizing ? (
                                        <Loader size={12} className="spin" />
                                    ) : (
                                        <FolderInput size={12} />
                                    )}
                                    {t('organize.confirmCategory')}
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Organize result feedback */}
                    {organizeTasks.length > 0 && (
                        <div style={{ marginTop: 16, padding: 12, background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
                                <span style={{ fontWeight: 600, fontSize: 13 }}>
                                    {t('organize.organized')}: {organizeTasks.filter(t => t.status === 'Done').length}/{organizeTasks.length}
                                </span>
                            </div>
                            {organizeTasks.filter(t => t.status === 'Failed').length > 0 && (
                                <span style={{ fontSize: 12, color: 'var(--error)' }}>
                                    {organizeTasks.filter(t => t.status === 'Failed').length} {t('organize.organizeFailed')}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            ) : totalFiles === 0 && totalFolders === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <FolderOpen size={64} className="empty-state-icon" />
                        <p className="empty-state-text">{t('dashboard.noFiles')}</p>
                        <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={handleScanDirectory}>
                            <FolderOpen size={16} />
                            {t('dashboard.scanDir')}
                        </button>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
