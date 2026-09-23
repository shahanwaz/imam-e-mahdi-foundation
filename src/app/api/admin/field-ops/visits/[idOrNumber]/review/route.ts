import { NextRequest } from 'next/server';
import { FieldOpsService } from '@/lib/field-ops/field-ops-service';
import { apiSuccess, apiError } from '@/lib/response';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ idOrNumber: string }> }
) {
  try {
    const { idOrNumber } = await params;
    const body = await req.json();

    const updated = await FieldOpsService.reviewFieldVisit({
      visitId: idOrNumber,
      reviewedByUserId: body.reviewedByUserId || 'SUPERVISOR',
      isApproved: body.isApproved !== false,
      supervisorRating: Number(body.supervisorRating || 5),
      supervisorReviewNotes: body.supervisorReviewNotes || 'Verified and approved',
    });

    return apiSuccess(
      updated,
      `Field Visit #${updated.visitNumber} review completed: ${updated.status}.`,
      200
    );
  } catch (error) {
    return apiError(error);
  }
}
