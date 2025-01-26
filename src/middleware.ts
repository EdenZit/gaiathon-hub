import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // Add custom middleware logic here if needed
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/login',
    },
  }
);

// Protect routes
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/user/:path*',
    '/api/users/:path*',
    '/api/teams/:path*',
    '/api/integrations/:path*',
    '/resources/team-workspace/:path*'
  ],
}; 