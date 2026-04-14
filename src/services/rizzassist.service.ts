export type RizzIntent = 'open' | 'reply' | 'recover';
export type RizzTone = 'playful' | 'confident' | 'warm';
export type RizzAudience = 'woman' | 'man' | 'any';
export type RizzPersona =
  | 'nerdy'
  | 'goth'
  | 'consultant'
  | 'investment_banker'
  | 'swe'
  | 'creative'
  | 'athlete';
export type RizzBoundary = 'clean' | 'light_flirty' | 'bold';
export type RizzGoal = 'flirt' | 'build_rapport' | 'set_up_date';
export type RizzChatRole = 'user' | 'assistant';

export interface RizzSignalContext {
  college?: string;
  currentLocation?: string;
  workLocation?: string;
  futureLocation?: string;
  currentRole?: string;
  company?: string;
  verified?: boolean;
  gpa?: number;
  sat?: number;
  act?: number;
}

export interface RizzChatMessage {
  role: RizzChatRole;
  content: string;
}

export interface RizzAssistInput {
  message: string;
  intent: RizzIntent;
  tone: RizzTone;
  audience: RizzAudience;
  persona?: RizzPersona;
  goal?: RizzGoal;
  boundary?: RizzBoundary;
  history?: RizzChatMessage[];
  profileSignals?: RizzSignalContext;
}

type LikelyReply = {
  reply: string;
  read: string;
  response: string;
};

// ─── Coach text generation ────────────────────────────────────────────────────

function detectContext(message: string) {
  const lower = message.toLowerCase();
  const theyReplied =
    lower.includes('replied') ||
    lower.includes('said') ||
    lower.includes('texted') ||
    lower.includes('sent me') ||
    lower.includes('she said') ||
    lower.includes('he said') ||
    lower.includes('they said');

  const isLaugh = /haha|lol|lmao|hehe|😂|😆/.test(lower);
  const isShortReply = message.trim().split(/\s+/).length <= 4;
  const isGhosted = lower.includes('ghost') || lower.includes('left me on') || lower.includes('no response') || lower.includes("didn't reply") || lower.includes('read');
  const isOpening = lower.includes('first message') || lower.includes('open') || lower.includes('start') || lower.includes('say to') || lower.includes('approach');
  const hasQuestion = lower.includes('?');

  return { theyReplied, isLaugh, isShortReply, isGhosted, isOpening, hasQuestion };
}

function buildCoachText(input: RizzAssistInput): string {
  const { message, intent, tone, audience } = input;
  const ctx = detectContext(message);
  const hook = message.trim().length > 80 ? message.trim().slice(0, 77) + '...' : message.trim();

  const audienceHint =
    audience === 'woman'
      ? 'With women, curiosity beats pressure every time.'
      : audience === 'man'
        ? 'With men, a little playful challenge goes a long way.'
        : 'The goal is to make the next reply feel easy and natural.';

  // Ghosted / no response situation
  if (ctx.isGhosted) {
    if (tone === 'playful') {
      return `Okay — getting left on read is not the end. The worst thing you can do is double-text with "hey?" or over-explain. Wait at least 2-3 days, then re-open with something completely new and low-pressure. Something like a funny observation or a genuine question that has nothing to do with the last message. No callbacks. No "did you see my message." Just a clean, fresh energy as if the silence never happened. ${audienceHint}`;
    }
    if (tone === 'confident') {
      return `Being ghosted stings, but how you respond reveals your frame. Give it 3-5 days of silence, then re-engage with something brief and genuine — not a follow-up on the last thing, but a completely new thread. One short message, no explanation, no apology. If they are interested, that space was exactly what they needed. If they do not reply again, you have your answer and you haven't lost your dignity. ${audienceHint}`;
    }
    return `It's likely not personal — life gets busy and threads get buried. Give it a few days, then reach back with something warm and low-stakes that doesn't reference the gap. A simple "been thinking about this thing you mentioned earlier..." or a funny thing that reminded you of them. Keep it brief, keep it genuine. ${audienceHint}`;
  }

  // They sent a laugh / short reply
  if (ctx.theyReplied && (ctx.isLaugh || ctx.isShortReply) && intent === 'reply') {
    if (tone === 'playful') {
      return `"${hook}" is actually a green signal — they responded with warmth, which means the vibe is there. Do NOT over-invest right now. Match their energy with something equally light, then open a new thread. Drop a single witty question or observation and let them step in. The goal here is momentum, not a statement. One clean line and leave the door open.`;
    }
    if (tone === 'confident') {
      return `Short replies like "${hook}" are engagement, not rejection. They are staying in the conversation without fully committing yet. Your move: be direct without being heavy. Acknowledge their energy briefly, then pivot with one specific question that is easy to answer but reveals something real. Stay calm. Don't chase — invite.`;
    }
    return `They kept the thread alive with "${hook}" — that's a good sign. The warm move here is to make the next reply feel like a natural continuation. Something that shows you were paying attention, followed by a question that lets them share more. Make it easy for them to open up.`;
  }

  // Opening a conversation
  if (ctx.isOpening || intent === 'open') {
    if (tone === 'playful') {
      return `The best openers on apps like this are specific, a little unexpected, and easy to answer. Do not say "hey" or compliment their photo — that gets ignored. Pick one detail from their profile that actually caught your attention and react to it with genuine curiosity or a light tease. Something like "I saw you're into [thing] — I have strong opinions about this." Short, specific, a tiny bit unexpected. That's the formula. ${audienceHint}`;
    }
    if (tone === 'confident') {
      return `Confident openers are not about being flashy — they're about being direct and specific. Skip the small talk opener entirely. Go straight to a question that shows you actually looked at their profile, or make a statement that gives them something to react to. "I noticed [specific detail]. What's the story behind that?" works every time. Confidence is showing genuine curiosity without needing them to respond. ${audienceHint}`;
    }
    return `A warm opener is one that makes the other person feel seen, not just flattered. Instead of a compliment, lead with something you genuinely noticed — a shared interest, something specific they wrote, or a question that shows you read past the first line. The goal is to make them think "this person actually paid attention." ${audienceHint}`;
  }

  // Recovery situation
  if (intent === 'recover') {
    if (tone === 'playful') {
      return `Recovery is easier than you think — the key is not to over-explain the miss. Acknowledge it with one light line ("okay that landed weird, let me try this again") then immediately pivot to something better. Self-awareness + moving forward is more attractive than doubling down or apologizing too much. Give them something easy to react to and let the awkward moment die a quick death.`;
    }
    if (tone === 'confident') {
      return `The confident recovery is the clean pivot — acknowledge the stumble briefly, then move forward without making it a moment. "That came out differently than I meant it — let me reset" and then immediately into a real question or observation. No over-explaining. No excessive apology. Just course-correct and keep moving. The confidence is in not letting one bad message define the vibe.`;
    }
    return `The warmest recovery is honesty without drama. A simple "I realize that came out wrong" followed immediately by what you actually meant (or something new) lands better than any clever save. People forgive real moments much faster than they forgive trying too hard to fix them.`;
  }

  // General reply coaching
  if (tone === 'playful') {
    return `You're in the zone — keep the banter light and specific. The best replies match their energy and then raise it slightly with a question or observation that shows you were actually listening. Avoid going too serious too fast. ${audienceHint} Right now your job is to be the most interesting part of their day without trying to be impressive.`;
  }
  if (tone === 'confident') {
    return `Confidence in texting is about not over-explaining and not over-investing. Read what they gave you, take the best thread in it, and respond with directness. One line that shows you noticed something real, then a question or invitation to go deeper. Less is more. The more you say, the more you give away. ${audienceHint}`;
  }
  return `Your energy is right — keep it warm and curious. The move here is to take something real from what they said and respond to it genuinely before adding your next question. Make them feel heard first, then keep the thread alive. ${audienceHint}`;
}

// ─── Openers ─────────────────────────────────────────────────────────────────

function getOpeners(hook: string, intent: RizzIntent, tone: RizzTone): string[] {
  if (intent === 'open') {
    if (tone === 'playful') {
      return [
        `You gave off "${hook}" energy immediately. What's the real story there?`,
        `I was going to send something generic but "${hook}" deserved better. What got you into that?`,
        `Hot take incoming based on your profile: you seem like someone with genuinely good opinions. Prove me right.`,
      ];
    }
    if (tone === 'confident') {
      return [
        `You stood out. I noticed ${hook.length > 30 ? 'what you wrote' : `"${hook}"`} — what's the context there?`,
        `Skip the small talk: what's something you care about enough to argue for 10 minutes?`,
        `Most people don't notice what you put there. I did. What made you include it?`,
      ];
    }
    return [
      `I liked what you said about "${hook}". What inspired that?`,
      `You seem easy to talk to. What's been taking up your attention lately?`,
      `You came across thoughtful — so I'll ask a real question: what are you actually excited about right now?`,
    ];
  }

  if (intent === 'reply') {
    if (tone === 'playful') {
      return [
        `That energy. I respect it. What's your second-best line?`,
        `Okay, strong opener. Are you always this easy to banter with?`,
        `You're making this suspiciously fun. What's your niche skill that nobody expects?`,
      ];
    }
    if (tone === 'confident') {
      return [
        `I like that answer. Keep going — what's something about you people usually learn late?`,
        `Fair. Now give me the version you'd tell someone you actually want to impress.`,
        `That landed. What's your move when a conversation actually gets good?`,
      ];
    }
    return [
      `That was genuinely sweet. What's something you could talk about forever?`,
      `I like your energy. What's been the highlight of your week?`,
      `That felt easy in the best way. What should I ask you next?`,
    ];
  }

  // recover
  if (tone === 'playful') {
    return [
      `Let me recover with something better: what's your most elite low-stakes opinion?`,
      `Okay that opener deserved a refund. This one doesn't: what topic always pulls you in?`,
      `Reset button. You're interesting — let's try this properly: what are you irrationally good at?`,
    ];
  }
  if (tone === 'confident') {
    return [
      `That first message wasn't my best. This is cleaner: what about you would actually surprise me?`,
      `Let me try again with less noise. What's something you care about a lot?`,
      `Here's the better follow-up: what kind of conversation makes you stay up too late?`,
    ];
  }
  return [
    `That could've been smoother — so here's the real question: what makes you light up lately?`,
    `Let's reset. What's something people appreciate about you quickly?`,
    `I want to ask you something better: what's been worth your attention lately?`,
  ];
}

// ─── Likely replies ───────────────────────────────────────────────────────────

function getLikelyReplies(intent: RizzIntent, tone: RizzTone): LikelyReply[] {
  if (intent === 'open') {
    return [
      {
        reply: 'haha that\'s actually a good question',
        read: 'Interest is there. They\'re inviting you to lead.',
        response:
          tone === 'playful'
            ? 'Good, I have a reputation to protect. Give me the version you\'d tell someone you trust a little.'
            : 'I\'ll take that. Start with the honest answer, not the polished one.',
      },
      {
        reply: 'depends, what made you ask?',
        read: 'They want context before investing — a good sign.',
        response:
          'Your profile felt intentional and I\'d rather ask one real question than waste your time with something generic.',
      },
      {
        reply: 'lol smooth',
        read: 'Playful and testing whether you can hold momentum.',
        response:
          tone === 'confident'
            ? 'I\'ll accept smooth. Now make it hard for me and give me an answer I can\'t predict.'
            : 'I\'ll take the compliment. Your turn to impress me.',
      },
    ];
  }

  if (intent === 'reply') {
    return [
      {
        reply: 'hahaha',
        read: 'Liked the vibe — but you still need a clear next thread.',
        response: 'I like that laugh. Tell me the topic that turns you into the most animated version of yourself.',
      },
      {
        reply: 'you\'re trouble',
        read: 'Flirty challenge. Stay calm and amused.',
        response:
          tone === 'playful'
            ? 'Only conversationally. You seem like you\'d handle it just fine.'
            : 'Only if the conversation earns it. What\'s your evidence so far?',
      },
      {
        reply: 'that\'s fair',
        read: 'They\'re giving you room to deepen the exchange.',
        response: 'Good. Now give me the answer you wouldn\'t waste on a boring conversation.',
      },
    ];
  }

  return [
    {
      reply: 'lol okay better',
      read: 'Recovery worked. Don\'t mention the old miss again.',
      response: 'Appreciate the second chance. Now tell me the kind of energy you actually respond to.',
    },
    {
      reply: 'you recovered',
      read: 'They want to see if you can keep the frame.',
      response:
        tone === 'confident'
          ? 'I had to. You seemed worth a better line.'
          : 'Had to respect the moment. So what usually gets your attention?',
    },
    {
      reply: 'hahaha fair',
      read: 'Open again — give them a simple next step.',
      response: 'Perfect. What\'s one thing about you that people usually underestimate?',
    },
  ];
}

// ─── Follow-ups ───────────────────────────────────────────────────────────────

function getFollowUps(intent: RizzIntent): string[] {
  if (intent === 'recover') {
    return [
      'Reset the tone, then give them something easy to grab.',
      'Acknowledge the miss briefly — then move past it immediately.',
      'Do not over-explain or apologize more than once.',
    ];
  }
  if (intent === 'reply') {
    return [
      'Ask what they\'re building toward or excited about.',
      'Take the most interesting part of their reply and go deeper on it.',
      'Keep the thread alive — one good question beats three filler ones.',
    ];
  }
  return [
    'Follow up with one specific question, not a list.',
    'Let their answer steer the next move.',
    'Leave room — an easy reply beats a complicated one.',
  ];
}

// ─── Exports ──────────────────────────────────────────────────────────────────

const CAUTIONS: Record<RizzIntent, string> = {
  open: 'Avoid compliments that could be copy-pasted to twenty other profiles. Specificity is what separates confidence from spam.',
  reply: 'Don\'t over-answer. Match their energy, reward their interest, and keep the exchange moving forward.',
  recover: 'Recovery works best when you acknowledge the miss quickly, reset the tone, and give them an easier thread to grab.',
};

export function getRizzAssistResponse(input: Omit<RizzAssistInput, 'history' | 'profileSignals'>) {
  return getRizzAssistChatResponse(input);
}

export function getRizzAssistChatResponse(input: RizzAssistInput) {
  const hook = input.message.trim().length > 80 ? input.message.trim().slice(0, 77) + '...' : input.message.trim();

  return {
    persona: input.persona ?? 'nerdy',
    personaLabel: 'Apex AI',
    coach: buildCoachText(input),
    openers: getOpeners(hook, input.intent, input.tone),
    followUps: getFollowUps(input.intent),
    likelyReplies: getLikelyReplies(input.intent, input.tone),
    recovery: [
      'Acknowledge the miss briefly — one line, then move on.',
      'Reset the tone with something completely new.',
      'Give them an easy thread to grab. One question, no callbacks.',
    ],
    avoid: [
      'Double-texting or explaining yourself excessively',
      'Generic compliments that could go to anyone',
      'Asking multiple questions in one message',
      'Matching nervous energy with nervous energy',
    ],
    caution: CAUTIONS[input.intent],
    confidence: Math.max(45, Math.min(
      62 +
        (input.message.trim().length > 16 ? 8 : 0) +
        (input.history && input.history.length > 2 ? 6 : 0) +
        (input.profileSignals?.verified ? 4 : 0) +
        (input.profileSignals?.workLocation || input.profileSignals?.futureLocation ? 4 : 0),
      96
    )),
  };
}
