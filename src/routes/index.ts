import { Router } from 'express';
import { sesRouter } from '../features/aws/ses';
import { snsRouter } from '../features/aws/sns';
import healthRouter from './health.route';

const router = Router();

// Health and test routes
router.use(healthRouter);

// AWS SES Email routes
router.use('/api/aws/ses', sesRouter);

// AWS SNS Push Notification routes
router.use('/api/aws/sns', snsRouter);

export default router;
