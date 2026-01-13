import React, { useState, useRef, useEffect } from 'react';
import './UserActionsDropdown.css';

function UserActionsDropdown({ user, onAction }) {
    const [isOpen, setIsOpen] = useState(false);
    const [openUpwards, setOpenUpwards] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleToggle = () => {
        if (!isOpen && dropdownRef.current) {
            const rect = dropdownRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            // Eğer aşağıda 220px'den az yer varsa yukarı doğru aç
            setOpenUpwards(spaceBelow < 220);
        }
        setIsOpen(!isOpen);
    };

    const handleAction = (action) => {
        setIsOpen(false);
        onAction(action, user);
    };

    const isActive = user.status === 'ACTIVE';

    return (
        <div className="user-actions-dropdown" ref={dropdownRef}>
            <button
                className="dropdown-trigger"
                onClick={handleToggle}
                title="İşlemler"
            >
                ⋮
            </button>

            {isOpen && (
                <div className={`dropdown-menu ${openUpwards ? 'upwards' : ''}`}>
                    <button
                        className="dropdown-item"
                        onClick={() => handleAction('email')}
                    >
                        📧 E-posta Değiştir
                    </button>
                    <button
                        className="dropdown-item"
                        onClick={() => handleAction('password')}
                    >
                        🔑 Şifre Değiştir
                    </button>
                    <button
                        className="dropdown-item"
                        onClick={() => handleAction('roles')}
                    >
                        🎭 Rol Değiştir
                    </button>
                    <div className="dropdown-divider"></div>
                    <button
                        className="dropdown-item"
                        onClick={() => handleAction('status')}
                    >
                        {isActive ? '⏸️ Deaktive Et' : '▶️ Aktif Et'}
                    </button>
                    <button
                        className="dropdown-item delete"
                        onClick={() => handleAction('delete')}
                    >
                        🗑️ Sil
                    </button>
                </div>
            )}
        </div>
    );
}

export default UserActionsDropdown;
