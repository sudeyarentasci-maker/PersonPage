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
 * İzin talebi oluştur
 */
export async function createLeaveRequest(leaveData) {
    const response = await api.post('/leaves', leaveData);
    return response.data;
}

/**
 * Kendi izinlerimi getir
 */
export async function getMyLeaves() {
    const response = await api.get('/leaves/my');
    return response.data;
}

/**
 * Ekip izinlerini getir (MANAGER)
 */
export async function getTeamLeaves() {
    const response = await api.get('/leaves/team');
    return response.data;
}

/**
 * Onay bekleyen izinler
 */
export async function getPendingLeaves() {
    const response = await api.get('/leaves/pending');
    return response.data;
}

/**
 * Tüm izinleri getir (HR/ADMIN)
 */
export async function getAllLeaves(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/leaves/all?${params}`);
    return response.data;
}

/**
 * İzin onayla
 */
export async function approveLeave(leaveId, comment = '') {
    const response = await api.put(`/leaves/${leaveId}/approve`, { comment });
    return response.data;
}

/**
 * İzin reddet
 */
export async function rejectLeave(leaveId, comment = '') {
    const response = await api.put(`/leaves/${leaveId}/reject`, { comment });
    return response.data;
}

/**
 * İzin istatistiklerimi getir
 */
export async function getLeaveStats() {
    const response = await api.get('/leaves/stats');
    return response.data;
}

export default {
    createLeaveRequest,
    getMyLeaves,
    getTeamLeaves,
    getPendingLeaves,
    getAllLeaves,
    approveLeave,
    rejectLeave,
    getLeaveStats
};
