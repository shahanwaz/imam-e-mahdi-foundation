import React from 'react';
import { getCmsMedia } from '@/lib/cms/content-service';
import { constructMetadata } from '@/lib/seo/metadata';
import { Camera, Image as ImageIcon } from 'lucide-react';

export const metadata = constructMetadata({
  title: 'Media Gallery | Field Relief Photography',
  description:
    'High-resolution visual dispatches from medical camps, ration distribution, borewell installations, and student merit ceremonies.',
  path: '/gallery',
});

export default async function GalleryPage() {
  const images = await getCmsMedia('PHOTO');

  return (
    <div className="py-12 sm:py-16 space-y-16">
      {/* Header Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-xl">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-semibold uppercase tracking-widest text-gold-400">
              Visual Documentation
            </span>
            <h1 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight text-white">
              Photo Gallery &amp; Field Archives
            </h1>
            <p className="text-base sm:text-lg text-emerald-200/90 leading-relaxed">
              Transparent, dignified photographic archives showcasing the real-world deployment of donor contributions.
            </p>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {images.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-xl transition-all duration-300 group"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-md bg-emerald-950/90 text-gold-300 text-[11px] font-semibold">
                    {item.category}
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-1.5">
                <h3 className="font-serif font-bold text-base text-slate-900 leading-snug">
                  {item.title}
                </h3>
                {item.caption && (
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.caption}
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
