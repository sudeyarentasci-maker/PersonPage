import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { createUser } from '../../services/userService';
import './UserManagement.css';

function CreateUserModal({ isOpen, onClose, onUserCreated }) {
    const [email, setEmail] = useState('');
    const [selectedRoles, setSelectedRoles] = useState(['EMPLOYEE']);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [createdPassword, setCreatedPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const availableRoles = [
        { value: 'SYSTEM_ADMIN', label: 'Sistem Yöneticisi' },
        { value: 'HR', label: 'İnsan Kaynakları' },
        { value: 'MANAGER', label: 'Yönetici' },
        { value: 'EMPLOYEE', label: 'Çalışan' }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const result = await createUser({
                email,
                roleNames: selectedRoles
            });

            if (result.success) {
                setCreatedPassword(result.data.tempPassword);
                setShowPassword(true);
                setEmail('');
                setSelectedRoles(['EMPLOYEE']);

                // Kullanıcı oluşturuldu callback
                if (onUserCreated) {
                    onUserCreated(result.data);
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Kullanıcı oluşturulamadı');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopyPassword = () => {
        navigator.clipboard.writeText(createdPassword);
        alert('Şifre kopyalandı!');
    };

    const handleClose = () => {
        setEmail('');
        setSelectedRoles(['EMPLOYEE']);
        setError('');
        setCreatedPassword('');
        setShowPassword(false);
        onClose();
    };

    const handleRoleChange = (role) => {
        if (selectedRoles.includes(role)) {
            setSelectedRoles(selectedRoles.filter(r => r !== role));
        } else {
            setSelectedRoles([...selectedRoles, role]);
        }
    };

    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>👤 Yeni Kullanıcı Oluştur</h2>
                    <button className="close-btn" onClick={handleClose}>×</button>
                </div>

                {!showPassword ? (
                    <form onSubmit={handleSubmit} className="user-form">
                        {error && (
                            <div className="error-message">
                                ⚠️ {error}
                            </div>
                        )}

                        <div className="form-group">
                            <label>Email Adresi</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="ornek@firma.com"
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <div className="form-group">
                            <label>Roller (En az 1 seçin)</label>
                            <div className="roles-checkbox-group">
                                {availableRoles.map((role) => (
                                    <label key={role.value} className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={selectedRoles.includes(role.value)}
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
                                disabled={isLoading || selectedRoles.length === 0}
                            >
                                {isLoading ? 'Oluşturuluyor...' : 'Kullanıcı Oluştur'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="password-display">
                        <div className="success-message">
                            ✅ Kullanıcı başarıyla oluşturuldu!
                        </div>

                        <div className="password-box">
                            <label>Oluşturulan Şifre:</label>
                            <div className="password-value">
                                <code>{createdPassword}</code>
                                <button
                                    type="button"
                                    className="copy-btn"
                                    onClick={handleCopyPassword}
                                >
                                    📋 Kopyala
                                </button>
                            </div>
                            <p className="password-note">
                                ⚠️ Bu şifreyi kullanıcıya iletin. Bir daha gösterilmeyecektir!
                            </p>
                        </div>

                        <div className="modal-actions">
                            <button
                                type="button"
                                className="btn-primary"
                                onClick={handleClose}
                            >
                                Tamam
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
        , document.body);
}

export default CreateUserModal;
