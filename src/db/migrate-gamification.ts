import { db } from '../lib/db'
import { sql } from 'drizzle-orm'

async function main() {
  console.log('Creating UserGameState table...')
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "UserGameState" (
      "userId" text PRIMARY KEY REFERENCES "User"("id") ON DELETE CASCADE,
      "totalXP" integer NOT NULL DEFAULT 0,
      "level" integer NOT NULL DEFAULT 1,
      "currentStreak" integer NOT NULL DEFAULT 0,
      "longestStreak" integer NOT NULL DEFAULT 0,
      "lastActiveDate" text,
      "achievements" jsonb NOT NULL DEFAULT '[]',
      "updatedAt" timestamp NOT NULL DEFAULT now()
    )
  `)
  console.log('Done.')
  process.exit(0)
}

main().catch(console.error)
