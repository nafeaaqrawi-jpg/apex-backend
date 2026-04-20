import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { getTelemetrySummary, recordTelemetryEvent } from '../services/telemetry.service';

export const telemetryEventSchema = z.object({
  eventType: z.string().min(1).max(60),
  route: z.string().max(120).optional(),
  entityType: z.string().max(80).optional(),
  entityId: z.string().max(120).optional(),
  dwellMs: z.number().int().min(0).max(24 * 60 * 60 * 1000).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export async function recordTelemetryEventHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const event = await recordTelemetryEvent(req.user!.userId, req.body);
    res.json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
}

export async function getTelemetrySummaryHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const windowDays = typeof req.query.windowDays === 'string' ? Number(req.query.windowDays) : 14;
    const summary = await getTelemetrySummary(
      req.user!.userId,
      Number.isFinite(windowDays) && windowDays > 0 ? Math.min(windowDays, 90) : 14
    );
    res.json({ success: true, data: summary });
  } catch (err) {
    next(err);
  }
}
