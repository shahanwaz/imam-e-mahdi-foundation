import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth/rbac';
import { Verify2FASchema } from '@/lib/validations/auth';
import { verifyTotpToken } from '@/lib/totp';
import { createAuditLog } from '@/lib/audit';
import { apiSuccess, apiError } from '@/lib/response';
import { ValidationError, AppError } from '@/lib/errors';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const body = await req.json();
    const validated = Verify2FASchema.parse(body);

    const dbUser = await prisma.user.findUniqueOrThrow({
      where: { id: user.id },
    });

    if (!dbUser.twoFactorSecret) {
      throw new AppError('2FA setup was not initiated. Please call /api/auth/2fa/setup first.', 400);
    }

    const isValid = verifyTotpToken(validated.totpCode, dbUser.twoFactorSecret);
    if (!isValid) {
      throw new ValidationError('Invalid 6-digit TOTP verification code');
    }

    // Activate 2FA
    await prisma.user.update({
      where: { id: user.id },
      data: { twoFactorEnabled: true },
    });

    const ipAddress = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'Unknown';

    // Record Audit Log
    await createAuditLog({
      userId: user.id,
      action: '2FA_ENABLED',
      entity: 'User',
      entityId: user.id,
      ipAddress,
      userAgent,
    });

    return apiSuccess(
      { twoFactorEnabled: true },
      'Two-factor authentication successfully enabled'
    );
  } catch (error) {
    return apiError(error);
  }
}
