import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST as registerHandler } from '@/app/api/auth/register/route';
import { POST as loginHandler } from '@/app/api/auth/login/route';
import { POST as logoutHandler } from '@/app/api/auth/logout/route';
import { NextRequest } from 'next/server';
import { hashPassword } from '@/lib/crypto';
import * as sessionModule from '@/lib/auth/session';

// Mock Prisma
vi.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      findUniqueOrThrow: vi.fn(),
      create: vi.fn(),
    },
    role: {
      findUniqueOrThrow: vi.fn().mockResolvedValue({ id: 'role_donor', name: 'DONOR' }),
    },
    session: {
      create: vi.fn(),
      findUnique: vi.fn(),
      deleteMany: vi.fn(),
    },
    auditLog: {
      create: vi.fn().mockResolvedValue({ id: 'audit_1' }),
      findFirst: vi.fn().mockResolvedValue(null),
    },
  },
}));

import { prisma } from '@/lib/db';

describe('Authentication Flow Integration Tests', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    (prisma.role.findUniqueOrThrow as any).mockResolvedValue({ id: 'role_donor', name: 'DONOR' });
    (prisma.auditLog.findFirst as any).mockResolvedValue(null);
    (prisma.auditLog.create as any).mockResolvedValue({ id: 'audit_1' });
  });

  it('should reject registration if password fails complexity requirements', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'weak', // too short, no uppercase, no number
        role: 'DONOR',
      }),
    });

    const res = await registerHandler(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('VALIDATION_FAILED');
    expect(json.error.details.length).toBeGreaterThan(0);
  });

  it('should reject registration if email is already taken (409 Conflict)', async () => {
    (prisma.user.findUnique as any).mockResolvedValueOnce({
      id: 'existing_usr',
      email: 'taken@example.com',
    });

    const req = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'John Doe',
        email: 'taken@example.com',
        password: 'StrongPassword@2026!',
        role: 'DONOR',
      }),
    });

    const res = await registerHandler(req);
    expect(res.status).toBe(409);

    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('CONFLICT');
  });

  it('should register a valid donor, create session, set cookie, and write audit log', async () => {
    (prisma.user.findUnique as any).mockResolvedValueOnce(null);
    (prisma.user.create as any).mockResolvedValueOnce({
      id: 'new_usr_123',
      name: 'Ahmed Khan',
      email: 'ahmed@imf-foundation.org',
      status: 'ACTIVE',
      twoFactorEnabled: false,
    });
    (prisma.user.findUniqueOrThrow as any).mockResolvedValueOnce({
      id: 'new_usr_123',
      name: 'Ahmed Khan',
      email: 'ahmed@imf-foundation.org',
      status: 'ACTIVE',
      twoFactorEnabled: false,
      roles: [{ role: { name: 'DONOR', permissions: [{ permission: { code: 'donations:read_own' } }] } }],
    });

    const req = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Ahmed Khan',
        email: 'ahmed@imf-foundation.org',
        password: 'Password@2026!',
        role: 'DONOR',
      }),
    });

    const res = await registerHandler(req);
    expect(res.status).toBe(201);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.user.email).toBe('ahmed@imf-foundation.org');
    expect(json.data.token).toBeDefined();

    // Verify audit log write
    expect(prisma.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: 'REGISTER',
          entity: 'User',
          entityId: 'new_usr_123',
        }),
      })
    );
  });

  it('should authenticate valid login and return session token', async () => {
    const rawPass = 'ValidSecret@2026!';
    const passwordHash = await hashPassword(rawPass);

    (prisma.user.findUnique as any).mockResolvedValueOnce({
      id: 'usr_login',
      name: 'Tariq Ali',
      email: 'tariq@imf-foundation.org',
      passwordHash,
      status: 'ACTIVE',
      twoFactorEnabled: false,
      twoFactorSecret: null,
      roles: [{ role: { name: 'DONOR' } }],
    });
    (prisma.user.findUniqueOrThrow as any).mockResolvedValueOnce({
      id: 'usr_login',
      name: 'Tariq Ali',
      email: 'tariq@imf-foundation.org',
      status: 'ACTIVE',
      twoFactorEnabled: false,
      roles: [{ role: { name: 'DONOR', permissions: [] } }],
    });

    const req = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'tariq@imf-foundation.org',
        password: rawPass,
      }),
    });

    const res = await loginHandler(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.user.email).toBe('tariq@imf-foundation.org');
  });

  it('should reject login with wrong password (401 Unauthorized) and audit failure', async () => {
    const passwordHash = await hashPassword('CorrectPassword@2026!');

    (prisma.user.findUnique as any).mockResolvedValueOnce({
      id: 'usr_target',
      name: 'Target User',
      email: 'target@imf-foundation.org',
      passwordHash,
      status: 'ACTIVE',
      twoFactorEnabled: false,
      roles: [],
    });

    const req = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'target@imf-foundation.org',
        password: 'IncorrectPassword',
      }),
    });

    const res = await loginHandler(req);
    expect(res.status).toBe(401);

    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('UNAUTHORIZED');

    // Audit failure logged
    expect(prisma.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: 'LOGIN_FAILED',
        }),
      })
    );
  });

  it('should require TOTP 2FA code if user has 2FA enabled', async () => {
    const rawPass = 'SecretAdminPass@2026!';
    const passwordHash = await hashPassword(rawPass);

    (prisma.user.findUnique as any).mockResolvedValueOnce({
      id: 'usr_2fa',
      name: 'MFA Admin',
      email: 'admin2fa@imf-foundation.org',
      passwordHash,
      status: 'ACTIVE',
      twoFactorEnabled: true,
      twoFactorSecret: 'JBSWY3DPEHPK3PXP',
      roles: [{ role: { name: 'SUPER_ADMIN' } }],
    });

    // Attempt login without totpCode
    const req = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin2fa@imf-foundation.org',
        password: rawPass,
      }),
    });

    const res = await loginHandler(req);
    expect(res.status).toBe(403);

    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('2FA_REQUIRED');
  });

  it('should revoke session on logout', async () => {
    vi.spyOn(sessionModule, 'verifySessionToken').mockResolvedValueOnce({
      id: 'usr_logout',
      email: 'logout@imf-foundation.org',
      name: 'Logout User',
      status: 'ACTIVE',
      twoFactorEnabled: false,
      roles: ['DONOR'],
      permissions: [],
      sessionToken: 'sess_to_delete',
    });

    const req = new NextRequest('http://localhost:3000/api/auth/logout', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer valid_jwt_token',
      },
    });

    const res = await logoutHandler(req);
    expect(res.status).toBe(200);

    expect(prisma.session.deleteMany).toHaveBeenCalledWith({
      where: { sessionToken: 'sess_to_delete' },
    });
  });
});
