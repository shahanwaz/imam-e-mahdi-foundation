import React from 'react';
import Link from 'next/link';
import { getCmsArticles } from '@/lib/cms/content-service';
import { constructMetadata } from '@/lib/seo/metadata';
import { Newspaper, Calendar, Clock, User, ArrowRight } from 'lucide-react';

export const metadata = constructMetadata({
  title: 'News & Press Dispatches | Imam E Mahdi Foundation',
  description:
    'Latest humanitarian dispatches, field relief announcements, medical camp schedules, and press releases.',
  path: '/news',
});

export default async function NewsPage() {
  const newsArticles = await getCmsArticles('NEWS');

  return (
    <div className="py-12 sm:py-16 space-y-16">
      {/* Header Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-xl">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-semibold uppercase tracking-widest text-gold-400">
              Field Dispatches
            </span>
            <h1 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight text-white">
              News &amp; Field Announcements
            </h1>
            <p className="text-base sm:text-lg text-emerald-200/90 leading-relaxed">
              Real-time updates directly from our relief logistics hubs, emergency camps, and program centers.
            </p>
          </div>
        </div>
      </div>

      {/* News Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {newsArticles.map((article) => (
            <article
              key={article.id}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-xl transition-all duration-300 group"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                <img
                  src={article.coverImageUrl || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80'}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(article.publishedAt || Date.now()).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {article.readingMinutes} min read
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-lg text-slate-900 leading-snug group-hover:text-emerald-900 transition-colors">
                    {article.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed">
                    {article.summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">By {article.authorName}</span>
                  <span className="font-bold text-emerald-800 flex items-center gap-1">
                    Read Dispatch <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
