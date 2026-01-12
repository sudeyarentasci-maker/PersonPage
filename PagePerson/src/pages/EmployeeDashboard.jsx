import React from 'react';
import { useAuth } from '../auth/AuthContext';
import './Dashboard.css';

function EmployeeDashboard() {
    const { user, logout } = useAuth();

    return (
        <div className="dashboard-wrapper">
            <div className="dashboard-header">
                <div className="header-content">
                    <h1>🏢 Çalışan Dashboard</h1>
                    <div className="user-info">
                        <span className="user-email">{user?.email}</span>
                        <span className="user-role employee-badge">ÇALIŞAN</span>
                        <button onClick={logout} className="logout-btn">Çıkış Yap</button>
                    </div>
                </div>
            </div>

            <div className="dashboard-content">
                <div className="welcome-section">
                    <h2>Hoş Geldiniz! 👋</h2>
                    <p>Çalışan paneline hoş geldiniz, <strong>{user?.email}</strong></p>
                </div>

                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">📅</div>
                        <div className="stat-info">
                            <h3>Kalan İzin</h3>
                            <p className="stat-number">14 gün</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">✅</div>
                        <div className="stat-info">
                            <h3>Tamamlanan Görevler</h3>
                            <p className="stat-number">32</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">⏰</div>
                        <div className="stat-info">
                            <h3>Bu Ay Çalışma</h3>
                            <p className="stat-number">168 saat</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">💰</div>
                        <div className="stat-info">
                            <h3>Bu Ay Maaş</h3>
                            <p className="stat-number">₺15,000</p>
                        </div>
                    </div>
                </div>

                <div className="features-grid">
                    <div className="feature-card">
                        <h3>👤 Profil Bilgilerim</h3>
                        <p>Kişisel bilgilerini görüntüle ve güncelle</p>
                        <button className="feature-btn">Görüntüle</button>
                    </div>

                    <div className="feature-card">
                        <h3>📝 İzin Talebi</h3>
                        <p>Yeni izin talebi oluştur ve geçmişi görüntüle</p>
                        <button className="feature-btn">Talep Oluştur</button>
                    </div>

                    <div className="feature-card">
                        <h3>💳 Bordro</h3>
                        <p>Maaş bordrosu ve ödeme geçmişi</p>
                        <button className="feature-btn">Görüntüle</button>
                    </div>

                    <div className="feature-card">
                        <h3>📊 Performans</h3>
                        <p>Performans değerlendirmeni ve hedefleri görüntüle</p>
                        <button className="feature-btn">Görüntüle</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EmployeeDashboard;
