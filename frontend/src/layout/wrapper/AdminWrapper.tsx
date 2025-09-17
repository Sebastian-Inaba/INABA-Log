// src/layout/wrapper/AdminWrapper.tsx
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { UseAuth } from '../../provider/AuthProvider';

interface AdminWrapperProps {
    children: ReactNode;
}

export function AdminWrapper({ children }: AdminWrapperProps) {
    const { user, loading } = UseAuth();

    // Show nothing or loading spinner while checking auth
    if (loading) {
        return (
            <div className="w-full h-screen flex items-center justify-center bg-gray-900">
                <p className="text-white text-lg font-medium">Loading...</p>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}
