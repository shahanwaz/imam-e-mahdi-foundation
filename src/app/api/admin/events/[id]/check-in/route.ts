import { NextRequest } from 'next/server';
import { EventService } from '@/lib/events/event-service';
import { apiSuccess, apiError } from '@/lib/response';
import { ValidationError } from '@/lib/errors';
import { AttendanceMethod } from '@prisma/client';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (!body.passSignatureHash) {
      return apiError(new ValidationError('Pass signature hash or QR code string is required.'));
    }

    const result = await EventService.verifyTicketAndCheckIn({
      passSignatureHash: body.passSignatureHash,
      checkedInByUserId: body.checkedInByUserId,
      method: (body.method as AttendanceMethod) || AttendanceMethod.QR_SCAN_GATE,
    });

    if (!result.valid) {
      return apiError(new ValidationError(result.message));
    }

    return apiSuccess(result, result.message, 200);
  } catch (error) {
    return apiError(error);
  }
}
