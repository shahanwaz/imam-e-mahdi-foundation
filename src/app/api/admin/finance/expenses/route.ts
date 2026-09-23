import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/response';
import { requirePermission } from '@/lib/auth/rbac';
import { FinanceService } from '@/lib/finance/finance-service';
import { ExpenseCategory, ExpenseStatus, PaymentMethod } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    await requirePermission(req, 'finance:view_ledger');

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') as ExpenseCategory | undefined;
    const status = searchParams.get('status') as ExpenseStatus | undefined;
    const projectId = searchParams.get('projectId') || undefined;
    const vendorId = searchParams.get('vendorId') || undefined;
    const search = searchParams.get('search') || undefined;

    const expenses = await FinanceService.listExpenses({
      category,
      status,
      projectId,
      vendorId,
      search,
    });

    return apiSuccess(expenses, 'Expense records retrieved successfully');
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission(req, 'finance:record_expense');
    const body = await req.json();

    const expense = await FinanceService.createExpense(
      {
        title: body.title,
        category: body.category || ExpenseCategory.PROJECT_EXECUTION,
        amount: Number(body.amount),
        paymentDate: body.paymentDate ? new Date(body.paymentDate) : undefined,
        paymentMethod: body.paymentMethod || PaymentMethod.BANK_TRANSFER_NEFT,
        paymentReference: body.paymentReference,
        vendorId: body.vendorId || undefined,
        projectId: body.projectId || undefined,
        budgetLineId: body.budgetLineId || undefined,
        invoiceUrl: body.invoiceUrl,
        remarks: body.remarks,
      },
      user.id
    );

    return apiSuccess(expense, 'Expense recorded successfully', 201);
  } catch (error) {
    return apiError(error);
  }
}
