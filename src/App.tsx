import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from './store/useAppStore';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import FileExplorer from './components/FileExplorer';
import ClassifyPanel from './components/ClassifyPanel';
import AIConfigPanel from './components/AIConfigPanel';
import SettingsPage from './components/SettingsPage';
import './i18n';
import './index.css';

function App() {
  const { t } = useTranslation();
  const { currentView, theme } = useAppStore();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const viewTitles: Record<string, string> = {
    dashboard: t('nav.dashboard'),
    files: t('nav.files'),
    classify: t('nav.classify'),
    'ai-config': t('nav.aiConfig'),
    settings: t('nav.settings'),
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'files':
        return <FileExplorer />;
      case 'classify':
        return <ClassifyPanel />;
      case 'ai-config':
        return <AIConfigPanel />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <header className="header">
          <h2 className="header-title">{viewTitles[currentView] || ''}</h2>
        </header>
        <main className="page-content">{renderView()}</main>
      </div>
    </div>
  );
}

export default App;
