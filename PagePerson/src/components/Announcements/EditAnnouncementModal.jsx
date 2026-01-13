import React, { useState, useEffect } from 'react';
import { updateAnnouncement } from '../../services/announcementService';
import '../UserManagement/UserManagement.css';

function EditAnnouncementModal({ isOpen, onClose, announcement, onAnnouncementUpdated }) {
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        priority: 'NORMAL',
        targetRoles: [],
        expiresAt: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Modal açıldığında mevcut duyuru verilerini form'a yükle
    useEffect(() => {
        if (announcement) {
            setFormData({
                title: announcement.title || '',
                content: announcement.content || '',
                priority: announcement.priority || 'NORMAL',
                targetRoles: announcement.targetRoles || [],
                expiresAt: announcement.expiresAt
                    ? new Date(announcement.expiresAt).toISOString().split('T')[0]
                    : ''
            });
        }
    }, [announcement]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const result = await updateAnnouncement(announcement.announcementId, formData);
            if (result.success) {
                alert('✅ Duyuru güncellendi!');
                onClose();

                if (onAnnouncementUpdated) {
                    onAnnouncementUpdated();
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Duyuru güncellenemedi');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRoleToggle = (role) => {
        if (formData.targetRoles.includes(role)) {
            setFormData({
                ...formData,
                targetRoles: formData.targetRoles.filter(r => r !== role)
            });
        } else {
            setFormData({
                ...formData,
                targetRoles: [...formData.targetRoles, role]
            });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="modal-header">
                    <h2>✏️ Duyuru Düzenle</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="user-form">
                    {error && (
                        <div className="error-message">
                            ⚠️ {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label>Başlık *</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Duyuru başlığı..."
                            required
                            maxLength="100"
                            disabled={isLoading}
                        />
                    </div>

                    <div className="form-group">
                        <label>İçerik *</label>
                        <textarea
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            placeholder="Duyuru içeriği..."
                            rows="6"
                            required
                            disabled={isLoading}
                            style={{
                                width: '100%',
                                padding: '10px 14px',
                                border: '2px solid #e0e0e0',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontFamily: 'inherit',
                                resize: 'vertical',
                                minHeight: '120px'
                            }}
                        />
                    </div>

                    <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div className="form-group">
                            <label>Öncelik</label>
                            <select
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                disabled={isLoading}
                                style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    border: '2px solid #e0e0e0',
                                    borderRadius: '8px',
                                    fontSize: '14px'
                                }}
                            >
                                <option value="LOW">⚪ Düşük</option>
                                <option value="NORMAL">🔵 Normal</option>
                                <option value="HIGH">🔴 Yüksek</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Son Geçerlilik (Opsiyonel)</label>
                            <input
                                type="date"
                                value={formData.expiresAt}
                                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                                min={new Date().toISOString().split('T')[0]}
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Hedef Roller (En az 1)</label>
                        <div className="roles-checkbox-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={formData.targetRoles.includes('EMPLOYEE')}
                                    onChange={() => handleRoleToggle('EMPLOYEE')}
                                    disabled={isLoading}
                                />
                                <span>👤 Çalışanlar</span>
                            </label>
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={formData.targetRoles.includes('MANAGER')}
                                    onChange={() => handleRoleToggle('MANAGER')}
                                    disabled={isLoading}
                                />
                                <span>👔 Yöneticiler</span>
                            </label>
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={formData.targetRoles.includes('HR')}
                                    onChange={() => handleRoleToggle('HR')}
                                    disabled={isLoading}
                                />
                                <span>👥 İK</span>
                            </label>
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={formData.targetRoles.includes('SYSTEM_ADMIN')}
                                    onChange={() => handleRoleToggle('SYSTEM_ADMIN')}
                                    disabled={isLoading}
                                />
                                <span>⚙️ Adminler</span>
                            </label>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="modal-actions">
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            İptal
                        </button>
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={isLoading || formData.targetRoles.length === 0}
                            style={{
                                background: isLoading ? '#ccc' : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                            }}
                        >
                            {isLoading ? 'Güncelleniyor...' : '✏️ Duyuruyu Güncelle'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditAnnouncementModal;
