import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { getPendingLeaves, approveLeave, rejectLeave, getTeamLeaves } from '../services/leaveService';
import AnnouncementList from '../components/Announcements/AnnouncementList';
import './Dashboard.css';
import './LeaveDashboard.css';
import './ManagerDashboard.css';

function ManagerDashboard() {
    const { user, logout } = useAuth();
    const [pendingLeaves, setPendingLeaves] = useState([]);
    const [allTeamLeaves, setAllTeamLeaves] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedLeave, setSelectedLeave] = useState(null);
    const [comment, setComment] = useState('');
    const [actionType, setActionType] = useState(''); // 'approve' or 'reject'

    useEffect(() => {
        fetchPendingLeaves();
        fetchTeamLeaves();
    }, []);

    const fetchPendingLeaves = async () => {
        try {
            const result = await getPendingLeaves();
            if (result.success) {
                setPendingLeaves(result.data.leaves);
            }
        } catch (err) {
            console.error('Pending izinler yüklenemedi:', err);
        }
    };

    const fetchTeamLeaves = async () => {
        try {
            const result = await getTeamLeaves();
            if (result.success) {
                setAllTeamLeaves(result.data.leaves);
            }
        } catch (err) {
            console.error('Ekip izinleri yüklenemedi:', err);
        }
    };

    const handleApproveClick = (leave) => {
        setSelectedLeave(leave);
        setActionType('approve');
        setComment('');
    };

    const handleRejectClick = (leave) => {
        setSelectedLeave(leave);
        setActionType('reject');
        setComment('');
    };

    const handleAction = async () => {
        if (!selectedLeave) return;

        setIsLoading(true);
        try {
            if (actionType === 'approve') {
                await approveLeave(selectedLeave.leaveId, comment);
                alert('✅ İzin onaylandı!');
            } else {
                await rejectLeave(selectedLeave.leaveId, comment);
                alert('❌ İzin reddedildi!');
            }

            setSelectedLeave(null);
            setComment('');
            fetchPendingLeaves();
            fetchTeamLeaves();
        } catch (err) {
            alert('Hata: ' + (err.response?.data?.message || 'İşlem başarısız'));
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
                    <h1>👔 Yönetici Dashboard</h1>
                    <div className="user-info">
                        <span className="user-email">{user?.email}</span>
                        <span className="user-role manager-badge">MANAGER</span>
                        <button onClick={logout} className="logout-btn">Çıkış Yap</button>
                    </div>
                </div>
            </div>

            <div className="dashboard-content">
                <div className="welcome-section">
                    <h2>Hoş Geldiniz! 👋</h2>
                    <p>Yönetici paneline hoş geldiniz, <strong>{user?.email}</strong></p>
                </div>

                {/* İstatistikler */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">👥</div>
                        <div className="stat-info">
                            <h3>Ekip Üyeleri</h3>
                            <p className="stat-number">2</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">⏳</div>
                        <div className="stat-info">
                            <h3>Bekleyen Onay</h3>
                            <p className="stat-number">{pendingLeaves.length}</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">✅</div>
                        <div className="stat-info">
                            <h3>Onaylanan</h3>
                            <p className="stat-number">
                                {allTeamLeaves.filter(l => l.status === 'APPROVED').length}
                            </p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">📊</div>
                        <div className="stat-info">
                            <h3>Toplam Talep</h3>
                            <p className="stat-number">{allTeamLeaves.length}</p>
                        </div>
                    </div>
                </div>

                {/* Bekleyen İzin Talepleri */}
                {/* Bekleyen İzin Talepleri */}
                <div className="leave-list-section" style={{ marginBottom: '25px' }}>
                    <h3>⏳ Onay Bekleyen İzinler ({pendingLeaves.length})</h3>
                    {pendingLeaves.length === 0 ? (
                        <p className="empty-state">Bekleyen izin talebi yok.</p>
                    ) : (
                        <div className="pending-leaves-grid">
                            {pendingLeaves.map((leave) => (
                                <div key={leave.leaveId} className="leave-approval-card">
                                    <div className="leave-card-header">
                                        <h4>{leave.userName}</h4>
                                        <span className="leave-type-badge">
                                            {getLeaveTypeName(leave.leaveType)}
                                        </span>
                                    </div>
                                    <div className="leave-card-body">
                                        <p><strong>📅 Tarih:</strong> {new Date(leave.startDate).toLocaleDateString('tr-TR')} - {new Date(leave.endDate).toLocaleDateString('tr-TR')}</p>
                                        <p><strong>⏱️ Gün:</strong> {leave.days} gün</p>
                                        <p><strong>🎯 Kalan İzin:</strong> {leave.remainingDays !== undefined ? `${leave.remainingDays} gün` : '...'}</p>
                                        <p><strong>📝 Sebep:</strong> {leave.reason}</p>
                                    </div>
                                    <div className="leave-card-actions">
                                        <button
                                            className="btn-approve"
                                            onClick={() => handleApproveClick(leave)}
                                        >
                                            ✅ Onayla
                                        </button>
                                        <button
                                            className="btn-reject"
                                            onClick={() => handleRejectClick(leave)}
                                        >
                                            ❌ Reddet
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Duyurular */}
                <AnnouncementList />

                {/* Tüm Ekip İzinleri */}
                <div className="leave-list-section">
                    <h3>📋 Ekip İzin Geçmişi ({allTeamLeaves.length})</h3>
                    {allTeamLeaves.length === 0 ? (
                        <p className="empty-state">Henüz izin kaydı yok.</p>
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
                                {allTeamLeaves.map((leave) => {
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

            {/* Onay/Red Modal */}
            {selectedLeave && (
                <div className="modal-overlay" onClick={() => setSelectedLeave(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>
                                {actionType === 'approve' ? '✅ İzni Onayla' : '❌ İzni Reddet'}
                            </h2>
                            <button className="close-btn" onClick={() => setSelectedLeave(null)}>×</button>
                        </div>

                        <div className="leave-detail">
                            <p><strong>Çalışan:</strong> {selectedLeave.userName}</p>
                            <p><strong>Tarih:</strong> {new Date(selectedLeave.startDate).toLocaleDateString('tr-TR')} - {new Date(selectedLeave.endDate).toLocaleDateString('tr-TR')}</p>
                            <p><strong>Gün:</strong> {selectedLeave.days} gün</p>
                            <p><strong>Kalan İzin:</strong> {selectedLeave.remainingDays !== undefined ? `${selectedLeave.remainingDays} gün` : '...'}</p>
                            <p><strong>Sebep:</strong> {selectedLeave.reason}</p>
                        </div>

                        <div className="form-group">
                            <label>Yorum (Opsiyonel)</label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder={actionType === 'approve' ? 'Onay nedeni...' : 'Red nedeni...'}
                                rows="3"
                            />
                        </div>

                        <div className="modal-actions">
                            <button
                                className="btn-secondary"
                                onClick={() => setSelectedLeave(null)}
                                disabled={isLoading}
                            >
                                İptal
                            </button>
                            <button
                                className={actionType === 'approve' ? 'btn-approve' : 'btn-reject'}
                                onClick={handleAction}
                                disabled={isLoading}
                            >
                                {isLoading ? 'İşleniyor...' : (actionType === 'approve' ? 'Onayla' : 'Reddet')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ManagerDashboard;
