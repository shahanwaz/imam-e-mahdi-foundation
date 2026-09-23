import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/response';
import { requirePermission } from '@/lib/auth/rbac';
import { FinanceService } from '@/lib/finance/finance-service';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requirePermission(req, 'finance:audit_review');
    const { id } = await params;
    const body = await req.json();

    const statement = await FinanceService.signOffReconciliation(
      id,
      body.signOffNotes || 'Bank Reconciliation verified against official bank statement. No unresolved material discrepancies found.',
      user.id
    );

    return apiSuccess(statement, 'Bank Reconciliation signed off by Auditor', 200);
  } catch (error) {
    return apiError(error);
  }
}
