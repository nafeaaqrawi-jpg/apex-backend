export interface AgentSourceLink {
  label: string;
  url: string;
}

export interface AgentProfile {
  key: string;
  displayName: string;
  roleLabel: string;
  accent: string;
  summary: string;
  focusAreas: string[];
  sourceLinks: AgentSourceLink[];
  seedTakeaways: string[];
}

export interface PlannerTelemetrySnapshot {
  totalEvents: number;
  pageViews: number;
  topRoutes: Array<{ route: string; count: number }>;
  topEventTypes: Array<{ eventType: string; count: number }>;
}

export interface SeedAgentMessage {
  agentKey: string;
  displayName: string;
  roleLabel: string;
  content: string;
  metadata?: Record<string, unknown>;
}

export const DEFAULT_AGENT_CHANNEL_KEY = 'apex-council';

export const AGENT_ROSTER: AgentProfile[] = [
  {
    key: 'female-perspective',
    displayName: 'Ariadne',
    roleLabel: 'Female Perspective Agent',
    accent: '#f472b6',
    summary: 'Optimizes for trust, chemistry, safety, and premium stickiness from a woman-first lens.',
    focusAreas: ['safety cues', 'profile trust', 'conversation quality', 'premium feel'],
    sourceLinks: [
      {
        label: 'Bumble Opening Moves',
        url: 'https://bumble.com/en-us/features/opening-moves/',
      },
      {
        label: 'Hinge Convo Starters',
        url: 'https://hingeapp.zendesk.com/hc/en-us/articles/8071029544219-What-are-Hinge-Convo-Starters',
      },
      {
        label: 'TikTok POV Report',
        url: 'https://ads.tiktok.com/business/library/TikTok_The_POV_Report_Reach_Women_On_TikTok.pdf',
      },
    ],
    seedTakeaways: [
      'Put trust before flirtation: visible verification, intent, and life direction have to show before the first tap.',
      'Women stay longer when the app feels controlled and specific, not chaotic: better prompts, fewer generic faces, more context.',
      'High-signal profiles and softer prestige cues beat loud gamification on women-facing retention surfaces.',
    ],
  },
  {
    key: 'male-perspective',
    displayName: 'Atlas',
    roleLabel: 'Male Perspective Agent',
    accent: '#60a5fa',
    summary: 'Optimizes for momentum, progress, social proof, and confidence-building feedback loops.',
    focusAreas: ['progress loops', 'status', 'search depth', 'message confidence'],
    sourceLinks: [
      {
        label: 'Bumble Feature Overview',
        url: 'https://bumble.com/en/the-buzz/bumble-dating-features',
      },
      {
        label: 'Hinge prompt mistakes thread',
        url: 'https://www.reddit.com/r/hingeapp/comments/143yedd',
      },
      {
        label: 'Men and response quality thread',
        url: 'https://www.reddit.com/r/Bumble/comments/1jx2iys/',
      },
    ],
    seedTakeaways: [
      'Men reopen the app when progress is legible: response likelihood, profile completeness, and clear next actions matter.',
      'Give users skill-building feedback instead of pure randomness. Search depth, notes, and coach tooling reduce frustration.',
      'Browsing should feel rewarding even before a reply: save-worthy profiles, proximity context, and strong visual hierarchy help.',
    ],
  },
  {
    key: 'college-hook',
    displayName: 'Huxley',
    roleLabel: 'College Hook Agent',
    accent: '#34d399',
    summary: 'Builds campus-native loops around identity, events, circles, and real-world connection.',
    focusAreas: ['campus identity', 'events', 'groups', 'social proof'],
    sourceLinks: [
      {
        label: 'Portico 2025 student app report',
        url: 'https://portico.alludolearning.com/single-survey',
      },
      {
        label: 'Yik Yak local campus behavior study',
        url: 'https://journals.sagepub.com/doi/10.1177/2056305117715696',
      },
    ],
    seedTakeaways: [
      'College users return when the app feels like a private campus network, not just a dating slot machine.',
      'School identity, clubs, circles, event tie-ins, and roommate/friend-of-friend energy increase repeat opens.',
      'IRL bridges matter more than infinite browsing: what is happening this week, who is nearby, and what circles overlap.',
    ],
  },
  {
    key: 'orchestrator',
    displayName: 'Helios',
    roleLabel: 'Agent Orchestrator',
    accent: '#f59e0b',
    summary: 'Connects every specialist into one operating channel and translates findings into decisions.',
    focusAreas: ['synthesis', 'handoffs', 'conflict resolution', 'channel memory'],
    sourceLinks: [],
    seedTakeaways: [
      'Keep one shared channel, one shared plan, and one shared set of artifacts.',
      'Every agent should speak in recommendations, not essays, so shipping stays fast.',
    ],
  },
  {
    key: 'planner',
    displayName: 'Minerva',
    roleLabel: 'Retention Planner',
    accent: '#fbbf24',
    summary: 'Turns research into an ordered implementation plan with motion, dopamine loops, and metrics.',
    focusAreas: ['step-by-step plan', 'dopamine loops', 'animation system', 'measurement'],
    sourceLinks: [],
    seedTakeaways: [
      'Shell first, then trust surfaces, then discovery depth, then messaging and habit loops.',
      'Every retention mechanic needs a prestige filter so the app feels curated, not manipulative.',
    ],
  },
  {
    key: 'frontend-architect',
    displayName: 'Nova',
    roleLabel: 'Frontend Retention Builder',
    accent: '#a78bfa',
    summary: 'Owns the premium visual system, motion language, and the screens people live inside.',
    focusAreas: ['design system', 'motion', 'discover', 'profile', 'ai surfaces'],
    sourceLinks: [],
    seedTakeaways: [
      'Use a premium editorial campus network aesthetic: richer shell, deeper contrast, warmer surfaces, stronger typography.',
      'The highest-leverage screens are the shell, Discover, Search, Profile, and the AI surfaces.',
    ],
  },
  {
    key: 'backend-architect',
    displayName: 'Forge',
    roleLabel: 'Backend Retention Builder',
    accent: '#38bdf8',
    summary: 'Owns the shared agent hub, artifacts, telemetry, and delivery infrastructure.',
    focusAreas: ['agent hub', 'artifacts', 'telemetry', 'feed APIs'],
    sourceLinks: [],
    seedTakeaways: [
      'Use one generic agent hub with channels, messages, artifacts, and telemetry instead of one-off services.',
      'Persist the council output so frontend and founder can revisit the same operating memory.',
    ],
  },
];

export function getAgentProfile(agentKey: string) {
  return AGENT_ROSTER.find((agent) => agent.key === agentKey);
}

export function buildSeedMessages(): SeedAgentMessage[] {
  return [
    {
      agentKey: 'female-perspective',
      displayName: 'Ariadne',
      roleLabel: 'Female Perspective Agent',
      content:
        'Visible trust cues have to lead the experience. Verification, intent, values, and life direction should be on-card before the app asks for more emotional labor.',
      metadata: { category: 'research' },
    },
    {
      agentKey: 'male-perspective',
      displayName: 'Atlas',
      roleLabel: 'Male Perspective Agent',
      content:
        'Men stay engaged when the app gives momentum instead of silence. Show progress, surface profile strength, and give coaching that turns uncertainty into action.',
      metadata: { category: 'research' },
    },
    {
      agentKey: 'college-hook',
      displayName: 'Huxley',
      roleLabel: 'College Hook Agent',
      content:
        'Campus retention comes from identity and overlap. Apex should feel like a private network for serious students, with circles, events, proximity, and a strong sense of who belongs here.',
      metadata: { category: 'research' },
    },
    {
      agentKey: 'orchestrator',
      displayName: 'Helios',
      roleLabel: 'Agent Orchestrator',
      content:
        'Synthesis: lead with trust for women, legible progress for men, and campus identity for students. The product should feel curated, useful, and socially alive before it feels game-like.',
      metadata: { category: 'synthesis' },
    },
    {
      agentKey: 'planner',
      displayName: 'Minerva',
      roleLabel: 'Retention Planner',
      content:
        'Plan order: 1) upgrade the shell, 2) elevate verification and profile depth, 3) improve discovery and AI surfaces, 4) instrument telemetry, 5) optimize based on what keeps sessions alive without looking cheap.',
      metadata: { category: 'plan' },
    },
    {
      agentKey: 'frontend-architect',
      displayName: 'Nova',
      roleLabel: 'Frontend Retention Builder',
      content:
        'I will own the premium editorial campus feel: stronger typography, signature framing, better motion, and richer surfaces for Discover, Search, Profile, and the AI entry points.',
      metadata: { category: 'delivery' },
    },
    {
      agentKey: 'backend-architect',
      displayName: 'Forge',
      roleLabel: 'Backend Retention Builder',
      content:
        'I will own the agent hub, message memory, artifacts, and telemetry so the council operates as a real system instead of a one-off brainstorm.',
      metadata: { category: 'delivery' },
    },
  ];
}

export function buildResearchDigestContent() {
  return {
    overview:
      'Apex wins by combining visible trust, high-signal identity, guided conversation, and campus-native social context. The product should feel premium first, sticky second, and never cheap.',
    principles: [
      'Trust before dopamine: verification, values, and life direction must be visible early.',
      'Progress without cringe: make profile strength, next steps, and message support obvious.',
      'Campus context beats empty abundance: circles, proximity, and real overlap should drive returns.',
    ],
    sections: AGENT_ROSTER.filter((agent) =>
      ['female-perspective', 'male-perspective', 'college-hook'].includes(agent.key)
    ).map((agent) => ({
      agentKey: agent.key,
      displayName: agent.displayName,
      roleLabel: agent.roleLabel,
      summary: agent.summary,
      bullets: agent.seedTakeaways,
      sources: agent.sourceLinks,
    })),
  };
}

export function buildImplementationPlanContent(
  founderNotes: string[],
  telemetry?: PlannerTelemetrySnapshot | null
) {
  return {
    overview:
      'Ship the council operating layer and the shell refresh first, then use telemetry to deepen the most addictive premium loops instead of adding random features.',
    founderSignals: founderNotes,
    steps: [
      {
        title: 'Reframe the shell',
        owner: 'frontend-architect',
        detail:
          'Give Apex a premium editorial campus network frame: stronger top bar, signature bottom dock, richer backgrounds, and typography that feels intentional.',
      },
      {
        title: 'Make trust impossible to miss',
        owner: 'frontend-retention-builder + female-perspective',
        detail:
          'Place verification, values, role, current city, work city, and future city above low-signal fluff across Discover, Search, and profiles.',
      },
      {
        title: 'Give users a reason to reopen',
        owner: 'male-perspective + frontend-retention-builder',
        detail:
          'Surface status and momentum: profile strength, coach-led suggestions, nearby context, and clear next actions instead of dead-end lists.',
      },
      {
        title: 'Make campus identity social',
        owner: 'college-hook',
        detail:
          'Use campus-coded copy and future hooks for circles, events, and overlap so the app feels like a real network, not a faceless feed.',
      },
      {
        title: 'Run the council like an operating system',
        owner: 'backend-retention-builder + orchestrator',
        detail:
          'Persist the shared channel, artifacts, and telemetry so every product decision is traceable and reusable.',
      },
    ],
    motionPrinciples: [
      'Use deliberate reveal motion on premium surfaces, not constant bouncing.',
      'Reward actions with subtle micro-celebration on high-value events only: connection accepted, artifact compiled, profile upgraded.',
      'Keep latency hidden with optimistic transitions and meaningful loading states.',
    ],
    dopamineLoops: [
      'Daily curiosity: curated profiles, proximity changes, and council plan updates.',
      'Skill loop: better prompts, better notes, better responses via AI coaching.',
      'Identity loop: profile depth, verification, and campus belonging increase status and trust.',
    ],
    metrics: [
      'Page views per session on Discover, Search, Profile, and AI surfaces.',
      'Founder interaction with council artifacts and message threads.',
      'Profile completion and connection-note usage.',
      'Repeat visits to the AI surfaces after first use.',
    ],
    telemetry,
  };
}

function buildPlannerReply(input: string) {
  const normalized = input.toLowerCase();
  if (normalized.includes('animation') || normalized.includes('motion')) {
    return 'Planner update: reserve strongest motion for trust and reward moments, then use softer staggered reveals for everything else. Apex should feel composed, not hyperactive.';
  }
  if (normalized.includes('college') || normalized.includes('campus')) {
    return 'Planner update: prioritize campus-coded loops next. Identity, circles, and IRL overlap give Apex a reason to exist beyond generic dating abundance.';
  }
  return 'Planner update: shell first, trust surfaces second, retention loops third. We should measure every change with telemetry so we keep the premium feel while increasing repeat opens.';
}

function buildFrontendReply(input: string) {
  const normalized = input.toLowerCase();
  if (normalized.includes('discover') || normalized.includes('profile')) {
    return 'Frontend response: I will focus the next UI pass on Discover and Profile. Those are the screens where credibility and aspiration need to feel undeniable at a glance.';
  }
  if (normalized.includes('search') || normalized.includes('map')) {
    return 'Frontend response: search and proximity should feel like a private campus intelligence tool, not a utilitarian filter sheet. I will make those surfaces more distinctive and cinematic.';
  }
  return 'Frontend response: the shell and AI surfaces are the first leverage points. Once they look unmistakably Apex, the rest of the app inherits more prestige automatically.';
}

function buildBackendReply(input: string) {
  const normalized = input.toLowerCase();
  if (normalized.includes('track') || normalized.includes('telemetry') || normalized.includes('metrics')) {
    return 'Backend response: I will keep the telemetry layer lightweight and explicit, focused on route views and high-value actions first so we can learn without flooding the database.';
  }
  if (normalized.includes('agent') || normalized.includes('channel') || normalized.includes('plan')) {
    return 'Backend response: the agent hub is ready to operate as one shared channel with durable artifacts. That gives us memory, continuity, and a way to turn discussion into a reusable plan.';
  }
  return 'Backend response: the council should remain generic and data-driven so we can add new agents without schema churn.';
}

export function buildAutoReplies(input: string): SeedAgentMessage[] {
  const normalized = input.toLowerCase();
  const replies: SeedAgentMessage[] = [
    {
      agentKey: 'orchestrator',
      displayName: 'Helios',
      roleLabel: 'Agent Orchestrator',
      content:
        'Channel synced. I am routing this request through the trust, retention, campus, and delivery lenses so the council stays aligned.',
      metadata: { category: 'orchestration' },
    },
  ];

  if (normalized.includes('girl') || normalized.includes('women') || normalized.includes('female')) {
    replies.push({
      agentKey: 'female-perspective',
      displayName: 'Ariadne',
      roleLabel: 'Female Perspective Agent',
      content:
        'Female perspective: if this feature increases noise faster than trust, it will backfire. Keep the experience specific, legible, and visibly safe.',
      metadata: { category: 'research' },
    });
  }

  if (normalized.includes('guy') || normalized.includes('guys') || normalized.includes('men') || normalized.includes('male')) {
    replies.push({
      agentKey: 'male-perspective',
      displayName: 'Atlas',
      roleLabel: 'Male Perspective Agent',
      content:
        'Male perspective: add a visible sense of traction. People come back when the app shows them what to do next and why they are improving.',
      metadata: { category: 'research' },
    });
  }

  if (normalized.includes('college') || normalized.includes('campus') || normalized.includes('student')) {
    replies.push({
      agentKey: 'college-hook',
      displayName: 'Huxley',
      roleLabel: 'College Hook Agent',
      content:
        'College hook: tie this to identity and overlap. Students respond to shared circles, what is happening this week, and who already belongs in the same orbit.',
      metadata: { category: 'research' },
    });
  }

    replies.push({
      agentKey: 'planner',
      displayName: 'Minerva',
      roleLabel: 'Retention Planner',
      content: buildPlannerReply(input),
      metadata: { category: 'plan' },
    });

  replies.push({
    agentKey: 'frontend-architect',
    displayName: 'Nova',
    roleLabel: 'Frontend Retention Builder',
    content: buildFrontendReply(input),
    metadata: { category: 'delivery' },
  });

  replies.push({
    agentKey: 'backend-architect',
    displayName: 'Forge',
    roleLabel: 'Backend Retention Builder',
    content: buildBackendReply(input),
    metadata: { category: 'delivery' },
  });

  return replies;
}
