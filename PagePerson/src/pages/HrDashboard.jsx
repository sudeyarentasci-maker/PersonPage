import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import CreateUserModal from '../components/UserManagement/CreateUserModal';
import UserList from '../components/UserManagement/UserList';
import AnnouncementManagement from '../components/Announcements/AnnouncementManagement';
import AnnouncementList from '../components/Announcements/AnnouncementList';
import { getAllLeaves } from '../services/leaveService';
import { getAllUsers } from '../services/userService';
import logo from '../../assets/logo.png';
import './Dashboard.css';
import './LeaveDashboard.css';
import './HrDashboard.css';

function HrDashboard() {
    const navigate = useNavigate();
    const { user, logout, loading: authLoading } = useAuth();
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [allLeaves, setAllLeaves] = useState([]);
    const [leaveFilter, setLeaveFilter] = useState('ALL'); // ALL, PENDING, APPROVED, REJECTED
    const [announcementRefresh, setAnnouncementRefresh] = useState(0);
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

    const handleAnnouncementCreated = () => {
        setAnnouncementRefresh(prev => prev + 1);
    };

    const handleUserCreated = (userData) => {
        console.log('Yeni kullanıcı oluşturuldu:', userData);
        setRefreshTrigger(prev => prev + 1);
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

    return (
        <div className="dashboard-wrapper">
            <div className="dashboard-header">
                <div className="header-content">
                    <div className="header-logo">
                        <img src={logo} alt="PersonPage Logo" className="logo-img" />
                        <h1>PersonPage</h1>
                    </div>
                    <div className="user-info">
                        <span className="user-role hr-badge">HR</span>
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
                    <p>İnsan Kaynakları paneline hoş geldiniz</p>
                </div>

                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">👥</div>
                        <div className="stat-info">
                            <h3>Toplam Çalışan</h3>
                            <p className="stat-number">{totalUsers}</p>
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
                        <div className="stat-icon">⏳</div>
                        <div className="stat-info">
                            <h3>Bekleyen</h3>
                            <p className="stat-number">
                                {allLeaves.filter(l => l.status === 'PENDING').length}
                            </p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">💰</div>
                        <div className="stat-info">
                            <h3>Bu Ay İzin</h3>
                            <p className="stat-number">
                                {allLeaves.filter(l => {
                                    const now = new Date();
                                    const start = new Date(l.startDate);
                                    return start.getMonth() === now.getMonth();
                                }).length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="features-grid">
                    <div className="feature-card">
                        <h3>👤 Kullanıcı Yönetimi</h3>
                        <p>Çalışanları yönet ve yeni kullanıcı ekle</p>
                        <button
                            className="feature-btn"
                            onClick={() => setIsUserModalOpen(true)}
                        >
                            👤 Kullanıcıları Yönet
                        </button>
                    </div>

                    <div className="feature-card">
                        <h3>📋 İzin Yönetimi</h3>
                        <p>Tüm şirket izinlerini görüntüle ve yönet</p>
                        <button
                            className="feature-btn"
                            onClick={() => document.getElementById('leave-section').scrollIntoView({ behavior: 'smooth' })}
                        >
                            İzinleri Görüntüle
                        </button>
                    </div>

                    <div className="feature-card">
                        <h3>📢 Duyuru Yönetimi</h3>
                        <p>Şirket duyuruları oluştur ve yönet</p>
                        <AnnouncementManagement onAnnouncementCreated={handleAnnouncementCreated} />
                    </div>

                    <div className="feature-card">
                        <h3>🚀 Projeler & Görevler</h3>
                        <p>Agile/Scrumban panosuna git</p>
                        <button
                            type="button"
                            className="feature-btn"
                            onClick={() => navigate('/board')}
                        >
                            Panoya Git
                        </button>
                    </div>
                </div>

                {/* Duyurular */}
                <AnnouncementList key={announcementRefresh} />

                {/* Kullanıcı Listesi */}
                <UserList 
                    refreshTrigger={refreshTrigger} 
                    onUsersUpdated={(users) => {
                        setTotalUsers(users.length);
                    }}
                />

                {/* İzin Listesi */}
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
        </div>
    );
}

export default HrDashboard;
