import { NextRequest } from 'next/server';
import { verifySessionToken, AuthenticatedUser } from './session';
import { UnauthorizedError, ForbiddenError } from '../errors';

const COOKIE_NAME = process.env.SESSION_COOKIE_NAME || 'imf_dos_session';

/**
 * Extracts session token from Authorization header or HTTP-only cookie
 */
export function extractToken(req: Request | NextRequest): string | null {
  // 1. Check Authorization Bearer header
  const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }

  // 2. Check cookies
  if ('cookies' in req && typeof (req as any).cookies?.get === 'function') {
    const cookie = (req as any).cookies.get(COOKIE_NAME);
    if (cookie?.value) return cookie.value;
  }

  const cookieHeader = req.headers.get('cookie');
  if (cookieHeader) {
    const match = cookieHeader.match(new RegExp(`(^| )${COOKIE_NAME}=([^;]+)`));
    if (match) return match[2];
  }

  return null;
}

/**
 * Guard: Requires an authenticated user session
 */
export async function requireAuth(req: Request | NextRequest): Promise<AuthenticatedUser> {
  const token = extractToken(req);
  if (!token) {
    throw new UnauthorizedError('Authentication token missing. Please sign in.');
  }

  return verifySessionToken(token);
}

/**
 * Guard: Requires user to hold a specific atomic permission code
 */
export async function requirePermission(
  req: Request | NextRequest,
  permissionCode: string
): Promise<AuthenticatedUser> {
  const user = await requireAuth(req);

  // Super Admin bypasses all specific permission checks
  if (user.roles.includes('SUPER_ADMIN')) {
    return user;
  }

  if (!user.permissions.includes(permissionCode)) {
    throw new ForbiddenError(
      `Forbidden: You do not possess the required permission [${permissionCode}] to perform this action.`
    );
  }

  return user;
}

/**
 * Guard: Requires user to hold ANY of the specified permissions
 */
export async function requireAnyPermission(
  req: Request | NextRequest,
  permissionCodes: string[]
): Promise<AuthenticatedUser> {
  const user = await requireAuth(req);

  if (user.roles.includes('SUPER_ADMIN')) {
    return user;
  }

  const hasAny = permissionCodes.some((code) => user.permissions.includes(code));
  if (!hasAny) {
    throw new ForbiddenError(
      `Forbidden: Requires at least one of [${permissionCodes.join(', ')}] permissions.`
    );
  }

  return user;
}

/**
 * Guard: Requires user to have one of the designated roles
 */
export async function requireRole(
  req: Request | NextRequest,
  allowedRoles: string[]
): Promise<AuthenticatedUser> {
  const user = await requireAuth(req);

  if (user.roles.includes('SUPER_ADMIN')) {
    return user;
  }

  const hasRole = allowedRoles.some((role) => user.roles.includes(role));
  if (!hasRole) {
    throw new ForbiddenError(
      `Forbidden: This resource is restricted to roles: [${allowedRoles.join(', ')}].`
    );
  }

  return user;
}
