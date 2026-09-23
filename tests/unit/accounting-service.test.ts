import { describe, it, expect, vi } from 'vitest';
import { FinanceService } from '@/lib/finance/finance-service';
import {
  GrantType,
  GrantStatus,
  VendorCategory,
  ExpenseCategory,
  ExpenseStatus,
  PaymentMethod,
  ReconciliationStatus,
} from '@prisma/client';

// Mock Prisma
vi.mock('@/lib/db', async () => {
  const { Prisma } = await vi.importActual<typeof import('@prisma/client')>('@prisma/client');

  return {
    prisma: {
      accountHead: {
        upsert: vi.fn().mockResolvedValue({}),
        findUniqueOrThrow: vi.fn().mockImplementation(({ where }: any) => {
          return Promise.resolve({
            id: `head_${where.accountCode || where.id || '1'}`,
            accountCode: where.accountCode || '1010-HDFC-BANK-MAIN',
            name: 'Account Head Name',
            currentBalance: new Prisma.Decimal(1000000),
          });
        }),
        update: vi.fn().mockResolvedValue({}),
      },
      grantAndCsrFunding: {
        count: vi.fn().mockResolvedValue(5),
        create: vi.fn().mockImplementation(({ data }: any) => ({
          id: 'grant_new_1',
          grantNumber: data.grantNumber,
          fundingAgencyName: data.fundingAgencyName,
          grantType: data.grantType,
          status: data.status,
          sanctionedAmountINR: data.sanctionedAmountINR,
          disbursedAmountINR: data.disbursedAmountINR,
          balanceAmountINR: data.balanceAmountINR,
          purpose: data.purpose,
        })),
        findUniqueOrThrow: vi.fn().mockResolvedValue({
          id: 'grant_new_1',
          grantNumber: 'IMF-GRNT-2026-00006',
          fundingAgencyName: 'CSR Trust',
          grantType: 'CSR_CORPORATE',
          sanctionedAmountINR: new Prisma.Decimal(500000),
          disbursedAmountINR: new Prisma.Decimal(200000),
          balanceAmountINR: new Prisma.Decimal(300000),
          purpose: 'Medical relief',
        }),
        update: vi.fn().mockImplementation(({ data }: any) => ({
          id: 'grant_new_1',
          grantNumber: 'IMF-GRNT-2026-00006',
          disbursedAmountINR: data.disbursedAmountINR,
          balanceAmountINR: data.balanceAmountINR,
        })),
      },
      vendor: {
        count: vi.fn().mockResolvedValue(12),
        create: vi.fn().mockImplementation(({ data }: any) => ({
          id: 'vnd_1',
          vendorCode: data.vendorCode,
          legalName: data.legalName,
          category: data.category,
          panTaxId: data.panTaxId,
          gstNumber: data.gstNumber,
          bankAccountNumber: data.bankAccountNumber,
        })),
        update: vi.fn().mockResolvedValue({
          id: 'vnd_1',
          verifiedAt: new Date(),
        }),
      },
      expenseRecord: {
        count: vi.fn().mockResolvedValue(44),
        create: vi.fn().mockImplementation(({ data }: any) => ({
          id: 'exp_1',
          expenseNumber: data.expenseNumber,
          title: data.title,
          category: data.category,
          amount: data.amount,
          status: data.status,
        })),
        findUniqueOrThrow: vi.fn().mockResolvedValue({
          id: 'exp_1',
          expenseNumber: 'EXP-202609-00045',
          title: 'Direct Medical Relief Kits',
          category: 'RELIEF_AID_DIRECT',
          amount: new Prisma.Decimal(35000),
          paymentDate: new Date(),
          paymentMethod: 'BANK_TRANSFER_NEFT',
          paymentReference: 'UTR998877',
          status: 'APPROVED',
          budgetLineId: 'bl_1',
          projectId: 'prj_1',
        }),
        update: vi.fn().mockImplementation(({ data }: any) => ({
          id: 'exp_1',
          status: data.status || 'PAID',
          voucherId: data.voucherId,
        })),
      },
      budgetLine: {
        update: vi.fn().mockResolvedValue({}),
      },
      project: {
        update: vi.fn().mockResolvedValue({}),
      },
      voucher: {
        create: vi.fn().mockImplementation(({ data }: any) => ({
          id: 'vch_created_1',
          voucherNumber: data.voucherNumber,
          voucherType: data.voucherType,
          totalAmount: data.totalAmount,
          entries: data.entries?.create || [],
        })),
      },
      annualBudget: {
        create: vi.fn().mockImplementation(({ data }: any) => ({
          id: 'bdg_1',
          budgetCode: data.budgetCode,
          fiscalYear: data.fiscalYear,
          title: data.title,
          totalAllocatedINR: data.totalAllocatedINR,
          lines: data.lines?.create || [],
        })),
      },
      bankReconciliationStatement: {
        count: vi.fn().mockResolvedValue(3),
        create: vi.fn().mockImplementation(({ data }: any) => ({
          id: 'brs_1',
          reconCode: data.reconCode,
          statementClosingBalance: data.statementClosingBalance,
          bookClosingBalance: data.bookClosingBalance,
          discrepancyAmount: data.discrepancyAmount,
          status: data.status,
        })),
        update: vi.fn().mockImplementation(({ data }: any) => ({
          id: 'brs_1',
          status: data.status,
          verifiedAt: data.verifiedAt,
        })),
      },
      reconciliationItem: {
        update: vi.fn().mockResolvedValue({}),
      },
      accountingStatutoryConfig: {
        upsert: vi.fn().mockImplementation(({ create }: any) => ({
          id: 'cfg_1',
          configKey: create.configKey,
          ruleName: create.ruleName,
          disclaimerTag: create.disclaimerTag,
        })),
      },
      auditLog: {
        findFirst: vi.fn().mockResolvedValue({ rollingHash: 'mock_prev_hash' }),
        create: vi.fn().mockResolvedValue({ id: 'aud_1' }),
      },
    },
  };
});

describe('Accounting & Finance Service Operations Tests', () => {
  it('1. should create an Institutional Grant and generate sequential grant number', async () => {
    const grant = await FinanceService.createGrant(
      {
        fundingAgencyName: 'Gates Global Development',
        grantType: GrantType.INSTITUTIONAL_GRANT,
        sanctionedAmountINR: 1000000,
        disbursedAmountINR: 400000,
        purpose: 'Healthcare and sanitation infrastructure',
        grantStartDate: new Date('2026-01-01'),
        grantEndDate: new Date('2026-12-31'),
      },
      'FIN_OFFICER_1'
    );

    expect(grant).toBeDefined();
    expect(grant.grantNumber).toMatch(/^IMF-GRNT-\d{4}-\d{5}$/);
    expect(Number(grant.sanctionedAmountINR)).toBe(1000000);
    expect(Number(grant.disbursedAmountINR)).toBe(400000);
    expect(Number(grant.balanceAmountINR)).toBe(600000);
  });

  it('2. should disburse grant tranche and generate balanced receipt voucher', async () => {
    const result = await FinanceService.disburseGrantTranche('grant_new_1', 150000, 'FIN_OFFICER_1');

    expect(result.grant).toBeDefined();
    expect(result.voucherNumber).toMatch(/^VCH-GRNT-\d{4}-\d+/);
  });

  it('3. should create a Vendor and encrypt confidential bank details', async () => {
    const vendor = await FinanceService.createVendor(
      {
        legalName: 'National Relief Logistics Private Limited',
        category: VendorCategory.CONTRACTOR_SERVICES,
        contactPerson: 'Mr. Zayd Ali',
        email: 'zayd@relieflogistics.in',
        phone: '+919876543210',
        panTaxId: 'ABCDE1234F',
        gstNumber: '07AAAAA0000A1Z5',
        bankAccountNumber: '98765432101234',
        bankIfscCode: 'HDFC0000123',
      },
      'FIN_OFFICER_1'
    );

    expect(vendor).toBeDefined();
    expect(vendor.vendorCode).toMatch(/^VND-\d{5}$/);
    expect(vendor.panTaxId).toBe('ABCDE1234F');
    expect(vendor.bankAccountNumber).toContain('34');
    expect(vendor.bankAccountNumber).toContain('*');
  });

  it('4. should record an expense, approve it, and disburse with balanced GL voucher', async () => {
    const expense = await FinanceService.createExpense(
      {
        title: 'Emergency Flood Relief Food Kits',
        category: ExpenseCategory.RELIEF_AID_DIRECT,
        amount: 35000,
        paymentMethod: PaymentMethod.BANK_TRANSFER_NEFT,
      },
      'FIN_OFFICER_1'
    );

    expect(expense).toBeDefined();
    expect(expense.expenseNumber).toMatch(/^EXP-\d{6}-\d{5}$/);
    expect(expense.status).toBe(ExpenseStatus.DRAFT);

    const approved = await FinanceService.approveExpense('exp_1', 'DIRECTOR_1');
    expect(approved.status).toBe(ExpenseStatus.APPROVED);

    const paidResult = await FinanceService.payExpense('exp_1', 'NEFT-UTR-778899', 'FIN_OFFICER_1');
    expect(paidResult.expense.status).toBe(ExpenseStatus.PAID);
    expect(paidResult.voucherNumber).toMatch(/^VCH-EXP-\d{4}-\d+/);
  });

  it('5. should create annual budget and calculate total allocation sum', async () => {
    const budget = await FinanceService.createBudget(
      {
        fiscalYear: 2026,
        title: 'Annual Humanitarian & Operations Budget FY 2026',
        lines: [
          { lineCode: 'BL-01', title: 'Medical Aid', category: ExpenseCategory.RELIEF_AID_DIRECT, allocatedAmountINR: 500000 },
          { lineCode: 'BL-02', title: 'Water Projects', category: ExpenseCategory.PROJECT_EXECUTION, allocatedAmountINR: 300000 },
        ],
      },
      'FIN_OFFICER_1'
    );

    expect(budget).toBeDefined();
    expect(budget.budgetCode).toBe('BDG-2026-FY');
    expect(Number(budget.totalAllocatedINR)).toBe(800000);
  });

  it('6. should create bank reconciliation statement and support auditor sign-off', async () => {
    const statement = await FinanceService.createReconciliationStatement(
      {
        bankAccountHeadId: 'h1',
        statementDate: new Date('2026-09-30'),
        statementClosingBalance: 500000,
        bookClosingBalance: 500000,
      },
      'AUDITOR_1'
    );

    expect(statement).toBeDefined();
    expect(statement.reconCode).toMatch(/^BRS-\d{6}-\d{4}$/);
    expect(Number(statement.discrepancyAmount)).toBe(0);
    expect(statement.status).toBe(ReconciliationStatus.RECONCILED);

    const signed = await FinanceService.signOffReconciliation(statement.id, 'Audited clean', 'AUDITOR_1');
    expect(signed.status).toBe(ReconciliationStatus.RECONCILED);
  });

  it('7. should create configurable statutory accounting rule with mandatory disclaimer tag', async () => {
    const config = await FinanceService.upsertStatutoryConfig(
      {
        configKey: 'CHARITABLE_UTILIZATION_MIN_PCT',
        configCategory: 'NON_PROFIT_COMPLIANCE',
        ruleName: 'Minimum 85% Charitable Income Utilization Target',
        ruleParamsJson: { minPercentage: 85, sectionReference: '11(1)(a)' },
      },
      'AUDITOR_1'
    );

    expect(config.configKey).toBe('CHARITABLE_UTILIZATION_MIN_PCT');
    expect(config.disclaimerTag).toBe('REQUIRES_PROFESSIONAL_VERIFICATION');
  });
});
