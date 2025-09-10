import { Router } from 'express';
import { getAllResearch, getResearchById, getTwoNewestResearch } from '../controllers/ResearchController';

const router = Router();

// Get all research (with optional filtering)
router.get('/', getAllResearch);

// Get newest research (latest 2)
router.get('/newest', getTwoNewestResearch);

// Get research by ID
router.get('/:id', getResearchById);

export default router;
