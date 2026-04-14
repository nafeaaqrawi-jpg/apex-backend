import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { searchCollegesHandler } from '../controllers/user.controller';

const router = Router();

// GET /api/colleges?search=Harvard — search colleges by name
// Also accessible as GET /api/colleges/search?q=Harvard (legacy)
router.get('/', requireAuth, searchCollegesHandler);
router.get('/search', requireAuth, searchCollegesHandler);

export default router;
