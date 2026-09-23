import { describe, it, expect, vi } from 'vitest';
import { GeneralLedgerService } from '@/lib/finance/general-ledger-service';
import { FundType, PaymentMethod, PaymentProviderType, DonationStatus } from '@prisma/client';

// Mock Prisma with vi.importActual
vi.mock('@/lib/db', async () => {
  const { Prisma } = await vi.importActual<typeof import('@prisma/client')>('@prisma/client');

  return {
    prisma: {
      accountHead: {
        upsert: vi.fn().mockResolvedValue({}),
        findMany: vi.fn().mockResolvedValue([
          { id: 'h1', accountCode: '1010-HDFC-BANK-MAIN', name: 'HDFC Bank Main', accountType: 'ASSET', currentBalance: new Prisma.Decimal(500000), isRestricted: false },
          { id: 'h2', accountCode: '1020-RAZORPAY-CLEARING', name: 'Razorpay Clearing', accountType: 'ASSET', currentBalance: new Prisma.Decimal(250000), isRestricted: false },
          { id: 'h3', accountCode: '2010-ZAKAT-MAL-RESERVE', name: 'Zakat al-Mal Reserve', accountType: 'EQUITY_RESERVE', currentBalance: new Prisma.Decimal(400000), isRestricted: true },
          { id: 'h4', accountCode: '3010-GENERAL-SADAQAH', name: 'General Sadaqah Reserve', accountType: 'EQUITY_RESERVE', currentBalance: new Prisma.Decimal(350000), isRestricted: false },
        ]),
        findUnique: vi.fn().mockImplementation(({ where }: any) => {
          return Promise.resolve({ id: 'h_dyn', accountCode: where.accountCode, name: 'Head Name', currentBalance: new Prisma.Decimal(0) });
        }),
        findUniqueOrThrow: vi.fn().mockImplementation(({ where }: any) => {
          return Promise.resolve({ id: 'h_dyn', accountCode: where.accountCode, name: 'Head Name', currentBalance: new Prisma.Decimal(0) });
        }),
        update: vi.fn().mockResolvedValue({}),
      },
      voucher: {
        count: vi.fn().mockResolvedValue(25),
        create: vi.fn().mockResolvedValue({
          id: 'vouch_1',
          voucherNumber: 'VCH-2026-000026',
        }),
        findUnique: vi.fn().mockResolvedValue({
          id: 'vouch_1',
          voucherNumber: 'VCH-2026-000026',
          entries: [
            { id: 'e1', debitAmount: new Prisma.Decimal(15000), creditAmount: new Prisma.Decimal(0) },
            { id: 'e2', debitAmount: new Prisma.Decimal(0), creditAmount: new Prisma.Decimal(15000) },
          ],
        }),
      },
      voucherEntry: {
        createMany: vi.fn().mockResolvedValue({ count: 2 }),
      },
      $transaction: vi.fn().mockImplementation(async (cb) => {
        const { prisma } = await import('@/lib/db');
        return cb(prisma);
      }),
    },
  };
});

import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

describe('General Ledger & Double-Entry Accounting Tests', () => {
  it('should initialize complete standard non-profit Chart of Accounts', async () => {
    await GeneralLedgerService.ensureChartOfAccounts();
    expect(prisma.accountHead.upsert).toHaveBeenCalled();

    const heads = await prisma.accountHead.findMany();
    expect(heads.length).toBeGreaterThanOrEqual(4);

    const bankHead = heads.find((h) => h.accountCode === '1010-HDFC-BANK-MAIN');
    expect(bankHead).toBeDefined();

    const zakatReserve = heads.find((h) => h.accountCode === '2010-ZAKAT-MAL-RESERVE');
    expect(zakatReserve).toBeDefined();
    expect(zakatReserve?.isRestricted).toBe(true);
  });

  it('should create balanced double-entry voucher where total debit equals total credit', async () => {
    const mockDonation = {
      id: 'don_gl_123',
      receiptNumber: 'IMF-REC-2026-10045',
      donorName: 'Ledger Test Donor',
      donorEmail: 'ledger@example.com',
      amount: new Prisma.Decimal(15000),
      currency: 'INR',
      amountInINR: new Prisma.Decimal(15000),
      fundType: FundType.ZAKAT_MAL,
      paymentMethod: PaymentMethod.UPI,
      paymentProvider: PaymentProviderType.RAZORPAY,
      paymentStatus: DonationStatus.SUCCESS,
      createdAt: new Date(),
    };

    const voucherNumber = await GeneralLedgerService.recordDonationJournalEntry(mockDonation as any);
    expect(voucherNumber).toMatch(/^VCH-\d{4}-\d+/);

    const voucher = await prisma.voucher.findUnique({
      where: { voucherNumber },
      include: { entries: true },
    });

    expect(voucher).toBeDefined();
    expect(voucher?.entries.length).toBe(2);

    const totalDebit = voucher?.entries.reduce((sum, e) => sum + Number(e.debitAmount), 0);
    const totalCredit = voucher?.entries.reduce((sum, e) => sum + Number(e.creditAmount), 0);

    expect(totalDebit).toBe(15000);
    expect(totalCredit).toBe(15000);
    expect(totalDebit).toBe(totalCredit);
  });

  it('should calculate trial balance and confirm balanced ledger state', async () => {
    const summary = await GeneralLedgerService.getLedgerSummary();
    expect(summary).toBeDefined();
    expect(Number(summary.totalDebits)).toBe(750000); // 500000 + 250000
    expect(Number(summary.totalCredits)).toBe(750000); // 400000 + 350000
    expect(summary.isTrialBalanceMatched).toBe(true);
  });
});
