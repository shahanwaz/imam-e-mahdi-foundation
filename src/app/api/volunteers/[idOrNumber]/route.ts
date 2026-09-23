import { NextRequest, NextResponse } from 'next/server';
import { VolunteerService } from '@/lib/volunteers/volunteer-service';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ idOrNumber: string }> }
) {
  try {
    const { idOrNumber } = await params;
    const volunteer = await VolunteerService.getVolunteerProfile(idOrNumber);

    if (!volunteer) {
      return NextResponse.json(
        { success: false, error: 'Volunteer profile not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: volunteer,
    });
  } catch (error: any) {
    console.error('[API_VOLUNTEER_GET_ERROR]', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch volunteer profile' },
      { status: 500 }
    );
  }
}
