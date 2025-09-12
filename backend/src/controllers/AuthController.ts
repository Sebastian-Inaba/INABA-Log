// auth controller
import { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';
import { AuthenticatedRequest } from '../middleware/AuthMiddleware'; // auth middleware type
import { env } from '../config/env';

// Cookie config
const COOKIE_NAME = 'inaba_admin';
const COOKIE_MAX_AGE = 60 * 60 * 1000; // 1 hour in ms

// get admin
export const getCurrentUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) throw createHttpError(401, 'Not authenticated');

        res.status(200).json({
            success: true,
            admin: req.user,
        });
    } catch (err) {
        next(err);
    }
};

// login
// Since Google token is verified by the frontend + middleware, login can just return user info
export const login = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) throw createHttpError(401, 'Not authenticated');

        res.cookie(COOKIE_NAME, JSON.stringify(req.user), {
            httpOnly: true,
            secure: env.nodeEnv === 'production', // when node env is set to production (true)
            sameSite: env.nodeEnv === 'production' ? 'none' : 'lax', // changed to work with cross site, can prob just set to none
            maxAge: COOKIE_MAX_AGE,
            path: '/',
        });

        res.status(200).json({
            success: true,
            admin: req.user,
        });
    } catch (err) {
        next(err);
    }
};

// logout
export const logout = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        res.clearCookie(COOKIE_NAME, {
            httpOnly: true,
            secure: env.nodeEnv === 'production', // when node env is set to production (true)
            sameSite: env.nodeEnv === 'production' ? 'none' : 'lax', // changed to work with cross site, can prob just set to none
            path: '/',
        });

        res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (err) {
        next(err);
    }
};
