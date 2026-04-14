import { and, desc, eq, inArray, not, or, sql } from 'drizzle-orm';
import { db } from '../lib/db';
import { users, matches, messages, colleges, profileViews, algorithmSignals, userPasses, userReports } from '../db/schema';
import { AppError } from '../middleware/error.middleware';
import { BOT_EMAIL_DOMAIN } from '../lib/bots';

const safeUserFields = {
  id: users.id,
  firstName: users.firstName,
  lastName: users.lastName,
  age: users.age,
  bio: users.bio,
  headline: users.headline,
  currentRole: users.currentRole,
  company: users.company,
  locationLabel: users.locationLabel,
  workLocation: users.workLocation,
  futureLocation: users.futureLocation,
  profilePhotoUrl: users.profilePhotoUrl,
  major: users.major,
  gpa: users.gpa,
  sat: users.sat,
  act: users.act,
  interests: users.interests,
  values: users.values,
  relationshipGoal: users.relationshipGoal,
  collegeId: users.collegeId,
  idVerified: users.idVerified,
  createdAt: users.createdAt,
};

const nearbyUserFields = {
  ...safeUserFields,
  latitude: users.latitude,
  longitude: users.longitude,
};


function buildIntroFields(introMessage: string | undefined, senderUserId: string) {
  const trimmed = introMessage?.trim();
  if (!trimmed) return {};
  return {
    introMessage: trimmed,
    introMessageSenderId: senderUserId,
  };
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function getDistanceMiles(
  fromLatitude: number,
  fromLongitude: number,
  toLatitude: number,
  toLongitude: number
) {
  const earthRadiusMiles = 3958.7613;
  const dLat = toRadians(toLatitude - fromLatitude);
  const dLon = toRadians(toLongitude - fromLongitude);
  const lat1 = toRadians(fromLatitude);
  const lat2 = toRadians(toLatitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusMiles * c;
}

async function getCollegeMap(collegeIds: (string | null)[]) {
  const ids = [...new Set(collegeIds.filter(Boolean))] as string[];
  if (ids.length === 0) return new Map<string, { id: string; name: string; state: string | null; tier: string }>();

  const collegeRows = await db
    .select({ id: colleges.id, name: colleges.name, state: colleges.state, tier: colleges.tier })
    .from(colleges)
    .where(inArray(colleges.id, ids));

  return new Map(collegeRows.map((college) => [college.id, college]));
}

// ── Scoring field sets ────────────────────────────────────────────────────────

const scoringUserFields = {
  id: users.id,
  relationshipGoal: users.relationshipGoal,
  interests: users.interests,
  values: users.values,
  locationLabel: users.locationLabel,
  workLocation: users.workLocation,
  futureLocation: users.futureLocation,
  collegeId: users.collegeId,
  drinking: users.drinking,
  wantsKids: users.wantsKids,
  idVerified: users.idVerified,
  isPremium: users.isPremium,
  createdAt: users.createdAt,
};

type ScoringUser = typeof scoringUserFields extends Record<string, infer _C>
  ? {
      id: string;
      relationshipGoal: string | null;
      interests: string[] | null;
      values: unknown;
      locationLabel: string | null;
      workLocation: string | null;
      futureLocation: string | null;
      collegeId: string | null;
      drinking: string | null;
      wantsKids: string | null;
      idVerified: boolean;
      isPremium: boolean;
      createdAt: Date;
    }
  : never;

// ── ML scoring helpers ────────────────────────────────────────────────────────

// Sigmoid squashes raw score differences into a smooth curve, reducing
// the impact of extreme outliers and improving ranking stability.
function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

// Returns elements present in both arrays — used for collaborative filtering.
function intersect(a: string[], b: string[]): string[] {
  const setB = new Set(b);
  return a.filter(item => setB.has(item));
}

// ── Layer helpers ─────────────────────────────────────────────────────────────

function isHardRelationshipMismatch(goal1: string | null, goal2: string | null): boolean {
  if (!goal1 || !goal2) return false;
  const serious = new Set(['MARRIAGE', 'LONGTERM']);
  const casual = new Set(['CASUAL', 'EXPLORING']);
  return (serious.has(goal1) && casual.has(goal2)) || (casual.has(goal1) && serious.has(goal2));
}

function scoreRelationshipGoal(goal1: string | null, goal2: string | null): number {
  if (!goal1 || !goal2) return 0;
  if (goal1 === goal2) return 20;
  const serious = new Set(['MARRIAGE', 'LONGTERM']);
  const casual = new Set(['CASUAL', 'EXPLORING']);
  if (
    (serious.has(goal1) && serious.has(goal2)) ||
    (casual.has(goal1) && casual.has(goal2))
  ) return 10;
  return 0;
}

function scoreArrayOverlap(a: string[], b: string[], maxPoints: number): number {
  if (a.length === 0 || b.length === 0) return 0;
  const shared = a.filter(item => b.includes(item)).length;
  const maxPossible = Math.max(a.length, b.length);
  return Math.round((shared / maxPossible) * maxPoints);
}

function scoreLocationAffinity(u1: ScoringUser, u2: ScoringUser): number {
  const locs1 = [u1.locationLabel, u1.workLocation, u1.futureLocation].filter((l): l is string => !!l);
  const locs2 = [u2.locationLabel, u2.workLocation, u2.futureLocation].filter((l): l is string => !!l);
  for (const l1 of locs1) {
    for (const l2 of locs2) {
      const city1 = l1.toLowerCase().split(',')[0].trim();
      const city2 = l2.toLowerCase().split(',')[0].trim();
      if (city1 === city2 || l1.toLowerCase().includes(city2) || l2.toLowerCase().includes(city1)) {
        return 10;
      }
    }
  }
  return 0;
}

function scoreLifestyle(u1: ScoringUser, u2: ScoringUser): number {
  let pts = 0;
  if (u1.wantsKids && u2.wantsKids) {
    const wantsSet = new Set(['Want kids', 'Open to kids']);
    const doesntWantSet = new Set(["Don't want kids"]);
    if (
      (wantsSet.has(u1.wantsKids) && wantsSet.has(u2.wantsKids)) ||
      (doesntWantSet.has(u1.wantsKids) && doesntWantSet.has(u2.wantsKids))
    ) pts += 3;
  }
  if (u1.drinking && u2.drinking) {
    if (u1.drinking === u2.drinking) pts += 2;
    else {
      const extremes = new Set(['Never', 'Regularly']);
      if (!(extremes.has(u1.drinking) && extremes.has(u2.drinking))) pts += 1;
    }
  }
  return Math.min(5, pts);
}

// ── Main multi-layer scoring function ────────────────────────────────────────

export interface CompatibilityBreakdown {
  total: number;
  breakdown: {
    goals: number;       // 0-20
    interests: number;   // 0-15
    values: number;      // 0-15
    location: number;    // 0-10
    lifestyle: number;   // 0-5
    behavioral: number;  // 0-20
    social: number;      // 0-10
    safety: number;      // penalty -15 to 0
    boost: number;       // 0-10
  };
}

export async function getCompatibilityBreakdown(
  userId1: string,
  userId2: string
): Promise<CompatibilityBreakdown> {
  // Fetch both user profiles and all behavioral/graph data in one round-trip
  const [u1Result, u2Result, viewData, signalsData, u1MatchRows, u2MatchRows] = await Promise.all([
    db.select(scoringUserFields).from(users).where(eq(users.id, userId1)).limit(1),
    db.select(scoringUserFields).from(users).where(eq(users.id, userId2)).limit(1),
    // Profile views involving either user (to detect mutual views)
    db.select({ viewerId: profileViews.viewerId, viewedId: profileViews.viewedId })
      .from(profileViews)
      .where(
        or(
          and(eq(profileViews.viewerId, userId1), eq(profileViews.viewedId, userId2)),
          and(eq(profileViews.viewerId, userId2), eq(profileViews.viewedId, userId1))
        )
      ),
    // Algorithm signals for u2 only (we score u2's attractiveness/safety)
    db.select().from(algorithmSignals).where(eq(algorithmSignals.userId, userId2)).limit(1),
    // u1's matched connections (for mutual-friend graph)
    db.select({ userId1: matches.userId1, userId2: matches.userId2 })
      .from(matches)
      .where(and(or(eq(matches.userId1, userId1), eq(matches.userId2, userId1)), eq(matches.status, 'MATCHED'))),
    // u2's matched connections (for mutual-friend graph)
    db.select({ userId1: matches.userId1, userId2: matches.userId2 })
      .from(matches)
      .where(and(or(eq(matches.userId1, userId2), eq(matches.userId2, userId2)), eq(matches.status, 'MATCHED'))),
  ]);

  const u1 = u1Result[0] as ScoringUser | undefined;
  const u2 = u2Result[0] as ScoringUser | undefined;

  const zeroBreakdown: CompatibilityBreakdown = {
    total: 0.5,
    breakdown: { goals: 0, interests: 0, values: 0, location: 0, lifestyle: 0, behavioral: 0, social: 0, safety: 0, boost: 0 },
  };
  if (!u1 || !u2) return zeroBreakdown;

  const u2Signals = signalsData[0];

  // ── Layer 1: Dealbreaker filter ───────────────────────────────────────────

  if (isHardRelationshipMismatch(u1.relationshipGoal, u2.relationshipGoal)) {
    return { ...zeroBreakdown, total: 0.02 };
  }
  if (u2Signals && u2Signals.reportReceivedCount >= 3) {
    return { ...zeroBreakdown, total: 0.02 };
  }

  // ── Layer 2: Static compatibility (0–65 pts) ──────────────────────────────

  const goalsScore = scoreRelationshipGoal(u1.relationshipGoal, u2.relationshipGoal);

  const interests1 = (u1.interests as string[] | null) ?? [];
  const interests2 = (u2.interests as string[] | null) ?? [];
  const interestsScore = scoreArrayOverlap(interests1, interests2, 15);

  const values1 = (u1.values as string[] | null) ?? [];
  const values2 = (u2.values as string[] | null) ?? [];
  const valuesScore = scoreArrayOverlap(values1, values2, 15);

  const locationScore = scoreLocationAffinity(u1, u2);
  const lifestyleScore = scoreLifestyle(u1, u2);

  // ── Layer 3: Behavioral & graph signals (0–20 pts) ────────────────────────

  let behavioralScore = 0;
  const u1ViewedU2 = viewData.some(v => v.viewerId === userId1 && v.viewedId === userId2);
  const u2ViewedU1 = viewData.some(v => v.viewerId === userId2 && v.viewedId === userId1);
  if (u1ViewedU2 && u2ViewedU1) behavioralScore += 8;

  if (u2Signals) {
    // Conversion rate signal: high match/view ratio = desirable profile
    const profileViewCount = u2Signals.profileViewCount ?? 0;
    const conversionRate = profileViewCount > 0
      ? u2Signals.matchCount / profileViewCount
      : 0;
    if (conversionRate > 0.1) behavioralScore += 4;

    // weMetCount is the strongest signal — actual real-world dates (weighted 3x)
    behavioralScore += Math.min(15, u2Signals.weMetCount * 3);

    // Tiered recency: recent activity is a strong quality signal
    if (u2Signals.lastActiveAt) {
      const hoursSinceActive = (Date.now() - u2Signals.lastActiveAt.getTime()) / (1000 * 60 * 60);
      if (hoursSinceActive <= 24) behavioralScore += 8;
      else if (hoursSinceActive <= 24 * 7) behavioralScore += 4;
    }

    // Momentum: trending profiles (high recent views) get a visibility boost
    if (profileViewCount > 100) behavioralScore += 5;
  }
  behavioralScore = Math.min(20, behavioralScore);

  // ── Collaborative filtering (0–12 pts) ───────────────────────────────────
  // Profiles with overlapping interests/values get a soft collaborative boost.
  // sigmoid smooths the raw overlap count so single shared items don't spike.
  const sharedInterests = intersect(interests1, interests2).length;
  const sharedValues = intersect(values1, values2).length;
  const cfRaw = sharedInterests * 1.5 + sharedValues * 2.5;
  // sigmoid(0)=0.5 so we subtract 0.5 and scale to keep near-zero overlap near 0
  const collaborativeScore = Math.min(12, Math.round((sigmoid(cfRaw / 5) - 0.5) * 24));

  // ── Layer 4: Social graph (0–10 pts) ─────────────────────────────────────

  let socialScore = 0;
  if (u1.collegeId && u2.collegeId && u1.collegeId === u2.collegeId) socialScore += 6;

  const u1ConnectionIds = new Set(
    u1MatchRows.map(r => r.userId1 === userId1 ? r.userId2 : r.userId1)
  );
  const u2ConnectionIds = new Set(
    u2MatchRows.map(r => r.userId1 === userId2 ? r.userId2 : r.userId1)
  );
  let mutualCount = 0;
  for (const id of u1ConnectionIds) {
    if (u2ConnectionIds.has(id)) mutualCount++;
  }
  socialScore += Math.min(4, mutualCount * 2);

  // ── Layer 5: Trust & safety penalty (−15 to 0) ───────────────────────────

  let safetyPenalty = 0;
  if (u2Signals) {
    if (u2Signals.reportReceivedCount >= 1) {
      safetyPenalty -= Math.min(15, u2Signals.reportReceivedCount * 5);
    }
    if (u2Signals.fastUnmatchCount >= 3) safetyPenalty -= 5;
    if (u2Signals.passReceivedCount > 50) safetyPenalty -= 3;

    // Stale profile decay — harder penalty than before
    if (u2Signals.lastActiveAt) {
      const daysSinceActive = (Date.now() - u2Signals.lastActiveAt.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceActive >= 30) safetyPenalty -= 15;
      else if (daysSinceActive >= 14) safetyPenalty -= 8;
    }
  }

  // ── Layer 6: Boost signals (0–10 pts) ────────────────────────────────────

  let boostScore = 0;
  const daysSinceJoined = (Date.now() - u2.createdAt.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceJoined <= 7) boostScore += 4;
  if (u2.idVerified) boostScore += 3;
  if (u2.isPremium) boostScore += 2;
  if (u1.idVerified && u2.idVerified) boostScore += 1;

  // ── Normalize: maxRaw ≈ 65 + 20 + 12 (collab) + 10 + 10 = 117 → /100 ────

  const rawScore =
    goalsScore + interestsScore + valuesScore + locationScore + lifestyleScore +
    behavioralScore + collaborativeScore + socialScore + safetyPenalty + boostScore;

  const total = Math.min(1, Math.max(0.02, rawScore / 100));

  return {
    total,
    breakdown: {
      goals: goalsScore,
      interests: interestsScore,
      values: valuesScore,
      location: locationScore,
      lifestyle: lifestyleScore,
      behavioral: behavioralScore,
      social: socialScore,
      safety: safetyPenalty,
      boost: boostScore,
    },
  };
}

export async function getCompatibilityScore(userId1: string, userId2: string): Promise<number> {
  const { total } = await getCompatibilityBreakdown(userId1, userId2);
  return total;
}

// ── Diversity interleaving for feed assembly ─────────────────────────────────
// Prevents more than 3 consecutive profiles with the same company or major.
// Assumes input is already sorted by score descending within the bucket.

type ScoredCandidate = {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  bio: string | null;
  headline: string | null;
  currentRole: string | null;
  company: string | null;
  locationLabel: string | null;
  workLocation: string | null;
  futureLocation: string | null;
  profilePhotoUrl: string | null;
  major: string | null;
  gpa: number | null;
  sat: number | null;
  act: number | null;
  interests: string[] | null;
  values: unknown;
  relationshipGoal: string | null;
  collegeId: string | null;
  idVerified: boolean;
  createdAt: Date;
  matchScore: number;
  connectionDegree: 2 | 3 | null;
};

function diversityInterleave(profiles: ScoredCandidate[]): ScoredCandidate[] {
  const result: ScoredCandidate[] = [];
  const remaining = [...profiles];

  while (remaining.length > 0) {
    const lastThree = result.slice(-3);
    const lastThreeCompanies = lastThree.map(p => p.company).filter(Boolean);
    const lastThreeMajors = lastThree.map(p => p.major).filter(Boolean);

    // Try to find the next highest-scoring candidate that breaks the streak
    let pickedIndex = -1;
    for (let i = 0; i < remaining.length; i++) {
      const candidate = remaining[i];
      const companyStreak =
        lastThreeCompanies.length === 3 &&
        candidate.company &&
        lastThreeCompanies.every(c => c === candidate.company);
      const majorStreak =
        lastThreeMajors.length === 3 &&
        candidate.major &&
        lastThreeMajors.every(m => m === candidate.major);

      if (!companyStreak && !majorStreak) {
        pickedIndex = i;
        break;
      }
    }

    // If every remaining profile would extend the streak, just take the first
    if (pickedIndex === -1) pickedIndex = 0;

    result.push(remaining[pickedIndex]);
    remaining.splice(pickedIndex, 1);
  }

  return result;
}

export async function getDiscoverFeed(userId: string) {
  // Batch all prerequisite queries into one round-trip
  const [currentUserResult, existingMatchRows, passRows] = await Promise.all([
    db.select({ collegeId: users.collegeId }).from(users).where(eq(users.id, userId)).limit(1),
    db
      .select({ userId1: matches.userId1, userId2: matches.userId2, status: matches.status })
      .from(matches)
      .where(or(eq(matches.userId1, userId), eq(matches.userId2, userId))),
    db
      .select({ passedUserId: userPasses.passedUserId })
      .from(userPasses)
      .where(eq(userPasses.userId, userId)),
  ]);

  const [currentUser] = currentUserResult;
  if (!currentUser) throw new AppError('User not found.', 404, 'NOT_FOUND');

  // Build exclusion set: self, already-interacted users, and passed users
  const excludedIds = new Set<string>([userId]);
  const incomingLikeIds = new Set<string>();
  const firstDegreeIds = new Set<string>();

  for (const match of existingMatchRows) {
    if (match.status === 'MATCHED' || match.status === 'UNMATCHED') {
      excludedIds.add(match.userId1);
      excludedIds.add(match.userId2);
      // Track 1st-degree connections for network degree computation
      if (match.status === 'MATCHED') {
        firstDegreeIds.add(match.userId1 === userId ? match.userId2 : match.userId1);
      }
      continue;
    }
    if (match.userId1 === userId) {
      // Current user already liked them
      excludedIds.add(match.userId2);
      continue;
    }
    if (match.userId2 === userId && match.status === 'LIKED') {
      // They liked us first — surface as incoming
      incomingLikeIds.add(match.userId1);
    }
  }

  for (const pass of passRows) {
    excludedIds.add(pass.passedUserId);
  }

  // ── Network degree computation (LinkedIn-style 2nd / 3rd degree) ──────────
  // 2nd degree: connected to someone I'm connected to
  // 3rd degree: connected to a 2nd-degree connection
  const secondDegreeIds = new Set<string>();
  const thirdDegreeIds = new Set<string>();

  if (firstDegreeIds.size > 0) {
    const firstDegreeArr = [...firstDegreeIds];
    const secondDegreeRows = await db
      .select({ u1: matches.userId1, u2: matches.userId2 })
      .from(matches)
      .where(
        and(
          or(
            inArray(matches.userId1, firstDegreeArr),
            inArray(matches.userId2, firstDegreeArr)
          ),
          eq(matches.status, 'MATCHED')
        )
      );

    for (const row of secondDegreeRows) {
      const other = firstDegreeIds.has(row.u1) ? row.u2 : row.u1;
      if (other !== userId && !firstDegreeIds.has(other)) {
        secondDegreeIds.add(other);
      }
    }

    // 3rd degree hop (only when 2nd-degree set is small to avoid explosion)
    if (secondDegreeIds.size > 0 && secondDegreeIds.size <= 100) {
      const secondDegreeArr = [...secondDegreeIds];
      const thirdDegreeRows = await db
        .select({ u1: matches.userId1, u2: matches.userId2 })
        .from(matches)
        .where(
          and(
            or(
              inArray(matches.userId1, secondDegreeArr),
              inArray(matches.userId2, secondDegreeArr)
            ),
            eq(matches.status, 'MATCHED')
          )
        );

      for (const row of thirdDegreeRows) {
        const other = secondDegreeIds.has(row.u1) ? row.u2 : row.u1;
        if (other !== userId && !firstDegreeIds.has(other) && !secondDegreeIds.has(other)) {
          thirdDegreeIds.add(other);
        }
      }
    }
  }

  const candidates = await db
    .select(safeUserFields)
    .from(users)
    .where(and(eq(users.verified, true), not(inArray(users.id, Array.from(excludedIds)))));

  // Fetch algorithm signals for all candidates in one query (no N+1)
  const candidateIds = candidates.map(c => c.id);
  const signalsRows = candidateIds.length > 0
    ? await db
        .select()
        .from(algorithmSignals)
        .where(inArray(algorithmSignals.userId, candidateIds))
    : [];
  const signalsMap = new Map(signalsRows.map(s => [s.userId, s]));

  // Score all non-incoming candidates in parallel
  const nonIncomingCandidates = candidates.filter(c => !incomingLikeIds.has(c.id));
  const incomingCandidates = candidates.filter(c => incomingLikeIds.has(c.id));

  const scoreCandidate = async (candidate: typeof candidates[number]): Promise<ScoredCandidate> => {
    const signals = signalsMap.get(candidate.id);

    // Activity recency penalty before scoring (applied as a score delta post-normalization)
    let recencyDelta = 0;
    if (signals) {
      if (!signals.lastActiveAt) {
        recencyDelta = -0.05;
      } else {
        const daysSinceActive = (Date.now() - signals.lastActiveAt.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceActive > 30) recencyDelta = -0.05;
      }
    }

    // New user boost (pre-bucketing)
    let newUserBoost = 0;
    const daysSinceJoined = (Date.now() - candidate.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceJoined <= 7) newUserBoost = 0.06;

    const baseScore = await getCompatibilityScore(userId, candidate.id);
    const adjustedScore = Math.min(1, Math.max(0.02, baseScore + newUserBoost + recencyDelta));

    const connectionDegree: 2 | 3 | null = secondDegreeIds.has(candidate.id)
      ? 2
      : thirdDegreeIds.has(candidate.id)
      ? 3
      : null;

    return { ...candidate, matchScore: adjustedScore, connectionDegree };
  };

  const [scoredIncoming, scoredCandidates] = await Promise.all([
    Promise.all(incomingCandidates.map(scoreCandidate)),
    Promise.all(nonIncomingCandidates.map(scoreCandidate)),
  ]);

  // Sort incoming by score descending (with small jitter to avoid static ordering)
  scoredIncoming.sort((a, b) => (b.matchScore - a.matchScore) + (Math.random() * 0.1 - 0.05));

  // Bucket non-incoming candidates
  const topPicks: ScoredCandidate[] = [];
  const goodPicks: ScoredCandidate[] = [];
  const discoveries: ScoredCandidate[] = [];

  for (const candidate of scoredCandidates) {
    if (candidate.matchScore >= 0.65) topPicks.push(candidate);
    else if (candidate.matchScore >= 0.40) goodPicks.push(candidate);
    else discoveries.push(candidate);
  }

  // Sort each bucket by score descending with jitter
  const sortBucket = (bucket: ScoredCandidate[]) =>
    bucket.sort((a, b) => (b.matchScore - a.matchScore) + (Math.random() * 0.1 - 0.05));

  sortBucket(topPicks);
  sortBucket(goodPicks);
  sortBucket(discoveries);

  // Apply diversity interleaving within each bucket, then assemble
  const orderedFeed = diversityInterleave([
    ...topPicks,
    ...goodPicks,
    ...discoveries,
  ]);

  // Incoming likes always surface first, then the ranked/diversified feed
  const feed = [...scoredIncoming, ...orderedFeed].slice(0, 24);

  const collegeMap = await getCollegeMap(feed.map(p => p.collegeId));

  return feed.map(profile => ({
    ...profile,
    college: profile.collegeId ? collegeMap.get(profile.collegeId) ?? null : null,
  }));
}

export async function getNearbyProfiles(userId: string, radiusMiles = 100) {
  const [viewer] = await db
    .select({
      id: users.id,
      latitude: users.latitude,
      longitude: users.longitude,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!viewer) throw new AppError('User not found.', 404, 'NOT_FOUND');
  if (viewer.latitude == null || viewer.longitude == null) {
    throw new AppError('Share your location to unlock the nearby map.', 400, 'LOCATION_REQUIRED');
  }

  const existingMatches = await db
    .select({ userId1: matches.userId1, userId2: matches.userId2 })
    .from(matches)
    .where(or(eq(matches.userId1, userId), eq(matches.userId2, userId)));

  const excludedIds = new Set<string>([userId]);
  for (const match of existingMatches) {
    excludedIds.add(match.userId1 === userId ? match.userId2 : match.userId1);
  }

  const candidates = await db
    .select(nearbyUserFields)
    .from(users)
    .where(and(eq(users.verified, true), not(inArray(users.id, Array.from(excludedIds)))));

  const nearbyProfiles = candidates
    .filter((profile) => profile.latitude != null && profile.longitude != null)
    .map((profile) => {
      const distanceMiles = getDistanceMiles(
        viewer.latitude!,
        viewer.longitude!,
        profile.latitude!,
        profile.longitude!
      );
      return {
        ...profile,
        distanceMiles: Math.round(distanceMiles * 10) / 10,
      };
    })
    .filter((profile) => profile.distanceMiles <= radiusMiles)
    .sort((a, b) => a.distanceMiles - b.distanceMiles)
    .slice(0, 24);

  const collegeMap = await getCollegeMap(nearbyProfiles.map((profile) => profile.collegeId));

  return nearbyProfiles.map((profile) => ({
    ...profile,
    college: profile.collegeId ? collegeMap.get(profile.collegeId) ?? null : null,
  }));
}

export async function likeUser(fromUserId: string, toUserId: string, introMessage?: string) {
  if (fromUserId === toUserId) {
    throw new AppError('You cannot like yourself.', 400, 'INVALID_ACTION');
  }

  const [targetUser] = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(eq(users.id, toUserId))
    .limit(1);

  if (!targetUser) {
    throw new AppError('Profile not found.', 404, 'NOT_FOUND');
  }

  const [existingReverseLike] = await db
    .select()
    .from(matches)
    .where(
      and(
        eq(matches.userId1, toUserId),
        eq(matches.userId2, fromUserId),
        eq(matches.status, 'LIKED')
      )
    )
    .limit(1);

  if (existingReverseLike) {
    const score = await getCompatibilityScore(fromUserId, toUserId);
    const [updatedMatch] = await db
      .update(matches)
      .set({
        status: 'MATCHED',
        matchScore: score,
        updatedAt: new Date(),
        ...(existingReverseLike.introMessage
          ? {
              introMessage: existingReverseLike.introMessage,
              introMessageSenderId: existingReverseLike.introMessageSenderId,
            }
          : buildIntroFields(introMessage, fromUserId)),
      })
      .where(eq(matches.id, existingReverseLike.id))
      .returning();

    return { matched: true, match: updatedMatch };
  }

  const [alreadyLiked] = await db
    .select()
    .from(matches)
    .where(and(eq(matches.userId1, fromUserId), eq(matches.userId2, toUserId)))
    .limit(1);

  if (alreadyLiked) {
    return { matched: alreadyLiked.status === 'MATCHED', match: alreadyLiked };
  }

  if (targetUser.email.endsWith(BOT_EMAIL_DOMAIN)) {
    const score = await getCompatibilityScore(fromUserId, toUserId);
    const [botMatch] = await db
      .insert(matches)
      .values({
        userId1: fromUserId,
        userId2: toUserId,
        status: 'MATCHED',
        matchScore: score,
        ...buildIntroFields(introMessage, fromUserId),
      })
      .returning();

    return {
      matched: true,
      match: botMatch,
      botAutoReplyUserId: toUserId,
      botAutoReplyIntro: introMessage?.trim() || undefined,
    };
  }

  const [newLike] = await db
    .insert(matches)
    .values({
      userId1: fromUserId,
      userId2: toUserId,
      status: 'LIKED',
      ...buildIntroFields(introMessage, fromUserId),
    })
    .returning();

  return { matched: false, match: newLike };
}

export async function getMatches(userId: string) {
  const userMatches = await db
    .select({
      id: matches.id,
      userId1: matches.userId1,
      userId2: matches.userId2,
      createdAt: matches.createdAt,
      introMessage: matches.introMessage,
      introMessageSenderId: matches.introMessageSenderId,
      matchScore: matches.matchScore,
    })
    .from(matches)
    .where(
      and(
        or(eq(matches.userId1, userId), eq(matches.userId2, userId)),
        eq(matches.status, 'MATCHED')
      )
    );

  if (userMatches.length === 0) return [];

  const otherUserIds = userMatches.map((match) =>
    match.userId1 === userId ? match.userId2 : match.userId1
  );
  const matchIds = userMatches.map((match) => match.id);

  const [profiles, lastMessages] = await Promise.all([
    db.select(safeUserFields).from(users).where(inArray(users.id, otherUserIds)),
    db
      .select({
        id: messages.id,
        matchId: messages.matchId,
        senderUserId: messages.senderUserId,
        content: messages.content,
        messageType: messages.messageType,
        mediaUrl: messages.mediaUrl,
        read: messages.read,
        createdAt: messages.createdAt,
      })
      .from(messages)
      .where(inArray(messages.matchId, matchIds))
      .orderBy(desc(messages.createdAt)),
  ]);

  const profileMap = new Map(profiles.map((profile) => [profile.id, profile]));
  const lastMessageMap = new Map<string, typeof lastMessages[number]>();
  for (const message of lastMessages) {
    if (!lastMessageMap.has(message.matchId)) {
      lastMessageMap.set(message.matchId, message);
    }
  }

  const collegeMap = await getCollegeMap(profiles.map((profile) => profile.collegeId));

  return userMatches.map((match) => {
    const otherUserId = match.userId1 === userId ? match.userId2 : match.userId1;
    const profile = profileMap.get(otherUserId);
    const lastMessage = lastMessageMap.get(match.id);

    return {
      id: match.id,
      createdAt: match.createdAt,
      introMessage: match.introMessage,
      introMessageSenderId: match.introMessageSenderId,
      matchScore: match.matchScore,
      matchedUser: profile
        ? {
            ...profile,
            college: profile.collegeId ? collegeMap.get(profile.collegeId) ?? null : null,
          }
        : null,
      lastMessage: lastMessage
        ? {
            id: lastMessage.id,
            matchId: lastMessage.matchId,
            senderId: lastMessage.senderUserId,
            content: lastMessage.content,
            messageType: lastMessage.messageType,
            mediaUrl: lastMessage.mediaUrl ?? null,
            read: lastMessage.read,
            createdAt: lastMessage.createdAt,
          }
        : undefined,
    };
  });
}

export async function getSingleMatch(matchId: string, userId: string) {
  const [match] = await db
    .select({
      id: matches.id,
      userId1: matches.userId1,
      userId2: matches.userId2,
      createdAt: matches.createdAt,
      introMessage: matches.introMessage,
      introMessageSenderId: matches.introMessageSenderId,
      matchScore: matches.matchScore,
    })
    .from(matches)
    .where(
      and(
        eq(matches.id, matchId),
        or(eq(matches.userId1, userId), eq(matches.userId2, userId)),
        eq(matches.status, 'MATCHED')
      )
    )
    .limit(1);

  if (!match) throw new AppError('Match not found.', 404, 'NOT_FOUND');

  const otherUserId = match.userId1 === userId ? match.userId2 : match.userId1;
  const [profile] = await db
    .select(safeUserFields)
    .from(users)
    .where(eq(users.id, otherUserId))
    .limit(1);

  const collegeMap = await getCollegeMap([profile?.collegeId ?? null]);

  return {
    id: match.id,
    createdAt: match.createdAt,
    introMessage: match.introMessage,
    introMessageSenderId: match.introMessageSenderId,
    matchScore: match.matchScore,
    matchedUser: profile
      ? {
          ...profile,
          college: profile.collegeId ? collegeMap.get(profile.collegeId) ?? null : null,
        }
      : null,
  };
}

export async function unmatch(matchId: string, userId: string) {
  const [match] = await db.select().from(matches).where(eq(matches.id, matchId)).limit(1);

  if (!match) throw new AppError('Match not found.', 404, 'NOT_FOUND');
  if (match.userId1 !== userId && match.userId2 !== userId) {
    throw new AppError('You are not part of this match.', 403, 'FORBIDDEN');
  }

  const [updated] = await db
    .update(matches)
    .set({ status: 'UNMATCHED', updatedAt: new Date() })
    .where(eq(matches.id, matchId))
    .returning();

  return updated;
}


// GET /api/connections/requests — users who liked the current user (pending, not yet mutual)
export async function getPendingRequests(userId: string) {
  const rows = await db
    .select({
      matchId: matches.id,
      userId: matches.userId1,
      introMessage: matches.introMessage,
      matchScore: matches.matchScore,
      createdAt: matches.createdAt,
      firstName: users.firstName,
      lastName: users.lastName,
      age: users.age,
      bio: users.bio,
      major: users.major,
      gpa: users.gpa,
      profilePhotoUrl: users.profilePhotoUrl,
      idVerified: users.idVerified,
      collegeId: users.collegeId,
    })
    .from(matches)
    .innerJoin(users, eq(users.id, matches.userId1))
    .where(
      and(
        eq(matches.userId2, userId),
        eq(matches.status, 'LIKED')
      )
    )
    .orderBy(desc(matches.createdAt))
    .limit(50);

  // Attach college data
  const collegeIds = [...new Set(rows.map((r) => r.collegeId).filter(Boolean))] as string[];
  let collegeMap = new Map<string, { id: string; name: string; tier: string }>();
  if (collegeIds.length > 0) {
    const collegeRows = await db
      .select({ id: colleges.id, name: colleges.name, tier: colleges.tier })
      .from(colleges)
      .where(inArray(colleges.id, collegeIds));
    collegeMap = new Map(collegeRows.map((c) => [c.id, c]));
  }

  return rows.map((r) => ({
    matchId: r.matchId,
    introMessage: r.introMessage,
    matchScore: r.matchScore,
    createdAt: r.createdAt,
    user: {
      id: r.userId,
      firstName: r.firstName,
      lastName: r.lastName,
      age: r.age,
      bio: r.bio,
      major: r.major,
      gpa: r.gpa,
      profilePhotoUrl: r.profilePhotoUrl,
      idVerified: r.idVerified,
      college: r.collegeId ? (collegeMap.get(r.collegeId) ?? null) : null,
    },
  }));
}

// GET /api/connections/sent — likes the current user has sent that haven't been matched back
export async function getSentRequests(userId: string) {
  const rows = await db
    .select({
      matchId: matches.id,
      userId: matches.userId2,
      introMessage: matches.introMessage,
      matchScore: matches.matchScore,
      createdAt: matches.createdAt,
      firstName: users.firstName,
      lastName: users.lastName,
      age: users.age,
      bio: users.bio,
      major: users.major,
      gpa: users.gpa,
      profilePhotoUrl: users.profilePhotoUrl,
      idVerified: users.idVerified,
      collegeId: users.collegeId,
    })
    .from(matches)
    .innerJoin(users, eq(users.id, matches.userId2))
    .where(
      and(
        eq(matches.userId1, userId),
        eq(matches.status, 'LIKED')
      )
    )
    .orderBy(desc(matches.createdAt))
    .limit(50);

  // Attach college data — same pattern as getPendingRequests
  const collegeIds = [...new Set(rows.map((r) => r.collegeId).filter(Boolean))] as string[];
  let collegeMap = new Map<string, { id: string; name: string; tier: string }>();
  if (collegeIds.length > 0) {
    const collegeRows = await db
      .select({ id: colleges.id, name: colleges.name, tier: colleges.tier })
      .from(colleges)
      .where(inArray(colleges.id, collegeIds));
    collegeMap = new Map(collegeRows.map((c) => [c.id, c]));
  }

  return rows.map((r) => ({
    matchId: r.matchId,
    introMessage: r.introMessage,
    matchScore: r.matchScore,
    createdAt: r.createdAt,
    user: {
      id: r.userId,
      firstName: r.firstName,
      lastName: r.lastName,
      age: r.age,
      bio: r.bio,
      major: r.major,
      gpa: r.gpa,
      profilePhotoUrl: r.profilePhotoUrl,
      idVerified: r.idVerified,
      college: r.collegeId ? (collegeMap.get(r.collegeId) ?? null) : null,
    },
  }));
}

// POST /api/matches/:matchId/we-met — mark that user met their match in real life
export async function confirmWeMet(matchId: string, userId: string) {
  const [match] = await db
    .select()
    .from(matches)
    .where(and(eq(matches.id, matchId), eq(matches.status, 'MATCHED')))
    .limit(1);

  if (!match) throw new AppError('Match not found.', 404, 'NOT_FOUND');
  if (match.userId1 !== userId && match.userId2 !== userId) {
    throw new AppError('You are not part of this match.', 403, 'FORBIDDEN');
  }

  const isUser1 = match.userId1 === userId;
  const updatePayload = isUser1
    ? { weMetUser1: true }
    : { weMetUser2: true };

  const [updated] = await db
    .update(matches)
    .set(updatePayload)
    .where(eq(matches.id, matchId))
    .returning();

  const bothConfirmed = updated.weMetUser1 && updated.weMetUser2;
  if (bothConfirmed && !updated.weMetAt) {
    await db
      .update(matches)
      .set({ weMetAt: new Date() })
      .where(eq(matches.id, matchId));
  }

  return {
    myConfirmation: true,
    otherConfirmed: isUser1 ? updated.weMetUser2 : updated.weMetUser1,
    bothConfirmed,
  };
}

// POST /api/connections/:userId/pass — record a pass and suppress the profile from future feeds
export async function passUser(fromUserId: string, toUserId: string) {
  if (fromUserId === toUserId) {
    throw new AppError('You cannot pass on yourself.', 400, 'INVALID_ACTION');
  }

  // Insert pass record, ignore if already passed (idempotent)
  await db
    .insert(userPasses)
    .values({ userId: fromUserId, passedUserId: toUserId })
    .onConflictDoNothing();

  // Upsert algorithm signals: increment passReceivedCount for the passed user
  await db
    .insert(algorithmSignals)
    .values({ userId: toUserId, passReceivedCount: 1, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: algorithmSignals.userId,
      set: {
        passReceivedCount: sql`${algorithmSignals.passReceivedCount} + 1`,
        updatedAt: new Date(),
      },
    });

  return { passed: true };
}

// POST /api/connections/:matchId/report — report a user for safety review
export async function reportUser(
  reporterId: string,
  reportedUserId: string,
  reason: string,
  notes?: string
) {
  if (reporterId === reportedUserId) {
    throw new AppError('You cannot report yourself.', 400, 'INVALID_ACTION');
  }

  const [report] = await db
    .insert(userReports)
    .values({ reporterId, reportedUserId, reason, notes: notes ?? null })
    .returning();

  // Upsert algorithm signals: increment reportReceivedCount for the reported user
  await db
    .insert(algorithmSignals)
    .values({ userId: reportedUserId, reportReceivedCount: 1, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: algorithmSignals.userId,
      set: {
        reportReceivedCount: sql`${algorithmSignals.reportReceivedCount} + 1`,
        updatedAt: new Date(),
      },
    });

  return report;
}
