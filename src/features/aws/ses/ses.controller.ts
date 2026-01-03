import { Request, Response } from 'express';
import { sendEmail } from './ses.service';
import { sendEmailSchema } from './ses.validation';
import type { SendEmailParams } from './ses.types';
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
 * POST /api/aws/ses/send-email
 * Send an email using AWS SES
 */
export async function sendEmailHandler(req: Request, res: Response): Promise<Response> {
  try {
    // Validate request body using Joi
    const { error, value } = sendEmailSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessages = error.details.map((detail) => detail.message);
      return sendValidationErrorResponse(res, errorMessages);
    }

    const { to, subject, body, from, replyTo, isHtml } = value;

    const params: SendEmailParams = {
      to,
      subject,
      body,
      ...(from && { from }),
      ...(replyTo && { replyTo }),
      ...(typeof isHtml === 'boolean' && { isHtml }),
    };

    const result = await sendEmail(params);

    if (result.success) {
      return sendSuccessResponse(res, HTTP_STATUS.OK, SUCCESS_MESSAGES.EMAIL_SENT, {
        messageId: result.messageId,
      });
    } else {
      return sendErrorResponse(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        result.error || ERROR_MESSAGES.EMAIL_SEND_FAILED,
      );
    }
  } catch (error) {
    console.error('Error in send-email endpoint:', error);
    return sendInternalServerErrorResponse(res, error instanceof Error ? error.message : undefined);
  }
}
