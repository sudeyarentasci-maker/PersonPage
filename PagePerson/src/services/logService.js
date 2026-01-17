import axios from 'axios';

const API_URL = 'http://localhost:5001/api/logs';

// Sistem loglarını getir
export const getSystemLogs = async (filters = {}) => {
    try {
        const params = new URLSearchParams();

        if (filters.type) params.append('type', filters.type);
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);
        if (filters.search) params.append('search', filters.search);

        const response = await axios.get(`${API_URL}?${params.toString()}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Loglar getirilemedi:', error);
        throw error;
    }
};

// Tüm logları sil
export const deleteAllLogs = async () => {
    try {
        const response = await axios.delete(`${API_URL}/all`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Tüm loglar silinemedi:', error);
        throw error;
    }
};

// Seçili logları sil
export const deleteSelectedLogs = async (logIds) => {
    try {
        const response = await axios.delete(API_URL, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            data: { logIds }
        });
        return response.data;
    } catch (error) {
        console.error('Seçili loglar silinemedi:', error);
        throw error;
    }
};

// Yetim verileri temizle (sistemde olmayan kullanıcıların verileri)
export const cleanupOrphanedData = async () => {
    try {
        const response = await axios.post(`${API_URL}/cleanup-orphaned`, {}, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Yetim veri temizleme hatası:', error);
        throw error;
    }
};
