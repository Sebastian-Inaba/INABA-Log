// SERVER
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import postsRoutes from './routes/PostRoutes';
import researchRoutes from './routes/ResearchRoutes';
import adminRoutes from './routes/AuthRoutes';
import { connectDB, disconnectDB } from './config/DB';
import { errorHandler } from './middleware/ErrorMiddleware';
import { requestLogger } from './middleware/LoggingMiddleware';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// ---------------- Middleware ------------------------------------------ //

// Parse JSON requests
app.use(express.json());

// Security headers
app.use(helmet());

// Enable CORS (only allow frontend domain in production)
app.use(
    cors({
        origin: process.env.frontendUrl,
        credentials: true, // allow cookies/authorization headers
    }),
);

// Custom logging middleware
app.use(requestLogger);

// Global limiter (for public endpoints)
export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // max 100 requests per IP
    message: 'Too many requests, please try again later.',
});

// Admin/write limiter (for admin endpoints)
export const adminRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // max 20 requests per 15 min per IP
    message: 'Too many admin requests, please try again later.',
});

// ---------------- Routes ---------------------------------------------- //
// Public routes
app.use('/api/posts', globalLimiter, postsRoutes);
app.use('/api/research', globalLimiter, researchRoutes);

// Admin routes (protected)
app.use('/api/admin', adminRateLimiter, adminRoutes);

// Custom error middleware (should be after routes)
app.use(errorHandler);

// ---------------- DB + Server ----------------------------------------- //
connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('❌ Failed to connect to MongoDB. Server not started.', err);
    });

// ---------------- Graceful shutdown ----------------------------------- //
process.on('SIGINT', async () => {
    console.log('SIGINT received. Disconnecting DB...');
    await disconnectDB();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('SIGTERM received. Disconnecting DB...');
    await disconnectDB();
    process.exit(0);
});
