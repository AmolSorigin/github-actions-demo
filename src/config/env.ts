import dotenv from 'dotenv';
import path from 'path';

dotenv.config({
  path: path.resolve(process.cwd(), `.env.${process.env.NODE_ENV ?? 'development'}`),
});

export const envConfig = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT) || 3000,
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    ses: {
      fromEmail: process.env.AWS_SES_FROM_EMAIL || '',
    },
    sns: {
      // Optional: Default platform application ARN (can be overridden in request)
      defaultPlatformApplicationArn: process.env.AWS_SNS_PLATFORM_APPLICATION_ARN || '',
    },
  },
};
