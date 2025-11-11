// src/utilities/logger.ts

// Logger in dev mode (npm run dev)
// (import.meta.env.DEV) is a automatic vite env. Replaced with (false) on build

type LogArgs = unknown[];

// Log messages in development
export const log = (...args: LogArgs): void => {
    if (import.meta.env.DEV) {
        console.log('[LOG]', ...args);
    }
};

// Log errors in development
export const error = (...args: LogArgs): void => {
    if (import.meta.env.DEV) {
        console.error('[ERROR]', ...args);
    }
};

// Log debug messages in development
export const debug = (...args: LogArgs): void => {
    if (import.meta.env.DEV) {
        console.debug('[DEBUG]', ...args);
    }
};

// Log warnings in development
export const warn = (...args: LogArgs): void => {
    if (import.meta.env.DEV) {
        console.warn('[WARN]', ...args);
    }
};