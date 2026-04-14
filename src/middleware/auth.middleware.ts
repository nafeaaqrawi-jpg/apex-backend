import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt';
import { AppError } from './error.middleware';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const cookieToken = req.cookies?.token as string | undefined;
  const headerToken = (req.headers.authorization ?? '').replace('Bearer ', '');
  const token = cookieToken || headerToken;

  if (!token) {
    return next(new AppError('Authentication required.', 401, 'UNAUTHORIZED'));
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    next(new AppError('Invalid or expired session. Please log in again.', 401, 'TOKEN_INVALID'));
  }
}
