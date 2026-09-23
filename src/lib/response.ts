import { NextResponse } from 'next/server';
import { AppError } from './errors';
import { ZodError } from 'zod';

export interface ApiResponse<T> {
  success: true;
  statusCode: number;
  message: string;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    totalRecords?: number;
    totalPages?: number;
    timestamp: string;
  };
}

export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  error: {
    code: string;
    message: string;
    details?: Array<{ field: string; issue: string }>;
  };
  timestamp: string;
}

export function apiSuccess<T>(
  data: T,
  message: string = 'Operation completed successfully',
  statusCode: number = 200,
  meta?: ApiResponse<T>['meta']
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      statusCode,
      message,
      data,
      meta: meta
        ? {
            ...meta,
            timestamp: meta.timestamp || new Date().toISOString(),
          }
        : undefined,
    },
    { status: statusCode }
  );
}

export function apiError(
  error: unknown,
  fallbackMessage: string = 'An unexpected error occurred'
): NextResponse<ApiErrorResponse> {
  const timestamp = new Date().toISOString();

  if (error instanceof ZodError) {
    const details = error.errors.map((err) => ({
      field: err.path.join('.'),
      issue: err.message,
    }));
    return NextResponse.json(
      {
        success: false,
        statusCode: 400,
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Invalid request parameters',
          details,
        },
        timestamp,
      },
      { status: 400 }
    );
  }

  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        statusCode: error.statusCode,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
        timestamp,
      },
      { status: error.statusCode }
    );
  }

  const message = error instanceof Error ? error.message : fallbackMessage;
  console.error('[API_INTERNAL_ERROR]', error);

  return NextResponse.json(
    {
      success: false,
      statusCode: 500,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: process.env.NODE_ENV === 'production' ? 'Internal server error' : message,
      },
      timestamp,
    },
    { status: 500 }
  );
}
