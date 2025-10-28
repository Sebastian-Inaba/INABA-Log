// SERVER
import express from 'express';
import dotenv from 'dotenv';
import { env } from './config/env';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import postsRoutes from './routes/PostRoutes';
import researchRoutes from './routes/ResearchRoutes';
import adminRoutes from './routes/AuthRoutes';
import cookieParser from 'cookie-parser';
import { connectDB, disconnectDB } from './config/DB';
import { errorHandler } from './middleware/ErrorMiddleware';
import { requestLogger } from './middleware/LoggingMiddleware';
import healthRouter from './routes/HealthRoutes';

dotenv.config();
const app = express();
const PORT = Number(process.env.PORT) || 5000;

// ---------------- Middleware ------------------------------------------ //

// Parse cookie req
app.use(cookieParser());

// Parse JSON requests
app.use(express.json());

// Security headers
app.use(helmet());

// Enable CORS (only allow frontend domain in production)
app.use(
    cors({
        origin: env.frontendUrl,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    }),
);

// Custom logging middleware
app.use(requestLogger);

// Global limiter (for public endpoints, might become problem with heavy end point later, like GET all)
export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: env.nodeEnv === 'production' ? 300 : 1000,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => env.nodeEnv !== 'production',
    handler: (req, res) => {
        res.set('Retry-After', String(Math.ceil(15 * 60)));
        return res.status(429).json({
            error: 'Too many requests',
            message: 'Too many requests, please try again later.',
        });
    },
});

// ---------------- Routes ---------------------------------------------- //
// Public routes
app.use('/api/posts', globalLimiter, postsRoutes);
app.use('/api/research', globalLimiter, researchRoutes);

// Admin routes (protected)
app.use('/api/admin', adminRoutes);

// Health check route
app.use('/api', healthRouter);

// Custom error middleware (should be after routes)
app.use(errorHandler);

// ---------------- DB + Server ----------------------------------------- //
connectDB()
    .then(() => {
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error(
            '❌ Failed to connect to MongoDB. Server not started.',
            err,
        );
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
