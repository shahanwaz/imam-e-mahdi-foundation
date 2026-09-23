'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Search, HelpCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { FaqCategory } from '@prisma/client';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: FaqCategory;
}

interface PublicFaqAccordionProps {
  faqs: FaqItem[];
  title?: string;
  subtitle?: string;
  showCategoryFilters?: boolean;
}

export function PublicFaqAccordion({
  faqs,
  title = 'Frequently Asked Questions',
  subtitle = 'Find straightforward answers regarding Zakat calculation, 80G receipts, beneficiary audits, and volunteer engagement.',
  showCategoryFilters = true,
}: PublicFaqAccordionProps) {
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [openFaqId, setOpenFaqId] = useState<string | null>(faqs[0]?.id || null);

  const categories = [
    { label: 'All Questions', value: 'ALL' },
    { label: 'Zakat & Khums', value: 'ZAKAT_KHUMS' },
    { label: '80G & Receipts', value: 'DONATIONS_80G' },
    { label: 'Beneficiary Aid', value: 'BENEFICIARY_AID' },
    { label: 'Volunteering', value: 'VOLUNTEERING' },
  ];

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory = activeCategory === 'ALL' || faq.category === activeCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section className="py-12 sm:py-16 bg-[#FCFBF7]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center space-y-3 mb-10">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#063B2E] font-sans">
            Institutional Transparency
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#17201C]">
            {title}
          </h2>
          <p className="text-sm sm:text-base text-[#64706A] max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search questions (e.g. Zakat calculation, receipts, volunteer)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-[#E5E7E2] bg-white focus:outline-none focus:border-[#063B2E] shadow-sm text-sm text-[#17201C] placeholder-slate-400 transition-colors"
          />
        </div>

        {/* Category Pills */}
        {showCategoryFilters && (
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  activeCategory === cat.value
                    ? 'bg-[#063B2E] text-white shadow-sm'
                    : 'bg-white border border-[#E5E7E2] text-[#17201C] hover:bg-[#EEF5F1]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}

        {/* Accordion List */}
        <div className="space-y-3">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-2xl border border-[#E5E7E2] p-8 space-y-2">
              <HelpCircle className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-sm text-[#64706A] font-medium">
                No questions found matching your search.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('ALL');
                }}
                className="text-xs text-[#063B2E] font-semibold hover:underline"
              >
                Reset filters
              </button>
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className="bg-white rounded-2xl border border-[#E5E7E2] shadow-sm overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 focus:outline-none"
                    aria-expanded={isOpen}
                  >
                    <span className="font-serif font-bold text-base sm:text-lg text-[#17201C] leading-snug">
                      {faq.question}
                    </span>
                    <div
                      className={`w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 bg-[#EEF5F1] text-[#063B2E]' : 'text-slate-500'
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-6 pt-1 text-sm text-[#64706A] leading-relaxed border-t border-[#E5E7E2]/60 space-y-3 animate-in fade-in duration-200">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Contact Helpdesk Note */}
        <div className="mt-10 p-6 rounded-2xl bg-[#EEF5F1] border border-[#E5E7E2] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="space-y-1">
            <h4 className="font-serif font-bold text-base text-[#063B2E]">
              Have a specific question not covered here?
            </h4>
            <p className="text-xs text-[#64706A]">
              Our donor relations and Sharia advisory desk is available to assist you.
            </p>
          </div>
          <Link
            href="/contact"
            className="px-5 py-2.5 rounded-xl bg-[#063B2E] hover:bg-[#0B5D46] text-gold-300 font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-colors shrink-0 shadow-sm"
          >
            <span>Ask Our Team</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
