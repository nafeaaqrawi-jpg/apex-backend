import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import {
  getDiscoverFeed,
  getNearbyProfiles,
  likeUser,
  getMatches,
  getSingleMatch,
  unmatch,
  getPendingRequests,
  getSentRequests,
  confirmWeMet,
  passUser,
  reportUser,
  getCompatibilityBreakdown,
} from '../services/match.service';
import { sendMessage } from '../services/message.service';
import { getIO } from '../lib/socket';
import { getBotConnectionReply } from '../lib/bots';

export const likeUserSchema = z.object({
  introMessage: z.string().max(280).optional(),
});

export const nearbyProfilesSchema = z.object({
  radiusMiles: z.coerce.number().min(5).max(250).optional(),
});

// GET /api/discover
export async function getDiscoverFeedHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const feed = await getDiscoverFeed(req.user!.userId);
    res.json({ success: true, data: feed });
  } catch (err) {
    next(err);
  }
}

export async function getNearbyProfilesHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const parsedQuery = nearbyProfilesSchema.safeParse(req.query);
    if (!parsedQuery.success) {
      res.status(400).json({
        success: false,
        error: 'Validation failed.',
        code: 'VALIDATION_ERROR',
        details: parsedQuery.error.flatten().fieldErrors,
      });
      return;
    }
    const { radiusMiles } = parsedQuery.data;
    const feed = await getNearbyProfiles(req.user!.userId, radiusMiles);
    res.json({ success: true, data: feed });
  } catch (err) {
    next(err);
  }
}

// POST /api/matches/like/:targetUserId
export async function likeUserHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { targetUserId } = req.params;
    const { introMessage } = req.body as z.infer<typeof likeUserSchema>;
    const result = await likeUser(req.user!.userId, targetUserId, introMessage);

    if (result.matched && result.match?.id && result.botAutoReplyUserId) {
      const io = getIO();
      setTimeout(async () => {
        try {
          const botMessage = await sendMessage(
            result.match!.id,
            result.botAutoReplyUserId!,
            getBotConnectionReply(result.botAutoReplyIntro)
          );
          io?.to(`match:${result.match!.id}`).emit('new_message', botMessage);
        } catch {
          // Non-critical demo behavior.
        }
      }, 1400);
    }

    res.status(result.matched ? 200 : 201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

// GET /api/matches
export async function getMatchesHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userMatches = await getMatches(req.user!.userId);
    res.json({ success: true, data: userMatches });
  } catch (err) {
    next(err);
  }
}

// GET /api/matches/:matchId
export async function getSingleMatchHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { matchId } = req.params;
    const match = await getSingleMatch(matchId, req.user!.userId);
    res.json({ success: true, data: match });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/matches/:matchId
export async function unmatchHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { matchId } = req.params;
    const updated = await unmatch(matchId, req.user!.userId);
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}

// GET /api/connections/requests
export async function getPendingRequestsHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const requests = await getPendingRequests(req.user!.userId);
    res.json({ success: true, data: requests });
  } catch (err) {
    next(err);
  }
}

// GET /api/connections/sent
export async function getSentRequestsHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const sent = await getSentRequests(req.user!.userId);
    res.json({ success: true, data: sent });
  } catch (err) {
    next(err);
  }
}

// POST /api/matches/:matchId/we-met
export async function confirmWeMetHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { matchId } = req.params;
    const result = await confirmWeMet(matchId, req.user!.userId);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export const reportUserSchema = z.object({
  reportedUserId: z.string().min(1),
  reason: z.enum(['SPAM', 'HARASSMENT', 'FAKE_PROFILE', 'INAPPROPRIATE', 'OTHER']),
  notes: z.string().max(1000).optional(),
});

// POST /api/connections/:userId/pass
export async function passUserHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { userId } = req.params;
    const result = await passUser(req.user!.userId, userId);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

// GET /api/connections/score/:targetUserId
export async function getCompatibilityScoreHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { targetUserId } = req.params as { targetUserId: string };
    const userId = req.user!.userId;
    const { total, breakdown } = await getCompatibilityBreakdown(userId, targetUserId);
    res.json({ success: true, data: { score: total, breakdown } });
  } catch (error) {
    next(error);
  }
}

// POST /api/connections/:matchId/report
export async function reportUserHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = reportUserSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: 'Validation failed.',
        code: 'VALIDATION_ERROR',
        details: parsed.error.flatten().fieldErrors,
      });
      return;
    }
    const { reportedUserId, reason, notes } = parsed.data;
    const report = await reportUser(req.user!.userId, reportedUserId, reason, notes);
    res.status(201).json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
}
