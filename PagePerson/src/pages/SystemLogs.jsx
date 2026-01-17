import React, { useState, useEffect } from 'react';
import { getSystemLogs } from '../services/logService';
import './SystemLogs.css';

function SystemLogs({ isOpen, onClose }) {
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [filters, setFilters] = useState({
        type: 'ALL',
        search: ''
    });

    useEffect(() => {
        if (isOpen) {
            fetchLogs();
        }
    }, [isOpen, filters]);

    const fetchLogs = async () => {
        setIsLoading(true);
        try {
            const result = await getSystemLogs(filters);
            if (result.success) {
                setLogs(result.data.logs);
            }
        } catch (error) {
            console.error('Loglar yüklenemedi:', error);
            alert('Loglar yüklenirken bir hata oluştu');
        } finally {
            setIsLoading(false);
        }
    };

    const getLogTypeInfo = (type) => {
        const types = {
            'LOGIN': { label: '🔐 Giriş', class: 'log-type-login' },
            'USER_ACTION': { label: '👤 Kullanıcı İşlemi', class: 'log-type-user' },
            'SETTINGS': { label: '⚙️ Ayarlar', class: 'log-type-settings' },
            'ANNOUNCEMENT': { label: '📢 Duyuru', class: 'log-type-announcement' },
            'LEAVE': { label: '📝 İzin', class: 'log-type-leave' },
            'ERROR': { label: '❌ Hata', class: 'log-type-error' },
            'INFO': { label: 'ℹ️ Bilgi', class: 'log-type-info' }
        };
        return types[type] || { label: type, class: 'log-type-default' };
    };

    const getSeverityClass = (severity) => {
        return `severity-${severity}`;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('tr-TR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="logs-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>📜 Sistem Logları</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="logs-filters">
                    <div className="filter-group">
                        <label>Log Tipi:</label>
                        <select
                            value={filters.type}
                            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                        >
                            <option value="ALL">Tümü</option>
                            <option value="LOGIN">🔐 Giriş</option>
                            <option value="USER_ACTION">👤 Kullanıcı İşlemi</option>
                            <option value="SETTINGS">⚙️ Ayarlar</option>
                            <option value="ANNOUNCEMENT">📢 Duyuru</option>
                            <option value="LEAVE">📝 İzin</option>
                            <option value="ERROR">❌ Hata</option>
                            <option value="INFO">ℹ️ Bilgi</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Ara:</label>
                        <input
                            type="text"
                            placeholder="Kullanıcı, işlem veya detay ara..."
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        />
                    </div>

                    <button className="refresh-btn" onClick={fetchLogs}>
                        🔄 Yenile
                    </button>
                </div>

                <div className="logs-content">
                    {isLoading ? (
                        <div className="loading-state">Yükleniyor...</div>
                    ) : logs.length === 0 ? (
                        <div className="empty-state">Log kaydı bulunamadı</div>
                    ) : (
                        <div className="logs-table-container">
                            <table className="logs-table">
                                <thead>
                                    <tr>
                                        <th>Zaman</th>
                                        <th>Kullanıcı</th>
                                        <th>İşlem</th>
                                        <th>Tip</th>
                                        <th>Detaylar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.map((log) => {
                                        const typeInfo = getLogTypeInfo(log.type);
                                        return (
                                            <tr key={log.logId} className={getSeverityClass(log.severity)}>
                                                <td className="log-time">{formatDate(log.timestamp)}</td>
                                                <td className="log-user">{log.userName}</td>
                                                <td className="log-action">{log.action}</td>
                                                <td>
                                                    <span className={`log-type-badge ${typeInfo.class}`}>
                                                        {typeInfo.label}
                                                    </span>
                                                </td>
                                                <td className="log-details">{log.details}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="logs-footer">
                    <p>Toplam {logs.length} log kaydı gösteriliyor</p>
                </div>
            </div>
        </div>
    );
}

export default SystemLogs;
