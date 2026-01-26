/**
 * Server-side Authentication Utilities
 * 
 * These functions run on the server (API routes, middleware)
 * to validate authentication.
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';

/**
 * Create Supabase client for server-side operations
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // This can fail in middleware, that's ok
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // This can fail in middleware, that's ok
          }
        },
      },
    }
  );
}

/**
 * Create Supabase client for middleware
 */
export function createMiddlewareSupabaseClient(request: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );
}

/**
 * Get authenticated user from server-side
 * Returns user if authenticated
 */
export async function getAuthenticatedUser() {
  const supabase = await createServerSupabaseClient();
  
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return null;
  }

  return user;
}

/**
 * Require authentication for API route
 * Throws error if not authenticated
 */
export async function requireAuth() {
  const user = await getAuthenticatedUser();
  
  if (!user) {
    throw new Error('Unauthorized');
  }

  return user;
}
