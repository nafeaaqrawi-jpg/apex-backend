import http from 'http';
import express from 'express';
import cors, { CorsOptions } from 'cors';
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
import agentHubRoutes from './routes/agentHub.routes';
import telemetryRoutes from './routes/telemetry.routes';
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
  contentSecurityPolicy: false,      // Breaks Socket.io
  crossOriginEmbedderPolicy: false,  // Breaks cross-origin asset loads
  crossOriginResourcePolicy: false,  // Must be off — this is a cross-origin API
  crossOriginOpenerPolicy: false,    // Let the browser handle this
}));
app.use((_, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

const ALLOWED_ORIGINS = [
  env.FRONTEND_URL,
  'https://apex-social.com',
  'https://www.apex-social.com',
  'https://tryapextoday.com',
  'https://www.tryapextoday.com',
  'https://apex-match.com',
  'https://www.apex-match.com',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
];

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, mobile apps, server-to-server)
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`[cors] blocked origin: ${origin}`);
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200, // Some browsers choke on 204 for preflight
};

// Explicit OPTIONS preflight handler — must come before all routes
// Railway's edge can intercept OPTIONS before Express; this ensures it's handled
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

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
app.use('/api', apiLimiter, agentHubRoutes);
app.use('/api', apiLimiter, telemetryRoutes);
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
