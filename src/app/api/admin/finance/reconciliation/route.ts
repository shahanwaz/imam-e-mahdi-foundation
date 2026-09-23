import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/response';
import { requirePermission } from '@/lib/auth/rbac';
import { FinanceService } from '@/lib/finance/finance-service';
import { ReconciliationItemType } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    await requirePermission(req, 'finance:view_ledger');

    const { searchParams } = new URL(req.url);
    const bankAccountId = searchParams.get('bankAccountId') || undefined;

    const statements = await FinanceService.listReconciliations(bankAccountId);

    return apiSuccess(statements, 'Bank Reconciliation statements retrieved successfully');
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission(req, 'finance:record_expense');
    const body = await req.json();

    const statement = await FinanceService.createReconciliationStatement(
      {
        bankAccountHeadId: body.bankAccountHeadId,
        statementDate: new Date(body.statementDate),
        statementClosingBalance: Number(body.statementClosingBalance),
        bookClosingBalance: Number(body.bookClosingBalance),
        uncreditedDeposits: body.uncreditedDeposits ? Number(body.uncreditedDeposits) : undefined,
        unpresentedCheques: body.unpresentedCheques ? Number(body.unpresentedCheques) : undefined,
        items: body.items?.map((it: any) => ({
          transactionDate: new Date(it.transactionDate),
          referenceNumber: it.referenceNumber,
          description: it.description,
          amount: Number(it.amount),
          itemType: it.itemType || ReconciliationItemType.UNCREDITED_DEPOSIT,
        })),
      },
      user.id
    );

    return apiSuccess(statement, 'Bank Reconciliation Statement created successfully', 201);
  } catch (error) {
    return apiError(error);
  }
}
