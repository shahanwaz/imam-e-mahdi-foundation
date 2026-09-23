import { NextRequest, NextResponse } from 'next/server';
import { MemberService } from '@/lib/members/member-service';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ idOrNumber: string }> }
) {
  try {
    const { idOrNumber } = await params;
    const member = await MemberService.getMemberProfile(idOrNumber);

    if (!member) {
      return NextResponse.json(
        { success: false, error: 'Member profile not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: member,
    });
  } catch (error: any) {
    console.error('[API_MEMBER_GET_ERROR]', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch member profile' },
      { status: 500 }
    );
  }
}
