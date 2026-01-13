import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { updateUserRoles } from '../../services/userService';
import '../UserManagement/UserManagement.css';

function ChangeRolesModal({ isOpen, onClose, user, onSuccess }) {
    const [selectedRoles, setSelectedRoles] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const availableRoles = [
        { value: 'EMPLOYEE', label: '👤 Çalışan', color: '#10b981' },
        { value: 'MANAGER', label: '👔 Yönetici', color: '#3b82f6' },
        { value: 'HR', label: '👥 İnsan Kaynakları', color: '#8b5cf6' },
        { value: 'SYSTEM_ADMIN', label: '⚙️ Sistem Admin', color: '#ef4444' }
    ];

    useEffect(() => {
        if (user && user.roles) {
            const roleNames = user.roles.map(role =>
                typeof role === 'string' ? role : role.name
            );
            setSelectedRoles(roleNames);
        }
    }, [user]);

    const handleToggleRole = (roleName) => {
        if (selectedRoles.includes(roleName)) {
            setSelectedRoles(selectedRoles.filter(r => r !== roleName));
        } else {
            setSelectedRoles([...selectedRoles, roleName]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (selectedRoles.length === 0) {
            setError('En az bir rol seçilmelidir');
            return;
        }

        setIsLoading(true);

        try {
            const result = await updateUserRoles(user.userId, selectedRoles);
            if (result.success) {
                alert('✅ Roller başarıyla değiştirildi!');
                onClose();
                if (onSuccess) onSuccess();
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Roller değiştirilemedi');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>🎭 Rol Değiştir</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit} className="user-form">
                    {error && (
                        <div className="error-message">⚠️ {error}</div>
                    )}

                    <div className="form-group">
                        <label>Kullanıcı</label>
                        <input
                            type="text"
                            value={user.email}
                            disabled
                            style={{ background: '#f9fafb', color: '#6b7280' }}
                        />
                    </div>

                    <div className="form-group">
                        <label>Roller (En az 1 seçin) *</label>
                        <div className="roles-checkbox-group">
                            {availableRoles.map((role) => (
                                <label key={role.value} className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={selectedRoles.includes(role.value)}
                                        onChange={() => handleToggleRole(role.value)}
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
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            İptal
                        </button>
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={isLoading || selectedRoles.length === 0}
                        >
                            {isLoading ? 'Kaydediliyor...' : '💾 Kaydet'}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}

export default ChangeRolesModal;
