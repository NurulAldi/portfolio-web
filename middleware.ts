import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareSupabaseClient } from './lib/auth-server';

/**
 * Next.js Middleware for Route Protection
 * 
 * Protects /admin routes (except /admin/login) by:
 * 1. Checking for valid Supabase session
 * 2. Redirecting to login if not authenticated
 */

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip auth check for login page
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  // Check if accessing admin routes
  if (pathname.startsWith('/admin')) {
    try {
      const response = NextResponse.next();
      const supabase = createMiddlewareSupabaseClient(request);
      
      // Get current session
      const { data: { user }, error } = await supabase.auth.getUser();

      // If no user or error, redirect to login
      if (error || !user) {
        const loginUrl = new URL('/admin/login', request.url);
        loginUrl.searchParams.set('returnUrl', pathname);
        return NextResponse.redirect(loginUrl);
      }

      // User is authenticated
      return response;
    } catch (error) {
      console.error('Middleware auth error:', error);
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
  ],
};
