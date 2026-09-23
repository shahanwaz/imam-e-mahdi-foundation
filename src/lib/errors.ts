export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: Array<{ field: string; issue: string }>;

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR', details?: Array<{ field: string; issue: string }>) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', details?: Array<{ field: string; issue: string }>) {
    super(message, 400, 'VALIDATION_FAILED', details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Access denied: insufficient permissions') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource already exists or conflict occurred') {
    super(message, 409, 'CONFLICT');
  }
}

export class TwoFactorRequiredError extends AppError {
  constructor(message: string = 'Two-factor authentication code required') {
    super(message, 403, '2FA_REQUIRED');
  }
}
