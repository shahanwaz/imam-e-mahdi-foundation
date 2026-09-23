import React from 'react';
import Link from 'next/link';
import { getCmsReports, getCmsPage } from '@/lib/cms/content-service';
import { constructMetadata } from '@/lib/seo/metadata';
import { ReportDownloadButton } from '@/components/public/ReportDownloadButton';
import { FileText, Download, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

export const metadata = constructMetadata({
  title: 'Annual Audited Reports & Financial Statements | IMF-DOS',
  description:
    'Download official audited financial statements, Form 10B audit reports, and annual impact disclosures of the Imam E Mahdi Foundation.',
  path: '/reports',
});

export default async function ReportsPage() {
  const [page, reports] = await Promise.all([
    getCmsPage('reports'),
    getCmsReports(),
  ]);

  return (
    <div className="py-12 sm:py-16 space-y-16">
      {/* Header Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-xl">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-semibold uppercase tracking-widest text-gold-400">
              Statutory Disclosures
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

      {/* Reports List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
          Audited Annual Dossiers
        </h2>

        <div className="space-y-4">
          {reports.map((rep) => (
            <div
              key={rep.id}
              className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow"
            >
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold">
                    {rep.year}
                  </span>
                  {rep.isAudited && (
                    <span className="px-3 py-1 rounded-full bg-gold-100 text-gold-900 text-xs font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-gold-700" />
                      Statutory CA Audited
                    </span>
                  )}
                </div>

                <h3 className="font-serif font-bold text-lg sm:text-xl text-slate-900">
                  {rep.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {rep.summary}
                </p>
                <p className="text-[11px] text-slate-500 font-medium">
                  Auditor of Record: {rep.auditor}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <ReportDownloadButton
                  title={rep.title}
                  fileSize={rep.fileSize}
                  fileUrl={(rep as any).fileUrl}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
