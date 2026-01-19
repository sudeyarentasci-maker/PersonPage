import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { createLeaveRequest, getMyLeaves, getLeaveStats } from '../services/leaveService';
import AnnouncementList from '../components/Announcements/AnnouncementList';
import DashboardWidgets from '../components/Dashboard/DashboardWidgets';
import logo from '../../assets/logo.png';
import './Dashboard.css';
import './LeaveDashboard.css';

function EmployeeDashboard() {
    const navigate = useNavigate();
    const { user, logout, loading: authLoading } = useAuth();
    const [leaves, setLeaves] = useState([]);
    const [stats, setStats] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Form state
    const [formData, setFormData] = useState({
        startDate: '',
        endDate: '',
        leaveType: 'ANNUAL',
        reason: ''
    });

    useEffect(() => {
        fetchLeaves();
        fetchStats();
    }, []);

    const fetchLeaves = async () => {
        try {
            const result = await getMyLeaves();
            if (result.success) {
                setLeaves(result.data.leaves);
            }
        } catch (err) {
            console.error('İzinler yüklenemedi:', err);
        }
    };

    const fetchStats = async () => {
        try {
            const result = await getLeaveStats();
            if (result.success) {
                setStats(result.data);
            }
        } catch (err) {
            console.error('İstatistikler yüklenemedi:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const result = await createLeaveRequest(formData);
            if (result.success) {
                alert('✅ İzin talebi oluşturuldu!');
                setIsFormOpen(false);
                setFormData({
                    startDate: '',
                    endDate: '',
                    leaveType: 'ANNUAL',
                    reason: ''
                });
                fetchLeaves();
                fetchStats();
            }
        } catch (err) {
            setError(err.response?.data?.message || 'İzin talebi oluşturulamadı');
        } finally {
            setIsLoading(false);
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

    return (
        <div className="dashboard-wrapper">
            <div className="dashboard-header">
                <div className="header-content">
                    <div className="header-logo">
                        <img src={logo} alt="PersonPage Logo" className="logo-img" />
                        <h1>PersonPage</h1>
                    </div>
                    <div className="user-info">
                        <span className="user-role employee-badge">EMPLOYEE</span>
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
                    <p>Çalışan paneline hoş geldiniz</p>
                </div>

                {/* İstatistikler */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">📅</div>
                        <div className="stat-info">
                            <h3>Yıllık İzin Hakkı</h3>
                            <p className="stat-number">{stats?.annualLeaveLimit || 20} gün</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">✅</div>
                        <div className="stat-info">
                            <h3>Kullanılan İzin</h3>
                            <p className="stat-number">{stats?.usedDays || 0} gün</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">🎯</div>
                        <div className="stat-info">
                            <h3>Kalan İzin</h3>
                            <p className="stat-number">{stats?.remainingDays || 20} gün</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">📝</div>
                        <div className="stat-info">
                            <h3>Toplam Talep</h3>
                            <p className="stat-number">{leaves.length}</p>
                        </div>
                    </div>
                </div>

                {/* İzin Talebi Oluştur */}
                <div className="features-grid">
                    <div className="feature-card">
                        <h3>📝 İzin Talebi Oluştur</h3>
                        <p>Yeni bir izin talebi oluşturun</p>
                        <button
                            className="feature-btn"
                            onClick={() => setIsFormOpen(true)}
                        >
                            + Yeni İzin Talebi
                        </button>
                    </div>

                    <div className="feature-card">
                        <h3>📋 İzin Geçmişim</h3>
                        <p>Geçmiş izin taleplerinizi görüntüleyin</p>
                        <button
                            className="feature-btn"
                            onClick={() => document.getElementById('leave-history-section').scrollIntoView({ behavior: 'smooth' })}
                        >
                            Geçmişi Gör
                        </button>
                    </div>

                    <div className="feature-card">
                        <h3>📢 Duyurular</h3>
                        <p>Şirket duyurularını okuyun</p>
                        <button className="feature-btn">Duyuruları Gör</button>
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
                <AnnouncementList />

                {/* Dashboard Widgets */}
                <DashboardWidgets />

                {/* İzin Listesi */}
                <div id="leave-history-section" className="leave-list-section">
                    <h3>📋 İzin Geçmişim ({leaves.length})</h3>
                    {leaves.length === 0 ? (
                        <p className="empty-state">Henüz izin talebiniz yok.</p>
                    ) : (
                        <table className="leave-table">
                            <thead>
                                <tr>
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
                                {leaves.map((leave) => {
                                    const statusBadge = getStatusBadge(leave.status);
                                    return (
                                        <tr key={leave.leaveId}>
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

            {/* İzin Formu Modal */}
            {isFormOpen && (
                <div className="modal-overlay" onClick={() => setIsFormOpen(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>📝 Yeni İzin Talebi</h2>
                            <button className="close-btn" onClick={() => setIsFormOpen(false)}>×</button>
                        </div>

                        <form onSubmit={handleSubmit} className="leave-form">
                            {error && <div className="error-message">⚠️ {error}</div>}

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Başlangıç Tarihi</label>
                                    <input
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        required
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Bitiş Tarihi</label>
                                    <input
                                        type="date"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        required
                                        min={formData.startDate || new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>İzin Tipi</label>
                                <select
                                    value={formData.leaveType}
                                    onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                                    required
                                >
                                    <option value="ANNUAL">Yıllık İzin</option>
                                    <option value="SICK">Hastalık İzni</option>
                                    <option value="PERSONAL">Kişisel İzin</option>
                                    <option value="UNPAID">Ücretsiz İzin</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Sebep</label>
                                <textarea
                                    value={formData.reason}
                                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                    placeholder="İzin sebebinizi yazın..."
                                    rows="4"
                                    required
                                />
                            </div>

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => setIsFormOpen(false)}
                                    disabled={isLoading}
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Gönderiliyor...' : 'Talep Oluştur'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default EmployeeDashboard;
