import React from 'react';
import Link from 'next/link';
import { getCmsStories } from '@/lib/cms/content-service';
import { constructMetadata } from '@/lib/seo/metadata';
import { StoryCarousel } from '@/components/public/StoryCarousel';
import { Quote, CheckCircle2, ArrowRight, Heart, MapPin } from 'lucide-react';

export const metadata = constructMetadata({
  title: 'Success Stories & Beneficiary Journeys | Imam E Mahdi Foundation',
  description:
    'Read real, verified human journeys of orphans becoming doctors, widow-headed households achieving financial independence, and rural students excelling.',
  path: '/stories',
});

export default async function StoriesPage() {
  const stories = await getCmsStories();

  return (
    <div className="py-12 sm:py-16 space-y-16">
      {/* Header Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-xl">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-semibold uppercase tracking-widest text-gold-400">
              Transformative Milestones
            </span>
            <h1 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight text-white">
              Success Stories &amp; Testimonies
            </h1>
            <p className="text-base sm:text-lg text-emerald-200/90 leading-relaxed">
              Real human transformation made possible through your Zakat, Sadaqah, and continuous donor trust.
            </p>
          </div>
        </div>
      </div>

      {/* Featured Carousel */}
      <StoryCarousel stories={stories} />

      {/* All Stories Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
          All Documented Journeys
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stories.map((story) => (
            <div
              key={story.id}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-xl transition-all duration-300 group"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                <img
                  src={story.coverImageUrl || 'https://images.unsplash.com/photo-1594824813589-9804e38c7efc?auto=format&fit=crop&w=800&q=80'}
                  alt={story.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-md bg-emerald-950/90 text-gold-300 text-[11px] font-semibold">
                    {story.category}
                  </span>
                </div>
              </div>

              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                    <span>{story.beneficiaryName}</span>
                    {story.location && (
                      <>
                        <span>&bull;</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-emerald-700" />
                          {story.location}
                        </span>
                      </>
                    )}
                  </div>
                  <h3 className="font-serif font-bold text-lg text-slate-900 leading-snug">
                    {story.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed">
                    {story.summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-emerald-800 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Audited Case Study</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
