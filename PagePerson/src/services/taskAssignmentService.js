import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

/**
 * Get employees managed by the current manager
 */
export const getManagedEmployees = async () => {
    try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(`${API_URL}/tasks/my-employees`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching managed employees:', error);
        throw error;
    }
};

/**
 * Get count of pending tasks assigned to current user
 */
export const getAssignedTaskCount = async () => {
    try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(`${API_URL}/tasks/assigned-count`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching assigned task count:', error);
        throw error;
    }
};
