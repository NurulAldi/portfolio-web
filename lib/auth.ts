/*
 * ⚠️ SECURITY WARNING - TEMPORARY CLIENT-SIDE AUTH ⚠️
 * 
 * This is a PLACEHOLDER authentication implementation for development only.
 * 
 * CRITICAL LIMITATIONS:
 * - Credentials are hardcoded in client-side code (visible in browser)
 * - No password hashing or encryption
 * - Auth state stored in localStorage (can be manipulated by user)
 * - No session management or expiration
 * - No protection against XSS attacks
 * - Anyone can view source and see the password
 * 
 * FOR PRODUCTION, YOU MUST:
 * - Move authentication to server-side (API routes)
 * - Use proper password hashing (bcrypt, argon2)
 * - Implement HTTP-only secure cookies for session management
 * - Add CSRF protection
 * - Use environment variables for credentials
 * - Implement proper session expiration
 * - Consider using NextAuth.js or similar robust auth solution
 */

// ⚠️ TEMPORARY HARDCODED CREDENTIALS - DO NOT USE IN PRODUCTION
const TEMP_CREDENTIALS = {
  username: 'admin',
  password: 'password123', // ⚠️ Never hardcode passwords in real applications!
};

const AUTH_STORAGE_KEY = 'portfolio_auth_temp'; // ⚠️ localStorage is not secure

export function attemptLogin(username: string, password: string): boolean {
  // ⚠️ This is completely insecure - credentials are checked client-side
  if (username === TEMP_CREDENTIALS.username && password === TEMP_CREDENTIALS.password) {
    // ⚠️ Storing auth state in localStorage can be manipulated by user
    localStorage.setItem(AUTH_STORAGE_KEY, 'true');
    return true;
  }
  return false;
}

export function isAuthenticated(): boolean {
  // ⚠️ This can be easily bypassed by manually setting localStorage
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(AUTH_STORAGE_KEY) === 'true';
}

export function logout(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

// Helper to check auth on page load
export function requireAuth(router: any): boolean {
  if (!isAuthenticated()) {
    router.push('/admin/login');
    return false;
  }
  return true;
}
