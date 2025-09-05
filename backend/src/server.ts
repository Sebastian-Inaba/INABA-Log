import express from 'express';
import dotenv from 'dotenv';
import { connectDB, disconnectDB } from './config/DB';
import { errorHandler } from './middleware/ErrorMiddleware';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Server Middleware
app.use(express.json());

// Routes
app.use('/api');

// Error handling middleware
app.use(errorHandler);

// Connect to DB and start server
connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Failed to connect to MongoDB. Server not started.', err);
    });

// Grace db shutdown on (Ctrl + C)
process.on('SIGINT', async () => {
    console.log('SIGINT received. Disconnecting DB...');
    await disconnectDB();
    process.exit(0);
});

// Grace db shutdown on (Unexpected server shutdown or restart)
process.on('SIGTERM', async () => {
    console.log('SIGTERM received. Disconnecting DB...');
    await disconnectDB();
    process.exit(0);
});
