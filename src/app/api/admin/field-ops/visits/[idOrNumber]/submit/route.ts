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

    const updated = await FieldOpsService.submitFieldVisitReport({
      visitId: idOrNumber,
      completedDate: body.completedDate,
      gpsLatitude: body.gpsLatitude,
      gpsLongitude: body.gpsLongitude,
      locationAddress: body.locationAddress,
      geoPhotoUrls: body.geoPhotoUrls,
      fieldObservations: body.fieldObservations,
      needsVerificationSummary: body.needsVerificationSummary,
    });

    return apiSuccess(
      updated,
      `Field Visit #${updated.visitNumber} report submitted for supervisor review.`,
      200
    );
  } catch (error) {
    return apiError(error);
  }
}
