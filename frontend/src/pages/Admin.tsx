// src/pages/Admin.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UseAuth } from '../provider/AuthProvider';

export function Admin() {
    const { logout, user, loading } = UseAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && !user) {
            navigate('/login');
        }
    }, [loading, user, navigate]);

    return (
        <div className="AdminApp">
            <h1>Admin Panel</h1>
            {loading ? (
                <p>Loading...</p>
            ) : (
                user && (
                    <>
                        <p>Hello, {user.email}</p>
                        <button
                            onClick={async () => {
                                await logout();
                            }}
                            className="bg-red-600 text-white rounded hover:bg-red-900"
                        >
                            Logout
                        </button>
                    </>
                )
            )}
        </div>
    );
}
