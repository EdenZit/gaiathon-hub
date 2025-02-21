import { NextResponse } from 'next/server';
import { AppError } from '@/lib/errors/AppError';
import { ZodError } from 'zod';
import { MongoServerError } from 'mongodb';
import { ErrorLogger } from '@/lib/services/errorLogger';

interface ErrorResponse {
  error: string;
  code?: string;
  details?: any;
}

export async function handleApiError(
  error: unknown,
  request?: Request
): Promise<NextResponse<ErrorResponse>> {
  // Log the error
  await ErrorLogger.log({ error, request });

  // Handle our custom AppError
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        details: error.details,
      },
      { status: error.status }
    );
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const details = error.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message,
    }));

    return NextResponse.json(
      {
        error: 'Validation error',
        code: 'VALIDATION_ERROR',
        details,
      },
      { status: 400 }
    );
  }

  // Handle Mongoose/MongoDB errors
  if (error instanceof MongoServerError) {
    if (error.code === 11000) { // Duplicate key error
      return NextResponse.json(
        {
          error: 'Duplicate entry',
          code: 'DUPLICATE_ERROR',
          details: error.keyValue,
        },
        { status: 409 }
      );
    }
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    return NextResponse.json(
      {
        error: error.message,
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }

  // Handle unknown errors
  return NextResponse.json(
    {
      error: 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
    },
    { status: 500 }
  );
}

export function createApiHandler(handler: Function) {
  return async function(req: Request, ...args: any[]) {
    try {
      return await handler(req, ...args);
    } catch (error) {
      return handleApiError(error, req);
    }
  };
} 