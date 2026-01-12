import React from 'react';
import { useAuth } from '../auth/AuthContext';
import './Dashboard.css';

function HrDashboard() {
    const { user, logout } = useAuth();

    return (
        <div className="dashboard-wrapper">
            <div className="dashboard-header">
                <div className="header-content">
                    <h1>👥 İnsan Kaynakları Dashboard</h1>
                    <div className="user-info">
                        <span className="user-email">{user?.email}</span>
                        <span className="user-role hr-badge">HR</span>
                        <button onClick={logout} className="logout-btn">Çıkış Yap</button>
                    </div>
                </div>
            </div>

            <div className="dashboard-content">
                <div className="welcome-section">
                    <h2>Hoş Geldiniz! 👋</h2>
                    <p>İnsan Kaynakları paneline hoş geldiniz, <strong>{user?.email}</strong></p>
                </div>

                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">👥</div>
                        <div className="stat-info">
                            <h3>Toplam Çalışan</h3>
                            <p className="stat-number">156</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">📝</div>
                        <div className="stat-info">
                            <h3>Bekleyen İzinler</h3>
                            <p className="stat-number">12</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">🎯</div>
                        <div className="stat-info">
                            <h3>Açık Pozisyon</h3>
                            <p className="stat-number">8</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">💰</div>
                        <div className="stat-info">
                            <h3>Bu Ay Bordro</h3>
                            <p className="stat-number">₺2.4M</p>
                        </div>
                    </div>
                </div>

                <div className="features-grid">
                    <div className="feature-card">
                        <h3>🧑‍💼 Çalışan Yönetimi</h3>
                        <p>Çalışanları görüntüle, ekle ve düzenle</p>
                        <button className="feature-btn">Görüntüle</button>
                    </div>

                    <div className="feature-card">
                        <h3>📋 İzin Yönetimi</h3>
                        <p>İzin taleplerini onayla veya reddet</p>
                        <button className="feature-btn">Görüntüle</button>
                    </div>

                    <div className="feature-card">
                        <h3>💳 Bordro Sistemi</h3>
                        <p>Maaş ve bordro işlemlerini yönet</p>
                        <button className="feature-btn">Görüntüle</button>
                    </div>

                    <div className="feature-card">
                        <h3>📊 Raporlar</h3>
                        <p>İK raporlarını ve analizleri görüntüle</p>
                        <button className="feature-btn">Görüntüle</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HrDashboard;
