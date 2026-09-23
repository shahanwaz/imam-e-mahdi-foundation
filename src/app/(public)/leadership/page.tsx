import React from 'react';
import Link from 'next/link';
import { getCmsLeadership, getCmsPage } from '@/lib/cms/content-service';
import { constructMetadata } from '@/lib/seo/metadata';
import { ShieldCheck, Award, ArrowRight } from 'lucide-react';

export const metadata = constructMetadata({
  title: 'Board of Trustees & Leadership | Imam E Mahdi Foundation',
  description:
    'Meet the scholars, chartered accountants, and developmental leaders serving on the Board of Trustees of the Imam E Mahdi Foundation.',
  path: '/leadership',
});

export default async function LeadershipPage() {
  const [page, leaders] = await Promise.all([
    getCmsPage('leadership'),
    getCmsLeadership(),
  ]);

  return (
    <div className="py-12 sm:py-16 space-y-16">
      {/* Header Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-xl">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-semibold uppercase tracking-widest text-gold-400">
              Institutional Governance
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

      {/* Leadership Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {leaders.map((leader, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-xl transition-all duration-300 group"
            >
              <div className="relative aspect-square overflow-hidden bg-slate-100">
                <img
                  src={leader.avatarUrl}
                  alt={leader.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">
                    {leader.role}
                  </span>
                  <h3 className="font-serif font-bold text-lg text-slate-900">
                    {leader.name}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed pt-1">
                    {leader.bio}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-slate-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-gold-500" />
                  <span>Honorary Board Service</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Governance Commitment */}
        <div className="mt-16 p-8 rounded-3xl bg-emerald-50 border border-emerald-100 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h4 className="font-serif font-bold text-lg text-emerald-950">
              Zero Executive Compensation for Trustees
            </h4>
            <p className="text-xs sm:text-sm text-emerald-800">
              All Board Trustees serve strictly in an honorary capacity without drawing salaries, allowances, or financial benefits from public donations.
            </p>
          </div>
          <Link
            href="/governance"
            className="px-6 py-3 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-gold-300 font-semibold text-xs sm:text-sm flex items-center gap-2 transition-colors shrink-0 shadow-sm"
          >
            <span>Read Governance Charter</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
