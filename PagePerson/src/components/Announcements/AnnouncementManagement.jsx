import React, { useState } from 'react';
import CreateAnnouncementModal from './CreateAnnouncementModal';
import './AnnouncementManagement.css';

function AnnouncementManagement({ onAnnouncementCreated }) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="announcement-management">
            <button
                className="btn-create-announcement"
                onClick={() => setIsModalOpen(true)}
            >
                📢 Duyuru Oluştur
            </button>

            <CreateAnnouncementModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAnnouncementCreated={onAnnouncementCreated}
            />
        </div>
    );
}

export default AnnouncementManagement;
