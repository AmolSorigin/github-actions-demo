import { Request, Response } from 'express';
import { publishPushNotification, sendSMS } from './sns.service';
import { publishPushNotificationSchema, sendSMSSchema } from './sns.validation';
import type { PublishPushNotificationParams, SendSMSParams } from './sns.types';

/**
 * POST /api/aws/sns/publish-push
 * Publish a push notification directly to a device using AWS SNS
 */
export async function publishPushNotificationHandler(
  req: Request,
  res: Response,
): Promise<Response> {
  try {
    // Validate request body using Joi
    const { error, value } = publishPushNotificationSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessages = error.details.map((detail) => detail.message);
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errorMessages,
      });
    }

    const {
      platformApplicationArn,
      deviceToken,
      message,
      title,
      subtitle,
      badge,
      sound,
      customData,
    } = value;

    const params: PublishPushNotificationParams = {
      platformApplicationArn,
      deviceToken,
      message,
      ...(title && { title }),
      ...(subtitle && { subtitle }),
      ...(badge !== undefined && { badge }),
      ...(sound && { sound }),
      ...(customData && { customData }),
    };

    const result = await publishPushNotification(params);

    if (result.success) {
      return res.status(200).json({
        success: true,
        messageId: result.messageId,
        endpointArn: result.endpointArn,
        message: 'Push notification sent successfully',
      });
    } else {
      return res.status(500).json({
        success: false,
        error: result.error || 'Failed to send push notification',
      });
    }
  } catch (error) {
    console.error('Error in publish-push endpoint:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}

/**
 * POST /api/aws/sns/send-sms
 * Send an SMS directly to a phone number using AWS SNS
 */
export async function sendSMSHandler(req: Request, res: Response): Promise<Response> {
  try {
    // Validate request body using Joi
    const { error, value } = sendSMSSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessages = error.details.map((detail) => detail.message);
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errorMessages,
      });
    }

    const { phoneNumber, message, senderId } = value;

    const params: SendSMSParams = {
      phoneNumber,
      message,
      ...(senderId && { senderId }),
    };

    const result = await sendSMS(params);

    if (result.success) {
      return res.status(200).json({
        success: true,
        messageId: result.messageId,
        message: 'SMS sent successfully',
      });
    } else {
      return res.status(500).json({
        success: false,
        error: result.error || 'Failed to send SMS',
      });
    }
  } catch (error) {
    console.error('Error in send-sms endpoint:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}
