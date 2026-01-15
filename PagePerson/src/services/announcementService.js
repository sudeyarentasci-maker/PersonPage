import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

const api = axios.create({
    baseURL: API_URL,
});

// Request interceptor
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

/**
 * Duyuru oluştur (HR, ADMIN)
 */
export async function createAnnouncement(announcementData) {
    const response = await api.post('/announcements', announcementData);
    return response.data;
}

/**
 * Duyuruları getir (rol bazlı)
 */
export async function getAnnouncements() {
    const response = await api.get('/announcements');
    return response.data;
}

/**
 * Tüm duyuruları getir (HR, ADMIN)
 */
export async function getAllAnnouncements() {
    const response = await api.get('/announcements/all');
    return response.data;
}

/**
 * Duyuru detayı
 */
export async function getAnnouncementById(announcementId) {
    const response = await api.get(`/announcements/${announcementId}`);
    return response.data;
}

/**
 * Duyuru güncelle (HR, ADMIN)
 */
export async function updateAnnouncement(announcementId, updateData) {
    const response = await api.put(`/announcements/${announcementId}`, updateData);
    return response.data;
}

/**
 * Duyuru sil (ADMIN)
 */
export async function deleteAnnouncement(announcementId) {
    const response = await api.delete(`/announcements/${announcementId}`);
    return response.data;
}

export default {
    createAnnouncement,
    getAnnouncements,
    getAllAnnouncements,
    getAnnouncementById,
    updateAnnouncement,
    deleteAnnouncement
};
