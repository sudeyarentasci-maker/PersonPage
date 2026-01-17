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
