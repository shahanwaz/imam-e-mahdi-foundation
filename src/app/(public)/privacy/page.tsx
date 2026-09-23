import React from 'react';
import { getCmsPage } from '@/lib/cms/content-service';
import { constructMetadata } from '@/lib/seo/metadata';
import { Lock, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const metadata = constructMetadata({
  title: 'Privacy & Data Protection Policy | DPDP & AES-256 Encryption',
  description:
    'Review how the Imam E Mahdi Foundation encrypts, protects, and handles personal donor and beneficiary information.',
  path: '/privacy',
});

export default async function PrivacyPage() {
  const page = await getCmsPage('privacy');

  return (
    <div className="py-12 sm:py-16 space-y-16">
      {/* Header Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-xl">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-semibold uppercase tracking-widest text-gold-400">
              Data Protection &amp; Confidentiality
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
        <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-start gap-4">
          <Lock className="w-6 h-6 text-emerald-700 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs sm:text-sm text-emerald-950">
            <strong className="block">DPDP Act (2023) Compliance Framework:</strong>
            All beneficiary KYC data (Aadhaar hash, Bank accounts) and donor tax identifiers (PAN, Passport) are encrypted at rest using AES-256-GCM. We never monetize, share, or sell donor information.
          </div>
        </div>

        <div
          className="prose prose-slate max-w-none text-slate-700 leading-relaxed space-y-4 [&>h2]:font-serif [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-slate-900 [&>h3]:font-serif [&>h3]:text-xl [&>h3]:font-bold [&>h3]:text-slate-800 [&>ul]:list-disc [&>ul]:pl-5 [&>ul>li]:mt-1"
          dangerouslySetInnerHTML={{ __html: page.contentHtml }}
        />
      </div>
    </div>
  );
}
