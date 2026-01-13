import React, { useState } from 'react';
import { createAnnouncement } from '../../services/announcementService';
import '../UserManagement/UserManagement.css'; // AYNI CSS KULLAN!

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

    const availableRoles = [
        { value: 'SYSTEM_ADMIN', label: '⚙️ Adminler' },
        { value: 'HR', label: '👥 İK' },
        { value: 'MANAGER', label: '👔 Yöneticiler' },
        { value: 'EMPLOYEE', label: '👤 Çalışanlar' }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
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

    const handleRoleChange = (role) => {
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
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>📢 Yeni Duyuru Oluştur</h2>
                    <button className="close-btn" onClick={handleClose}>×</button>
                </div>

                <form onSubmit={handleSubmit} className="user-form">
                    {error && (
                        <div className="error-message">
                            ⚠️ {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label>Duyuru Başlığı</label>
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
                        <label>Duyuru İçeriği</label>
                        <textarea
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            placeholder="Duyurunuzun detaylarını buraya yazın..."
                            rows="5"
                            required
                            disabled={isLoading}
                            style={{
                                padding: '10px 14px',
                                border: '2px solid #e0e0e0',
                                borderRadius: '8px',
                                fontSize: '15px',
                                fontFamily: 'inherit',
                                resize: 'vertical',
                                minHeight: '120px'
                            }}
                        />
                    </div>

                    <div className="form-group">
                        <label>Öncelik Seviyesi</label>
                        <select
                            value={formData.priority}
                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                            disabled={isLoading}
                            style={{
                                padding: '10px 14px',
                                border: '2px solid #e0e0e0',
                                borderRadius: '8px',
                                fontSize: '15px'
                            }}
                        >
                            <option value="LOW">⚪ Düşük Öncelik</option>
                            <option value="NORMAL">🔵 Normal Öncelik</option>
                            <option value="HIGH">🔴 Yüksek Öncelik</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Geçerlilik Tarihi (Opsiyonel)</label>
                        <input
                            type="date"
                            value={formData.expiresAt}
                            onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                            min={new Date().toISOString().split('T')[0]}
                            disabled={isLoading}
                        />
                    </div>

                    <div className="form-group">
                        <label>Kimlere Gösterilsin? (En az 1 seçin)</label>
                        <div className="roles-checkbox-group">
                            {availableRoles.map((role) => (
                                <label key={role.value} className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={formData.targetRoles.includes(role.value)}
                                        onChange={() => handleRoleChange(role.value)}
                                        disabled={isLoading}
                                    />
                                    <span>{role.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

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
                            style={{
                                background: isLoading ? '#ccc' : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                            }}
                        >
                            {isLoading ? 'Yayınlanıyor...' : '📢 Duyuruyu Yayınla'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreateAnnouncementModal;
