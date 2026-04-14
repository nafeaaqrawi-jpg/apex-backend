/**
 * Updates primary bots with extended profile fields and photos on prompts.
 * Run: npm run db:seed-bot-extended
 */
import { db } from '../lib/db';
import { users } from './schema';
import { eq } from 'drizzle-orm';
import { BOT_EMAIL_DOMAIN } from '../lib/bots';

const botExtensions = [
  {
    email: `sofia.chen${BOT_EMAIL_DOMAIN}`,
    religion: 'Spiritual', ethnicity: 'Asian', height: "5'5\"", drinking: 'Socially', smoking: 'Never', wantsKids: 'Open to kids', politicalViews: 'Liberal', birthCity: 'Palo Alto, CA',
    prompts: [
      { question: "My thesis in one sentence:", answer: "Access to care is a design problem, not a resource problem.", photoUrl: 'https://randomuser.me/api/portraits/women/44.jpg' },
      { question: "I'll always say yes to:", answer: "A hike with no phone, late-night ramen, or a question I haven't thought about before." },
      { question: "What people get wrong about me:", answer: "That being pre-med means I talk about medicine constantly. I'd rather talk about almost anything else at dinner.", photoUrl: 'https://randomuser.me/api/portraits/women/44.jpg' },
    ],
  },
  {
    email: `emma.walsh${BOT_EMAIL_DOMAIN}`,
    religion: 'Agnostic', ethnicity: 'White', height: "5'7\"", drinking: 'Socially', smoking: 'Never', wantsKids: 'Want kids', politicalViews: 'Liberal', birthCity: 'Boston, MA',
    prompts: [
      { question: "Unpopular opinion in my field:", answer: "Most economic models are just sophisticated ways to justify decisions already made for political reasons.", photoUrl: 'https://randomuser.me/api/portraits/women/68.jpg' },
      { question: "The conversation I keep having:", answer: "Whether it's possible to fix institutions from the inside or if you always end up being absorbed by them." },
      { question: "I'm unreasonably good at:", answer: "Reading a room and knowing exactly when the meeting should have ended twenty minutes ago.", photoUrl: 'https://randomuser.me/api/portraits/women/68.jpg' },
    ],
  },
  {
    email: `priya.sharma${BOT_EMAIL_DOMAIN}`,
    religion: 'Hindu', ethnicity: 'Asian', height: "5'4\"", drinking: 'Rarely', smoking: 'Never', wantsKids: 'Open to kids', politicalViews: 'Liberal', birthCity: 'Mumbai, India',
    prompts: [
      { question: "What I'm building right now:", answer: "Something at the intersection of language models and trust — can't say more but it keeps me up at night in a good way.", photoUrl: 'https://randomuser.me/api/portraits/women/26.jpg' },
      { question: "The thing I'm most proud of that I never talk about:", answer: "A research paper I wrote at 19 that two labs have quietly cited since. Nobody knows I wrote it." },
      { question: "Two truths and a lie about my resume:", answer: "I shipped code to production at 16. I once fixed a critical bug during a job interview. I've never pulled an all-nighter.", photoUrl: 'https://randomuser.me/api/portraits/women/26.jpg' },
    ],
  },
  {
    email: `olivia.bennett${BOT_EMAIL_DOMAIN}`,
    religion: 'Agnostic', ethnicity: 'White', height: "5'6\"", drinking: 'Socially', smoking: 'Never', wantsKids: 'Want kids', politicalViews: 'Liberal', birthCity: 'New Haven, CT',
    prompts: [
      { question: "Unpopular opinion in my field:", answer: "Most lawyers argue about the law when they should be arguing about what the law is for.", photoUrl: 'https://randomuser.me/api/portraits/women/32.jpg' },
      { question: "Green flag I look for immediately:", answer: "Someone who can hold a strong opinion and update it when shown good evidence. Extremely rare." },
      { question: "The last thing that genuinely surprised me:", answer: "That the best constitutional argument I've ever heard came from a college sophomore in a seminar I audited.", photoUrl: 'https://randomuser.me/api/portraits/women/32.jpg' },
    ],
  },
  {
    email: `maya.rodriguez${BOT_EMAIL_DOMAIN}`,
    religion: 'Spiritual', ethnicity: 'Hispanic/Latino', height: "5'5\"", drinking: 'Socially', smoking: 'Never', wantsKids: 'Open to kids', politicalViews: 'Liberal', birthCity: 'Miami, FL',
    prompts: [
      { question: "My thesis in one sentence:", answer: "People aren't irrational — they're optimizing for things economists refuse to measure.", photoUrl: 'https://randomuser.me/api/portraits/women/57.jpg' },
      { question: "I talk about this way too much:", answer: "The gap between what people say they want and what their behavior reveals they actually want. It's everywhere once you see it." },
      { question: "I need someone who understands that:", answer: "Analyzing something doesn't mean I don't feel it. I just do both at the same time.", photoUrl: 'https://randomuser.me/api/portraits/women/57.jpg' },
    ],
  },
  {
    email: `james.park${BOT_EMAIL_DOMAIN}`,
    religion: 'Agnostic', ethnicity: 'Asian', height: "5'10\"", drinking: 'Rarely', smoking: 'Never', wantsKids: 'Open to kids', politicalViews: 'Moderate', birthCity: 'Seoul, South Korea',
    prompts: [
      { question: "The thing I'm most proud of that I never talk about:", answer: "A proof I found in my second year that simplified something people had been working around for a decade. Still checking it.", photoUrl: 'https://randomuser.me/api/portraits/men/32.jpg' },
      { question: "My 5-year plan, honestly:", answer: "Build enough of a financial cushion to work on pure math problems nobody is paying for yet." },
      { question: "I'm unreasonably good at:", answer: "Explaining why something elegant is also correct, and why something ugly is probably wrong even before finding the error.", photoUrl: 'https://randomuser.me/api/portraits/men/32.jpg' },
    ],
  },
  {
    email: `lucas.chen${BOT_EMAIL_DOMAIN}`,
    religion: 'Agnostic', ethnicity: 'Asian', height: "6'0\"", drinking: 'Socially', smoking: 'Never', wantsKids: 'Want kids', politicalViews: 'Moderate', birthCity: 'Chicago, IL',
    prompts: [
      { question: "The city I'm seriously considering moving to:", answer: "Chicago's already locked in. After that — Tokyo or Singapore depending on where the interesting capital is flowing.", photoUrl: 'https://randomuser.me/api/portraits/men/22.jpg' },
      { question: "The biggest risk I've taken:", answer: "Turning down a return offer to go back to a startup that ended up not working. Worth it. Would do it again." },
      { question: "Green flag I look for immediately:", answer: "Someone with a plan and the self-awareness to know the plan will change.", photoUrl: 'https://randomuser.me/api/portraits/men/22.jpg' },
    ],
  },
  {
    email: `noah.williams${BOT_EMAIL_DOMAIN}`,
    religion: 'Christian', ethnicity: 'White', height: "6'1\"", drinking: 'Rarely', smoking: 'Never', wantsKids: 'Want kids', politicalViews: 'Moderate', birthCity: 'Denver, CO',
    prompts: [
      { question: "My version of a perfect Saturday:", answer: "Early trail run before anyone else is up, a long breakfast, then building something in the afternoon — code, furniture, doesn't matter.", photoUrl: 'https://randomuser.me/api/portraits/men/41.jpg' },
      { question: "What I'm building right now:", answer: "A battery thermal model that I'm 60% sure is going to change how we think about range degradation. Ask me in six months." },
      { question: "I'll always say yes to:", answer: "Anything that requires a headlamp or a sleeping bag.", photoUrl: 'https://randomuser.me/api/portraits/men/41.jpg' },
    ],
  },
  {
    email: `aiden.foster${BOT_EMAIL_DOMAIN}`,
    religion: 'Agnostic', ethnicity: 'White', height: "5'11\"", drinking: 'Socially', smoking: 'Never', wantsKids: 'Open to kids', politicalViews: 'Liberal', birthCity: 'Chicago, IL',
    prompts: [
      { question: "The conversation I keep having:", answer: "Whether winning an argument and changing someone's mind are actually the same thing. I've decided they're not.", photoUrl: 'https://randomuser.me/api/portraits/men/55.jpg' },
      { question: "Unpopular opinion in my field:", answer: "Zealous advocacy is how the system is supposed to work. The discomfort people feel about it is the point." },
      { question: "I need someone who understands that:", answer: "I argue to think, not because I'm trying to win. There's a difference and it matters.", photoUrl: 'https://randomuser.me/api/portraits/men/55.jpg' },
    ],
  },
  {
    email: `ethan.brooks${BOT_EMAIL_DOMAIN}`,
    religion: 'Agnostic', ethnicity: 'White', height: "6'0\"", drinking: 'Socially', smoking: 'Never', wantsKids: 'Open to kids', politicalViews: 'Liberal', birthCity: 'Washington, DC',
    prompts: [
      { question: "The most underrated city to build a life in:", answer: "Lisbon if you're building something. Warsaw if you're watching history happen. Beirut if you're very brave.", photoUrl: 'https://randomuser.me/api/portraits/men/60.jpg' },
      { question: "What people get wrong about me:", answer: "That studying geopolitics makes you cynical. It actually makes you appreciate exactly how contingent everything is." },
      { question: "The part of my career I don't post about:", answer: "The conversations I've had with people who have genuinely changed the trajectory of a country. They're usually very quiet about it.", photoUrl: 'https://randomuser.me/api/portraits/men/60.jpg' },
    ],
  },
];

async function main() {
  console.log('Updating bots with extended fields and photo prompts...');
  for (const bot of botExtensions) {
    const { email, prompts, ...fields } = bot;
    await db.update(users)
      .set({ ...fields, prompts: prompts as unknown as typeof users.$inferInsert['prompts'] })
      .where(eq(users.email, email));
    console.log(`  + ${email}`);
  }
  console.log('\nDone.');
  process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
