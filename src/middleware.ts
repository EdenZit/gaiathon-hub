import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAdminRoute = req.nextUrl.pathname.startsWith('/dashboard/admin');
    const isAdminApiRoute = req.nextUrl.pathname.startsWith('/api/admin');
    
    // Protect admin routes and API endpoints
    if ((isAdminRoute || isAdminApiRoute) && token?.role !== 'admin') {
      // If trying to access admin API, return 403
      if (isAdminApiRoute) {
        return NextResponse.json(
          { error: 'Unauthorized - Admin access required' },
          { status: 403 }
        );
      }
      // If trying to access admin UI routes, redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // For protected routes, redirect unauthenticated users to register
    if (!token) {
      return NextResponse.redirect(new URL('/register', req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

// Protect routes
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/user/:path*',
    '/api/users/:path*',
    '/api/integrations/:path*',
    '/admin/:path*',
    '/api/admin/:path*',
  ],
}; 