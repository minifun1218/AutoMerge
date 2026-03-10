import { create } from 'zustand';
import type { ScannedFile, AppView, AiProviderConfig, AiClassification, CategoryStats, OrganizeTask } from '../types';

export type Theme = 'dark' | 'light';

interface AppState {
    // Navigation
    currentView: AppView;
    setCurrentView: (view: AppView) => void;

    // Theme
    theme: Theme;
    setTheme: (t: Theme) => void;
    toggleTheme: () => void;

    // File state
    scannedFiles: ScannedFile[];
    setScannedFiles: (files: ScannedFile[]) => void;
    selectedFileIds: Set<string>;
    toggleFileSelection: (id: string) => void;
    selectAllFiles: () => void;
    clearSelection: () => void;

    // Scanning
    currentDirectory: string;
    setCurrentDirectory: (dir: string) => void;
    isScanning: boolean;
    setIsScanning: (v: boolean) => void;

    // Browse path (current folder being viewed)
    browsePath: string;
    setBrowsePath: (path: string) => void;

    // Stats
    stats: CategoryStats[];
    setStats: (stats: CategoryStats[]) => void;

    // AI
    aiConfig: AiProviderConfig;
    setAiConfig: (config: AiProviderConfig) => void;
    aiConnected: boolean;
    setAiConnected: (v: boolean) => void;
    isClassifying: boolean;
    setIsClassifying: (v: boolean) => void;
    classifyProgress: { current: number; total: number };
    setClassifyProgress: (p: { current: number; total: number }) => void;
    classifications: AiClassification[];
    addClassification: (c: AiClassification) => void;
    clearClassifications: () => void;

    // Organize
    organizeTasks: OrganizeTask[];
    setOrganizeTasks: (tasks: OrganizeTask[]) => void;
    isOrganizing: boolean;
    setIsOrganizing: (v: boolean) => void;
    targetDirectory: string;
    setTargetDirectory: (dir: string) => void;

    // Settings
    recursive: boolean;
    setRecursive: (v: boolean) => void;
    maxDepth: number;
    setMaxDepth: (v: number) => void;
    maxFileSize: number;
    setMaxFileSize: (v: number) => void;

    // Search
    searchQuery: string;
    setSearchQuery: (q: string) => void;

    // Filter
    filterCategory: string | null;
    setFilterCategory: (cat: string | null) => void;

    // Update file with AI results
    updateFileAiResult: (fileId: string, category: string, summary: string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
    // Navigation
    currentView: 'dashboard',
    setCurrentView: (view) => set({ currentView: view }),

    // Theme
    theme: 'dark',
    setTheme: (t) => {
        document.documentElement.setAttribute('data-theme', t);
        set({ theme: t });
    },
    toggleTheme: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        set({ theme: next });
    },

    // File state
    scannedFiles: [],
    setScannedFiles: (files) => set({ scannedFiles: files, selectedFileIds: new Set() }),
    selectedFileIds: new Set(),
    toggleFileSelection: (id) =>
        set((state) => {
            const next = new Set(state.selectedFileIds);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return { selectedFileIds: next };
        }),
    selectAllFiles: () =>
        set((state) => ({
            selectedFileIds: new Set(state.scannedFiles.filter((f) => !f.is_dir).map((f) => f.id)),
        })),
    clearSelection: () => set({ selectedFileIds: new Set() }),

    // Scanning
    currentDirectory: '',
    setCurrentDirectory: (dir) => set({ currentDirectory: dir, browsePath: dir.replace(/\\/g, '/').replace(/\/$/, '') }),
    isScanning: false,
    setIsScanning: (v) => set({ isScanning: v }),

    // Browse path
    browsePath: '',
    setBrowsePath: (path) => set({ browsePath: path }),

    // Stats
    stats: [],
    setStats: (stats) => set({ stats }),

    // AI
    aiConfig: {
        provider_type: 'ollama',
        base_url: 'http://localhost:11434',
        api_key: null,
        model: 'llama3',
        enabled: true,
    },
    setAiConfig: (config) => set({ aiConfig: config }),
    aiConnected: false,
    setAiConnected: (v) => set({ aiConnected: v }),
    isClassifying: false,
    setIsClassifying: (v) => set({ isClassifying: v }),
    classifyProgress: { current: 0, total: 0 },
    setClassifyProgress: (p) => set({ classifyProgress: p }),
    classifications: [],
    addClassification: (c) =>
        set((state) => ({ classifications: [...state.classifications, c] })),
    clearClassifications: () => set({ classifications: [] }),

    // Organize
    organizeTasks: [],
    setOrganizeTasks: (tasks) => set({ organizeTasks: tasks }),
    isOrganizing: false,
    setIsOrganizing: (v) => set({ isOrganizing: v }),
    targetDirectory: '',
    setTargetDirectory: (dir) => set({ targetDirectory: dir }),

    // Settings
    recursive: true,
    setRecursive: (v) => set({ recursive: v }),
    maxDepth: 5,
    setMaxDepth: (v) => set({ maxDepth: v }),
    maxFileSize: 10,
    setMaxFileSize: (v) => set({ maxFileSize: v }),

    // Search
    searchQuery: '',
    setSearchQuery: (q) => set({ searchQuery: q }),

    // Filter
    filterCategory: null,
    setFilterCategory: (cat) => set({ filterCategory: cat }),

    // Update file with AI
    updateFileAiResult: (fileId, category, summary) =>
        set((state) => ({
            scannedFiles: state.scannedFiles.map((f) =>
                f.id === fileId ? { ...f, ai_category: category, ai_summary: summary } : f
            ),
        })),
}));
