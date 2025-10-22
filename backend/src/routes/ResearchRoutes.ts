import { Router } from 'express';
import { getAllResearch, getResearchBySlug, getTwoNewestResearch } from '../controllers/ResearchController';

const router = Router();

// Get all research (with optional filtering)
router.get('/', getAllResearch);

// Get newest research (latest 2)
router.get('/newest', getTwoNewestResearch);

// Get research by slug
router.get('/:slug', getResearchBySlug);

export default router;
