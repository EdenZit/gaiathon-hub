import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function adminMiddleware(request: NextRequest): Promise<boolean> {
  try {
    // JWT verification only for now
    // We'll add rate limiting back once Redis is properly configured
    const token = await getToken({ req: request });
    if (!token || token.role !== 'admin') {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Admin middleware error:', error);
    return false;
  }
}

export const config = {
  matcher: '/api/admin/:path*',
}; 