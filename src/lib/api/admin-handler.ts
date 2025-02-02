import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logAdminAction } from '@/lib/services/audit-logger';
import { ZodSchema } from 'zod';
import { headers } from 'next/headers';

interface AdminRouteConfig {
  validation?: {
    body?: ZodSchema;
    query?: ZodSchema;
  };
  auditLog?: {
    action: string;
    resource: string;
    getDetails?: (data: any) => Record<string, any>;
  };
}

export function createAdminHandler(
  handler: (req: NextRequest) => Promise<NextResponse>,
  config?: AdminRouteConfig
) {
  return async function(req: NextRequest): Promise<NextResponse> {
    try {
      // 1. Authentication & Authorization
      const session = await getServerSession(authOptions);
      if (!session?.user || session.user.role !== 'admin') {
        return new NextResponse('Unauthorized', { status: 401 });
      }

      // 2. Input Validation
      if (config?.validation) {
        try {
          if (config.validation.body) {
            const body = await req.json();
            config.validation.body.parse(body);
          }
          if (config.validation.query) {
            const { searchParams } = new URL(req.url);
            const query = Object.fromEntries(searchParams.entries());
            config.validation.query.parse(query);
          }
        } catch (error) {
          return NextResponse.json(
            { error: 'Validation failed', details: error },
            { status: 400 }
          );
        }
      }

      // 3. Execute Handler
      const response = await handler(req);

      // 4. Audit Logging
      if (config?.auditLog) {
        const headersList = headers();
        await logAdminAction({
          action: config.auditLog.action,
          resource: config.auditLog.resource,
          details: config.auditLog.getDetails?.(await req.json()),
          ipAddress: req.ip,
          userAgent: headersList.get('user-agent') || undefined,
        });
      }

      return response;
    } catch (error) {
      console.error('Admin API Error:', error);
      
      // 5. Error Handling
      if (error instanceof Error) {
        return NextResponse.json(
          { 
            error: error.message,
            code: (error as any).code,
          },
          { status: (error as any).status || 500 }
        );
      }
      
      return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      );
    }
  };
} 