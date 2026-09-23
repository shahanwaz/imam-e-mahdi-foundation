import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BeneficiaryService } from '@/lib/beneficiaries/beneficiary-service';
import { BeneficiaryCategory, VulnerabilityTier, BeneficiaryVerificationStatus, AssistanceType } from '@prisma/client';
import { encryptPII } from '@/lib/crypto';

vi.mock('@/lib/db', async () => {
  const { Prisma, BeneficiaryCategory: BC, VulnerabilityTier: VT, BeneficiaryVerificationStatus: BVS } = 
    await vi.importActual<typeof import('@prisma/client')>('@prisma/client');
  const { encryptPII: enc } = await vi.importActual<typeof import('@/lib/crypto')>('@/lib/crypto');

  const defaultMockBeneficiary = {
    id: 'ben_test_1',
    beneficiaryNumber: 'IMF-BEN-2026-00045',
    fullName: 'Zainab Begum',
    gender: 'FEMALE',
    dateOfBirth: new Date('1985-05-12'),
    phone: '+919876511223',
    city: 'Mumbai',
    district: 'Govandi',
    state: 'Maharashtra',
    country: 'India',
    addressLine: 'Plot 42, Slum Resettlement',
    category: BC.WIDOW_ASSISTANCE,
    vulnerabilityTier: VT.CRITICAL_URGENT,
    vulnerabilityScore: 92,
    verificationStatus: BVS.APPROVED,
    verifiedByUserId: 'SUPERVISOR_1',
    verifiedAt: new Date(),
    encryptedNationalId: enc('123456789012'),
    nationalIdMasked: '1234****9012',
    encryptedRationCard: enc('BPL-9921'),
    rationCardMasked: 'BPL-****21',
    encryptedBankAccount: enc('5010023910293'),
    bankAccountMasked: '5010****0293',
    encryptedIfscCode: enc('HDFC0001234'),
    householdMemberCount: 5,
    monthlyIncomeINR: new Prisma.Decimal(3000),
    primaryNeedSummary: 'Widow with 4 minor children requiring monthly ration support.',
    estimatedAidRequiredINR: new Prisma.Decimal(8000),
    notes: 'Case vetted by field volunteer',
    createdAt: new Date(),
    updatedAt: new Date(),
    familyMembers: [],
    documents: [],
    assistanceRecords: [],
    followUps: [],
    fieldVisits: [],
  };

  return {
    prisma: {
      beneficiaryProfile: {
        count: vi.fn().mockImplementation((args?: any) => {
          if (args?.where?.vulnerabilityTier === VT.CRITICAL_URGENT) return Promise.resolve(12);
          if (args?.where?.verificationStatus === BVS.APPROVED) return Promise.resolve(25);
          return Promise.resolve(45);
        }),
        findUnique: vi.fn().mockResolvedValue(defaultMockBeneficiary),
        findUniqueOrThrow: vi.fn().mockImplementation(({ where }: any) => {
          if (where.id === 'ben_test_1') return Promise.resolve(defaultMockBeneficiary);
          throw new Error('Beneficiary not found');
        }),
        findFirst: vi.fn().mockResolvedValue(defaultMockBeneficiary),
        create: vi.fn().mockImplementation(({ data }: any) => {
          return Promise.resolve({
            ...defaultMockBeneficiary,
            ...data,
            id: 'ben_test_new',
            beneficiaryNumber: 'IMF-BEN-2026-00045',
          });
        }),
        update: vi.fn().mockImplementation(({ where, data }: any) => {
          return Promise.resolve({
            ...defaultMockBeneficiary,
            ...data,
          });
        }),
        findMany: vi.fn().mockResolvedValue([defaultMockBeneficiary]),
      },
      beneficiaryAssistance: {
        count: vi.fn().mockResolvedValue(119),
        create: vi.fn().mockImplementation(({ data }: any) => {
          return Promise.resolve({
            id: 'aid_test_1',
            assistanceNumber: 'IMF-AID-2026-00120',
            ...data,
          });
        }),
        aggregate: vi.fn().mockResolvedValue({
          _sum: { amountINR: new Prisma.Decimal(450000) },
          _count: { id: 120 },
        }),
      },
      beneficiaryFollowUp: {
        create: vi.fn().mockImplementation(({ data }: any) => {
          return Promise.resolve({
            id: 'fu_1',
            ...data,
            createdAt: new Date(),
          });
        }),
      },
      project: {
        update: vi.fn().mockResolvedValue({}),
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

describe('Secure Beneficiary Management & AES-256 Vault Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should compute vulnerability index and assign CRITICAL_URGENT tier for low-income widows/orphans', () => {
    const result = BeneficiaryService.calculateVulnerabilityIndex({
      monthlyIncomeINR: 2000,
      householdMemberCount: 5,
      category: BeneficiaryCategory.WIDOW_ASSISTANCE,
      isOrphanOrWidow: true,
      hasChronicIllness: true,
    });

    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(result.tier).toBe(VulnerabilityTier.CRITICAL_URGENT);
  });

  it('should enroll a beneficiary with AES-256 encrypted PII and masked identifiers', async () => {
    const beneficiary = await BeneficiaryService.enrollBeneficiary({
      fullName: 'Zainab Begum',
      gender: 'FEMALE',
      city: 'Mumbai',
      district: 'Govandi',
      category: BeneficiaryCategory.WIDOW_ASSISTANCE,
      nationalId: '123456789012',
      bankAccountNumber: '5010023910293',
      householdMemberCount: 5,
      monthlyIncomeINR: 3000,
      primaryNeedSummary: 'Widow with 4 minor children requiring monthly ration support',
      estimatedAidRequiredINR: 8000,
    });

    expect(beneficiary).toBeDefined();
    expect(beneficiary.beneficiaryNumber).toMatch(/^IMF-BEN-\d{4}-\d{5}$/);
    expect(beneficiary.encryptedNationalId).toBeDefined();
    expect(beneficiary.encryptedNationalId).not.toBe('123456789012');
    expect(beneficiary.nationalIdMasked).toBeDefined();
    expect(prisma.beneficiaryProfile.create).toHaveBeenCalled();
  });

  it('should disburse assistance and log sequential assistance tracking number', async () => {
    const aid = await BeneficiaryService.disburseAssistance({
      beneficiaryId: 'ben_test_1',
      projectId: 'prj_test_1',
      assistanceType: AssistanceType.DIRECT_BANK_TRANSFER,
      amountINR: 8000,
      itemDescription: 'Monthly Widow Sustenance Grant',
      paymentReference: 'DBT-2026-901',
    });

    expect(aid).toBeDefined();
    expect(aid.assistanceNumber).toMatch(/^IMF-AID-\d{4}-\d{5}$/);
    expect(aid.amountINR).toBeDefined();
    expect(prisma.beneficiaryAssistance.create).toHaveBeenCalled();
  });

  it('should record follow-up case notes and outcome evaluation', async () => {
    const followUp = await BeneficiaryService.recordFollowUp({
      beneficiaryId: 'ben_test_1',
      findingsNotes: 'Home visit conducted. Ration supplies received in good order.',
      socioeconomicOutcome: 'Children attending school regularly. Nutritional security stabilized.',
    });

    expect(followUp).toBeDefined();
    expect(followUp.socioeconomicOutcome).toContain('Nutritional security');
    expect(prisma.beneficiaryFollowUp.create).toHaveBeenCalled();
  });

  it('should decrypt sensitive PII only when explicitly authorized with audit log', async () => {
    const authorizedView = await BeneficiaryService.getBeneficiary('ben_test_1', {
      canReadSensitivePII: true,
      actorUserId: 'SUPER_ADMIN_USER',
    });

    expect(authorizedView).toBeDefined();
    expect((authorizedView as any)?.decryptedNationalId).toBe('123456789012');
    expect((authorizedView as any)?.decryptedBankAccount).toBe('5010023910293');
    expect(prisma.auditLog.create).toHaveBeenCalled();
  });

  it('should redact raw encrypted PII for unprivileged requests', async () => {
    const safeView = await BeneficiaryService.getBeneficiary('ben_test_1', {
      canReadSensitivePII: false,
    });

    expect(safeView).toBeDefined();
    expect(safeView?.encryptedNationalId).toBeUndefined();
    expect(safeView?.nationalIdMasked).toBeDefined();
  });

  it('should calculate beneficiary registry analytics', async () => {
    const analytics = await BeneficiaryService.getBeneficiaryAnalytics();
    expect(analytics).toBeDefined();
    expect(analytics.totalBeneficiaries).toBe(45);
    expect(analytics.criticalUrgentBeneficiaries).toBe(12);
    expect(analytics.totalAssistanceDisbursedINR).toBe(450000);
  });
});
