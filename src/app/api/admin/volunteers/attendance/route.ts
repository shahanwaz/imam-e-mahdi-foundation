import { NextRequest } from 'next/server';
import { VolunteerService } from '@/lib/volunteers/volunteer-service';
import { apiSuccess, apiError } from '@/lib/response';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const hoursLog = await VolunteerService.logAttendanceAndHours(body);

    return apiSuccess(
      hoursLog,
      `Attendance and ${hoursLog.hoursLogged} hours logged with ${hoursLog.supervisorRating}-star supervisor rating.`,
      201
    );
  } catch (error) {
    return apiError(error);
  }
}
