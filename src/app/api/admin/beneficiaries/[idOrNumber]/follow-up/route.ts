import { NextRequest } from 'next/server';
import { BeneficiaryService } from '@/lib/beneficiaries/beneficiary-service';
import { apiSuccess, apiError } from '@/lib/response';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ idOrNumber: string }> }
) {
  try {
    const { idOrNumber } = await params;
    const body = await req.json();

    const beneficiary = await BeneficiaryService.getBeneficiary(idOrNumber);
    if (!beneficiary) {
      return apiError(new Error('Beneficiary not found.'));
    }

    const followUp = await BeneficiaryService.recordFollowUp({
      beneficiaryId: beneficiary.id,
      findingsNotes: body.findingsNotes,
      socioeconomicOutcome: body.socioeconomicOutcome,
      nextFollowUpDate: body.nextFollowUpDate,
    });

    return apiSuccess(followUp, 'Case follow-up and outcome recorded successfully.', 201);
  } catch (error) {
    return apiError(error);
  }
}
