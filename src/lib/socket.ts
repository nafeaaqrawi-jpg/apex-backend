import { Server } from 'socket.io';
import http from 'http';
import { eq, and, ne, or } from 'drizzle-orm';
import { verifyToken } from '../utils/jwt';
import { sendMessage, getMessages } from '../services/message.service';
import { db } from './db';
import { messages as messagesTable, matches as matchesTable, users as usersTable } from '../db/schema';
import { env } from '../config/env';
import { BOT_EMAIL_DOMAIN, getRandomBotReply } from './bots';

// Plain interfaces for WebRTC signaling payloads — no DOM type dependency
interface RTCSessionDesc {
  type: string;
  sdp?: string;
}
interface RTCIceCand {
  candidate: string;
  sdpMid?: string | null;
  sdpMLineIndex?: number | null;
}

// Extend Socket data typing so TypeScript knows userId is always set after auth
declare module 'socket.io' {
  interface SocketData {
    userId: string;
  }
}

let _io: Server | null = null;

export function getIO(): Server | null {
  return _io;
}

export function createSocketServer(httpServer: http.Server) {
  const io = new Server(httpServer, {
    cors: {
      origin: env.FRONTEND_URL,
      credentials: true,
    },
  });
  _io = io;

  // ── Auth middleware ──────────────────────────────────────────────────────────
  io.use((socket, next) => {
    const cookieHeader = socket.handshake.headers.cookie ?? '';
    // Parse cookies properly (handles encoded values and edge cases)
    const cookieMap = Object.fromEntries(
      cookieHeader.split(';').map((c) => {
        const [k, ...v] = c.trim().split('=');
        return [k.trim(), decodeURIComponent(v.join('='))];
      })
    );
    const cookieToken = cookieMap['token'];
    const token = (socket.handshake.auth as { token?: string }).token ?? cookieToken;

    if (!token) {
      return next(new Error('Unauthorized'));
    }

    try {
      const payload = verifyToken(token);
      if (!payload.userId || typeof payload.userId !== 'string') {
        return next(new Error('Invalid token payload'));
      }
      socket.data.userId = payload.userId;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  // ── Connection handler ───────────────────────────────────────────────────────
  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    console.log(`[socket] connected: ${userId} (${socket.id})`);

    // ── join_match ─────────────────────────────────────────────────────────────
    socket.on('join_match', async (matchId: string) => {
      if (typeof matchId !== 'string' || !matchId.trim()) return;
      const [match] = await db
        .select({ userId1: matchesTable.userId1, userId2: matchesTable.userId2 })
        .from(matchesTable)
        .where(
          and(
            eq(matchesTable.id, matchId),
            or(eq(matchesTable.userId1, userId), eq(matchesTable.userId2, userId)),
            eq(matchesTable.status, 'MATCHED')
          )
        )
        .limit(1);
      if (!match) {
        socket.emit('error', { message: 'You are not part of this match.' });
        return;
      }
      socket.join(`match:${matchId}`);
      console.log(`[socket] ${userId} joined room match:${matchId}`);
    });

    // ── leave_match ────────────────────────────────────────────────────────────
    socket.on('leave_match', (matchId: string) => {
      if (typeof matchId === 'string' && matchId.trim()) {
        socket.leave(`match:${matchId}`);
        console.log(`[socket] ${userId} left room match:${matchId}`);
      }
    });

    // ── send_message ───────────────────────────────────────────────────────────
    socket.on(
      'send_message',
      async ({
        matchId,
        content,
        messageType,
        mediaUrl,
      }: {
        matchId: string;
        content: string;
        messageType?: string;
        mediaUrl?: string;
      }) => {
        try {
          if (!matchId) {
            socket.emit('error', { message: 'matchId is required.' });
            return;
          }

          const type = messageType ?? 'text';

          // Voice messages require mediaUrl; text messages require non-empty content
          if (type === 'voice') {
            if (!mediaUrl) {
              socket.emit('error', { message: 'Voice messages require a mediaUrl.' });
              return;
            }
          } else {
            if (!content || typeof content !== 'string' || content.length > 2000) {
              socket.emit('error', { message: 'matchId and content are required.' });
              return;
            }
          }

          const message = await sendMessage(matchId, userId, content ?? '', type, mediaUrl);
          io.to(`match:${matchId}`).emit('new_message', message);

          // ── Bot auto-reply (text only) ────────────────────────────────────
          if (type === 'text') {
            const [matchData] = await db
              .select({ userId1: matchesTable.userId1, userId2: matchesTable.userId2 })
              .from(matchesTable)
              .where(eq(matchesTable.id, matchId))
              .limit(1);
            if (matchData) {
              const otherUserId = matchData.userId1 === userId ? matchData.userId2 : matchData.userId1;
              const [otherUser] = await db
                .select({ email: usersTable.email })
                .from(usersTable)
                .where(eq(usersTable.id, otherUserId))
                .limit(1);
              if (otherUser?.email?.endsWith(BOT_EMAIL_DOMAIN)) {
                const typingDelay = 800 + Math.random() * 1200;
                const replyDelay = typingDelay + 1500 + Math.random() * 2500;
                // Show typing indicator first
                setTimeout(() => {
                  io.to(`match:${matchId}`).emit('user_typing', { userId: otherUserId, matchId });
                }, typingDelay);
                // Then send the reply
                setTimeout(async () => {
                  try {
                    const reply = getRandomBotReply(content);
                    const botMessage = await sendMessage(matchId, otherUserId, reply);
                    io.to(`match:${matchId}`).emit('new_message', botMessage);
                  } catch {
                    // bot response failure is non-critical
                  }
                }, replyDelay);
              }
            }
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Failed to send message.';
          socket.emit('error', { message: msg });
        }
      }
    );

    // ── get_messages ───────────────────────────────────────────────────────────
    socket.on('get_messages', async ({ matchId }: { matchId: string }) => {
      try {
        const msgs = await getMessages(matchId, userId);
        socket.emit('messages', { matchId, messages: msgs });
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to fetch messages.';
        socket.emit('error', { message: msg });
      }
    });

    // ── mark_read ──────────────────────────────────────────────────────────────
    socket.on('mark_read', async ({ matchId }: { matchId: string }) => {
      try {
        const [match] = await db
          .select({ userId1: matchesTable.userId1, userId2: matchesTable.userId2 })
          .from(matchesTable)
          .where(
            and(
              eq(matchesTable.id, matchId),
              or(eq(matchesTable.userId1, userId), eq(matchesTable.userId2, userId))
            )
          )
          .limit(1);

        if (!match) {
          socket.emit('error', { message: 'You are not part of this match.' });
          return;
        }

        await db
          .update(messagesTable)
          .set({ read: true })
          .where(
            and(
              eq(messagesTable.matchId, matchId),
              ne(messagesTable.senderUserId, userId)
            )
          );

        socket.to(`match:${matchId}`).emit('messages_read', { matchId, readBy: userId });
      } catch {
        // Non-critical
      }
    });

    // ── typing ─────────────────────────────────────────────────────────────────
    socket.on('typing', ({ matchId }: { matchId: string }) => {
      if (typeof matchId === 'string' && matchId.trim()) {
        socket.to(`match:${matchId}`).emit('user_typing', { userId, matchId });
      }
    });

    // ── WebRTC Call Signaling ──────────────────────────────────────────────────

    // Caller initiates — sends SDP offer to the other participant
    socket.on(
      'call_initiate',
      async ({
        matchId,
        callType,
        offer,
      }: {
        matchId: string;
        callType: 'voice' | 'video';
        offer: RTCSessionDesc;
      }) => {
        if (typeof matchId !== 'string' || !matchId.trim()) return;

        // Verify caller is a participant in a MATCHED conversation
        const [match] = await db
          .select({ userId1: matchesTable.userId1, userId2: matchesTable.userId2 })
          .from(matchesTable)
          .where(
            and(
              eq(matchesTable.id, matchId),
              or(eq(matchesTable.userId1, userId), eq(matchesTable.userId2, userId)),
              eq(matchesTable.status, 'MATCHED')
            )
          )
          .limit(1);

        if (!match) return;

        socket.to(`match:${matchId}`).emit('call_incoming', {
          matchId,
          callType,
          offer,
          callerId: userId,
        });
      }
    );

    // Callee accepts the call — sends SDP answer back to caller
    socket.on(
      'call_answer',
      ({ matchId, answer }: { matchId: string; answer: RTCSessionDesc }) => {
        if (typeof matchId === 'string' && matchId.trim()) {
          socket.to(`match:${matchId}`).emit('call_answered', { matchId, answer });
        }
      }
    );

    // Either party sends an ICE candidate
    socket.on(
      'ice_candidate',
      ({ matchId, candidate }: { matchId: string; candidate: RTCIceCand }) => {
        if (typeof matchId === 'string' && matchId.trim()) {
          socket.to(`match:${matchId}`).emit('ice_candidate', { matchId, candidate });
        }
      }
    );

    // Either party ends the call
    socket.on('call_end', ({ matchId }: { matchId: string }) => {
      if (typeof matchId === 'string' && matchId.trim()) {
        socket.to(`match:${matchId}`).emit('call_ended', { matchId, endedBy: userId });
      }
    });

    // Callee rejects the incoming call
    socket.on('call_reject', ({ matchId }: { matchId: string }) => {
      if (typeof matchId === 'string' && matchId.trim()) {
        socket.to(`match:${matchId}`).emit('call_rejected', { matchId });
      }
    });

    // ── disconnect ─────────────────────────────────────────────────────────────
    socket.on('disconnect', (reason) => {
      console.log(`[socket] disconnected: ${userId} — ${reason}`);
    });
  });

  return io;
}
