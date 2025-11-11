// src/utilities/logger.ts
import { env } from './../config/env';

type LogArgs = unknown[];

// Log messages in development
export const log = (...args: LogArgs): void => {
    if (env.nodeEnv !== 'production') {
        console.log('[LOG]', ...args);
    }
};

// Log errors in development
export const error = (...args: LogArgs): void => {
    if (env.nodeEnv !== 'production') {
        console.error('[ERROR]', ...args);
    }
};

// Log debug messages in development
export const debug = (...args: LogArgs): void => {
    if (env.nodeEnv !== 'production') {
        console.debug('[DEBUG]', ...args);
    }
};

// Log warnings in development
export const warn = (...args: LogArgs): void => {
    if (env.nodeEnv !== 'production') {
        console.warn('[WARN]', ...args);
    }
};