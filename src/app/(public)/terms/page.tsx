import React from 'react';
import { getCmsPage } from '@/lib/cms/content-service';
import { constructMetadata } from '@/lib/seo/metadata';
import { FileText, ShieldCheck } from 'lucide-react';

export const metadata = constructMetadata({
  title: 'Terms of Giving & Donor Charter | Imam E Mahdi Foundation',
  description:
    'Review the legal terms, refund guidelines, 80G tax receipt policies, and donor rights charter.',
  path: '/terms',
});

export default async function TermsPage() {
  const page = await getCmsPage('terms');

  return (
    <div className="py-12 sm:py-16 space-y-16">
      {/* Header Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-xl">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-semibold uppercase tracking-widest text-gold-400">
              Legal Charter
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div
          className="prose prose-slate max-w-none text-slate-700 leading-relaxed space-y-4 [&>h2]:font-serif [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-slate-900 [&>h3]:font-serif [&>h3]:text-xl [&>h3]:font-bold [&>h3]:text-slate-800 [&>ul]:list-disc [&>ul]:pl-5 [&>ul>li]:mt-1"
          dangerouslySetInnerHTML={{ __html: page.contentHtml }}
        />
      </div>
    </div>
  );
}
