/**
 * Dev seed — creates a test account + 10 bot profiles + pre-existing matches + seed messages.
 * Run: npm run db:dev-seed
 * Login: test@apex.com / TestApex1
 */
import { eq, inArray, or, and } from 'drizzle-orm';
import { db } from '../lib/db';
import { colleges, users, matches, messages, profileViews } from './schema';
import { hashPassword } from '../utils/hash';
import { BOT_EMAIL_DOMAIN } from '../lib/bots';

// ── Dev account ───────────────────────────────────────────────────────────────
const DEV_EMAIL = 'test@apex.com';
const DEV_PASSWORD = 'TestApex1';

// ── Fresh unboarded test account ──────────────────────────────────────────────
const FRESH_EMAIL = 'fresh@apex.com';
const FRESH_PASSWORD = 'FreshApex1';

// ── Bots that send connection REQUESTS to dev (not MATCHED) ───────────────────
const REQUEST_BOT_EMAILS = new Set([
  `sofia.chen@botapex.internal`,
  `emma.walsh@botapex.internal`,
  `priya.sharma@botapex.internal`,
]);

// ── Bot profiles ──────────────────────────────────────────────────────────────
interface BotProfile {
  email: string; firstName: string; lastName: string; age: number;
  gender: 'MAN' | 'WOMAN'; bio: string; major: string; gpa: number;
  sat: number; act: number; headline: string; currentRole: string;
  company: string; locationLabel: string; workLocation: string;
  futureLocation: string; interests: string[]; values: string[];
  relationshipGoal: 'MARRIAGE' | 'LONGTERM' | 'CASUAL' | 'EXPLORING';
  collegeEmailDomain: string; profilePhotoUrl: string; dateOfBirth: string;
  prompts?: { question: string; answer: string }[];
  height?: string; drinking?: string; wantsKids?: string;
  greekOrganization?: string; greekOrganizationType?: string;
}
const botData: BotProfile[] = [
  {
    email: `sofia.chen${BOT_EMAIL_DOMAIN}`,
    firstName: 'Sofia',
    lastName: 'Chen',
    age: 21,
    gender: 'WOMAN' as const,
    bio: 'Pre-med at Stanford with a soft spot for late-night studying and even later-night conversations. Passionate about global health equity, matcha lattes, and finding people who actually read the books they recommend.',
    major: 'Human Biology',
    gpa: 3.92,
    sat: 1580,
    act: 35,
    headline: 'Stanford pre-med who actually plans ahead.',
    currentRole: 'Incoming research associate',
    company: 'Stanford Medicine',
    locationLabel: 'Palo Alto, CA',
    workLocation: 'San Francisco, CA',
    futureLocation: 'San Francisco, CA',
    interests: ['Yoga', 'Travel', 'Reading', 'Coffee', 'Volunteering'],
    values: ['Integrity', 'Compassion', 'Ambition', 'Curiosity'],
    relationshipGoal: 'LONGTERM' as const,
    collegeEmailDomain: 'stanford.edu',
    profilePhotoUrl: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=500&fit=crop&crop=face',
    dateOfBirth: '2003-03-22',
    height: "5'5\"",
    drinking: 'Socially',
    wantsKids: 'Someday',
    prompts: [
      { question: 'My thesis in one sentence:', answer: 'Global health outcomes are determined by policy, not medicine.' },
      { question: 'The city I\'m seriously considering moving to:', answer: "San Francisco — and I've already started mentally mapping my neighborhood." },
      { question: 'Unpopular opinion in my field:', answer: 'Med school optimizes for endurance, not intelligence.' },
    ],
  },
  {
    email: `emma.walsh${BOT_EMAIL_DOMAIN}`,
    firstName: 'Emma',
    lastName: 'Walsh',
    age: 22,
    gender: 'WOMAN' as const,
    bio: "Economics at Harvard, aspiring policy wonk. I debate macroeconomics for fun and somehow still have friends. Looking for someone who has opinions and isn't afraid to defend them — respectfully.",
    major: 'Economics',
    gpa: 3.85,
    sat: 1540,
    act: 34,
    headline: 'Economics, policy, and a real plan after graduation.',
    currentRole: 'Policy intern',
    company: 'Brookings',
    locationLabel: 'Cambridge, MA',
    workLocation: 'Washington, DC',
    futureLocation: 'Washington, DC',
    interests: ['Politics', 'Economics', 'Running', 'Wine', 'Museums'],
    values: ['Intellectual Honesty', 'Ambition', 'Humor', 'Loyalty'],
    relationshipGoal: 'LONGTERM' as const,
    collegeEmailDomain: 'harvard.edu',
    profilePhotoUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=500&fit=crop&crop=face',
    dateOfBirth: '2002-11-08',
    greekOrganization: 'Alpha Phi',
    greekOrganizationType: 'SORORITY',
    height: "5'7\"",
    drinking: 'Socially',
    wantsKids: 'Yes',
    prompts: [
      { question: 'Unpopular opinion in my field:', answer: "Economists overestimate their own influence. Markets don't care about our models." },
      { question: 'The city I\'m seriously considering moving to:', answer: 'DC for two years, then New York. The plan is set.' },
      { question: 'I\'ll always say yes to:', answer: 'Any dinner with good wine and people who argue about ideas instead of posting about them.' },
    ],
  },
  {
    email: `priya.sharma${BOT_EMAIL_DOMAIN}`,
    firstName: 'Priya',
    lastName: 'Sharma',
    age: 21,
    gender: 'WOMAN' as const,
    bio: 'CS + Math double major at MIT. I build things, break things, and occasionally write poetry at 2am. Prefer depth over breadth — in code and in people.',
    major: 'Computer Science & Mathematics',
    gpa: 3.95,
    sat: 1580,
    act: 36,
    headline: 'Building serious things now, shipping bigger things next.',
    currentRole: 'ML engineer intern',
    company: 'OpenAI',
    locationLabel: 'Cambridge, MA',
    workLocation: 'San Francisco, CA',
    futureLocation: 'San Francisco, CA',
    interests: ['Coding', 'Mathematics', 'Poetry', 'Hiking', 'Startups'],
    values: ['Curiosity', 'Integrity', 'Creativity', 'Ambition'],
    relationshipGoal: 'LONGTERM' as const,
    collegeEmailDomain: 'mit.edu',
    profilePhotoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop&crop=face',
    dateOfBirth: '2003-07-14',
    height: "5'4\"",
    drinking: 'Rarely',
    wantsKids: 'Open to it',
    prompts: [
      { question: 'My thesis in one sentence:', answer: 'Intelligence is substrate-agnostic, which means everything we thought was special about humans is about to get interesting.' },
      { question: 'What I\'m building right now:', answer: 'A tool for making ML interpretability actually usable. Nobody has cracked this yet.' },
      { question: 'Unpopular opinion in my field:', answer: 'Most AI research is actually engineering. Real breakthroughs come from math.' },
    ],
  },
  {
    email: `olivia.bennett${BOT_EMAIL_DOMAIN}`,
    firstName: 'Olivia',
    lastName: 'Bennett',
    age: 22,
    gender: 'WOMAN' as const,
    bio: "Political science at Yale with a constitutional law obsession. I'm the person who reads the footnotes. Seeking someone as comfortable at a dinner party as a dive bar.",
    major: 'Political Science',
    gpa: 3.72,
    sat: 1510,
    act: 33,
    headline: 'Policy, law, and cities with actual cultural life.',
    currentRole: 'Legal policy intern',
    company: 'ACLU',
    locationLabel: 'New Haven, CT',
    workLocation: 'New York, NY',
    futureLocation: 'Washington, DC',
    interests: ['Law', 'Literature', 'Tennis', 'Travel', 'Film'],
    values: ['Intelligence', 'Authenticity', 'Humor', 'Kindness'],
    relationshipGoal: 'LONGTERM' as const,
    collegeEmailDomain: 'yale.edu',
    profilePhotoUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=500&fit=crop&crop=face',
    dateOfBirth: '2002-09-03',
    height: "5'6\"",
    drinking: 'Socially',
    wantsKids: 'Yes',
    prompts: [
      { question: 'Unpopular opinion in my field:', answer: 'Constitutional originalism is intellectually coherent — I just disagree with its conclusions.' },
      { question: 'The book that actually changed how I think:', answer: 'The Federalist Papers. Not assigned — I read them for fun at 17 and haven\'t recovered.' },
      { question: 'I\'ll always say yes to:', answer: 'A constitutional debate over dinner. No topic off-limits if both parties are arguing in good faith.' },
    ],
  },
  {
    email: `maya.rodriguez${BOT_EMAIL_DOMAIN}`,
    firstName: 'Maya',
    lastName: 'Rodriguez',
    age: 23,
    gender: 'WOMAN' as const,
    bio: 'Psychology PhD track at Columbia studying decision-making and behavioral economics. I will analyze your choices over dinner — affectionately. Love rooftop bars and people with strong opinions about something.',
    major: 'Psychology',
    gpa: 3.78,
    sat: 1490,
    act: 32,
    headline: 'Columbia psych with a strong read on people and cities.',
    currentRole: 'Behavioral science researcher',
    company: 'Columbia Lab',
    locationLabel: 'New York, NY',
    workLocation: 'New York, NY',
    futureLocation: 'Boston, MA',
    interests: ['Psychology', 'Art', 'Yoga', 'Cooking', 'Research'],
    values: ['Empathy', 'Growth', 'Humor', 'Curiosity'],
    relationshipGoal: 'LONGTERM' as const,
    collegeEmailDomain: 'columbia.edu',
    profilePhotoUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=500&fit=crop&crop=face',
    dateOfBirth: '2001-12-19',
    height: "5'5\"",
    drinking: 'Socially',
    wantsKids: 'Someday',
    prompts: [
      { question: 'My thesis in one sentence:', answer: "People don't make rational decisions — they make emotional decisions and rationalize them. My job is to understand the gap." },
      { question: 'What people get wrong about me:', answer: "That reading people is surveillance. It's actually just care — I pay attention because I genuinely want to understand." },
      { question: 'Unpopular opinion in my field:', answer: 'Most therapy is just good conversation with structure. The structure matters, but so does the conversation.' },
    ],
  },
  {
    email: `james.park${BOT_EMAIL_DOMAIN}`,
    firstName: 'James',
    lastName: 'Park',
    age: 22,
    gender: 'MAN' as const,
    bio: 'Math PhD student at Princeton. I find patterns everywhere — including here. Passionate about cryptography, jazz piano, and convincing people that pure math is actually beautiful.',
    major: 'Mathematics',
    gpa: 3.92,
    sat: 1570,
    act: 35,
    headline: 'Princeton math, New York trajectory, no wasted conversations.',
    currentRole: 'Quant research intern',
    company: 'Jane Street',
    locationLabel: 'Princeton, NJ',
    workLocation: 'New York, NY',
    futureLocation: 'New York, NY',
    interests: ['Mathematics', 'Jazz', 'Chess', 'Cycling', 'Cooking'],
    values: ['Curiosity', 'Ambition', 'Integrity', 'Humor'],
    relationshipGoal: 'LONGTERM' as const,
    collegeEmailDomain: 'princeton.edu',
    profilePhotoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop&crop=face',
    dateOfBirth: '2002-04-07',
    height: "5'11\"",
    drinking: 'Rarely',
    wantsKids: 'Yes',
    prompts: [
      { question: 'My thesis in one sentence:', answer: 'Algebraic topology proves that coffee cups and donuts are the same object, and that should bother you more than it does.' },
      { question: 'Unpopular opinion in my field:', answer: 'Applied math is just physics with better PR. Pure math is where the real ideas live.' },
      { question: 'I\'m unreasonably good at:', answer: 'Jazz piano and losing at chess to people who shouldn\'t beat me. Both happen more than I\'d like.' },
    ],
  },
  {
    email: `lucas.chen${BOT_EMAIL_DOMAIN}`,
    firstName: 'Lucas',
    lastName: 'Chen',
    age: 23,
    gender: 'MAN' as const,
    bio: "Finance at Fuqua (Duke). I trade ideas before I trade stocks. Weekend hiker, terrible golfer, occasional cook. Looking for someone who has goals and doesn't apologize for them.",
    major: 'Finance',
    gpa: 3.8,
    sat: 1500,
    act: 33,
    headline: 'Duke finance with Chicago already on the calendar.',
    currentRole: 'Incoming banking analyst',
    company: 'Goldman Sachs',
    locationLabel: 'Durham, NC',
    workLocation: 'Chicago, IL',
    futureLocation: 'Chicago, IL',
    interests: ['Finance', 'Hiking', 'Golf', 'Cooking', 'Travel'],
    values: ['Ambition', 'Loyalty', 'Humor', 'Authenticity'],
    relationshipGoal: 'LONGTERM' as const,
    collegeEmailDomain: 'duke.edu',
    profilePhotoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=500&fit=crop&crop=face',
    dateOfBirth: '2001-08-23',
    height: "6'0\"",
    drinking: 'Socially',
    wantsKids: 'Yes',
    prompts: [
      { question: 'My 5-year plan, honestly:', answer: 'Two years at Goldman, then either business school or a Series A startup. The variable is whether I find the right co-founder first.' },
      { question: 'Unpopular opinion in my field:', answer: 'Most people going into banking are optimizing for prestige, not learning. I\'m trying to actually learn.' },
      { question: 'The most underrated city to build a life in:', answer: 'Chicago. No contest. Lower cost, great culture, serious people. NYC gets all the credit.' },
    ],
  },
  {
    email: `noah.williams${BOT_EMAIL_DOMAIN}`,
    firstName: 'Noah',
    lastName: 'Williams',
    age: 21,
    gender: 'MAN' as const,
    bio: "Mechanical engineering at Cornell. I build bridges — literally. Fan of early mornings, long trail runs, and people who can have a real conversation without checking their phone. Genuine > impressive.",
    major: 'Mechanical Engineering',
    gpa: 3.85,
    sat: 1520,
    act: 34,
    headline: 'Engineering brain, outdoors habit, Chicago next.',
    currentRole: 'Mechanical engineer intern',
    company: 'Tesla',
    locationLabel: 'Ithaca, NY',
    workLocation: 'Chicago, IL',
    futureLocation: 'Chicago, IL',
    interests: ['Engineering', 'Running', 'Photography', 'Camping', 'Music'],
    values: ['Authenticity', 'Grit', 'Curiosity', 'Loyalty'],
    relationshipGoal: 'LONGTERM' as const,
    collegeEmailDomain: 'cornell.edu',
    profilePhotoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop&crop=face',
    dateOfBirth: '2003-02-11',
    height: "6'1\"",
    drinking: 'Rarely',
    wantsKids: 'Someday',
    prompts: [
      { question: 'What people get wrong about me:', answer: "That being an engineer means I'm not creative. The whole job is creative problem solving. The math is just the language." },
      { question: 'I\'ll always say yes to:', answer: 'A trail run before 7am. A camping trip with no service. Anyone who can keep up with either.' },
      { question: 'The most underrated city to build a life in:', answer: "Chicago. I keep saying it and nobody listens. They will when they get there." },
    ],
  },
  {
    email: `aiden.foster${BOT_EMAIL_DOMAIN}`,
    firstName: 'Aiden',
    lastName: 'Foster',
    age: 22,
    gender: 'MAN' as const,
    bio: 'Pre-law philosophy major at Northwestern. I argue for sport and apologize genuinely. Into constitutional history, long dinners, and any sport that requires strategy. Serious about life, not serious about myself.',
    major: 'Philosophy / Pre-Law',
    gpa: 3.75,
    sat: 1480,
    act: 32,
    headline: 'Law track, sharp opinions, already rooted in Chicago.',
    currentRole: 'Litigation intern',
    company: 'Kirkland & Ellis',
    locationLabel: 'Evanston, IL',
    workLocation: 'Chicago, IL',
    futureLocation: 'Chicago, IL',
    interests: ['Philosophy', 'Law', 'Tennis', 'Wine', 'Literature'],
    values: ['Justice', 'Humor', 'Integrity', 'Curiosity'],
    relationshipGoal: 'LONGTERM' as const,
    collegeEmailDomain: 'northwestern.edu',
    profilePhotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop&crop=face',
    dateOfBirth: '2002-10-30',
    height: "5'10\"",
    drinking: 'Socially',
    wantsKids: 'Yes',
    prompts: [
      { question: 'My thesis in one sentence:', answer: 'Justice is procedural, not outcome-based — but outcomes still matter, which is where things get complicated.' },
      { question: 'Unpopular opinion in my field:', answer: 'Most law students want to argue. Good lawyers want to resolve. Those are different skills and most programs only teach one.' },
      { question: 'I\'ll always say yes to:', answer: 'A long dinner where the conversation outlasts the food. That\'s the actual metric.' },
    ],
  },
  {
    email: `ethan.brooks${BOT_EMAIL_DOMAIN}`,
    firstName: 'Ethan',
    lastName: 'Brooks',
    age: 23,
    gender: 'MAN' as const,
    bio: 'International relations at Georgetown. Grew up in three countries, fluent in two languages, passable in a third. Looking for depth — someone I can disagree with, learn from, and get coffee with.',
    major: 'International Relations',
    gpa: 3.65,
    sat: 1460,
    act: 31,
    headline: 'IR, global perspective, and a coastal corridor life plan.',
    currentRole: 'Policy fellow',
    company: 'Council on Foreign Relations',
    locationLabel: 'Washington, DC',
    workLocation: 'Washington, DC',
    futureLocation: 'New York, NY',
    interests: ['Politics', 'Travel', 'Languages', 'Squash', 'Film'],
    values: ['Curiosity', 'Empathy', 'Authenticity', 'Ambition'],
    relationshipGoal: 'LONGTERM' as const,
    collegeEmailDomain: 'georgetown.edu',
    profilePhotoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=500&fit=crop&crop=face',
    dateOfBirth: '2001-05-17',
    height: "6'0\"",
    drinking: 'Socially',
    wantsKids: 'Open to it',
    prompts: [
      { question: 'My thesis in one sentence:', answer: 'Multilateralism is structurally broken but still better than the alternatives — which says everything about where we are.' },
      { question: 'The book that actually changed how I think:', answer: 'Kissinger\'s Diplomacy. I disagree with most of his conclusions and it\'s still the most useful framework I\'ve found.' },
      { question: 'What I\'m building right now:', answer: 'A policy brief series on AI governance that the EU actually reads. Progress is slow. The topic is urgent.' },
    ],
  },
];

// ── Pre-seeded opening conversations per bot ───────────────────────────────────
// [senderIsBot, content]
const seedConversations: Record<string, [boolean, string][]> = {
  'sofia.chen': [
    [true, "Hey! I saw you're into technology and hiking — that's a rare combo. What's your favorite trail?"],
    [false, "Ha, depends on the season. Right now probably Sleeping Bear Dunes. You hike at Stanford?"],
    [true, "More of a coastal person honestly — I do Dish Trail constantly. But I'm adding Sleeping Bear to the list."],
  ],
  'emma.walsh': [
    [true, "Okay, CS + Finance interests? We should talk. What's your actual take on AI's impact on markets?"],
    [false, "Hot take: most fintech companies are solving the wrong problems. Real financial access issues are unsexy so nobody builds for them."],
    [true, "Okay that's a more interesting answer than I expected. Elaborate."],
  ],
  'priya.sharma': [
    [true, "Another CS person! Are you more systems or application layer?"],
    [false, "Application mostly, but I think you need to understand the stack all the way down to build anything good."],
    [true, "Correct. What are you building right now?"],
  ],
  'olivia.bennett': [
    [true, "What's a Michigan CS person's take on tech regulation? Real answer, not the safe one."],
    [false, "Nuanced — most regulation is too late and too generic. Policymakers don't understand the tech, technologists don't understand policy. Gap needs to close."],
    [true, "That's actually a very Yale answer, which I mean as a compliment."],
  ],
  'maya.rodriguez': [
    [true, "Fair warning: I'm in a psych PhD program. I will absolutely read into everything you say. You've been warned."],
    [false, "Noted. I'll try to be interestingly unreadable."],
    [true, "Challenge accepted. I'm Maya, by the way."],
  ],
  'james.park': [
    [false, "Math PhD at Princeton — theoretical or applied?"],
    [true, "Theoretical. Algebraic topology specifically. You probably want me to explain what that is."],
    [false, "I kind of do, yeah."],
    [true, "Okay so imagine coffee cups and donuts are the same object..."],
  ],
  'lucas.chen': [
    [true, "CS and Finance interests — are you going into quant trading or building something?"],
    [false, "Building. What about you at Fuqua?"],
    [true, "Investment banking for two years, then something else. Still figuring out what that something else is."],
    [false, "Honest. I respect that."],
  ],
  'noah.williams': [
    [true, "Trail run or gym — and this matters more than you think."],
    [false, "Trail, no question. Gym is for when trails aren't accessible."],
    [true, "Finally. Okay you're already ahead of most people on this app."],
  ],
  'aiden.foster': [
    [true, "Genuine question: is technology morally neutral, or does it have values baked in by design?"],
    [false, "Neither — it amplifies existing human values. The tech itself is a mirror, not a neutral tool."],
    [true, "That's a more sophisticated answer than I was expecting. I was ready to argue against techno-neutrality for ten minutes."],
  ],
  'ethan.brooks': [
    [true, "Do you follow what's happening in tech policy internationally? Genuinely asking, not making small talk."],
    [false, "Some. EU AI Act has my attention. What's on your radar?"],
    [true, "That's exactly the right thing to be watching. We should talk about this properly."],
  ],
};

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🌱 Running dev seed...\n');

  // 1. Look up college IDs
  const collegeRows = await db
    .select({ id: colleges.id, emailDomain: colleges.emailDomain })
    .from(colleges);
  const collegeByDomain = new Map(collegeRows.map((c) => [c.emailDomain, c.id]));

  const michiganId = collegeByDomain.get('umich.edu');
  if (!michiganId) {
    console.error('❌ Colleges not seeded yet. Run: npm run db:seed first.');
    process.exit(1);
  }

  // 2. Create / find the dev user
  const devPasswordHash = await hashPassword(DEV_PASSWORD);
  await db
    .insert(users)
    .values({
      email: DEV_EMAIL,
      passwordHash: devPasswordHash,
      firstName: 'Alex',
      lastName: 'Dev',
      age: 22,
      dateOfBirth: '2002-06-15',
      gender: 'MAN',
      bio: 'CS senior at Michigan passionate about building things and connecting ideas. Avid hiker, amateur chef, and occasional jazz listener. Looking for someone who can keep up with my random 2am Wikipedia deep dives.',
      headline: 'Michigan now, Chicago next.',
      currentRole: 'Incoming software engineer',
      company: 'Ramp',
      locationLabel: 'Ann Arbor, MI',
      workLocation: 'Chicago, IL',
      futureLocation: 'Chicago, IL',
      major: 'Computer Science',
      gpa: 3.8,
      sat: 1520,
      act: 34,
      interests: ['Hiking', 'Finance', 'Technology', 'Cooking', 'Travel'],
      values: ['Ambition', 'Loyalty', 'Curiosity', 'Humor'],
      relationshipGoal: 'LONGTERM',
      collegeId: michiganId,
      profilePhotoUrl: 'https://randomuser.me/api/portraits/men/10.jpg',
      verified: true,
      idVerified: true,
      onboardingComplete: true,
    })
    .onConflictDoUpdate({
      target: users.email,
      set: {
        passwordHash: devPasswordHash,
        firstName: 'Alex',
        lastName: 'Dev',
        age: 22,
        dateOfBirth: '2002-06-15',
        gender: 'MAN',
        bio: 'CS senior at Michigan passionate about building things and connecting ideas. Avid hiker, amateur chef, and occasional jazz listener. Looking for someone who can keep up with my random 2am Wikipedia deep dives.',
        headline: 'Michigan now, Chicago next.',
        currentRole: 'Incoming software engineer',
        company: 'Ramp',
        locationLabel: 'Ann Arbor, MI',
        workLocation: 'Chicago, IL',
        futureLocation: 'Chicago, IL',
        major: 'Computer Science',
        gpa: 3.8,
        sat: 1520,
        act: 34,
        interests: ['Hiking', 'Finance', 'Technology', 'Cooking', 'Travel'],
        values: ['Ambition', 'Loyalty', 'Curiosity', 'Humor'],
        relationshipGoal: 'LONGTERM',
        collegeId: michiganId,
        profilePhotoUrl: 'https://randomuser.me/api/portraits/men/10.jpg',
        verified: true,
        idVerified: true,
        onboardingComplete: true,
        updatedAt: new Date(),
      },
    });

  const [devUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, DEV_EMAIL))
    .limit(1);

  console.log(`✅ Dev user ready — email: ${DEV_EMAIL} / password: ${DEV_PASSWORD}`);

  // 2b. Create fresh unboarded test account
  const freshPasswordHash = await hashPassword(FRESH_PASSWORD);
  await db
    .insert(users)
    .values({
      email: FRESH_EMAIL,
      passwordHash: freshPasswordHash,
      firstName: 'New',
      lastName: 'User',
      age: 22,
      dateOfBirth: '2002-01-01',
      gender: 'MAN',
      verified: true,
      idVerified: false,
      onboardingComplete: false,
    })
    .onConflictDoUpdate({
      target: users.email,
      set: {
        passwordHash: freshPasswordHash,
        firstName: 'New',
        lastName: 'User',
        onboardingComplete: false,
        updatedAt: new Date(),
      },
    });
  console.log(`✅ Fresh unboarded account — email: ${FRESH_EMAIL} / password: ${FRESH_PASSWORD}`);

  // 3. Create bot users
  const botPasswordHash = await hashPassword('BotApex1!');

  for (const bot of botData) {
    const collegeId = collegeByDomain.get(bot.collegeEmailDomain) ?? null;
    await db
      .insert(users)
      .values({
        email: bot.email,
        passwordHash: botPasswordHash,
        firstName: bot.firstName,
        lastName: bot.lastName,
        age: bot.age,
        dateOfBirth: bot.dateOfBirth,
        gender: bot.gender,
        bio: bot.bio,
        headline: bot.headline,
        currentRole: bot.currentRole,
        company: bot.company,
        locationLabel: bot.locationLabel,
        workLocation: bot.workLocation,
        futureLocation: bot.futureLocation,
        major: bot.major,
        gpa: bot.gpa,
        sat: bot.sat,
        act: bot.act,
        interests: bot.interests,
        values: bot.values,
        relationshipGoal: bot.relationshipGoal,
        collegeId,
        profilePhotoUrl: bot.profilePhotoUrl,
        prompts: bot.prompts ?? null,
        height: bot.height ?? null,
        drinking: bot.drinking ?? null,
        wantsKids: bot.wantsKids ?? null,
        greekOrganization: bot.greekOrganization ?? null,
        greekOrganizationType: bot.greekOrganizationType ?? null,
        verified: true,
        idVerified: true,
        onboardingComplete: true,
      })
      .onConflictDoUpdate({
        target: users.email,
        set: {
          passwordHash: botPasswordHash,
          firstName: bot.firstName,
          lastName: bot.lastName,
          age: bot.age,
          dateOfBirth: bot.dateOfBirth,
          gender: bot.gender,
          bio: bot.bio,
          headline: bot.headline,
          currentRole: bot.currentRole,
          company: bot.company,
          locationLabel: bot.locationLabel,
          workLocation: bot.workLocation,
          futureLocation: bot.futureLocation,
          major: bot.major,
          gpa: bot.gpa,
          sat: bot.sat,
          act: bot.act,
          interests: bot.interests,
          values: bot.values,
          relationshipGoal: bot.relationshipGoal,
          collegeId,
          profilePhotoUrl: bot.profilePhotoUrl,
          prompts: bot.prompts ?? null,
          height: bot.height ?? null,
          drinking: bot.drinking ?? null,
          wantsKids: bot.wantsKids ?? null,
          greekOrganization: bot.greekOrganization ?? null,
          greekOrganizationType: bot.greekOrganizationType ?? null,
          verified: true,
          idVerified: true,
          onboardingComplete: true,
          updatedAt: new Date(),
        },
      });
  }

  console.log(`✅ ${botData.length} bot profiles ready`);

  // 4. Get bot user IDs
  const botEmails = botData.map((b) => b.email);
  const botUsers = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(inArray(users.email, botEmails));

  // 5. Create match records between dev user and each bot
  //    - REQUEST bots: status=LIKED, userId1=bot (they liked dev user first)
  //    - Other bots: status=MATCHED
  for (const bot of botUsers) {
    const isRequest = REQUEST_BOT_EMAILS.has(bot.email);
    await db
      .insert(matches)
      .values(
        isRequest
          ? { userId1: bot.id, userId2: devUser.id, status: 'LIKED', matchScore: 80 + Math.floor(Math.random() * 15) }
          : { userId1: devUser.id, userId2: bot.id, status: 'MATCHED', matchScore: 72 + Math.floor(Math.random() * 20) }
      )
      .onConflictDoNothing();
  }

  console.log(`✅ ${botUsers.length} matches created (3 pending requests, 7 connected)`);

  // 5b. Seed profile views — bots viewed dev user's profile
  for (const bot of botUsers) {
    await db
      .insert(profileViews)
      .values({ viewerId: bot.id, viewedId: devUser.id })
      .onConflictDoNothing();
  }
  console.log(`✅ ${botUsers.length} profile views seeded for dev user`);

  // 6. Seed opening conversations (only for MATCHED bots, not LIKED/request bots)
  const matchRows = await db
    .select({ id: matches.id, userId2: matches.userId2 })
    .from(matches)
    .where(
      and(
        eq(matches.userId1, devUser.id),
        inArray(matches.userId2, botUsers.map((b) => b.id)),
        eq(matches.status, 'MATCHED')
      )
    );

  const botIdToEmail = new Map(botUsers.map((b) => [b.id, b.email]));

  for (const match of matchRows) {
    const botEmail = botIdToEmail.get(match.userId2) ?? '';
    // key is firstName.lastName without domain
    const shortKey = botEmail.replace(BOT_EMAIL_DOMAIN, '');
    const convo = seedConversations[shortKey];
    if (!convo) continue;

    // Check if messages already exist for this match
    const existingMessages = await db
      .select({ id: messages.id })
      .from(messages)
      .where(eq(messages.matchId, match.id))
      .limit(1);

    if (existingMessages.length > 0) continue; // already seeded

    for (const [fromBot, content] of convo) {
      const senderUserId = fromBot ? match.userId2 : devUser.id;
      await db.insert(messages).values({
        matchId: match.id,
        senderUserId,
        content,
      });
    }
  }

  console.log('✅ Opening conversations seeded');
  console.log('\n🎉 Dev seed complete!');
  console.log(`   Dev account:   ${DEV_EMAIL} / ${DEV_PASSWORD}  (onboarded, 7 chats + 3 requests + 10 viewers)`);
  console.log(`   Fresh account: ${FRESH_EMAIL} / ${FRESH_PASSWORD}  (not onboarded — tests full onboarding flow)\n`);
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Dev seed failed:', err);
  process.exit(1);
});
