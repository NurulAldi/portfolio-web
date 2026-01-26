/**
 * Simple in-memory rate limiting
 * For production, consider using Redis or Upstash
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private requests: Map<string, RateLimitEntry> = new Map();
  private readonly cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every minute
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.requests.entries()) {
        if (now > entry.resetTime) {
          this.requests.delete(key);
        }
      }
    }, 60000);
  }

  /**
   * Check if request should be rate limited
   * @param identifier - Unique identifier (IP address, user ID, etc.)
   * @param limit - Maximum number of requests
   * @param windowMs - Time window in milliseconds
   * @returns Object with success status and retry info
   */
  check(identifier: string, limit: number, windowMs: number): {
    success: boolean;
    remaining: number;
    resetTime: number;
  } {
    const now = Date.now();
    const entry = this.requests.get(identifier);

    if (!entry || now > entry.resetTime) {
      // First request or window expired
      const resetTime = now + windowMs;
      this.requests.set(identifier, { count: 1, resetTime });
      return { success: true, remaining: limit - 1, resetTime };
    }

    if (entry.count >= limit) {
      // Rate limit exceeded
      return { success: false, remaining: 0, resetTime: entry.resetTime };
    }

    // Increment count
    entry.count++;
    this.requests.set(identifier, entry);
    return { success: true, remaining: limit - entry.count, resetTime: entry.resetTime };
  }

  cleanup() {
    clearInterval(this.cleanupInterval);
    this.requests.clear();
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter();

/**
 * Get client IP address from request
 */
export function getClientIp(request: Request): string {
  // Try to get real IP from various headers
  const headers = request.headers;
  
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback to a generic identifier
  return 'unknown';
}
