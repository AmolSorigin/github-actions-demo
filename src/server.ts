import express from 'express';
import { envConfig } from './config/env';

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

app.listen(port, () => {
  console.log(`Server running in ${nodeEnv} mode on port ${port}`);
});
