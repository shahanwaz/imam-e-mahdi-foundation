import React from 'react';
import Link from 'next/link';
import { getCmsPage } from '@/lib/cms/content-service';
import { constructMetadata } from '@/lib/seo/metadata';
import { FileText, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

export const metadata = constructMetadata({
  title: 'Governance & Bylaws | Trust Accountability Matrix',
  description:
    'Review the governance charter, trust deed bylaws, conflict of interest policies, and statutory oversight frameworks of the Imam E Mahdi Foundation.',
  path: '/governance',
});

export default async function GovernancePage() {
  const page = await getCmsPage('governance');

  const governancePolicies = [
    {
      title: 'Zakat & Religious Funds Ring-Fencing Policy',
      desc: 'Strict prohibition of commingling Zakat, Khums, and Sadaqah with administrative or operational expenditure. 100% direct disbursement to verified beneficiaries.',
    },
    {
      title: 'Anti-Bribery, Anti-Corruption & Ethical Procurement',
      desc: 'Zero-tolerance framework governing vendor tenders, competitive quotations, and dual-signatory authorization above ₹ 50,000 threshold.',
    },
    {
      title: 'Whistleblower Protection & Grievance Redressal',
      desc: 'Direct confidential reporting channel to the independent Audit Committee Chair with absolute immunity for bona fide informants.',
    },
    {
      title: 'Data Privacy & Beneficiary Dignity Charter',
      desc: 'Confidentiality of beneficiary personal identities in accordance with the Digital Personal Data Protection Act (2023) and AES-256 storage standards.',
    },
  ];

  return (
    <div className="py-12 sm:py-16 space-y-16">
      {/* Header Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-xl">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-semibold uppercase tracking-widest text-gold-400">
              Institutional Accountability
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Core Bylaws Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-6">
            <div
              className="prose prose-slate max-w-none text-slate-700 leading-relaxed space-y-4 [&>h2]:font-serif [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-slate-900 [&>h3]:font-serif [&>h3]:text-xl [&>h3]:font-bold [&>h3]:text-slate-800 [&>ul]:list-disc [&>ul]:pl-5 [&>ul>li]:mt-1"
              dangerouslySetInnerHTML={{ __html: page.contentHtml }}
            />
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="p-6 rounded-2xl bg-[#FDFBF7] border border-slate-200 space-y-4">
              <h4 className="font-serif font-bold text-base text-slate-900 border-b border-slate-200 pb-2">
                Legal &amp; Statutory Registry
              </h4>
              <ul className="space-y-3 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Section 8 Not-for-Profit Company (Companies Act, 2013)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>CIN: <strong>U88900DC2026NPL474906</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Public Brand: <strong>IMAM MISSION</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Double-Entry Transparent General Ledger</span>
                </li>
              </ul>
              <div className="pt-2">
                <Link
                  href="/reports"
                  className="block text-center py-2 px-3 rounded-xl bg-emerald-900 text-gold-300 text-xs font-semibold hover:bg-emerald-800 transition-colors"
                >
                  Download Audited Returns
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Policy Tiles */}
        <div className="space-y-6 pt-6 border-t border-slate-200">
          <h3 className="font-serif font-bold text-2xl text-slate-900">
            Institutional Policy Frameworks
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {governancePolicies.map((p, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2 hover:border-emerald-700/60 transition-colors"
              >
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                  <ShieldCheck className="w-4 h-4 text-gold-500" />
                  <h4>{p.title}</h4>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-6">
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
