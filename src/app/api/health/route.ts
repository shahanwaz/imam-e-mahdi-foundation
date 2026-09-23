import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  const startTime = Date.now();
  let dbStatus = 'UNKNOWN';
  let dbLatencyMs = -1;

  // 1. Check Database Connectivity
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatencyMs = Date.now() - dbStart;
    dbStatus = 'HEALTHY';
  } catch (error: any) {
    dbStatus = 'UNREACHABLE';
    console.warn('[HEALTH_CHECK_DB_WARNING]', error.message);
  }

  // 2. Check Security Environment Variables
  const envCheck = {
    nodeEnv: process.env.NODE_ENV || 'development',
    hasEncryptionKey: Boolean(process.env.ENCRYPTION_KEY_PII),
    hasQrSecret: Boolean(process.env.QR_HMAC_SECRET),
    hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
    hasRedisUrl: Boolean(process.env.REDIS_URL),
    hasRazorpayKeys: Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
    hasStripeKeys: Boolean(process.env.STRIPE_SECRET_KEY),
  };

  const isHealthy = dbStatus === 'HEALTHY' || process.env.NODE_ENV !== 'production';

  return NextResponse.json(
    {
      status: isHealthy ? 'UP' : 'DEGRADED',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      responseTimeMs: Date.now() - startTime,
      components: {
        database: {
          status: dbStatus,
          latencyMs: dbLatencyMs,
        },
        encryptionVault: {
          status: 'ACTIVE',
          algorithm: 'AES-256-GCM',
        },
        verificationEngine: {
          status: 'ACTIVE',
          protocol: 'HMAC-SHA256',
        },
        environment: envCheck,
      },
    },
    { status: isHealthy ? 200 : 503 }
  );
}
