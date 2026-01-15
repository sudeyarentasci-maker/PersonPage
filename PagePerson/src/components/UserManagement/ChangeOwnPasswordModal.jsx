import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { changeOwnPassword } from '../../services/userService';
import '../UserManagement/UserManagement.css';

function ChangeOwnPasswordModal({ isOpen, onClose, onSuccess }) {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isOpen) {
            // Reset form when modal closes
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setError('');
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Yeni şifreler eşleşmiyor');
            return;
        }

        if (newPassword.length < 6) {
            setError('Yeni şifre en az 6 karakter olmalıdır');
            return;
        }

        setIsLoading(true);

        try {
            const result = await changeOwnPassword(currentPassword, newPassword);
            if (result.success) {
                alert('✅ Şifreniz başarıyla değiştirildi!');
                setCurrentPassword('');
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
                        <label>Mevcut Şifre *</label>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Mevcut şifrenizi girin"
                            required
                            disabled={isLoading}
                            autoFocus
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
                        />
                    </div>

                    <div className="form-group">
                        <label>Yeni Şifre Tekrar *</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Yeni şifrenizi tekrar girin"
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

export default ChangeOwnPasswordModal;
