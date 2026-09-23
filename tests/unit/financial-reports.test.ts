import { describe, it, expect, vi } from 'vitest';
import { FinancialReportService, AUDIT_DISCLAIMER_TEXT } from '@/lib/finance/financial-report-service';

// Mock Prisma
vi.mock('@/lib/db', async () => {
  const { Prisma } = await vi.importActual<typeof import('@prisma/client')>('@prisma/client');

  return {
    prisma: {
      donation: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'don_1',
            amount: new Prisma.Decimal(10000),
            amountInINR: new Prisma.Decimal(10000),
            fundType: 'ZAKAT_MAL',
            is80GRequested: true,
            is80GIssued: false,
            paymentProvider: 'RAZORPAY',
            paymentStatus: 'SUCCESS',
            createdAt: new Date('2026-03-15'),
          },
          {
            id: 'don_2',
            amount: new Prisma.Decimal(25000),
            amountInINR: new Prisma.Decimal(25000),
            fundType: 'GENERAL_SADAQAH',
            is80GRequested: false,
            is80GIssued: false,
            paymentProvider: 'UPI_MANUAL',
            paymentStatus: 'SUCCESS',
            createdAt: new Date('2026-04-10'),
          },
        ]),
        aggregate: vi.fn().mockResolvedValue({
          _sum: { amountInINR: new Prisma.Decimal(35000) },
          _count: { id: 2 },
        }),
      },
      grantAndCsrFunding: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'grant_1',
            grantNumber: 'IMF-GRNT-2026-00001',
            fundingAgencyName: 'Global Humanitarian Trust',
            grantType: 'INSTITUTIONAL_GRANT',
            sanctionedAmountINR: new Prisma.Decimal(500000),
            disbursedAmountINR: new Prisma.Decimal(200000),
            createdAt: new Date('2026-01-10'),
          },
          {
            id: 'grant_2',
            grantNumber: 'IMF-GRNT-2026-00002',
            fundingAgencyName: 'Tech Corp CSR Foundation',
            grantType: 'CSR_CORPORATE',
            sanctionedAmountINR: new Prisma.Decimal(300000),
            disbursedAmountINR: new Prisma.Decimal(100000),
            createdAt: new Date('2026-02-15'),
          },
        ]),
      },
      expenseRecord: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'exp_1',
            expenseNumber: 'EXP-202603-00001',
            title: 'Emergency Food Supplies Distribution',
            category: 'RELIEF_AID_DIRECT',
            amount: new Prisma.Decimal(40000),
            paymentDate: new Date('2026-03-20'),
            paymentMethod: 'BANK_TRANSFER_NEFT',
            paymentReference: 'UTR12345678',
            status: 'PAID',
            vendor: { vendorCode: 'VND-00001', legalName: 'Apex Logistics Ltd', category: 'SUPPLIES_MATERIALS' },
            project: { projectNumber: 'IMF-PRJ-2026-00001', title: 'Flood Relief 2026' },
          },
          {
            id: 'exp_2',
            expenseNumber: 'EXP-202604-00002',
            title: 'Office Cloud Server & IT Hosting',
            category: 'ADMINISTRATIVE_OVERHEAD',
            amount: new Prisma.Decimal(15000),
            paymentDate: new Date('2026-04-05'),
            paymentMethod: 'CARD',
            paymentReference: 'TXN998877',
            status: 'PAID',
            vendor: null,
            project: null,
          },
        ]),
        aggregate: vi.fn().mockResolvedValue({
          _sum: { amount: new Prisma.Decimal(55000) },
          _count: { id: 2 },
        }),
      },
      payrollPeriod: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'pay_1',
            periodCode: 'PAY-2026-03',
            totalGrossAmountINR: new Prisma.Decimal(60000),
            payslips: [
              { employerProvidentFund: new Prisma.Decimal(3600), employerInsurance: new Prisma.Decimal(1500) },
            ],
          },
        ]),
        aggregate: vi.fn().mockResolvedValue({
          _sum: { totalGrossAmountINR: new Prisma.Decimal(60000) },
        }),
      },
      accountHead: {
        findUnique: vi.fn().mockImplementation(({ where }: any) => {
          if (where.accountCode === '1010-HDFC-BANK-MAIN') {
            return Promise.resolve({ id: 'h1', accountCode: '1010-HDFC-BANK-MAIN', currentBalance: new Prisma.Decimal(450000) });
          }
          if (where.accountCode === '1040-PETTY-CASH-IMPREST') {
            return Promise.resolve({ id: 'h2', accountCode: '1040-PETTY-CASH-IMPREST', currentBalance: new Prisma.Decimal(25000) });
          }
          return Promise.resolve(null);
        }),
        findMany: vi.fn().mockResolvedValue([
          { accountCode: '1010-HDFC-BANK-MAIN', accountType: 'ASSET', isRestricted: false, currentBalance: new Prisma.Decimal(450000) },
          { accountCode: '2010-ZAKAT-MAL-RESERVE', accountType: 'LIABILITY', isRestricted: true, currentBalance: new Prisma.Decimal(300000) },
          { accountCode: '3010-GENERAL-SADAQAH', accountType: 'EQUITY_RESERVE', isRestricted: false, currentBalance: new Prisma.Decimal(175000) },
        ]),
      },
      voucher: {
        findMany: vi.fn().mockImplementation(({ where }: any) => {
          if (where.voucherType === 'RECEIPT') {
            return Promise.resolve([
              { id: 'v1', totalAmount: new Prisma.Decimal(335000) },
            ]);
          }
          if (where.voucherType === 'PAYMENT') {
            return Promise.resolve([
              { id: 'v2', totalAmount: new Prisma.Decimal(120100) },
            ]);
          }
          return Promise.resolve([]);
        }),
      },
      annualBudget: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'bdg_1',
            budgetCode: 'BDG-2026-FY',
            fiscalYear: 2026,
            totalAllocatedINR: new Prisma.Decimal(1000000),
            lines: [
              {
                lineCode: 'BL-AID-01',
                title: 'Healthcare Assistance & Lifeline',
                category: 'RELIEF_AID_DIRECT',
                allocatedAmountINR: new Prisma.Decimal(500000),
                spentAmountINR: new Prisma.Decimal(250000),
                project: { title: 'Dialysis Aid', projectNumber: 'IMF-PRJ-01' },
              },
              {
                lineCode: 'BL-OPS-02',
                title: 'Logistics & Transportation',
                category: 'FIELD_LOGISTICS',
                allocatedAmountINR: new Prisma.Decimal(200000),
                spentAmountINR: new Prisma.Decimal(180000),
                project: null,
              },
            ],
          },
        ]),
      },
      project: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'prj_1',
            projectNumber: 'IMF-PRJ-2026-00001',
            title: 'Rural Borewell Clean Water Initiative',
            category: 'WATER_INFRASTRUCTURE',
            stage: 'EXECUTION',
            targetBeneficiariesCount: 2500,
            actualBeneficiariesCount: 1800,
            allocatedBudgetINR: new Prisma.Decimal(400000),
            disbursedAmountINR: new Prisma.Decimal(280000),
            expenses: [{ amount: new Prisma.Decimal(30000) }],
            assistanceRecords: [{ amountINR: new Prisma.Decimal(250000) }],
            grants: [],
          },
        ]),
      },
    },
  };
});

describe('Financial Reports Engine Unit Tests', () => {
  it('1. should generate Income & Expenditure Statement with exact revenue and expense balancing', async () => {
    const report = await FinancialReportService.getIncomeAndExpenditureReport({
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
    });

    expect(report.reportType).toBe('INCOME_AND_EXPENDITURE');
    expect(report.income.donations).toBe(35000);
    expect(report.income.institutionalGrants).toBe(200000);
    expect(report.income.csrFunding).toBe(100000);
    expect(report.income.totalIncome).toBe(335000);

    expect(report.expenditure.directProjectAid).toBe(40000);
    expect(report.expenditure.adminOverhead).toBe(15000);
    expect(report.expenditure.staffSalariesGross).toBe(60000);
    expect(report.expenditure.employerStatutoryBenefits).toBe(5100);
    expect(report.expenditure.totalExpenditure).toBe(120100);

    expect(report.netSurplusOrDeficit).toBe(335000 - 120100);
    expect(report.surplusStatus).toBe('SURPLUS');
    expect(report.disclaimer).toBe(AUDIT_DISCLAIMER_TEXT);
  });

  it('2. should generate Receipts & Payments Account with reconciled closing balances', async () => {
    const report = await FinancialReportService.getReceiptsAndPaymentsReport();

    expect(report.reportType).toBe('RECEIPTS_AND_PAYMENTS');
    expect(report.receipts.totalReceipts).toBe(335000);
    expect(report.payments.totalPayments).toBe(120100);
    expect(report.closingBalance.totalClosingBalance).toBe(475000);
    expect(report.netCashFlow).toBe(335000 - 120100);
    expect(report.disclaimer).toBe(AUDIT_DISCLAIMER_TEXT);
  });

  it('3. should generate Granular Expense Report with category and vendor details', async () => {
    const report = await FinancialReportService.getExpenseReport();

    expect(report.reportType).toBe('EXPENSE_REPORT');
    expect(report.summary.totalExpensesCount).toBe(2);
    expect(report.summary.totalExpensesAmountINR).toBe(55000);
    expect(report.expenses[0].vendor).toContain('Apex Logistics Ltd');
  });

  it('4. should generate Budget vs Actual report with accurate variances and threshold warnings', async () => {
    const report = await FinancialReportService.getBudgetVsActualReport(2026);

    expect(report.reportType).toBe('BUDGET_VS_ACTUAL');
    expect(report.summary.totalAllocatedINR).toBe(700000);
    expect(report.summary.totalSpentINR).toBe(430000);
    expect(report.summary.varianceINR).toBe(270000);

    const highUtilLine = report.lines.find((l) => l.lineCode === 'BL-OPS-02');
    expect(highUtilLine).toBeDefined();
    expect(highUtilLine?.status).toBe('WARNING_HIGH_UTILIZATION'); // 180k/200k = 90% >= 80%
  });

  it('5. should generate Project Utilization Report with direct aid and operational breakdown', async () => {
    const report = await FinancialReportService.getProjectUtilizationReport();

    expect(report.reportType).toBe('PROJECT_UTILIZATION');
    expect(report.summary.totalProjectsCount).toBe(1);
    expect(report.projects[0].allocatedBudgetINR).toBe(400000);
    expect(report.projects[0].totalSpentINR).toBe(280000);
    expect(report.projects[0].utilizationRatePercent).toBe(70);
    expect(report.projects[0].isOverBudget).toBe(false);
  });

  it('6. should generate Donation & Funding Report with 80G tax exemptions and ticket sizes', async () => {
    const report = await FinancialReportService.getDonationReport();

    expect(report.reportType).toBe('DONATION_REPORT');
    expect(report.summary.totalDonationsCount).toBe(2);
    expect(report.summary.totalAmountINR).toBe(35000);
    expect(report.summary.total80GTaxExemptINR).toBe(10000);
    expect(report.summary.totalNonExemptINR).toBe(25000);
  });

  it('7. should generate Monthly Comprehensive Report with trend arrays', async () => {
    const report = await FinancialReportService.getMonthlyReport(2026);

    expect(report.reportType).toBe('MONTHLY_REPORT');
    expect(report.months.length).toBe(12);
    expect(report.months[0].monthName).toBe('January');
  });

  it('8. should generate Annual Report evaluating 85% Non-Profit Statutory Utilization Target', async () => {
    const report = await FinancialReportService.getAnnualReport(2026);

    expect(report.reportType).toBe('ANNUAL_REPORT');
    expect(report.statutory85PercentRuleAnalysis).toBeDefined();
    expect(report.statutory85PercentRuleAnalysis.minimumRequiredApplicationINR).toBe(335000 * 0.85);
    expect(report.statutory85PercentRuleAnalysis.reviewRequirement).toContain('REQUIRES PROFESSIONAL CA VERIFICATION');
  });

  it('9. should format CSV export with mandatory audit disclaimer header', () => {
    const mockData = {
      income: { donations: 35000, institutionalGrants: 200000, csrFunding: 100000, totalIncome: 335000 },
      expenditure: {
        directProjectAid: 40000,
        fieldLogistics: 0,
        staffSalariesGross: 60000,
        employerStatutoryBenefits: 5100,
        adminOverhead: 15000,
        utilitiesAndFacility: 0,
        legalAndAudit: 0,
        totalExpenditure: 120100,
      },
      netSurplusOrDeficit: 214900,
    };

    const csv = FinancialReportService.exportToCsv('INCOME_AND_EXPENDITURE', mockData);
    expect(csv).toContain('DISCLAIMER: This financial report is generated by the IMF-DOS Internal Accounting Engine');
    expect(csv).toContain('"Income","TOTAL REVENUE",335000');
    expect(csv).toContain('"Expenditure","TOTAL EXPENDITURE",120100');
    expect(csv).toContain('"Summary","NET SURPLUS / (DEFICIT)",214900');
  });
});
