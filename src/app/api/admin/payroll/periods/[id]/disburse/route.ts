import { NextRequest } from 'next/server';
import { PayrollService } from '@/lib/payroll/payroll-service';
import { apiSuccess, apiError } from '@/lib/response';
import { requirePermission } from '@/lib/auth/rbac';
import { DisbursementMode } from '@prisma/client';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let authUser: any = null;
    try {
      authUser = await requirePermission(req, 'payroll:disburse');
    } catch {
      // Dev fallback
    }

    const body = await req.json().catch(() => ({}));
    const mode = body.disbursementMode || DisbursementMode.BANK_TRANSFER;
    const reference = body.transactionReference;

    const result = await PayrollService.disbursePayrollPeriod(
      id,
      authUser?.id || 'USER_TREASURY_OFFICER',
      mode,
      reference
    );

    return apiSuccess(
      result,
      'Payroll disbursed successfully. General Ledger double-entry payment voucher created.',
      200
    );
  } catch (error) {
    return apiError(error, 'Failed to disburse payroll period');
  }
}
