// src/layout/wrapper/AdminWrapper.tsx
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { UseAuth } from '../../provider/AuthProvider';

interface AdminWrapperProps {
    children: ReactNode;
}

// Checks auth, loader and redirect
export function AdminWrapper({ children }: AdminWrapperProps) {
    const { user, loading } = UseAuth();

    if (!user && !loading) return <Navigate to="/login" replace />;

    return (
        <div className="relative w-full h-full">
            {children}
            {loading && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-opacity-50">
                    <p className="text-white text-lg font-medium">Loading...</p>
                </div>
            )}
        </div>
    );
}
