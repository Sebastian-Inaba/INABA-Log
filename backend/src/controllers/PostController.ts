// post controller
import { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';
import { Post, IPost } from '../models/PostModel';

// get all posts
export const getAllPosts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tag = req.query.tag as string | undefined;
        const category = req.query.category as string | undefined;
        const author = req.query.author as string | undefined;
        const featured = req.query.featured as string | undefined;
        const dateFilter = req.query.dateFilter as string | undefined;
        const limit = parseInt(req.query.limit as string) || 10; // default limit
        const page = parseInt(req.query.page as string) || 1;

        const filter: any = {};
        if (tag) filter.tags = { $in: [tag] };
        if (category) filter.category = category;
        if (author) filter.author = author;
        if (featured === 'true') filter.featured = true;
        if (featured === 'false') filter.featured = false;

        const now = new Date();
        if (dateFilter) {
            filter.createdAt = {};
            switch (dateFilter) {
                case 'newest':
                    filter.createdAt.$gte = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                    break;
                case 'week':
                    filter.createdAt.$gte = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case 'month':
                    filter.createdAt.$gte = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    break;
                case 'year':
                    filter.createdAt.$gte = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                    break;
                case 'older':
                    filter.createdAt.$lt = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                    break;
            }
        }

        const skip = (page - 1) * limit;

        const posts = await Post.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('title author description category tags featuredImage createdAt updatedAt')
            .lean();

        const totalPosts = await Post.countDocuments(filter);

        res.status(200).json({
            success: true,
            posts,
            total: totalPosts,
            page,
            pages: Math.ceil(totalPosts / limit),
            limit,
        });
    } catch (err) {
        next(err);
    }
};

// get newest post
export const getNewestPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const post = await Post.findOne()
            .sort({ createdAt: -1 })
            .select('title author description category tags featuredImage createdAt slug');

        if (!post) throw createHttpError(404, 'No posts found');

        res.status(200).json({ success: true, post });
    } catch (err) {
        next(err);
    }
};

// get featured posts
export const getFeaturedPosts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const posts = await Post.find({ featured: true }).select('title category featured slug');

        res.status(200).json({
            success: true,
            posts,
            total: posts.length,
        });
    } catch (err) {
        next(err);
    }
};

// get post by slug
export const getPostBySlug = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { slug } = req.params;
        const post = await Post.findOne({ slug });

        if (!post) throw createHttpError(404, 'Post not found');

        res.status(200).json({ success: true, post });
    } catch (err) {
        next(err);
    }
};

// get latest five posts (excluding the newest)
export const getLatestFivePosts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .skip(1)
            .limit(5)
            .select('title author description category tags featuredImage createdAt updatedAt slug');

        res.status(200).json({
            success: true,
            posts,
            total: posts.length,
        });
    } catch (err) {
        next(err);
    }
};
