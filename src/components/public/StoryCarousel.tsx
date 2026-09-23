'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Quote, CheckCircle2, ChevronLeft, ChevronRight, ArrowRight, MapPin } from 'lucide-react';

export interface StoryItem {
  id: string;
  slug: string;
  beneficiaryName: string;
  category: string;
  title: string;
  summary: string;
  quote?: string | null;
  coverImageUrl?: string | null;
  location?: string | null;
}

interface StoryCarouselProps {
  stories: StoryItem[];
  title?: string;
  subtitle?: string;
}

export function StoryCarousel({
  stories,
  title = 'Voices of Hope & Dignity',
  subtitle = 'Real human journeys made possible through sacred trust, scholarship sponsorship, and direct medical relief.',
}: StoryCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!stories || stories.length === 0) return null;

  const current = stories[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % stories.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + stories.length) % stories.length);
  };

  return (
    <section className="py-16 bg-[#F7F5EF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-[#063B2E] font-sans block mb-1">
              Transformative Journeys
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#17201C]">
              {title}
            </h2>
            <p className="text-sm sm:text-base text-[#64706A] mt-2 max-w-2xl">
              {subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              aria-label="Previous Story"
              className="p-2.5 rounded-xl border border-[#E5E7E2] bg-white hover:bg-[#EEF5F1] text-[#17201C] transition-colors shadow-sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              aria-label="Next Story"
              className="p-2.5 rounded-xl border border-[#E5E7E2] bg-white hover:bg-[#EEF5F1] text-[#17201C] transition-colors shadow-sm"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Story Card */}
        <div className="bg-white rounded-3xl border border-[#E5E7E2] shadow-md overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Image Side */}
          <div className="lg:col-span-5 relative aspect-[4/3] lg:aspect-auto min-h-[320px] bg-slate-100">
            <img
              src={current.coverImageUrl || 'https://images.unsplash.com/photo-1594824813589-9804e38c7efc?auto=format&fit=crop&w=800&q=80'}
              alt={current.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 rounded-full bg-[#063B2E]/90 backdrop-blur-md text-gold-300 text-xs font-semibold">
                {current.category}
              </span>
            </div>
          </div>

          {/* Text Content */}
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs text-[#64706A] font-medium">
                <span>Beneficiary: {current.beneficiaryName}</span>
                {current.location && (
                  <>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#063B2E]" />
                      {current.location}
                    </span>
                  </>
                )}
                <span>&bull;</span>
                <span className="text-[#063B2E] font-semibold">Verified Case</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#17201C] leading-snug">
                {current.title}
              </h3>

              {current.quote && (
                <div className="p-4 rounded-xl bg-[#EEF5F1] border border-[#E5E7E2] text-[#063B2E] italic text-sm relative">
                  <Quote className="w-6 h-6 text-[#0B5D46]/30 absolute top-2 right-2 opacity-40" />
                  &ldquo;{current.quote}&rdquo;
                </div>
              )}

              <p className="text-sm text-[#64706A] leading-relaxed">
                {current.summary}
              </p>
            </div>

            <div className="pt-4 border-t border-[#E5E7E2] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#063B2E] bg-[#EEF5F1] px-3 py-1.5 rounded-lg w-max">
                <CheckCircle2 className="w-4 h-4 text-[#063B2E] shrink-0" />
                <span>Audited Case Study</span>
              </div>

              <Link
                href="/stories"
                className="text-xs sm:text-sm font-semibold text-[#063B2E] hover:text-[#C9A24A] flex items-center gap-1 transition-colors self-end sm:self-auto"
              >
                <span>Read All Stories</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
