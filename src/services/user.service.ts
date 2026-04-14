import { and, asc, desc, eq, ilike, notInArray, or, sql } from 'drizzle-orm';
import { db } from '../lib/db';
import { users, colleges, matches, posts, profileViews, experiences, education, fraudAlerts, messages } from '../db/schema';
import { AppError } from '../middleware/error.middleware';

// Columns returned for the authenticated user's own profile — never includes passwordHash
const SAFE_USER_COLUMNS = {
  id: users.id,
  email: users.email,
  firstName: users.firstName,
  lastName: users.lastName,
  age: users.age,
  dateOfBirth: users.dateOfBirth,
  gender: users.gender,
  bio: users.bio,
  headline: users.headline,
  currentRole: users.currentRole,
  company: users.company,
  locationLabel: users.locationLabel,
  workLocation: users.workLocation,
  futureLocation: users.futureLocation,
  major: users.major,
  gpa: users.gpa,
  sat: users.sat,
  act: users.act,
  religion: users.religion,
  sexuality: users.sexuality,
  ethnicity: users.ethnicity,
  birthCity: users.birthCity,
  height: users.height,
  drinking: users.drinking,
  smoking: users.smoking,
  cannabis: users.cannabis,
  wantsKids: users.wantsKids,
  politicalViews: users.politicalViews,
  isPremium: users.isPremium,
  relationshipGoal: users.relationshipGoal,
  interests: users.interests,
  values: users.values,
  collegeId: users.collegeId,
  profilePhotoUrl: users.profilePhotoUrl,
  // idPhotoUrl intentionally excluded — never returned in API responses after verification deletes it
  idVerified: users.idVerified,
  verified: users.verified,
  latitude: users.latitude,
  longitude: users.longitude,
  socialLinks: users.socialLinks,
  prompts: users.prompts,
  onboardingComplete: users.onboardingComplete,
  greekOrganization: users.greekOrganization,
  greekOrganizationType: users.greekOrganizationType,
  createdAt: users.createdAt,
} as const;

const PUBLIC_PROFILE_COLUMNS = {
  id: users.id,
  firstName: users.firstName,
  lastName: users.lastName,
  age: users.age,
  gender: users.gender,
  bio: users.bio,
  headline: users.headline,
  currentRole: users.currentRole,
  company: users.company,
  locationLabel: users.locationLabel,
  workLocation: users.workLocation,
  futureLocation: users.futureLocation,
  major: users.major,
  gpa: users.gpa,
  sat: users.sat,
  act: users.act,
  religion: users.religion,
  sexuality: users.sexuality,
  ethnicity: users.ethnicity,
  birthCity: users.birthCity,
  height: users.height,
  drinking: users.drinking,
  smoking: users.smoking,
  cannabis: users.cannabis,
  wantsKids: users.wantsKids,
  politicalViews: users.politicalViews,
  isPremium: users.isPremium,
  relationshipGoal: users.relationshipGoal,
  interests: users.interests,
  values: users.values,
  collegeId: users.collegeId,
  profilePhotoUrl: users.profilePhotoUrl,
  idVerified: users.idVerified,
  socialLinks: users.socialLinks,
  prompts: users.prompts,
  greekOrganization: users.greekOrganization,
  greekOrganizationType: users.greekOrganizationType,
  createdAt: users.createdAt,
} as const;

const POST_COLUMNS = {
  id: posts.id,
  userId: posts.userId,
  imageUrl: posts.imageUrl,
  caption: posts.caption,
  locationTag: posts.locationTag,
  createdAt: posts.createdAt,
} as const;

export interface SocialLinks {
  instagram?: string | null;
  twitter?: string | null;
  tiktok?: string | null;
  linkedin?: string | null;
}

export interface PromptEntry {
  question: string;
  answer: string;
  photoUrl?: string | null;
}

export interface UpdateProfileInput {
  bio?: string;
  headline?: string;
  currentRole?: string;
  company?: string;
  locationLabel?: string;
  workLocation?: string;
  futureLocation?: string;
  major?: string;
  gpa?: number;
  sat?: number;
  act?: number;
  relationshipGoal?: 'MARRIAGE' | 'LONGTERM' | 'CASUAL' | 'EXPLORING';
  interests?: string[];
  values?: string[];
  latitude?: number;
  longitude?: number;
  collegeId?: string | null;
  profilePhotoUrl?: string | null;
  idPhotoUrl?: string | null;
  socialLinks?: SocialLinks;
  prompts?: PromptEntry[];
  religion?: string;
  sexuality?: string;
  ethnicity?: string;
  birthCity?: string;
  height?: string;
  drinking?: string;
  smoking?: string;
  cannabis?: string;
  wantsKids?: string;
  politicalViews?: string;
  greekOrganization?: string;
  greekOrganizationType?: string;
  strengthStats?: {
    bench?: number;
    squat?: number;
    deadlift?: number;
    pullUps?: number;
    pushUps?: number;
    videoUrl?: string;
  } | null;
}

export interface OnboardingInput {
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: 'MAN' | 'WOMAN' | 'NON_BINARY' | 'PREFER_NOT_TO_SAY';
  bio?: string;
  headline?: string;
  currentRole?: string;
  company?: string;
  locationLabel?: string;
  workLocation?: string;
  futureLocation?: string;
  major?: string;
  gpa?: number;
  sat?: number;
  act?: number;
  interests?: string[];
  relationshipGoal?: 'MARRIAGE' | 'LONGTERM' | 'CASUAL' | 'EXPLORING';
  collegeId?: string | null;
  profilePhotoUrl?: string | null;
}

function computeAgeFromDob(dateOfBirth: string) {
  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

async function getCollege(collegeId: string | null) {
  if (!collegeId) return null;

  const [college] = await db
    .select({
      id: colleges.id,
      name: colleges.name,
      state: colleges.state,
      tier: colleges.tier,
      emailDomain: colleges.emailDomain,
    })
    .from(colleges)
    .where(eq(colleges.id, collegeId))
    .limit(1);

  return college ?? null;
}

async function getProfilePosts(userId: string) {
  return db
    .select(POST_COLUMNS)
    .from(posts)
    .where(eq(posts.userId, userId))
    .orderBy(desc(posts.createdAt));
}

async function getProfileStats(userId: string) {
  const [connectionRows, postRows] = await Promise.all([
    db
      .select({ id: matches.id })
      .from(matches)
      .where(
        and(
          eq(matches.status, 'MATCHED'),
          or(eq(matches.userId1, userId), eq(matches.userId2, userId))
        )
      ),
    db.select({ id: posts.id }).from(posts).where(eq(posts.userId, userId)),
  ]);

  return {
    connectionCount: connectionRows.length,
    postCount: postRows.length,
  };
}

async function getConnectionState(viewerId: string, profileUserId: string) {
  if (viewerId === profileUserId) return null;

  const [connection] = await db
    .select({
      id: matches.id,
      status: matches.status,
      introMessage: matches.introMessage,
      introMessageSenderId: matches.introMessageSenderId,
      matchScore: matches.matchScore,
      createdAt: matches.createdAt,
    })
    .from(matches)
    .where(
      or(
        and(eq(matches.userId1, viewerId), eq(matches.userId2, profileUserId)),
        and(eq(matches.userId1, profileUserId), eq(matches.userId2, viewerId))
      )
    )
    .limit(1);

  return connection ?? null;
}

async function buildProfileResponse<T extends { id: string; collegeId: string | null }>(
  viewerId: string | null,
  user: T
) {
  const [college, userPosts, stats, connection] = await Promise.all([
    getCollege(user.collegeId),
    getProfilePosts(user.id),
    getProfileStats(user.id),
    viewerId ? getConnectionState(viewerId, user.id) : Promise.resolve(null),
  ]);

  return {
    ...user,
    college,
    posts: userPosts,
    stats,
    connection,
  };
}

export async function getProfile(userId: string) {
  const [user] = await db
    .select(SAFE_USER_COLUMNS)
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) throw new AppError('User not found.', 404, 'NOT_FOUND');
  return buildProfileResponse(userId, user);
}

function stripHtml(text: string): string {
  return text.replace(/<[^>]*>/g, '').trim();
}

function sanitizeProfileInput(input: UpdateProfileInput): UpdateProfileInput {
  const sanitized = { ...input };
  if (sanitized.bio) sanitized.bio = stripHtml(sanitized.bio).slice(0, 500);
  if (sanitized.headline) sanitized.headline = stripHtml(sanitized.headline).slice(0, 120);
  if (sanitized.prompts) {
    sanitized.prompts = sanitized.prompts.slice(0, 5).map((p) => ({
      ...p,
      question: stripHtml(p.question).slice(0, 150),
      answer: stripHtml(p.answer).slice(0, 300),
    }));
  }
  return sanitized;
}

export async function updateProfile(userId: string, input: UpdateProfileInput) {
  const safe = sanitizeProfileInput(input);
  const [user] = await db
    .update(users)
    .set({ ...safe, updatedAt: new Date() })
    .where(eq(users.id, userId))
    .returning(SAFE_USER_COLUMNS);

  if (!user) throw new AppError('User not found.', 404, 'NOT_FOUND');
  return user;
}

export async function completeOnboarding(userId: string, input: OnboardingInput) {
  let computedAge: number | undefined;
  if (input.dateOfBirth) {
    computedAge = computeAgeFromDob(input.dateOfBirth);
    if (computedAge < 18) {
      throw new AppError('Apex is currently an 18+ app.', 400, 'AGE_RESTRICTED');
    }
  }

  const [user] = await db
    .update(users)
    .set({
      ...input,
      ...(computedAge !== undefined ? { age: computedAge } : {}),
      onboardingComplete: true,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning(SAFE_USER_COLUMNS);

  if (!user) throw new AppError('User not found.', 404, 'NOT_FOUND');
  return user;
}

// Accepts either a legacy ID photo URL or a video selfie URL as proof of identity.
// CRITICAL: After setting idVerified=true, IMMEDIATELY nulls out idPhotoUrl.
// Video URLs are never stored — they are discarded after this call.
// This ensures zero PII retention for compliance and legal protection.
export async function verifyIdentity(
  userId: string,
  idPhotoUrl?: string | null,
  verificationVideoUrl?: string | null
) {
  const [existingUser] = await db
    .select({
      id: users.id,
      age: users.age,
      dateOfBirth: users.dateOfBirth,
      idPhotoUrl: users.idPhotoUrl,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!existingUser) throw new AppError('User not found.', 404, 'NOT_FOUND');

  const age =
    existingUser.age > 0
      ? existingUser.age
      : existingUser.dateOfBirth
      ? computeAgeFromDob(existingUser.dateOfBirth)
      : 0;

  if (age < 18) {
    throw new AppError('Identity verification is only available for 18+ users.', 400, 'AGE_RESTRICTED');
  }

  // Accept any form of proof: video selfie (preferred), ID photo, or existing stored photo
  const hasProof = verificationVideoUrl || idPhotoUrl || existingUser.idPhotoUrl;
  if (!hasProof) {
    throw new AppError(
      'Complete a video selfie or upload a photo ID to verify your profile.',
      400,
      'ID_REQUIRED'
    );
  }

  // Mark verified and immediately null out any stored ID photo — we never persist PII
  const [verifiedUser] = await db
    .update(users)
    .set({
      idPhotoUrl: null, // delete immediately — legal compliance
      idVerified: true,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning(SAFE_USER_COLUMNS);

  if (!verifiedUser) throw new AppError('User not found.', 404, 'NOT_FOUND');
  return verifiedUser;
}

export async function getPublicProfile(viewerId: string, userId: string) {
  const [user] = await db
    .select(PUBLIC_PROFILE_COLUMNS)
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) throw new AppError('Profile not found.', 404, 'NOT_FOUND');
  return buildProfileResponse(viewerId, user);
}

export async function searchColleges(query: string) {
  if (!query || query.trim().length < 2) return [];
  return db
    .select({
      id: colleges.id,
      name: colleges.name,
      state: colleges.state,
      tier: colleges.tier,
      emailDomain: colleges.emailDomain,
    })
    .from(colleges)
    .where(ilike(colleges.name, `%${query.trim()}%`))
    .limit(10);
}

export async function recordProfileView(viewerId: string, viewedId: string): Promise<void> {
  // Self-views are meaningless and would pollute the viewers list
  if (viewerId === viewedId) return;

  const [existing] = await db
    .select({ id: profileViews.id })
    .from(profileViews)
    .where(and(eq(profileViews.viewerId, viewerId), eq(profileViews.viewedId, viewedId)))
    .limit(1);

  if (existing) {
    await db
      .update(profileViews)
      .set({ viewedAt: new Date() })
      .where(eq(profileViews.id, existing.id));
  } else {
    await db.insert(profileViews).values({ viewerId, viewedId });
  }
}

export async function getProfileViewers(userId: string): Promise<
  Array<{
    id: string;
    viewedAt: Date;
    viewer: {
      id: string;
      firstName: string;
      lastName: string;
      profilePhotoUrl: string | null;
      college: { name: string } | null;
      currentRole: string | null;
      idVerified: boolean;
    };
  }>
> {
  const rows = await db
    .select({
      id: profileViews.id,
      viewedAt: profileViews.viewedAt,
      viewerId: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      profilePhotoUrl: users.profilePhotoUrl,
      currentRole: users.currentRole,
      idVerified: users.idVerified,
      collegeId: users.collegeId,
      collegeName: colleges.name,
    })
    .from(profileViews)
    .innerJoin(users, eq(profileViews.viewerId, users.id))
    .leftJoin(colleges, eq(users.collegeId, colleges.id))
    .where(eq(profileViews.viewedId, userId))
    .orderBy(desc(profileViews.viewedAt))
    .limit(50);

  return rows.map((row) => ({
    id: row.id,
    viewedAt: row.viewedAt,
    viewer: {
      id: row.viewerId,
      firstName: row.firstName,
      lastName: row.lastName,
      profilePhotoUrl: row.profilePhotoUrl,
      currentRole: row.currentRole,
      idVerified: row.idVerified,
      college: row.collegeName ? { name: row.collegeName } : null,
    },
  }));
}

// ── Similar users ─────────────────────────────────────────────────────────────

export async function getSimilarUsers(viewerId: string) {
  // Fetch the viewer's own profile data needed for similarity matching in one query
  const [viewer] = await db
    .select({
      collegeId: users.collegeId,
      interests: users.interests,
      locationLabel: users.locationLabel,
    })
    .from(users)
    .where(eq(users.id, viewerId))
    .limit(1);

  if (!viewer) throw new AppError('User not found.', 404, 'NOT_FOUND');

  // Collect all user IDs already in a LIKED or MATCHED relationship with the viewer
  // (both as userId1 and userId2) in a single query to avoid N+1
  const existingMatchRows = await db
    .select({ userId1: matches.userId1, userId2: matches.userId2 })
    .from(matches)
    .where(
      and(
        or(eq(matches.userId1, viewerId), eq(matches.userId2, viewerId)),
        or(eq(matches.status, 'LIKED'), eq(matches.status, 'MATCHED'))
      )
    );

  const excludedIds = new Set<string>([viewerId]);
  for (const row of existingMatchRows) {
    excludedIds.add(row.userId1 === viewerId ? row.userId2 : row.userId1);
  }

  const excludedArray = Array.from(excludedIds);

  // Build similarity filter: at least one of same college, overlapping interests, or same location
  type DrizzleCondition = ReturnType<typeof eq>;
  const similarityConditions: DrizzleCondition[] = [];

  if (viewer.collegeId) {
    similarityConditions.push(eq(users.collegeId, viewer.collegeId));
  }

  if (viewer.locationLabel) {
    similarityConditions.push(eq(users.locationLabel, viewer.locationLabel));
  }

  // Interests overlap uses the Postgres && array operator. Each interest is passed
  // as an individual parameterized value to avoid injection.
  if (viewer.interests && viewer.interests.length > 0) {
    // sql`col && ARRAY[${val1}, ${val2}, ...]` — Drizzle interpolates each as a bind param
    const interestParams = viewer.interests
      .map((interest) => sql`${interest}`)
      .reduce((acc, cur, idx) => (idx === 0 ? cur : sql`${acc}, ${cur}`));

    similarityConditions.push(
      sql`${users.interests} && ARRAY[${interestParams}]::text[]` as unknown as DrizzleCondition
    );
  }

  // If the viewer has no distinguishing data at all, fall back to returning recent users
  const whereClause =
    excludedArray.length > 0 && similarityConditions.length > 0
      ? and(
          notInArray(users.id, excludedArray),
          or(...(similarityConditions as [DrizzleCondition, ...DrizzleCondition[]]))
        )
      : excludedArray.length > 0
      ? notInArray(users.id, excludedArray)
      : undefined;

  const rows = await db
    .select({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      profilePhotoUrl: users.profilePhotoUrl,
      currentRole: users.currentRole,
      company: users.company,
      idVerified: users.idVerified,
      headline: users.headline,
      collegeId: users.collegeId,
      collegeName: colleges.name,
    })
    .from(users)
    .leftJoin(colleges, eq(users.collegeId, colleges.id))
    .where(whereClause)
    // idVerified users surface first
    .orderBy(desc(users.idVerified), desc(users.createdAt))
    .limit(8);

  return rows.map((row) => ({
    id: row.id,
    firstName: row.firstName,
    lastName: row.lastName,
    profilePhotoUrl: row.profilePhotoUrl,
    currentRole: row.currentRole,
    company: row.company,
    idVerified: row.idVerified,
    headline: row.headline,
    college: row.collegeName ? { name: row.collegeName } : null,
  }));
}

// ── Experiences ───────────────────────────────────────────────────────────────

export interface ExperienceInput {
  company: string;
  role: string;
  employmentType?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  location?: string;
  description?: string;
}

export async function getExperiences(userId: string) {
  return db
    .select()
    .from(experiences)
    .where(eq(experiences.userId, userId))
    .orderBy(asc(experiences.displayOrder), desc(experiences.createdAt));
}

export async function createExperience(userId: string, data: ExperienceInput) {
  const [row] = await db
    .insert(experiences)
    .values({
      userId,
      company: data.company,
      role: data.role,
      employmentType: data.employmentType,
      startDate: data.startDate,
      endDate: data.endDate,
      isCurrent: data.isCurrent ?? false,
      location: data.location,
      description: data.description,
    })
    .returning();

  return row;
}

export async function updateExperience(id: string, userId: string, data: Partial<ExperienceInput>) {
  const [row] = await db
    .update(experiences)
    .set(data)
    .where(and(eq(experiences.id, id), eq(experiences.userId, userId)))
    .returning();

  if (!row) throw new AppError('Experience not found.', 404, 'NOT_FOUND');
  return row;
}

export async function deleteExperience(id: string, userId: string): Promise<void> {
  const result = await db
    .delete(experiences)
    .where(and(eq(experiences.id, id), eq(experiences.userId, userId)))
    .returning({ id: experiences.id });

  if (result.length === 0) throw new AppError('Experience not found.', 404, 'NOT_FOUND');
}

// ── Education ─────────────────────────────────────────────────────────────────

export interface EducationInput {
  institution: string;
  degree?: string;
  fieldOfStudy?: string;
  startYear?: number;
  endYear?: number;
  activities?: string;
  description?: string;
}

export async function getEducation(userId: string) {
  return db
    .select()
    .from(education)
    .where(eq(education.userId, userId))
    .orderBy(asc(education.displayOrder), desc(education.startYear));
}

export async function createEducation(userId: string, data: EducationInput) {
  const [row] = await db
    .insert(education)
    .values({
      userId,
      institution: data.institution,
      degree: data.degree,
      fieldOfStudy: data.fieldOfStudy,
      startYear: data.startYear,
      endYear: data.endYear,
      activities: data.activities,
      description: data.description,
    })
    .returning();

  return row;
}

export async function updateEducation(id: string, userId: string, data: Partial<EducationInput>) {
  const [row] = await db
    .update(education)
    .set(data)
    .where(and(eq(education.id, id), eq(education.userId, userId)))
    .returning();

  if (!row) throw new AppError('Education record not found.', 404, 'NOT_FOUND');
  return row;
}

export async function deleteEducation(id: string, userId: string): Promise<void> {
  const result = await db
    .delete(education)
    .where(and(eq(education.id, id), eq(education.userId, userId)))
    .returning({ id: education.id });

  if (result.length === 0) throw new AppError('Education record not found.', 404, 'NOT_FOUND');
}

/**
 * Romance Scam Prevention Act compliance.
 * When a user is banned for fraud, find all users who received messages from that banned user
 * and insert a FraudAlert record for each (audit trail + notification trigger).
 *
 * TODO: After inserting alerts, push FCM/email notifications to each recipient using a job queue.
 */
export async function notifyFraudBan(
  bannedUserId: string,
  banReason: string,
  bannedAt: Date
): Promise<number> {
  // Find all match IDs where the banned user was a participant
  const bannedMatches = await db
    .select({ id: matches.id, userId1: matches.userId1, userId2: matches.userId2 })
    .from(matches)
    .where(
      or(eq(matches.userId1, bannedUserId), eq(matches.userId2, bannedUserId))
    )

  if (bannedMatches.length === 0) return 0

  // Find all messages sent by the banned user in those matches
  const matchIds = bannedMatches.map((m) => m.id)
  const sentMessages = await db
    .selectDistinct({ matchId: messages.matchId })
    .from(messages)
    .where(and(eq(messages.senderUserId, bannedUserId), sql`${messages.matchId} = ANY(${matchIds})`))

  // Collect unique recipient user IDs (the other participant in each match)
  const recipientIds = new Set<string>()
  for (const msg of sentMessages) {
    const m = bannedMatches.find((bm) => bm.id === msg.matchId)
    if (!m) continue
    const recipientId = m.userId1 === bannedUserId ? m.userId2 : m.userId1
    recipientIds.add(recipientId)
  }

  if (recipientIds.size === 0) return 0

  // Insert FraudAlert records for each recipient
  const alerts = Array.from(recipientIds).map((recipientUserId) => ({
    recipientUserId,
    bannedUserId,
    bannedAt,
    banReason,
    acknowledged: false,
  }))

  await db.insert(fraudAlerts).values(alerts).onConflictDoNothing()

  // TODO: enqueue push notifications / emails for each recipient

  return alerts.length
}
