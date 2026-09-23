import React from 'react';
import Link from 'next/link';
import { getCmsPrograms } from '@/lib/cms/content-service';
import { constructMetadata } from '@/lib/seo/metadata';
import { Heart, BookOpen, Activity, Droplet, Users, ArrowRight, ShieldCheck } from 'lucide-react';

export const metadata = constructMetadata({
  title: 'Humanitarian Programs | Orphan Support, Education & Healthcare',
  description:
    'Explore our sustainable humanitarian programs spanning orphan sponsorship, college scholarships, free dialysis, and rural clean water.',
  path: '/programs',
});

export default async function ProgramsPage() {
  const programs = await getCmsPrograms();

  return (
    <div className="py-12 sm:py-16 space-y-16">
      {/* Header Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-xl">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-semibold uppercase tracking-widest text-gold-400">
              Transformative Interventions
            </span>
            <h1 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight text-white">
              Humanitarian Programs &amp; Initiatives
            </h1>
            <p className="text-base sm:text-lg text-emerald-200/90 leading-relaxed">
              Every program is structured with clear impact milestones, field audits, and direct assistance disbursements.
            </p>
          </div>
        </div>
      </div>

      {/* Program Detail Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {programs.map((p, idx) => (
          <div
            key={p.id}
            id={p.slug}
            className={`grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center ${
              idx % 2 === 1 ? 'lg:flex-row-reverse' : ''
            }`}
          >
            {/* Image */}
            <div className={`lg:col-span-6 ${idx % 2 === 1 ? 'lg:order-2' : ''}`}>
              <div className="relative aspect-[16/10] rounded-3xl overflow-hidden shadow-lg border border-slate-200 bg-slate-100 group">
                <img
                  src={p.coverImageUrl || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80'}
                  alt={p.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full bg-emerald-950/90 backdrop-blur-md text-gold-300 text-xs font-bold">
                    {p.category}
                  </span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className={`lg:col-span-6 space-y-6 ${idx % 2 === 1 ? 'lg:order-1' : ''}`}>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-gold-500" />
                  <span>{p.beneficiariesCount.toLocaleString('en-IN')} Beneficiaries Uplifted</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 leading-tight">
                  {p.title}
                </h2>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  {p.description}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FDFBF7] border border-slate-200/80 text-xs text-slate-700 space-y-1">
                <strong>Strategic Impact:</strong> {p.summary}
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href={`/donate?cause=${encodeURIComponent(p.slug)}&title=${encodeURIComponent(p.title)}`}
                  className="px-6 py-3 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-gold-300 font-bold text-xs sm:text-sm flex items-center gap-2 transition-colors shadow-md"
                >
                  <Heart className="w-4 h-4 fill-gold-400 text-gold-400" />
                  <span>Sponsor This Program</span>
                </Link>
                <Link
                  href="/contact"
                  className="px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-medium text-xs sm:text-sm transition-colors"
                >
                  Inquire for Aid
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
