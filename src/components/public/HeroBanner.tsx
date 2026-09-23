'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Heart, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  Users, 
  Award, 
  CheckCircle2 
} from 'lucide-react';

interface HeroBannerProps {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaHref?: string;
}

export function HeroBanner({
  title = 'Serving Humanity With Sacred Trust & Uncompromising Transparency',
  subtitle = 'A global humanitarian trust delivering dignified healthcare, orphan sponsorships, higher education grants, and emergency relief with 100% theological Zakat isolation.',
  ctaText = 'Donate Zakat / Sadaqah',
  ctaHref = '/donate',
}: HeroBannerProps) {
  return (
    <div className="relative w-full overflow-hidden bg-[#063B2E] text-white">
      {/* Full-Width Photographic Background Layer */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/hero-banner.jpg"
          alt="Indian Humanitarian Assistance and Community Empowerment"
          className="w-full h-full object-cover object-[center_right] md:object-center select-none"
        />

        {/* Deep Forest Green Gradient Overlay - Stronger on left text side (~rgba(6,59,46,0.85) to 0.78), soft & luminous towards image side */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#063B2E]/95 via-[#063B2E]/82 to-[#063B2E]/35 sm:via-[#063B2E]/78 sm:to-transparent" />
        <div className="absolute inset-0 bg-[#063B2E]/20 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#063B2E]/80 via-transparent to-black/20" />
      </div>

      {/* Hero Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
        <div className="max-w-2xl lg:max-w-3xl space-y-6 text-left">
          {/* Trust Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#063B2E]/85 border border-gold-400/40 text-gold-300 text-xs sm:text-sm font-medium shadow-md backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-gold-400 shrink-0" />
            <span>Registered Section 8 Non-Profit &bull; CIN: U88900DC2026NPL474906</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-white leading-[1.18] sm:leading-[1.15] drop-shadow-sm">
            {title}
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-emerald-100/95 leading-relaxed max-w-2xl font-normal drop-shadow-sm">
            {subtitle}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
            <Link
              href={ctaHref}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-gold-400 via-amber-500 to-gold-400 hover:from-gold-300 hover:to-amber-400 text-[#063B2E] font-bold text-base shadow-xl shadow-black/25 flex items-center justify-center gap-2.5 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Heart className="w-5 h-5 fill-[#063B2E] text-[#063B2E]" />
              <span>{ctaText}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/programs"
              className="w-full sm:w-auto px-6 py-4 rounded-xl bg-[#063B2E]/75 hover:bg-[#063B2E]/95 text-white font-semibold text-base border border-emerald-400/30 flex items-center justify-center gap-2 backdrop-blur-md transition-colors"
            >
              <span>Explore Programs</span>
            </Link>

            <Link
              href="/volunteer"
              className="w-full sm:w-auto px-6 py-4 rounded-xl bg-[#063B2E]/40 hover:bg-[#063B2E]/70 text-emerald-100 hover:text-white font-medium text-base border border-emerald-500/30 flex items-center justify-center gap-2 backdrop-blur-md transition-colors"
            >
              <Users className="w-4 h-4 text-gold-400" />
              <span>Volunteer</span>
            </Link>
          </div>

          {/* Quick Trust Badges */}
          <div className="pt-8 border-t border-emerald-400/25 flex flex-wrap items-center gap-x-8 gap-y-3 text-xs sm:text-sm text-emerald-200 font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-gold-400 shrink-0" />
              <span>100% Zakat Policy</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-gold-400 shrink-0" />
              <span>Cryptographic QR Receipts</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-gold-400 shrink-0" />
              <span>Audited Beneficiaries</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
