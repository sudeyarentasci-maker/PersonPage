import React, { useState } from 'react';
import { createAnnouncement } from '../../services/announcementService';
import './AnnouncementManagement.css';

function AnnouncementManagement({ onAnnouncementCreated }) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        priority: 'NORMAL',
        targetRoles: ['EMPLOYEE', 'MANAGER', 'HR', 'SYSTEM_ADMIN'],
        expiresAt: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const result = await createAnnouncement(formData);
            if (result.success) {
                alert('✅ Duyuru yayınlandı!');
                setIsFormOpen(false);
                setFormData({
                    title: '',
                    content: '',
                    priority: 'NORMAL',
                    targetRoles: ['EMPLOYEE', 'MANAGER', 'HR', 'SYSTEM_ADMIN'],
                    expiresAt: ''
                });

                if (onAnnouncementCreated) {
                    onAnnouncementCreated(result.data);
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Duyuru oluşturulamadı');
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

    return (
        <div className="announcement-management">
            <button className="btn-create-announcement" onClick={() => setIsFormOpen(true)}>
                📢 Duyuru Oluştur
            </button>

            {isFormOpen && (
                <div className="modal-overlay" onClick={() => setIsFormOpen(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>📢 Yeni Duyuru</h2>
                            <button className="close-btn" onClick={() => setIsFormOpen(false)}>×</button>
                        </div>

                        <form onSubmit={handleSubmit} className="announcement-form">
                            {error && <div className="error-message">⚠️ {error}</div>}

                            <div className="form-group">
                                <label>Başlık *</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Duyuru başlığı..."
                                    required
                                    maxLength="100"
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
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Öncelik</label>
                                    <select
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
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
                                        />
                                        <span>👤 Çalışanlar</span>
                                    </label>
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={formData.targetRoles.includes('MANAGER')}
                                            onChange={() => handleRoleToggle('MANAGER')}
                                        />
                                        <span>👔 Yöneticiler</span>
                                    </label>
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={formData.targetRoles.includes('HR')}
                                            onChange={() => handleRoleToggle('HR')}
                                        />
                                        <span>👥 İK</span>
                                    </label>
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={formData.targetRoles.includes('SYSTEM_ADMIN')}
                                            onChange={() => handleRoleToggle('SYSTEM_ADMIN')}
                                        />
                                        <span>⚙️ Adminler</span>
                                    </label>
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => setIsFormOpen(false)}
                                    disabled={isLoading}
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary"
                                    disabled={isLoading || formData.targetRoles.length === 0}
                                >
                                    {isLoading ? 'Yayınlanıyor...' : '📢 Duyuruyu Yayınla'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AnnouncementManagement;
