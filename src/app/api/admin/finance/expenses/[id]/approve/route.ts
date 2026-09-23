import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/response';
import { requirePermission } from '@/lib/auth/rbac';
import { FinanceService } from '@/lib/finance/finance-service';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requirePermission(req, 'finance:approve_expense');
    const { id } = await params;

    const expense = await FinanceService.approveExpense(id, user.id);

    return apiSuccess(expense, 'Expense approved successfully', 200);
  } catch (error) {
    return apiError(error);
  }
}
