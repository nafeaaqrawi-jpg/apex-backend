/**
 * Simulates bot-to-bot activity: mutual matches + seed conversations.
 * Run: npm run db:simulate-activity
 */
import { db } from '../lib/db';
import { users, matches, messages } from './schema';
import { like, inArray, and } from 'drizzle-orm';
import { BOT_EMAIL_DOMAIN } from '../lib/bots';

const MESSAGE_POOL = [
  // Openers
  "okay your profile actually made me stop scrolling. that's rare.",
  "I have a question that's going to sound weird but I'm asking it anyway.",
  "hot take: your taste in [X] is better than most people I've met on here.",
  "tell me something about yourself that isn't on your profile.",
  "I keep coming back to something you wrote. can I ask about it?",
  // Conversational
  "that's a more interesting answer than I was expecting.",
  "okay I have a follow-up. bear with me.",
  "I feel like we're having the same conversation I've been trying to have for months.",
  "this is turning into a real conversation which I wasn't prepared for.",
  "you're making me reconsider a thing I thought I had figured out.",
  "strong take. I'd push back on one part but I want to hear more first.",
  "I feel like you'd have thoughts on something I've been thinking about.",
  "okay that's actually a really good point.",
  "I wasn't going to bring this up yet but here we are.",
  "that's the honest answer and I respect it.",
  // Work/ambition
  "what does your actual day look like right now?",
  "be honest — is it what you thought it would be?",
  "I think most people in your field get that wrong. do you agree?",
  "what's the version of your career that you actually want?",
  "the stuff that's worth doing is usually the stuff nobody's figured out how to explain yet.",
  "I think ambition is just care with a deadline. what do you think?",
  // City/location
  "what's keeping you where you are right now?",
  "I've been thinking seriously about [city]. do you know it?",
  "the city thing is real. I think where you are shapes you more than people admit.",
  "long distance is a test I'm not sure most people pass honestly.",
  // Personal
  "what are you actually working on right now, not for the resume version?",
  "what's something you're proud of that you'd never put on LinkedIn?",
  "I think the best version of someone comes out in how they talk about the thing they care about most.",
  "what would you do if you knew it would work?",
  "I think you're more interesting than your profile suggests. not an insult.",
  // Date planning
  "okay I want to actually meet. what does your week look like?",
  "coffee or dinner? I think the answer says something about you.",
  "I'm going to [place] this weekend. you should come.",
  "real question: what's the best first date you've ever been on?",
  "I'm suggesting we skip the drinks part and go straight to [activity].",
  // Playful
  "I'm going to be honest, I've been thinking about this conversation.",
  "I feel like we'd argue about something in the best possible way.",
  "okay one more question and then I'll stop interrogating you.",
  "I cannot believe we agree on that. this is statistically unlikely.",
  "you're going to make me rethink my whole opinion on this.",
];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

async function main() {
  console.log('Loading bot users...');
  const bots = await db
    .select({ id: users.id, firstName: users.firstName })
    .from(users)
    .where(like(users.email, `%${BOT_EMAIL_DOMAIN}`));

  if (bots.length < 4) {
    console.error('Need at least 4 bots. Run dev-seed and extra-bots-seed first.');
    process.exit(1);
  }

  console.log(`Found ${bots.length} bots. Creating activity...`);

  // Load existing bot-to-bot matches to avoid unique constraint violations
  const existingMatches = await db
    .select({ u1: matches.userId1, u2: matches.userId2 })
    .from(matches)
    .where(
      and(
        inArray(matches.userId1, bots.map((b) => b.id)),
        inArray(matches.userId2, bots.map((b) => b.id))
      )
    );

  const existingPairs = new Set(existingMatches.map((m) => `${m.u1}:${m.u2}`));

  const matchedPairs: Array<{ matchId: string; user1Id: string; user2Id: string }> = [];
  let matchedCount = 0;
  let likedCount = 0;

  // Shuffle bots for variety
  const shuffled = [...bots].sort(() => Math.random() - 0.5);

  for (let i = 0; i < shuffled.length - 1 && matchedCount + likedCount < 55; i++) {
    for (let j = i + 1; j < shuffled.length && matchedCount + likedCount < 55; j++) {
      const u1 = shuffled[i].id;
      const u2 = shuffled[j].id;
      const pairKey = `${u1}:${u2}`;
      const reversePairKey = `${u2}:${u1}`;

      if (existingPairs.has(pairKey) || existingPairs.has(reversePairKey)) continue;

      existingPairs.add(pairKey);

      const daysBack = Math.floor(Math.random() * 21) + 1; // 1–21 days ago
      const createdAt = daysAgo(daysBack);

      if (matchedCount < 35) {
        const [inserted] = await db
          .insert(matches)
          .values({
            userId1: u1,
            userId2: u2,
            status: 'MATCHED',
            createdAt,
            updatedAt: createdAt,
          })
          .returning({ id: matches.id });

        matchedPairs.push({ matchId: inserted.id, user1Id: u1, user2Id: u2 });
        matchedCount++;
      } else if (likedCount < 20) {
        await db.insert(matches).values({
          userId1: u1,
          userId2: u2,
          status: 'LIKED',
          createdAt,
          updatedAt: createdAt,
        });
        likedCount++;
      }
    }
  }

  console.log(`Created ${matchedCount} MATCHED pairs, ${likedCount} LIKED pairs.`);

  // Seed messages for matched pairs
  let messageCount = 0;
  for (const pair of matchedPairs) {
    const msgCount = Math.floor(Math.random() * 4) + 3; // 3–6 messages
    const baseTime = daysAgo(Math.floor(Math.random() * 14) + 1);
    let currentSender = Math.random() > 0.5 ? pair.user1Id : pair.user2Id;

    for (let m = 0; m < msgCount; m++) {
      const msgTime = new Date(
        baseTime.getTime() + m * 1000 * 60 * (Math.floor(Math.random() * 120) + 5)
      );
      await db.insert(messages).values({
        matchId: pair.matchId,
        senderUserId: currentSender,
        content: randomFrom(MESSAGE_POOL),
        read: true,
        createdAt: msgTime,
      });
      // Alternate sender each turn
      currentSender = currentSender === pair.user1Id ? pair.user2Id : pair.user1Id;
      messageCount++;
    }
  }

  console.log(`Seeded ${messageCount} messages across ${matchedPairs.length} conversations.`);
  console.log('Bot activity simulation complete.');
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
