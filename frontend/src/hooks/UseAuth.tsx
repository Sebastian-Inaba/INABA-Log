// src/hooks/UseAuth.tsx
import { useState, useEffect, useRef } from 'react';
import axios, { AxiosError } from 'axios';

export type User = { email: string };

// Create a reusable Axios instance config
const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
});

export function useAuthLogic() {
    // States
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [initialized, setInitialized] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null);

    // Fetch if Admin status (logged in or not)
    const fetchUser = async (idToken?: string) => {
        // Cancel any previous fetch request to avoid race conditions
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        const controller = new AbortController();
        abortControllerRef.current = controller;

        try {
            const headers = idToken ? { Authorization: `Bearer ${idToken}` } : {};
            const res = await axiosInstance.get('/api/admin/me', {
                headers,
                signal: controller.signal,
            });
            // Update state with user data from backend
            setUser(res.data.admin);
        } catch (err: unknown) {
            const error = err as AxiosError;

            // Ignore errors caused by request cancellation
            if (error.name === 'CanceledError') return;

            if (error.response?.status === 401) {
                setUser(null);
            } else {
                console.error('Fetch user failed:', err);
            }
        } finally {
            setLoading(false);
        }
    };

    // Login user with google id, if its correct email
    const login = async (idToken: string) => {
        setLoading(true);
        try {
            await axiosInstance.post(
                '/api/admin/login',
                {},
                {
                    headers: { Authorization: `Bearer ${idToken}` },
                },
            );

            // Fetch user info and update state
            await fetchUser();
        } catch (err) {
            console.error('Login failed:', err);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    // Logout user and clear cookie
    const logout = async () => {
        setLoading(true);
        try {
            // Cancel any ongoing fetch requests
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            await axiosInstance.post('/api/admin/logout');
            setUser(null);
            setInitialized(false); // Reset initialization flag
        } catch (err) {
            console.error('Logout failed:', err);
        } finally {
            setLoading(false);
        }
    };

    // fetch and clean user on mount
    useEffect(() => {
        if (!initialized) {
            fetchUser();
            setInitialized(true);
        }

        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [initialized]);

    return { user, loading, login, logout };
}
