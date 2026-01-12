import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API_URL = 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Token'ı localStorage'dan al
    const getToken = () => localStorage.getItem('authToken');

    // Token'ı localStorage'a kaydet
    const saveToken = (token) => localStorage.setItem('authToken', token);

    // Token'ı localStorage'dan sil
    const removeToken = () => localStorage.removeItem('authToken');

    // Axios instance oluştur (her istekte token ekler)
    const api = axios.create({
        baseURL: API_URL,
    });

    // Request interceptor - Her istekte token ekle
    api.interceptors.request.use((config) => {
        const token = getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });

    // Response interceptor - Hata yönetimi
    api.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response?.status === 401 || error.response?.status === 403) {
                // Token geçersiz veya süresi dolmuş
                logout();
            }
            return Promise.reject(error);
        }
    );

    // Sayfa yüklendiğinde token varsa kullanıcı bilgilerini al
    useEffect(() => {
        const initializeAuth = async () => {
            const token = getToken();

            if (token) {
                try {
                    const response = await api.get('/auth/me');
                    if (response.data.success) {
                        setUser(response.data.data.user);
                    }
                } catch (err) {
                    console.error('Kullanıcı bilgisi alınamadı:', err);
                    removeToken();
                }
            }

            setLoading(false);
        };

        initializeAuth();
    }, []);

    /**
     * Login işlemi
     */
    const login = async (email, password) => {
        try {
            setError(null);
            setLoading(true);

            const response = await api.post('/auth/login', { email, password });

            if (response.data.success) {
                const { token, user } = response.data.data;

                // Token'ı kaydet
                saveToken(token);

                // Kullanıcı bilgilerini state'e kaydet
                setUser(user);

                return { success: true, user };
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Giriş başarısız';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    /**
     * Logout işlemi
     */
    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (err) {
            console.error('Logout hatası:', err);
        } finally {
            removeToken();
            setUser(null);
        }
    };

    /**
     * Kullanıcının rolüne göre dashboard path'i döndür
     */
    const getDashboardPath = () => {
        if (!user || !user.primaryRole) return '/';

        const roleRoutes = {
            'SYSTEM_ADMIN': '/admin',
            'HR': '/hr',
            'MANAGER': '/manager',
            'EMPLOYEE': '/employee'
        };

        return roleRoutes[user.primaryRole] || '/employee';
    };

    const value = {
        user,
        loading,
        error,
        login,
        logout,
        getDashboardPath,
        isAuthenticated: !!user,
        api
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
