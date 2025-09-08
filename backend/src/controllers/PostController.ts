// post controller
import { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';
import { Post, IPost } from '../models/PostModel';

// get all posts
export const getPosts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tag = req.query.tag as string | undefined;
        const category = req.query.category as string | undefined;

        const filter: any = {};

        if (tag) filter.tags = { $in: [tag] }; // MongoDB array match
        if (category) filter.category = category;

        const posts = await Post.find(filter).sort({ createdAt: -1 }); // newest first

        res.status(200).json({
            success: true,
            posts,
            total: posts.length,
        });
    } catch (err) {
        next(err);
    }
};

// get post by id
// Can fetch by _id or slug
export const getPostById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        if (!id) throw createHttpError(400, 'Post ID is required');

        const post: IPost | null = await Post.findById(id);
        if (!post) throw createHttpError(404, 'Post not found');

        res.status(200).json({ success: true, post });
    } catch (err) {
        next(err);
    }
};
