import { Router } from 'express';
import { publishPushNotificationHandler, sendSMSHandler } from './sns.controller';

const router = Router();

/**
 * POST /api/aws/sns/publish-push
 * Publish a push notification directly to a device using AWS SNS with FCM
 * This endpoint sends push notifications directly without requiring topics or subscriptions
 */
router.post('/publish-push', publishPushNotificationHandler);

/**
 * POST /api/aws/sns/send-sms
 * Send an SMS directly to a phone number using AWS SNS
 * This endpoint sends SMS directly without requiring topics or subscriptions
 */
router.post('/send-sms', sendSMSHandler);

export default router;
