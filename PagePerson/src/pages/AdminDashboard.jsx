import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import CreateUserModal from '../components/UserManagement/CreateUserModal';
import UserList from '../components/UserManagement/UserList';
import AnnouncementList from '../components/Announcements/AnnouncementList';
import DashboardWidgets from '../components/Dashboard/DashboardWidgets';
import SystemSettings from './SystemSettings';
import SystemLogs from './SystemLogs';
import { getAllLeaves } from '../services/leaveService';
import { getAllUsers } from '../services/userService';
import logo from '../../assets/logo.png';
import './Dashboard.css';
import './LeaveDashboard.css';

function AdminDashboard() {
    const navigate = useNavigate();
    const { user, logout, loading: authLoading } = useAuth();
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isLogsOpen, setIsLogsOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [allLeaves, setAllLeaves] = useState([]);
    const [leaveFilter, setLeaveFilter] = useState('ALL'); // ALL, PENDING, APPROVED, REJECTED
    const [totalUsers, setTotalUsers] = useState(0);

    useEffect(() => {
        fetchAllLeaves();
        fetchTotalUsers();
    }, [leaveFilter]);

    useEffect(() => {
        fetchTotalUsers();
    }, [refreshTrigger]);

    const fetchAllLeaves = async () => {
        try {
            const filters = leaveFilter !== 'ALL' ? { status: leaveFilter } : {};
            const result = await getAllLeaves(filters);
            if (result.success) {
                setAllLeaves(result.data.leaves);
            }
        } catch (err) {
            console.error('İzinler yüklenemedi:', err);
        }
    };

    const fetchTotalUsers = async () => {
        try {
            const result = await getAllUsers();
            if (result.success) {
                setTotalUsers(result.data.users.length);
            }
        } catch (err) {
            console.error('Kullanıcılar yüklenemedi:', err);
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            'PENDING': { class: 'status-pending', text: '⏳ Beklemede' },
            'APPROVED': { class: 'status-approved', text: '✅ Onaylandı' },
            'REJECTED': { class: 'status-rejected', text: '❌ Reddedildi' }
        };
        return badges[status] || badges.PENDING;
    };

    const getLeaveTypeName = (type) => {
        const types = {
            'ANNUAL': 'Yıllık İzin',
            'SICK': 'Hastalık İzni',
            'PERSONAL': 'Kişisel İzin',
            'UNPAID': 'Ücretsiz İzin'
        };
        return types[type] || type;
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
            setIsLogsOpen(true);
        }
    };

    return (
        <div className="dashboard-wrapper">
            <div className="dashboard-header">
                <div className="header-content">
                    <div className="header-logo">
                        <img src={logo} alt="PersonPage Logo" className="logo-img" />
                        <h1>PersonPage</h1>
                    </div>
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
                        {authLoading ? (
                            'Hoşgeldiniz!'
                        ) : user?.firstName ? (
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
                            <p className="stat-number">{totalUsers}</p>
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
                            📜 Logları Görüntüle
                        </button>
                    </div>
                </div>

                {/* Dashboard Widgets (Birthdays, Leaves, Holidays) */}
                <DashboardWidgets />

                {/* Duyurular */}
                <AnnouncementList />

                {/* Kullanıcı Listesi */}
                <UserList 
                    refreshTrigger={refreshTrigger} 
                    onUsersUpdated={(users) => {
                        setTotalUsers(users.length);
                    }}
                />

                {/* İzinListesi */}
                <div id="leave-section" className="leave-list-section">
                    <div className="section-header">
                        <h3>📋 Tüm Şirket İzinleri ({allLeaves.length})</h3>
                        <div className="filter-buttons">
                            <button
                                className={`filter-btn ${leaveFilter === 'ALL' ? 'active' : ''}`}
                                onClick={() => setLeaveFilter('ALL')}
                            >
                                Tümü
                            </button>
                            <button
                                className={`filter-btn ${leaveFilter === 'PENDING' ? 'active' : ''}`}
                                onClick={() => setLeaveFilter('PENDING')}
                            >
                                Beklemede
                            </button>
                            <button
                                className={`filter-btn ${leaveFilter === 'APPROVED' ? 'active' : ''}`}
                                onClick={() => setLeaveFilter('APPROVED')}
                            >
                                Onaylı
                            </button>
                            <button
                                className={`filter-btn ${leaveFilter === 'REJECTED' ? 'active' : ''}`}
                                onClick={() => setLeaveFilter('REJECTED')}
                            >
                                Reddedildi
                            </button>
                        </div>
                    </div>

                    {allLeaves.length === 0 ? (
                        <p className="empty-state">İzin kaydı bulunamadı.</p>
                    ) : (
                        <table className="leave-table">
                            <thead>
                                <tr>
                                    <th>Çalışan</th>
                                    <th>Başlangıç</th>
                                    <th>Bitiş</th>
                                    <th>Tip</th>
                                    <th>Gün</th>
                                    <th>Sebep</th>
                                    <th>Durum</th>
                                    <th>Yorum</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allLeaves.map((leave) => {
                                    const statusBadge = getStatusBadge(leave.status);
                                    return (
                                        <tr key={leave.leaveId}>
                                            <td>{leave.userName}</td>
                                            <td>{new Date(leave.startDate).toLocaleDateString('tr-TR')}</td>
                                            <td>{new Date(leave.endDate).toLocaleDateString('tr-TR')}</td>
                                            <td>{getLeaveTypeName(leave.leaveType)}</td>
                                            <td>{leave.days}</td>
                                            <td className="reason-cell">{leave.reason}</td>
                                            <td>
                                                <span className={`status-badge ${statusBadge.class}`}>
                                                    {statusBadge.text}
                                                </span>
                                            </td>
                                            <td className="comment-cell">{leave.managerComment || '-'}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
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

            {/* Sistem Logları Modal */}
            <SystemLogs
                isOpen={isLogsOpen}
                onClose={() => setIsLogsOpen(false)}
            />
        </div>
    );
}

export default AdminDashboard;
