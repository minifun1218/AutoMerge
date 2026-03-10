import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import {
    LayoutDashboard,
    FolderSearch,
    Cpu,
    Settings,
    Wand2,
    Moon,
    Sun,
} from 'lucide-react';
import type { AppView } from '../types';



export default function Sidebar() {
    const { t, i18n } = useTranslation();
    const { currentView, setCurrentView, theme, toggleTheme } = useAppStore();

    const navItems: { key: AppView; icon: React.ReactNode; label: string }[] = [
        { key: 'dashboard', icon: <LayoutDashboard size={18} />, label: t('nav.dashboard') },
        { key: 'files', icon: <FolderSearch size={18} />, label: t('nav.files') },
        { key: 'classify', icon: <Wand2 size={18} />, label: t('nav.classify') },
        { key: 'ai-config', icon: <Cpu size={18} />, label: t('nav.aiConfig') },
        { key: 'settings', icon: <Settings size={18} />, label: t('nav.settings') },
    ];

    const toggleLang = (lang: string) => {
        i18n.changeLanguage(lang);
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">

                <div className="logo-icon">
                    <img src="../src/assets/icon.png" alt="Logo" style={{ width: 40, height: 40 }} />
                </div>

                <div className="logo-text">
                    <h1>{t('app.title')}</h1>
                    <p>{t('app.subtitle')}</p>
                </div>
            </div>

            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <div
                        key={item.key}
                        className={`nav-item ${currentView === item.key ? 'active' : ''}`}
                        onClick={() => setCurrentView(item.key)}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        {item.label}
                    </div>
                ))}
            </nav>

            <div className="sidebar-footer">
                {/* Theme toggle */}
                <button
                    className="btn-icon"
                    onClick={toggleTheme}
                    style={{ width: '100%', marginBottom: 8, justifyContent: 'center', gap: 8, display: 'flex', padding: '8px 0' }}
                    title={theme === 'dark' ? t('settings.light') : t('settings.dark')}
                >
                    {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                    <span style={{ fontSize: 12 }}>{theme === 'dark' ? t('settings.light') : t('settings.dark')}</span>
                </button>

                {/* Language toggle */}
                <div className="lang-toggle">
                    <button
                        className={`lang-btn ${i18n.language === 'zh' ? 'active' : ''}`}
                        onClick={() => toggleLang('zh')}
                    >
                        中文
                    </button>
                    <button
                        className={`lang-btn ${i18n.language === 'en' ? 'active' : ''}`}
                        onClick={() => toggleLang('en')}
                    >
                        EN
                    </button>
                </div>
            </div>
        </aside>
    );
}
