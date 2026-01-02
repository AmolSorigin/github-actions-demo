import express from 'express';
import { envConfig } from './config/env';
import { sesRouter } from './features/aws/ses';
import { snsRouter } from './features/aws/sns';

const app = express();

const { nodeEnv, port } = envConfig;

app.use(express.json());

// Root endpoint
app.get('/', (_req, res) => {
  res.status(200).json({ message: 'API is running' });
});

// Health endpoint
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    environment: nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

// Test endpoint
app.get('/api/test', (_req, res) => {
  res.status(200).json({
    message: 'Test endpoint working',
  });
});

// AWS SES Email routes
app.use('/api/aws/ses', sesRouter);

// AWS SNS Push Notification routes
app.use('/api/aws/sns', snsRouter);

app.listen(port, () => {
  console.log(`Server running in ${nodeEnv} mode on port ${port}`);
});
