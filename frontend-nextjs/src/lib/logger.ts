// Production-grade logging utility
export const logger = {
  info: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[INFO] ${message}`, data);
    }
    // In production, send to logging service (e.g., Sentry, LogRocket)
  },
  
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, error);
    // In production, send to error tracking service
  },
  
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${message}`, data);
  },
  
  debug: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, data);
    }
  }
};

// Authentication error types for better error handling
export enum AuthErrorType {
  EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  RATE_LIMITED = 'RATE_LIMITED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export class AuthError extends Error {
  constructor(
    public type: AuthErrorType,
    message: string,
    public email?: string
  ) {
    super(message);
    this.name = 'AuthError';
  }
}
