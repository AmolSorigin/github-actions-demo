import { SendEmailCommand } from '@aws-sdk/client-ses';
import { envConfig } from '../../../config/env';
import { sesClient } from './ses.config';
import type { SendEmailParams, SendEmailResponse } from './ses.types';

/**
 * Send an email using AWS SES
 * @param params - Email parameters
 * @returns Promise with send result
 */
export async function sendEmail(params: SendEmailParams): Promise<SendEmailResponse> {
  try {
    const {
      to,
      subject,
      body,
      from = envConfig.aws.ses.fromEmail,
      replyTo,
      isHtml = false,
    } = params;

    // Convert to array if single email
    const toAddresses = Array.isArray(to) ? to : [to];
    const replyToAddresses = replyTo ? (Array.isArray(replyTo) ? replyTo : [replyTo]) : undefined;

    const command = new SendEmailCommand({
      Source: from,
      Destination: {
        ToAddresses: toAddresses,
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: 'UTF-8',
        },
        Body: isHtml
          ? {
              Html: {
                Data: body,
                Charset: 'UTF-8',
              },
            }
          : {
              Text: {
                Data: body,
                Charset: 'UTF-8',
              },
            },
      },
      ...(replyToAddresses && { ReplyToAddresses: replyToAddresses }),
    });

    const response = await sesClient.send(command);

    const result: SendEmailResponse = {
      success: true,
    };

    if (response.MessageId) {
      result.messageId = response.MessageId;
    }

    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
