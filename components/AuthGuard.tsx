'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * AuthGuard Component - Protects admin routes from unauthenticated access
 * 
 * CURRENT IMPLEMENTATION (Development Only):
 * - Checks authentication state from localStorage (client-side)
 * - Redirects to login page if not authenticated
 * - Shows loading state during auth check
 * 
 * ⚠️ LIMITATIONS:
 * - Runs client-side only (component mounts before check happens)
 * - Brief flash of content before redirect on slow connections
 * - Can be bypassed by disabling JavaScript
 * - No protection at the network/server level
 * 
 * 🔒 PRODUCTION UPGRADE PATH:
 * 
 * 1. SERVER-SIDE SESSION COOKIES:
 *    - Replace localStorage with HTTP-only, Secure cookies
 *    - Set cookie on successful login from API route
 *    - Cookie contains signed session token or JWT
 * 
 * 2. NEXT.JS MIDDLEWARE (middleware.ts):
 *    - Intercepts requests at Edge before page renders
 *    - Checks cookie validity server-side
 *    - Redirects before any content is sent to client
 *    - Example:
 *      ```typescript
 *      export function middleware(request: NextRequest) {
 *        const sessionCookie = request.cookies.get('session');
 *        if (!sessionCookie && request.nextUrl.pathname.startsWith('/admin')) {
 *          return NextResponse.redirect(new URL('/admin/login', request.url));
 *        }
 *      }
 *      ```
 * 
 * 3. SERVER COMPONENTS:
 *    - Use async Server Components for admin pages
 *    - Check auth in component before rendering
 *    - No client-side code needed
 *    - Example:
 *      ```typescript
 *      export default async function AdminPage() {
 *        const session = await getServerSession();
 *        if (!session) redirect('/admin/login');
 *        // render protected content
 *      }
 *      ```
 * 
 * 4. AUTHENTICATION LIBRARIES:
 *    - Consider NextAuth.js (Auth.js) for robust solution
 *    - Handles sessions, cookies, middleware automatically
 *    - Supports multiple auth providers
 *    - Built-in CSRF protection
 * 
 * 5. API ROUTE PROTECTION:
 *    - Don't forget to protect API routes too
 *    - Check session in every protected API handler
 *    - Return 401 Unauthorized if not authenticated
 */
export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Skip auth check for login page
    if (pathname === '/admin/login') {
      setIsChecking(false);
      return;
    }

    // Check authentication
    const authenticated = isAuthenticated();

    if (!authenticated) {
      // Store the intended destination to redirect back after login
      const returnUrl = pathname || '/admin';
      router.push(`/admin/login?returnUrl=${encodeURIComponent(returnUrl)}`);
    } else {
      setIsChecking(false);
    }
  }, [pathname, router]);

  // Show loading state while checking auth
  if (isChecking && pathname !== '/admin/login') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <svg 
            className="animate-spin h-12 w-12 text-primary mx-auto mb-4" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4" 
              fill="none" 
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" 
            />
          </svg>
          <p className="text-slate-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
