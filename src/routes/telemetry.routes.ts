import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { getTelemetrySummaryHandler, recordTelemetryEventHandler, telemetryEventSchema } from '../controllers/telemetry.controller';

const router = Router();

router.post('/telemetry/events', requireAuth, validate(telemetryEventSchema), recordTelemetryEventHandler);
router.get('/telemetry/summary', requireAuth, getTelemetrySummaryHandler);

export default router;
