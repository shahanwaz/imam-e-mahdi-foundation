import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIp, RateLimitPresets } from '@/lib/rate-limit';

const CANONICAL_HOST = 'imammission.org';

const SECURITY_HEADERS: Record<string, string> = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self)',
  'X-XSS-Protection': '1; mode=block',
  'Content-Security-Policy':
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://checkout.razorpay.com https://js.stripe.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https:; connect-src 'self' https://api.razorpay.com https://api.stripe.com https://generativelanguage.googleapis.com https://*.googleapis.com; frame-src 'self' https://api.razorpay.com https://js.stripe.com;",
};

export function middleware(req: NextRequest) {
  const host = req.headers.get('host') || '';
  const proto = req.headers.get('x-forwarded-proto') || req.nextUrl.protocol.replace(':', '');
  const isProd = process.env.NODE_ENV === 'production';

  // 1. Canonical Domain & HTTPS Redirection Strategy (www -> non-www, http -> https)
  if (isProd && (host.startsWith('www.') || (proto === 'http' && !host.includes('localhost')))) {
    const cleanHost = host.replace(/^www\./, '');
    const canonicalUrl = new URL(req.nextUrl.pathname + req.nextUrl.search, `https://${cleanHost || CANONICAL_HOST}`);
    return NextResponse.redirect(canonicalUrl, 301);
  }

  const { pathname } = req.nextUrl;
  const ip = getClientIp(req);

  // 2. Apply Rate Limiting to Auth Endpoints
  if (pathname.startsWith('/api/auth/login') || pathname.startsWith('/api/auth/register')) {
    const rl = checkRateLimit(ip, RateLimitPresets.AUTH_LOGIN);
    if (!rl.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'TOO_MANY_REQUESTS',
            message: `Too many authentication attempts. Please try again after ${rl.retryAfterSeconds} seconds.`,
          },
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rl.retryAfterSeconds || 60),
            'X-RateLimit-Limit': String(rl.limit),
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }
  }

  // 3. Apply Rate Limiting to AI Generation Endpoints
  if (pathname.startsWith('/api/admin/ai/generate')) {
    const rl = checkRateLimit(ip, RateLimitPresets.AI_GENERATE);
    if (!rl.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'TOO_MANY_REQUESTS',
            message: 'AI generation rate limit exceeded. Please wait a moment before sending another prompt.',
          },
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rl.retryAfterSeconds || 60),
            'X-RateLimit-Limit': String(rl.limit),
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }
  }

  // 4. Continue and append Security Headers to Response
  const res = NextResponse.next();
  for (const [headerKey, headerVal] of Object.entries(SECURITY_HEADERS)) {
    res.headers.set(headerKey, headerVal);
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
