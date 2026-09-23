import { NextRequest } from 'next/server';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const memoryStore = new Map<string, RateLimitRecord>();

// Clean up stale entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of memoryStore.entries()) {
      if (record.resetTime <= now) {
        memoryStore.delete(key);
      }
    }
  }, 300000);
}

export interface RateLimitOptions {
  windowMs: number; // Duration of window in ms
  max: number; // Max requests per window
  identifierPrefix?: string;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  retryAfterSeconds?: number;
}

/**
 * Extracts client IP address reliably from NextRequest headers
 */
export function getClientIp(req: NextRequest): string {
  const xForwardedFor = req.headers.get('x-forwarded-for');
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim();
  }
  const xRealIp = req.headers.get('x-real-ip');
  if (xRealIp) {
    return xRealIp.trim();
  }
  return '127.0.0.1';
}

/**
 * Checks rate limit for an identifier
 */
export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions
): RateLimitResult {
  const now = Date.now();
  const key = `${options.identifierPrefix || 'rl'}:${identifier}`;
  const record = memoryStore.get(key);

  if (!record || record.resetTime <= now) {
    // New or expired window
    const newRecord: RateLimitRecord = {
      count: 1,
      resetTime: now + options.windowMs,
    };
    memoryStore.set(key, newRecord);

    return {
      success: true,
      limit: options.max,
      remaining: options.max - 1,
      reset: newRecord.resetTime,
    };
  }

  // Active window
  if (record.count >= options.max) {
    const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1000);
    return {
      success: false,
      limit: options.max,
      remaining: 0,
      reset: record.resetTime,
      retryAfterSeconds,
    };
  }

  record.count += 1;
  memoryStore.set(key, record);

  return {
    success: true,
    limit: options.max,
    remaining: options.max - record.count,
    reset: record.resetTime,
  };
}

/**
 * Standard rate limiting presets
 */
export const RateLimitPresets = {
  // 5 attempts per 15 minutes for login / auth to stop brute force
  AUTH_LOGIN: {
    windowMs: 15 * 60 * 1000,
    max: 5,
    identifierPrefix: 'auth_login',
  },
  // 20 requests per minute for public donation creation
  DONATIONS_INITIATE: {
    windowMs: 60 * 1000,
    max: 20,
    identifierPrefix: 'donations_init',
  },
  // 15 requests per minute for AI prompt execution
  AI_GENERATE: {
    windowMs: 60 * 1000,
    max: 15,
    identifierPrefix: 'ai_gen',
  },
  // 60 requests per minute for general API endpoints
  GENERAL_API: {
    windowMs: 60 * 1000,
    max: 60,
    identifierPrefix: 'api_std',
  },
};
