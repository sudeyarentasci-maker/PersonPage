import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { createUser, getAllUsers } from '../../services/userService';
import './UserManagement.css';

function CreateUserModal({ isOpen, onClose, onUserCreated }) {
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [selectedRoles, setSelectedRoles] = useState(['EMPLOYEE']);
    const [manager, setManager] = useState('');
    const [startDate, setStartDate] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [title, setTitle] = useState('');
    const [address, setAddress] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [createdPassword, setCreatedPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [users, setUsers] = useState([]);

    const availableRoles = [
        { value: 'SYSTEM_ADMIN', label: 'Sistem Yöneticisi' },
        { value: 'HR', label: 'İnsan Kaynakları' },
        { value: 'MANAGER', label: 'Yönetici' },
        { value: 'EMPLOYEE', label: 'Çalışan' }
    ];

    // Fetch users for manager dropdown
    useEffect(() => {
        if (isOpen) {
            fetchUsers();
        }
    }, [isOpen]);

    const fetchUsers = async () => {
        try {
            const result = await getAllUsers();
            if (result.success) {
                setUsers(result.data.users);
            }
        } catch (err) {
            console.error('Failed to fetch users:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Validation
        if (!email || !email.includes('@')) {
            setError('Geçerli bir e-posta adresi giriniz.');
            setIsLoading(false);
            return;
        }

        if (!firstName || !lastName) {
            setError('Ad ve Soyad alanları zorunludur.');
            setIsLoading(false);
            return;
        }

        if (selectedRoles.length === 0) {
            setError('En az bir rol seçmelisiniz.');
            setIsLoading(false);
            return;
        }

        try {
            const result = await createUser({
                email,
                firstName: firstName || undefined,
                lastName: lastName || undefined,
                roleNames: selectedRoles,
                manager: manager || undefined,
                startDate: startDate || undefined,
                birthDate: birthDate || undefined,
                title: title || undefined,
                address: address || undefined,
                phoneNumber: phoneNumber || undefined
            });

            if (result.success) {
                setCreatedPassword(result.data.tempPassword);
                setShowPassword(true);
                setEmail('');
                setFirstName('');
                setLastName('');
                setSelectedRoles(['EMPLOYEE']);
                setManager('');
                setStartDate('');
                setBirthDate('');
                setTitle('');
                setAddress('');
                setPhoneNumber('');

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
        setFirstName('');
        setLastName('');
        setSelectedRoles(['EMPLOYEE']);
        setManager('');
        setStartDate('');
        setBirthDate('');
        setTitle('');
        setAddress('');
        setPhoneNumber('');
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
                            <label>Ad</label>
                            <input
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                placeholder="Kullanıcının adı"
                                disabled={isLoading}
                            />
                        </div>

                        <div className="form-group">
                            <label>Soyad</label>
                            <input
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                placeholder="Kullanıcının soyadı"
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

                        <div className="form-group">
                            <label>Ünvan</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Örn: Yazılım Geliştirici"
                                disabled={isLoading}
                            />
                        </div>

                        {/* Yönetici alanı sadece EMPLOYEE rolü seçildiğinde göster */}
                        {selectedRoles.includes('EMPLOYEE') && (
                            <div className="form-group">
                                <label>Yönetici</label>
                                <select
                                    value={manager}
                                    onChange={(e) => setManager(e.target.value)}
                                    disabled={isLoading}
                                >
                                    <option value="">Yönetici Seç (Opsiyonel)</option>
                                    {users.filter(u => u.roles.includes('MANAGER')).map((user) => (
                                        <option key={user.userId} value={user.userId}>
                                            {user.firstName && user.lastName
                                                ? `${user.firstName} ${user.lastName} (${user.email})`
                                                : user.email}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="form-group">
                            <label>İşe Başlama Tarihi</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>

                        <div className="form-group">
                            <label>Doğum Tarihi</label>
                            <input
                                type="date"
                                value={birthDate}
                                onChange={(e) => setBirthDate(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>

                        <div className="form-group">
                            <label>Telefon Numarası</label>
                            <input
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="Örn: +90 555 123 45 67"
                                disabled={isLoading}
                            />
                        </div>

                        <div className="form-group">
                            <label>Adres</label>
                            <textarea
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="Ev veya ofis adresi"
                                rows="2"
                                disabled={isLoading}
                            />
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
