import { NextRequest } from 'next/server';
import { VolunteerService } from '@/lib/volunteers/volunteer-service';
import { apiSuccess, apiError } from '@/lib/response';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const assignment = await VolunteerService.createAssignment(body);

    return apiSuccess(
      assignment,
      `Assignment #${assignment.assignmentNumber} successfully dispatched.`,
      201
    );
  } catch (error) {
    return apiError(error);
  }
}
