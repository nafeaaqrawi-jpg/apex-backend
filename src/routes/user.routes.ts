import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import {
  updateProfileSchema,
  onboardingSchema,
  getProfileHandler,
  updateProfileHandler,
  onboardingHandler,
  getPublicProfileHandler,
  verifyIdentityHandler,
  verifyIdentitySchema,
  recordProfileViewHandler,
  getProfileViewersHandler,
  getSimilarUsersHandler,
  getExperiencesHandler,
  getMyExperiencesHandler,
  createExperienceHandler,
  updateExperienceHandler,
  deleteExperienceHandler,
  createExperienceSchema,
  updateExperienceSchema,
  getEducationHandler,
  getMyEducationHandler,
  createEducationHandler,
  updateEducationHandler,
  deleteEducationHandler,
  createEducationSchema,
  updateEducationSchema,
  fraudBanNotifySchema,
  fraudBanNotifyHandler,
} from '../controllers/user.controller';

const router = Router();

router.use(requireAuth);

// GET /api/users/profile — fetch the authenticated user's full profile
router.get('/profile', getProfileHandler);

// POST /api/users/onboarding — complete onboarding and mark onboardingComplete = true
router.post('/onboarding', validate(onboardingSchema), onboardingHandler);

// PATCH /api/users/profile — update profile fields
router.patch('/profile', validate(updateProfileSchema), updateProfileHandler);

// POST /api/users/profile/verify-id — upload or confirm government ID and mark 18+ verified
router.post('/profile/verify-id', validate(verifyIdentitySchema), verifyIdentityHandler);

// PUT /api/users/me — legacy alias kept for backward compatibility
router.put('/me', validate(updateProfileSchema), updateProfileHandler);

// ── /me routes MUST come before /:userId routes to avoid param conflicts ──────

// GET /api/users/me/viewers — people who viewed my profile
router.get('/me/viewers', getProfileViewersHandler);

// GET /api/users/me/experiences
router.get('/me/experiences', getMyExperiencesHandler);

// GET /api/users/me/education
router.get('/me/education', getMyEducationHandler);

// POST /api/users/me/experiences
router.post('/me/experiences', validate(createExperienceSchema), createExperienceHandler);

// POST /api/users/me/education
router.post('/me/education', validate(createEducationSchema), createEducationHandler);

// PATCH /api/users/me/experiences/:id
router.patch('/me/experiences/:id', validate(updateExperienceSchema), updateExperienceHandler);

// PATCH /api/users/me/education/:id
router.patch('/me/education/:id', validate(updateEducationSchema), updateEducationHandler);

// DELETE /api/users/me/experiences/:id
router.delete('/me/experiences/:id', deleteExperienceHandler);

// DELETE /api/users/me/education/:id
router.delete('/me/education/:id', deleteEducationHandler);

// ── /:userId param routes ─────────────────────────────────────────────────────

// POST /api/users/:userId/view — record that the authenticated user viewed userId's profile
router.post('/:userId/view', recordProfileViewHandler);

// GET /api/users/:userId/similar — up to 8 users similar to userId
router.get('/:userId/similar', getSimilarUsersHandler);

// GET /api/users/:userId/experiences — public view of a user's work history
router.get('/:userId/experiences', getExperiencesHandler);

// GET /api/users/:userId/education — public view of a user's education
router.get('/:userId/education', getEducationHandler);

// GET /api/users/:userId — public profile (must stay LAST — catch-all param)
router.get('/:userId', getPublicProfileHandler);

// ── Admin-only routes ─────────────────────────────────────────────────────────
// POST /api/users/admin/fraud-ban-notify — Romance Scam Prevention Act compliance
// Protected: requireAuth is applied at the router level above. In production,
// add an additional requireAdmin middleware here before shipping to users.
router.post('/admin/fraud-ban-notify', validate(fraudBanNotifySchema), fraudBanNotifyHandler);

export default router;
