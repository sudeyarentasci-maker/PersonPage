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
 * Sistem ayarlarını getir
 */
export async function getSystemSettings() {
    const response = await api.get('/system-settings');
    return response.data;
}

/**
 * Tüm ayarları güncelle
 */
export async function updateSystemSettings(settings) {
    const response = await api.put('/system-settings', settings);
    return response.data;
}

/**
 * Belirli kategoriyi güncelle
 */
export async function updateSettingsCategory(category, data) {
    const response = await api.put(`/system-settings/${category}`, data);
    return response.data;
}

/**
 * Email ayarlarını test et
 */
export async function testEmailSettings(emailConfig) {
    const response = await api.post('/system-settings/test-email', emailConfig);
    return response.data;
}

export default {
    getSystemSettings,
    updateSystemSettings,
    updateSettingsCategory,
    testEmailSettings
};
