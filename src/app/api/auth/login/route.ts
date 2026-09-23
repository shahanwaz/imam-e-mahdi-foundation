import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { LoginSchema } from '@/lib/validations/auth';
import { verifyPassword } from '@/lib/crypto';
import { verifyTotpToken } from '@/lib/totp';
import { createSession } from '@/lib/auth/session';
import { createAuditLog } from '@/lib/audit';
import { apiSuccess, apiError } from '@/lib/response';
import { UnauthorizedError, TwoFactorRequiredError, AppError } from '@/lib/errors';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = LoginSchema.parse(body);

    const ipAddress = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'Unknown';

    // 1. Fetch user by email
    const user = await prisma.user.findUnique({
      where: { email: validated.email.toLowerCase() },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedError(`Account is ${user.status.toLowerCase()}. Please contact administration.`);
    }

    // 2. Verify password
    const isPasswordValid = await verifyPassword(validated.password, user.passwordHash);
    if (!isPasswordValid) {
      // Audit failed attempt
      await createAuditLog({
        userId: user.id,
        action: 'LOGIN_FAILED',
        entity: 'User',
        entityId: user.id,
        ipAddress,
        userAgent,
      });
      throw new UnauthorizedError('Invalid email or password');
    }

    // 3. Multi-Factor Authentication Check
    if (user.twoFactorEnabled) {
      if (!validated.totpCode) {
        throw new TwoFactorRequiredError('Two-factor authentication code is required');
      }

      if (!user.twoFactorSecret) {
        throw new AppError('2FA is enabled but secret is missing from account', 500);
      }

      const isTotpValid = verifyTotpToken(validated.totpCode, user.twoFactorSecret);
      if (!isTotpValid) {
        throw new UnauthorizedError('Invalid two-factor authentication code');
      }
    }

    // 4. Create Session
    const session = await createSession(user.id, ipAddress, userAgent);

    // 5. Audit Log
    await createAuditLog({
      userId: user.id,
      action: 'LOGIN_SUCCESS',
      entity: 'Session',
      entityId: session.sessionToken,
      ipAddress,
      userAgent,
    });

    const response = apiSuccess(
      {
        user: session.user,
        token: session.token,
      },
      'Signed in successfully'
    );

    response.cookies.set({
      name: process.env.SESSION_COOKIE_NAME || 'imf_dos_session',
      value: session.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: session.expiresAt,
    });

    return response;
  } catch (error) {
    return apiError(error);
  }
}
