import React, { useState, useEffect } from 'react';
import { getDashboardWidgets } from '../../services/dashboardService';
import './DashboardWidgets.css';

function DashboardWidgets() {
    const [data, setData] = useState({
        birthdays: [],
        leaves: [],
        nextHoliday: null
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadWidgets = async () => {
            const result = await getDashboardWidgets();
            if (result.success) {
                setData(result.data);
            }
            setLoading(false);
        };
        loadWidgets();
    }, []);

    if (loading) return <div className="loading-widgets">Yükleniyor...</div>;

    const formatDate = (dateString, includeYear = false) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'long',
            year: includeYear ? 'numeric' : undefined
        });
    };

    const getDaysLeftText = (days) => {
        if (days === 0) return 'Bugün';
        if (days === 1) return 'Yarın';
        return `${days} gün`;
    };

    return (
        <div className="dashboard-widgets-grid">
            {/* Birthdays Widget */}
            <div className="widget-card">
                <div className="widget-header">
                    <div className="widget-icon icon-cake">🎂</div>
                    <h3>Yaklaşan Doğum Günleri</h3>
                </div>
                <div className="widget-content">
                    {data.birthdays.length > 0 ? (
                        <div className="widget-list">
                            {data.birthdays.map(user => (
                                <div key={user.userId} className="widget-item">
                                    <div className="item-user">
                                        <div className="user-avatar">
                                            {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                                        </div>
                                        <div className="user-name">
                                            {user.firstName} {user.lastName}
                                        </div>
                                    </div>
                                    <div className="item-badge badge-soon">
                                        {formatDate(user.nextDate)} ({getDaysLeftText(user.daysLeft)})
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">Yaklaşan doğum günü yok</div>
                    )}
                </div>
            </div>

            {/* Leaves Widget */}
            <div className="widget-card">
                <div className="widget-header">
                    <div className="widget-icon icon-plane">✈️</div>
                    <h3>Yaklaşan İzinler (7 Gün)</h3>
                </div>
                <div className="widget-content">
                    {data.leaves.length > 0 ? (
                        <div className="widget-list">
                            {data.leaves.map((leave, index) => (
                                <div key={index} className="widget-item">
                                    <div className="item-user">
                                        <div className="user-avatar">
                                            {leave.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                        </div>
                                        <div className="user-name">{leave.name}</div>
                                    </div>
                                    <div className="item-date">
                                        {formatDate(leave.startDate)} • {leave.days}g
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">Yaklaşan izin yok</div>
                    )}
                </div>
            </div>

            {/* Holidays Widget */}
            <div className="widget-card">
                <div className="widget-header">
                    <div className="widget-icon icon-holiday">⛱️</div>
                    <h3>Resmi Tatiller</h3>
                </div>
                <div className="widget-content">
                    {data.nextHoliday ? (
                        <div className="holiday-display">
                            <div className="holiday-name">{data.nextHoliday.name}</div>
                            <div className="holiday-date">{formatDate(data.nextHoliday.date, true)}</div>
                            <div className="holiday-duration">{data.nextHoliday.duration} Gün</div>
                        </div>
                    ) : (
                        <div className="empty-state">Yakın zamanda tatil yok</div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default DashboardWidgets;
