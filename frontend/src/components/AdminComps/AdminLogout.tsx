// src/components/AdminComps/AdminLogout.tsx
import React from 'react';
import { UseAuth } from '../../provider/AuthProvider';

type LogoutButtonProps = {
    className?: string;
};

export const LogoutButton: React.FC<LogoutButtonProps> = ({ className = '' }) => {
    const { logout } = UseAuth();

    const handleLogout = async () => {
        await logout();
    };

    return (
        <button
            onClick={handleLogout}
            className={`bg-red-600 text-white rounded px-4 py-2 hover:bg-red-900 transition-colors ${className}`}
        >
            Logout
        </button>
    );
};
