import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { validate } from '../middleware/validate';
import { requireAuth } from '../middleware/auth.middleware';
import * as AuthController from '../controllers/auth.controller';

const router = Router();

// 5 attempts per 15 minutes for sensitive auth actions (brute-force window)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true, // Only count failures toward the window
  message: {
    success: false,
    error: 'Too many failed attempts. Please wait 15 minutes and try again.',
    code: 'RATE_LIMITED',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 100 requests per minute for general endpoints
const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { success: false, error: 'Too many requests. Please slow down.', code: 'RATE_LIMITED' },
});

router.post('/register', authLimiter, validate(AuthController.registerSchema), AuthController.register);
router.get('/verify-email', generalLimiter, AuthController.verifyEmail);
router.post('/login', authLimiter, validate(AuthController.loginSchema), AuthController.login);
router.post('/logout', AuthController.logout);
router.post('/forgot-password', authLimiter, validate(AuthController.emailSchema), AuthController.forgotPassword);
router.post('/reset-password', authLimiter, validate(AuthController.resetPasswordSchema), AuthController.resetPassword);
router.post('/resend-verification', authLimiter, validate(AuthController.emailSchema), AuthController.resendVerification);
router.get('/me', generalLimiter, requireAuth, AuthController.me);

export default router;
