import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/response';
import { requireAuth } from '@/lib/auth/rbac';
import { ComplianceService } from '@/lib/compliance/compliance-service';

export async function POST(req: NextRequest) {
  try {
    await requireAuth(req);
    const results = await ComplianceService.checkAndDispatchReminders();

    return apiSuccess(
      results,
      `Compliance reminder scan executed. ${results.length} reminder actions processed.`
    );
  } catch (error) {
    return apiError(error);
  }
}
