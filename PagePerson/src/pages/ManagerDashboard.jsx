import React from 'react';
import { useAuth } from '../auth/AuthContext';
import './Dashboard.css';

function ManagerDashboard() {
    const { user, logout } = useAuth();

    return (
        <div className="dashboard-wrapper">
            <div className="dashboard-header">
                <div className="header-content">
                    <h1>📊 Manager Dashboard</h1>
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
                    <p>Manager paneline hoş geldiniz, <strong>{user?.email}</strong></p>
                </div>

                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">👥</div>
                        <div className="stat-info">
                            <h3>Ekip Üyesi</h3>
                            <p className="stat-number">24</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">✅</div>
                        <div className="stat-info">
                            <h3>Aktif Görevler</h3>
                            <p className="stat-number">18</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">⏰</div>
                        <div className="stat-info">
                            <h3>Bekleyen Onaylar</h3>
                            <p className="stat-number">5</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">📈</div>
                        <div className="stat-info">
                            <h3>Tamamlanma Oranı</h3>
                            <p className="stat-number">87%</p>
                        </div>
                    </div>
                </div>

                <div className="features-grid">
                    <div className="feature-card">
                        <h3>👨‍👩‍👧‍👦 Ekip Yönetimi</h3>
                        <p>Ekip üyelerini yönet ve performansları takip et</p>
                        <button className="feature-btn">Görüntüle</button>
                    </div>

                    <div className="feature-card">
                        <h3>📝 İzin Onayları</h3>
                        <p>Ekip üyelerinin izin taleplerini onayla</p>
                        <button className="feature-btn">Görüntüle</button>
                    </div>

                    <div className="feature-card">
                        <h3>📊 Performans Takibi</h3>
                        <p>Ekip performansını ve hedefleri izle</p>
                        <button className="feature-btn">Görüntüle</button>
                    </div>

                    <div className="feature-card">
                        <h3>📅 Görev Planlama</h3>
                        <p>Görevleri planlama ve atama yap</p>
                        <button className="feature-btn">Görüntüle</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ManagerDashboard;
