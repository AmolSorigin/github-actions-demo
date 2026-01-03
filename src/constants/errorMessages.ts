/**
 * Error Messages
 */
export const ERROR_MESSAGES = {
  // Validation
  VALIDATION_FAILED: 'Validation failed',

  // General
  INTERNAL_SERVER_ERROR: 'Internal server error',
  NOT_FOUND: 'Resource not found',
  UNAUTHORIZED: 'Unauthorized access',

  // AWS SES
  EMAIL_SEND_FAILED: 'Failed to send email',

  // AWS SNS
  PUSH_NOTIFICATION_FAILED: 'Failed to send push notification',
  SMS_SEND_FAILED: 'Failed to send SMS',
} as const;
