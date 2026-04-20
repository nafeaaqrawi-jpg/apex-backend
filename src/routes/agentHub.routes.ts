import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import {
  agentMessageSchema,
  compileArtifactSchema,
  ensureAgentChannelHandler,
  ensureAgentChannelSchema,
  getAgentArtifactHandler,
  getAgentChannelHandler,
  listAgentArtifactsHandler,
  postAgentMessageHandler,
  compileAgentArtifactHandler,
} from '../controllers/agentHub.controller';

const router = Router();

router.post('/agents/channels', requireAuth, validate(ensureAgentChannelSchema), ensureAgentChannelHandler);
router.get('/agents/channels/:key', requireAuth, getAgentChannelHandler);
router.post('/agents/channels/:key/messages', requireAuth, validate(agentMessageSchema), postAgentMessageHandler);
router.post('/agents/channels/:key/compile', requireAuth, validate(compileArtifactSchema), compileAgentArtifactHandler);
router.get('/agents/artifacts', requireAuth, listAgentArtifactsHandler);
router.get('/agents/artifacts/:id', requireAuth, getAgentArtifactHandler);

export default router;
