import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requirePermission } from '@/lib/auth/rbac';
import { NextRequest } from 'next/server';
import * as sessionModule from '@/lib/auth/session';
import { ForbiddenError, UnauthorizedError } from '@/lib/errors';

describe('Finance & Accounting RBAC Permission Enforcement Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createMockRequest = (token?: string, path: string = '/api/admin/finance/summary') => {
    const headers = new Headers();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return new NextRequest(`http://localhost:3000${path}`, { headers });
  };

  it('1. should reject unauthenticated requests to financial ledgers with UnauthorizedError (401)', async () => {
    const req = createMockRequest();
    await expect(requirePermission(req, 'finance:view_ledger')).rejects.toThrow(UnauthorizedError);
  });

  it('2. should reject users without finance permissions from accessing ledgers or reports with ForbiddenError (403)', async () => {
    vi.spyOn(sessionModule, 'verifySessionToken').mockResolvedValueOnce({
      id: 'user_regular_volunteer',
      name: 'Regular Volunteer',
      status: 'ACTIVE',
      twoFactorEnabled: false,
      sessionToken: 'mock_sess_vol',
      email: 'volunteer@imf.org',
      roles: ['VOLUNTEER'],
      permissions: ['volunteers:read'],
    });

    const req = createMockRequest('token_volunteer', '/api/admin/finance/summary');
    await expect(requirePermission(req, 'finance:view_ledger')).rejects.toThrow(ForbiddenError);
  });

  it('3. should reject non-auditor users attempting to sign off BRS or configure statutory rules (finance:audit_review)', async () => {
    vi.spyOn(sessionModule, 'verifySessionToken').mockResolvedValueOnce({
      id: 'user_junior_clerk',
      name: 'Accounts Clerk',
      status: 'ACTIVE',
      twoFactorEnabled: false,
      sessionToken: 'mock_sess_clerk',
      email: 'clerk@imf.org',
      roles: ['FINANCE_OFFICER'],
      permissions: ['finance:view_ledger', 'finance:record_expense'],
    });

    const req = createMockRequest('token_clerk', '/api/admin/finance/reconciliation/brs_1/signoff');
    await expect(requirePermission(req, 'finance:audit_review')).rejects.toThrow(ForbiddenError);
  });

  it('4. should allow authorized Finance Officer possessing finance:view_ledger and finance:record_expense', async () => {
    vi.spyOn(sessionModule, 'verifySessionToken').mockResolvedValueOnce({
      id: 'user_fin_officer',
      name: 'Senior Finance Officer',
      status: 'ACTIVE',
      twoFactorEnabled: true,
      sessionToken: 'mock_sess_fin_mgr',
      email: 'finance.lead@imf.org',
      roles: ['FINANCE_OFFICER'],
      permissions: ['finance:view_ledger', 'finance:record_expense', 'finance:manage_budgets'],
    });

    const req = createMockRequest('token_fin_officer');
    const user = await requirePermission(req, 'finance:view_ledger');
    expect(user.id).toBe('user_fin_officer');
    expect(user.permissions).toContain('finance:view_ledger');
  });

  it('5. should allow Statutory Auditor possessing finance:audit_review to verify reconciliations and policies', async () => {
    vi.spyOn(sessionModule, 'verifySessionToken').mockResolvedValueOnce({
      id: 'user_ca_auditor',
      name: 'Certified Chartered Accountant',
      status: 'ACTIVE',
      twoFactorEnabled: true,
      sessionToken: 'mock_sess_ca',
      email: 'auditor.partner@deloitte.imf',
      roles: ['AUDITOR'],
      permissions: ['finance:view_ledger', 'finance:audit_review'],
    });

    const req = createMockRequest('token_ca', '/api/admin/finance/statutory-configs');
    const user = await requirePermission(req, 'finance:audit_review');
    expect(user.id).toBe('user_ca_auditor');
    expect(user.roles).toContain('AUDITOR');
  });

  it('6. should allow SUPER_ADMIN to perform any financial and audit action automatically', async () => {
    vi.spyOn(sessionModule, 'verifySessionToken').mockResolvedValueOnce({
      id: 'user_super_admin',
      name: 'Trustee Super Admin',
      status: 'ACTIVE',
      twoFactorEnabled: true,
      sessionToken: 'mock_sess_super',
      email: 'trustee.chair@imf.org',
      roles: ['SUPER_ADMIN'],
      permissions: ['*'],
    });

    const req = createMockRequest('token_super_admin');
    const user = await requirePermission(req, 'finance:audit_review');
    expect(user.roles).toContain('SUPER_ADMIN');
  });
});
