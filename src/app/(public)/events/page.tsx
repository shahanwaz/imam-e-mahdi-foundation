import React from 'react';
import { getCmsEvents } from '@/lib/cms/content-service';
import { constructMetadata } from '@/lib/seo/metadata';
import PublicEventsClient from '@/components/public/events/PublicEventsClient';

export const metadata = constructMetadata({
  title: 'Events, Health Camps & Assemblies | Imam E Mahdi Foundation',
  description:
    'Register for upcoming free medical diagnostics, global seminars, volunteer orientations, and humanitarian relief assemblies.',
  path: '/events',
});

export default async function EventsPage() {
  const cmsEvents = await getCmsEvents();

  const formattedEvents = cmsEvents.map((evt) => ({
    id: evt.id,
    eventNumber: `IMF-EVT-2026-0000${evt.id}`,
    slug: evt.slug || `event-${evt.id}`,
    title: evt.title,
    summary: evt.summary,
    description: (evt as any).description || evt.summary,
    category: evt.category,
    eventType: (evt.category === 'Webinar' ? 'VIRTUAL_ONLINE' : 'IN_PERSON') as any,
    status: evt.status === 'Upcoming' ? 'REGISTRATION_OPEN' : 'COMPLETED',
    date: evt.date,
    time: evt.time,
    location: evt.location,
    coverImageUrl: evt.coverImageUrl,
    capacityMax: 500,
    capacityReserved: 340,
    isFree: true,
  }));

  return (
    <div className="py-12 sm:py-16 space-y-12">
      {/* Header Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-xl">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-semibold uppercase tracking-widest text-gold-400">
              Community Engagement &amp; Assemblies
            </span>
            <h1 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight text-white">
              Events, Health Camps &amp; Webinars
            </h1>
            <p className="text-base sm:text-lg text-emerald-200/90 leading-relaxed">
              Participate in diagnostic medical camps, symposiums, volunteer orientations, and global live-streamed masterclasses.
            </p>
          </div>
        </div>
      </div>

      {/* Events Client Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PublicEventsClient initialEvents={formattedEvents} />
      </div>
    </div>
  );
}
