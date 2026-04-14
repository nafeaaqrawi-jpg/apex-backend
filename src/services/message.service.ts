import { eq, and, or, asc } from 'drizzle-orm';
import { db } from '../lib/db';
import { matches, messages } from '../db/schema';
import { AppError } from '../middleware/error.middleware';

// ── Message mapper ─────────────────────────────────────────────────────────────
// Maps the DB row shape to the shape the frontend expects.
// DB has senderUserId; frontend Message type uses senderId.
export type MappedMessage = {
  id: string;
  matchId: string;
  senderId: string;
  content: string;
  messageType: string;
  mediaUrl: string | null;
  createdAt: string;
  readAt?: string;
};

function mapMessage(msg: typeof messages.$inferSelect): MappedMessage {
  const createdAt =
    msg.createdAt instanceof Date
      ? msg.createdAt.toISOString()
      : String(msg.createdAt);
  return {
    id: msg.id,
    matchId: msg.matchId,
    senderId: msg.senderUserId,
    content: msg.content,
    messageType: msg.messageType ?? 'text',
    mediaUrl: msg.mediaUrl ?? null,
    createdAt,
  };
}

// ── Helper ─────────────────────────────────────────────────────────────────────
// Throws if the user is not one of the two participants in the match.
async function assertUserInMatch(matchId: string, userId: string) {
  const [match] = await db
    .select()
    .from(matches)
    .where(eq(matches.id, matchId));

  if (!match) throw new AppError('Match not found.', 404, 'NOT_FOUND');

  if (match.userId1 !== userId && match.userId2 !== userId) {
    throw new AppError('You are not part of this match.', 403, 'FORBIDDEN');
  }

  return match;
}

// ── getMessages ────────────────────────────────────────────────────────────────
// Returns all messages in a match, oldest first.
export async function getMessages(matchId: string, userId: string) {
  await assertUserInMatch(matchId, userId);

  const rows = await db
    .select()
    .from(messages)
    .where(eq(messages.matchId, matchId))
    .orderBy(asc(messages.createdAt));

  return rows.map(mapMessage);
}

// ── sendMessage ────────────────────────────────────────────────────────────────
// Validates membership + MATCHED status, then inserts and returns the message.
export async function sendMessage(
  matchId: string,
  senderUserId: string,
  content: string,
  messageType?: string,
  mediaUrl?: string
) {
  const match = await assertUserInMatch(matchId, senderUserId);

  if (match.status !== 'MATCHED') {
    throw new AppError(
      'You can only send messages in an active match.',
      403,
      'MATCH_NOT_ACTIVE'
    );
  }

  const type = messageType ?? 'text';

  // Voice messages may have empty content — require mediaUrl instead
  if (type !== 'voice' && !content.trim()) {
    throw new AppError('Message cannot be empty.', 400, 'EMPTY_MESSAGE');
  }
  if (type === 'voice' && !mediaUrl) {
    throw new AppError('Voice messages require a mediaUrl.', 400, 'VOICE_REQUIRES_URL');
  }

  const [message] = await db
    .insert(messages)
    .values({
      matchId,
      senderUserId,
      content,
      messageType: type,
      mediaUrl: mediaUrl ?? null,
    })
    .returning();

  return mapMessage(message);
}
