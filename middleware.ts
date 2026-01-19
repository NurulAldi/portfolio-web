import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Middleware for Route Protection
 * 
 * ⚠️ CURRENTLY DISABLED - This file is a template for production use
 * 
 * CURRENT STATE:
 * This middleware is commented out because the current authentication
 * system uses localStorage (client-side only). Middleware runs on the
 * server/edge and cannot access localStorage.
 * 
 * WHEN TO ENABLE:
 * Enable this middleware after implementing server-side authentication
 * with HTTP-only cookies or session tokens.
 * 
 * HOW TO ENABLE:
 * 1. Implement server-side auth with cookies (see lib/auth.ts comments)
 * 2. Update the cookie name in the code below
 * 3. Uncomment the middleware export
 * 4. Update the matcher config if needed
 * 
 * WHAT THIS DOES:
 * - Intercepts ALL requests to /admin routes (except /admin/login)
 * - Checks for valid session cookie server-side
 * - Redirects to login if cookie is missing/invalid
 * - Runs BEFORE page components render (true protection)
 * 
 * BENEFITS OVER CLIENT-SIDE:
 * - No content flash - redirect happens before render
 * - Works even if JavaScript is disabled
 * - True server-side security boundary
 * - Protects API routes in the same file
 * 
 * EXAMPLE PRODUCTION IMPLEMENTATION:
 */

// Uncomment this after implementing cookie-based auth:
/*
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to login page
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  // Check for session cookie
  // TODO: Replace 'session_token' with your actual cookie name
  const sessionCookie = request.cookies.get('session_token');

  if (!sessionCookie) {
    // No session cookie - redirect to login
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('returnUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // TODO: Add cookie validation logic here
  // - Verify JWT signature
  // - Check expiration
  // - Validate against database session
  // Example:
  // const isValid = await verifySessionToken(sessionCookie.value);
  // if (!isValid) {
  //   return NextResponse.redirect(new URL('/admin/login', request.url));
  // }

  // Session is valid - allow access
  return NextResponse.next();
}

// Specify which routes this middleware applies to
export const config = {
  matcher: [
    // Apply to all /admin routes
    '/admin/:path*',
    // Optionally protect API routes too
    // '/api/admin/:path*',
  ],
};
*/

/**
 * ALTERNATIVE: API Route Protection
 * 
 * If you prefer not to use middleware, you can protect routes in individual
 * API handlers or create a helper wrapper:
 * 
 * ```typescript
 * // lib/auth-api.ts
 * export async function requireAuth(request: NextRequest) {
 *   const session = request.cookies.get('session_token');
 *   if (!session) {
 *     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 *   }
 *   // Validate session...
 *   return null; // null means auth passed
 * }
 * 
 * // app/api/admin/projects/route.ts
 * export async function POST(request: NextRequest) {
 *   const authError = await requireAuth(request);
 *   if (authError) return authError;
 *   
 *   // Handle authenticated request...
 * }
 * ```
 */

// Export empty default to satisfy Next.js
export default function middleware() {
  return NextResponse.next();
}
