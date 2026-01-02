import { Request, Response } from 'express';
import { sendEmail } from './ses.service';
import { sendEmailSchema } from './ses.validation';
import type { SendEmailParams } from './ses.types';

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
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errorMessages,
      });
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
      return res.status(200).json({
        success: true,
        messageId: result.messageId,
        message: 'Email sent successfully',
      });
    } else {
      return res.status(500).json({
        success: false,
        error: result.error || 'Failed to send email',
      });
    }
  } catch (error) {
    console.error('Error in send-email endpoint:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}
