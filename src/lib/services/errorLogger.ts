import { ErrorLog, IErrorLog } from '@/lib/db/models/ErrorLog';
import { AppError } from '@/lib/errors/AppError';
import { connectDB } from '@/lib/db';
import { headers } from 'next/headers';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

interface ErrorLogOptions {
  error: unknown;
  request?: Request;
  severity?: IErrorLog['severity'];
  details?: any;
}

export class ErrorLogger {
  private static async getRequestInfo(request?: Request) {
    if (!request) return {};

    const headersList = headers();
    const session = await getServerSession(authOptions);
    const url = new URL(request.url);

    let requestBody;
    if (request.body) {
      try {
        const clonedRequest = request.clone();
        requestBody = await clonedRequest.json();
      } catch {
        // Ignore body parsing errors
      }
    }

    return {
      path: url.pathname,
      method: request.method,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      userRole: session?.user?.role,
      ip: headersList.get('x-forwarded-for') || headersList.get('x-real-ip'),
      userAgent: headersList.get('user-agent'),
      requestBody,
      requestQuery: Object.fromEntries(url.searchParams),
    };
  }

  private static getSeverity(error: unknown): IErrorLog['severity'] {
    if (error instanceof AppError) {
      if (error.status >= 500) return 'critical';
      if (error.status >= 400) return 'medium';
      return 'low';
    }
    return 'high';
  }

  private static getErrorInfo(error: unknown) {
    if (error instanceof AppError) {
      return {
        code: error.code,
        message: error.message,
        stack: error.stack,
        details: error.details,
      };
    }

    if (error instanceof Error) {
      return {
        code: 'INTERNAL_ERROR',
        message: error.message,
        stack: error.stack,
      };
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: String(error),
    };
  }

  static async log({
    error,
    request,
    severity: customSeverity,
    details: customDetails,
  }: ErrorLogOptions) {
    try {
      await connectDB();

      const errorInfo = this.getErrorInfo(error);
      const requestInfo = await this.getRequestInfo(request);
      const severity = customSeverity || this.getSeverity(error);

      const errorLog = new ErrorLog({
        ...errorInfo,
        ...requestInfo,
        severity,
        details: {
          ...errorInfo.details,
          ...customDetails,
        },
      });

      await errorLog.save();

      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error logged:', {
          code: errorLog.code,
          message: errorLog.message,
          path: errorLog.path,
          severity: errorLog.severity,
        });
      }

      return errorLog;
    } catch (loggingError) {
      // Fallback to console if MongoDB logging fails
      console.error('Error logging failed:', loggingError);
      console.error('Original error:', error);
    }
  }

  static async markResolved(errorId: string, resolution: string, resolvedBy: string) {
    try {
      await connectDB();
      
      const errorLog = await ErrorLog.findById(errorId);
      if (!errorLog) {
        throw new Error('Error log not found');
      }

      errorLog.resolved = true;
      errorLog.resolvedAt = new Date();
      errorLog.resolvedBy = resolvedBy;
      errorLog.resolution = resolution;

      await errorLog.save();
      return errorLog;
    } catch (error) {
      console.error('Failed to mark error as resolved:', error);
      throw error;
    }
  }

  static async getUnresolvedErrors(severity?: IErrorLog['severity']) {
    try {
      await connectDB();

      const query = { resolved: false };
      if (severity) {
        Object.assign(query, { severity });
      }

      return await ErrorLog.find(query)
        .sort({ timestamp: -1 })
        .limit(100);
    } catch (error) {
      console.error('Failed to fetch unresolved errors:', error);
      throw error;
    }
  }
} 