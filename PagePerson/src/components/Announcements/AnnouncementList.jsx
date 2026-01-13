import React, { useState, useEffect } from 'react';
import { getAnnouncements } from '../../services/announcementService';
import './AnnouncementList.css';

function AnnouncementList() {
    const [announcements, setAnnouncements] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const result = await getAnnouncements();
            if (result.success) {
                setAnnouncements(result.data.announcements);
            }
        } catch (err) {
            console.error('Duyurular yüklenemedi:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const getPriorityBadge = (priority) => {
        const badges = {
            'HIGH': { class: 'priority-high', icon: '🔴', text: 'Yüksek' },
            'NORMAL': { class: 'priority-normal', icon: '🔵', text: 'Normal' },
            'LOW': { class: 'priority-low', icon: '⚪', text: 'Düşük' }
        };
        return badges[priority] || badges.NORMAL;
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (isLoading) {
        return (
            <div className="announcements-section">
                <h3>📢 Duyurular</h3>
                <p className="loading-text">Duyurular yükleniyor...</p>
            </div>
        );
    }

    return (
        <div className="announcements-section">
            <h3>📢 Duyurular ({announcements.length})</h3>

            {announcements.length === 0 ? (
                <p className="empty-announcements">Henüz duyuru yok.</p>
            ) : (
                <div className="announcements-grid">
                    {announcements.map((announcement) => {
                        const priority = getPriorityBadge(announcement.priority);
                        return (
                            <div key={announcement.announcementId} className="announcement-card">
                                <div className="announcement-header">
                                    <h4>{announcement.title}</h4>
                                    <span className={`priority-badge ${priority.class}`}>
                                        {priority.icon} {priority.text}
                                    </span>
                                </div>
                                <div className="announcement-body">
                                    <p>{announcement.content}</p>
                                </div>
                                <div className="announcement-footer">
                                    <span className="announcement-author">
                                        👤 {announcement.creatorEmail}
                                    </span>
                                    <span className="announcement-date">
                                        🕒 {formatDate(announcement.createdAt)}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default AnnouncementList;
