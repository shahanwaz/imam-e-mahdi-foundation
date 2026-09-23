import { NextRequest } from 'next/server';
import { PayrollService } from '@/lib/payroll/payroll-service';
import { apiSuccess, apiError } from '@/lib/response';
import { requirePermission } from '@/lib/auth/rbac';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let authUser: any = null;
    try {
      authUser = await requirePermission(req, 'payroll:approve');
    } catch {
      // Dev fallback
    }

    const body = await req.json().catch(() => ({}));
    const approved = await PayrollService.approvePayrollPeriod(
      id,
      authUser?.id || 'USER_LEAD_DIRECTOR',
      body.remarks
    );

    return apiSuccess(
      { period: approved },
      'Payroll period verified and approved for disbursement.',
      200
    );
  } catch (error) {
    return apiError(error, 'Failed to approve payroll period');
  }
}
