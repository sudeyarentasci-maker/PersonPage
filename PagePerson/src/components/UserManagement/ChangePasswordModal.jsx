import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { updateUserPassword } from '../../services/userService';
import '../UserManagement/UserManagement.css';

function ChangePasswordModal({ isOpen, onClose, user, onSuccess }) {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Şifreler eşleşmiyor');
            return;
        }

        if (newPassword.length < 6) {
            setError('Şifre en az 6 karakter olmalıdır');
            return;
        }

        setIsLoading(true);

        try {
            const result = await updateUserPassword(user.userId, newPassword);
            if (result.success) {
                alert('✅ Şifre başarıyla değiştirildi!');
                setNewPassword('');
                setConfirmPassword('');
                onClose();
                if (onSuccess) onSuccess();
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Şifre değiştirilemedi');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>🔑 Şifre Değiştir</h2>
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
                        <label>Yeni Şifre *</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="En az 6 karakter"
                            required
                            disabled={isLoading}
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label>Şifre Tekrar *</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Şifrenizi tekrar girin"
                            required
                            disabled={isLoading}
                        />
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
                            disabled={isLoading}
                        >
                            {isLoading ? 'Değiştiriliyor...' : '💾 Kaydet'}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}

export default ChangePasswordModal;
