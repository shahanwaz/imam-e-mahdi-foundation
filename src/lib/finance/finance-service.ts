import { prisma } from '@/lib/db';
import {
  GrantType,
  GrantStatus,
  VendorCategory,
  ExpenseCategory,
  ExpenseStatus,
  BudgetStatus,
  ReconciliationStatus,
  ReconciliationItemType,
  PaymentMethod,
  Prisma,
} from '@prisma/client';
import { GeneralLedgerService } from './general-ledger-service';
import { createAuditLog } from '@/lib/audit';
import { encryptPII, maskSensitiveId } from '@/lib/crypto';
import { ValidationError } from '@/lib/errors';

export class FinanceService {
  // ==========================================================================
  // 1. INSTITUTIONAL GRANTS & CSR FUNDING
  // ==========================================================================

  public static async createGrant(
    data: {
      fundingAgencyName: string;
      agencyContactPerson?: string;
      agencyEmail?: string;
      agencyPhone?: string;
      grantType: GrantType;
      sanctionedAmountINR: number;
      disbursedAmountINR?: number;
      purpose: string;
      grantStartDate: Date;
      grantEndDate: Date;
      complianceTerms?: string;
      projectId?: string;
    },
    userId: string = 'FINANCE_OFFICER'
  ) {
    if (data.sanctionedAmountINR <= 0) {
      throw new ValidationError('Sanctioned grant amount must be greater than zero');
    }

    const year = new Date().getFullYear();
    const count = await prisma.grantAndCsrFunding.count();
    const grantNumber = `IMF-GRNT-${year}-${(count + 1).toString().padStart(5, '0')}`;

    const disbursed = data.disbursedAmountINR || 0;
    const balance = data.sanctionedAmountINR - disbursed;

    const grant = await prisma.grantAndCsrFunding.create({
      data: {
        grantNumber,
        fundingAgencyName: data.fundingAgencyName,
        agencyContactPerson: data.agencyContactPerson,
        agencyEmail: data.agencyEmail,
        agencyPhone: data.agencyPhone,
        grantType: data.grantType,
        status: GrantStatus.ACTIVE,
        sanctionedAmountINR: new Prisma.Decimal(data.sanctionedAmountINR),
        disbursedAmountINR: new Prisma.Decimal(disbursed),
        utilizedAmountINR: new Prisma.Decimal(0.0),
        balanceAmountINR: new Prisma.Decimal(balance),
        purpose: data.purpose,
        grantStartDate: data.grantStartDate,
        grantEndDate: data.grantEndDate,
        complianceTerms: data.complianceTerms,
        projectId: data.projectId,
        createdById: userId,
      },
    });

    // If initial disbursement is received, generate balanced GL receipt voucher
    if (disbursed > 0) {
      await GeneralLedgerService.recordGrantReceiptJournalEntry(
        grant,
        new Prisma.Decimal(disbursed),
        userId
      );
    }

    await createAuditLog({
      action: 'FINANCE_GRANT_CREATED',
      entity: 'GrantAndCsrFunding',
      entityId: grant.id,
      userId,
      newData: { grantNumber, agency: data.fundingAgencyName, amount: data.sanctionedAmountINR },
    });

    return grant;
  }

  public static async disburseGrantTranche(
    grantId: string,
    amount: number,
    userId: string = 'FINANCE_OFFICER'
  ) {
    if (amount <= 0) throw new ValidationError('Disbursement amount must be positive');

    const grant = await prisma.grantAndCsrFunding.findUniqueOrThrow({
      where: { id: grantId },
    });

    const newDisbursed = Number(grant.disbursedAmountINR) + amount;
    const newBalance = Number(grant.sanctionedAmountINR) - newDisbursed;

    const updatedGrant = await prisma.grantAndCsrFunding.update({
      where: { id: grantId },
      data: {
        disbursedAmountINR: new Prisma.Decimal(newDisbursed),
        balanceAmountINR: new Prisma.Decimal(Math.max(0, newBalance)),
        status: newDisbursed >= Number(grant.sanctionedAmountINR) ? GrantStatus.ACTIVE : grant.status,
      },
    });

    const voucherNumber = await GeneralLedgerService.recordGrantReceiptJournalEntry(
      updatedGrant,
      new Prisma.Decimal(amount),
      userId
    );

    await createAuditLog({
      action: 'FINANCE_GRANT_TRANCHE_DISBURSED',
      entity: 'GrantAndCsrFunding',
      entityId: grant.id,
      userId,
      newData: { grantNumber: grant.grantNumber, amount, voucherNumber },
    });

    return { grant: updatedGrant, voucherNumber };
  }

  public static async listGrants(params: { grantType?: GrantType; status?: GrantStatus; search?: string } = {}) {
    return prisma.grantAndCsrFunding.findMany({
      where: {
        ...(params.grantType ? { grantType: params.grantType } : {}),
        ...(params.status ? { status: params.status } : {}),
        ...(params.search
          ? {
              OR: [
                { grantNumber: { contains: params.search, mode: 'insensitive' } },
                { fundingAgencyName: { contains: params.search, mode: 'insensitive' } },
                { purpose: { contains: params.search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: {
        project: { select: { projectNumber: true, title: true } },
        voucher: { select: { voucherNumber: true, voucherDate: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ==========================================================================
  // 2. VENDORS & PROCUREMENT
  // ==========================================================================

  public static async createVendor(
    data: {
      legalName: string;
      tradeName?: string;
      category: VendorCategory;
      contactPerson: string;
      email: string;
      phone: string;
      address?: string;
      city?: string;
      state?: string;
      pinCode?: string;
      panTaxId?: string;
      gstNumber?: string;
      bankName?: string;
      bankAccountNumber?: string;
      bankIfscCode?: string;
    },
    userId: string = 'FINANCE_OFFICER'
  ) {
    const count = await prisma.vendor.count();
    const vendorCode = `VND-${(count + 1).toString().padStart(5, '0')}`;

    let encryptedBankAccount: string | undefined = undefined;
    let maskedBankAccount: string | undefined = undefined;

    if (data.bankAccountNumber) {
      encryptedBankAccount = encryptPII(data.bankAccountNumber);
      maskedBankAccount = maskSensitiveId(data.bankAccountNumber);
    }

    const vendor = await prisma.vendor.create({
      data: {
        vendorCode,
        legalName: data.legalName,
        tradeName: data.tradeName,
        category: data.category,
        contactPerson: data.contactPerson,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        pinCode: data.pinCode,
        panTaxId: data.panTaxId?.toUpperCase(),
        gstNumber: data.gstNumber?.toUpperCase(),
        bankName: data.bankName,
        bankAccountNumber: maskedBankAccount,
        bankIfscCode: data.bankIfscCode?.toUpperCase(),
        encryptedBankAccount,
      },
    });

    await createAuditLog({
      action: 'FINANCE_VENDOR_CREATED',
      entity: 'Vendor',
      entityId: vendor.id,
      userId,
      newData: { vendorCode, legalName: data.legalName, category: data.category },
    });

    return vendor;
  }

  public static async verifyVendor(vendorId: string, userId: string) {
    const vendor = await prisma.vendor.update({
      where: { id: vendorId },
      data: {
        verifiedByUserId: userId,
        verifiedAt: new Date(),
      },
    });

    await createAuditLog({
      action: 'FINANCE_VENDOR_VERIFIED',
      entity: 'Vendor',
      entityId: vendorId,
      userId,
      newData: { vendorCode: vendor.vendorCode, verifiedBy: userId },
    });

    return vendor;
  }

  public static async listVendors(params: { category?: VendorCategory; search?: string } = {}) {
    return prisma.vendor.findMany({
      where: {
        ...(params.category ? { category: params.category } : {}),
        ...(params.search
          ? {
              OR: [
                { vendorCode: { contains: params.search, mode: 'insensitive' } },
                { legalName: { contains: params.search, mode: 'insensitive' } },
                { contactPerson: { contains: params.search, mode: 'insensitive' } },
                { email: { contains: params.search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: {
        _count: { select: { expenses: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ==========================================================================
  // 3. EXPENSES & PROJECT EXPENDITURE
  // ==========================================================================

  public static async createExpense(
    data: {
      title: string;
      category: ExpenseCategory;
      amount: number;
      paymentDate?: Date;
      paymentMethod?: PaymentMethod;
      paymentReference?: string;
      vendorId?: string;
      projectId?: string;
      budgetLineId?: string;
      invoiceUrl?: string;
      remarks?: string;
    },
    userId: string = 'FINANCE_OFFICER'
  ) {
    if (data.amount <= 0) throw new ValidationError('Expense amount must be positive');

    const yearMonth = new Date().toISOString().slice(0, 7).replace('-', '');
    const count = await prisma.expenseRecord.count();
    const expenseNumber = `EXP-${yearMonth}-${(count + 1).toString().padStart(5, '0')}`;

    const expense = await prisma.expenseRecord.create({
      data: {
        expenseNumber,
        title: data.title,
        category: data.category,
        amount: new Prisma.Decimal(data.amount),
        paymentDate: data.paymentDate || new Date(),
        paymentMethod: data.paymentMethod || PaymentMethod.BANK_TRANSFER_NEFT,
        paymentReference: data.paymentReference,
        vendorId: data.vendorId,
        projectId: data.projectId,
        budgetLineId: data.budgetLineId,
        invoiceUrl: data.invoiceUrl,
        remarks: data.remarks,
        status: ExpenseStatus.DRAFT,
        createdById: userId,
      },
    });

    await createAuditLog({
      action: 'FINANCE_EXPENSE_RECORDED',
      entity: 'ExpenseRecord',
      entityId: expense.id,
      userId,
      newData: { expenseNumber, amount: data.amount, category: data.category },
    });

    return expense;
  }

  public static async approveExpense(expenseId: string, userId: string) {
    const expense = await prisma.expenseRecord.update({
      where: { id: expenseId },
      data: {
        status: ExpenseStatus.APPROVED,
        approvedByUserId: userId,
        approvedAt: new Date(),
      },
    });

    await createAuditLog({
      action: 'FINANCE_EXPENSE_APPROVED',
      entity: 'ExpenseRecord',
      entityId: expenseId,
      userId,
      newData: { expenseNumber: expense.expenseNumber, approvedBy: userId },
    });

    return expense;
  }

  public static async payExpense(
    expenseId: string,
    paymentReference: string,
    userId: string = 'FINANCE_OFFICER'
  ) {
    const expense = await prisma.expenseRecord.findUniqueOrThrow({
      where: { id: expenseId },
      include: { budgetLine: true, project: true },
    });

    if (expense.status === ExpenseStatus.PAID) {
      throw new ValidationError('Expense has already been paid');
    }

    // 1. Post to General Ledger as a Balanced Payment Voucher
    const voucherNumber = await GeneralLedgerService.recordExpenseJournalEntry(
      expense,
      userId
    );

    // 2. Mark expense as PAID
    const updatedExpense = await prisma.expenseRecord.update({
      where: { id: expenseId },
      data: {
        status: ExpenseStatus.PAID,
        paymentReference,
        paymentDate: new Date(),
      },
    });

    // 3. Update Budget Line if attached
    if (expense.budgetLineId) {
      await prisma.budgetLine.update({
        where: { id: expense.budgetLineId },
        data: {
          spentAmountINR: { increment: expense.amount },
        },
      });
    }

    // 4. Update Project Disbursed Amount if attached
    if (expense.projectId) {
      await prisma.project.update({
        where: { id: expense.projectId },
        data: {
          disbursedAmountINR: { increment: expense.amount },
        },
      });
    }

    await createAuditLog({
      action: 'FINANCE_EXPENSE_PAID',
      entity: 'ExpenseRecord',
      entityId: expenseId,
      userId,
      newData: { expenseNumber: expense.expenseNumber, amount: Number(expense.amount), voucherNumber },
    });

    return { expense: updatedExpense, voucherNumber };
  }

  public static async listExpenses(params: {
    category?: ExpenseCategory;
    status?: ExpenseStatus;
    projectId?: string;
    vendorId?: string;
    search?: string;
  } = {}) {
    return prisma.expenseRecord.findMany({
      where: {
        ...(params.category ? { category: params.category } : {}),
        ...(params.status ? { status: params.status } : {}),
        ...(params.projectId ? { projectId: params.projectId } : {}),
        ...(params.vendorId ? { vendorId: params.vendorId } : {}),
        ...(params.search
          ? {
              OR: [
                { expenseNumber: { contains: params.search, mode: 'insensitive' } },
                { title: { contains: params.search, mode: 'insensitive' } },
                { paymentReference: { contains: params.search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: {
        vendor: { select: { vendorCode: true, legalName: true } },
        project: { select: { projectNumber: true, title: true } },
        budgetLine: { select: { lineCode: true, title: true } },
        voucher: { select: { voucherNumber: true, voucherDate: true } },
      },
      orderBy: { paymentDate: 'desc' },
    });
  }

  // ==========================================================================
  // 4. BUDGETS & BUDGET ALLOCATIONS
  // ==========================================================================

  public static async createBudget(
    data: {
      fiscalYear: number;
      title: string;
      notes?: string;
      lines: Array<{
        lineCode: string;
        category: ExpenseCategory;
        title: string;
        allocatedAmountINR: number;
        projectId?: string;
        accountHeadId?: string;
        notes?: string;
      }>;
    },
    userId: string = 'FINANCE_OFFICER'
  ) {
    const budgetCode = `BDG-${data.fiscalYear}-FY`;
    const totalAllocated = data.lines.reduce((sum, l) => sum + l.allocatedAmountINR, 0);

    const budget = await prisma.annualBudget.create({
      data: {
        budgetCode,
        fiscalYear: data.fiscalYear,
        title: data.title,
        totalAllocatedINR: new Prisma.Decimal(totalAllocated),
        totalSpentINR: new Prisma.Decimal(0.0),
        status: BudgetStatus.ACTIVE,
        notes: data.notes,
        lines: {
          create: data.lines.map((l) => ({
            lineCode: l.lineCode,
            category: l.category,
            title: l.title,
            allocatedAmountINR: new Prisma.Decimal(l.allocatedAmountINR),
            spentAmountINR: new Prisma.Decimal(0.0),
            projectId: l.projectId,
            accountHeadId: l.accountHeadId,
            notes: l.notes,
          })),
        },
      },
      include: { lines: true },
    });

    await createAuditLog({
      action: 'FINANCE_BUDGET_CREATED',
      entity: 'AnnualBudget',
      entityId: budget.id,
      userId,
      newData: { budgetCode, fiscalYear: data.fiscalYear, totalAllocated },
    });

    return budget;
  }

  public static async listBudgets(fiscalYear?: number) {
    return prisma.annualBudget.findMany({
      where: {
        ...(fiscalYear ? { fiscalYear } : {}),
      },
      include: {
        lines: {
          include: {
            project: { select: { projectNumber: true, title: true } },
            accountHead: { select: { accountCode: true, name: true } },
          },
        },
      },
      orderBy: { fiscalYear: 'desc' },
    });
  }

  // ==========================================================================
  // 5. BANK RECONCILIATION STATEMENTS (BRS)
  // ==========================================================================

  public static async createReconciliationStatement(
    data: {
      bankAccountHeadId: string;
      statementDate: Date;
      statementClosingBalance: number;
      bookClosingBalance: number;
      uncreditedDeposits?: number;
      unpresentedCheques?: number;
      items?: Array<{
        transactionDate: Date;
        referenceNumber?: string;
        description: string;
        amount: number;
        itemType: ReconciliationItemType;
      }>;
    },
    userId: string = 'AUDITOR'
  ) {
    const ym = data.statementDate.toISOString().slice(0, 7).replace('-', '');
    const count = await prisma.bankReconciliationStatement.count();
    const reconCode = `BRS-${ym}-${(count + 1).toString().padStart(4, '0')}`;

    const uncredited = data.uncreditedDeposits || 0;
    const unpresented = data.unpresentedCheques || 0;
    const netAdj = uncredited - unpresented;
    const reconciledBal = data.bookClosingBalance + uncredited - unpresented;
    const discrepancy = Math.abs(reconciledBal - data.statementClosingBalance);

    const statement = await prisma.bankReconciliationStatement.create({
      data: {
        reconCode,
        bankAccountHeadId: data.bankAccountHeadId,
        statementDate: data.statementDate,
        statementClosingBalance: new Prisma.Decimal(data.statementClosingBalance),
        bookClosingBalance: new Prisma.Decimal(data.bookClosingBalance),
        uncreditedDeposits: new Prisma.Decimal(uncredited),
        unpresentedCheques: new Prisma.Decimal(unpresented),
        netAdjustments: new Prisma.Decimal(netAdj),
        reconciledBalance: new Prisma.Decimal(reconciledBal),
        discrepancyAmount: new Prisma.Decimal(discrepancy),
        status: discrepancy === 0 ? ReconciliationStatus.RECONCILED : ReconciliationStatus.DISCREPANCY_FLAGGED,
        items: data.items
          ? {
              create: data.items.map((it) => ({
                transactionDate: it.transactionDate,
                referenceNumber: it.referenceNumber,
                description: it.description,
                amount: new Prisma.Decimal(it.amount),
                itemType: it.itemType,
              })),
            }
          : undefined,
      },
      include: { items: true, accountHead: true },
    });

    await createAuditLog({
      action: 'FINANCE_BRS_CREATED',
      entity: 'BankReconciliationStatement',
      entityId: statement.id,
      userId,
      newData: { reconCode, discrepancy, isReconciled: discrepancy === 0 },
    });

    return statement;
  }

  public static async signOffReconciliation(
    statementId: string,
    signOffNotes: string,
    userId: string = 'STATUTORY_AUDITOR'
  ) {
    const statement = await prisma.bankReconciliationStatement.update({
      where: { id: statementId },
      data: {
        status: ReconciliationStatus.RECONCILED,
        verifiedByAuditorUserId: userId,
        auditorSignOffNotes: signOffNotes,
        verifiedAt: new Date(),
      },
    });

    await createAuditLog({
      action: 'FINANCE_BRS_SIGNED_OFF',
      entity: 'BankReconciliationStatement',
      entityId: statementId,
      userId,
      newData: { reconCode: statement.reconCode, auditor: userId },
    });

    return statement;
  }

  public static async listReconciliations(bankAccountId?: string) {
    return prisma.bankReconciliationStatement.findMany({
      where: {
        ...(bankAccountId ? { bankAccountHeadId: bankAccountId } : {}),
      },
      include: {
        accountHead: { select: { accountCode: true, name: true } },
        items: true,
      },
      orderBy: { statementDate: 'desc' },
    });
  }

  // ==========================================================================
  // 6. STATUTORY ACCOUNTING CONFIGURATIONS
  // ==========================================================================

  public static async getStatutoryConfigs() {
    return prisma.accountingStatutoryConfig.findMany({
      orderBy: { configKey: 'asc' },
    });
  }

  public static async upsertStatutoryConfig(
    data: {
      configKey: string;
      configCategory: string;
      ruleName: string;
      ruleParamsJson: any;
      notes?: string;
    },
    userId: string = 'AUDITOR'
  ) {
    const config = await prisma.accountingStatutoryConfig.upsert({
      where: { configKey: data.configKey },
      update: {
        configCategory: data.configCategory,
        ruleName: data.ruleName,
        ruleParamsJson: data.ruleParamsJson,
        notes: data.notes,
        lastVerifiedAt: new Date(),
      },
      create: {
        configKey: data.configKey,
        configCategory: data.configCategory,
        ruleName: data.ruleName,
        ruleParamsJson: data.ruleParamsJson,
        disclaimerTag: 'REQUIRES_PROFESSIONAL_VERIFICATION',
        notes: data.notes,
      },
    });

    await createAuditLog({
      action: 'FINANCE_STATUTORY_RULE_CONFIGURED',
      entity: 'AccountingStatutoryConfig',
      entityId: config.id,
      userId,
      newData: { configKey: data.configKey, ruleName: data.ruleName },
    });

    return config;
  }
}
