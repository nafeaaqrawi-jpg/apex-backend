import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { getMessages, sendMessage } from '../services/message.service';
import { getIO } from '../lib/socket';
import { db } from '../lib/db';
import { users, matches } from '../db/schema';
import { BOT_EMAIL_DOMAIN, getRandomBotReply } from '../lib/bots';

export const sendMessageSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty.').max(2000, 'Message is too long.'),
});

export const sendVoiceMessageSchema = z.object({
  mediaUrl: z.string().url('Invalid media URL.'),
});

// GET /api/matches/:matchId/messages
export async function getMessagesHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { matchId } = req.params;
    const msgs = await getMessages(matchId, req.user!.userId);
    res.json({ success: true, data: msgs });
  } catch (err) {
    next(err);
  }
}

// POST /api/matches/:matchId/messages
export async function sendMessageHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { matchId } = req.params;
    const { content } = req.body as z.infer<typeof sendMessageSchema>;
    const message = await sendMessage(matchId, req.user!.userId, content);

    // Emit to socket room for real-time delivery to the other participant
    const io = getIO();
    if (io) {
      io.to(`match:${matchId}`).emit('new_message', message);

      // Bot auto-reply
      const [matchData] = await db
        .select({ userId1: matches.userId1, userId2: matches.userId2 })
        .from(matches)
        .where(eq(matches.id, matchId))
        .limit(1);

      if (matchData) {
        const senderId = req.user!.userId;
        const otherUserId = matchData.userId1 === senderId ? matchData.userId2 : matchData.userId1;
        const [otherUser] = await db
          .select({ email: users.email })
          .from(users)
          .where(eq(users.id, otherUserId))
          .limit(1);

        if (otherUser?.email?.endsWith(BOT_EMAIL_DOMAIN)) {
          const delay = 2000 + Math.random() * 4000;
          setTimeout(async () => {
            try {
              const reply = getRandomBotReply();
              const botMessage = await sendMessage(matchId, otherUserId, reply);
              io.to(`match:${matchId}`).emit('new_message', botMessage);
            } catch {
              // bot response failure is non-critical
            }
          }, delay);
        }
      }
    }

    res.status(201).json({ success: true, data: message });
  } catch (err) {
    next(err);
  }
}

// POST /api/messages/:matchId/voice
export async function sendVoiceMessageHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { matchId } = req.params;
    const { mediaUrl } = req.body as z.infer<typeof sendVoiceMessageSchema>;
    const message = await sendMessage(matchId, req.user!.userId, '', 'voice', mediaUrl);

    const io = getIO();
    if (io) {
      io.to(`match:${matchId}`).emit('new_message', message);
    }

    res.status(201).json({ success: true, data: message });
  } catch (err) {
    next(err);
  }
}
