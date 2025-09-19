// src/hooks/UseAuth.tsx
import { useState, useEffect } from 'react';
import type { AxiosError } from 'axios';
import { apiClient as axiosInstance } from '../utilities/api';
import { log, error } from '../utilities/logger';

// Shape of a logged-in user
export type User = { email: string };

export function useAuthLogic() {
    // States for user data and request lifecycle
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [initialized, setInitialized] = useState(false);

    // Fetch user info from backend (/admin/me)
    const fetchUser = async (idToken?: string) => {
        try {
            setLoading(true);
            log('[Auth] fetchUser start', { idTokenProvided: !!idToken });

            // Add token to headers if provided
            const headers = idToken ? { Authorization: `Bearer ${idToken}` } : {};
            const res = await axiosInstance.get('/admin/me', { headers });

            log('[Auth] fetchUser success', res.status, res.data);
            setUser(res.data.admin ?? null);
        } catch (err: unknown) {
            const error = err as AxiosError;
            log('[Auth] fetchUser error', error);

            if (error.response?.status === 401) {
                setUser(null);
            }
        } finally {
            setLoading(false);
        }
    };

    // Log in with Google ID token, then backend sets cookie
    const login = async (idToken: string) => {
        setLoading(true);
        try {
            log('[Auth] login start');

            const res = await axiosInstance.post(
                '/admin/login',
                {},
                {
                    headers: { Authorization: `Bearer ${idToken}` },
                },
            );

            log('[Auth] login response', res.status, res.data);

            if (res.data?.admin) {
                setUser(res.data.admin);
                sessionStorage.setItem('inaba_admin_flag', '1'); // marker for refresh
            } else {
                await fetchUser(); // fallback if no admin returned
            }
        } catch (err) {
            error('Login failed:', err);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    // Log out, backend clears cookie, reset state
    const logout = async () => {
        setLoading(true);
        try {
            await axiosInstance.post('/admin/logout');
            setUser(null);
            setInitialized(false);
            sessionStorage.removeItem('inaba_admin_flag');
        } catch (err) {
            error('Logout failed:', err);
        } finally {
            setLoading(false);
        }
    };

    // Run once on mount, check if user is logged in
    useEffect(() => {
        if (!initialized) {
            fetchUser();
            setInitialized(true);
        }
    }, [initialized]);

    return { user, loading, login, logout } as const;
}
