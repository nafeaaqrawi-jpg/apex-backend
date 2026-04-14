import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { nearbySearchHandler, searchHandler } from '../controllers/search.controller';

const router = Router();

// GET /api/search?q=harvard+girl+interested+in+startups
router.get('/search', requireAuth, searchHandler);
router.get('/search/nearby', requireAuth, nearbySearchHandler);

export default router;
