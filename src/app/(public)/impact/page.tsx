import React from 'react';
import Link from 'next/link';
import { getCmsImpactMetrics, getCmsPage } from '@/lib/cms/content-service';
import { constructMetadata } from '@/lib/seo/metadata';
import { ImpactCounterSection } from '@/components/public/ImpactCounterSection';
import { ShieldCheck, BarChart3, Users, Award, ArrowRight, CheckCircle2 } from 'lucide-react';

export const metadata = constructMetadata({
  title: 'Humanitarian Impact Telemetry | Audited Beneficiaries',
  description:
    'Explore verified impact telemetry, state-wise outreach maps, audited beneficiary data, and fund utilization reports.',
  path: '/impact',
});

export default async function ImpactPage() {
  const [page, impactMetrics] = await Promise.all([
    getCmsPage('impact'),
    getCmsImpactMetrics(),
  ]);

  return (
    <div className="py-12 sm:py-16 space-y-16">
      {/* Header Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-xl">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-semibold uppercase tracking-widest text-gold-400">
              Verified Outcomes
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

      {/* Embedded Live Counters */}
      <ImpactCounterSection metrics={impactMetrics} />

      {/* Programmatic Breakdown */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-emerald-800">
            Field Verification Methodology
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
            How We Ensure Accountability
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold">
              1
            </div>
            <h3 className="font-serif font-bold text-lg text-slate-900">
              Biometric &amp; ID Hashing
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Confidential Aadhaar and KYC identity hashing prevents duplicate beneficiary enrollments across district desks.
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-gold-100 text-gold-800 flex items-center justify-center font-bold">
              2
            </div>
            <h3 className="font-serif font-bold text-lg text-slate-900">
              Direct Vendor Payments
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Medical and tuition fees are disbursed directly to accredited hospitals and universities, eliminating middlemen.
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold">
              3
            </div>
            <h3 className="font-serif font-bold text-lg text-slate-900">
              Post-Disbursement Audit
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Independent CA teams randomly audit 15% of all field disbursements annually with surprise site visits.
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/transparency"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-gold-300 font-semibold text-xs sm:text-sm transition-colors shadow-md"
          >
            <span>View Complete Transparency &amp; Fund Ratios</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
