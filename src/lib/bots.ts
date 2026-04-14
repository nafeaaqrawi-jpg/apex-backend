// Bot identification and auto-reply system for dev/demo mode
export const BOT_EMAIL_DOMAIN = '@botapex.internal';

// ── Topic-aware reply buckets ─────────────────────────────────────────────────

const CAREER_REPLIES = [
  "What's the actual goal after graduation? Not the default answer.",
  "That's the right move for year 1. What's the 5-year plan?",
  "Interesting path. How did you land on that?",
  "That company is doing something real right now. Good timing.",
  "Goldman / McKinsey / Google track? Or are you building something?",
  "Two years then business school, or two years then something more interesting?",
  "I respect that you have a plan. Most people don't.",
  "What's the thing you're building toward that you don't say out loud yet?",
];

const CITY_REPLIES = [
  "That's a strong city to bet on right now.",
  "Good call — I'm heading there too. What neighborhood are you thinking?",
  "New York or Chicago? This is actually important to me.",
  "SF is the obvious choice but I'm not sure it's the right one anymore.",
  "DC is underrated for people who want to actually make things happen.",
  "Boston or New York — you're basically choosing a personality.",
  "I've been researching cities obsessively. What's pulling you there?",
  "That tracks for someone in your field. Have you actually been there?",
];

const SCHOOL_REPLIES = [
  "That's a different culture from here. What surprised you most?",
  "What's the campus culture actually like? I've heard a lot but want a real answer.",
  "What did you get out of it that you couldn't have gotten elsewhere?",
  "Big state school energy vs. small liberal arts — which do you actually prefer?",
  "I feel like every school claims to be collaborative. Is yours actually?",
  "What's the most underrated thing about your school that nobody talks about?",
];

const OPINION_REPLIES = [
  "Bold take. I'd push back on one part of that.",
  "Okay that's actually more nuanced than I expected. Elaborate.",
  "I was going to disagree but you made a good point.",
  "That's the contrarian view. Defend it.",
  "Wait — actually walk me through your reasoning there.",
  "Interesting. Most people in your field wouldn't say that.",
  "I've thought about this too and landed somewhere different. Can I share?",
  "That's a strong take. Where does it come from?",
];

const INTEREST_REPLIES = [
  "Okay that's a surprisingly good interest combination.",
  "I'm into that too — what's your entry point into it?",
  "Tell me more about the reading. What's on your list right now?",
  "Hiking plus finance is a rare pairing. I appreciate the balance.",
  "If you had to pick one thing you genuinely can't stop thinking about, what is it?",
  "That's a vibe. What does a good weekend look like for you?",
];

const QUESTION_REPLIES = [
  "Great question. Let me actually think about that for a second.",
  "Genuinely interesting thing to ask. Here's my honest answer:",
  "I've been thinking about this lately actually.",
  "Nobody's asked me that before. Give me a second.",
  "That's the kind of question I like.",
];

const DEFAULT_REPLIES = [
  "Okay wait, that's actually really interesting. What got you into that?",
  "I feel like we'd have a good conversation in person.",
  "Haha yes, finally someone who gets it.",
  "That's a bold take. I like it though — tell me more.",
  "Okay your taste is suspiciously good. What else are you into?",
  "That's so funny, I was literally just thinking about this.",
  "I wasn't expecting that answer. In a good way.",
  "Wait, we have the same opinion on this? That almost never happens.",
  "Genuine question — coffee or matcha? This is important.",
  "I'm genuinely curious about you now.",
  "That's the most honest thing anyone's said to me on here.",
  "Bold of you to admit that. Respect.",
  "We should continue this somewhere that doesn't have a character limit.",
  "Okay you're interesting. I was not prepared for that.",
  "Honestly same. I thought I was the only one who felt that way.",
  "That's actually a really good question. Let me think...",
  "You have good opinions. This is going well.",
  "I appreciate that you have actual thoughts. Rare.",
  "Tell me something you rarely share this early in a conversation.",
  "Favorite book — go. This is the real test.",
  "Okay I need to know more about that.",
  "That tracks. What else?",
  "You're different from most people I match with on here.",
  "Okay, I'm impressed. Go on.",
  "Fair point. Though I'd push back on one thing...",
  "That's actually kind of a perfect answer.",
  "How did I know you were going to say that? In the best way.",
  "Okay we're definitely getting coffee at some point.",
];

// ── Message classifier ────────────────────────────────────────────────────────

type ReplyBucket = 'career' | 'city' | 'school' | 'opinion' | 'interest' | 'question' | 'default';

function classifyMessage(content: string): ReplyBucket {
  const lower = content.toLowerCase();

  if (/\?/.test(content)) return 'question';

  if (
    /\b(job|career|work|intern|company|startup|goldman|mckinsey|google|amazon|meta|microsoft|finance|banking|consulting|engineer|law|medicine|med school|residency|phd|grad school|graduate|salary|offer|recruit)\b/.test(lower)
  ) return 'career';

  if (
    /\b(city|nyc|new york|chicago|sf|san francisco|boston|dc|washington|la|los angeles|seattle|austin|move|moving|relocat|neighborhood|coast)\b/.test(lower)
  ) return 'city';

  if (
    /\b(school|college|university|campus|harvard|mit|stanford|yale|princeton|columbia|michigan|cornell|duke|penn|wharton|major|degree|class|professor|semester|freshman|sophomore|junior|senior)\b/.test(lower)
  ) return 'school';

  if (
    /\b(think|believe|opinion|feel|actually|disagree|agree|wrong|right|true|false|better|worse|overrated|underrated|honest|controversial|unpopular|take|argue|debate)\b/.test(lower)
  ) return 'opinion';

  if (
    /\b(hike|hiking|run|running|read|reading|cook|cooking|travel|music|film|art|yoga|gym|fitness|sport|tennis|golf|climbing|photography|coffee|wine|food|book|podcast)\b/.test(lower)
  ) return 'interest';

  return 'default';
}

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ── Public API ────────────────────────────────────────────────────────────────

export function getRandomBotReply(userMessage?: string): string {
  if (!userMessage) return pickRandom(DEFAULT_REPLIES);

  const bucket = classifyMessage(userMessage);
  switch (bucket) {
    case 'career': return pickRandom(CAREER_REPLIES);
    case 'city': return pickRandom(CITY_REPLIES);
    case 'school': return pickRandom(SCHOOL_REPLIES);
    case 'opinion': return pickRandom(OPINION_REPLIES);
    case 'interest': return pickRandom(INTEREST_REPLIES);
    case 'question': return pickRandom(QUESTION_REPLIES);
    default: return pickRandom(DEFAULT_REPLIES);
  }
}

const BOT_CONNECTION_REPLIES = [
  "Your note actually made me smile. What's the story behind that?",
  "You made this easy to answer. Tell me something I wouldn't guess from your profile.",
  "That was a strong opener. What made you decide to reach out?",
  "Okay, that felt thoughtful. What's something you're excited about right now?",
  "You seem interesting already. What's a conversation topic you never get tired of?",
];

const BOT_CONNECTION_REPLIES_WITHOUT_NOTE = [
  "You popped up at the right time. What's something I should know about you first?",
  "Glad we connected. What's been the best part of your week so far?",
  "I'm into a strong start. What's something you're unusually passionate about?",
  "Now that we're connected, give me the real version of you in one sentence.",
];

export function getBotConnectionReply(introMessage?: string): string {
  const replies = introMessage?.trim()
    ? BOT_CONNECTION_REPLIES
    : BOT_CONNECTION_REPLIES_WITHOUT_NOTE;
  return pickRandom(replies);
}
