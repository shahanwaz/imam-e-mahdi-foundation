'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, Users, Clock, ShieldCheck, ArrowRight } from 'lucide-react';

interface CampaignItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  targetAmount: number;
  raisedAmount: number;
  donorsCount: number;
  daysLeft: number;
  isZakatEligible: boolean;
  summary: string;
  coverImageUrl: string;
}

interface CauseGridProps {
  campaigns: CampaignItem[];
  title?: string;
  subtitle?: string;
  showViewAll?: boolean;
}

export function CauseGrid({
  campaigns,
  title = 'Urgent Humanitarian Appeals',
  subtitle = 'Your contributions reach vetted beneficiaries directly with 100% theological isolation and verified transparency.',
  showViewAll = true,
}: CauseGridProps) {
  return (
    <section className="py-12 sm:py-16 bg-[#FCFBF7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-[#063B2E] font-sans block mb-1">
              Direct Aid Mobilization
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#17201C]">
              {title}
            </h2>
            <p className="text-sm sm:text-base text-[#64706A] mt-2 max-w-2xl">
              {subtitle}
            </p>
          </div>
          {showViewAll && (
            <Link
              href="/causes"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#063B2E] hover:text-[#0B5D46] transition-colors shrink-0 group"
            >
              <span>View All Appeals</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {campaigns.map((item) => {
            const percentage = Math.min(100, Math.round((item.raisedAmount / item.targetAmount) * 100));

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-[#E5E7E2] shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group"
              >
                {/* Image & Badges */}
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                  <img
                    src={item.coverImageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span className="px-2.5 py-1 rounded-md bg-[#063B2E]/90 backdrop-blur-md text-emerald-100 text-[11px] font-semibold">
                      {item.category}
                    </span>
                    {item.isZakatEligible && (
                      <span className="px-2.5 py-1 rounded-md bg-gold-500 text-[#063B2E] text-[11px] font-bold shadow-sm flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Zakat 100%
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-serif font-bold text-lg text-[#17201C] group-hover:text-[#063B2E] transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#64706A] line-clamp-2 leading-relaxed">
                      {item.summary}
                    </p>
                  </div>

                  {/* Funding Progress Bar */}
                  <div className="space-y-2 pt-2 border-t border-[#E5E7E2]/60">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#17201C]">
                        ₹ {item.raisedAmount.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[#64706A]">
                        Goal: ₹ {item.targetAmount.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="w-full h-2.5 bg-[#EEF5F1] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#063B2E] to-gold-500 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#64706A] pt-1">
                      <span className="flex items-center gap-1 font-medium text-[#063B2E]">
                        {percentage}% Funded
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-[#64706A]" />
                        {item.donorsCount} Donors
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#64706A]" />
                        {item.daysLeft} Days Left
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2">
                    <Link
                      href={`/donate?cause=${encodeURIComponent(item.slug)}&title=${encodeURIComponent(item.title)}`}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#063B2E] hover:bg-[#0B5D46] text-gold-300 hover:text-white font-semibold text-xs sm:text-sm text-center flex items-center justify-center gap-2 transition-colors shadow-sm"
                    >
                      <Heart className="w-3.5 h-3.5 fill-gold-400 text-gold-400" />
                      <span>Donate to This Cause</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
