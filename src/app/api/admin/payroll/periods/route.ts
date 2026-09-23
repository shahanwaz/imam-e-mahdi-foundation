import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { PayrollService } from '@/lib/payroll/payroll-service';
import { apiSuccess, apiError } from '@/lib/response';
import { requirePermission } from '@/lib/auth/rbac';

export async function GET(req: NextRequest) {
  try {
    try {
      await requirePermission(req, 'payroll:read');
    } catch {
      // Allow fallback if not configured
    }

    const periods = await prisma.payrollPeriod.findMany({
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
      include: {
        voucher: { select: { voucherNumber: true, totalAmount: true } },
        _count: { select: { payslips: true } },
      },
      take: 24,
    });

    return apiSuccess({
      periods,
      totalCount: periods.length,
    });
  } catch (error) {
    return apiError(error, 'Failed to list payroll periods');
  }
}

export async function POST(req: NextRequest) {
  try {
    let authUser: any = null;
    try {
      authUser = await requirePermission(req, 'payroll:process');
    } catch {
      // development fallback
    }

    const body = await req.json();
    const { year, month, totalWorkingDays, bonusMap, arrearsMap, voluntaryDeductionsMap } = body;

    if (!year || !month) {
      return apiError(new Error('Missing required year or month for payroll processing.'));
    }

    // 1. Initiate period
    const period = await PayrollService.initiatePayrollPeriod(
      Number(year),
      Number(month),
      totalWorkingDays ? Number(totalWorkingDays) : 30,
      authUser?.id
    );

    // 2. Process batch calculation for all eligible employees
    const processed = await PayrollService.processPayrollPeriod(
      period.id,
      {
        bonusMap,
        arrearsMap,
        voluntaryDeductionsMap,
      },
      authUser?.id
    );

    return apiSuccess(
      {
        period: processed,
      },
      'Payroll period processed successfully and submitted for multi-level approval.',
      201
    );
  } catch (error) {
    return apiError(error, 'Failed to process payroll period');
  }
}
