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

    const assistance = await BeneficiaryService.disburseAssistance({
      beneficiaryId: beneficiary.id,
      projectId: body.projectId,
      assistanceType: body.assistanceType,
      amountINR: Number(body.amountINR),
      itemDescription: body.itemDescription,
      disbursementDate: body.disbursementDate,
      paymentReference: body.paymentReference,
      receiptReference: body.receiptReference,
      notes: body.notes,
    });

    return apiSuccess(
      assistance,
      `Assistance #${assistance.assistanceNumber} of ₹${Number(assistance.amountINR).toLocaleString('en-IN')} successfully logged.`,
      201
    );
  } catch (error) {
    return apiError(error);
  }
}
