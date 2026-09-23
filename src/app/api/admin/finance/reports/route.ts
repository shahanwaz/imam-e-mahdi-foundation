import { NextRequest, NextResponse } from 'next/server';
import { apiSuccess, apiError } from '@/lib/response';
import { requirePermission } from '@/lib/auth/rbac';
import { FinancialReportService } from '@/lib/finance/financial-report-service';

export async function GET(req: NextRequest) {
  try {
    await requirePermission(req, 'finance:view_ledger');

    const { searchParams } = new URL(req.url);
    const reportType = searchParams.get('type') || 'INCOME_AND_EXPENDITURE';
    const format = searchParams.get('format') || 'json'; // 'json' or 'csv'
    const fiscalYear = searchParams.get('fiscalYear') ? parseInt(searchParams.get('fiscalYear')!, 10) : new Date().getFullYear();
    const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined;
    const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined;
    const projectId = searchParams.get('projectId') || undefined;

    let reportData: any = null;

    switch (reportType) {
      case 'INCOME_AND_EXPENDITURE':
        reportData = await FinancialReportService.getIncomeAndExpenditureReport({ startDate, endDate, projectId });
        break;
      case 'RECEIPTS_AND_PAYMENTS':
        reportData = await FinancialReportService.getReceiptsAndPaymentsReport({ startDate, endDate });
        break;
      case 'EXPENSE_REPORT':
        reportData = await FinancialReportService.getExpenseReport({ startDate, endDate, projectId });
        break;
      case 'BUDGET_VS_ACTUAL':
        reportData = await FinancialReportService.getBudgetVsActualReport(fiscalYear);
        break;
      case 'PROJECT_UTILIZATION':
        reportData = await FinancialReportService.getProjectUtilizationReport();
        break;
      case 'DONATION_REPORT':
        reportData = await FinancialReportService.getDonationReport({ startDate, endDate });
        break;
      case 'MONTHLY_REPORT':
        reportData = await FinancialReportService.getMonthlyReport(fiscalYear);
        break;
      case 'ANNUAL_REPORT':
        reportData = await FinancialReportService.getAnnualReport(fiscalYear);
        break;
      default:
        reportData = await FinancialReportService.getIncomeAndExpenditureReport({ startDate, endDate });
        break;
    }

    if (format === 'csv') {
      const csv = FinancialReportService.exportToCsv(reportType, reportData);
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="IMF-${reportType}-${fiscalYear}.csv"`,
        },
      });
    }

    return apiSuccess(reportData, `Financial Report [${reportType}] generated successfully`);
  } catch (error) {
    return apiError(error);
  }
}
