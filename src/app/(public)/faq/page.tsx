import React from 'react';
import { getCmsFaqs, getCmsPage } from '@/lib/cms/content-service';
import { constructMetadata } from '@/lib/seo/metadata';
import { PublicFaqAccordion } from '@/components/public/PublicFaqAccordion';
import { ZakatCalculatorWidget } from '@/components/public/ZakatCalculatorWidget';

export const metadata = constructMetadata({
  title: 'Frequently Asked Questions (FAQ) | Imam E Mahdi Foundation',
  description:
    'Clear answers on Zakat isolation, statutory compliance, beneficiary verification, and volunteer engagement.',
  path: '/faq',
});

export default async function FaqPage() {
  const [page, faqs] = await Promise.all([
    getCmsPage('faq'),
    getCmsFaqs(),
  ]);

  return (
    <div className="py-12 sm:py-16 space-y-16">
      {/* Header Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-xl">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-semibold uppercase tracking-widest text-gold-400">
              Knowledge Base
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

      {/* Accordion */}
      <PublicFaqAccordion faqs={faqs} />
    </div>
  );
}
