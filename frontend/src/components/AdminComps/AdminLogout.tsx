// src/components/AdminComps/AdminLogout.tsx
import { UseAuth } from '../../provider/AuthProvider';

export function LogoutButton () {
    // authContext
    const { logout } = UseAuth();

    // handler
    const handleLogout = async () => {
        await logout();
    };

    return (
        <button
            onClick={handleLogout}
            className={`bg-red-600 text-white rounded-3xl px-4 py-2 hover:bg-red-900 transition-colors`}
        >
            Logout
        </button>
    );
};
