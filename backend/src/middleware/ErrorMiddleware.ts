// error middleware
import { Request, Response, NextFunction } from 'express';

// error type extension
interface ErrorWithStatus extends Error {
    status?: number;
}

// error handler
export const errorHandler = (err: ErrorWithStatus, req: Request, res: Response, next: NextFunction) => {
    const statusCode = err.status || 500;

    console.error('❌ Error:', err.message);

    res.status(statusCode).json({
        success: false,
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
};
