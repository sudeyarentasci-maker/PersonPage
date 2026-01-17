import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { createAnnouncement } from '../../services/announcementService';
import '../UserManagement/UserManagement.css'; // Base styles
import './CreateAnnouncementModal.css'; // Custom professional styles

function CreateAnnouncementModal({ isOpen, onClose, onAnnouncementCreated }) {
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        priority: 'NORMAL',
        targetRoles: ['EMPLOYEE', 'MANAGER', 'HR', 'SYSTEM_ADMIN'],
        expiresAt: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validasyon
        if (!formData.title.trim()) {
            setError('Lütfen duyuru başlığı girin');
            return;
        }

        if (!formData.content.trim()) {
            setError('Lütfen duyuru içeriği girin');
            return;
        }

        if (!formData.expiresAt) {
            setError('⚠️ Lütfen duyuru için son geçerlilik tarihi ve saati seçin!');
            return;
        }

        // Seçilen tarihin geçmişte olup olmadığını kontrol et
        const selectedDate = new Date(formData.expiresAt);
        const now = new Date();
        if (selectedDate <= now) {
            setError('⚠️ Son geçerlilik tarihi gelecekte bir tarih olmalıdır!');
            return;
        }

        if (formData.targetRoles.length === 0) {
            setError('En az bir rol seçmelisiniz');
            return;
        }

        setIsLoading(true);

        try {
            const result = await createAnnouncement(formData);
            if (result.success) {
                alert('✅ Duyuru başarıyla yayınlandı!');
                handleClose();

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

    const handleClose = () => {
        setFormData({
            title: '',
            content: '',
            priority: 'NORMAL',
            targetRoles: ['EMPLOYEE', 'MANAGER', 'HR', 'SYSTEM_ADMIN'],
            expiresAt: ''
        });
        setError('');
        onClose();
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

    return ReactDOM.createPortal(
        <div className="modal-overlay create-announcement-modal" onClick={handleClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="modal-header">
                    <h2>📢 Yeni Duyuru Oluştur</h2>
                    <button className="close-btn" onClick={handleClose}>×</button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="user-form">
                    {error && (
                        <div className="error-message">
                            ⚠️ {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label>Duyuru Başlığı *</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Örn: Şirket Pikniği Duyurusu"
                            required
                            disabled={isLoading}
                            maxLength="100"
                        />
                    </div>

                    <div className="form-group">
                        <label>Duyuru İçeriği *</label>
                        <textarea
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            placeholder="Duyurunuzun detaylarını buraya yazın..."
                            rows="5"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Öncelik</label>
                            <select
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                disabled={isLoading}
                            >
                                <option value="LOW">⚪ Düşük</option>
                                <option value="NORMAL">🔵 Normal</option>
                                <option value="HIGH">🔴 Yüksek</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Son Geçerlilik Tarihi ve Saati *</label>
                            <input
                                type="datetime-local"
                                value={formData.expiresAt}
                                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                                min={new Date().toISOString().slice(0, 16)}
                                required
                                disabled={isLoading}
                            />
                            <small style={{ color: '#666', fontSize: '12px' }}>
                                Duyuru bu tarihe kadar görünür olacaktır
                            </small>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Kimlere Gösterilsin? (En az 1)</label>
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
                            onClick={handleClose}
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
        </div>,
        document.body
    );
}

export default CreateAnnouncementModal;
