// mongodb
import mongoose from 'mongoose';
import { env } from './env'; // Import type-safe env variables
import { log, error, debug, warn } from '../utilities/logger';

// Connect to MongoDB
export const connectDB = async (): Promise<void> => {
    try {
        // Use the validated MongoDB URI from env.ts
        await mongoose.connect(env.mongodbUri);
        log('✅ MongoDB connected');
    } catch (err) {
        error('❌ MongoDB connection error:', err);
        throw error; // Propagate error instead of exiting here
    }
};

// Disconnect from MongoDB
export const disconnectDB = async (): Promise<void> => {
    try {
        await mongoose.disconnect();
        log('MongoDB disconnected');
    } catch (err) {
        error('Error disconnecting MongoDB:', err);
    }
};
