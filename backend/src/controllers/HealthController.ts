import { Request, Response, NextFunction } from 'express';
import { Post } from '../models/PostModel';
import { supabase, buckets } from '../config/Storage';

export const healthCheck = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const health: any = {
            status: 'ok',
            timestamp: new Date().toISOString(),
            services: {},
        };

        // Ping MongoDB - lightweight query
        try {
            await Post.findOne().select('_id').limit(1).lean();
            health.services.mongodb = 'connected';
        } catch (err) {
            health.services.mongodb = 'error';
            health.status = 'degraded';
        }

        // Ping Supabase - check bucket existence
        try {
            const { data, error } = await supabase.storage.getBucket(buckets.posts);
            if (error) throw error;
            health.services.supabase = 'connected';
        } catch (err) {
            health.services.supabase = 'error';
            health.status = 'degraded';
        }

        res.status(200).json(health);
    } catch (err) {
        next(err);
    }
};