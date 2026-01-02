import { SESClient } from '@aws-sdk/client-ses';
import { envConfig } from '../../../config/env';

// Validate AWS configuration
if (!envConfig.aws.accessKeyId || !envConfig.aws.secretAccessKey) {
  console.warn(
    'Warning: AWS credentials are not configured. Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in your .env file.',
  );
}

// Initialize and export SES Client
export const sesClient = new SESClient({
  region: envConfig.aws.region,
  credentials: {
    accessKeyId: envConfig.aws.accessKeyId,
    secretAccessKey: envConfig.aws.secretAccessKey,
  },
});
