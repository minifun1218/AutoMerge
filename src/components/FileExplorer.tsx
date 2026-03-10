import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import { formatFileSize } from '../services/tauriCommands';
import { CATEGORY_COLORS } from '../types';
import React, { useMemo, useCallback, useRef, useState, useEffect } from 'react';
import {
    Search,
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
    CheckSquare,
    Square,
    ChevronRight,
    ArrowLeft,
    Home,
} from 'lucide-react';
import type { FileCategory, ScannedFile } from '../types';

const categoryIcons: Record<FileCategory, React.ReactNode> = {
    Document: <FileText size={14} />,
    Spreadsheet: <Table size={14} />,
    Image: <Image size={14} />,
    Video: <Video size={14} />,
    Audio: <Music size={14} />,
    Code: <Code size={14} />,
    Archive: <Archive size={14} />,
    Executable: <Play size={14} />,
    Font: <Type size={14} />,
    Data: <Database size={14} />,
    Other: <File size={14} />,
};

const ROW_HEIGHT = 40;
const OVERSCAN = 8;

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

export default function FileExplorer() {
    const { t } = useTranslation();
    const {
        scannedFiles,
        selectedFileIds,
        toggleFileSelection,
        selectAllFiles,
        clearSelection,
        searchQuery,
        setSearchQuery,
        filterCategory,
        setFilterCategory,
        currentDirectory,
        browsePath,
        setBrowsePath,
    } = useAppStore();

    const scrollRef = useRef<HTMLDivElement>(null);
    const [scrollTop, setScrollTop] = useState(0);
    const [viewHeight, setViewHeight] = useState(400);

    const normalizedBrowsePath = useMemo(() => normPath(browsePath), [browsePath]);

    // Filter files: only show items whose immediate parent matches browsePath
    const filteredFiles = useMemo(() => {
        return scannedFiles.filter((file) => {
            // Only show items directly inside the current browsePath
            const fileParent = parentOf(file.path);
            if (fileParent !== normalizedBrowsePath) return false;

            const matchesSearch =
                !searchQuery || file.name.toLowerCase().includes(searchQuery.toLowerCase());
            // Folders always stay visible regardless of category filter
            const matchesCategory = file.is_dir || !filterCategory || file.category === filterCategory;
            return matchesSearch && matchesCategory;
        });
    }, [scannedFiles, searchQuery, filterCategory, normalizedBrowsePath]);

    const allCategories = useMemo(
        () => Array.from(new Set(scannedFiles.map((f) => f.category))),
        [scannedFiles]
    );

    const handleSelectAll = useCallback(() => {
        if (selectedFileIds.size === filteredFiles.filter((f) => !f.is_dir).length) {
            clearSelection();
        } else {
            selectAllFiles();
        }
    }, [selectedFileIds.size, filteredFiles, clearSelection, selectAllFiles]);

    // Navigate into a folder
    const navigateInto = useCallback((folderPath: string) => {
        setBrowsePath(normPath(folderPath));
        setScrollTop(0);
        if (scrollRef.current) scrollRef.current.scrollTop = 0;
    }, []);

    // Navigate back to parent
    const navigateUp = useCallback(() => {
        const rootNorm = normPath(currentDirectory);
        if (normalizedBrowsePath !== rootNorm) {
            const parent = parentOf(normalizedBrowsePath);
            setBrowsePath(parent);
            setScrollTop(0);
            if (scrollRef.current) scrollRef.current.scrollTop = 0;
        }
    }, [normalizedBrowsePath, currentDirectory]);

    // Navigate to root
    const navigateToRoot = useCallback(() => {
        setBrowsePath(normPath(currentDirectory));
        setScrollTop(0);
        if (scrollRef.current) scrollRef.current.scrollTop = 0;
    }, [currentDirectory]);

    // Breadcrumb segments
    const breadcrumbs = useMemo(() => {
        const rootNorm = normPath(currentDirectory);
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
    }, [currentDirectory, normalizedBrowsePath]);

    const isAtRoot = normPath(currentDirectory) === normalizedBrowsePath;

    // Virtual scroll math
    const totalHeight = filteredFiles.length * ROW_HEIGHT;
    const startIdx = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
    const endIdx = Math.min(
        filteredFiles.length,
        Math.ceil((scrollTop + viewHeight) / ROW_HEIGHT) + OVERSCAN
    );
    const visibleFiles = filteredFiles.slice(startIdx, endIdx);
    const topPad = startIdx * ROW_HEIGHT;

    const onScroll = useCallback(() => {
        if (scrollRef.current) setScrollTop(scrollRef.current.scrollTop);
    }, []);

    // Observe container size
    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        const ro = new ResizeObserver((entries) => {
            for (const e of entries) setViewHeight(e.contentRect.height);
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    return (
        <div className="fade-in">
            {/* Breadcrumb navigation */}
            {currentDirectory && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    marginBottom: 12,
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
                            padding: '2px 6px',
                            minWidth: 'auto',
                            opacity: isAtRoot ? 0.4 : 1,
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-primary)',
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
                            padding: '2px 6px',
                            minWidth: 'auto',
                            opacity: isAtRoot ? 0.4 : 1,
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-primary)',
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
                                    if (i < breadcrumbs.length - 1) {
                                        setBrowsePath(bc.path);
                                        setScrollTop(0);
                                        if (scrollRef.current) scrollRef.current.scrollTop = 0;
                                    }
                                }}
                            >
                                {bc.label}
                            </span>
                        </React.Fragment>
                    ))}
                </div>
            )}

            {/* Toolbar */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                <div className="search-box" style={{ flex: 1, minWidth: 200 }}>
                    <Search size={14} className="search-icon" />
                    <input
                        type="text"
                        className="search-input"
                        placeholder={t('files.searchPlaceholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <select
                    className="form-select"
                    style={{ width: 'auto', minWidth: 130 }}
                    value={filterCategory || ''}
                    onChange={(e) => setFilterCategory(e.target.value || null)}
                >
                    <option value="">{t('files.category')} - All</option>
                    {allCategories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>

                <button className="btn btn-secondary btn-sm" onClick={handleSelectAll}>
                    {selectedFileIds.size > 0 ? <CheckSquare size={14} /> : <Square size={14} />}
                    {t('files.selectAll')}
                </button>

                {selectedFileIds.size > 0 && (
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {selectedFileIds.size} {t('files.selected')}
                    </span>
                )}
            </div>

            {/* File Table */}
            <div className="card" style={{ padding: 0 }}>
                {/* Fixed header */}
                <table className="file-table">
                    <thead>
                        <tr>
                            <th style={{ width: 30 }}></th>
                            <th>{t('files.name')}</th>
                            <th>{t('files.category')}</th>
                            <th style={{ width: 100 }}>{t('files.size')}</th>
                            <th style={{ width: 150 }}>{t('files.modified')}</th>
                            <th>AI</th>
                        </tr>
                    </thead>
                </table>

                {/* Virtual scroll container */}
                <div
                    ref={scrollRef}
                    className="virtual-scroll-container"
                    onScroll={onScroll}
                >
                    {filteredFiles.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                            {scannedFiles.length === 0 ? t('dashboard.noFiles') : 'No matching files'}
                        </div>
                    ) : (
                        <div style={{ height: totalHeight, position: 'relative' }}>
                            <table
                                className="file-table"
                                style={{
                                    position: 'absolute',
                                    top: topPad,
                                    left: 0,
                                    right: 0,
                                }}
                            >
                                <tbody>
                                    {visibleFiles.map((file) => (
                                        <MemoFileRow
                                            key={file.id}
                                            file={file}
                                            isSelected={selectedFileIds.has(file.id)}
                                            onToggle={toggleFileSelection}
                                            onFolderClick={navigateInto}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// React.memo to avoid re-rendering unchanged rows
const MemoFileRow = React.memo(function FileRow({
    file,
    isSelected,
    onToggle,
    onFolderClick,
}: {
    file: ScannedFile;
    isSelected: boolean;
    onToggle: (id: string) => void;
    onFolderClick: (path: string) => void;
}) {
    const color = CATEGORY_COLORS[file.category] || '#64748b';

    return (
        <tr
            className={isSelected ? 'selected' : ''}
            style={{ height: ROW_HEIGHT, cursor: file.is_dir ? 'pointer' : undefined }}
            onDoubleClick={file.is_dir ? () => onFolderClick(file.path) : undefined}
        >
            <td>
                {!file.is_dir && (
                    <input
                        type="checkbox"
                        className="file-checkbox"
                        checked={isSelected}
                        onChange={() => onToggle(file.id)}
                    />
                )}
            </td>
            <td>
                <div className="file-name-cell">
                    {file.is_dir ? (
                        <Folder
                            size={16}
                            style={{ color: '#f59e0b', flexShrink: 0, cursor: 'pointer' }}
                            onClick={() => onFolderClick(file.path)}
                        />
                    ) : (
                        <span style={{ color, flexShrink: 0 }}>
                            {categoryIcons[file.category] || <File size={14} />}
                        </span>
                    )}
                    <span
                        style={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            cursor: file.is_dir ? 'pointer' : undefined,
                            color: file.is_dir ? '#f59e0b' : undefined,
                        }}
                        onClick={file.is_dir ? () => onFolderClick(file.path) : undefined}
                    >
                        {file.name}
                    </span>
                    {file.extension && !file.is_dir && (
                        <span
                            className="file-ext-badge"
                            style={{ background: `${color}22`, color }}
                        >
                            .{file.extension}
                        </span>
                    )}
                </div>
            </td>
            <td>
                <span
                    className="badge"
                    style={{ background: `${color}18`, color, border: `1px solid ${color}33` }}
                >
                    {file.is_dir ? 'Folder' : file.category}
                </span>
            </td>
            <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                {file.is_dir ? '—' : formatFileSize(file.size)}
            </td>
            <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                {file.modified || '—'}
            </td>
            <td>
                {file.ai_category && (
                    <span
                        className="badge"
                        style={{
                            background: 'rgba(16, 185, 129, 0.12)',
                            color: '#10b981',
                            border: '1px solid rgba(16, 185, 129, 0.25)',
                        }}
                    >
                        {file.ai_category}
                    </span>
                )}
            </td>
        </tr>
    );
});
