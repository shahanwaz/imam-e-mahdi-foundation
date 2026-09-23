import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requirePermission } from '@/lib/auth/rbac';
import { NextRequest } from 'next/server';
import * as sessionModule from '@/lib/auth/session';
import { ForbiddenError, UnauthorizedError } from '@/lib/errors';

describe('Payroll RBAC & Security Permission Enforcement Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createMockRequest = (token?: string) => {
    const headers = new Headers();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return new NextRequest('http://localhost:3000/api/admin/payroll/periods', { headers });
  };

  it('should reject unauthenticated requests with UnauthorizedError (401)', async () => {
    const req = createMockRequest();
    await expect(requirePermission(req, 'payroll:read')).rejects.toThrow(UnauthorizedError);
  });

  it('should reject users lacking the specific payroll permission with ForbiddenError (403)', async () => {
    vi.spyOn(sessionModule, 'verifySessionToken').mockResolvedValueOnce({
      id: 'user_regular_donor',
      name: 'Regular Donor',
      status: 'ACTIVE',
      twoFactorEnabled: false,
      sessionToken: 'mock_sess_1',
      email: 'donor@example.com',
      roles: ['DONOR', 'VOLUNTEER'],
      permissions: ['donations:read', 'volunteer:read'],
    });

    const req = createMockRequest('valid_token_unprivileged');
    await expect(requirePermission(req, 'payroll:process')).rejects.toThrow(ForbiddenError);
  });

  it('should reject non-finance staff attempting to execute payroll disbursement (payroll:disburse)', async () => {
    vi.spyOn(sessionModule, 'verifySessionToken').mockResolvedValueOnce({
      id: 'user_hr_intern',
      name: 'HR Intern',
      status: 'ACTIVE',
      twoFactorEnabled: false,
      sessionToken: 'mock_sess_2',
      email: 'hr.intern@imf.org',
      roles: ['HR_OFFICER'],
      permissions: ['payroll:read', 'hr:read'],
    });

    const req = createMockRequest('valid_token_hr_intern');
    await expect(requirePermission(req, 'payroll:disburse')).rejects.toThrow(ForbiddenError);
  });

  it('should allow authorized HR/Finance Officer possessing required permission (payroll:process)', async () => {
    vi.spyOn(sessionModule, 'verifySessionToken').mockResolvedValueOnce({
      id: 'user_hr_manager',
      name: 'HR Manager',
      status: 'ACTIVE',
      twoFactorEnabled: false,
      sessionToken: 'mock_sess_3',
      email: 'hr.manager@imf.org',
      roles: ['HR_MANAGER'],
      permissions: ['payroll:read', 'payroll:process', 'payroll:view_sensitive'],
    });

    const req = createMockRequest('valid_token_hr_manager');
    const user = await requirePermission(req, 'payroll:process');
    expect(user).toBeDefined();
    expect(user.id).toBe('user_hr_manager');
  });

  it('should allow Leadership possessing approval permission (payroll:approve)', async () => {
    vi.spyOn(sessionModule, 'verifySessionToken').mockResolvedValueOnce({
      id: 'user_director',
      name: 'Executive Director',
      status: 'ACTIVE',
      twoFactorEnabled: false,
      sessionToken: 'mock_sess_4',
      email: 'director@imf.org',
      roles: ['EXECUTIVE_DIRECTOR'],
      permissions: ['payroll:read', 'payroll:approve', 'payroll:view_sensitive'],
    });

    const req = createMockRequest('valid_token_director');
    const user = await requirePermission(req, 'payroll:approve');
    expect(user).toBeDefined();
    expect(user.id).toBe('user_director');
  });

  it('should allow SUPER_ADMIN role to bypass atomic permission checks for all payroll operations', async () => {
    vi.spyOn(sessionModule, 'verifySessionToken').mockResolvedValueOnce({
      id: 'user_super_admin',
      name: 'Super Admin',
      status: 'ACTIVE',
      twoFactorEnabled: false,
      sessionToken: 'mock_sess_5',
      email: 'admin@imf.org',
      roles: ['SUPER_ADMIN'],
      permissions: [],
    });

    const req = createMockRequest('valid_token_superadmin');
    const user = await requirePermission(req, 'payroll:disburse');
    expect(user).toBeDefined();
    expect(user.roles).toContain('SUPER_ADMIN');
  });
});
