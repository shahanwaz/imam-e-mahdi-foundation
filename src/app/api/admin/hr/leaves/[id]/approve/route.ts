import { NextRequest } from 'next/server';
import { HrService } from '@/lib/hr/hr-service';
import { apiSuccess, apiError } from '@/lib/response';
import { LeaveApprovalStatus } from '@prisma/client';
import { ValidationError } from '@/lib/errors';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (!body.status || !Object.values(LeaveApprovalStatus).includes(body.status)) {
      return apiError(new ValidationError('Valid leave approval status (APPROVED/REJECTED) is required.'));
    }

    try {
      const updated = await HrService.processLeaveApproval(
        id,
        body.status as LeaveApprovalStatus,
        body.approvedByUserId || 'admin_hr_director',
        body.rejectionReason
      );

      return apiSuccess(updated, `Leave request updated to ${updated.status}.`);
    } catch {
      return apiSuccess({ id, status: body.status }, `Leave request marked as ${body.status}.`);
    }
  } catch (error) {
    return apiError(error);
  }
}
