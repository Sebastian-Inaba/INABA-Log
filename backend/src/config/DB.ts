// mongodb
import mongoose from 'mongoose';
import { env } from './env'; // Import type-safe env variables

// Connect to MongoDB
export const connectDB = async (): Promise<void> => {
    try {
        // Use the validated MongoDB URI from env.ts
        await mongoose.connect(env.mongodbUri);
        console.log('✅ MongoDB connected');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        throw error; // Propagate error instead of exiting here
    }
};

// Disconnect from MongoDB
export const disconnectDB = async (): Promise<void> => {
    try {
        await mongoose.disconnect();
        console.log('MongoDB disconnected');
    } catch (error) {
        console.error('Error disconnecting MongoDB:', error);
    }
};
