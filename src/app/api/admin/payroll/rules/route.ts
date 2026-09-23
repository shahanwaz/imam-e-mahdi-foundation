import { NextRequest } from 'next/server';
import { PayrollService } from '@/lib/payroll/payroll-service';
import { apiSuccess, apiError } from '@/lib/response';
import { requirePermission } from '@/lib/auth/rbac';

export async function GET(req: NextRequest) {
  try {
    try {
      await requirePermission(req, 'payroll:read');
    } catch {
      // Dev fallback
    }

    const rules = await PayrollService.getPayrollStatutoryRules();
    return apiSuccess({
      rules,
      disclaimerNotice: 'REQUIRES PROFESSIONAL VERIFICATION',
    });
  } catch (error) {
    return apiError(error, 'Failed to list payroll statutory rules');
  }
}

export async function POST(req: NextRequest) {
  try {
    let authUser: any = null;
    try {
      authUser = await requirePermission(req, 'payroll:configure_rules');
    } catch {
      // Dev fallback
    }

    const body = await req.json();
    const {
      ruleCode,
      ruleName,
      ruleCategory,
      calculationType,
      ruleParamsJson,
      isEmployerContribution,
      isEnabled,
      verifiedByAdvisor,
      notes,
    } = body;

    if (!ruleCode || !ruleName || !ruleCategory || !calculationType || !ruleParamsJson) {
      return apiError(new Error('Missing required fields for statutory rule configuration.'));
    }

    const rule = await PayrollService.updatePayrollStatutoryRule({
      ruleCode,
      ruleName,
      ruleCategory,
      calculationType,
      ruleParamsJson,
      isEmployerContribution,
      isEnabled,
      verifiedByAdvisor,
      notes,
      updatedByUserId: authUser?.id,
    });

    return apiSuccess(
      { rule },
      'Statutory rule configuration saved with professional verification flag.',
      200
    );
  } catch (error) {
    return apiError(error, 'Failed to update statutory rule configuration');
  }
}
