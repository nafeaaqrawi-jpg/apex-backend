/**
 * Seeds Apex prompts for the dev account (test@apex.com).
 * Run: npm run db:seed-dev-prompts
 */
import { db } from '../lib/db';
import { users } from './schema';
import { eq } from 'drizzle-orm';

async function main() {
  const prompts = [
    {
      question: 'My 5-year plan, honestly:',
      answer: 'Build something that matters in finance, get to a city worth being in, and stop optimizing for the resume version of my life.',
      photoUrl: 'https://randomuser.me/api/portraits/men/75.jpg',
    },
    {
      question: 'The thing I\'m most proud of that I never talk about:',
      answer: 'Structured a deal my second month at GS that three seniors said was too complex. It closed.',
      photoUrl: 'https://randomuser.me/api/portraits/men/76.jpg',
    },
    {
      question: 'Unpopular opinion in my field:',
      answer: 'Most analysts are paid to confirm decisions already made. Real edge is the person willing to say the deal doesn\'t work.',
      photoUrl: 'https://randomuser.me/api/portraits/men/77.jpg',
    },
    {
      question: 'I need someone who understands that:',
      answer: 'Ambition isn\'t a personality flaw. I want someone who has a plan and isn\'t apologetic about it.',
    },
    {
      question: 'Green flag I look for immediately:',
      answer: 'You have a thing. Not a hobby — a real obsession you could talk about for two hours without noticing.',
    },
  ];

  const result = await db
    .update(users)
    .set({ prompts: prompts as unknown as typeof users.$inferInsert['prompts'] })
    .where(eq(users.email, 'test@apex.com'))
    .returning({ id: users.id, email: users.email });

  if (result.length === 0) {
    console.error('Dev user not found. Run npm run db:dev-seed first.');
    process.exit(1);
  }

  console.log(`✓ Updated dev account (${result[0].email}) with 5 Apex prompts`);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
