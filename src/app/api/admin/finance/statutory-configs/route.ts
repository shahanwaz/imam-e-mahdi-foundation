import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/response';
import { requirePermission } from '@/lib/auth/rbac';
import { FinanceService } from '@/lib/finance/finance-service';

export async function GET(req: NextRequest) {
  try {
    await requirePermission(req, 'finance:view_ledger');

    const configs = await FinanceService.getStatutoryConfigs();

    return apiSuccess(configs, 'Statutory accounting configurations retrieved successfully');
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission(req, 'finance:audit_review');
    const body = await req.json();

    const config = await FinanceService.upsertStatutoryConfig(
      {
        configKey: body.configKey,
        configCategory: body.configCategory || 'NON_PROFIT_COMPLIANCE',
        ruleName: body.ruleName,
        ruleParamsJson: body.ruleParamsJson || {},
        notes: body.notes,
      },
      user.id
    );

    return apiSuccess(config, 'Statutory accounting configuration updated successfully', 200);
  } catch (error) {
    return apiError(error);
  }
}
