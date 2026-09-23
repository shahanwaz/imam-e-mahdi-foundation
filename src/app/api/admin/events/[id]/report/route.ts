import { NextRequest } from 'next/server';
import { EventService } from '@/lib/events/event-service';
import { apiSuccess, apiError } from '@/lib/response';
import { ValidationError } from '@/lib/errors';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (!body.keyOutcomes) {
      return apiError(new ValidationError('Key outcomes description is required for the post-event report.'));
    }

    const report = await EventService.createPostEventReport({
      eventId: id,
      totalVolunteersEngaged: body.totalVolunteersEngaged ? parseInt(body.totalVolunteersEngaged, 10) : 0,
      totalCostINR: body.totalCostINR ? parseFloat(body.totalCostINR) : 0,
      keyOutcomes: body.keyOutcomes,
      shariaComplianceCertified: body.shariaComplianceCertified ?? true,
      submittedByUserId: body.submittedByUserId,
    });

    return apiSuccess(report, 'Post-event impact report generated and saved successfully.', 201);
  } catch (error) {
    return apiError(error);
  }
}
