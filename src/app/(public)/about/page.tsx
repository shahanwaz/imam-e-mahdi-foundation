import React from 'react';
import Link from 'next/link';
import { getCmsPage } from '@/lib/cms/content-service';
import { constructMetadata } from '@/lib/seo/metadata';
import { ShieldCheck, Heart, Users, Award, ArrowRight, BookOpen, Compass } from 'lucide-react';

export const metadata = constructMetadata({
  title: 'About Us | Institutional Heritage & Purpose',
  description:
    'Learn about the history, foundational values, and humanitarian mission of the Imam E Mahdi Foundation.',
  path: '/about',
});

export default async function AboutPage() {
  const page = await getCmsPage('about');

  return (
    <div className="py-12 sm:py-16 space-y-16">
      {/* Header Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-xl">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-semibold uppercase tracking-widest text-gold-400">
              Institutional Heritage
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

      {/* Main Content & Strategic Pillars */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-8">
            <div
              className="prose prose-slate max-w-none text-slate-700 leading-relaxed space-y-4 [&>h2]:font-serif [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-slate-900 [&>h3]:font-serif [&>h3]:text-xl [&>h3]:font-bold [&>h3]:text-slate-800 [&>ul]:list-disc [&>ul]:pl-5 [&>ul>li]:mt-1"
              dangerouslySetInnerHTML={{ __html: page.contentHtml }}
            />

            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-start gap-4">
              <ShieldCheck className="w-6 h-6 text-emerald-700 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs sm:text-sm text-emerald-900">
                <h4 className="font-bold text-emerald-950">Statutory Legal Entity</h4>
                <p>
                  <strong>IMAM MISSION</strong> is the public-facing humanitarian initiative operated by <strong>IMAM E MAHDI FOUNDATION</strong>, incorporated under Section 8 of the Companies Act, 2013 (<span className="font-mono font-semibold">CIN: U88900DC2026NPL474906</span>).
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar Quick Links */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="font-serif font-bold text-lg text-slate-900 border-b border-slate-100 pb-3">
                Organizational Structure
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/vision-mission" className="flex items-center justify-between text-slate-700 hover:text-emerald-800 font-medium py-1">
                    <span>Vision &amp; Core Values</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </li>
                <li>
                  <Link href="/leadership" className="flex items-center justify-between text-slate-700 hover:text-emerald-800 font-medium py-1">
                    <span>Board of Trustees</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </li>
                <li>
                  <Link href="/governance" className="flex items-center justify-between text-slate-700 hover:text-emerald-800 font-medium py-1">
                    <span>Governance Charter &amp; Bylaws</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </li>
                <li>
                  <Link href="/transparency" className="flex items-center justify-between text-slate-700 hover:text-emerald-800 font-medium py-1">
                    <span>Financial Transparency &amp; Ledger</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </li>
              </ul>
            </div>

            {/* Quick Giving Box */}
            <div className="bg-gradient-to-br from-emerald-950 to-emerald-900 rounded-2xl p-6 text-white space-y-4 shadow-lg">
              <Heart className="w-8 h-8 text-gold-400 fill-gold-400" />
              <h4 className="font-serif font-bold text-lg text-white">
                Support Our Humanitarian Mission
              </h4>
              <p className="text-xs text-emerald-200/90 leading-relaxed">
                Your Zakat and Sadaqah sustain orphan stipends and critical medical relief across hundreds of families.
              </p>
              <Link
                href="/donate"
                className="block text-center py-2.5 px-4 rounded-xl bg-gold-500 hover:bg-gold-400 text-emerald-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-md"
              >
                Donate Online
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
