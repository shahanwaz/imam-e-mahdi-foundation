import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET as getUsersHandler, POST as createUserHandler } from '@/app/api/admin/users/route';
import { DELETE as deleteUserHandler } from '@/app/api/admin/users/[id]/route';
import { POST as updateRolePermissionsHandler } from '@/app/api/admin/roles/route';
import { GET as getAuditLogsHandler } from '@/app/api/admin/audit-logs/route';
import { NextRequest } from 'next/server';
import * as sessionModule from '@/lib/auth/session';

// Mock Prisma
vi.mock('@/lib/db', () => ({
  prisma: {
    user: {
      count: vi.fn().mockResolvedValue(1),
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    role: {
      findMany: vi.fn().mockResolvedValue([{ id: 'r1', name: 'DONOR' }]),
      findUnique: vi.fn(),
    },
    permission: {
      findMany: vi.fn().mockResolvedValue([{ id: 'p1', code: 'users:read' }]),
    },
    rolePermission: {
      deleteMany: vi.fn(),
      createMany: vi.fn(),
    },
    userRole: {
      deleteMany: vi.fn(),
      createMany: vi.fn(),
    },
    session: {
      deleteMany: vi.fn(),
    },
    auditLog: {
      count: vi.fn().mockResolvedValue(5),
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn(),
      findFirst: vi.fn().mockResolvedValue(null),
    },
    $transaction: vi.fn().mockImplementation((promises) => Promise.all(promises)),
  },
}));

import { prisma } from '@/lib/db';

describe('RBAC & Administrative API Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 Unauthorized on /api/admin/users when no token is provided', async () => {
    const req = new NextRequest('http://localhost:3000/api/admin/users');
    const res = await getUsersHandler(req);

    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('UNAUTHORIZED');
  });

  it('should return 403 Forbidden on /api/admin/users when user lacks users:read permission', async () => {
    vi.spyOn(sessionModule, 'verifySessionToken').mockResolvedValueOnce({
      id: 'usr_volunteer',
      email: 'vol@imf-foundation.org',
      name: 'Volunteer',
      status: 'ACTIVE',
      twoFactorEnabled: false,
      roles: ['VOLUNTEER'],
      permissions: ['events:manage_passes'], // Missing users:read
      sessionToken: 'sess_vol',
    });

    const req = new NextRequest('http://localhost:3000/api/admin/users', {
      headers: { Authorization: 'Bearer valid_token' },
    });

    const res = await getUsersHandler(req);
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('FORBIDDEN');
  });

  it('should return 200 OK on /api/admin/users when user has users:read permission', async () => {
    vi.spyOn(sessionModule, 'verifySessionToken').mockResolvedValueOnce({
      id: 'usr_director',
      email: 'director@imf-foundation.org',
      name: 'Director',
      status: 'ACTIVE',
      twoFactorEnabled: true,
      roles: ['DIRECTOR'],
      permissions: ['users:read', 'users:create'],
      sessionToken: 'sess_dir',
    });

    (prisma.user.findMany as any).mockResolvedValueOnce([
      {
        id: 'u1',
        name: 'Fatima Zahra',
        email: 'fatima@imf.org',
        roles: [{ role: { name: 'FIELD_WORKER' } }],
      },
    ]);

    const req = new NextRequest('http://localhost:3000/api/admin/users', {
      headers: { Authorization: 'Bearer valid_token' },
    });

    const res = await getUsersHandler(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data).toHaveLength(1);
    expect(json.meta.totalRecords).toBe(1);
  });

  it('should prevent a user from deleting their own account (403 Forbidden)', async () => {
    vi.spyOn(sessionModule, 'verifySessionToken').mockResolvedValueOnce({
      id: 'usr_self',
      email: 'admin@imf.org',
      name: 'Admin Self',
      status: 'ACTIVE',
      twoFactorEnabled: true,
      roles: ['SUPER_ADMIN'],
      permissions: ['users:delete'],
      sessionToken: 'sess_self',
    });

    const req = new NextRequest('http://localhost:3000/api/admin/users/usr_self', {
      method: 'DELETE',
      headers: { Authorization: 'Bearer valid_token' },
    });

    const context = { params: Promise.resolve({ id: 'usr_self' }) };
    const res = await deleteUserHandler(req, context);

    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.message).toContain('cannot delete your own account');
  });

  it('should prevent restricting Super Administrator role permissions (403 Forbidden)', async () => {
    vi.spyOn(sessionModule, 'verifySessionToken').mockResolvedValueOnce({
      id: 'usr_actor',
      email: 'admin@imf.org',
      name: 'Admin Actor',
      status: 'ACTIVE',
      twoFactorEnabled: true,
      roles: ['SUPER_ADMIN'],
      permissions: ['roles:manage_permissions'],
      sessionToken: 'sess_actor',
    });

    (prisma.role.findUnique as any).mockResolvedValueOnce({
      id: 'role_super_admin_id',
      name: 'SUPER_ADMIN',
    });

    const req = new NextRequest('http://localhost:3000/api/admin/roles', {
      method: 'POST',
      headers: { Authorization: 'Bearer valid_token' },
      body: JSON.stringify({
        roleId: 'role_super_admin_id',
        permissionCodes: ['users:read'], // Trying to restrict Super Admin
      }),
    });

    const res = await updateRolePermissionsHandler(req);
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.message).toContain('Super Administrator permissions cannot be restricted');
  });

  it('should require system:view_audit_logs to access /api/admin/audit-logs', async () => {
    vi.spyOn(sessionModule, 'verifySessionToken').mockResolvedValueOnce({
      id: 'usr_auditor',
      email: 'auditor@ca-firm.com',
      name: 'External CA',
      status: 'ACTIVE',
      twoFactorEnabled: true,
      roles: ['AUDITOR'],
      permissions: ['system:view_audit_logs'],
      sessionToken: 'sess_auditor',
    });

    const req = new NextRequest('http://localhost:3000/api/admin/audit-logs', {
      headers: { Authorization: 'Bearer valid_token' },
    });

    const res = await getAuditLogsHandler(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.meta.totalRecords).toBe(5);
  });
});
