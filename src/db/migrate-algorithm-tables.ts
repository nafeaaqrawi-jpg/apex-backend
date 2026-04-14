/**
 * Adds UserPass, UserReport, and AlgorithmSignal tables.
 * Run: npm run db:migrate-algo
 *
 * Each statement is executed separately because Neon HTTP transport does not
 * support multiple commands in a single prepared statement.
 */
import { db } from '../lib/db';
import { sql } from 'drizzle-orm';

async function main() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "UserPass" (
      "id" text PRIMARY KEY,
      "userId" text NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
      "passedUserId" text NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
      "createdAt" timestamp NOT NULL DEFAULT now(),
      UNIQUE("userId", "passedUserId")
    )
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "pass_user_idx" ON "UserPass"("userId")
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "UserReport" (
      "id" text PRIMARY KEY,
      "reporterId" text NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
      "reportedUserId" text NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
      "reason" text NOT NULL,
      "notes" text,
      "resolved" boolean NOT NULL DEFAULT false,
      "createdAt" timestamp NOT NULL DEFAULT now()
    )
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "report_reporter_idx" ON "UserReport"("reporterId")
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "report_reported_idx" ON "UserReport"("reportedUserId")
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "AlgorithmSignal" (
      "userId" text PRIMARY KEY REFERENCES "User"("id") ON DELETE CASCADE,
      "profileViewCount" integer NOT NULL DEFAULT 0,
      "profileViewedCount" integer NOT NULL DEFAULT 0,
      "likesSentCount" integer NOT NULL DEFAULT 0,
      "likesReceivedCount" integer NOT NULL DEFAULT 0,
      "matchCount" integer NOT NULL DEFAULT 0,
      "avgMessagesPerMatch" double precision NOT NULL DEFAULT 0,
      "weMetCount" integer NOT NULL DEFAULT 0,
      "reportReceivedCount" integer NOT NULL DEFAULT 0,
      "passReceivedCount" integer NOT NULL DEFAULT 0,
      "fastUnmatchCount" integer NOT NULL DEFAULT 0,
      "lastActiveAt" timestamp,
      "updatedAt" timestamp NOT NULL DEFAULT now()
    )
  `);

  console.log('Algorithm tables migrated.');
  process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
