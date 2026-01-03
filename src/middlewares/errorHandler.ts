import { Request, Response, NextFunction } from 'express';
import { sendInternalServerErrorResponse, sendNotFoundResponse } from '../utils/response';

/**
 * Global error handler middleware
 */
export function errorHandler(
  error: Error,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  console.error('Error:', error);

  sendInternalServerErrorResponse(res, error.message);
}

/**
 * 404 Not Found handler middleware
 */
export function notFoundHandler(_req: Request, res: Response): Response {
  return sendNotFoundResponse(res);
}
