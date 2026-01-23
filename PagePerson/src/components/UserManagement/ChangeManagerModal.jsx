import React, { useState, useEffect } from 'react';
import { changeUserManager, getManagerList } from '../../services/userService';

function ChangeManagerModal({ user, onClose, onSuccess }) {
    const [newManager, setNewManager] = useState('');
    const [managers, setManagers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchManagers();
        // Set initial manager if exists
        if (user.manager) {
            setNewManager(user.manager);
        }
    }, [user.manager]);

    const fetchManagers = async () => {
        try {
            const result = await getManagerList();
            if (result.success) {
                setManagers(result.data.managers);
            }
        } catch (err) {
            console.error('Manager listesi yüklenemedi:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const result = await changeUserManager(user.userId, newManager);
            if (result.success) {
                onSuccess();
                onClose();
            } else {
                setError(result.message || 'Manager değiştirilemedi');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Bir hata oluştu');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>👔 Manager Değiştir</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit}>
                    {error && <div className="error-message">⚠️ {error}</div>}

                    <div className="user-info-box">
                        <p><strong>Kullanıcı:</strong> {user.email}</p>
                        <p><strong>Mevcut Manager:</strong> {user.managerInfo ?
                            `${user.managerInfo.firstName || ''} ${user.managerInfo.lastName || ''} (${user.managerInfo.email})`.trim()
                            : 'Atanmamış'}</p>
                    </div>

                    <div className="form-group">
                        <label>Yeni Manager</label>
                        <select
                            value={newManager}
                            onChange={(e) => setNewManager(e.target.value)}
                            required
                            disabled={isLoading}
                        >
                            <option value="">Manager seçin...</option>
                            <option value="REMOVE">Manager Atamasını Kaldır</option>
                            {managers.map(manager => (
                                <option key={manager.userId} value={manager.userId}>
                                    {manager.firstName && manager.lastName
                                        ? `${manager.firstName} ${manager.lastName} (${manager.email})`
                                        : manager.email}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="modal-actions">
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            İptal
                        </button>
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Değiştiriliyor...' : 'Manager Değiştir'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ChangeManagerModal;
