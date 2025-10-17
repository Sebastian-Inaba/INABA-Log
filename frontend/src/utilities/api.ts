// src/utilities/api.ts
import axios from 'axios';
import { log, error } from './logger';

// Set the base URL for all API requests
export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    withCredentials: true,
});

// Response interceptor for logging and error handling (dev only)
apiClient.interceptors.response.use(
    (res) => {
        // Log successful responses
        log('[API] response:', {
            url: res.config?.url,
            status: res.status,
            data: res.data,
            headers: res.headers,
            time: new Date().toISOString(),
        });
        return res;
    },
    (err) => {
        // Log errors
        error('[API] error:', {
            url: err.config?.url,
            status: err.response?.status,
            data: err.response?.data,
            headers: err.response?.headers,
            message: err.message,
            time: new Date().toISOString(),
        });
        return Promise.reject(err);
    },
);
