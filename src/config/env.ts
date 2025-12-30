import dotenv from 'dotenv';

const envFile =
  process.env.NODE_ENV === 'production' ? 'env.production.example' : 'env.development.example';

dotenv.config({ path: envFile });

export const envConfig = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT) || 3000,
};
