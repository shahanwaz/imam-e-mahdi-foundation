import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { RegisterSchema } from '@/lib/validations/auth';
import { hashPassword } from '@/lib/crypto';
import { createSession } from '@/lib/auth/session';
import { createAuditLog } from '@/lib/audit';
import { apiSuccess, apiError } from '@/lib/response';
import { ConflictError } from '@/lib/errors';
import { UserStatus, RoleType } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = RegisterSchema.parse(body);

    // 1. Check if email exists
    const existing = await prisma.user.findUnique({
      where: { email: validated.email.toLowerCase() },
    });

    if (existing) {
      throw new ConflictError('An account with this email already exists');
    }

    // 2. Hash password
    const passwordHash = await hashPassword(validated.password);

    // 3. Find assigned role
    const assignedRole = await prisma.role.findUniqueOrThrow({
      where: { name: validated.role as RoleType },
    });

    // 4. Create user and role mapping atomically
    const newUser = await prisma.user.create({
      data: {
        name: validated.name,
        email: validated.email.toLowerCase(),
        passwordHash,
        phone: validated.phone || null,
        preferredLanguage: validated.preferredLanguage,
        countryCode: validated.countryCode,
        status: UserStatus.ACTIVE,
        roles: {
          create: {
            roleId: assignedRole.id,
          },
        },
      },
    });

    // 5. Create Session & JWT
    const ipAddress = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'Unknown';
    const session = await createSession(newUser.id, ipAddress, userAgent);

    // 6. Record Audit Log
    await createAuditLog({
      userId: newUser.id,
      action: 'REGISTER',
      entity: 'User',
      entityId: newUser.id,
      newData: {
        email: newUser.email,
        name: newUser.name,
        role: validated.role,
      },
      ipAddress,
      userAgent,
    });

    const response = apiSuccess(
      {
        user: session.user,
        token: session.token,
      },
      'User registered successfully',
      201
    );

    // Set secure HTTP-only cookie
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
