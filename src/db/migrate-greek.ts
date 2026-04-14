import { db } from '../lib/db'
import { sql } from 'drizzle-orm'

async function main() {
  console.log('Adding Greek life columns to User table...')
  await db.execute(sql`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "greekOrganization" text`)
  await db.execute(sql`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "greekOrganizationType" text`)
  console.log('Done.')
  process.exit(0)
}

main().catch(console.error)
