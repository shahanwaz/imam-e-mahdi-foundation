import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { apiSuccess, apiError } from '@/lib/response';
import { NotFoundError } from '@/lib/errors';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || undefined;

    const event = await prisma.event.findFirst({
      where: { OR: [{ id }, { eventNumber: id }, { slug: id }] },
    });

    if (!event) {
      return apiError(new NotFoundError('Event not found.'));
    }

    const where: any = { eventId: event.id };
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { registrationNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    const registrations = await prisma.eventRegistration.findMany({
      where,
      orderBy: { registeredAt: 'desc' },
    });

    return apiSuccess({
      event,
      registrations,
      total: registrations.length,
      checkedInCount: registrations.filter((r) => r.isCheckedIn).length,
    }, 'Event participants retrieved successfully');
  } catch (error) {
    return apiError(error);
  }
}
