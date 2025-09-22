import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types/index.js';

export function errorHandler(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('❌ Error:', error);

  const response: ApiResponse = {
    success: false,
    error: error.message || 'Internal server error',
    timestamp: new Date().toISOString(),
  };

  // Determine status code
  let statusCode = 500;
  if (error.status) {
    statusCode = error.status;
  } else if (error.message?.includes('not found')) {
    statusCode = 404;
  } else if (error.message?.includes('validation')) {
    statusCode = 400;
  }

  res.status(statusCode).json(response);
}