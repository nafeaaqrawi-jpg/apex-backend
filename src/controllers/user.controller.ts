import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  getProfile,
  updateProfile,
  completeOnboarding,
  searchColleges,
  getPublicProfile,
  verifyIdentity,
  recordProfileView,
  getProfileViewers,
  getSimilarUsers,
  getExperiences,
  createExperience,
  updateExperience,
  deleteExperience,
  getEducation,
  createEducation,
  updateEducation,
  deleteEducation,
} from '../services/user.service';

// ── Validation schemas ────────────────────────────────────────────────────────

export const updateProfileSchema = z.object({
  bio: z.string().max(500).optional(),
  headline: z.string().max(120).optional(),
  currentRole: z.string().max(80).optional(),
  company: z.string().max(80).optional(),
  locationLabel: z.string().max(80).optional(),
  workLocation: z.string().max(80).optional(),
  futureLocation: z.string().max(80).optional(),
  major: z.string().max(100).optional(),
  gpa: z.number().min(0).max(4.0).optional(),
  sat: z.number().int().min(400).max(1600).optional(),
  act: z.number().int().min(1).max(36).optional(),
  relationshipGoal: z.enum(['MARRIAGE', 'LONGTERM', 'CASUAL', 'EXPLORING']).optional(),
  interests: z.array(z.string().max(50)).max(10).optional(),
  values: z.array(z.string().max(50)).max(5).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  collegeId: z.string().nullable().optional(),
  profilePhotoUrl: z.string().url().nullable().optional(),
  idPhotoUrl: z.string().url().nullable().optional(),
  socialLinks: z
    .object({
      instagram: z.string().max(200).nullable().optional(),
      twitter: z.string().max(200).nullable().optional(),
      tiktok: z.string().max(200).nullable().optional(),
      linkedin: z.string().max(200).nullable().optional(),
    })
    .optional(),
  prompts: z
    .array(
      z.object({
        question: z.string().min(1).max(200),
        answer: z.string().min(1).max(500),
        photoUrl: z.string().url().nullable().optional(),
      })
    )
    .max(5)
    .optional(),
  religion: z.string().max(50).optional(),
  sexuality: z.string().max(50).optional(),
  ethnicity: z.string().max(50).optional(),
  birthCity: z.string().max(100).optional(),
  height: z.string().max(20).optional(),
  drinking: z.string().max(30).optional(),
  smoking: z.string().max(30).optional(),
  cannabis: z.string().max(30).optional(),
  wantsKids: z.string().max(50).optional(),
  politicalViews: z.string().max(50).optional(),
});

export const onboardingSchema = z.object({
  firstName: z.string().min(1, 'First name is required.').max(50).trim(),
  lastName: z.string().min(1, 'Last name is required.').max(50).trim(),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  gender: z.enum(['MAN', 'WOMAN', 'NON_BINARY', 'PREFER_NOT_TO_SAY']).optional(),
  bio: z.string().max(500).optional(),
  headline: z.string().max(120).optional(),
  currentRole: z.string().max(80).optional(),
  company: z.string().max(80).optional(),
  locationLabel: z.string().max(80).optional(),
  workLocation: z.string().max(80).optional(),
  futureLocation: z.string().max(80).optional(),
  major: z.string().max(100).optional(),
  gpa: z.number().min(0).max(4.0).optional(),
  sat: z.number().int().min(400).max(1600).optional(),
  act: z.number().int().min(1).max(36).optional(),
  interests: z.array(z.string().max(50)).max(10).optional(),
  relationshipGoal: z.enum(['MARRIAGE', 'LONGTERM', 'CASUAL', 'EXPLORING']).optional(),
  collegeId: z.string().nullable().optional(),
  profilePhotoUrl: z.string().url().nullable().optional(),
});

export const verifyIdentitySchema = z.object({
  idPhotoUrl: z.string().url().nullable().optional(),
  verificationVideoUrl: z.string().url().nullable().optional(),
});

// ── Handlers ──────────────────────────────────────────────────────────────────

export async function getProfileHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = await getProfile(req.user!.userId);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

export async function updateProfileHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = await updateProfile(req.user!.userId, req.body);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

export async function onboardingHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = await completeOnboarding(req.user!.userId, req.body);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

export async function searchCollegesHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Accepts both ?q= (legacy) and ?search= (new)
    const query = String(req.query.search ?? req.query.q ?? '');
    const results = await searchColleges(query);
    res.json({ success: true, data: results });
  } catch (err) {
    next(err);
  }
}

export async function getPublicProfileHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { userId } = req.params;
    const profile = await getPublicProfile(req.user!.userId, userId);
    res.json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
}

export async function verifyIdentityHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { idPhotoUrl, verificationVideoUrl } = req.body as z.infer<typeof verifyIdentitySchema>;
    const user = await verifyIdentity(req.user!.userId, idPhotoUrl, verificationVideoUrl);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

export async function recordProfileViewHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await recordProfileView(req.user!.userId, req.params.userId);
    res.json({ success: true, data: { recorded: true } });
  } catch (err) {
    next(err);
  }
}

export async function getProfileViewersHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const viewers = await getProfileViewers(req.user!.userId);
    res.json({ success: true, data: viewers });
  } catch (err) {
    next(err);
  }
}

// ── Similar users ──────────────────────────────────────────────────────────────

export async function getSimilarUsersHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { userId } = req.params;
    const results = await getSimilarUsers(userId);
    res.json({ success: true, data: results });
  } catch (err) {
    next(err);
  }
}

// ── Experience schemas and handlers ───────────────────────────────────────────

export const createExperienceSchema = z.object({
  company: z.string().min(1).max(100).trim(),
  role: z.string().min(1).max(100).trim(),
  employmentType: z
    .enum(['Full-time', 'Internship', 'Part-time', 'Contract'])
    .optional(),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}$/, 'startDate must be YYYY-MM format.')
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}$/, 'endDate must be YYYY-MM format.')
    .nullable()
    .optional(),
  isCurrent: z.boolean().optional(),
  location: z.string().max(100).trim().optional(),
  description: z.string().max(2000).trim().optional(),
});

export const updateExperienceSchema = createExperienceSchema.partial();

export async function getExperiencesHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = await getExperiences(req.params.userId);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getMyExperiencesHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = await getExperiences(req.user!.userId);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function createExperienceHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = await createExperience(req.user!.userId, req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function updateExperienceHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = await updateExperience(req.params.id, req.user!.userId, req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function deleteExperienceHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await deleteExperience(req.params.id, req.user!.userId);
    res.json({ success: true, data: { deleted: true } });
  } catch (err) {
    next(err);
  }
}

// ── Education schemas and handlers ────────────────────────────────────────────

export const createEducationSchema = z.object({
  institution: z.string().min(1).max(200).trim(),
  degree: z.string().max(200).trim().optional(),
  fieldOfStudy: z.string().max(200).trim().optional(),
  startYear: z.number().int().min(1900).max(2100).optional(),
  endYear: z.number().int().min(1900).max(2100).nullable().optional(),
  activities: z.string().max(500).trim().optional(),
  description: z.string().max(2000).trim().optional(),
});

export const updateEducationSchema = createEducationSchema.partial();

export async function getEducationHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = await getEducation(req.params.userId);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getMyEducationHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = await getEducation(req.user!.userId);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function createEducationHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = await createEducation(req.user!.userId, req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function updateEducationHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = await updateEducation(req.params.id, req.user!.userId, req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function deleteEducationHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await deleteEducation(req.params.id, req.user!.userId);
    res.json({ success: true, data: { deleted: true } });
  } catch (err) {
    next(err);
  }
}

// ── Fraud ban notification (Romance Scam Prevention Act compliance) ────────────

export const fraudBanNotifySchema = z.object({
  bannedUserId: z.string().min(1),
  banReason: z.enum(['FRAUD', 'ROMANCE_SCAM', 'CATFISHING']).default('FRAUD'),
  bannedAt: z.string().datetime().optional(),
})

/**
 * POST /api/admin/fraud-ban-notify
 * Internal/admin endpoint — called when a user is permanently banned for fraud.
 * Looks up all users who messaged the banned user and records a FraudAlert for each.
 * Per the Romance Scam Prevention Act (NY law effective Feb 19 2025; federal passed House 2025).
 *
 * TODO: integrate with a notification queue (FCM/email) to push alerts to recipient devices.
 */
export async function fraudBanNotifyHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { bannedUserId, banReason, bannedAt } = req.body as z.infer<typeof fraudBanNotifySchema>
    const { notifyFraudBan } = await import('../services/user.service')
    const count = await notifyFraudBan(bannedUserId, banReason, bannedAt ? new Date(bannedAt) : new Date())
    res.json({ success: true, data: { notifiedCount: count } })
  } catch (err) {
    next(err)
  }
}
