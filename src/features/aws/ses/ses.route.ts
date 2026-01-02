import { Router } from 'express';
import { sendEmailHandler } from './ses.controller';

const router = Router();

/**
 * POST /api/aws/ses/send-email
 * Send an email using AWS SES
 */
router.post('/send-email', sendEmailHandler);

export default router;
