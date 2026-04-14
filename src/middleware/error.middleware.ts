import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
      code: err.code,
    });
    return;
  }

  // Prisma unique constraint violation
  if ((err as NodeJS.ErrnoException & { code?: string }).code === 'P2002') {
    res.status(409).json({
      success: false,
      error: 'A record with this value already exists.',
      code: 'CONFLICT',
    });
    return;
  }

  if (process.env.NODE_ENV === 'development') {
    console.error(err);
  }

  res.status(500).json({
    success: false,
    error: 'An unexpected error occurred.',
    code: 'INTERNAL_ERROR',
  });
}
