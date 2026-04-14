import {
  pgTable,
  pgEnum,
  text,
  boolean,
  integer,
  doublePrecision,
  timestamp,
  jsonb,
  unique,
  index,
} from 'drizzle-orm/pg-core';

// ── Enums ─────────────────────────────────────────────────────────────────────

export const relationshipGoalEnum = pgEnum('RelationshipGoal', [
  'MARRIAGE',
  'LONGTERM',
  'CASUAL',
  'EXPLORING',
]);

export const genderEnum = pgEnum('Gender', [
  'MAN',
  'WOMAN',
  'NON_BINARY',
  'PREFER_NOT_TO_SAY',
]);

export const collegeTierEnum = pgEnum('CollegeTier', ['TOP_50', 'TOP_100', 'OTHER']);

export const matchStatusEnum = pgEnum('MatchStatus', ['LIKED', 'MATCHED', 'UNMATCHED']);

export const verificationTokenTypeEnum = pgEnum('VerificationTokenType', [
  'EMAIL',
  'PASSWORD_RESET',
]);

// ── Tables ────────────────────────────────────────────────────────────────────

export const colleges = pgTable('College', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull().unique(),
  state: text('state'),
  country: text('country').notNull().default('USA'),
  emailDomain: text('emailDomain'),
  tier: collegeTierEnum('tier').notNull().default('OTHER'),
});

export const users = pgTable(
  'User',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    email: text('email').notNull().unique(),
    passwordHash: text('passwordHash').notNull(),
    firstName: text('firstName').notNull(),
    lastName: text('lastName').notNull(),
    age: integer('age').notNull(),
    dateOfBirth: text('dateOfBirth'), // ISO date string YYYY-MM-DD
    gender: genderEnum('gender'),
    bio: text('bio'),
    headline: text('headline'),
    currentRole: text('currentRole'),
    company: text('company'),
    locationLabel: text('locationLabel'),
    workLocation: text('workLocation'),
    futureLocation: text('futureLocation'),
    profilePhotoUrl: text('profilePhotoUrl'),
    idPhotoUrl: text('idPhotoUrl'),
    verified: boolean('verified').notNull().default(false),
    idVerified: boolean('idVerified').notNull().default(false),
    relationshipGoal: relationshipGoalEnum('relationshipGoal'),
    interests: text('interests').array().default([]),
    values: jsonb('values'),
    latitude: doublePrecision('latitude'),
    longitude: doublePrecision('longitude'),
    major: text('major'),
    gpa: doublePrecision('gpa'),
    sat: integer('sat'),
    act: integer('act'),
    // Extended profile fields
    religion: text('religion'),
    sexuality: text('sexuality'),
    ethnicity: text('ethnicity'),
    birthCity: text('birthCity'),
    height: text('height'),
    drinking: text('drinking'),
    smoking: text('smoking'),
    cannabis: text('cannabis'),
    wantsKids: text('wantsKids'),
    politicalViews: text('politicalViews'),
    isPremium: boolean('isPremium').notNull().default(false),
    premiumSince: timestamp('premiumSince'),
    collegeId: text('collegeId').references(() => colleges.id),
    socialLinks: jsonb('socialLinks'), // { instagram?, twitter?, tiktok?, linkedin? }
    namePronunciationUrl: text('namePronunciationUrl'),
    voicePromptUrl: text('voicePromptUrl'),
    voicePromptText: text('voicePromptText'),
    prompts: jsonb('prompts'), // [{ question: string, answer: string }] — max 5 entries enforced at the API layer
    onboardingComplete: boolean('onboardingComplete').notNull().default(false),
    // Greek life affiliation
    greekOrganization: text('greekOrganization'),
    greekOrganizationType: text('greekOrganizationType'), // 'FRATERNITY' | 'SORORITY' | 'CO-ED'
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  },
  (t) => [index('user_college_idx').on(t.collegeId)]
);

export const matches = pgTable(
  'Match',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId1: text('userId1')
      .notNull()
      .references(() => users.id),
    userId2: text('userId2')
      .notNull()
      .references(() => users.id),
    introMessage: text('introMessage'),
    introMessageSenderId: text('introMessageSenderId').references(() => users.id),
    status: matchStatusEnum('status').notNull().default('LIKED'),
    matchScore: doublePrecision('matchScore'),
    weMetUser1: boolean('weMetUser1').notNull().default(false),
    weMetUser2: boolean('weMetUser2').notNull().default(false),
    weMetAt: timestamp('weMetAt'),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  },
  (t) => [
    unique().on(t.userId1, t.userId2),
    index('match_user1_idx').on(t.userId1),
    index('match_user2_idx').on(t.userId2),
    index('match_intro_sender_idx').on(t.introMessageSenderId),
  ]
);

export const messages = pgTable(
  'Message',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    matchId: text('matchId')
      .notNull()
      .references(() => matches.id),
    senderUserId: text('senderUserId')
      .notNull()
      .references(() => users.id),
    content: text('content').notNull(),
    messageType: text('messageType').notNull().default('text'),
    mediaUrl: text('mediaUrl'),
    read: boolean('read').notNull().default(false),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
  },
  (t) => [index('message_match_idx').on(t.matchId)]
);

export const posts = pgTable(
  'Post',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    imageUrl: text('imageUrl').notNull(),
    caption: text('caption'),
    locationTag: text('locationTag'),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
  },
  (t) => [index('post_user_idx').on(t.userId)]
);

export const profileViews = pgTable(
  'ProfileView',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    viewerId: text('viewerId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    viewedId: text('viewedId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    viewedAt: timestamp('viewedAt').notNull().defaultNow(),
  },
  (t) => [
    index('profile_view_viewer_idx').on(t.viewerId),
    index('profile_view_viewed_idx').on(t.viewedId),
  ]
);

export const experiences = pgTable(
  'Experience',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    company: text('company').notNull(),
    role: text('role').notNull(),
    employmentType: text('employmentType'), // "Full-time", "Internship", "Part-time", "Contract"
    startDate: text('startDate'), // "YYYY-MM"
    endDate: text('endDate'), // "YYYY-MM" or null if current
    isCurrent: boolean('isCurrent').notNull().default(false),
    location: text('location'),
    description: text('description'),
    displayOrder: integer('displayOrder').notNull().default(0),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
  },
  (t) => [index('experience_user_idx').on(t.userId)]
);

export const education = pgTable(
  'Education',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    institution: text('institution').notNull(),
    degree: text('degree'), // "Bachelor of Business Administration - BBA"
    fieldOfStudy: text('fieldOfStudy'),
    startYear: integer('startYear'),
    endYear: integer('endYear'),
    activities: text('activities'), // clubs, societies
    description: text('description'),
    displayOrder: integer('displayOrder').notNull().default(0),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
  },
  (t) => [index('education_user_idx').on(t.userId)]
);

export const verificationTokens = pgTable('VerificationToken', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  type: verificationTokenTypeEnum('type').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
});

export const userPasses = pgTable(
  'UserPass',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
    passedUserId: text('passedUserId').notNull().references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
  },
  (t) => [
    unique().on(t.userId, t.passedUserId),
    index('pass_user_idx').on(t.userId),
  ]
);

export const userReports = pgTable(
  'UserReport',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    reporterId: text('reporterId').notNull().references(() => users.id, { onDelete: 'cascade' }),
    reportedUserId: text('reportedUserId').notNull().references(() => users.id, { onDelete: 'cascade' }),
    reason: text('reason').notNull(), // 'SPAM' | 'HARASSMENT' | 'FAKE_PROFILE' | 'INAPPROPRIATE' | 'OTHER'
    notes: text('notes'),
    resolved: boolean('resolved').notNull().default(false),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
  },
  (t) => [
    index('report_reporter_idx').on(t.reporterId),
    index('report_reported_idx').on(t.reportedUserId),
  ]
);

export const algorithmSignals = pgTable(
  'AlgorithmSignal',
  {
    userId: text('userId').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
    // Behavioral signals
    profileViewCount: integer('profileViewCount').notNull().default(0),
    profileViewedCount: integer('profileViewedCount').notNull().default(0),
    likesSentCount: integer('likesSentCount').notNull().default(0),
    likesReceivedCount: integer('likesReceivedCount').notNull().default(0),
    matchCount: integer('matchCount').notNull().default(0),
    avgMessagesPerMatch: doublePrecision('avgMessagesPerMatch').notNull().default(0),
    weMetCount: integer('weMetCount').notNull().default(0),
    // Safety signals
    reportReceivedCount: integer('reportReceivedCount').notNull().default(0),
    passReceivedCount: integer('passReceivedCount').notNull().default(0),
    fastUnmatchCount: integer('fastUnmatchCount').notNull().default(0),
    // Freshness
    lastActiveAt: timestamp('lastActiveAt'),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  }
);

// ── Gamification ──────────────────────────────────────────────────────────────

export const userGameState = pgTable('UserGameState', {
  userId: text('userId').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  totalXP: integer('totalXP').notNull().default(0),
  level: integer('level').notNull().default(1),
  currentStreak: integer('currentStreak').notNull().default(0),
  longestStreak: integer('longestStreak').notNull().default(0),
  lastActiveDate: text('lastActiveDate'), // 'YYYY-MM-DD'
  achievements: jsonb('achievements').notNull().$default(() => []), // string[] of achievement IDs
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export type UserGameState = typeof userGameState.$inferSelect

// ── Fraud alerts (Romance Scam Prevention Act compliance) ────────────────────
// When a user is banned for fraud, all users they messaged receive a fraud alert.
// This table provides an audit trail proving notification occurred.

export const fraudAlerts = pgTable(
  'FraudAlert',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    recipientUserId: text('recipientUserId').notNull().references(() => users.id, { onDelete: 'cascade' }),
    bannedUserId: text('bannedUserId').notNull(), // Not FK — user is banned/deleted, keep for audit
    bannedAt: timestamp('bannedAt').notNull(),
    notifiedAt: timestamp('notifiedAt').notNull().defaultNow(),
    banReason: text('banReason').notNull().default('FRAUD'), // 'FRAUD' | 'ROMANCE_SCAM' | 'CATFISHING'
    acknowledged: boolean('acknowledged').notNull().default(false),
  },
  (t) => [
    index('fraud_alert_recipient_idx').on(t.recipientUserId),
    index('fraud_alert_banned_idx').on(t.bannedUserId),
  ]
)

// ── Types (inferred from schema) ──────────────────────────────────────────────

export type User = typeof users.$inferSelect;
export type College = typeof colleges.$inferSelect;
export type Match = typeof matches.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type VerificationToken = typeof verificationTokens.$inferSelect;
export type ProfileView = typeof profileViews.$inferSelect;
export type Experience = typeof experiences.$inferSelect;
export type Education = typeof education.$inferSelect;
export type UserPass = typeof userPasses.$inferSelect;
export type UserReport = typeof userReports.$inferSelect;
export type AlgorithmSignal = typeof algorithmSignals.$inferSelect;
export type FraudAlert = typeof fraudAlerts.$inferSelect;
