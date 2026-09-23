import { describe, it, expect, vi } from 'vitest';
import { extractToken, requirePermission, requireRole, requireAuth } from '@/lib/auth/rbac';
import { UnauthorizedError, ForbiddenError } from '@/lib/errors';
import * as sessionModule from '@/lib/auth/session';

describe('RBAC & Server-Side Authorization Guards Unit Tests', () => {
  it('should extract token from Authorization Bearer header', () => {
    const req = new Request('http://localhost:3000/api/admin/users', {
      headers: {
        Authorization: 'Bearer my-jwt-token-12345',
      },
    });

    const token = extractToken(req);
    expect(token).toBe('my-jwt-token-12345');
  });

  it('should extract token from Cookie header', () => {
    const req = new Request('http://localhost:3000/api/admin/users', {
      headers: {
        Cookie: 'imf_dos_session=cookie-jwt-token-67890; other_cookie=xyz',
      },
    });

    const token = extractToken(req);
    expect(token).toBe('cookie-jwt-token-67890');
  });

  it('should throw UnauthorizedError if no token is present', async () => {
    const req = new Request('http://localhost:3000/api/admin/users');

    await expect(requireAuth(req)).rejects.toThrow(UnauthorizedError);
  });

  it('should allow SUPER_ADMIN role unconditionally across all permissions', async () => {
    const mockSuperAdmin: sessionModule.AuthenticatedUser = {
      id: 'usr_admin',
      email: 'admin@imf-foundation.org',
      name: 'Super Admin',
      status: 'ACTIVE',
      twoFactorEnabled: true,
      roles: ['SUPER_ADMIN'],
      permissions: ['users:read'], // only 1 explicit perm in list
      sessionToken: 'sess_123',
    };

    vi.spyOn(sessionModule, 'verifySessionToken').mockResolvedValueOnce(mockSuperAdmin);

    const req = new Request('http://localhost:3000/api/admin/finance', {
      headers: { Authorization: 'Bearer valid_token' },
    });

    // Even though 'finance:post_voucher' is not explicitly listed, SUPER_ADMIN has full master authority
    const result = await requirePermission(req, 'finance:post_voucher');
    expect(result.id).toBe('usr_admin');
  });

  it('should allow user possessing the required permission', async () => {
    const mockFinanceUser: sessionModule.AuthenticatedUser = {
      id: 'usr_fin',
      email: 'finance@imf-foundation.org',
      name: 'Finance Officer',
      status: 'ACTIVE',
      twoFactorEnabled: true,
      roles: ['FINANCE_OFFICER'],
      permissions: ['finance:view_ledger', 'finance:create_voucher', 'finance:post_voucher'],
      sessionToken: 'sess_fin',
    };

    vi.spyOn(sessionModule, 'verifySessionToken').mockResolvedValueOnce(mockFinanceUser);

    const req = new Request('http://localhost:3000/api/finance/vouchers', {
      headers: { Authorization: 'Bearer valid_token' },
    });

    const result = await requirePermission(req, 'finance:post_voucher');
    expect(result.id).toBe('usr_fin');
  });

  it('should throw ForbiddenError when user lacks the required permission', async () => {
    const mockDonorUser: sessionModule.AuthenticatedUser = {
      id: 'usr_donor',
      email: 'donor@gmail.com',
      name: 'Donor User',
      status: 'ACTIVE',
      twoFactorEnabled: false,
      roles: ['DONOR'],
      permissions: ['donations:read_own'],
      sessionToken: 'sess_donor',
    };

    vi.spyOn(sessionModule, 'verifySessionToken').mockResolvedValueOnce(mockDonorUser);

    const req = new Request('http://localhost:3000/api/admin/users', {
      headers: { Authorization: 'Bearer valid_token' },
    });

    // Donor attempting to create a user
    await expect(requirePermission(req, 'users:create')).rejects.toThrow(ForbiddenError);
  });

  it('should enforce role hierarchy restrictions via requireRole', async () => {
    const mockFieldWorker: sessionModule.AuthenticatedUser = {
      id: 'usr_field',
      email: 'field@imf-foundation.org',
      name: 'Field Worker',
      status: 'ACTIVE',
      twoFactorEnabled: false,
      roles: ['FIELD_WORKER'],
      permissions: ['beneficiaries:read'],
      sessionToken: 'sess_field',
    };

    vi.spyOn(sessionModule, 'verifySessionToken').mockResolvedValueOnce(mockFieldWorker);

    const req = new Request('http://localhost:3000/api/admin/governance', {
      headers: { Authorization: 'Bearer valid_token' },
    });

    await expect(requireRole(req, ['TRUSTEE', 'DIRECTOR'])).rejects.toThrow(ForbiddenError);
  });
});
