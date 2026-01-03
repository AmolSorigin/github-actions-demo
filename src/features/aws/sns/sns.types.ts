/**
 * Parameters for publishing a push notification directly to a device using FCM
 */
export interface PublishPushNotificationParams {
  /**
   * FCM Platform Application ARN (required for push notifications)
   */
  platformApplicationArn: string;
  /**
   * FCM device token or Endpoint ARN
   */
  deviceToken: string;
  /**
   * Message to send
   */
  message: string;
  /**
   * Optional title for the notification
   */
  title?: string;
  /**
   * Optional badge count
   */
  badge?: number;
  /**
   * Optional sound file name
   */
  sound?: string;
  /**
   * Optional custom data payload (key-value pairs)
   */
  customData?: Record<string, string | number | boolean>;
}

/**
 * Response from publishing a push notification
 */
export interface PublishPushNotificationResponse {
  success: boolean;
  messageId?: string;
  endpointArn?: string;
  error?: string;
}

/**
 * Parameters for sending an SMS directly to a phone number
 */
export interface SendSMSParams {
  /**
   * Phone number in E.164 format (e.g., +1234567890)
   * Must include country code
   */
  phoneNumber: string;
  /**
   * Message to send (max 1600 characters for single SMS)
   * AWS SNS will automatically split longer messages into multiple SMS
   */
  message: string;
  /**
   * Optional sender ID (for some regions)
   * Note: Not all regions support custom sender IDs
   */
  senderId?: string;
}

/**
 * Response from sending an SMS
 */
export interface SendSMSResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}
