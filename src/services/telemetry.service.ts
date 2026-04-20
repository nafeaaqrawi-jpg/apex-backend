import { and, desc, eq, gte } from 'drizzle-orm';
import { db } from '../lib/db';
import { telemetryEvents } from '../db/schema';

export interface RecordTelemetryInput {
  eventType: string;
  route?: string;
  entityType?: string;
  entityId?: string;
  dwellMs?: number;
  metadata?: Record<string, unknown>;
}

export interface TelemetrySummary {
  windowDays: number;
  totalEvents: number;
  pageViews: number;
  topRoutes: Array<{ route: string; count: number }>;
  topEventTypes: Array<{ eventType: string; count: number }>;
  lastActiveAt: string | null;
}

export async function recordTelemetryEvent(userId: string, input: RecordTelemetryInput) {
  const [event] = await db
    .insert(telemetryEvents)
    .values({
      userId,
      eventType: input.eventType,
      route: input.route,
      entityType: input.entityType,
      entityId: input.entityId,
      dwellMs: input.dwellMs,
      metadata: input.metadata,
    })
    .returning();

  return event;
}

export async function getTelemetrySummary(userId: string, windowDays = 14): Promise<TelemetrySummary> {
  const since = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000);
  const events = await db
    .select()
    .from(telemetryEvents)
    .where(and(eq(telemetryEvents.userId, userId), gte(telemetryEvents.createdAt, since)))
    .orderBy(desc(telemetryEvents.createdAt));

  const routeCounts = new Map<string, number>();
  const eventTypeCounts = new Map<string, number>();

  for (const event of events) {
    if (event.route) {
      routeCounts.set(event.route, (routeCounts.get(event.route) ?? 0) + 1);
    }
    eventTypeCounts.set(event.eventType, (eventTypeCounts.get(event.eventType) ?? 0) + 1);
  }

  return {
    windowDays,
    totalEvents: events.length,
    pageViews: events.filter((event) => event.eventType === 'page_view').length,
    topRoutes: [...routeCounts.entries()]
      .map(([route, count]) => ({ route, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),
    topEventTypes: [...eventTypeCounts.entries()]
      .map(([eventType, count]) => ({ eventType, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),
    lastActiveAt: events[0]?.createdAt?.toISOString() ?? null,
  };
}
