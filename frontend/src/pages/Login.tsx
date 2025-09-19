// src/pages/Login.tsx
import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { UseAuth } from '../provider/AuthProvider';
import { error } from '../utilities/logger';

interface GoogleCredentialResponse {
    credential: string;
    select_by?: string;
    clientId?: string;
}

export function Login() {
    const { login, user, loading } = UseAuth();
    const navigate = useNavigate();

    // Redirect if already logged in (after auth check)
    useEffect(() => {
        if (!loading && user) {
            navigate('/admin', { replace: true });
        }
    }, [loading, user, navigate]);

    // Google login handler
    const handleCredentialResponse = useCallback(
        async (response: GoogleCredentialResponse) => {
            try {
                await login(response.credential);
            } catch (err) {
                error('Login failed', err);
            }
        },
        [login],
    );

    // Load Google Identity script
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);

        script.onload = () => {
            const el = document.getElementById('google-signin');
            if (el) {
                // @ts-expect-error window.google types
                window.google?.accounts.id.initialize({
                    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                    callback: handleCredentialResponse,
                });

                // @ts-expect-error window.google types
                window.google?.accounts.id.renderButton(el, {
                    theme: 'outline',
                    size: 'large',
                });
            }
        };

        // remove script when leaving Login page
        return () => {
            document.body.removeChild(script);
            // @ts-expect-error window.google types
            if (window.google?.accounts?.id) {
                // @ts-expect-error window.google types
                window.google.accounts.id.cancel();
            }
        };
    }, [handleCredentialResponse]);

    // don’t render login UI until auth check finishes
    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <h1>Login Page</h1>
            <div id="google-signin"></div>
        </div>
    );
}
