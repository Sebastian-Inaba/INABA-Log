import { Router } from 'express';
import {
    createPost,
    updatePost,
    deletePost,
    createResearch,
    updateResearch,
    deleteResearch,
    getAllContent,
    getContentStats,
    toggleFeatured,
} from '../controllers/AdminController';
import { requireGoogleAuth } from '../middleware/AuthMiddleware';
import { uploadMiddleware } from '../middleware/UploadMiddleware';

const router = Router();

// -------------------- POSTS ---------------------------------------------------------------------- //
// Create Post
router.post('/posts', requireGoogleAuth, uploadMiddleware.single('featuredImage'), createPost);

// Update Post
router.patch('/posts/:id', requireGoogleAuth, uploadMiddleware.single('featuredImage'), updatePost);

// Delete Post
router.delete('/posts/:id', requireGoogleAuth, deletePost);

// -------------------- RESEARCH ------------------------------------------------------------------- //

// -------------------- IN TESTING ---------------------------------------------------------------------------------------------- //
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
// -------------------- IN TESTING ---------------------------------------------------------------------------------------------- //

// -------------------- ADMIN PANEL ----------------------------------------------------------------- //
// Get all content (posts + research)
router.get('/content', requireGoogleAuth, getAllContent);

// Get content statistics for dashboard
router.get('/content/stats', requireGoogleAuth, getContentStats);

// Toggle featured status
router.patch('/content/:type/:id/featured', requireGoogleAuth, toggleFeatured);

export default router;
