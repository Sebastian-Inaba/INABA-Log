import { Router } from 'express';
import {
    createPost,
    updatePost,
    deletePost,
    getPost,
    createResearch,
    updateResearch,
    deleteResearch,
    getResearch,
    getAllContent,
    getContentStats,
    toggleFeatured,
} from '../controllers/AdminController';
import { requireGoogleAuth } from '../middleware/AuthMiddleware';
import { login, logout, getCurrentUser } from '../controllers/AuthController';
import uploadMiddleware from '../middleware/UploadMiddleware';
import rateLimit from 'express-rate-limit';

const router = Router();

// Admin/write limiter (for admin endpoints)
export const RateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // max 20 requests per 15 min per IP
    message: 'Too many admin requests, please try again later.',
});

// -------------------- AUTH ------------------------------------------------------------------------ //
// Login with Google - sets id cookie
router.post('/login', RateLimiter, requireGoogleAuth, login);

// Logout - clears id cookie
router.post('/logout', logout);

// Get current user - checks cookie
router.get('/me', requireGoogleAuth, getCurrentUser);

// -------------------- POSTS ---------------------------------------------------------------------- //
// Create Post
router.post(
    '/posts',
    requireGoogleAuth,
    uploadMiddleware.single('featuredImage'),
    createPost,
);

// Update Post
router.patch(
    '/posts/:id',
    requireGoogleAuth,
    uploadMiddleware.single('featuredImage'),
    updatePost,
);

// Delete Post
router.delete('/posts/:id', requireGoogleAuth, deletePost);

// Get Post (id)
router.get('/posts/:id', requireGoogleAuth, getPost);

// -------------------- RESEARCH ------------------------------------------------------------------- //

// Create Research
router.post(
    '/research',
    requireGoogleAuth,
    uploadMiddleware.fields([
        { name: 'featuredImage', maxCount: 1 },
        { name: 'pdfAttachment', maxCount: 1 },
    ]),
    createResearch,
);

// Update Research
router.patch(
    '/research/:id',
    requireGoogleAuth,
    uploadMiddleware.fields([
        { name: 'featuredImage', maxCount: 1 },
        { name: 'pdfAttachment', maxCount: 1 },
    ]),
    updateResearch,
);

// Delete Research
router.delete('/research/:id', requireGoogleAuth, deleteResearch);

// Get Research (id)
router.get('/research/:id', requireGoogleAuth, getResearch);

// -------------------- ADMIN PANEL ----------------------------------------------------------------- //
// Get all content (posts + research)
router.get('/content', requireGoogleAuth, getAllContent);

// Get content statistics for dashboard
router.get('/content/stats', requireGoogleAuth, getContentStats);

// Toggle featured status
router.patch('/content/:type/:id/featured', requireGoogleAuth, toggleFeatured);

export default router;
