import axios from 'axios';

const API_URL = 'http://localhost:5001/api/dashboard';

// Create helper to get token
const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    };
};

export const getDashboardWidgets = async () => {
    try {
        const response = await axios.get(`${API_URL}/widgets`, getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error('Widget verileri alınamadı:', error);
        return { success: false, message: error.message };
    }
};
