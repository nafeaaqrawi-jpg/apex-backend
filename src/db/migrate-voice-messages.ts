import { db } from '../lib/db'
import { sql } from 'drizzle-orm'

async function main() {
  console.log('Adding voice message columns to Message table...')
  await db.execute(sql`ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "messageType" text NOT NULL DEFAULT 'text'`)
  await db.execute(sql`ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "mediaUrl" text`)
  console.log('Done.')
  process.exit(0)
}

main().catch(console.error)
