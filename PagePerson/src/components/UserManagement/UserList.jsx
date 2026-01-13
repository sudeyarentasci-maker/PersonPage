import React, { useState, useEffect } from 'react';
import { getAllUsers, deleteUser } from '../../services/userService';
import { useAuth } from '../../auth/AuthContext';
import './UserManagement.css';

function UserList({ refreshTrigger }) {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // Kullanıcının SYSTEM_ADMIN olup olmadığını kontrol et
    const isSystemAdmin = user?.roles?.includes('SYSTEM_ADMIN');

    const fetchUsers = async () => {
        setIsLoading(true);
        setError('');

        try {
            const result = await getAllUsers();
            if (result.success) {
                setUsers(result.data.users);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Kullanıcılar yüklenemedi');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [refreshTrigger]);

    const handleDelete = async (userId, email) => {
        if (!window.confirm(`${email} kullanıcısını silmek istediğinizden emin misiniz?`)) {
            return;
        }

        try {
            const result = await deleteUser(userId);
            if (result.success) {
                alert('Kullanıcı başarıyla silindi');
                fetchUsers(); // Listeyi yenile
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Kullanıcı silinemedi');
        }
    };

    if (isLoading) {
        return (
            <div className="loading-state">
                <p>⏳ Kullanıcılar yükleniyor...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-state">
                <p>❌ {error}</p>
                <button onClick={fetchUsers} className="btn-secondary">
                    Tekrar Dene
                </button>
            </div>
        );
    }

    return (
        <div className="user-list">
            <h3>📋 Kullanıcı Listesi ({users.length})</h3>

            {users.length === 0 ? (
                <p className="empty-state">Henüz kullanıcı yok.</p>
            ) : (
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>User ID</th>
                            <th>Email</th>
                            <th>Roller</th>
                            <th>Durum</th>
                            {isSystemAdmin && <th>İşlemler</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.userId}>
                                <td><code>{user.userId}</code></td>
                                <td>{user.email}</td>
                                <td>
                                    <div className="roles-badges">
                                        {user.roles.map((role) => (
                                            <span key={role} className={`role-badge role-${role.toLowerCase()}`}>
                                                {role}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td>
                                    <span className={`status-badge status-${user.status.toLowerCase()}`}>
                                        {user.status}
                                    </span>
                                </td>
                                {isSystemAdmin && (
                                    <td>
                                        <button
                                            className="delete-btn"
                                            onClick={() => handleDelete(user.userId, user.email)}
                                            title="Kullanıcıyı Sil"
                                        >
                                            🗑️
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default UserList;
