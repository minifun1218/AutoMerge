import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import { checkAiHealth, listAiModels } from '../services/tauriCommands';
import { Wifi, WifiOff, RefreshCw, Server, Key, Bot, Loader } from 'lucide-react';

export default function AIConfigPanel() {
    const { t } = useTranslation();
    const { aiConfig, setAiConfig, aiConnected, setAiConnected } = useAppStore();
    const [models, setModels] = useState<string[]>([]);
    const [testing, setTesting] = useState(false);
    const [loadingModels, setLoadingModels] = useState(false);

    const handleTestConnection = async () => {
        setTesting(true);
        try {
            const result = await checkAiHealth(aiConfig);
            setAiConnected(result);
        } catch (error) {
            console.error('Health check failed:', error);
            setAiConnected(false);
        }
        setTesting(false);
    };

    const handleLoadModels = async () => {
        setLoadingModels(true);
        try {
            const result = await listAiModels(aiConfig);
            setModels(result);
            if (result.length > 0 && !result.includes(aiConfig.model)) {
                setAiConfig({ ...aiConfig, model: result[0] });
            }
        } catch (error) {
            console.error('Failed to load models:', error);
        }
        setLoadingModels(false);
    };

    return (
        <div className="fade-in">
            {/* Connection Status */}
            <div style={{ marginBottom: 20 }}>
                <div className={`ai-status ${aiConnected ? 'connected' : 'disconnected'}`}>
                    <div className={`status-dot ${aiConnected ? 'connected' : 'disconnected'}`} />
                    {aiConnected ? t('ai.connected') : t('ai.disconnected')}
                </div>
            </div>

            <div className="card" style={{ marginBottom: 20 }}>
                <div className="card-header">
                    <span className="card-title">{t('ai.title')}</span>
                </div>

                {/* Provider Selection */}
                <div className="tab-group">
                    <button
                        className={`tab-item ${aiConfig.provider_type === 'ollama' ? 'active' : ''}`}
                        onClick={() => setAiConfig({ ...aiConfig, provider_type: 'ollama', base_url: 'http://localhost:11434', api_key: null })}
                    >
                        <Server size={14} style={{ marginRight: 4 }} />
                        {t('ai.ollama')}
                    </button>
                    <button
                        className={`tab-item ${aiConfig.provider_type === 'openai' ? 'active' : ''}`}
                        onClick={() => setAiConfig({ ...aiConfig, provider_type: 'openai', base_url: 'https://api.openai.com' })}
                    >
                        <Bot size={14} style={{ marginRight: 4 }} />
                        {t('ai.openai')}
                    </button>
                    <button
                        className={`tab-item ${aiConfig.provider_type === 'custom' ? 'active' : ''}`}
                        onClick={() => setAiConfig({ ...aiConfig, provider_type: 'custom' })}
                    >
                        <Key size={14} style={{ marginRight: 4 }} />
                        {t('ai.custom')}
                    </button>
                </div>

                {/* Configuration Form */}
                <div className="form-group">
                    <label className="form-label">{t('ai.baseUrl')}</label>
                    <input
                        type="text"
                        className="form-input"
                        value={aiConfig.base_url}
                        onChange={(e) => setAiConfig({ ...aiConfig, base_url: e.target.value })}
                    />
                </div>

                {(aiConfig.provider_type === 'openai' || aiConfig.provider_type === 'custom') && (
                    <div className="form-group">
                        <label className="form-label">{t('ai.apiKey')}</label>
                        <input
                            type="password"
                            className="form-input"
                            value={aiConfig.api_key || ''}
                            onChange={(e) => setAiConfig({ ...aiConfig, api_key: e.target.value || null })}
                            placeholder="sk-..."
                        />
                    </div>
                )}

                <div className="form-group">
                    <label className="form-label">{t('ai.model')}</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                        {models.length > 0 ? (
                            <select
                                className="form-select"
                                value={aiConfig.model}
                                onChange={(e) => setAiConfig({ ...aiConfig, model: e.target.value })}
                            >
                                {models.map((m) => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>
                        ) : (
                            <input
                                type="text"
                                className="form-input"
                                value={aiConfig.model}
                                onChange={(e) => setAiConfig({ ...aiConfig, model: e.target.value })}
                                placeholder="llama3, gpt-4o-mini, ..."
                            />
                        )}
                        {aiConfig.provider_type === 'ollama' && (
                            <button className="btn btn-secondary btn-sm" onClick={handleLoadModels} disabled={loadingModels}>
                                {loadingModels ? <Loader size={14} className="spin" /> : <RefreshCw size={14} />}
                                {t('ai.loadModels')}
                            </button>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
                    <button className="btn btn-primary" onClick={handleTestConnection} disabled={testing}>
                        {testing ? (
                            <Loader size={14} className="spin" />
                        ) : aiConnected ? (
                            <Wifi size={14} />
                        ) : (
                            <WifiOff size={14} />
                        )}
                        {t('ai.testConnection')}
                    </button>
                </div>
            </div>
        </div>
    );
}
