import { NextRequest } from 'next/server';
import { VolunteerService } from '@/lib/volunteers/volunteer-service';
import { apiSuccess, apiError } from '@/lib/response';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ idOrNumber: string }> }
) {
  try {
    const { idOrNumber } = await params;
    const body = await req.json().catch(() => ({}));

    const volunteer = await VolunteerService.getVolunteerProfile(idOrNumber);
    if (!volunteer) {
      return apiError(new Error('Volunteer candidate not found.'));
    }

    const token = req.headers.get('authorization')?.replace('Bearer ', '') || null;
    let finalVerifierId = body.verifierUserId || 'volunteer_coordinator';
    if (token) {
      try {
        const { verifySessionToken } = await import('@/lib/auth/session');
        const user = await verifySessionToken(token);
        finalVerifierId = user.id;
      } catch {
        // Fallback
      }
    }

    const updated = await VolunteerService.verifyAndApproveVolunteer(
      volunteer.id,
      finalVerifierId
    );

    return apiSuccess(
      updated,
      `Volunteer #${volunteer.volunteerNumber} has been verified and digital badge activated.`,
      200
    );
  } catch (error) {
    return apiError(error);
  }
}
