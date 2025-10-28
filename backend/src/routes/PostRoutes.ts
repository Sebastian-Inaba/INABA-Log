import { Router } from 'express';
import {
    getAllPosts,
    getPostBySlug,
    getNewestPost,
    getFeaturedPosts,
    getLatestFivePosts,
} from '../controllers/PostController';

const router = Router();

// Get all posts
router.get('/', getAllPosts);

// Get the newest post
router.get('/newest', getNewestPost);

// Get featured posts
router.get('/featured', getFeaturedPosts);

// Get latest five posts (excluding the newest)
router.get('/latest-five', getLatestFivePosts);

// Get a post by Slug
router.get('/:slug', getPostBySlug);

export default router;
