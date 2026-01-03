import { CreatePlatformEndpointCommand, PublishCommand } from '@aws-sdk/client-sns';
import { snsClient } from './sns.config';
import type {
  PublishPushNotificationParams,
  PublishPushNotificationResponse,
  SendSMSParams,
  SendSMSResponse,
} from './sns.types';

/**
 * Build GCM message payload
 * Platform key is always GCM
 */
function buildFCMMessagePayload(params: PublishPushNotificationParams): string {
  const { message, title, sound, customData } = params;

  // Platform key is always GCM
  const platformKey = 'GCM';

  // GCM payload structure
  // Note: GCM notification object supports: title, body, sound
  const fcmPayload: Record<string, unknown> = {
    notification: {
      ...(title && { title }),
      body: message,
      ...(sound && { sound }),
    },
    ...(customData && { data: customData }),
  };

  // SNS requires a JSON structure with 'default' and platform-specific keys
  return JSON.stringify({
    default: message,
    [platformKey]: JSON.stringify(fcmPayload),
  });
}

/**
 * Publish a push notification directly to a device using AWS SNS with GCM
 * This method sends notifications directly without requiring topics or subscriptions
 *
 * @param params - Push notification parameters
 * @returns Promise with publish result
 */
export async function publishPushNotification(
  params: PublishPushNotificationParams,
): Promise<PublishPushNotificationResponse> {
  try {
    const { platformApplicationArn, deviceToken, message } = params;

    // Validate required fields
    if (!platformApplicationArn || !deviceToken || !message) {
      return {
        success: false,
        error: 'platformApplicationArn, deviceToken, and message are required',
      };
    }

    // Build FCM message payload
    const messagePayload = buildFCMMessagePayload(params);

    // Determine target ARN - if deviceToken is already an ARN, use it directly
    // Otherwise, create a platform endpoint from the device token
    let targetArn = deviceToken;

    if (!deviceToken.startsWith('arn:aws:sns:')) {
      // Create platform endpoint from device token
      try {
        const createEndpointCommand = new CreatePlatformEndpointCommand({
          PlatformApplicationArn: platformApplicationArn,
          Token: deviceToken,
        });

        const endpointResponse = await snsClient.send(createEndpointCommand);

        if (!endpointResponse.EndpointArn) {
          return {
            success: false,
            error: 'Failed to create platform endpoint',
          };
        }

        targetArn = endpointResponse.EndpointArn;
      } catch (endpointError) {
        // If endpoint already exists, the error will contain the existing ARN
        // AWS SNS returns an error with the existing endpoint ARN when trying to create a duplicate
        const errorMessage =
          endpointError instanceof Error ? endpointError.message : String(endpointError);
        const existingArnMatch = errorMessage.match(/arn:aws:sns:[^:]+:[^:]+:[^:]+:[^:]+:[^:]+/);

        if (existingArnMatch) {
          targetArn = existingArnMatch[0];
        } else {
          return {
            success: false,
            error: `Failed to create or retrieve endpoint: ${errorMessage}`,
          };
        }
      }
    }

    // Publish the message
    const command = new PublishCommand({
      TargetArn: targetArn,
      Message: messagePayload,
      MessageStructure: 'json', // GCM requires JSON message structure
    });

    const response = await snsClient.send(command);

    const result: PublishPushNotificationResponse = {
      success: true,
      endpointArn: targetArn,
    };

    if (response.MessageId) {
      result.messageId = response.MessageId;
    }

    return result;
  } catch (error) {
    console.error('Error publishing push notification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Send an SMS directly to a phone number using AWS SNS
 * This method sends SMS directly without requiring topics or subscriptions
 *
 * @param params - SMS parameters
 * @returns Promise with send result
 */
export async function sendSMS(params: SendSMSParams): Promise<SendSMSResponse> {
  try {
    const { phoneNumber, message } = params;

    // Validate required fields
    if (!phoneNumber || !message) {
      return {
        success: false,
        error: 'phoneNumber and message are required',
      };
    }

    // Validate phone number format (basic E.164 format check)
    // E.164 format: +[country code][number] (e.g., +1234567890)
    const phoneNumberRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneNumberRegex.test(phoneNumber)) {
      return {
        success: false,
        error: 'phoneNumber must be in E.164 format (e.g., +1234567890)',
      };
    }

    // Validate message length (AWS SNS supports up to 1600 characters)
    if (message.length > 1600) {
      return {
        success: false,
        error: 'message must not exceed 1600 characters',
      };
    }

    // Build publish command for SMS
    const commandParams: {
      PhoneNumber: string;
      Message: string;
      MessageAttributes?: Record<string, { DataType: string; StringValue: string }>;
    } = {
      PhoneNumber: phoneNumber,
      Message: message,
    };

    // Add sender ID if provided (for supported regions)
    if (params.senderId) {
      commandParams.MessageAttributes = {
        'AWS.SNS.SMS.SenderID': {
          DataType: 'String',
          StringValue: params.senderId,
        },
      };
    }

    const command = new PublishCommand(commandParams);

    const response = await snsClient.send(command);

    const result: SendSMSResponse = {
      success: true,
    };

    if (response.MessageId) {
      result.messageId = response.MessageId;
    }

    return result;
  } catch (error) {
    console.error('Error sending SMS:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
