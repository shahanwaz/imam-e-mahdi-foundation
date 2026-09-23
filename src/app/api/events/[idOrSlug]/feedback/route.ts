import { NextRequest } from 'next/server';
import { EventService } from '@/lib/events/event-service';
import { apiSuccess, apiError } from '@/lib/response';
import { ValidationError, NotFoundError } from '@/lib/errors';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ idOrSlug: string }> }
) {
  try {
    const { idOrSlug } = await params;
    const body = await req.json();

    if (!body.ratingOverall) {
      return apiError(new ValidationError('Overall rating (1-5) is required.'));
    }

    const event = await EventService.getEventByIdOrSlug(idOrSlug);
    if (!event) {
      return apiError(new NotFoundError('Event not found.'));
    }

    const feedback = await EventService.submitFeedback({
      eventId: event.id,
      registrationId: body.registrationId,
      participantName: body.participantName,
      ratingOverall: parseInt(body.ratingOverall, 10),
      ratingContent: body.ratingContent ? parseInt(body.ratingContent, 10) : undefined,
      ratingVenueOrPlatform: body.ratingVenueOrPlatform ? parseInt(body.ratingVenueOrPlatform, 10) : undefined,
      comments: body.comments,
      suggestions: body.suggestions,
      isAnonymous: body.isAnonymous,
    });

    return apiSuccess(feedback, 'Thank you! Your feedback has been recorded.', 201);
  } catch (error) {
    return apiError(error);
  }
}
