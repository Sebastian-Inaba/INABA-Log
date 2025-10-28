// logging middleware
import { Request, Response, NextFunction } from 'express';

export const requestLogger = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const startTime = Date.now();

    console.log(`➡️ ${req.method} ${req.originalUrl} - Body:`, req.body);

    // Listen for response finish to log status and duration
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        console.log(
            `⬅️ ${req.method} ${req.originalUrl} - Status: ${res.statusCode} - ${duration}ms`,
        );
    });

    next();
};
