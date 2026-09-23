import React from 'react';
import { getCmsPage } from '@/lib/cms/content-service';
import { constructMetadata } from '@/lib/seo/metadata';
import { Eye, Globe2, Sparkles, CheckCircle2 } from 'lucide-react';

export const metadata = constructMetadata({
  title: 'Accessibility Statement (WCAG 2.1 AAA) | Imam E Mahdi Foundation',
  description:
    'Our universal accessibility statement outlining WCAG 2.1 compliance, high-contrast support, and screen reader compatibility.',
  path: '/accessibility',
});

export default async function AccessibilityPage() {
  const page = await getCmsPage('accessibility');

  const accessibilityFeatures = [
    {
      title: 'Perceivable & High Contrast',
      desc: 'All interface text and graphics adhere to AAA 7:1 contrast ratios for low-vision donors and elder community members.',
    },
    {
      title: 'Operable via Keyboard',
      desc: 'Full keyboard navigation with visible focus indicators, skip-to-content anchors, and accessible modal traps.',
    },
    {
      title: 'Understandable Semantics',
      desc: 'Semantic HTML5 landmark tags, ARIA labels on all interactive calculators, and predictable focus management.',
    },
    {
      title: 'Robust & Device Agnostic',
      desc: 'Full responsive fidelity across desktop, tablet, and mobile with zero layout disruption on 200% zoom scaling.',
    },
  ];

  return (
    <div className="py-12 sm:py-16 space-y-16">
      {/* Header Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-xl">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-semibold uppercase tracking-widest text-gold-400">
              Universal Digital Access
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

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div
          className="prose prose-slate max-w-none text-slate-700 leading-relaxed space-y-4 [&>h2]:font-serif [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-slate-900 [&>h3]:font-serif [&>h3]:text-xl [&>h3]:font-bold [&>h3]:text-slate-800 [&>ul]:list-disc [&>ul]:pl-5 [&>ul>li]:mt-1"
          dangerouslySetInnerHTML={{ __html: page.contentHtml }}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-200">
          {accessibilityFeatures.map((item, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2"
            >
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 text-gold-500" />
                <h4>{item.title}</h4>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-6">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
