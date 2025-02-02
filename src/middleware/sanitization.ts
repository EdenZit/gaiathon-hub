import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createHash } from 'crypto';
import xss from 'xss';

interface SanitizedRequest extends NextRequest {
  sanitizedBody?: any;
}

const sanitizeValue = (value: any): any => {
  if (typeof value === 'string') {
    // Sanitize string values
    return xss(value, {
      whiteList: {}, // Disable all tags
      stripIgnoreTag: true,
      stripIgnoreTagBody: ['script'] // Remove script tags and their contents
    });
  }
  if (Array.isArray(value)) {
    // Recursively sanitize arrays
    return value.map(item => sanitizeValue(item));
  }
  if (value && typeof value === 'object') {
    // Recursively sanitize objects
    return Object.keys(value).reduce((acc, key) => ({
      ...acc,
      [key]: sanitizeValue(value[key])
    }), {});
  }
  return value;
};

const generateHash = (data: any): string => {
  const hash = createHash('sha256');
  hash.update(JSON.stringify(data));
  return hash.digest('hex');
};

export async function sanitizationMiddleware(request: SanitizedRequest) {
  // Only sanitize POST, PUT, and PATCH requests
  if (!['POST', 'PUT', 'PATCH'].includes(request.method)) {
    return NextResponse.next();
  }

  try {
    // Clone the request to modify it
    const response = NextResponse.next();

    // Get the request body
    const contentType = request.headers.get('content-type');
    let body;

    if (contentType?.includes('application/json')) {
      body = await request.json();
    } else if (contentType?.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      body = Object.fromEntries(formData);
    } else {
      // Skip sanitization for other content types
      return response;
    }

    // Sanitize the body
    const sanitizedBody = sanitizeValue(body);

    // Add sanitization headers
    const originalHash = generateHash(body);
    const sanitizedHash = generateHash(sanitizedBody);
    
    response.headers.set('X-Content-Original-Hash', originalHash);
    response.headers.set('X-Content-Sanitized-Hash', sanitizedHash);
    
    if (originalHash !== sanitizedHash) {
      response.headers.set('X-Content-Modified', 'true');
    }

    // Attach sanitized body to the request for later middleware
    request.sanitizedBody = sanitizedBody;

    return response;
  } catch (error) {
    console.error('Error in sanitization middleware:', error);
    return new NextResponse('Bad Request', { status: 400 });
  }
}

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)'
  ]
}; 