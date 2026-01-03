import { Request, Response } from 'express';
import { publishPushNotification, sendSMS } from './sns.service';
import { publishPushNotificationSchema, sendSMSSchema } from './sns.validation';
import type { PublishPushNotificationParams, SendSMSParams } from './sns.types';
import {
  sendSuccessResponse,
  sendValidationErrorResponse,
  sendErrorResponse,
  sendInternalServerErrorResponse,
} from '../../../utils/response';
import { HTTP_STATUS } from '../../../constants';
import { ERROR_MESSAGES } from '../../../constants/errorMessages';
import { SUCCESS_MESSAGES } from '../../../constants/successMessages';

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
      return sendValidationErrorResponse(res, errorMessages);
    }

    const { platformApplicationArn, deviceToken, message, title, badge, sound, customData } = value;

    const params: PublishPushNotificationParams = {
      platformApplicationArn,
      deviceToken,
      message,
      ...(title && { title }),
      ...(badge !== undefined && { badge }),
      ...(sound && { sound }),
      ...(customData && { customData }),
    };

    const result = await publishPushNotification(params);

    if (result.success) {
      return sendSuccessResponse(res, HTTP_STATUS.OK, SUCCESS_MESSAGES.PUSH_NOTIFICATION_SENT, {
        messageId: result.messageId,
        endpointArn: result.endpointArn,
      });
    } else {
      return sendErrorResponse(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        result.error || ERROR_MESSAGES.PUSH_NOTIFICATION_FAILED,
      );
    }
  } catch (error) {
    console.error('Error in publish-push endpoint:', error);
    return sendInternalServerErrorResponse(res, error instanceof Error ? error.message : undefined);
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
      return sendValidationErrorResponse(res, errorMessages);
    }

    const { phoneNumber, message, senderId } = value;

    const params: SendSMSParams = {
      phoneNumber,
      message,
      ...(senderId && { senderId }),
    };

    const result = await sendSMS(params);

    if (result.success) {
      return sendSuccessResponse(res, HTTP_STATUS.OK, SUCCESS_MESSAGES.SMS_SENT, {
        messageId: result.messageId,
      });
    } else {
      return sendErrorResponse(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        result.error || ERROR_MESSAGES.SMS_SEND_FAILED,
      );
    }
  } catch (error) {
    console.error('Error in send-sms endpoint:', error);
    return sendInternalServerErrorResponse(res, error instanceof Error ? error.message : undefined);
  }
}
