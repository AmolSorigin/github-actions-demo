import { Router, Request, Response } from 'express';
import { envConfig } from '../config/env';
import { HTTP_STATUS } from '../constants';
import { sendSuccessResponse } from '../utils/response';

const router = Router();

/**
 * GET /
 * Root endpoint
 */
router.get('/', (_req: Request, res: Response): Response => {
  return sendSuccessResponse(res, HTTP_STATUS.OK, 'API is running');
});

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/api/health', (_req: Request, res: Response): Response => {
  return sendSuccessResponse(res, HTTP_STATUS.OK, 'Health check successful', {
    status: 'ok',
    environment: envConfig.nodeEnv,
    timestamp: new Date().toISOString(),
    test: 'prod testing',
  });
});

/**
 * GET /api/test
 * Test endpoint
 */
router.get('/api/test', (_req: Request, res: Response): Response => {
  return sendSuccessResponse(res, HTTP_STATUS.OK, 'Test endpoint working');
});

export default router;
