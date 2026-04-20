import { asc, desc, eq } from 'drizzle-orm';
import { db } from '../lib/db';
import { agentArtifacts, agentChannels, agentMessages } from '../db/schema';
import {
  AGENT_ROSTER,
  DEFAULT_AGENT_CHANNEL_KEY,
  buildAutoReplies,
  buildImplementationPlanContent,
  buildResearchDigestContent,
  buildSeedMessages,
} from '../lib/agents';
import { AppError } from '../middleware/error.middleware';
import { getTelemetrySummary } from './telemetry.service';

export interface EnsureChannelInput {
  key?: string;
  title?: string;
  description?: string;
}

export interface CreateChannelMessageInput {
  speakerType?: 'founder' | 'agent' | 'system';
  agentKey?: string;
  displayName?: string;
  roleLabel?: string;
  content: string;
}

export interface CompileArtifactInput {
  artifactType?: 'implementation_plan' | 'research_digest';
}

function normalizeChannelKey(key?: string) {
  return (key?.trim() || DEFAULT_AGENT_CHANNEL_KEY).toLowerCase();
}

async function getOrCreateChannel(input?: EnsureChannelInput) {
  const key = normalizeChannelKey(input?.key);
  const existing = await db.select().from(agentChannels).where(eq(agentChannels.key, key));
  if (existing[0]) {
    return existing[0];
  }

  const [created] = await db
    .insert(agentChannels)
    .values({
      key,
      title: input?.title?.trim() || 'Apex Council',
      description:
        input?.description?.trim() ||
        'Shared operating channel for product research, planning, and implementation.',
      metadata: {
        rosterKeys: AGENT_ROSTER.map((agent) => agent.key),
      },
    })
    .returning();

  return created;
}

async function seedChannelIfNeeded(channelId: string) {
  const existingMessages = await db.select().from(agentMessages).where(eq(agentMessages.channelId, channelId));
  if (existingMessages.length === 0) {
    const now = Date.now();
    await db.insert(agentMessages).values(
      buildSeedMessages().map((message, index) => ({
        channelId,
        speakerType: 'agent',
        agentKey: message.agentKey,
        displayName: message.displayName,
        roleLabel: message.roleLabel,
        content: message.content,
        metadata: message.metadata,
        createdAt: new Date(now + index * 1000),
      }))
    );
  }

  const existingArtifacts = await db.select().from(agentArtifacts).where(eq(agentArtifacts.channelId, channelId));
  const hasResearchDigest = existingArtifacts.some((artifact) => artifact.artifactType === 'research_digest');
  const hasPlan = existingArtifacts.some((artifact) => artifact.artifactType === 'implementation_plan');

  if (!hasResearchDigest) {
    await db.insert(agentArtifacts).values({
      channelId,
      artifactType: 'research_digest',
      title: 'Council Research Digest',
      summary: 'What women, men, and college students respond to in a premium social app.',
      content: buildResearchDigestContent(),
    });
  }

  if (!hasPlan) {
    await db.insert(agentArtifacts).values({
      channelId,
      artifactType: 'implementation_plan',
      title: 'Council Implementation Plan',
      summary: 'Step-by-step plan for shell, trust, discovery, AI, and retention instrumentation.',
      content: buildImplementationPlanContent([]),
    });
  }
}

async function getFounderNotes(channelId: string) {
  const founderMessages = await db
    .select()
    .from(agentMessages)
    .where(eq(agentMessages.channelId, channelId))
    .orderBy(desc(agentMessages.createdAt));

  return founderMessages
    .filter((message) => message.speakerType === 'founder')
    .slice(0, 6)
    .map((message) => message.content);
}

export async function ensureAgentChannel(input?: EnsureChannelInput) {
  const channel = await getOrCreateChannel(input);
  await seedChannelIfNeeded(channel.id);
  return channel;
}

export async function getAgentChannel(channelKey = DEFAULT_AGENT_CHANNEL_KEY) {
  const channel = await ensureAgentChannel({ key: channelKey });
  const [messages, artifacts] = await Promise.all([
    db
      .select()
      .from(agentMessages)
      .where(eq(agentMessages.channelId, channel.id))
      .orderBy(asc(agentMessages.createdAt)),
    db
      .select()
      .from(agentArtifacts)
      .where(eq(agentArtifacts.channelId, channel.id))
      .orderBy(desc(agentArtifacts.updatedAt)),
  ]);

  return {
    channel,
    roster: AGENT_ROSTER,
    messages,
    artifacts,
  };
}

export async function postAgentChannelMessage(
  channelKey: string,
  input: CreateChannelMessageInput
) {
  const trimmed = input.content.trim();
  if (!trimmed) {
    throw new AppError('Message content is required.', 400, 'MESSAGE_REQUIRED');
  }

  const channel = await ensureAgentChannel({ key: channelKey });
  const speakerType = input.speakerType ?? 'founder';
  const displayName =
    input.displayName?.trim() ||
    (speakerType === 'founder'
      ? 'Founder'
      : AGENT_ROSTER.find((agent) => agent.key === input.agentKey)?.displayName || 'Agent');
  const roleLabel =
    input.roleLabel?.trim() ||
    (speakerType === 'founder'
      ? 'Founder'
      : AGENT_ROSTER.find((agent) => agent.key === input.agentKey)?.roleLabel || 'Agent');

  await db.insert(agentMessages).values({
    channelId: channel.id,
    speakerType,
    agentKey: input.agentKey,
    displayName,
    roleLabel,
    content: trimmed,
  });

  if (speakerType === 'founder') {
    const now = Date.now();
    const replies = buildAutoReplies(trimmed);
    await db.insert(agentMessages).values(
      replies.map((reply, index) => ({
        channelId: channel.id,
        speakerType: 'agent',
        agentKey: reply.agentKey,
        displayName: reply.displayName,
        roleLabel: reply.roleLabel,
        content: reply.content,
        metadata: reply.metadata,
        createdAt: new Date(now + index * 1000),
      }))
    );
  }

  return getAgentChannel(channelKey);
}

export async function compileAgentArtifact(
  channelKey: string,
  userId: string,
  input?: CompileArtifactInput
) {
  const channel = await ensureAgentChannel({ key: channelKey });
  const artifactType = input?.artifactType ?? 'implementation_plan';
  const founderNotes = await getFounderNotes(channel.id);
  const telemetry = await getTelemetrySummary(userId, 14);

  const built =
    artifactType === 'research_digest'
      ? {
          title: 'Council Research Digest',
          summary: 'Updated synthesis of the current user, campus, and trust research.',
          content: buildResearchDigestContent(),
        }
      : {
          title: 'Council Implementation Plan',
          summary: 'Updated shipping plan built from the current council thread and telemetry.',
          content: buildImplementationPlanContent(founderNotes, telemetry),
        };

  const existing = await db
    .select()
    .from(agentArtifacts)
    .where(eq(agentArtifacts.channelId, channel.id));
  const existingArtifact = existing.find((artifact) => artifact.artifactType === artifactType);

  if (existingArtifact) {
    const [updated] = await db
      .update(agentArtifacts)
      .set({
        title: built.title,
        summary: built.summary,
        content: built.content,
        updatedAt: new Date(),
      })
      .where(eq(agentArtifacts.id, existingArtifact.id))
      .returning();

    return updated;
  }

  const [created] = await db
    .insert(agentArtifacts)
    .values({
      channelId: channel.id,
      artifactType,
      title: built.title,
      summary: built.summary,
      content: built.content,
    })
    .returning();

  return created;
}

export async function listAgentArtifacts(channelKey?: string) {
  if (channelKey) {
    const channel = await ensureAgentChannel({ key: channelKey });
    return db
      .select()
      .from(agentArtifacts)
      .where(eq(agentArtifacts.channelId, channel.id))
      .orderBy(desc(agentArtifacts.updatedAt));
  }

  return db.select().from(agentArtifacts).orderBy(desc(agentArtifacts.updatedAt));
}

export async function getAgentArtifact(artifactId: string) {
  const [artifact] = await db.select().from(agentArtifacts).where(eq(agentArtifacts.id, artifactId));
  if (!artifact) {
    throw new AppError('Agent artifact not found.', 404, 'ARTIFACT_NOT_FOUND');
  }
  return artifact;
}
