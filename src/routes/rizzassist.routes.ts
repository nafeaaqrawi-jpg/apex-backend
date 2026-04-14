import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import {
  rizzAssistHandler,
  rizzAssistChatHandler,
  rizzAssistSchema,
  rizzAssistChatSchema,
} from '../controllers/rizzassist.controller';

const router = Router();

router.post('/rizzassist/respond', requireAuth, validate(rizzAssistSchema), rizzAssistHandler);
router.post('/rizzassist/chat', requireAuth, validate(rizzAssistChatSchema), rizzAssistChatHandler);

export default router;
