// src/provider/AuthProvider.tsx
import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useAuthLogic } from '../hooks/UseAuth';

// Type of context value from useAuthLogic.
type AuthContextType = ReturnType<typeof useAuthLogic>;

// Create the authentication context.
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component wraps part of the app that needs authentication.
export function AuthProvider({ children }: { children: ReactNode }) {
    const auth = useAuthLogic();
    return (
        <AuthContext.Provider value={auth}>
            {children} {/* Render children with auth context available */}
        </AuthContext.Provider>
    );
}

// Access to the authentication context.
export function UseAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
}
