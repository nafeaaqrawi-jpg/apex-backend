import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import {
  getDiscoverFeedHandler,
  getNearbyProfilesHandler,
  likeUserHandler,
  getMatchesHandler,
  getSingleMatchHandler,
  unmatchHandler,
  getPendingRequestsHandler,
  getSentRequestsHandler,
  confirmWeMetHandler,
  passUserHandler,
  reportUserHandler,
  getCompatibilityScoreHandler,
  likeUserSchema,
} from '../controllers/match.controller';

const router = Router();

// Discover feed — verified users not yet interacted with
router.get('/discover', requireAuth, getDiscoverFeedHandler);
router.get('/discover/nearby', requireAuth, getNearbyProfilesHandler);

// Like a user (may trigger a mutual match)
router.post('/matches/like/:targetUserId', requireAuth, validate(likeUserSchema), likeUserHandler);

// Get all MATCHED matches with other user profiles attached
router.get('/matches', requireAuth, getMatchesHandler);

// Get a single match by ID (used by chat header)
router.get('/matches/:matchId', requireAuth, getSingleMatchHandler);

// Unmatch
router.delete('/matches/:matchId', requireAuth, unmatchHandler);

// Pending connection requests (users who liked the current user)
router.get('/connections/requests', requireAuth, getPendingRequestsHandler);

// Sent connection requests (current user liked them, awaiting their response)
router.get('/connections/sent', requireAuth, getSentRequestsHandler);

// Compatibility score + per-factor breakdown for a target user
router.get('/connections/score/:targetUserId', requireAuth, getCompatibilityScoreHandler);

// Confirm "We Met" in real life
router.post('/matches/:matchId/we-met', requireAuth, confirmWeMetHandler);

// Pass on a user (suppress from future feeds + signal passReceivedCount)
router.post('/connections/:userId/pass', requireAuth, passUserHandler);

// Report a user for safety review
router.post('/connections/:matchId/report', requireAuth, reportUserHandler);

export default router;
