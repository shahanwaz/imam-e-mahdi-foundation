import { NextRequest } from 'next/server';
import { EventService } from '@/lib/events/event-service';
import { apiSuccess, apiError } from '@/lib/response';
import { ValidationError } from '@/lib/errors';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ idOrSlug: string }> }
) {
  try {
    const { idOrSlug } = await params;
    const body = await req.json();

    if (!body.fullName || !body.email) {
      return apiError(new ValidationError('Full name and email are mandatory for event registration.'));
    }

    const result = await EventService.registerForEvent({
      eventId: idOrSlug,
      fullName: body.fullName,
      email: body.email,
      phone: body.phone,
      city: body.city,
      organization: body.organization,
      ticketType: body.ticketType,
      notes: body.notes,
      userId: body.userId,
    });

    return apiSuccess(
      result,
      result.message,
      result.isDuplicate ? 200 : 201
    );
  } catch (error) {
    return apiError(error);
  }
}
