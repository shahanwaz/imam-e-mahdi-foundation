import React from 'react';
import Link from 'next/link';
import { HeroBanner } from '@/components/public/HeroBanner';
import { ZakatCalculatorWidget } from '@/components/public/ZakatCalculatorWidget';
import { CauseGrid } from '@/components/public/CauseGrid';
import { ImpactCounterSection } from '@/components/public/ImpactCounterSection';
import { StoryCarousel } from '@/components/public/StoryCarousel';
import { PublicFaqAccordion } from '@/components/public/PublicFaqAccordion';
import { 
  getCmsPrograms, 
  getCmsCampaigns, 
  getCmsStories, 
  getCmsFaqs, 
  getCmsImpactMetrics 
} from '@/lib/cms/content-service';
import { constructMetadata } from '@/lib/seo/metadata';
import { 
  Heart, 
  BookOpen, 
  Activity, 
  Droplet, 
  ShieldCheck, 
  ArrowRight, 
  Users, 
  Sparkles 
} from 'lucide-react';

export const metadata = constructMetadata({
  title: 'Global Humanitarian Foundation | 100% Zakat Isolation & Direct Aid',
  description:
    'Imam E Mahdi Foundation is a registered Section 8 non-profit organization (CIN: U88900DC2026NPL474906) dedicated to orphan empowerment, merit scholarships, critical healthcare, and clean water with radical transparency.',
  path: '/',
});

export default async function PublicHomePage() {
  const [programs, campaigns, stories, faqs, impactMetrics] = await Promise.all([
    getCmsPrograms(),
    getCmsCampaigns(),
    getCmsStories(),
    getCmsFaqs(),
    getCmsImpactMetrics(),
  ]);

  return (
    <div className="space-y-0">
      {/* 1. Hero Section with Photographic Banner */}
      <HeroBanner />

      {/* 2. Core Pillars / Programs Highlights */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#063B2E] font-sans">
              Systemic Humanitarian Upliftment
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#17201C]">
              Our Core Programmatic Pillars
            </h2>
            <p className="text-sm sm:text-base text-[#64706A] leading-relaxed">
              Every initiative is engineered for long-term sustainability, intergenerational empowerment, and unconditional preservation of human dignity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {programs.map((p) => (
              <div
                key={p.id}
                className="p-6 rounded-2xl bg-[#FCFBF7] border border-[#E5E7E2] hover:border-[#063B2E]/50 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-[#EEF5F1] text-[#063B2E] flex items-center justify-center group-hover:bg-[#063B2E] group-hover:text-[#C9A24A] transition-colors">
                    {p.slug.includes('orphan') && <Heart className="w-6 h-6" />}
                    {p.slug.includes('education') && <BookOpen className="w-6 h-6" />}
                    {p.slug.includes('medical') && <Activity className="w-6 h-6" />}
                    {p.slug.includes('water') && <Droplet className="w-6 h-6" />}
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[11px] font-semibold text-[#0B5D46] uppercase tracking-wider">
                      {p.category}
                    </span>
                    <h3 className="text-lg font-serif font-bold text-[#17201C] group-hover:text-[#063B2E] transition-colors">
                      {p.title}
                    </h3>
                    <p className="text-xs text-[#64706A] leading-relaxed">
                      {p.summary}
                    </p>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-[#E5E7E2] flex items-center justify-between">
                  <span className="text-xs text-[#64706A] font-medium">
                    {p.beneficiariesCount.toLocaleString('en-IN')} Beneficiaries
                  </span>
                  <Link
                    href={`/programs#${p.slug}`}
                    className="text-xs font-bold text-[#063B2E] hover:text-[#C9A24A] flex items-center gap-1 transition-colors"
                  >
                    <span>Learn More</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Interactive Zakat & Nisab Calculator Widget */}
      <section className="py-16 sm:py-20 bg-[#F7F5EF] border-y border-[#E5E7E2]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#063B2E] font-sans">
              Sacred Obligation &bull; 100% Theological Isolation
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#17201C]">
              Calculate Your Zakat in 60 Seconds
            </h2>
            <p className="text-sm text-[#64706A]">
              Accurate Nisab thresholds with 100% theological separation into restricted accounts.
            </p>
          </div>

          <ZakatCalculatorWidget />
        </div>
      </section>

      {/* 4. Urgent Causes / Campaigns */}
      <CauseGrid campaigns={campaigns} showViewAll={true} />

      {/* 5. Live Impact Telemetry Counters */}
      <ImpactCounterSection metrics={impactMetrics} />

      {/* 6. Beneficiary Success Stories */}
      <StoryCarousel stories={stories} />

      {/* 7. Searchable FAQ Section */}
      <PublicFaqAccordion faqs={faqs} />

      {/* 8. Bottom Call to Action Banner */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-[#063B2E] via-[#0B5D46] to-[#063B2E] text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C9A24A]/20 text-gold-300 border border-gold-400/30 text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-gold-400" />
            <span>Join Hands to Uplift Humanity</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white leading-tight">
            Be the Light in Someone’s Darkest Hour
          </h2>

          <p className="text-base sm:text-lg text-emerald-100/90 max-w-2xl mx-auto leading-relaxed">
            Your support sponsors orphan tuition, provides lifesaving renal care, and delivers dignified food security to families who need it most.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/donate"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-gold-400 via-amber-500 to-gold-400 hover:from-gold-300 hover:to-amber-400 text-[#063B2E] font-bold text-base shadow-xl shadow-black/20 flex items-center justify-center gap-2"
            >
              <Heart className="w-5 h-5 fill-[#063B2E]" />
              <span>Donate Zakat / Sadaqah</span>
            </Link>
            <Link
              href="/volunteer"
              className="w-full sm:w-auto px-6 py-4 rounded-xl bg-[#063B2E]/60 hover:bg-[#063B2E]/90 text-white font-semibold text-base border border-emerald-500/40 flex items-center justify-center gap-2"
            >
              <Users className="w-4 h-4 text-gold-400" />
              <span>Register as Volunteer</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
