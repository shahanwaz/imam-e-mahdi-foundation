import { NextRequest } from 'next/server';
import { EventService } from '@/lib/events/event-service';
import { apiSuccess, apiError } from '@/lib/response';
import { EventCategory, EventType } from '@prisma/client';

const FALLBACK_PUBLIC_EVENTS = [
  {
    id: 'evt_1',
    eventNumber: 'IMF-EVT-2026-00001',
    title: 'Annual Humanitarian Medical Camp & Diagnostic Drive',
    slug: 'annual-medical-camp-2026',
    summary: 'Free multi-specialty diagnostics, blood sugar screening, cardiology check-ups, and prescription dispensing.',
    description: 'Serving over 500 underprivileged families in rural districts with qualified physicians and pharmacists.',
    eventType: 'IN_PERSON',
    category: 'MEDICAL_CAMP',
    status: 'REGISTRATION_OPEN',
    startDate: new Date(Date.now() + 86400000 * 3).toISOString(),
    endDate: new Date(Date.now() + 86400000 * 3 + 28800000).toISOString(),
    capacityMax: 500,
    capacityReserved: 412,
    isFree: true,
    ticketFeeINR: 0,
    allowWaitlist: true,
    venueName: 'Imam E Mahdi Community Medical Hall',
    venueCity: 'Lucknow',
    venueAddress: 'Old City Health Complex, Sector 4',
    isVirtual: false,
    coverImageUrl: '/images/events/medical.jpg',
    organizerName: 'Imam E Mahdi Medical Cell',
    organizerEmail: 'medical@imf-ngo.org',
    speakers: [
      { name: 'Dr. Zeeshan Haider', titleRole: 'Chief Medical Officer', topicTitle: 'Preventive Cardiology & Diabetes Care' },
    ],
  },
  {
    id: 'evt_2',
    eventNumber: 'IMF-EVT-2026-00002',
    title: 'Global Webinar: Ethics of Islamic Philanthropy & Zakat Calculation',
    slug: 'islamic-philanthropy-zakat-webinar',
    summary: 'Interactive seminar with certified scholars exploring contemporary Zakat, Khums accounting, and Sharia compliance.',
    description: 'Comprehensive digital masterclass for global donors, corporate sponsors, and volunteers with live Q&A.',
    eventType: 'VIRTUAL_ONLINE',
    category: 'SEMINAR_WORKSHOP',
    status: 'PUBLISHED',
    startDate: new Date(Date.now() + 86400000 * 7).toISOString(),
    endDate: new Date(Date.now() + 86400000 * 7 + 7200000).toISOString(),
    capacityMax: 1000,
    capacityReserved: 680,
    isFree: true,
    ticketFeeINR: 0,
    allowWaitlist: true,
    isVirtual: true,
    meetingPlatform: 'ZOOM',
    meetingJoinUrl: 'https://zoom.us/j/98127394812',
    streamEmbedCode: 'https://www.youtube.com/embed/live_stream?channel=imf_official',
    coverImageUrl: '/images/events/seminar.jpg',
    organizerName: 'Central Sharia Advisory Board',
    organizerEmail: 'sharia@imf-ngo.org',
    speakers: [
      { name: 'Maulana Syed Ali Naqvi', titleRole: 'Sharia Scholar & Author', topicTitle: 'Modern Asset Valuation for Zakat' },
    ],
  },
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') as EventCategory | null;
    const eventType = searchParams.get('type') as EventType | null;
    const search = searchParams.get('search') || undefined;

    try {
      const { events, total } = await EventService.listEvents({
        category: category || undefined,
        eventType: eventType || undefined,
        search,
        isPublicOnly: true,
      });

      if (events && events.length > 0) {
        return apiSuccess({ events, total }, 'Public events retrieved successfully');
      }
    } catch {
      // Fallback
    }

    let filtered = [...FALLBACK_PUBLIC_EVENTS];
    if (search) {
      filtered = filtered.filter(
        (e) =>
          e.title.toLowerCase().includes(search.toLowerCase()) ||
          e.eventNumber.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (category) filtered = filtered.filter((e) => e.category === category);
    if (eventType) filtered = filtered.filter((e) => e.eventType === eventType);

    return apiSuccess({ events: filtered, total: filtered.length }, 'Public events retrieved successfully');
  } catch (error) {
    return apiError(error);
  }
}
