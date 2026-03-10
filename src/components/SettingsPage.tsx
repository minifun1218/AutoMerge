import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import { Globe, FolderTree, Gauge, Moon, Sun, Palette } from 'lucide-react';

export default function SettingsPage() {
    const { t, i18n } = useTranslation();
    const {
        recursive,
        setRecursive,
        maxDepth,
        setMaxDepth,
        maxFileSize,
        setMaxFileSize,
        theme,
        toggleTheme,
    } = useAppStore();

    return (
        <div className="fade-in">
            {/* Theme */}
            <div className="card" style={{ marginBottom: 20 }}>
                <div className="card-header">
                    <span className="card-title">
                        <Palette size={16} style={{ marginRight: 8 }} />
                        {t('settings.theme')}
                    </span>
                </div>
                <div className="tab-group" style={{ marginBottom: 0 }}>
                    <button
                        className={`tab-item ${theme === 'dark' ? 'active' : ''}`}
                        onClick={() => { if (theme !== 'dark') toggleTheme(); }}
                    >
                        <Moon size={14} style={{ marginRight: 4 }} />
                        {t('settings.dark')}
                    </button>
                    <button
                        className={`tab-item ${theme === 'light' ? 'active' : ''}`}
                        onClick={() => { if (theme !== 'light') toggleTheme(); }}
                    >
                        <Sun size={14} style={{ marginRight: 4 }} />
                        {t('settings.light')}
                    </button>
                </div>
            </div>

            {/* Language */}
            <div className="card" style={{ marginBottom: 20 }}>
                <div className="card-header">
                    <span className="card-title">
                        <Globe size={16} style={{ marginRight: 8 }} />
                        {t('settings.language')}
                    </span>
                </div>
                <div className="tab-group" style={{ marginBottom: 0 }}>
                    <button
                        className={`tab-item ${i18n.language === 'zh' ? 'active' : ''}`}
                        onClick={() => i18n.changeLanguage('zh')}
                    >
                        🇨🇳 中文
                    </button>
                    <button
                        className={`tab-item ${i18n.language === 'en' ? 'active' : ''}`}
                        onClick={() => i18n.changeLanguage('en')}
                    >
                        🇺🇸 English
                    </button>
                </div>
            </div>

            {/* Scan options */}
            <div className="card" style={{ marginBottom: 20 }}>
                <div className="card-header">
                    <span className="card-title">
                        <FolderTree size={16} style={{ marginRight: 8 }} />
                        {t('settings.recursive')}
                    </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                    <label className="toggle-switch">
                        <input
                            type="checkbox"
                            checked={recursive}
                            onChange={(e) => setRecursive(e.target.checked)}
                        />
                        <span className="toggle-slider" />
                    </label>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                        {t('settings.recursive')}
                    </span>
                </div>

                {recursive && (
                    <div className="form-group">
                        <label className="form-label">{t('settings.maxDepth')}</label>
                        <input
                            type="number"
                            className="form-input"
                            style={{ width: 120 }}
                            value={maxDepth}
                            min={1}
                            max={20}
                            onChange={(e) => setMaxDepth(parseInt(e.target.value) || 5)}
                        />
                    </div>
                )}
            </div>

            {/* AI file size limit */}
            <div className="card">
                <div className="card-header">
                    <span className="card-title">
                        <Gauge size={16} style={{ marginRight: 8 }} />
                        {t('settings.maxFileSize')}
                    </span>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                    <input
                        type="number"
                        className="form-input"
                        style={{ width: 120 }}
                        value={maxFileSize}
                        min={1}
                        max={1024}
                        onChange={(e) => setMaxFileSize(parseInt(e.target.value) || 10)}
                    />
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                        KB - {t('settings.maxFileSize')}
                    </p>
                </div>
            </div>
        </div>
    );
}
