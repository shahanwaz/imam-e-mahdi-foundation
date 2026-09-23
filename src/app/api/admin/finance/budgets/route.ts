import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/response';
import { requirePermission } from '@/lib/auth/rbac';
import { FinanceService } from '@/lib/finance/finance-service';
import { ExpenseCategory } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    await requirePermission(req, 'finance:view_ledger');

    const { searchParams } = new URL(req.url);
    const fiscalYear = searchParams.get('fiscalYear') ? parseInt(searchParams.get('fiscalYear')!, 10) : undefined;

    const budgets = await FinanceService.listBudgets(fiscalYear);

    return apiSuccess(budgets, 'Annual budgets and lines retrieved successfully');
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission(req, 'finance:manage_budgets');
    const body = await req.json();

    const budget = await FinanceService.createBudget(
      {
        fiscalYear: parseInt(body.fiscalYear, 10) || new Date().getFullYear(),
        title: body.title,
        notes: body.notes,
        lines: (body.lines || []).map((l: any) => ({
          lineCode: l.lineCode,
          category: l.category || ExpenseCategory.PROJECT_EXECUTION,
          title: l.title,
          allocatedAmountINR: Number(l.allocatedAmountINR),
          projectId: l.projectId || undefined,
          accountHeadId: l.accountHeadId || undefined,
          notes: l.notes,
        })),
      },
      user.id
    );

    return apiSuccess(budget, 'Annual Budget and lines created successfully', 201);
  } catch (error) {
    return apiError(error);
  }
}
