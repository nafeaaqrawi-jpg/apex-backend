import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { createCheckoutSessionHandler } from '../controllers/payment.controller';

const router = Router();

// Checkout requires auth
router.post('/create-checkout-session', requireAuth, createCheckoutSessionHandler);

export default router;
