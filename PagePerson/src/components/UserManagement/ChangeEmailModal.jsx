import React, { useState } from 'react';
import { updateUserEmail } from '../../services/userService';
import '../UserManagement/UserManagement.css';

function ChangeEmailModal({ isOpen, onClose, user, onSuccess }) {
    const [newEmail, setNewEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const result = await updateUserEmail(user.userId, newEmail);
            if (result.success) {
                alert('✅ Email başarıyla değiştirildi!');
                setNewEmail('');
                onClose();
                if (onSuccess) onSuccess();
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Email değiştirilemedi');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>📧 E-posta Değiştir</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit} className="user-form">
                    {error && (
                        <div className="error-message">⚠️ {error}</div>
                    )}

                    <div className="form-group">
                        <label>Mevcut E-posta</label>
                        <input
                            type="text"
                            value={user.email}
                            disabled
                            style={{ background: '#f9fafb', color: '#6b7280' }}
                        />
                    </div>

                    <div className="form-group">
                        <label>Yeni E-posta *</label>
                        <input
                            type="email"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            placeholder="yeni@email.com"
                            required
                            disabled={isLoading}
                            autoFocus
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
        </div>
    );
}

export default ChangeEmailModal;
