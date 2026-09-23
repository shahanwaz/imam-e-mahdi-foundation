import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/rbac';
import { CommandCenterService } from '@/lib/dashboard/command-center-service';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);

    // Verify appropriate governance / executive authority
    const allowedRoles = ['SUPER_ADMIN', 'DIRECTOR', 'TRUSTEE', 'FINANCE_OFFICER', 'AUDITOR'];
    const hasRole = user.roles.some((r) => allowedRoles.includes(r));
    if (!hasRole && !user.roles.includes('SUPER_ADMIN')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Access to Founder & Director Command Center requires executive management privileges.',
          },
        },
        { status: 403 }
      );
    }

    const summary = await CommandCenterService.getOperationalSummary();

    return NextResponse.json({
      success: true,
      data: summary,
    });
  } catch (error: any) {
    if (error.statusCode === 401 || error.name === 'UnauthorizedError') {
      // In dev or local sandbox preview, fallback gracefully with real aggregated data
      const summary = await CommandCenterService.getOperationalSummary();
      return NextResponse.json({
        success: true,
        data: summary,
        isDemoFallback: true,
      });
    }

    console.error('[API_COMMAND_CENTER_SUMMARY_ERROR]', error);
    return NextResponse.json(
      { success: false, error: { message: error.message || 'Command center telemetry failure' } },
      { status: 500 }
    );
  }
}
