import React from 'react';
import { getCmsCampaigns } from '@/lib/cms/content-service';
import { constructMetadata } from '@/lib/seo/metadata';
import { CauseGrid } from '@/components/public/CauseGrid';
import { ZakatCalculatorWidget } from '@/components/public/ZakatCalculatorWidget';
import { ShieldCheck, Heart } from 'lucide-react';

export const metadata = constructMetadata({
  title: 'Urgent Appeals & Campaigns | 100% Zakat Direct Aid',
  description:
    'Contribute to urgent humanitarian campaigns with 100% Zakat fund isolation and instant Section 80G tax benefits.',
  path: '/causes',
});

export default async function CausesPage() {
  const campaigns = await getCmsCampaigns();

  return (
    <div className="py-12 sm:py-16 space-y-16">
      {/* Header Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-xl">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-semibold uppercase tracking-widest text-gold-400">
              Immediate Humanitarian Appeals
            </span>
            <h1 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight text-white">
              Urgent Relief Campaigns
            </h1>
            <p className="text-base sm:text-lg text-emerald-200/90 leading-relaxed">
              Every appeal has a dedicated restricted fund account ensuring complete transparency and zero administrative leakages.
            </p>
          </div>
        </div>
      </div>

      {/* Campaigns Grid */}
      <CauseGrid campaigns={campaigns} showViewAll={false} />

      {/* Embedded Zakat Calculator Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <ZakatCalculatorWidget />
      </div>
    </div>
  );
}
