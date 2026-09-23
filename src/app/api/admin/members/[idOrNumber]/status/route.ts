import { NextRequest } from 'next/server';
import { MemberService } from '@/lib/members/member-service';
import { apiSuccess, apiError } from '@/lib/response';
import { MembershipStatus } from '@prisma/client';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ idOrNumber: string }> }
) {
  try {
    const { idOrNumber } = await params;
    const body = await req.json();
    const { status, reason } = body;

    const member = await MemberService.getMemberProfile(idOrNumber);
    if (!member) {
      return apiError(new Error('Member not found.'));
    }

    const updated = await MemberService.updateMemberStatus(
      member.id,
      status as MembershipStatus,
      reason
    );

    return apiSuccess(updated, `Member status updated to ${status}`, 200);
  } catch (error) {
    return apiError(error);
  }
}
