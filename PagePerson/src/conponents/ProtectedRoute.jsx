import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

/**
 * Protected Route bileşeni
 * Sadece giriş yapmış kullanıcılar erişebilir
 * allowedRoles parametresi ile rol bazlı kontrol yapılabilir
 */
function ProtectedRoute({ children, allowedRoles = [] }) {
    const { user, loading, isAuthenticated } = useAuth();

    // Loading durumu
    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                fontSize: '18px',
                color: '#666'
            }}>
                Yükleniyor...
            </div>
        );
    }

    // Kullanıcı giriş yapmamışsa login sayfasına yönlendir
    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    // Rol kontrolü (eğer allowedRoles belirtilmişse)
    if (allowedRoles.length > 0 && user?.primaryRole) {
        if (!allowedRoles.includes(user.primaryRole)) {
            // Kullanıcının rolü uygun değilse kendi dashboard'una yönlendir
            const roleRoutes = {
                'SYSTEM_ADMIN': '/admin',
                'HR': '/hr',
                'MANAGER': '/manager',
                'EMPLOYEE': '/employee'
            };

            const redirectPath = roleRoutes[user.primaryRole] || '/';
            return <Navigate to={redirectPath} replace />;
        }
    }

    // Her şey uygunsa children'ı render et
    return children;
}

export default ProtectedRoute;
