import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/response';
import { requirePermission } from '@/lib/auth/rbac';
import { FinanceService } from '@/lib/finance/finance-service';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requirePermission(req, 'finance:record_expense');
    const { id } = await params;
    const body = await req.json();

    const result = await FinanceService.payExpense(
      id,
      body.paymentReference || 'BANK-DIRECT-TRANSFER',
      user.id
    );

    return apiSuccess(result, 'Expense disbursed and General Ledger voucher posted', 200);
  } catch (error) {
    return apiError(error);
  }
}
