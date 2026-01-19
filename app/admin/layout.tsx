import AuthGuard from '@/components/AuthGuard';

/**
 * Admin Layout - Wraps all /admin routes with authentication protection
 * 
 * This layout applies AuthGuard to all admin pages, ensuring that
 * unauthenticated users are redirected to the login page.
 * 
 * ROUTE STRUCTURE:
 * /admin              → Dashboard (protected)
 * /admin/login        → Login page (public, but skipped by AuthGuard)
 * /admin/projects     → Projects management (protected)
 * 
 * HOW IT WORKS:
 * 1. User navigates to any /admin/* route
 * 2. This layout wraps the page with AuthGuard
 * 3. AuthGuard checks authentication status
 * 4. If not authenticated → redirect to /admin/login
 * 5. If authenticated → render the requested page
 * 
 * PRODUCTION CONSIDERATIONS:
 * When upgrading to server-side authentication:
 * - This client-side guard can remain as a UI optimization
 * - Add middleware.ts for server-side protection (primary security)
 * - Or convert admin pages to async Server Components with auth checks
 * - Always validate auth on API routes regardless of client protection
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard>{children}</AuthGuard>;
}
