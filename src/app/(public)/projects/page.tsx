import React from 'react';
import Link from 'next/link';
import { getCmsProjects } from '@/lib/cms/content-service';
import { constructMetadata } from '@/lib/seo/metadata';
import { MapPin, Users, Hammer, CheckCircle2, ArrowRight, Heart } from 'lucide-react';

export const metadata = constructMetadata({
  title: 'Capital Projects & Infrastructure | Model Schools & Solar Water Hubs',
  description:
    'Explore our sustainable infrastructure projects, including model school campuses, solar RO water plants, and women vocational centers.',
  path: '/projects',
});

export default async function ProjectsPage() {
  const projects = await getCmsProjects();

  return (
    <div className="py-12 sm:py-16 space-y-16">
      {/* Header Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-xl">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-semibold uppercase tracking-widest text-gold-400">
              Sustainable Infrastructure
            </span>
            <h1 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight text-white">
              Capital Projects &amp; Civil Works
            </h1>
            <p className="text-base sm:text-lg text-emerald-200/90 leading-relaxed">
              Permanent community assets delivering generational education, clean drinking water, and vocational independence.
            </p>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-xl transition-all duration-300 group"
            >
              {/* Cover Image */}
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                <img
                  src={proj.coverImageUrl}
                  alt={proj.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                    proj.status === 'Completed'
                      ? 'bg-emerald-800 text-emerald-100'
                      : 'bg-gold-500 text-emerald-950'
                  }`}>
                    {proj.status}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{proj.location}</span>
                  </div>
                  <h3 className="font-serif font-bold text-lg text-slate-900 leading-snug">
                    {proj.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed">
                    {proj.summary}
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-900">{proj.raised} Raised</span>
                    <span className="text-slate-500">Budget: {proj.budget}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-700 rounded-full"
                      style={{ width: `${proj.progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>{proj.progress}% Completed</span>
                    <span>{proj.beneficiaries.toLocaleString('en-IN')} Beneficiaries</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href={`/donate?cause=${encodeURIComponent(proj.slug)}&title=${encodeURIComponent(proj.title)}`}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-gold-300 hover:text-white font-semibold text-xs text-center flex items-center justify-center gap-2 transition-colors"
                  >
                    <Heart className="w-3.5 h-3.5 fill-gold-400 text-gold-400" />
                    <span>Contribute to Project</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
