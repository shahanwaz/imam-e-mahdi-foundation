import { prisma } from '@/lib/db';
import {
  AccountType,
  VoucherType,
  FundType,
  PaymentProviderType,
  Donation,
  PayrollPeriod,
  Payslip,
  ExpenseRecord,
  ExpenseCategory,
  GrantAndCsrFunding,
  ReconciliationItem,
  ReconciliationItemType,
  BankReconciliationStatement,
  PaymentMethod,
  Prisma,
} from '@prisma/client';

export interface DefaultAccountConfig {
  accountCode: string;
  name: string;
  accountType: AccountType;
  isRestricted: boolean;
}

export const DEFAULT_CHART_OF_ACCOUNTS: DefaultAccountConfig[] = [
  // Assets (1000s)
  { accountCode: '1010-HDFC-BANK-MAIN', name: 'HDFC Bank Ltd - Central Trust Account', accountType: AccountType.ASSET, isRestricted: false },
  { accountCode: '1020-RAZORPAY-CLEARING', name: 'Razorpay Gateway Clearing Account', accountType: AccountType.ASSET, isRestricted: false },
  { accountCode: '1030-STRIPE-USD-CLEARING', name: 'Stripe International Multi-Currency Clearing', accountType: AccountType.ASSET, isRestricted: false },
  { accountCode: '1040-PETTY-CASH-IMPREST', name: 'Field Operations Petty Cash Imprest', accountType: AccountType.ASSET, isRestricted: false },
  
  // Restricted Religious & Grant Reserves (2000s - 100% Direct Isolation)
  { accountCode: '2010-ZAKAT-MAL-RESERVE', name: 'Zakat al-Mal Restricted Reserve (100% Direct)', accountType: AccountType.LIABILITY, isRestricted: true },
  { accountCode: '2011-ZAKAT-FITRAH-RESERVE', name: 'Zakat al-Fitr (Fitrah) Restricted Reserve', accountType: AccountType.LIABILITY, isRestricted: true },
  { accountCode: '2020-KHUMS-SEHAM-IMAM', name: 'Khums Sahm-e-Imam (a.s.) Restricted Reserve', accountType: AccountType.LIABILITY, isRestricted: true },
  { accountCode: '2021-KHUMS-SEHAM-SADAT', name: 'Khums Sahm-e-Sadat Restricted Reserve', accountType: AccountType.LIABILITY, isRestricted: true },
  { accountCode: '2060-RESTRICTED-GRANTS-CSR', name: 'Institutional Grants & CSR Project Reserve', accountType: AccountType.LIABILITY, isRestricted: true },
  
  // Payables & Liabilities (2000s)
  { accountCode: '2030-SALARY-PAYABLE', name: 'Net Staff Salaries & Compensation Payable', accountType: AccountType.LIABILITY, isRestricted: false },
  { accountCode: '2040-STATUTORY-TAX-PAYABLE', name: 'Statutory TDS & Tax Withholdings Payable', accountType: AccountType.LIABILITY, isRestricted: false },
  { accountCode: '2041-STATUTORY-PROVIDENT-FUND-PAYABLE', name: 'Statutory Provident Fund & Social Security Payable', accountType: AccountType.LIABILITY, isRestricted: false },
  { accountCode: '2042-STATUTORY-INSURANCE-PAYABLE', name: 'Statutory Medical & Staff Insurance Payable', accountType: AccountType.LIABILITY, isRestricted: false },
  { accountCode: '2050-ACCOUNTS-PAYABLE-VENDORS', name: 'Accounts Payable - Vendors & Suppliers', accountType: AccountType.LIABILITY, isRestricted: false },

  // Designated Project & General Funds (3000s)
  { accountCode: '3010-GENERAL-SADAQAH', name: 'General Sadaqah & Humanitarian Relief Fund', accountType: AccountType.EQUITY_RESERVE, isRestricted: false },
  { accountCode: '3020-ORPHAN-EDUCATION', name: 'Orphan & Higher Education Sponsorship Fund', accountType: AccountType.EQUITY_RESERVE, isRestricted: true },
  { accountCode: '3030-MEDICAL-RELIEF', name: 'Critical Medical Aid & Dialysis Lifeline Fund', accountType: AccountType.EQUITY_RESERVE, isRestricted: true },
  { accountCode: '3040-WATER-INFRASTRUCTURE', name: 'Rural Clean Water & Borewell Capital Fund', accountType: AccountType.EQUITY_RESERVE, isRestricted: true },

  // Incomes (4000s)
  { accountCode: '4010-INSTITUTIONAL-GRANTS-INCOME', name: 'Institutional & Foundation Grants Revenue', accountType: AccountType.INCOME, isRestricted: false },
  { accountCode: '4020-CSR-CORPORATE-INCOME', name: 'Corporate CSR Grants & Partnerships Revenue', accountType: AccountType.INCOME, isRestricted: false },
  { accountCode: '4030-BANK-INTEREST-INCOME', name: 'Bank Account Savings & Term Deposit Interest', accountType: AccountType.INCOME, isRestricted: false },
  { accountCode: '4040-GENERAL-DONATION-INCOME', name: 'General Public Donations & Member Contributions', accountType: AccountType.INCOME, isRestricted: false },
  
  // Expenses (5000s)
  { accountCode: '5010-SALARY-WAGES-EXPENSE', name: 'Staff Salaries, Allowances & Compensation Expense', accountType: AccountType.EXPENSE, isRestricted: false },
  { accountCode: '5020-EMPLOYER-STATUTORY-EXPENSE', name: 'Employer Statutory Contribution Expense (PF & Insurance)', accountType: AccountType.EXPENSE, isRestricted: false },
  { accountCode: '5030-PROJECT-DIRECT-AID-EXPENSE', name: 'Direct Beneficiary Aid & Project Execution Expense', accountType: AccountType.EXPENSE, isRestricted: false },
  { accountCode: '5040-OFFICE-ADMIN-EXPENSE', name: 'General Administrative & Office Running Expense', accountType: AccountType.EXPENSE, isRestricted: false },
  { accountCode: '5050-GATEWAY-FEES', name: 'Payment Gateway Processing & Merchant Charges', accountType: AccountType.EXPENSE, isRestricted: false },
  { accountCode: '5060-LEGAL-AUDIT-EXPENSE', name: 'Professional Legal, CA & Statutory Audit Expense', accountType: AccountType.EXPENSE, isRestricted: false },
  { accountCode: '5070-FIELD-LOGISTICS-EXPENSE', name: 'Field Relief Transport & Logistics Expense', accountType: AccountType.EXPENSE, isRestricted: false },
  { accountCode: '5080-UTILITIES-RENT-EXPENSE', name: 'Office Utilities, Electricity & Facility Rent Expense', accountType: AccountType.EXPENSE, isRestricted: false },
];

export class GeneralLedgerService {
  /**
   * Initializes / seeds the standard Chart of Accounts
   */
  public static async ensureChartOfAccounts(): Promise<void> {
    for (const acc of DEFAULT_CHART_OF_ACCOUNTS) {
      await prisma.accountHead.upsert({
        where: { accountCode: acc.accountCode },
        update: {
          name: acc.name,
          accountType: acc.accountType,
          isRestricted: acc.isRestricted,
        },
        create: {
          accountCode: acc.accountCode,
          name: acc.name,
          accountType: acc.accountType,
          isRestricted: acc.isRestricted,
          currentBalance: new Prisma.Decimal(0.0),
        },
      });
    }
  }

  /**
   * Resolves the target Asset Account Code based on the Payment Provider
   */
  public static resolveAssetAccountCode(provider: PaymentProviderType): string {
    switch (provider) {
      case PaymentProviderType.RAZORPAY:
        return '1020-RAZORPAY-CLEARING';
      case PaymentProviderType.STRIPE:
        return '1030-STRIPE-USD-CLEARING';
      case PaymentProviderType.BANK_TRANSFER:
      case PaymentProviderType.UPI_MANUAL:
        return '1010-HDFC-BANK-MAIN';
      case PaymentProviderType.MOCK:
      default:
        return '1020-RAZORPAY-CLEARING';
    }
  }

  /**
   * Resolves the target Reserve / Fund Account Code based on the Fund Type
   */
  public static resolveFundAccountCode(fundType: FundType): string {
    switch (fundType) {
      case FundType.ZAKAT_MAL:
        return '2010-ZAKAT-MAL-RESERVE';
      case FundType.ZAKAT_FITRAH:
        return '2011-ZAKAT-FITRAH-RESERVE';
      case FundType.KHUMS_SEHAM_E_IMAM:
        return '2020-KHUMS-SEHAM-IMAM';
      case FundType.KHUMS_SEHAM_E_SADAT:
        return '2021-KHUMS-SEHAM-SADAT';
      case FundType.ORPHAN_AID:
      case FundType.EDUCATION_GRANT:
        return '3020-ORPHAN-EDUCATION';
      case FundType.MEDICAL_AID:
        return '3030-MEDICAL-RELIEF';
      case FundType.WATER_INFRASTRUCTURE:
        return '3040-WATER-INFRASTRUCTURE';
      case FundType.GENERAL_SADAQAH:
      case FundType.EMERGENCY_DISASTER_RELIEF:
      default:
        return '3010-GENERAL-SADAQAH';
    }
  }

  /**
   * Resolves target Expense Account Code based on Expense Category
   */
  public static resolveExpenseAccountCode(category: ExpenseCategory): string {
    switch (category) {
      case ExpenseCategory.PROJECT_EXECUTION:
      case ExpenseCategory.RELIEF_AID_DIRECT:
        return '5030-PROJECT-DIRECT-AID-EXPENSE';
      case ExpenseCategory.FIELD_LOGISTICS:
        return '5070-FIELD-LOGISTICS-EXPENSE';
      case ExpenseCategory.UTILITIES_RENT:
        return '5080-UTILITIES-RENT-EXPENSE';
      case ExpenseCategory.LEGAL_AND_AUDIT:
        return '5060-LEGAL-AUDIT-EXPENSE';
      case ExpenseCategory.ADMINISTRATIVE_OVERHEAD:
      case ExpenseCategory.MARKETING_COMMUNICATION:
      case ExpenseCategory.CAPITAL_EXPENDITURE:
      default:
        return '5040-OFFICE-ADMIN-EXPENSE';
    }
  }

  /**
   * Records a balanced double-entry General Ledger Receipt Voucher for a successful donation
   */
  public static async recordDonationJournalEntry(
    donation: Donation,
    tx?: Prisma.TransactionClient
  ): Promise<string> {
    const db = tx || prisma;
    await GeneralLedgerService.ensureChartOfAccounts();

    const assetCode = GeneralLedgerService.resolveAssetAccountCode(donation.paymentProvider);
    const fundCode = GeneralLedgerService.resolveFundAccountCode(donation.fundType);

    const assetHead = await db.accountHead.findUniqueOrThrow({ where: { accountCode: assetCode } });
    const fundHead = await db.accountHead.findUniqueOrThrow({ where: { accountCode: fundCode } });

    const voucherNumber = `VCH-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
    const amountInINR = donation.amountInINR;

    const narration = `Receipt of donation #${donation.receiptNumber} from ${donation.donorName} towards ${donation.fundType} via ${donation.paymentProvider} (${donation.currency} ${donation.amount.toString()})`;

    const voucher = await db.voucher.create({
      data: {
        voucherNumber,
        voucherType: VoucherType.RECEIPT,
        voucherDate: donation.completedAt || new Date(),
        narration,
        totalAmount: amountInINR,
        donationId: donation.id,
        isPosted: true,
        createdById: 'SYSTEM_GL_ENGINE',
        entries: {
          create: [
            {
              accountHeadId: assetHead.id,
              debitAmount: amountInINR,
              creditAmount: new Prisma.Decimal(0.0),
              particulars: `To Asset/Clearing: ${assetHead.name}`,
            },
            {
              accountHeadId: fundHead.id,
              debitAmount: new Prisma.Decimal(0.0),
              creditAmount: amountInINR,
              particulars: `By Fund/Reserve: ${fundHead.name}`,
            },
          ],
        },
      },
    });

    await db.accountHead.update({
      where: { id: assetHead.id },
      data: { currentBalance: { increment: amountInINR } },
    });

    await db.accountHead.update({
      where: { id: fundHead.id },
      data: { currentBalance: { increment: amountInINR } },
    });

    return voucher.voucherNumber;
  }

  /**
   * Records a balanced double-entry General Ledger Payment/Journal Voucher for Monthly Payroll Disbursement
   */
  public static async recordPayrollJournalEntry(
    payrollPeriod: PayrollPeriod,
    payslips: Payslip[],
    disbursedByUserId?: string,
    tx?: Prisma.TransactionClient
  ): Promise<string> {
    const db = tx || prisma;
    await GeneralLedgerService.ensureChartOfAccounts();

    const salaryExpenseHead = await db.accountHead.findUniqueOrThrow({ where: { accountCode: '5010-SALARY-WAGES-EXPENSE' } });
    const employerStatExpenseHead = await db.accountHead.findUniqueOrThrow({ where: { accountCode: '5020-EMPLOYER-STATUTORY-EXPENSE' } });
    const bankHead = await db.accountHead.findUniqueOrThrow({ where: { accountCode: '1010-HDFC-BANK-MAIN' } });
    const taxPayableHead = await db.accountHead.findUniqueOrThrow({ where: { accountCode: '2040-STATUTORY-TAX-PAYABLE' } });
    const pfPayableHead = await db.accountHead.findUniqueOrThrow({ where: { accountCode: '2041-STATUTORY-PROVIDENT-FUND-PAYABLE' } });
    const insurancePayableHead = await db.accountHead.findUniqueOrThrow({ where: { accountCode: '2042-STATUTORY-INSURANCE-PAYABLE' } });

    let totalGrossEarnings = new Prisma.Decimal(0);
    let totalTdsDeductions = new Prisma.Decimal(0);
    let totalEmployeePf = new Prisma.Decimal(0);
    let totalEmployerPf = new Prisma.Decimal(0);
    let totalEmployeeInsurance = new Prisma.Decimal(0);
    let totalEmployerInsurance = new Prisma.Decimal(0);
    let totalNetDisbursed = new Prisma.Decimal(0);

    for (const p of payslips) {
      totalGrossEarnings = totalGrossEarnings.plus(p.totalEarningsGross);
      totalTdsDeductions = totalTdsDeductions.plus(p.statutoryTaxTDS);
      totalEmployeePf = totalEmployeePf.plus(p.statutoryProvidentFund);
      totalEmployerPf = totalEmployerPf.plus(p.employerProvidentFund);
      totalEmployeeInsurance = totalEmployeeInsurance.plus(p.statutoryInsurance);
      totalEmployerInsurance = totalEmployerInsurance.plus(p.employerInsurance);
      totalNetDisbursed = totalNetDisbursed.plus(p.netPayableINR);
    }

    const totalEmployerStatutory = totalEmployerPf.plus(totalEmployerInsurance);
    const totalPfCombined = totalEmployeePf.plus(totalEmployerPf);
    const totalInsuranceCombined = totalEmployeeInsurance.plus(totalEmployerInsurance);
    const totalVoucherAmount = totalGrossEarnings.plus(totalEmployerStatutory);

    const voucherNumber = `VCH-PAY-${payrollPeriod.periodCode}-${Date.now().toString().slice(-4)}`;
    const narration = `Monthly Staff Payroll Disbursement for Period ${payrollPeriod.periodCode} (${payrollPeriod.totalEmployeesCount || payslips.length} employees). Gross: ₹${totalGrossEarnings.toFixed(2)}, Net Disbursed: ₹${totalNetDisbursed.toFixed(2)}.`;

    const entriesToCreate: Array<{
      accountHeadId: string;
      debitAmount: Prisma.Decimal;
      creditAmount: Prisma.Decimal;
      particulars: string;
    }> = [
      {
        accountHeadId: salaryExpenseHead.id,
        debitAmount: totalGrossEarnings,
        creditAmount: new Prisma.Decimal(0.0),
        particulars: `Staff Compensation & Earnings - Period ${payrollPeriod.periodCode}`,
      },
    ];

    if (totalEmployerStatutory.greaterThan(0)) {
      entriesToCreate.push({
        accountHeadId: employerStatExpenseHead.id,
        debitAmount: totalEmployerStatutory,
        creditAmount: new Prisma.Decimal(0.0),
        particulars: `Employer Statutory Match (PF + Insurance) - Period ${payrollPeriod.periodCode}`,
      });
    }

    entriesToCreate.push({
      accountHeadId: bankHead.id,
      debitAmount: new Prisma.Decimal(0.0),
      creditAmount: totalNetDisbursed,
      particulars: `Net Salaries Disbursed via Bank Direct - Period ${payrollPeriod.periodCode}`,
    });

    if (totalTdsDeductions.greaterThan(0)) {
      entriesToCreate.push({
        accountHeadId: taxPayableHead.id,
        debitAmount: new Prisma.Decimal(0.0),
        creditAmount: totalTdsDeductions,
        particulars: `TDS / Income Tax Withholdings Withheld for Remittance`,
      });
    }

    if (totalPfCombined.greaterThan(0)) {
      entriesToCreate.push({
        accountHeadId: pfPayableHead.id,
        debitAmount: new Prisma.Decimal(0.0),
        creditAmount: totalPfCombined,
        particulars: `Statutory PF & Social Security Contributions Payable`,
      });
    }

    if (totalInsuranceCombined.greaterThan(0)) {
      entriesToCreate.push({
        accountHeadId: insurancePayableHead.id,
        debitAmount: new Prisma.Decimal(0.0),
        creditAmount: totalInsuranceCombined,
        particulars: `Statutory Staff Healthcare & ESI Insurance Payable`,
      });
    }

    let totalDebits = new Prisma.Decimal(0);
    let totalCredits = new Prisma.Decimal(0);
    for (const e of entriesToCreate) {
      totalDebits = totalDebits.plus(e.debitAmount);
      totalCredits = totalCredits.plus(e.creditAmount);
    }

    if (!totalDebits.equals(totalCredits)) {
      throw new Error(
        `General Ledger Double-Entry Imbalance: Debits (₹${totalDebits.toFixed(2)}) do not match Credits (₹${totalCredits.toFixed(2)})`
      );
    }

    const voucher = await db.voucher.create({
      data: {
        voucherNumber,
        voucherType: VoucherType.PAYMENT,
        voucherDate: payrollPeriod.disbursedAt || new Date(),
        narration,
        totalAmount: totalVoucherAmount,
        isPosted: true,
        createdById: disbursedByUserId || 'SYSTEM_PAYROLL_ENGINE',
        entries: {
          create: entriesToCreate,
        },
      },
    });

    for (const e of entriesToCreate) {
      if (e.debitAmount.greaterThan(0)) {
        await db.accountHead.update({
          where: { id: e.accountHeadId },
          data: { currentBalance: { increment: e.debitAmount } },
        });
      } else if (e.creditAmount.greaterThan(0)) {
        await db.accountHead.update({
          where: { id: e.accountHeadId },
          data: { currentBalance: { increment: e.creditAmount } },
        });
      }
    }

    await db.payrollPeriod.update({
      where: { id: payrollPeriod.id },
      data: { voucherId: voucher.id },
    });

    return voucher.voucherNumber;
  }

  /**
   * Records a balanced double-entry General Ledger Payment Voucher for an Approved Expense
   */
  public static async recordExpenseJournalEntry(
    expense: ExpenseRecord,
    approvedByUserId?: string,
    tx?: Prisma.TransactionClient
  ): Promise<string> {
    const db = tx || prisma;
    await GeneralLedgerService.ensureChartOfAccounts();

    const expenseCode = GeneralLedgerService.resolveExpenseAccountCode(expense.category);
    const expenseHead = await db.accountHead.findUniqueOrThrow({ where: { accountCode: expenseCode } });

    // Determine credit account based on payment method
    const isCash = expense.paymentMethod === PaymentMethod.CASH;
    const creditCode = isCash ? '1040-PETTY-CASH-IMPREST' : '1010-HDFC-BANK-MAIN';
    const creditHead = await db.accountHead.findUniqueOrThrow({ where: { accountCode: creditCode } });

    const voucherNumber = `VCH-EXP-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
    const narration = `Payment for Expense #${expense.expenseNumber}: ${expense.title} (${expense.category}) via ${expense.paymentMethod} (Ref: ${expense.paymentReference || 'N/A'})`;

    const voucher = await db.voucher.create({
      data: {
        voucherNumber,
        voucherType: VoucherType.PAYMENT,
        voucherDate: expense.paymentDate || new Date(),
        narration,
        totalAmount: expense.amount,
        isPosted: true,
        createdById: approvedByUserId || 'SYSTEM_FINANCE_ENGINE',
        entries: {
          create: [
            {
              accountHeadId: expenseHead.id,
              debitAmount: expense.amount,
              creditAmount: new Prisma.Decimal(0.0),
              particulars: `Debit Expense: ${expenseHead.name}`,
            },
            {
              accountHeadId: creditHead.id,
              debitAmount: new Prisma.Decimal(0.0),
              creditAmount: expense.amount,
              particulars: `Credit Asset/Payment: ${creditHead.name}`,
            },
          ],
        },
      },
    });

    // Update account balances
    await db.accountHead.update({
      where: { id: expenseHead.id },
      data: { currentBalance: { increment: expense.amount } },
    });

    await db.accountHead.update({
      where: { id: creditHead.id },
      data: { currentBalance: { decrement: expense.amount } },
    });

    // Link voucher to expense record
    await db.expenseRecord.update({
      where: { id: expense.id },
      data: { voucherId: voucher.id },
    });

    return voucher.voucherNumber;
  }

  /**
   * Records a balanced double-entry General Ledger Receipt Voucher for an Institutional / CSR Grant
   */
  public static async recordGrantReceiptJournalEntry(
    grant: GrantAndCsrFunding,
    disbursedAmount: Prisma.Decimal,
    createdById?: string,
    tx?: Prisma.TransactionClient
  ): Promise<string> {
    const db = tx || prisma;
    await GeneralLedgerService.ensureChartOfAccounts();

    const bankHead = await db.accountHead.findUniqueOrThrow({ where: { accountCode: '1010-HDFC-BANK-MAIN' } });
    const grantReserveHead = await db.accountHead.findUniqueOrThrow({ where: { accountCode: '2060-RESTRICTED-GRANTS-CSR' } });

    const voucherNumber = `VCH-GRNT-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
    const narration = `Receipt of Grant/CSR Tranche #${grant.grantNumber} from ${grant.fundingAgencyName} (${grant.grantType}). Purpose: ${grant.purpose}`;

    const voucher = await db.voucher.create({
      data: {
        voucherNumber,
        voucherType: VoucherType.RECEIPT,
        voucherDate: new Date(),
        narration,
        totalAmount: disbursedAmount,
        isPosted: true,
        createdById: createdById || 'SYSTEM_FINANCE_ENGINE',
        entries: {
          create: [
            {
              accountHeadId: bankHead.id,
              debitAmount: disbursedAmount,
              creditAmount: new Prisma.Decimal(0.0),
              particulars: `Debit Bank Asset: ${bankHead.name}`,
            },
            {
              accountHeadId: grantReserveHead.id,
              debitAmount: new Prisma.Decimal(0.0),
              creditAmount: disbursedAmount,
              particulars: `Credit Restricted Grant Reserve: ${grantReserveHead.name}`,
            },
          ],
        },
      },
    });

    await db.accountHead.update({
      where: { id: bankHead.id },
      data: { currentBalance: { increment: disbursedAmount } },
    });

    await db.accountHead.update({
      where: { id: grantReserveHead.id },
      data: { currentBalance: { increment: disbursedAmount } },
    });

    await db.grantAndCsrFunding.update({
      where: { id: grant.id },
      data: { voucherId: voucher.id },
    });

    return voucher.voucherNumber;
  }

  /**
   * Records a balanced Bank Reconciliation Adjustment Journal Voucher
   */
  public static async recordBankAdjustmentJournalEntry(
    statement: BankReconciliationStatement,
    item: ReconciliationItem,
    createdById?: string,
    tx?: Prisma.TransactionClient
  ): Promise<string> {
    const db = tx || prisma;
    await GeneralLedgerService.ensureChartOfAccounts();

    const bankHead = await db.accountHead.findUniqueOrThrow({ where: { id: statement.bankAccountHeadId } });
    const voucherNumber = `VCH-ADJ-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;

    let debitHeadId = bankHead.id;
    let creditHeadId = bankHead.id;
    let narration = `Bank Reconciliation Adjustment for ${item.description} (Ref: ${item.referenceNumber || 'N/A'})`;

    if (item.itemType === ReconciliationItemType.INTEREST_CREDIT) {
      const interestIncomeHead = await db.accountHead.findUniqueOrThrow({ where: { accountCode: '4030-BANK-INTEREST-INCOME' } });
      debitHeadId = bankHead.id;
      creditHeadId = interestIncomeHead.id;
      narration = `Bank Interest Credit earned on account #${bankHead.accountCode}`;
    } else if (item.itemType === ReconciliationItemType.BANK_CHARGE_UNRECORDED) {
      const feesExpenseHead = await db.accountHead.findUniqueOrThrow({ where: { accountCode: '5050-GATEWAY-FEES' } });
      debitHeadId = feesExpenseHead.id;
      creditHeadId = bankHead.id;
      narration = `Bank Service & Transaction Charges debited on account #${bankHead.accountCode}`;
    }

    const voucher = await db.voucher.create({
      data: {
        voucherNumber,
        voucherType: VoucherType.JOURNAL,
        voucherDate: item.transactionDate || new Date(),
        narration,
        totalAmount: item.amount,
        isPosted: true,
        createdById: createdById || 'SYSTEM_AUDIT_ENGINE',
        entries: {
          create: [
            {
              accountHeadId: debitHeadId,
              debitAmount: item.amount,
              creditAmount: new Prisma.Decimal(0.0),
              particulars: `Debit: Adjustment Entry`,
            },
            {
              accountHeadId: creditHeadId,
              debitAmount: new Prisma.Decimal(0.0),
              creditAmount: item.amount,
              particulars: `Credit: Adjustment Entry`,
            },
          ],
        },
      },
    });

    await db.accountHead.update({
      where: { id: debitHeadId },
      data: { currentBalance: { increment: item.amount } },
    });

    await db.accountHead.update({
      where: { id: creditHeadId },
      data: { currentBalance: { increment: item.amount } },
    });

    await db.reconciliationItem.update({
      where: { id: item.id },
      data: { voucherId: voucher.id, isCleared: true, clearedAt: new Date() },
    });

    return voucher.voucherNumber;
  }

  /**
   * Retrieves summary of Chart of Accounts balances and Trial Balance verification
   */
  public static async getLedgerSummary() {
    await GeneralLedgerService.ensureChartOfAccounts();

    const accounts = await prisma.accountHead.findMany({
      orderBy: { accountCode: 'asc' },
    });

    let totalDebits = new Prisma.Decimal(0.0);
    let totalCredits = new Prisma.Decimal(0.0);
    let totalRestrictedReserves = new Prisma.Decimal(0.0);
    let totalGeneralFunds = new Prisma.Decimal(0.0);

    for (const acc of accounts) {
      if (acc.accountType === AccountType.ASSET || acc.accountType === AccountType.EXPENSE) {
        totalDebits = totalDebits.plus(acc.currentBalance);
      } else {
        totalCredits = totalCredits.plus(acc.currentBalance);
      }

      if (acc.isRestricted) {
        totalRestrictedReserves = totalRestrictedReserves.plus(acc.currentBalance);
      } else if (acc.accountType === AccountType.EQUITY_RESERVE) {
        totalGeneralFunds = totalGeneralFunds.plus(acc.currentBalance);
      }
    }

    const isTrialBalanceMatched = totalDebits.equals(totalCredits);

    return {
      accounts,
      totalDebits: Number(totalDebits),
      totalCredits: Number(totalCredits),
      totalRestrictedReserves: Number(totalRestrictedReserves),
      totalGeneralFunds: Number(totalGeneralFunds),
      isTrialBalanceMatched,
      verifiedAt: new Date(),
    };
  }
}
