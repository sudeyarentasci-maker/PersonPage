import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

const api = axios.create({
    baseURL: API_URL,
});

// Request interceptor - Add token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const getSections = async () => {
    const response = await api.get('/tasks/sections');
    return response.data;
};

export const createTask = async (taskData) => {
    const response = await api.post('/tasks/tasks', taskData);
    return response.data;
};

export const updateTask = async (id, updates) => {
    const response = await api.put(`/tasks/tasks/${id}`, updates);
    return response.data;
};

export const moveTask = async (id, sectionId, order) => {
    const response = await api.patch(`/tasks/tasks/${id}/move`, { sectionId, order });
    return response.data;
};

export const deleteTask = async (id) => {
    const response = await api.delete(`/tasks/tasks/${id}`);
    return response.data;
};

export const createSection = async (sectionData) => {
    const response = await api.post('/tasks/sections', sectionData);
    return response.data;
};
