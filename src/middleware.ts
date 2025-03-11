import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const isAuth = !!token;
  const isAdmin = token?.role === 'admin';
  const isAuthPage = request.nextUrl.pathname.startsWith('/register') || 
                    request.nextUrl.pathname.startsWith('/login') ||
                    request.nextUrl.pathname.startsWith('/admin-login');
  const isAdminRoute = request.nextUrl.pathname.startsWith('/dashboard/admin') ||
                      request.nextUrl.pathname.startsWith('/admin');
  
  // Exclude blog and FAQ from protected routes
  const isPublicResource = 
    request.nextUrl.pathname.startsWith('/resources/blog') ||
    request.nextUrl.pathname.startsWith('/resources/faq');
  
  const isProtectedRoute = 
    (request.nextUrl.pathname.startsWith('/resources') && !isPublicResource) ||
    request.nextUrl.pathname.startsWith('/dashboard');

  // Add response headers for security
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Allow direct access to admin-login page
  if (request.nextUrl.pathname === '/admin-login') {
    return response;
  }

  // Redirect authenticated users away from auth pages
  if (isAuth && isAuthPage) {
    if (isAdmin) {
      return NextResponse.redirect(new URL('/dashboard/admin', request.url));
    }
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Handle admin routes
  if (isAdminRoute) {
    if (!isAuth) {
      const redirectUrl = new URL('/admin-login', request.url);
      redirectUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Redirect unauthenticated users to register page
  if (!isAuth && isProtectedRoute) {
    const redirectUrl = new URL('/register', request.url);
    redirectUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Check if maintenance mode is enabled via environment variable
  const isMaintenanceMode = process.env.MAINTENANCE_MODE === 'true';
  
  // Get the path from the URL
  const path = request.nextUrl.pathname;
  
  // List of paths that should be accessible during maintenance
  const allowedPaths = [
    '/maintenance',
    '/api/health', // Health check endpoint if you have one
    '/_next', // Next.js assets
    '/images', // Static images
    '/favicon', // Favicon
    '/admin-login', // Allow admin login during maintenance
    '/api/auth', // Auth API routes needed for admin login
  ];
  
  // Check if the current path is allowed during maintenance
  const isAllowedPath = allowedPaths.some(allowedPath => 
    path === allowedPath || path.startsWith(allowedPath + '/')
  );
  
  // If maintenance mode is enabled and the path is not allowed, check if user is admin
  if (isMaintenanceMode && !isAllowedPath) {
    // Allow admin users to bypass maintenance mode
    if (isAdmin) {
      return response;
    }
    
    // Redirect non-admin users to maintenance page
    return NextResponse.redirect(new URL('/maintenance', request.url));
  }

  return response;
}

// Configure which paths should be processed by the middleware
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/resources/:path*',
    '/register',
    '/login',
    '/admin-login',
    /*
     * Match all request paths except:
     * 1. /api/auth/* (authentication routes)
     * 2. /_next/static (static files)
     * 3. /_next/image (image optimization files)
     * 4. /favicon.ico (favicon file)
     * 5. /maintenance (maintenance page itself)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|maintenance).*)',
  ],
}; 