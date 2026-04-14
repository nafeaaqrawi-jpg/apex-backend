import { db } from '../lib/db'
import { sql } from 'drizzle-orm'

async function main() {
  console.log('Creating FraudAlert table for Romance Scam Prevention Act compliance...')
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "FraudAlert" (
      "id" text PRIMARY KEY,
      "recipientUserId" text NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
      "bannedUserId" text NOT NULL,
      "bannedAt" timestamp NOT NULL,
      "notifiedAt" timestamp NOT NULL DEFAULT now(),
      "banReason" text NOT NULL DEFAULT 'FRAUD',
      "acknowledged" boolean NOT NULL DEFAULT false
    )
  `)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "fraud_alert_recipient_idx" ON "FraudAlert"("recipientUserId")`)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "fraud_alert_banned_idx" ON "FraudAlert"("bannedUserId")`)
  console.log('Done.')
  process.exit(0)
}

main().catch(console.error)
