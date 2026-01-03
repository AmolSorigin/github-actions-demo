import express from 'express';
import { envConfig } from './config/env';
import routes from './routes';

const app = express();

const { nodeEnv, port } = envConfig;

app.use(express.json());

// Use all routes from routes folder
app.use(routes);

app.listen(port, () => {
  console.log(`Server running in ${nodeEnv} mode on port ${port}`);
});
