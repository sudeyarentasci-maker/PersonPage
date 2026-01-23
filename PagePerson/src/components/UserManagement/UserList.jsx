import React, { useState, useEffect } from 'react';
import { getAllUsers, deleteUser, updateUserStatus } from '../../services/userService';
import { useAuth } from '../../auth/AuthContext';
import UserActionsDropdown from './UserActionsDropdown';
import ChangeEmailModal from './ChangeEmailModal';
import ChangePasswordModal from './ChangePasswordModal';
import ChangeRolesModal from './ChangeRolesModal';
import ChangeManagerModal from './ChangeManagerModal';
import './UserManagement.css';

function UserList({ refreshTrigger, onUsersUpdated }) {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // Modal states
    const [selectedUser, setSelectedUser] = useState(null);
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isRolesModalOpen, setIsRolesModalOpen] = useState(false);
    const [isManagerModalOpen, setIsManagerModalOpen] = useState(false);

    // Sadece HR kontrolü - Kullanıcı yönetimi artık sadece HR'ın sorumluluğunda
    const isHR = user?.roles?.some(role =>
        typeof role === 'string' ? role === 'HR' : role.name === 'HR'
    );

    // Kullanıcı yönetimi yetkisi - Sadece HR
    const canManageUsers = isHR;

    const fetchUsers = async () => {
        setIsLoading(true);
        setError('');

        try {
            const result = await getAllUsers();
            if (result.success) {
                setUsers(result.data.users);
                // Kullanıcı listesi güncellendiğinde parent component'i bilgilendir
                if (onUsersUpdated) {
                    onUsersUpdated(result.data.users);
                }
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
                alert('✅ Kullanıcı başarıyla silindi');
                fetchUsers();
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Kullanıcı silinemedi');
        }
    };

    const handleAction = async (action, targetUser) => {
        setSelectedUser(targetUser);

        switch (action) {
            case 'email':
                setIsEmailModalOpen(true);
                break;
            case 'password':
                setIsPasswordModalOpen(true);
                break;
            case 'roles':
                setIsRolesModalOpen(true);
                break;
            case 'manager':
                setIsManagerModalOpen(true);
                break;
            case 'status':
                await handleStatusToggle(targetUser);
                break;
            case 'delete':
                await handleDelete(targetUser.userId, targetUser.email);
                break;
            default:
                break;
        }
    };

    const handleStatusToggle = async (targetUser) => {
        const newStatus = targetUser.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        const actionText = newStatus === 'ACTIVE' ? 'aktif edilsin' : 'deaktive edilsin';

        if (!window.confirm(`${targetUser.email} kullanıcısı ${actionText} mi?`)) {
            return;
        }

        try {
            const result = await updateUserStatus(targetUser.userId, newStatus);
            if (result.success) {
                alert(`✅ Kullanıcı ${newStatus === 'ACTIVE' ? 'aktif edildi' : 'deaktive edildi'}`);
                fetchUsers();
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Durum değiştirilemedi');
        }
    };

    if (isLoading) {
        return <div className="user-list">Yükleniyor...</div>;
    }

    if (error) {
        return <div className="user-list error">{error}</div>;
    }

    return (
        <div className="user-list">
            <h3>📋 Kullanıcı Listesi ({users.length})</h3>

            {users.length === 0 ? (
                <p>Henüz kullanıcı bulunmuyor.</p>
            ) : (
                <div className="table-wrapper">
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>Kullanıcı ID</th>
                                <th>Email</th>
                                <th>Roller</th>
                                <th>Durum</th>
                                {canManageUsers && <th>İşlemler</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u) => (
                                <tr key={u.userId}>
                                    <td>{u.userId}</td>
                                    <td>{u.email}</td>
                                    <td>
                                        {u.roles && u.roles.length > 0 ? (
                                            u.roles.map((role, index) => {
                                                const roleName = typeof role === 'string' ? role : role.name || role;
                                                return (
                                                    <span
                                                        key={`${u.userId}-${roleName}-${index}`}
                                                        className={`role-badge role-${roleName.toLowerCase()}`}
                                                    >
                                                        {roleName}
                                                    </span>
                                                );
                                            })
                                        ) : (
                                            <span className="no-role">Rol yok</span>
                                        )}
                                    </td>
                                    <td>
                                        <span className={`status-badge status-${u.status?.toLowerCase() || 'active'}`}>
                                            {u.status === 'INACTIVE' ? 'Deaktif' : 'Aktif'}
                                        </span>
                                    </td>
                                    {canManageUsers && (
                                        <td>
                                            <UserActionsDropdown
                                                user={u}
                                                onAction={handleAction}
                                            />
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modals */}
            {selectedUser && (
                <>
                    <ChangeEmailModal
                        isOpen={isEmailModalOpen}
                        onClose={() => {
                            setIsEmailModalOpen(false);
                            setSelectedUser(null);
                        }}
                        user={selectedUser}
                        onSuccess={fetchUsers}
                    />

                    <ChangePasswordModal
                        isOpen={isPasswordModalOpen}
                        onClose={() => {
                            setIsPasswordModalOpen(false);
                            setSelectedUser(null);
                        }}
                        user={selectedUser}
                        onSuccess={fetchUsers}
                    />

                    <ChangeRolesModal
                        isOpen={isRolesModalOpen}
                        onClose={() => {
                            setIsRolesModalOpen(false);
                            setSelectedUser(null);
                        }}
                        user={selectedUser}
                        onSuccess={fetchUsers}
                    />

                    <ChangeManagerModal
                        isOpen={isManagerModalOpen}
                        onClose={() => {
                            setIsManagerModalOpen(false);
                            setSelectedUser(null);
                        }}
                        user={selectedUser}
                        onSuccess={fetchUsers}
                    />
                </>
            )}
        </div>
    );
}

export default UserList;
