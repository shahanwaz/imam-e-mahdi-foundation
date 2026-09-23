import { NextRequest } from 'next/server';
import { EventService } from '@/lib/events/event-service';
import { apiSuccess, apiError } from '@/lib/response';
import { ValidationError } from '@/lib/errors';
import { EventStatus } from '@prisma/client';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (!body.status || !Object.values(EventStatus).includes(body.status)) {
      return apiError(new ValidationError('Invalid or missing target event status.'));
    }

    const updated = await EventService.transitionStatus(id, body.status, body.userId);

    return apiSuccess(
      updated,
      `Event #${updated.eventNumber} transitioned to status ${updated.status}.`
    );
  } catch (error) {
    return apiError(error);
  }
}
