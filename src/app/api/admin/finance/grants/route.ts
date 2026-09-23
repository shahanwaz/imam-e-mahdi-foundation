import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/response';
import { requirePermission } from '@/lib/auth/rbac';
import { FinanceService } from '@/lib/finance/finance-service';
import { GrantType, GrantStatus } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    await requirePermission(req, 'finance:view_ledger');

    const { searchParams } = new URL(req.url);
    const grantType = searchParams.get('grantType') as GrantType | undefined;
    const status = searchParams.get('status') as GrantStatus | undefined;
    const search = searchParams.get('search') || undefined;

    const grants = await FinanceService.listGrants({ grantType, status, search });

    return apiSuccess(grants, 'Grants and CSR funding retrieved successfully');
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission(req, 'finance:record_expense');
    const body = await req.json();

    const grant = await FinanceService.createGrant(
      {
        fundingAgencyName: body.fundingAgencyName,
        agencyContactPerson: body.agencyContactPerson,
        agencyEmail: body.agencyEmail,
        agencyPhone: body.agencyPhone,
        grantType: body.grantType || GrantType.INSTITUTIONAL_GRANT,
        sanctionedAmountINR: Number(body.sanctionedAmountINR),
        disbursedAmountINR: body.disbursedAmountINR ? Number(body.disbursedAmountINR) : undefined,
        purpose: body.purpose,
        grantStartDate: new Date(body.grantStartDate),
        grantEndDate: new Date(body.grantEndDate),
        complianceTerms: body.complianceTerms,
        projectId: body.projectId || undefined,
      },
      user.id
    );

    return apiSuccess(grant, 'Institutional Grant / CSR record created successfully', 201);
  } catch (error) {
    return apiError(error);
  }
}
