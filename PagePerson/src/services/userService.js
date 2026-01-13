import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

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
 * Kullanıcı sil
 */
export async function deleteUser(userId) {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
}

export default {
    createUser,
    getAllUsers,
    getUserById,
    deleteUser
};
