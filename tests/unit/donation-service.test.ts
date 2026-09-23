import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DonationService } from '@/lib/donations/donation-service';
import { PaymentMethod } from '@prisma/client';

// Mock Prisma with vi.importActual
vi.mock('@/lib/db', async () => {
  const { Prisma } = await vi.importActual<typeof import('@prisma/client')>('@prisma/client');

  const defaultMockDonation = {
    id: 'don_test_1',
    receiptNumber: 'IMF-REC-2026-00043',
    donorId: 'donor_profile_1',
    donorName: 'Br. Zainul Abideen',
    donorEmail: 'zain@example.com',
    donorPanMasked: 'ABCDE****F',
    amount: new Prisma.Decimal(5000),
    currency: 'INR',
    amountInINR: new Prisma.Decimal(5000),
    fundType: 'ZAKAT_MAL',
    paymentProvider: 'MOCK',
    paymentStatus: 'INITIATED',
    is80GRequested: true,
    completedAt: new Date(),
    category: {
      is80GEligible: true,
      complianceStatus: 'APPROVED',
      taxDeductionPercent: 50,
    },
  };

  return {
    prisma: {
      donationCategory: {
        upsert: vi.fn().mockResolvedValue({}),
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'cat_zakat',
            slug: 'zakat-mal',
            name: 'Zakat al-Mal (100% Direct Policy)',
            fundType: 'ZAKAT_MAL',
            isZakatEligible: true,
            is80GEligible: true,
            taxDeductionPercent: 50,
            complianceStatus: 'APPROVED',
            isActive: true,
          },
          {
            id: 'cat_khums',
            slug: 'khums-imam',
            name: 'Khums Sahm-e-Imam (a.s.)',
            fundType: 'KHUMS_SEHAM_E_IMAM',
            isKhumsEligible: true,
            is80GEligible: false,
            taxDeductionPercent: 0,
            complianceStatus: 'APPROVED',
            isActive: true,
          },
          {
            id: 'cat_sadaqah',
            slug: 'general-sadaqah',
            name: 'General Sadaqah & Humanitarian Relief',
            fundType: 'GENERAL_SADAQAH',
            isZakatEligible: false,
            is80GEligible: true,
            taxDeductionPercent: 50,
            complianceStatus: 'APPROVED',
            isActive: true,
          },
        ]),
        findUnique: vi.fn().mockImplementation(({ where }: any) => {
          if (where.slug === 'zakat-mal') {
            return Promise.resolve({
              id: 'cat_zakat',
              slug: 'zakat-mal',
              name: 'Zakat al-Mal (100% Direct Policy)',
              fundType: 'ZAKAT_MAL',
              isZakatEligible: true,
              is80GEligible: true,
              taxDeductionPercent: 50,
              complianceStatus: 'APPROVED',
            });
          }
          return Promise.resolve({
            id: 'cat_sadaqah',
            slug: 'general-sadaqah',
            name: 'General Sadaqah',
            fundType: 'GENERAL_SADAQAH',
            is80GEligible: true,
            complianceStatus: 'APPROVED',
          });
        }),
        findFirst: vi.fn().mockResolvedValue({
          id: 'cat_sadaqah',
          slug: 'general-sadaqah',
          name: 'General Sadaqah',
          fundType: 'GENERAL_SADAQAH',
          is80GEligible: true,
          complianceStatus: 'APPROVED',
        }),
      },
      campaign: {
        findUnique: vi.fn().mockResolvedValue(null),
        update: vi.fn().mockResolvedValue({}),
      },
      donorProfile: {
        findUnique: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ id: 'donor_profile_1', email: 'zain@example.com' }),
        update: vi.fn().mockResolvedValue({}),
      },
      donation: {
        count: vi.fn().mockResolvedValue(42),
        findUnique: vi.fn().mockResolvedValue(null),
        findFirst: vi.fn().mockResolvedValue(defaultMockDonation),
        findUniqueOrThrow: vi.fn().mockResolvedValue({
          ...defaultMockDonation,
          paymentStatus: 'SUCCESS',
        }),
        create: vi.fn().mockResolvedValue(defaultMockDonation),
        update: vi.fn().mockResolvedValue({
          ...defaultMockDonation,
          paymentStatus: 'SUCCESS',
        }),
      },
      paymentTransaction: {
        create: vi.fn().mockResolvedValue({}),
        upsert: vi.fn().mockResolvedValue({}),
      },
      taxExemptionReceipt: {
        count: vi.fn().mockResolvedValue(10),
        create: vi.fn().mockResolvedValue({
          id: 'tax_rec_1',
          certificateNumber: 'IMF-80G-2026-0011',
        }),
      },
      voucher: {
        count: vi.fn().mockResolvedValue(100),
        create: vi.fn().mockResolvedValue({
          id: 'vouch_1',
          voucherNumber: 'VCH-2026-00101',
        }),
      },
      voucherEntry: {
        createMany: vi.fn().mockResolvedValue({ count: 2 }),
      },
      accountHead: {
        findUnique: vi.fn().mockImplementation(({ where }: any) => {
          return Promise.resolve({ id: 'head_1', accountCode: where.accountCode, name: 'Head Name', currentBalance: new Prisma.Decimal(0) });
        }),
        findUniqueOrThrow: vi.fn().mockImplementation(({ where }: any) => {
          return Promise.resolve({ id: 'head_1', accountCode: where.accountCode, name: 'Head Name', currentBalance: new Prisma.Decimal(0) });
        }),
        upsert: vi.fn().mockResolvedValue({}),
        update: vi.fn().mockResolvedValue({}),
      },
      refundRecord: {
        create: vi.fn().mockResolvedValue({ id: 'rfnd_1' }),
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

describe('Donation Service & Core Workflow Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should seed default verified categories with proper compliance flags', async () => {
    const categories = await DonationService.getActiveCategories();
    expect(categories.length).toBeGreaterThanOrEqual(3);

    const zakatCat = categories.find((c) => c.slug === 'zakat-mal');
    expect(zakatCat).toBeDefined();
    expect(zakatCat?.isZakatEligible).toBe(true);
    expect(zakatCat?.complianceStatus).toBe('APPROVED');

    const khumsCat = categories.find((c) => c.slug === 'khums-imam');
    expect(khumsCat).toBeDefined();
    expect(khumsCat?.isKhumsEligible).toBe(true);
    expect(khumsCat?.is80GEligible).toBe(false);
  });

  it('should initiate a donation order with masked PAN and sequential receipt numbering', async () => {
    const donation = await DonationService.initiateDonation({
      amount: 5000,
      currency: 'INR',
      categorySlug: 'zakat-mal',
      donorName: 'Br. Zainul Abideen',
      donorEmail: 'zain@example.com',
      donorPhone: '+919876543210',
      donorPan: 'ABCDE1234F',
      is80GRequested: true,
      paymentMethod: PaymentMethod.UPI,
    });

    expect(donation).toBeDefined();
    expect(donation.receiptNumber).toMatch(/^IMF-REC-\d{4}-\d{5}$/);
    expect(donation.amount).toBe(5000);
    // With 80G_STATUS = NOT_VERIFIED, is80GEligible is safely false, while is80GRequested is true
    expect(donation.is80GEligible).toBe(false);
    expect(donation.is80GRequested).toBe(true);
    expect(prisma.donation.create).toHaveBeenCalled();
  });

  it('should process successful payment, update CRM profile, and issue compliant receipt (80G disabled when NOT_VERIFIED)', async () => {
    const paymentResult = await DonationService.processSuccessfulPayment({
      donationId: 'don_test_1',
      gatewayOrderId: 'mock_order_123',
      gatewayPaymentId: 'pay_test_9988',
      gatewaySignature: 'sig_valid',
    });

    expect(paymentResult.success).toBe(true);
    expect(paymentResult.receiptNumber).toBe('IMF-REC-2026-00043');
    expect(paymentResult.qrVerificationHash).toBeDefined();
    // In production default NOT_VERIFIED mode, 80G certificate issuance is safely disabled
    expect(paymentResult.is80GIssued).toBe(false);
    expect(paymentResult.voucherNumber).toMatch(/^VCH-\d{4}-\d+/);
  });

  it('should process authorized refund and rebalance records', async () => {
    const refundRes = await DonationService.processRefund({
      donationId: 'don_test_1',
      reason: 'Donor requested cancellation within statutory window',
      approvedByUserId: 'TEST_ADMIN',
    });

    expect(refundRes.success).toBe(true);
    expect(refundRes.refundId).toMatch(/^RFND-/);
    expect(prisma.refundRecord.create).toHaveBeenCalled();
  });
});
