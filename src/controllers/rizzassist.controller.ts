import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { getRizzAssistChatResponse, getRizzAssistResponse } from '../services/rizzassist.service';

export const rizzAssistSchema = z.object({
  message: z.string().min(1, 'Give rizzler67 something to work with.').max(280),
  intent: z.enum(['open', 'reply', 'recover']),
  tone: z.enum(['playful', 'confident', 'warm']),
  audience: z.enum(['woman', 'man', 'any']),
});

export const rizzAssistChatSchema = z.object({
  message: z.string().min(1, 'Give rizzler67 something to work with.').max(500),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().min(1).max(1000),
      })
    )
    .optional(),
  intent: z.enum(['open', 'reply', 'recover']),
  tone: z.enum(['playful', 'confident', 'warm']),
  audience: z.enum(['woman', 'man', 'any']),
  persona: z.enum(['nerdy', 'goth', 'consultant', 'investment_banker', 'swe', 'creative', 'athlete']).optional(),
  goal: z.enum(['flirt', 'build_rapport', 'set_up_date']).optional(),
  boundary: z.enum(['clean', 'light_flirty', 'bold']).optional(),
  profileSignals: z
    .object({
      college: z.string().max(120).optional(),
      currentLocation: z.string().max(120).optional(),
      workLocation: z.string().max(120).optional(),
      futureLocation: z.string().max(120).optional(),
      currentRole: z.string().max(120).optional(),
      company: z.string().max(120).optional(),
      verified: z.boolean().optional(),
      gpa: z.number().optional(),
      sat: z.number().optional(),
      act: z.number().optional(),
    })
    .optional(),
});

export async function rizzAssistHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = getRizzAssistResponse(req.body);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function rizzAssistChatHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = getRizzAssistChatResponse(req.body);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
