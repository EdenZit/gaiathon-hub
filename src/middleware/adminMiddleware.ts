import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { authOptions } from '@/lib/auth';

export async function adminMiddleware(request: NextRequest): Promise<boolean> {
  try {
    // Skip middleware for OPTIONS requests (CORS preflight)
    if (request.method === 'OPTIONS') {
      return true;
    }

    // JWT verification with auth options
    const token = await getToken({ 
      req: request,
      secret: authOptions.secret
    });

    if (!token || token.role !== 'admin') {
      console.error('Admin middleware: Unauthorized access attempt', {
        method: request.method,
        path: request.nextUrl.pathname,
        role: token?.role,
        token: token ? 'present' : 'missing'
      });
      return false;
    }

    return true;
  } catch (error) {
    console.error('Admin middleware error:', error);
    return false;
  }
}

export const config = {
  matcher: [
    '/api/admin/:path*',
    '/dashboard/admin/:path*'
  ]
}; 