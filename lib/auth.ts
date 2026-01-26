/**
 * Authentication Service using Supabase Auth
 * 
 * Features:
 * - Email/Password authentication
 * - Session management with HTTP-only cookies
 * - Server and client-side auth checks
 */

import { supabase } from './supabase/client';
import type { User } from '@supabase/supabase-js';

/**
 * Sign in with email and password
 */
export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return { data, error };
}

/**
 * Sign up new user with email and password
 */
export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  return { data, error };
}

/**
 * Sign out current user
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

/**
 * Get current user session (client-side)
 */
export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * Get current session (client-side)
 */
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

/**
 * Check if user is authenticated (client-side)
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}

/**
 * Subscribe to auth state changes
 */
export function onAuthStateChange(callback: (user: User | null) => void) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user || null);
  });

  return () => {
    subscription.unsubscribe();
  };
}

/**
 * Request password reset
 */
export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/admin/reset-password`,
  });

  if (error) {
    throw error;
  }
}

/**
 * Update user password
 */
export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    throw error;
  }
}

// Legacy functions for backwards compatibility (deprecated)
export function attemptLogin(): boolean {
  console.warn('attemptLogin is deprecated. Use signInWithEmail instead.');
  return false;
}

export function logout(): void {
  console.warn('logout is deprecated. Use signOut instead.');
  signOut();
}

// Helper to check auth on page load
export function requireAuth(router: any): boolean {
  if (!isAuthenticated()) {
    router.push('/admin/login');
    return false;
  }
  return true;
}
