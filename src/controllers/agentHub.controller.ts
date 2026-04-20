import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import {
  compileAgentArtifact,
  ensureAgentChannel,
  getAgentArtifact,
  getAgentChannel,
  listAgentArtifacts,
  postAgentChannelMessage,
} from '../services/agentHub.service';

export const ensureAgentChannelSchema = z.object({
  key: z.string().min(1).max(80).optional(),
  title: z.string().min(1).max(120).optional(),
  description: z.string().max(240).optional(),
});

export const agentMessageSchema = z.object({
  speakerType: z.enum(['founder', 'agent', 'system']).optional(),
  agentKey: z.string().max(80).optional(),
  displayName: z.string().max(80).optional(),
  roleLabel: z.string().max(120).optional(),
  content: z.string().min(1).max(1200),
});

export const compileArtifactSchema = z.object({
  artifactType: z.enum(['implementation_plan', 'research_digest']).optional(),
});

export async function ensureAgentChannelHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const channel = await ensureAgentChannel(req.body);
    res.json({ success: true, data: channel });
  } catch (err) {
    next(err);
  }
}

export async function getAgentChannelHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await getAgentChannel(req.params.key);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function postAgentMessageHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await postAgentChannelMessage(req.params.key, req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function compileAgentArtifactHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const artifact = await compileAgentArtifact(req.params.key, req.user!.userId, req.body);
    res.json({ success: true, data: artifact });
  } catch (err) {
    next(err);
  }
}

export async function listAgentArtifactsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const key = typeof req.query.key === 'string' ? req.query.key : undefined;
    const artifacts = await listAgentArtifacts(key);
    res.json({ success: true, data: artifacts });
  } catch (err) {
    next(err);
  }
}

export async function getAgentArtifactHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const artifact = await getAgentArtifact(req.params.id);
    res.json({ success: true, data: artifact });
  } catch (err) {
    next(err);
  }
}
