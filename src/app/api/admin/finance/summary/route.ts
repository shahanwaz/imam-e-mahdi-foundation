import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { apiSuccess, apiError } from '@/lib/response';
import { requirePermission } from '@/lib/auth/rbac';
import { GeneralLedgerService } from '@/lib/finance/general-ledger-service';
import { DonationStatus, ExpenseStatus } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    await requirePermission(req, 'finance:view_ledger');

    const year = new Date().getFullYear();
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);

    const [
      donationAgg,
      grantAgg,
      expenseAgg,
      payrollAgg,
      activeGrantsCount,
      totalVendorsCount,
      ledgerSummary,
      pendingExpensesCount,
      unreconciledBrsCount,
    ] = await Promise.all([
      prisma.donation.aggregate({
        where: {
          paymentStatus: DonationStatus.SUCCESS,
          createdAt: { gte: startOfYear, lte: endOfYear },
        },
        _sum: { amountInINR: true },
        _count: { id: true },
      }),
      prisma.grantAndCsrFunding.aggregate({
        where: {
          createdAt: { gte: startOfYear, lte: endOfYear },
        },
        _sum: { disbursedAmountINR: true, sanctionedAmountINR: true },
        _count: { id: true },
      }),
      prisma.expenseRecord.aggregate({
        where: {
          status: ExpenseStatus.PAID,
          paymentDate: { gte: startOfYear, lte: endOfYear },
        },
        _sum: { amount: true },
        _count: { id: true },
      }),
      prisma.payrollPeriod.aggregate({
        where: {
          year,
          status: 'DISBURSED',
        },
        _sum: { totalGrossAmountINR: true },
        _count: { id: true },
      }),
      prisma.grantAndCsrFunding.count({ where: { status: 'ACTIVE' } }),
      prisma.vendor.count({ where: { isBlacklisted: false } }),
      GeneralLedgerService.getLedgerSummary(),
      prisma.expenseRecord.count({ where: { status: 'SUBMITTED' } }),
      prisma.bankReconciliationStatement.count({ where: { status: 'PENDING' } }),
    ]);

    const totalDonationIncome = Number(donationAgg._sum.amountInINR || 0);
    const totalGrantDisbursed = Number(grantAgg._sum.disbursedAmountINR || 0);
    const totalIncomeYTD = totalDonationIncome + totalGrantDisbursed;

    const totalDirectExpenses = Number(expenseAgg._sum.amount || 0);
    const totalPayrollExpenses = Number(payrollAgg._sum.totalGrossAmountINR || 0);
    const totalExpensesYTD = totalDirectExpenses + totalPayrollExpenses;

    const netSurplusYTD = totalIncomeYTD - totalExpensesYTD;

    return apiSuccess(
      {
        fiscalYear: year,
        totalIncomeYTD,
        totalDonationIncome,
        totalGrantDisbursed,
        totalExpensesYTD,
        totalDirectExpenses,
        totalPayrollExpenses,
        netSurplusYTD,
        surplusStatus: netSurplusYTD >= 0 ? 'SURPLUS' : 'DEFICIT',
        activeGrantsCount,
        totalVendorsCount,
        pendingExpensesCount,
        unreconciledBrsCount,
        trialBalanceStatus: {
          isMatched: ledgerSummary.isTrialBalanceMatched,
          totalDebits: ledgerSummary.totalDebits,
          totalCredits: ledgerSummary.totalCredits,
          restrictedReserves: ledgerSummary.totalRestrictedReserves,
          generalFunds: ledgerSummary.totalGeneralFunds,
        },
        auditNotice: 'REQUIRES_PROFESSIONAL_VERIFICATION',
      },
      'Financial Summary & Executive KPIs retrieved successfully'
    );
  } catch (error) {
    return apiError(error);
  }
}
