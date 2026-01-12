import React from 'react';
import { useAuth } from '../auth/AuthContext';
import './Dashboard.css';

function AdminDashboard() {
    const { user, logout } = useAuth();

    return (
        <div className="dashboard-wrapper">
            <div className="dashboard-header">
                <div className="header-content">
                    <h1>⚙️ Sistem Yöneticisi Dashboard</h1>
                    <div className="user-info">
                        <span className="user-email">{user?.email}</span>
                        <span className="user-role admin-badge">ADMIN</span>
                        <button onClick={logout} className="logout-btn">Çıkış Yap</button>
                    </div>
                </div>
            </div>

            <div className="dashboard-content">
                <div className="welcome-section">
                    <h2>Hoş Geldiniz! 👋</h2>
                    <p>Sistem yöneticisi paneline hoş geldiniz, <strong>{user?.email}</strong></p>
                </div>

                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">👥</div>
                        <div className="stat-info">
                            <h3>Toplam Kullanıcı</h3>
                            <p className="stat-number">1</p>
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
                        <div className="stat-icon">🔐</div>
                        <div className="stat-info">
                            <h3>Aktif Oturum</h3>
                            <p className="stat-number">1</p>
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
                        <p>Kullanıcıları ekle, düzenle ve sil</p>
                        <button className="feature-btn">Yönet</button>
                    </div>

                    <div className="feature-card">
                        <h3>🎭 Rol Yönetimi</h3>
                        <p>Rolleri tanımla ve yetkileri düzenle</p>
                        <button className="feature-btn">Yönet</button>
                    </div>

                    <div className="feature-card">
                        <h3>⚙️ Sistem Ayarları</h3>
                        <p>Genel sistem yapılandırması</p>
                        <button className="feature-btn">Ayarlar</button>
                    </div>

                    <div className="feature-card">
                        <h3>📜 Sistem Logları</h3>
                        <p>Sistem aktivitelerini ve logları görüntüle</p>
                        <button className="feature-btn">Loglar</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;
