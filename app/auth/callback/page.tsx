'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

/**
 * Auth Callback Page
 * Handles OAuth redirect from Supabase after Google sign-in
 */
export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // Handle the OAuth callback
    const handleCallback = async () => {
      try {
        // Get the session from the URL hash
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Auth callback error:', error);
          router.push('/admin/login?error=callback_failed');
          return;
        }

        if (session) {
          // Successfully authenticated, redirect to admin
          router.push('/admin');
        } else {
          // No session, redirect to login
          router.push('/admin/login');
        }
      } catch (error) {
        console.error('Callback handling error:', error);
        router.push('/admin/login?error=callback_failed');
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-600 font-medium">Completing sign in...</p>
      </div>
    </div>
  );
}
