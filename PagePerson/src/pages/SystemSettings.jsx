import React, { useState, useEffect } from 'react';
import { getSystemSettings, updateSettingsCategory, testEmailSettings } from '../services/systemSettingsService';
import './SystemSettings.css';

function SystemSettings({ isOpen, onClose }) {
    const [activeTab, setActiveTab] = useState('general');
    const [settings, setSettings] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (isOpen) {
            fetchSettings();
        }
    }, [isOpen]);

    const fetchSettings = async () => {
        try {
            const result = await getSystemSettings();
            if (result.success) {
                setSettings(result.data);
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Ayarlar yüklenemedi' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async (category) => {
        setIsSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const result = await updateSettingsCategory(category, settings[category]);
            if (result.success) {
                setMessage({ type: 'success', text: 'Ayarlar kaydedildi!' });
                setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            }
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Kaydetme başarısız' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleTestEmail = async () => {
        try {
            const result = await testEmailSettings(settings.email);
            setMessage({
                type: result.success ? 'success' : 'error',
                text: result.message
            });
        } catch (err) {
            setMessage({ type: 'error', text: 'Email testi başarısız' });
        }
    };

    const updateSetting = (category, field, value) => {
        setSettings({
            ...settings,
            [category]: {
                ...settings[category],
                [field]: value
            }
        });
    };

    const updateNestedSetting = (category, parent, field, value) => {
        setSettings({
            ...settings,
            [category]: {
                ...settings[category],
                [parent]: {
                    ...settings[category][parent],
                    [field]: value
                }
            }
        });
    };

    if (!isOpen) return null;

    if (isLoading) {
        return (
            <div className="settings-overlay" onClick={onClose}>
                <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
                    <p>Yükleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="settings-overlay" onClick={onClose}>
            <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="settings-header">
                    <h2>⚙️ Sistem Ayarları</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                {/* Tabs */}
                <div className="settings-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`}
                        onClick={() => setActiveTab('general')}
                    >
                        🏢 Genel
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'email' ? 'active' : ''}`}
                        onClick={() => setActiveTab('email')}
                    >
                        📧 Email
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
                        onClick={() => setActiveTab('security')}
                    >
                        🔒 Güvenlik
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'backup' ? 'active' : ''}`}
                        onClick={() => setActiveTab('backup')}
                    >
                        💾 Yedekleme
                    </button>
                </div>

                {/* Message */}
                {message.text && (
                    <div className={`settings-message ${message.type}`}>
                        {message.text}
                    </div>
                )}

                {/* Tab Content */}
                <div className="settings-content">
                    {/* GENEL AYARLAR */}
                    {activeTab === 'general' && settings?.general && (
                        <div className="settings-section">
                            <h3>🏢 Genel Ayarlar</h3>

                            <div className="form-group">
                                <label>Şirket Adı</label>
                                <input
                                    type="text"
                                    value={settings.general.companyName}
                                    onChange={(e) => updateSetting('general', 'companyName', e.target.value)}
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Çalışma Başlangıç</label>
                                    <input
                                        type="time"
                                        value={settings.general.workingHours.start}
                                        onChange={(e) => updateNestedSetting('general', 'workingHours', 'start', e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Çalışma Bitiş</label>
                                    <input
                                        type="time"
                                        value={settings.general.workingHours.end}
                                        onChange={(e) => updateNestedSetting('general', 'workingHours', 'end', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Haftalık Çalışma Günü</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="7"
                                        value={settings.general.weeklyWorkDays}
                                        onChange={(e) => updateSetting('general', 'weeklyWorkDays', parseInt(e.target.value))}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Yıllık İzin Hakkı (Gün)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={settings.general.annualLeaveDays}
                                        onChange={(e) => updateSetting('general', 'annualLeaveDays', parseInt(e.target.value))}
                                    />
                                </div>
                            </div>

                            <button
                                className="btn-save"
                                onClick={() => handleSave('general')}
                                disabled={isSaving}
                            >
                                {isSaving ? 'Kaydediliyor...' : '💾 Kaydet'}
                            </button>
                        </div>
                    )}

                    {/* EMAIL AYARLARI */}
                    {activeTab === 'email' && settings?.email && (
                        <div className="settings-section">
                            <h3>📧 Email Ayarları</h3>

                            <div className="form-group">
                                <label className="checkbox-container">
                                    <input
                                        type="checkbox"
                                        checked={settings.email.enabled}
                                        onChange={(e) => updateSetting('email', 'enabled', e.target.checked)}
                                    />
                                    <span>Email gönderimini etkinleştir</span>
                                </label>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>SMTP Host</label>
                                    <input
                                        type="text"
                                        placeholder="smtp.gmail.com"
                                        value={settings.email.smtpHost}
                                        onChange={(e) => updateSetting('email', 'smtpHost', e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>SMTP Port</label>
                                    <input
                                        type="number"
                                        placeholder="587"
                                        value={settings.email.smtpPort}
                                        onChange={(e) => updateSetting('email', 'smtpPort', parseInt(e.target.value))}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>SMTP Kullanıcı</label>
                                <input
                                    type="text"
                                    placeholder="user@example.com"
                                    value={settings.email.smtpUser}
                                    onChange={(e) => updateSetting('email', 'smtpUser', e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label>SMTP Şifre</label>
                                <input
                                    type="password"
                                    placeholder="********"
                                    value={settings.email.smtpPassword}
                                    onChange={(e) => updateSetting('email', 'smtpPassword', e.target.value)}
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Gönderen Email</label>
                                    <input
                                        type="email"
                                        placeholder="noreply@company.com"
                                        value={settings.email.fromEmail}
                                        onChange={(e) => updateSetting('email', 'fromEmail', e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Gönderen İsim</label>
                                    <input
                                        type="text"
                                        placeholder="HR Agile System"
                                        value={settings.email.fromName}
                                        onChange={(e) => updateSetting('email', 'fromName', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="settings-actions">
                                <button
                                    className="btn-test"
                                    onClick={handleTestEmail}
                                >
                                    🧪 Ayarları Test Et
                                </button>
                                <button
                                    className="btn-save"
                                    onClick={() => handleSave('email')}
                                    disabled={isSaving}
                                >
                                    {isSaving ? 'Kaydediliyor...' : '💾 Kaydet'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* GÜVENLİK AYARLARI */}
                    {activeTab === 'security' && settings?.security && (
                        <div className="settings-section">
                            <h3>🔒 Güvenlik Ayarları</h3>

                            <div className="form-group">
                                <label>Minimum Şifre Uzunluğu</label>
                                <input
                                    type="number"
                                    min="6"
                                    max="20"
                                    value={settings.security.passwordMinLength}
                                    onChange={(e) => updateSetting('security', 'passwordMinLength', parseInt(e.target.value))}
                                />
                            </div>

                            <div className="form-group">
                                <label className="checkbox-container">
                                    <input
                                        type="checkbox"
                                        checked={settings.security.passwordRequireUppercase}
                                        onChange={(e) => updateSetting('security', 'passwordRequireUppercase', e.target.checked)}
                                    />
                                    <span>Büyük harf zorunlu</span>
                                </label>
                            </div>

                            <div className="form-group">
                                <label className="checkbox-container">
                                    <input
                                        type="checkbox"
                                        checked={settings.security.passwordRequireNumbers}
                                        onChange={(e) => updateSetting('security', 'passwordRequireNumbers', e.target.checked)}
                                    />
                                    <span>Rakam zorunlu</span>
                                </label>
                            </div>

                            <div className="form-group">
                                <label className="checkbox-container">
                                    <input
                                        type="checkbox"
                                        checked={settings.security.passwordRequireSpecialChars}
                                        onChange={(e) => updateSetting('security', 'passwordRequireSpecialChars', e.target.checked)}
                                    />
                                    <span>Özel karakter zorunlu</span>
                                </label>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Session Timeout (Dakika)</label>
                                    <input
                                        type="number"
                                        min="30"
                                        value={settings.security.sessionTimeout}
                                        onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Max Giriş Denemesi</label>
                                    <input
                                        type="number"
                                        min="3"
                                        max="10"
                                        value={settings.security.maxLoginAttempts}
                                        onChange={(e) => updateSetting('security', 'maxLoginAttempts', parseInt(e.target.value))}
                                    />
                                </div>
                            </div>

                            <button
                                className="btn-save"
                                onClick={() => handleSave('security')}
                                disabled={isSaving}
                            >
                                {isSaving ? 'Kaydediliyor...' : '💾 Kaydet'}
                            </button>
                        </div>
                    )}

                    {/* YEDEKLEME AYARLARI */}
                    {activeTab === 'backup' && settings?.backup && (
                        <div className="settings-section">
                            <h3>💾 Yedekleme Ayarları</h3>

                            <div className="form-group">
                                <label className="checkbox-container">
                                    <input
                                        type="checkbox"
                                        checked={settings.backup.enabled}
                                        onChange={(e) => updateSetting('backup', 'enabled', e.target.checked)}
                                    />
                                    <span>Otomatik yedekleme etkin</span>
                                </label>
                            </div>

                            <div className="form-group">
                                <label>Yedekleme Sıklığı</label>
                                <select
                                    value={settings.backup.frequency}
                                    onChange={(e) => updateSetting('backup', 'frequency', e.target.value)}
                                >
                                    <option value="daily">Günlük</option>
                                    <option value="weekly">Haftalık</option>
                                    <option value="monthly">Aylık</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Sakla ma Süresi (Gün)</label>
                                <input
                                    type="number"
                                    min="7"
                                    value={settings.backup.retentionDays}
                                    onChange={(e) => updateSetting('backup', 'retentionDays', parseInt(e.target.value))}
                                />
                            </div>

                            {settings.backup.lastBackupDate && (
                                <div className="info-box">
                                    <strong>Son Yedekleme:</strong> {new Date(settings.backup.lastBackupDate).toLocaleString('tr-TR')}
                                </div>
                            )}

                            <button
                                className="btn-save"
                                onClick={() => handleSave('backup')}
                                disabled={isSaving}
                            >
                                {isSaving ? 'Kaydediliyor...' : '💾 Kaydet'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default SystemSettings;
