import { db } from '../lib/db'
import { sql } from 'drizzle-orm'

async function main() {
  console.log('Adding strength/gym columns to User table...')
  // strengthStats: { bench?: number, squat?: number, deadlift?: number, pullUps?: number, pushUps?: number, videoUrl?: string }
  await db.execute(sql`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "strengthStats" jsonb`)
  // schoolEmailVerified: true if user signed up with a .edu email
  await db.execute(sql`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "schoolEmailVerified" boolean NOT NULL DEFAULT false`)
  console.log('Done.')
  process.exit(0)
}

main().catch(console.error)
