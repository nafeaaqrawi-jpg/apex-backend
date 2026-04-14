/**
 * Resets all matches/messages for the dev account (test@apex.com).
 * Run: npm run db:reset-dev-connections
 */
import { db } from '../lib/db';
import { users, matches, messages } from './schema';
import { eq, or, inArray } from 'drizzle-orm';

async function main() {
  const [dev] = await db.select({ id: users.id }).from(users).where(eq(users.email, 'test@apex.com'));
  if (!dev) { console.error('Dev user not found'); process.exit(1); }

  const devMatches = await db.select({ id: matches.id }).from(matches)
    .where(or(eq(matches.userId1, dev.id), eq(matches.userId2, dev.id)));

  const matchIds = devMatches.map(m => m.id);
  console.log(`Found ${matchIds.length} connections to delete`);

  if (matchIds.length > 0) {
    await db.delete(messages).where(inArray(messages.matchId, matchIds));
    await db.delete(matches).where(inArray(matches.id, matchIds));
  }

  console.log('✓ Dev account connections reset.');
  process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
