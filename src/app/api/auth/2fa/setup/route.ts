import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth/rbac';
import { generateTotpSecret } from '@/lib/totp';
import { apiSuccess, apiError } from '@/lib/response';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);

    // Generate new TOTP secret
    const { secret, uri } = generateTotpSecret(user.email);

    // Save temporary secret to user (not yet activated until verified)
    await prisma.user.update({
      where: { id: user.id },
      data: { twoFactorSecret: secret },
    });

    return apiSuccess(
      {
        secret,
        uri,
        message: 'Scan this URI with Google Authenticator or enter secret manually, then verify with 6-digit code.',
      },
      '2FA setup initiated'
    );
  } catch (error) {
    return apiError(error);
  }
}
