import { NextRequest, NextResponse } from 'next/server';
import { MemberService } from '@/lib/members/member-service';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ idOrNumber: string }> }
) {
  try {
    const { idOrNumber } = await params;
    const body = await req.json();

    const member = await MemberService.getMemberProfile(idOrNumber);
    if (!member) {
      return NextResponse.json({ success: false, error: 'Member not found.' }, { status: 404 });
    }

    const updated = await MemberService.renewMembership({
      memberId: member.id,
      yearsToExtend: body.yearsToExtend || 1,
      amountPaid: body.amountPaid || 0,
      currency: body.currency || 'INR',
      paymentMethod: body.paymentMethod || 'UPI',
      paymentReference: body.paymentReference,
      renewedBy: body.renewedBy || 'ADMIN',
      notes: body.notes,
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: `Membership #${member.membershipNumber} successfully renewed until ${updated.endDate.toISOString().split('T')[0]}.`,
    });
  } catch (error: any) {
    console.error('[API_MEMBER_RENEW_ERROR]', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Membership renewal failed' },
      { status: 500 }
    );
  }
}
