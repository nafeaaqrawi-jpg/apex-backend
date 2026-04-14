/**
 * Master seed — runs all seed scripts in the correct order.
 * Run: npm run db:full-seed
 *
 * Order:
 *   1. seed.ts            — colleges
 *   2. dev-seed.ts        — dev user + 10 core bots + conversations
 *   3. extra-bots-seed.ts — 90 extra bots for discover feed
 *   4. seed-bot-experiences.ts  — work/education history for bots
 *   5. seed-bot-prompts.ts      — conversation prompts for bots
 *   6. simulate-bot-activity.ts — algorithm signals (views, likes, etc.)
 */

import { execSync } from 'child_process';
import path from 'path';

const scripts = [
  'src/db/seed.ts',
  'src/db/dev-seed.ts',
  'src/db/extra-bots-seed.ts',
  'src/db/seed-bot-experiences.ts',
  'src/db/seed-bot-prompts.ts',
  'src/db/simulate-bot-activity.ts',
];

const root = path.resolve(import.meta.dirname, '../../');

for (const script of scripts) {
  const label = path.basename(script, '.ts');
  console.log(`\n${'─'.repeat(50)}`);
  console.log(`▶  Running ${label}`);
  console.log('─'.repeat(50));
  try {
    execSync(`npx tsx ${script}`, { stdio: 'inherit', cwd: root });
    console.log(`✅ ${label} complete`);
  } catch {
    console.error(`❌ ${label} failed — stopping.`);
    process.exit(1);
  }
}

console.log('\n🎉 Full seed complete! App is ready for demo.\n');
process.exit(0);
