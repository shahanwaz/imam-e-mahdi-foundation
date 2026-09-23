import jwt from 'jsonwebtoken';
import { prisma } from '../db';
import { generateSecureToken } from '../crypto';
import { UnauthorizedError, AppError } from '../errors';

function getJwtSecret(): string {
  if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
    throw new AppError('FATAL SECURITY ERROR: JWT_SECRET environment variable is missing in production', 500);
  }
  return process.env.JWT_SECRET || 'imf-dos-enterprise-super-secret-jwt-key-2026-secure';
}

const SESSION_EXPIRY_DAYS = 7;

export interface TokenPayload {
  userId: string;
  email: string;
  roles: string[];
  sessionToken: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  status: string;
  twoFactorEnabled: boolean;
  roles: string[];
  permissions: string[];
  sessionToken: string;
}

/**
 * Creates a database session and signs a corresponding JWT
 */
export async function createSession(
  userId: string,
  ipAddress?: string | null,
  userAgent?: string | null
): Promise<{ token: string; sessionToken: string; expiresAt: Date; user: AuthenticatedUser }> {
  const sessionToken = generateSecureToken(32);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRY_DAYS);

  // 1. Persist session in DB
  await prisma.session.create({
    data: {
      userId,
      sessionToken,
      expires: expiresAt,
      ipAddress: ipAddress || null,
      userAgent: userAgent || null,
    },
  });

  // 2. Fetch user profile with roles & permissions
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    include: {
      roles: {
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const roles = user.roles.map((ur) => ur.role.name);
  const permissionsSet = new Set<string>();
  user.roles.forEach((ur) => {
    ur.role.permissions.forEach((rp) => {
      permissionsSet.add(rp.permission.code);
    });
  });
  const permissions = Array.from(permissionsSet);

  // 3. Sign JWT
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    roles,
    sessionToken,
  };

  const token = jwt.sign(payload, getJwtSecret(), {
    expiresIn: `${SESSION_EXPIRY_DAYS}d`,
  });

  const authUser: AuthenticatedUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    status: user.status,
    twoFactorEnabled: user.twoFactorEnabled,
    roles,
    permissions,
    sessionToken,
  };

  return { token, sessionToken, expiresAt, user: authUser };
}

/**
 * Verifies JWT token and checks active DB session status
 */
export async function verifySessionToken(token: string): Promise<AuthenticatedUser> {
  if (!token) {
    throw new UnauthorizedError('Authentication token missing');
  }

  let payload: TokenPayload;
  try {
    payload = jwt.verify(token, getJwtSecret()) as TokenPayload;
  } catch (err) {
    throw new UnauthorizedError('Invalid or expired authentication token');
  }

  // Verify session exists and is not expired in DB
  const dbSession = await prisma.session.findUnique({
    where: { sessionToken: payload.sessionToken },
    include: {
      user: {
        include: {
          roles: {
            include: {
              role: {
                include: {
                  permissions: {
                    include: {
                      permission: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!dbSession || dbSession.expires < new Date()) {
    throw new UnauthorizedError('Session has expired or was revoked');
  }

  if (dbSession.user.status !== 'ACTIVE') {
    throw new UnauthorizedError(`Account is ${dbSession.user.status.toLowerCase()}`);
  }

  const roles = dbSession.user.roles.map((ur) => ur.role.name);
  const permissionsSet = new Set<string>();
  dbSession.user.roles.forEach((ur) => {
    ur.role.permissions.forEach((rp) => {
      permissionsSet.add(rp.permission.code);
    });
  });

  return {
    id: dbSession.user.id,
    email: dbSession.user.email,
    name: dbSession.user.name,
    status: dbSession.user.status,
    twoFactorEnabled: dbSession.user.twoFactorEnabled,
    roles,
    permissions: Array.from(permissionsSet),
    sessionToken: dbSession.sessionToken,
  };
}

/**
 * Revokes a session (Logout)
 */
export async function revokeSession(sessionToken: string): Promise<void> {
  await prisma.session.deleteMany({
    where: { sessionToken },
  });
}
