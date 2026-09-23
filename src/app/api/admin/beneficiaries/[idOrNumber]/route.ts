import { NextRequest } from 'next/server';
import { BeneficiaryService } from '@/lib/beneficiaries/beneficiary-service';
import { apiSuccess, apiError } from '@/lib/response';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ idOrNumber: string }> }
) {
  try {
    const { idOrNumber } = await params;
    const { searchParams } = new URL(req.url);
    const unmask = searchParams.get('unmask') === 'true';

    const beneficiary = await BeneficiaryService.getBeneficiary(idOrNumber, {
      canReadSensitivePII: unmask,
    });

    if (!beneficiary) {
      return apiError(new Error('Beneficiary record not found.'));
    }

    return apiSuccess(beneficiary, 'Beneficiary record retrieved successfully', 200);
  } catch (error) {
    return apiError(error);
  }
}
