import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequestWithAuth } from 'next-auth/middleware';

export default async function middleware(req: NextRequestWithAuth) {
  const token = await getToken({ req });
  const isAuthenticated = !!token;

  // Protected routes pattern
  const protectedRoutes = [
    '/resources/team-workspace',
    '/dashboard',
    '/api/teams',
  ];

  const isProtectedRoute = protectedRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  );

  if (isProtectedRoute && !isAuthenticated) {
    const redirectUrl = new URL('/register', req.url);
    redirectUrl.searchParams.set('callbackUrl', req.url);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/resources/:path*',
    '/dashboard/:path*',
    '/api/teams/:path*',
  ],
}; 