import React from 'react';
import { getCmsMedia } from '@/lib/cms/content-service';
import { constructMetadata } from '@/lib/seo/metadata';
import { PlayCircle, Video as VideoIcon } from 'lucide-react';

export const metadata = constructMetadata({
  title: 'Documentary Videos & Field Reports | Imam E Mahdi Foundation',
  description:
    'Watch impact documentaries, field dispatches, and video walkthroughs of our Zakat transparency systems.',
  path: '/videos',
});

export default async function VideosPage() {
  const videos = await getCmsMedia('VIDEO');

  return (
    <div className="py-12 sm:py-16 space-y-16">
      {/* Header Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-xl">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-semibold uppercase tracking-widest text-gold-400">
              Video Documentaries
            </span>
            <h1 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight text-white">
              Documentary Films &amp; Field Reports
            </h1>
            <p className="text-base sm:text-lg text-emerald-200/90 leading-relaxed">
              Watch on-the-ground visual stories, audit explanations, and beneficiary impact accounts.
            </p>
          </div>
        </div>
      </div>

      {/* Videos Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {videos.map((vid) => (
            <div
              key={vid.id}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-xl transition-all duration-300"
            >
              <div className="relative aspect-video bg-slate-900 overflow-hidden">
                <iframe
                  src={vid.url}
                  title={vid.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              <div className="p-6 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[11px] font-bold">
                    {vid.category}
                  </span>
                </div>
                <h3 className="font-serif font-bold text-lg text-slate-900 leading-snug">
                  {vid.title}
                </h3>
                {vid.caption && (
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {vid.caption}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
