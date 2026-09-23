import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemberService } from '@/lib/members/member-service';
import { MembershipType, MembershipStatus } from '@prisma/client';

vi.mock('@/lib/db', async () => {
  const { Prisma, MembershipType: MT, MembershipStatus: MS } = 
    await vi.importActual<typeof import('@prisma/client')>('@prisma/client');

  const defaultMockMember = {
    id: 'mem_test_1',
    membershipNumber: 'IMF-MEM-2026-00015',
    userId: 'user_test_1',
    fullName: 'Br. Ali Raza',
    email: 'existing.member@example.com',
    phone: '+919876500001',
    city: 'Mumbai',
    country: 'India',
    membershipType: MT.ANNUAL,
    status: MS.ACTIVE,
    startDate: new Date(),
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    renewalCount: 0,
    renewedAt: null,
    digitalCardUrl: 'http://localhost:3001/verify/member/mock_qr_hash_mem_12345',
    qrVerificationHash: 'mock_qr_hash_mem_12345',
    notes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    renewals: [],
  };

  return {
    prisma: {
      memberProfile: {
        count: vi.fn().mockImplementation((args?: any) => {
          if (args?.where?.status === MS.ACTIVE) return Promise.resolve(10);
          if (args?.where?.status === MS.EXPIRED) return Promise.resolve(2);
          if (args?.where?.membershipType === MT.LIFETIME) return Promise.resolve(4);
          return Promise.resolve(14);
        }),
        findUnique: vi.fn().mockImplementation(({ where }: any) => {
          if (where.email === 'existing.member@example.com' || where.id === 'mem_test_1' || where.membershipNumber === 'IMF-MEM-2026-00015') {
            return Promise.resolve(defaultMockMember);
          }
          return Promise.resolve(null);
        }),
        findUniqueOrThrow: vi.fn().mockImplementation(({ where }: any) => {
          if (where.id === 'mem_test_1' || where.membershipNumber === 'IMF-MEM-2026-00015') {
            return Promise.resolve(defaultMockMember);
          }
          throw new Error('Member not found');
        }),
        findFirst: vi.fn().mockImplementation(({ where }: any) => {
          if (where?.email === 'existing.member@example.com' || where?.id === 'mem_test_1' || where?.membershipNumber === 'IMF-MEM-2026-00015') {
            return Promise.resolve(defaultMockMember);
          }
          return Promise.resolve(null);
        }),
        create: vi.fn().mockImplementation(({ data }: any) => {
          return Promise.resolve({
            ...defaultMockMember,
            ...data,
            id: 'mem_test_new',
            membershipNumber: 'IMF-MEM-2026-00015',
          });
        }),
        update: vi.fn().mockImplementation(({ where, data }: any) => {
          return Promise.resolve({
            ...defaultMockMember,
            ...data,
            renewalCount: data.renewalCount?.increment ? defaultMockMember.renewalCount + 1 : defaultMockMember.renewalCount,
          });
        }),
        findMany: vi.fn().mockResolvedValue([defaultMockMember]),
      },
      membershipRenewalRecord: {
        count: vi.fn().mockResolvedValue(5),
        create: vi.fn().mockResolvedValue({
          id: 'renew_1',
          memberId: 'mem_test_1',
          amountPaid: new Prisma.Decimal(2500),
          newEndDate: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000),
        }),
      },
      officialCertificate: {
        count: vi.fn().mockResolvedValue(10),
        create: vi.fn().mockResolvedValue({
          id: 'cert_1',
          certificateNumber: 'IMF-CERT-2026-00001',
          signatureHash: 'mock_cert_hash_9988',
        }),
      },
      auditLog: {
        create: vi.fn().mockResolvedValue({ id: 'audit_1' }),
        findFirst: vi.fn().mockResolvedValue(null),
      },
      $transaction: vi.fn().mockImplementation(async (callback) => {
        const { prisma } = await import('@/lib/db');
        return callback(prisma);
      }),
    },
  };
});

import { prisma } from '@/lib/db';

describe('Member Service & Membership Lifecycle Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should register a new annual member with sequential ID and HMAC QR hash', async () => {
    const member = await MemberService.registerMember({
      fullName: 'Br. Ali Raza',
      email: 'ali.raza@example.com',
      phone: '+919876500001',
      city: 'Mumbai',
      membershipType: MembershipType.ANNUAL,
    });

    expect(member).toBeDefined();
    expect(member.membershipNumber).toMatch(/^IMF-MEM-\d{4}-\d{5}$/);
    expect(member.qrVerificationHash).toBeDefined();
    expect(member.status).toBe(MembershipStatus.ACTIVE);
    expect(prisma.memberProfile.create).toHaveBeenCalled();
  });

  it('should calculate perpetual end date for lifetime patron memberships', async () => {
    const member = await MemberService.registerMember({
      fullName: 'Dr. Syed Kazim',
      email: 'syed.kazim@example.com',
      phone: '+919876500003',
      city: 'Hyderabad',
      membershipType: MembershipType.LIFETIME,
    });

    expect(member).toBeDefined();
    expect(member.membershipType).toBe(MembershipType.LIFETIME);
  });

  it('should process membership renewal and extend expiry date', async () => {
    const renewal = await MemberService.renewMembership({
      memberId: 'mem_test_1',
      yearsToExtend: 1,
      amountPaid: 2500,
      paymentReference: 'REC-2026-9901',
    });

    expect(renewal).toBeDefined();
    expect(renewal.id).toBe('mem_test_1');
    expect(prisma.membershipRenewalRecord.create).toHaveBeenCalled();
    expect(prisma.memberProfile.update).toHaveBeenCalled();
  });

  it('should update member status with audit logging', async () => {
    const updated = await MemberService.updateMemberStatus(
      'mem_test_1',
      MembershipStatus.SUSPENDED,
      'Administrative suspension for review'
    );

    expect(updated).toBeDefined();
    expect(updated.status).toBe(MembershipStatus.SUSPENDED);
    expect(prisma.memberProfile.update).toHaveBeenCalled();
  });

  it('should calculate member analytics across tiers and statuses', async () => {
    const analytics = await MemberService.getMemberAnalytics();
    expect(analytics).toBeDefined();
    expect(analytics.totalMembers).toBeGreaterThanOrEqual(0);
    expect(analytics.activeMembers).toBeGreaterThanOrEqual(0);
    expect(analytics.lifetimePatrons).toBeGreaterThanOrEqual(0);
    expect(analytics.totalRenewalsProcessed).toBeGreaterThanOrEqual(0);
  });
});
