import React, { useState, useEffect } from 'react';
import { getAnnouncements, deleteAnnouncement } from '../../services/announcementService';
import { useAuth } from '../../auth/AuthContext';
import EditAnnouncementModal from './EditAnnouncementModal';
import './AnnouncementList.css';

function AnnouncementList() {
    const { user } = useAuth();
    const [announcements, setAnnouncements] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingAnnouncement, setEditingAnnouncement] = useState(null);

    // SADECE HR için duyuru yönetimi
    const canManageAnnouncements = user?.roles?.some(role =>
        typeof role === 'string' ? role === 'HR' : role.name === 'HR'
    );

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const result = await getAnnouncements();
            console.log('📡 API Yanıtı:', result);

            if (result.success) {
                console.log(`✅ ${result.data.announcements.length} duyuru geldi`);
                const sortedAnnouncements = result.data.announcements.sort((a, b) => {
                    const priorityOrder = { 'HIGH': 3, 'NORMAL': 2, 'LOW': 1 };
                    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];

                    if (priorityDiff !== 0) return priorityDiff;
                    return new Date(b.createdAt) - new Date(a.createdAt);
                });
                setAnnouncements(sortedAnnouncements);
            }
        } catch (err) {
            console.error('Duyurular yüklenemedi:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (announcementId, title) => {
        if (!window.confirm(`"${title}" duyurusunu silmek istediğinizden emin misiniz?`)) {
            return;
        }

        try {
            const result = await deleteAnnouncement(announcementId);
            if (result.success) {
                alert('✅ Duyuru silindi!');
                fetchAnnouncements();
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Duyuru silinemedi');
        }
    };

    const handleEdit = (announcement) => {
        setEditingAnnouncement(announcement);
    };

    const handleCloseEditModal = () => {
        setEditingAnnouncement(null);
    };

    const handleAnnouncementUpdated = () => {
        fetchAnnouncements();
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
                            <div
                                key={announcement.announcementId}
                                className={`announcement-card priority-${announcement.priority.toLowerCase()}`}
                            >    {/* Hover Butonları - Sadece HR için */}
                                {canManageAnnouncements && (
                                    <div className="announcement-actions">
                                        <button
                                            className="action-btn edit-btn"
                                            onClick={() => handleEdit(announcement)}
                                            title="Düzenle"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            className="action-btn delete-btn"
                                            onClick={() => handleDelete(announcement.announcementId, announcement.title)}
                                            title="Sil"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                )}

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
                                        {announcement.expiresAt ? '⏳ ' : '🕒 '}
                                        {formatDate(announcement.expiresAt || announcement.createdAt)}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Düzenleme Modal'ı */}
            <EditAnnouncementModal
                isOpen={!!editingAnnouncement}
                onClose={handleCloseEditModal}
                announcement={editingAnnouncement}
                onAnnouncementUpdated={handleAnnouncementUpdated}
            />
        </div>
    );
}

export default AnnouncementList;
