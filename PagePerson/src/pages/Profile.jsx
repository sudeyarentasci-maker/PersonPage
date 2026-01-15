import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { getMyProfile, getAllUsers } from '../services/userService';
import ChangeOwnPasswordModal from '../components/UserManagement/ChangeOwnPasswordModal';
import './Profile.css';

function Profile() {
    const { user: authUser } = useAuth();
    const [user, setUser] = useState(null);
    const [manager, setManager] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    useEffect(() => {
        if (authUser) {
            fetchUserProfile();
        }
    }, [authUser]);

    const fetchUserProfile = async () => {
        try {
            const result = await getMyProfile();
            if (result.success) {
                setUser(result.data.user);

                // Fetch manager info if exists (only works for HR/ADMIN)
                if (result.data.user.manager) {
                    try {
                        const users = await getAllUsers();
                        const managerUser = users.data.users.find(u => u.userId === result.data.user.manager);
                        setManager(managerUser);
                    } catch (managerErr) {
                        // User doesn't have permission to get all users, that's okay
                        console.log('Could not fetch manager info (permission denied)');
                    }
                }
            }
        } catch (err) {
            console.error('Failed to fetch profile:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    if (isLoading) {
        return (
            <div className="profile-container">
                <div className="loading">Yükleniyor...</div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="profile-container">
                <div className="error">Kullanıcı bilgisi yüklenemedi</div>
            </div>
        );
    }

    return (
        <div className="profile-container">
            <div className="profile-header">
                <div className="profile-avatar">
                    <span>{user.firstName ? user.firstName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}</span>
                </div>
                <div className="profile-header-info">
                    <h1>{user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email}</h1>
                    <p className="user-id">Kullanıcı ID: {user.userId}</p>
                    <div className="roles-display">
                        {user.roles && user.roles.map(role => (
                            <span key={role.name} className={`role-badge role-${role.name.toLowerCase()}`}>
                                {role.name}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="profile-content">
                <div className="profile-section">
                    <h2>📋 Genel Bilgiler</h2>
                    <div className="info-grid">
                        <div className="info-item">
                            <label>Ad</label>
                            <div className="info-value">{user.firstName || '-'}</div>
                        </div>
                        <div className="info-item">
                            <label>Soyad</label>
                            <div className="info-value">{user.lastName || '-'}</div>
                        </div>
                        <div className="info-item">
                            <label>E-posta</label>
                            <div className="info-value">{user.email}</div>
                        </div>
                        <div className="info-item">
                            <label>Ünvan</label>
                            <div className="info-value">{user.title || '-'}</div>
                        </div>
                        <div className="info-item">
                            <label>Durum</label>
                            <div className="info-value">
                                <span className={`status-badge ${user.status?.toLowerCase()}`}>
                                    {user.status === 'ACTIVE' ? 'Aktif' : 'Pasif'}
                                </span>
                            </div>
                        </div>
                        <div className="info-item">
                            <label>İşe Başlama Tarihi</label>
                            <div className="info-value">{formatDate(user.startDate)}</div>
                        </div>
                    </div>
                </div>

                <div className="profile-section">
                    <h2>👔 Çalışma Bilgileri</h2>
                    <div className="info-grid">
                        <div className="info-item">
                            <label>Yönetici</label>
                            <div className="info-value">{manager ? manager.email : '-'}</div>
                        </div>
                        <div className="info-item">
                            <label>Telefon</label>
                            <div className="info-value">{user.phoneNumber || '-'}</div>
                        </div>
                        <div className="info-item full-width">
                            <label>Adres</label>
                            <div className="info-value">{user.address || '-'}</div>
                        </div>
                    </div>
                </div>

                <div className="profile-section">
                    <h2>🔐 Güvenlik</h2>
                    <div className="security-actions">
                        <button
                            className="change-password-btn"
                            onClick={() => setShowPasswordModal(true)}
                        >
                            🔑 Şifremi Değiştir
                        </button>
                    </div>
                </div>

                <div className="profile-section">
                    <h2>📅 Hesap Bilgileri</h2>
                    <div className="info-grid">
                        <div className="info-item">
                            <label>Oluşturulma Tarihi</label>
                            <div className="info-value">{formatDate(user.createdAt)}</div>
                        </div>
                        <div className="info-item">
                            <label>Son Güncelleme</label>
                            <div className="info-value">{formatDate(user.updatedAt)}</div>
                        </div>
                    </div>
                </div>
            </div>

            <ChangeOwnPasswordModal
                isOpen={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
                onSuccess={() => {
                    // Password changed successfully
                }}
            />
        </div>
    );
}

export default Profile;
