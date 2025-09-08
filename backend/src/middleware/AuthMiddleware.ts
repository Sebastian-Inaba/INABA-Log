// Google auth middleware
import { OAuth2Client } from 'google-auth-library'; // google token verifier
import { Request, Response, NextFunction } from 'express'; // express types for TypeScript
import { env } from '../config/env';
import createHttpError from 'http-errors'; // error thrower instead of res.status..

const client = new OAuth2Client(env.google.clientId);

// request type extension
export interface AuthenticatedRequest extends Request {
    user?: {
        email: string;
    };
}

// Admin Guard: ensures the request has a valid Google ID token
export async function requireGoogleAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw createHttpError(401, 'Missing or invalid token');
        }

        const idToken = authHeader.split(' ')[1];
        if (!idToken) {
            throw createHttpError(401, 'Missing token');
        }

        const ticket = await client.verifyIdToken({
            idToken,
            audience: env.google.clientId,
        });

        const payload = ticket.getPayload();

        if (!payload || payload.email !== env.google.adminEmail) {
            throw createHttpError(403, 'Not authorized');
        }

        req.user = {
            email: payload.email,
        };

        next();
    } catch (err) {
        next(err);
    }
}
