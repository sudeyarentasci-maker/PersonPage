import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import CreateUserModal from '../components/UserManagement/CreateUserModal';
import UserList from '../components/UserManagement/UserList';
import AnnouncementList from '../components/Announcements/AnnouncementList';
import DashboardWidgets from '../components/Dashboard/DashboardWidgets';
import SystemSettings from './SystemSettings';
import { getAllLeaves } from '../services/leaveService';
import './Dashboard.css';
import './LeaveDashboard.css';

function AdminDashboard() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [allLeaves, setAllLeaves] = useState([]);

    useEffect(() => {
        fetchAllLeaves();
    }, []);

    const fetchAllLeaves = async () => {
        try {
            const result = await getAllLeaves();
            if (result.success) {
                setAllLeaves(result.data.leaves);
            }
        } catch (err) {
            console.error('İzinler yüklenemedi:', err);
        }
    };

    const handleUserCreated = (userData) => {
        console.log('Yeni kullanıcı oluşturuldu:', userData);
        setRefreshTrigger(prev => prev + 1);
    };

    const handleSectionClick = (section) => {
        if (section === 'users') {
            setIsUserModalOpen(true);
        } else if (section === 'roles') {
            alert('🎭 Rol Yönetimi\n\nBu özellik yakında eklenecek!\n\n- Rol oluşturma\n- Yetki atama\n- Rol düzenleme');
        } else if (section === 'settings') {
            setIsSettingsOpen(true);
        } else if (section === 'logs') {
            alert('📜 Sistem Logları\n\nLog Görüntüleme:\n\n- Kullanıcı aktiviteleri\n- Sistem hataları\n- Güvenlik olayları\n- API istekleri\n\nGerçek log sistemi yakında eklenecek!');
        }
    };

    return (
        <div className="dashboard-wrapper">
            <div className="dashboard-header">
                <div className="header-content">
                    <h1>⚙️ Sistem Yöneticisi Dashboard</h1>
                    <div className="user-info">
                        <span className="user-role admin-badge">ADMIN</span>
                        <button onClick={() => navigate('/profile')} className="profile-btn">👤 Profilim</button>
                        <button onClick={logout} className="logout-btn">Çıkış Yap</button>
                    </div>
                </div>
            </div>

            <div className="dashboard-content">
                <div className="welcome-section">
                    <h2>
                        {user?.firstName ? (
                            <>Hoşgeldin {user.firstName}!</>
                        ) : (
                            'Hoşgeldiniz!'
                        )} 👋
                    </h2>
                    <p>Sistem yöneticisi paneline hoş geldiniz</p>
                </div>

                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">👥</div>
                        <div className="stat-info">
                            <h3>Toplam Kullanıcı</h3>
                            <p className="stat-number">5</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">🎭</div>
                        <div className="stat-info">
                            <h3>Tanımlı Rol</h3>
                            <p className="stat-number">4</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">📝</div>
                        <div className="stat-info">
                            <h3>Toplam İzin</h3>
                            <p className="stat-number">{allLeaves.length}</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">📊</div>
                        <div className="stat-info">
                            <h3>Sistem Durumu</h3>
                            <p className="stat-number">✅ Aktif</p>
                        </div>
                    </div>
                </div>

                <div className="features-grid">
                    <div className="feature-card">
                        <h3>👤 Kullanıcı Yönetimi</h3>
                        <p>HR dahil tüm kullanıcıları yönet</p>
                        <button
                            className="feature-btn"
                            onClick={() => handleSectionClick('users')}
                        >
                            👤 Kullanıcıları Yönet
                        </button>
                    </div>



                    <div className="feature-card">
                        <h3>⚙️ Sistem Ayarları</h3>
                        <p>Genel sistem yapılandırması</p>
                        <button
                            className="feature-btn"
                            onClick={() => handleSectionClick('settings')}
                        >
                            ⚙️ Sistem Ayarları
                        </button>
                    </div>

                    <div className="feature-card">
                        <h3>📜 Sistem Logları</h3>
                        <p>Sistem aktivitelerini ve logları görüntüle</p>
                        <button
                            className="feature-btn"
                            onClick={() => handleSectionClick('logs')}
                        >
                            Loglar (Yakında)
                        </button>
                    </div>
                </div>

                {/* Dashboard Widgets (Birthdays, Leaves, Holidays) */}
                <DashboardWidgets />

                {/* Duyurular */}
                <AnnouncementList />

                {/* Kullanıcı Listesi */}
                <UserList refreshTrigger={refreshTrigger} />
            </div>

            {/* Kullanıcı Oluşturma Modal */}
            <CreateUserModal
                isOpen={isUserModalOpen}
                onClose={() => setIsUserModalOpen(false)}
                onUserCreated={handleUserCreated}
            />

            {/* Sistem Ayarları Modal */}
            <SystemSettings
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
            />
        </div>
    );
}

export default AdminDashboard;
