import { and, eq, gte, ilike, inArray, lte, ne, notInArray, or } from 'drizzle-orm';
import { db } from '../lib/db';
import { colleges, matches, users } from '../db/schema';

const COLLEGE_NAMES = [
  'princeton',
  'harvard',
  'yale',
  'stanford',
  'mit',
  'upenn',
  'caltech',
  'northwestern',
  'duke',
  'chicago',
  'johns hopkins',
  'columbia',
  'carnegie mellon',
  'rice',
  'dartmouth',
  'vanderbilt',
  'cornell',
  'brown',
  'notre dame',
  'ucla',
  'usc',
  'berkeley',
  'michigan',
  'nyu',
  'georgia tech',
  'ut austin',
  'illinois',
  'case western',
  'emory',
  'boston college',
  'wake forest',
  'tufts',
  'boston university',
  'rochester',
  'tulane',
  'northeastern',
  'wisconsin',
  'washington',
  'purdue',
  'florida',
];

const GOAL_MAP: Record<string, string> = {
  marriage: 'MARRIAGE',
  marry: 'MARRIAGE',
  'long-term': 'LONGTERM',
  longterm: 'LONGTERM',
  serious: 'LONGTERM',
  relationship: 'LONGTERM',
  casual: 'CASUAL',
  exploring: 'EXPLORING',
};

const INTEREST_KEYWORDS = [
  'reading',
  'fitness',
  'travel',
  'music',
  'art',
  'cooking',
  'gaming',
  'hiking',
  'photography',
  'film',
  'startups',
  'finance',
  'sports',
  'yoga',
  'volunteering',
  'fashion',
  'science',
  'politics',
  'philosophy',
  'languages',
];

const MAJOR_KEYWORDS = [
  'pre-med',
  'premed',
  'cs',
  'computer science',
  'data science',
  'economics',
  'finance',
  'law',
  'engineering',
  'psychology',
  'biology',
  'math',
  'business',
  'english',
  'history',
  'philosophy',
  'political science',
  'neuroscience',
  'chemistry',
  'marketing',
  'design',
];

const SEARCH_STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'at',
  'already',
  'around',
  'based',
  'but',
  'for',
  'from',
  'guy',
  'girl',
  'her',
  'him',
  'in',
  'into',
  'job',
  'jobs',
  'lives',
  'living',
  'looking',
  'man',
  'match',
  'matches',
  'move',
  'moving',
  'near',
  'or',
  'people',
  'person',
  'relocating',
  'someone',
  'that',
  'the',
  'their',
  'there',
  'to',
  'verified',
  'want',
  'wants',
  'where',
  'who',
  'with',
  'woman',
  'work',
  'working',
]);

interface SearchFilters {
  collegeName?: string;
  major?: string;
  interests?: string[];
  relationshipGoal?: string;
  minGpa?: number;
  maxGpa?: number;
  minSat?: number;
  maxSat?: number;
  minAct?: number;
  maxAct?: number;
  minAge?: number;
  maxAge?: number;
  currentLocation?: string;
  workLocation?: string;
  futureLocation?: string;
  verifiedOnly?: boolean;
  searchTerms?: string[];
}

function haversineMiles(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const earthRadiusMiles = 3958.8;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusMiles * c;
}

async function getInteractedIds(currentUserId: string) {
  const interacted = await db
    .select({ userId1: matches.userId1, userId2: matches.userId2 })
    .from(matches)
    .where(or(eq(matches.userId1, currentUserId), eq(matches.userId2, currentUserId)));

  return [
    currentUserId,
    ...interacted.map((match) => (match.userId1 === currentUserId ? match.userId2 : match.userId1)),
  ];
}

function cleanPhrase(value: string) {
  return value
    .split(
      /\b(?:who|with|for|and|or|that|but|already|looking|want|wants|seeking|living|lives|moving|relocating|work|working|job|jobs|near)\b/i
    )[0]
    .replace(/[.,]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractPhrase(query: string, patterns: RegExp[]) {
  for (const pattern of patterns) {
    const match = query.match(pattern);
    if (!match?.[1]) continue;
    const cleaned = cleanPhrase(match[1]);
    if (cleaned.length >= 2) return cleaned;
  }
  return undefined;
}

function extractSearchTerms(query: string) {
  return query
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .map((term) => term.trim())
    .filter((term) => term.length >= 3 && !SEARCH_STOP_WORDS.has(term));
}

function parseQuery(query: string): SearchFilters {
  const q = query.toLowerCase();
  const filters: SearchFilters = {
    searchTerms: extractSearchTerms(query),
  };

  for (const college of COLLEGE_NAMES) {
    if (q.includes(college)) {
      filters.collegeName = college;
      break;
    }
  }

  for (const [keyword, goal] of Object.entries(GOAL_MAP)) {
    if (q.includes(keyword)) {
      filters.relationshipGoal = goal;
      break;
    }
  }

  const foundInterests: string[] = [];
  for (const interest of INTEREST_KEYWORDS) {
    if (q.includes(interest)) {
      foundInterests.push(interest.charAt(0).toUpperCase() + interest.slice(1));
    }
  }
  if (foundInterests.length > 0) filters.interests = foundInterests;

  const gpaAbove = q.match(/gpa\s+(?:above|over|>=?|at\s+least)?\s*(\d+\.?\d*)/);
  const gpaBelow = q.match(/gpa\s+(?:below|under|<=?|at\s+most)?\s*(\d+\.?\d*)/);
  if (gpaAbove) filters.minGpa = parseFloat(gpaAbove[1]);
  if (gpaBelow) filters.maxGpa = parseFloat(gpaBelow[1]);

  const satAbove =
    q.match(/sat\s*(?:above|over|>=?|at\s+least)\s*(\d{3,4})/) ?? q.match(/sat\s*(\d{3,4})\+/);
  const satBelow = q.match(/sat\s*(?:below|under|<=?|at\s+most)\s*(\d{3,4})/);
  const satExact = q.match(/sat\s*(\d{3,4})(?!\s*\+)/);
  if (satAbove) filters.minSat = parseInt(satAbove[1], 10);
  if (satBelow) filters.maxSat = parseInt(satBelow[1], 10);
  if (satExact && filters.minSat === undefined && filters.maxSat === undefined) {
    const satScore = parseInt(satExact[1], 10);
    filters.minSat = satScore;
    filters.maxSat = satScore;
  }

  const actAbove =
    q.match(/act\s*(?:above|over|>=?|at\s+least)\s*(\d{1,2})/) ?? q.match(/act\s*(\d{1,2})\+/);
  const actBelow = q.match(/act\s*(?:below|under|<=?|at\s+most)\s*(\d{1,2})/);
  const actExact = q.match(/act\s*(\d{1,2})(?!\s*\+)/);
  if (actAbove) filters.minAct = parseInt(actAbove[1], 10);
  if (actBelow) filters.maxAct = parseInt(actBelow[1], 10);
  if (actExact && filters.minAct === undefined && filters.maxAct === undefined) {
    const actScore = parseInt(actExact[1], 10);
    filters.minAct = actScore;
    filters.maxAct = actScore;
  }

  const ageRange = q.match(/(\d{2})\s*[-–]\s*(\d{2})/);
  const ageUnder = q.match(/under\s+(\d{2})/);
  const ageOver = q.match(/over\s+(\d{2})/);
  if (ageRange) {
    filters.minAge = parseInt(ageRange[1], 10);
    filters.maxAge = parseInt(ageRange[2], 10);
  }
  if (ageUnder) filters.maxAge = parseInt(ageUnder[1], 10);
  if (ageOver) filters.minAge = parseInt(ageOver[1], 10);

  for (const major of MAJOR_KEYWORDS) {
    if (q.includes(major)) {
      filters.major = major === 'cs' ? 'computer science' : major;
      break;
    }
  }

  filters.currentLocation = extractPhrase(q, [
    /based\s+in\s+([a-z0-9 .,-]+)/,
    /lives?\s+in\s+([a-z0-9 .,-]+)/,
    /living\s+in\s+([a-z0-9 .,-]+)/,
    /from\s+([a-z0-9 .,-]+)/,
    /\bin\s+([a-z0-9 .,-]+)/,
  ]);

  filters.workLocation = extractPhrase(q, [
    /working\s+in\s+([a-z0-9 .,-]+)/,
    /works?\s+in\s+([a-z0-9 .,-]+)/,
    /job\s+in\s+([a-z0-9 .,-]+)/,
    /job\s+lined\s+up\s+in\s+([a-z0-9 .,-]+)/,
    /job\s+lined\s+up\s+at\s+([a-z0-9 .,-]+)/,
    /office\s+in\s+([a-z0-9 .,-]+)/,
  ]);

  filters.futureLocation = extractPhrase(q, [
    /moving\s+to\s+([a-z0-9 .,-]+)/,
    /relocating\s+to\s+([a-z0-9 .,-]+)/,
    /headed\s+to\s+([a-z0-9 .,-]+)/,
    /planning\s+to\s+move\s+to\s+([a-z0-9 .,-]+)/,
    /job\s+lined\s+up\s+in\s+([a-z0-9 .,-]+)/,
    /job\s+lined\s+up\s+at\s+([a-z0-9 .,-]+)/,
  ]);

  if (
    filters.collegeName &&
    [filters.currentLocation, filters.workLocation, filters.futureLocation].some(
      (location) => location?.toLowerCase() === filters.collegeName
    )
  ) {
    delete filters.collegeName;
  }

  if (q.includes('verified')) {
    filters.verifiedOnly = true;
  }

  return filters;
}

export async function searchProfiles(query: string, currentUserId: string) {
  if (!query || query.trim().length < 2) return { results: [], total: 0, filters: {} };

  const filters = parseQuery(query.trim());

  const interactedIds = await getInteractedIds(currentUserId);

  const conditions: any[] = [
    eq(users.verified, true),
    interactedIds.length > 1 ? notInArray(users.id, interactedIds) : ne(users.id, currentUserId),
  ];

  if (filters.collegeName) {
    const collegeResult = await db
      .select({ id: colleges.id })
      .from(colleges)
      .where(ilike(colleges.name, `%${filters.collegeName}%`))
      .limit(1);
    if (collegeResult.length > 0) {
      conditions.push(eq(users.collegeId, collegeResult[0].id));
    }
  }

  if (filters.major) {
    conditions.push(ilike(users.major, `%${filters.major}%`));
  }

  if (filters.relationshipGoal) {
    conditions.push(
      eq(
        users.relationshipGoal,
        filters.relationshipGoal as 'MARRIAGE' | 'LONGTERM' | 'CASUAL' | 'EXPLORING'
      )
    );
  }

  if (filters.minGpa !== undefined) conditions.push(gte(users.gpa, filters.minGpa));
  if (filters.maxGpa !== undefined) conditions.push(lte(users.gpa, filters.maxGpa));
  if (filters.minSat !== undefined) conditions.push(gte(users.sat, filters.minSat));
  if (filters.maxSat !== undefined) conditions.push(lte(users.sat, filters.maxSat));
  if (filters.minAct !== undefined) conditions.push(gte(users.act, filters.minAct));
  if (filters.maxAct !== undefined) conditions.push(lte(users.act, filters.maxAct));
  if (filters.minAge !== undefined) conditions.push(gte(users.age, filters.minAge));
  if (filters.maxAge !== undefined) conditions.push(lte(users.age, filters.maxAge));

  if (filters.currentLocation) {
    const currentLocationCondition = or(
      ilike(users.locationLabel, `%${filters.currentLocation}%`),
      ilike(users.workLocation, `%${filters.currentLocation}%`),
      ilike(users.futureLocation, `%${filters.currentLocation}%`)
    );
    if (currentLocationCondition) {
      conditions.push(currentLocationCondition);
    }
  }

  if (filters.workLocation) {
    conditions.push(ilike(users.workLocation, `%${filters.workLocation}%`));
  }

  if (filters.futureLocation) {
    const futureLocationCondition = or(
      ilike(users.futureLocation, `%${filters.futureLocation}%`),
      ilike(users.locationLabel, `%${filters.futureLocation}%`),
      ilike(users.workLocation, `%${filters.futureLocation}%`)
    );
    if (futureLocationCondition) {
      conditions.push(futureLocationCondition);
    }
  }

  if (filters.verifiedOnly) {
    conditions.push(eq(users.idVerified, true));
  }

  const hasStructuredFilters = Boolean(
    filters.collegeName ||
      filters.major ||
      filters.interests?.length ||
      filters.relationshipGoal ||
      filters.minGpa !== undefined ||
      filters.maxGpa !== undefined ||
      filters.minSat !== undefined ||
      filters.maxSat !== undefined ||
      filters.minAct !== undefined ||
      filters.maxAct !== undefined ||
      filters.minAge !== undefined ||
      filters.maxAge !== undefined ||
      filters.currentLocation ||
      filters.workLocation ||
      filters.futureLocation
  );

  if (!hasStructuredFilters && filters.searchTerms && filters.searchTerms.length > 0) {
    for (const term of filters.searchTerms) {
      const searchTermCondition = or(
        ilike(users.headline, `%${term}%`),
        ilike(users.bio, `%${term}%`),
        ilike(users.major, `%${term}%`),
        ilike(users.currentRole, `%${term}%`),
        ilike(users.company, `%${term}%`),
        ilike(users.locationLabel, `%${term}%`),
        ilike(users.workLocation, `%${term}%`),
        ilike(users.futureLocation, `%${term}%`)
      );
      if (searchTermCondition) {
        conditions.push(searchTermCondition);
      }
    }
  }

  const results = await db
    .select({
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
      relationshipGoal: users.relationshipGoal,
      collegeId: users.collegeId,
      idVerified: users.idVerified,
      socialLinks: users.socialLinks,
    })
    .from(users)
    .where(and(...conditions))
    .limit(20);

  let filtered = results;
  if (filters.interests && filters.interests.length > 0) {
    filtered = results.filter((user) => {
      if (!user.interests || user.interests.length === 0) return false;
      return filters.interests!.some((interest) =>
        user.interests!.some((userInterest) => userInterest.toLowerCase() === interest.toLowerCase())
      );
    });
  }

  const searchCollegeIds = [...new Set(filtered.map((user) => user.collegeId).filter(Boolean))] as string[];
  const searchColleges = searchCollegeIds.length
    ? await db
        .select({ id: colleges.id, name: colleges.name, state: colleges.state, tier: colleges.tier })
        .from(colleges)
        .where(inArray(colleges.id, searchCollegeIds))
    : [];
  const searchCollegeMap = new Map(searchColleges.map((college) => [college.id, college]));

  return {
    results: filtered.map((user) => ({
      ...user,
      college: user.collegeId ? searchCollegeMap.get(user.collegeId) ?? null : null,
    })),
    total: filtered.length,
    query: query.trim(),
    filters,
  };
}

export async function getNearbyProfiles(currentUserId: string, radiusMiles = 75) {
  const [currentUser] = await db
    .select({
      id: users.id,
      latitude: users.latitude,
      longitude: users.longitude,
    })
    .from(users)
    .where(eq(users.id, currentUserId))
    .limit(1);

  if (!currentUser) {
    return { results: [], total: 0, radiusMiles, origin: null };
  }

  if (currentUser.latitude == null || currentUser.longitude == null) {
    return { results: [], total: 0, radiusMiles, origin: null };
  }

  const interactedIds = await getInteractedIds(currentUserId);
  const candidates = await db
    .select({
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
      relationshipGoal: users.relationshipGoal,
      collegeId: users.collegeId,
      idVerified: users.idVerified,
      latitude: users.latitude,
      longitude: users.longitude,
    })
    .from(users)
    .where(
      and(
        eq(users.verified, true),
        interactedIds.length > 1 ? notInArray(users.id, interactedIds) : ne(users.id, currentUserId)
      )
    )
    .limit(100);

  const nearbyResults = candidates
    .filter((candidate) => candidate.latitude != null && candidate.longitude != null)
    .map((candidate) => ({
      ...candidate,
      distanceMiles: haversineMiles(
        currentUser.latitude!,
        currentUser.longitude!,
        candidate.latitude!,
        candidate.longitude!
      ),
    }))
    .filter((candidate) => candidate.distanceMiles <= radiusMiles)
    .sort((a, b) => a.distanceMiles - b.distanceMiles)
    .slice(0, 24);

  const collegeIds = [...new Set(nearbyResults.map((candidate) => candidate.collegeId).filter(Boolean))] as string[];
  const nearbyColleges = collegeIds.length
    ? await db
        .select({ id: colleges.id, name: colleges.name, state: colleges.state, tier: colleges.tier })
        .from(colleges)
        .where(inArray(colleges.id, collegeIds))
    : [];
  const collegeMap = new Map(nearbyColleges.map((college) => [college.id, college]));

  return {
    results: nearbyResults.map((candidate) => ({
      ...candidate,
      college: candidate.collegeId ? collegeMap.get(candidate.collegeId) ?? null : null,
    })),
    total: nearbyResults.length,
    radiusMiles,
    origin: {
      latitude: currentUser.latitude,
      longitude: currentUser.longitude,
    },
  };
}
