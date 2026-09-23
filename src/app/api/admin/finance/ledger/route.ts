import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { apiSuccess, apiError } from '@/lib/response';
import { GeneralLedgerService } from '@/lib/finance/general-ledger-service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '25', 10)));
    const search = searchParams.get('search')?.trim() || '';

    // Ensure default chart of accounts is present
    await GeneralLedgerService.ensureChartOfAccounts();

    const voucherWhere: any = {
      ...(search
        ? {
            OR: [
              { voucherNumber: { contains: search, mode: 'insensitive' } },
              { narration: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [accountHeads, ledgerSummary, totalVouchers, vouchers] = await Promise.all([
      prisma.accountHead.findMany({
        orderBy: { accountCode: 'asc' },
      }),
      GeneralLedgerService.getLedgerSummary(),
      prisma.voucher.count({ where: voucherWhere }),
      prisma.voucher.findMany({
        where: voucherWhere,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { voucherDate: 'desc' },
        include: {
          entries: {
            include: {
              accountHead: {
                select: { accountCode: true, name: true, accountType: true, isRestricted: true },
              },
            },
            orderBy: { debitAmount: 'desc' },
          },
        },
      }),
    ]);

    return apiSuccess(
      {
        accountHeads,
        ledgerSummary,
        vouchers,
      },
      'General Ledger and Double-Entry Records retrieved successfully',
      200,
      {
        page,
        limit,
        totalRecords: totalVouchers,
        totalPages: Math.ceil(totalVouchers / limit),
        timestamp: new Date().toISOString(),
      }
    );
  } catch (error) {
    return apiError(error);
  }
}
