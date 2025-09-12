// src/layout/wrapper/AdminWrapper.tsx
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { UseAuth } from '../../provider/AuthProvider';

interface AdminWrapperProps {
    children: ReactNode;
}

// Used to check auth before admin page
export function AdminWrapper({ children }: AdminWrapperProps) {
    const { user, loading } = UseAuth();

    if (loading) return <p>Loading...</p>; // basic loader for now, will make a spinner component in the future
    if (!user) return <Navigate to="/login" replace />;

    return <>{children}</>;
}
