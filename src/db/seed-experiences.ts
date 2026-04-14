/**
 * Seeds Experience + Education rows for the dev account (test@apex.com)
 * Run: npx tsx src/db/seed-experiences.ts
 */
import { db } from '../lib/db';
import { users, experiences, education } from './schema';
import { eq } from 'drizzle-orm';

const DEV_EMAIL = 'test@apex.com';

async function main() {
  const [devUser] = await db.select({ id: users.id }).from(users).where(eq(users.email, DEV_EMAIL));
  if (!devUser) {
    console.error('Dev user not found. Run npm run db:dev-seed first.');
    process.exit(1);
  }

  const userId = devUser.id;

  // Clear existing
  await db.delete(experiences).where(eq(experiences.userId, userId));
  await db.delete(education).where(eq(education.userId, userId));

  // Experiences
  await db.insert(experiences).values([
    {
      userId,
      company: 'Goldman Sachs',
      role: 'Analyst, Hybrid Capital',
      employmentType: 'Full-time',
      startDate: '2024-08',
      endDate: null,
      isCurrent: true,
      location: 'New York, United States · On-site',
      description: 'Structured equity, opportunistic credit, and special situations.',
      displayOrder: 0,
    },
    {
      userId,
      company: 'Goldman Sachs',
      role: 'Summer Analyst',
      employmentType: 'Internship',
      startDate: '2023-06',
      endDate: '2023-08',
      isCurrent: false,
      location: 'New York, United States',
      description: null,
      displayOrder: 1,
    },
  ]);

  // Education
  await db.insert(education).values([
    {
      userId,
      institution: 'University of Michigan - Stephen M. Ross School of Business',
      degree: 'Bachelor of Business Administration - BBA',
      fieldOfStudy: 'Finance',
      startYear: 2020,
      endYear: 2024,
      activities: 'Global Investments Committee · Michigan Chinese Business Club · International Investment Fund · Minor in Political Science',
      displayOrder: 0,
    },
  ]);

  console.log(`✓ Seeded experience + education for dev user (${userId})`);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
