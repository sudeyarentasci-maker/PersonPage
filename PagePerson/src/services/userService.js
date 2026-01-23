import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

// Axios instance oluştur
const api = axios.create({
    baseURL: API_URL,
});

// Request interceptor - Her istekte token ekle
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

/**
 * Yeni kullanıcı oluştur
 */
export async function createUser(userData) {
    const response = await api.post('/users', userData);
    return response.data;
}

/**
 * Tüm kullanıcıları getir
 */
export async function getAllUsers() {
    const response = await api.get('/users');
    return response.data;
}

/**
 * Kullanıcı detayı getir
 */
export async function getUserById(userId) {
    const response = await api.get(`/users/${userId}`);
    return response.data;
}

/**
 * Kendi profil bilgilerini getir
 */
export async function getMyProfile() {
    const response = await api.get('/users/me');
    return response.data;
}

/**
 * Kullanıcı sil
 */
export async function deleteUser(userId) {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
}

/**
 * Kullanıcı email'ini değiştir
 */
export async function updateUserEmail(userId, newEmail) {
    const response = await api.put(`/users/${userId}/email`, { newEmail });
    return response.data;
}

/**
 * Kullanıcı şifresini değiştir
 */
export async function updateUserPassword(userId, newPassword) {
    const response = await api.put(`/users/${userId}/password`, { newPassword });
    return response.data;
}

/**
 * Kullanıcı rollerini değiştir
 */
export async function updateUserRoles(userId, roleNames) {
    const response = await api.put(`/users/${userId}/roles`, { roleNames });
    return response.data;
}

/**
 * Kullanıcı durumunu değiştir (active/inactive)
 */
export async function updateUserStatus(userId, status) {
    const response = await api.put(`/users/${userId}/status`, { status });
    return response.data;
}

/**
 * Kendi şifresini değiştir (requires current password)
 */
export async function changeOwnPassword(currentPassword, newPassword) {
    const response = await api.put('/users/me/password', { currentPassword, newPassword });
    return response.data;
}

/**
 * Manager listesini getir
 */
export async function getManagerList() {
    const response = await api.get('/users/managers');
    return response.data;
}

/**
 * Kullanıcının manager'ını değiştir
 */
export async function changeUserManager(userId, managerId) {
    const response = await api.put(`/users/${userId}/manager`, { managerId });
    return response.data;
}

export default {
    createUser,
    getAllUsers,
    getUserById,
    getMyProfile,
    deleteUser,
    updateUserEmail,
    updateUserPassword,
    updateUserRoles,
    updateUserStatus,
    changeOwnPassword,
    getManagerList,
    changeUserManager
};
