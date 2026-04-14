/**
 * Updates dev account (test@apex.com) with full profile + lifestyle fields.
 * Run: npm run db:update-dev
 */
import { db } from '../lib/db';
import { users } from './schema';
import { eq } from 'drizzle-orm';

async function main() {
  const result = await db
    .update(users)
    .set({
      headline: 'Analyst at Goldman Sachs · NYU Stern',
      currentRole: 'Investment Banking Analyst',
      company: 'Goldman Sachs',
      locationLabel: 'New York, NY',
      workLocation: 'New York, NY',
      futureLocation: 'San Francisco, CA',
      bio: "Two years deep in the machine. Starting to ask bigger questions. Looking for someone who has a plan and isn't apologetic about it.",
      major: 'Finance & Economics',
      gpa: 3.87,
      relationshipGoal: 'LONGTERM',
      interests: ['Finance', 'Technology', 'Travel', 'Tennis', 'Film', 'Architecture'],
      religion: 'Secular / Not religious',
      sexuality: 'Straight',
      ethnicity: 'Middle Eastern',
      birthCity: 'Dubai, UAE',
      height: '6\'1"',
      drinking: 'Socially',
      smoking: 'Never',
      cannabis: 'Never',
      wantsKids: 'Open to kids',
      politicalViews: 'Moderate',
      isPremium: true,
      premiumSince: new Date('2026-01-15'),
    })
    .where(eq(users.email, 'test@apex.com'))
    .returning({ id: users.id, email: users.email });

  if (result.length === 0) {
    console.error('Dev user not found. Run npm run db:dev-seed first.');
    process.exit(1);
  }

  console.log(`✓ Dev account (${result[0].email}) updated with full profile.`);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
