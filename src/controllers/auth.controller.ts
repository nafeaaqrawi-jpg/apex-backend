import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as AuthService from '../services/auth.service';
import { env } from '../config/env';

// In production the frontend (Vercel) and backend (Railway) are on different domains.
// SameSite=None; Secure is required for cross-site cookies to be sent with credentials.
// In dev (localhost), SameSite=Lax works fine since both run on the same host.
const isProduction = env.NODE_ENV === 'production';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
};

// ── Validation schemas ────────────────────────────────────────────────────────

export const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters.')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
    .regex(/[0-9]/, 'Password must contain at least one number.'),
  firstName: z.string().min(1, 'First name is required.').max(50).trim(),
  lastName: z.string().min(1, 'Last name is required.').max(50).trim(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required.'),
});

export const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/)
    .regex(/[0-9]/),
});

// ── Handlers ──────────────────────────────────────────────────────────────────

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await AuthService.registerUser(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { token } = req.query as { token?: string };
    if (!token) {
      res.status(400).json({ success: false, error: 'Token is required.', code: 'MISSING_TOKEN' });
      return;
    }
    const { user, jwt } = await AuthService.verifyEmail(token);
    res.cookie('token', jwt, COOKIE_OPTIONS);
    res.json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { user, jwt } = await AuthService.loginUser(req.body);
    res.cookie('token', jwt, COOKIE_OPTIONS);
    res.json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
}

export async function logout(_req: Request, res: Response): Promise<void> {
  res.clearCookie('token');
  res.json({ success: true, data: { message: 'Logged out successfully.' } });
}

export async function forgotPassword(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await AuthService.forgotPassword(req.body.email);
    res.json({
      success: true,
      data: { message: 'If that email exists, a password reset link has been sent.' },
    });
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await AuthService.resetPassword(req.body.token, req.body.password);
    res.json({
      success: true,
      data: { message: 'Password reset successfully. Please log in.' },
    });
  } catch (err) {
    next(err);
  }
}

export async function me(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await AuthService.getMe(req.user!.userId);
    res.json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
}

export async function resendVerification(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await AuthService.resendVerification(req.body.email);
    res.json({
      success: true,
      data: { message: 'If your email is unverified, a new link has been sent.' },
    });
  } catch (err) {
    next(err);
  }
}
