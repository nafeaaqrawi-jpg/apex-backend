import http from 'http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import collegeRoutes from './routes/college.routes';
import matchRoutes from './routes/match.routes';
import messageRoutes from './routes/message.routes';
import searchRoutes from './routes/search.routes';
import postRoutes from './routes/post.routes';
import rizzAssistRoutes from './routes/rizzassist.routes';
import gameRoutes from './routes/game.routes';
import { errorHandler } from './middleware/error.middleware';
import { createSocketServer } from './lib/socket';
import paymentRoutes from './routes/payment.routes';
import { webhookHandler } from './controllers/payment.controller';

const app = express();

// ── Stripe webhook — raw body required, must register BEFORE express.json() ───
app.post(
  '/api/payments/webhook',
  express.raw({ type: 'application/json' }),
  webhookHandler
);

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false, // Disabled — Helmet's default CSP breaks Socket.io
  crossOriginEmbedderPolicy: false,
}));
app.use((_, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});
const ALLOWED_ORIGINS = [
  env.FRONTEND_URL,
  'https://apex-match.com',
  'https://www.apex-match.com',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
];
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl) in dev
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`[cors] blocked origin: ${origin}`);
        callback(null, false);
      }
    },
    credentials: true, // Required for cookies to work cross-origin
  })
);

// ── Request parsing ───────────────────────────────────────────────────────────
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', env: env.NODE_ENV } });
});

// ── Global API rate limiter (100 req/min per IP) ──────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { success: false, error: 'Too many requests. Please slow down.', code: 'RATE_LIMITED' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── API routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', apiLimiter, userRoutes);
app.use('/api/colleges', apiLimiter, collegeRoutes);
app.use('/api', apiLimiter, matchRoutes);
app.use('/api', apiLimiter, messageRoutes);
app.use('/api', apiLimiter, searchRoutes);
app.use('/api', apiLimiter, postRoutes);
app.use('/api', apiLimiter, rizzAssistRoutes);
app.use('/api/game', apiLimiter, gameRoutes);
app.use('/api/payments', apiLimiter, paymentRoutes);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found.', code: 'NOT_FOUND' });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use(errorHandler);

// ── HTTP + Socket.io server ───────────────────────────────────────────────────
const httpServer = http.createServer(app);
createSocketServer(httpServer);

httpServer.listen(env.PORT, () => {
  console.log(`Apex API running → http://localhost:${env.PORT}`);
  console.log(`Environment: ${env.NODE_ENV}`);
});

export default app;
