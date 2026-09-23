import React from 'react';
import Link from 'next/link';
import { getCmsPage } from '@/lib/cms/content-service';
import { constructMetadata } from '@/lib/seo/metadata';
import { Compass, Target, HeartHandshake, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';

export const metadata = constructMetadata({
  title: 'Vision, Mission & Values | Institutional Ethos',
  description:
    'Discover our strategic vision, mission charter, and the theological values guiding our global humanitarian interventions.',
  path: '/vision-mission',
});

export default async function VisionMissionPage() {
  const page = await getCmsPage('vision-mission');

  const coreValues = [
    {
      title: 'Amanah (Sacred Trust)',
      arabic: 'أمانة',
      desc: 'Absolute stewardship over donor resources and beneficiary trust, ensuring zero diversion and zero commingling.',
    },
    {
      title: 'Ihsan (Excellence)',
      arabic: 'إحسان',
      desc: 'Uncompromising standard of excellence in medical care, scholarship disbursement, and financial reporting.',
    },
    {
      title: 'Karamah (Human Dignity)',
      arabic: 'كرامة',
      desc: 'Preserving the self-respect and dignity of every recipient through confidential direct aid and respectful delivery.',
    },
    {
      title: 'Shifafiyah (Radical Transparency)',
      arabic: 'شفافية',
      desc: 'Publicly verifiable general ledger telemetry, double-entry accounting, and instant cryptographic QR receipts.',
    },
  ];

  return (
    <div className="py-12 sm:py-16 space-y-16">
      {/* Header Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-xl">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-semibold uppercase tracking-widest text-gold-400">
              Ethical Compass
            </span>
            <h1 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight text-white">
              {page.title}
            </h1>
            <p className="text-base sm:text-lg text-emerald-200/90 leading-relaxed">
              {page.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Vision & Mission Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-md space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-900 flex items-center justify-center">
              <Compass className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-slate-900">Our Vision</h2>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
              A just, compassionate world inspired by the divine teachings of the Ahlulbayt (a.s.), where no child is deprived of education, no family sleeps in hunger, and every human life is valued with unconditional dignity.
            </p>
          </div>

          <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-md space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-gold-100 text-gold-700 flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-slate-900">Our Mission</h2>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
              To mobilize ethical philanthropy, deploy transparent technology, and execute sustainable grass-roots interventions in healthcare, education, livelihood generation, and disaster relief.
            </p>
          </div>
        </div>

        {/* 4 Core Pillars Values Grid */}
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-emerald-800">
              Foundational Values
            </span>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
              Guiding Principles in Action
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreValues.map((val, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-[#FDFBF7] border border-slate-200/80 hover:border-emerald-700/60 transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gold-600 font-serif">0{idx + 1}</span>
                  <span className="text-sm font-serif font-bold text-emerald-900">{val.arabic}</span>
                </div>
                <h4 className="font-serif font-bold text-base text-slate-900">{val.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
