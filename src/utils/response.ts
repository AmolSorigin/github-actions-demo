import { Response } from 'express';
import { HTTP_STATUS } from '../constants/statusCodes';
import { ERROR_MESSAGES } from '../constants/errorMessages';

/**
 * Standard API Response Interface
 * Success: { success: true, message: string, data?: T }
 * Error: { success: false, error: string, data?: T }
 */
export interface SuccessResponse<T = unknown> {
  success: true;
  message: string;
  data?: T;
}

export interface ErrorResponse<T = unknown> {
  success: false;
  error: string;
  data?: T;
}

export type ApiResponse<T = unknown> = SuccessResponse<T> | ErrorResponse<T>;

/**
 * Send success response
 */
export function sendSuccessResponse<T>(
  res: Response,
  statusCode: number = HTTP_STATUS.OK,
  message: string,
  data?: T,
): Response {
  const response: SuccessResponse<T> = {
    success: true,
    message,
    ...(data && { data }),
  };

  return res.status(statusCode).json(response);
}

/**
 * Send error response
 */
export function sendErrorResponse(
  res: Response,
  statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
  error: string,
  data?: unknown,
): Response {
  const response: ErrorResponse = {
    success: false,
    error,
  };

  if (data !== undefined) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
}

/**
 * Send validation error response
 */
export function sendValidationErrorResponse(res: Response, details: string[]): Response {
  return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, ERROR_MESSAGES.VALIDATION_FAILED, {
    details,
  });
}

/**
 * Send not found response
 */
export function sendNotFoundResponse(res: Response, resource?: string): Response {
  const error = resource ? `${resource} not found` : ERROR_MESSAGES.NOT_FOUND;

  return sendErrorResponse(res, HTTP_STATUS.NOT_FOUND, error, undefined);
}

/**
 * Send internal server error response
 */
export function sendInternalServerErrorResponse(res: Response, error?: string): Response {
  return sendErrorResponse(
    res,
    HTTP_STATUS.INTERNAL_SERVER_ERROR,
    error || ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    undefined,
  );
}

/**
 * Send unauthorized response
 */
export function sendUnauthorizedResponse(res: Response): Response {
  return sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, ERROR_MESSAGES.UNAUTHORIZED, undefined);
}
