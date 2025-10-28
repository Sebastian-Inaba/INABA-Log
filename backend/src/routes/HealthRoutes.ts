import { Router } from 'express';
import { healthCheck } from '../controllers/HealthController';

const router = Router();

router.get('/health', healthCheck);

export default router;