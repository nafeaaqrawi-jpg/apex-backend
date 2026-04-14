import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import {
  getMessagesHandler,
  sendMessageHandler,
  sendMessageSchema,
  sendVoiceMessageHandler,
  sendVoiceMessageSchema,
} from '../controllers/message.controller';

const router = Router();

// Get all messages in a match (must be a participant)
router.get('/matches/:matchId/messages', requireAuth, getMessagesHandler);

// Send a message in a match (must be a MATCHED participant)
router.post(
  '/matches/:matchId/messages',
  requireAuth,
  validate(sendMessageSchema),
  sendMessageHandler
);

// Send a voice message in a match (Cloudinary URL, no content required)
router.post(
  '/matches/:matchId/voice',
  requireAuth,
  validate(sendVoiceMessageSchema),
  sendVoiceMessageHandler
);

export default router;
