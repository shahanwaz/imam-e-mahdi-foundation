import React from 'react';
import Link from 'next/link';
import { getCmsPage, getCmsImpactMetrics } from '@/lib/cms/content-service';
import { constructMetadata } from '@/lib/seo/metadata';
import { 
  ShieldCheck, 
  Coins, 
  BarChart3, 
  FileCheck2, 
  CheckCircle2, 
  ArrowRight, 
  Lock, 
  QrCode, 
  AlertTriangle 
} from 'lucide-react';

export const metadata = constructMetadata({
  title: 'Radical Transparency & Fund Allocation | Zero-Commingling Ledger',
  description:
    'Explore our verifiable double-entry ledger proofs, 100% Zakat isolation accounting, and cryptographic QR receipt validation.',
  path: '/transparency',
});

export default async function TransparencyPage() {
  const [page, metrics] = await Promise.all([
    getCmsPage('transparency'),
    getCmsImpactMetrics(),
  ]);

  const fundAllocationRatios = [
    {
      fund: 'Zakat al-Mal & Fitrah (2010-ZAKAT)',
      ratio: '100% Direct to Beneficiaries',
      adminCost: '0.00% (Zero Overhead)',
      desc: 'Ring-fenced account disbursed directly for orphan rations, urgent surgeries, and destitute families.',
    },
    {
      fund: 'Khums Sahm-e-Imam & Sadat (2020-KHUMS)',
      ratio: '100% Direct to Eligible Recipients',
      adminCost: '0.00% (Zero Overhead)',
      desc: 'Managed under strict Sharia mandates and direct scholar oversight for impoverished Sadat and religious education.',
    },
    {
      fund: 'Sadaqah & General Relief (1010-SADAQAH)',
      ratio: '92% Program Execution & Relief',
      adminCost: '8% Operational, Logistics & Audit',
      desc: 'Underwrites mobile clinic logistics, medical camp transportation, and statutory compliance filings.',
    },
  ];

  return (
    <div className="py-12 sm:py-16 space-y-16">
      {/* Header Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-xl">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/20 text-gold-300 border border-gold-500/30 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-gold-400" />
              <span>Cryptographic Trust &bull; Public Ledger Telemetry</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight text-white">
              {page.title}
            </h1>
            <p className="text-base sm:text-lg text-emerald-200/90 leading-relaxed">
              {page.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Statutory Unverified Warning Badge */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-xs text-amber-900">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold">STATUTORY AUDIT &amp; LEGAL TRANSPARENCY PROTOCOL:</strong>
            All double-entry general ledger telemetry and fund allocation ratios published below are subject to mandatory annual external audit by accredited Statutory Chartered Accountants.
          </div>
        </div>
      </div>

      {/* Fund Allocation Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-widest text-emerald-800">
            Sacred Trust Accounting
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
            Fund Isolation &amp; Allocation Policies
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {fundAllocationRatios.map((r, idx) => (
            <div
              key={idx}
              className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <span className="text-xs font-bold text-emerald-800 font-mono block">
                  {r.fund}
                </span>
                <h3 className="font-serif font-bold text-xl text-slate-900">
                  {r.ratio}
                </h3>
                <div className="inline-block px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-900 text-xs font-semibold">
                  Admin Overhead: {r.adminCost}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pt-2">
                  {r.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-gold-500" />
                <span>Audited Under General Ledger</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4 Pillars of Cryptographic Trust */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-emerald-800">
            Next-Gen Technology
          </span>
          <h3 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
            How IMF-DOS Eliminates Non-Profit Leakages
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-[#FDFBF7] border border-slate-200 space-y-2">
            <Lock className="w-6 h-6 text-emerald-800" />
            <h4 className="font-serif font-bold text-base text-slate-900">Double-Entry Journals</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every single rupee collected automatically balances in double-entry debits and credits.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#FDFBF7] border border-slate-200 space-y-2">
            <QrCode className="w-6 h-6 text-gold-600" />
            <h4 className="font-serif font-bold text-base text-slate-900">HMAC QR Receipts</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tax receipts contain HMAC-SHA256 signatures that anyone can independently verify.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#FDFBF7] border border-slate-200 space-y-2">
            <FileCheck2 className="w-6 h-6 text-emerald-800" />
            <h4 className="font-serif font-bold text-base text-slate-900">Direct Vendor Settlement</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Direct payments to verified colleges and hospitals prevent cash diversion in the field.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#FDFBF7] border border-slate-200 space-y-2">
            <ShieldCheck className="w-6 h-6 text-gold-600" />
            <h4 className="font-serif font-bold text-base text-slate-900">Audit Trail Chaining</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Admin actions are permanently linked with cryptographic SHA-256 hash chains.
            </p>
          </div>
        </div>

        <div className="pt-8 text-center">
          <Link
            href="/reports"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-gold-300 font-semibold text-xs sm:text-sm transition-colors shadow-md"
          >
            <span>Download Annual Audited Statements (PDF)</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
