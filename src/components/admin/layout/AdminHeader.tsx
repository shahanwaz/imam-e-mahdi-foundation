'use client';

import React, { useState } from 'react';
import {
  Menu,
  Search,
  Plus,
  Globe,
  Receipt,
  FolderHeart,
  FileText,
  ChevronDown,
} from 'lucide-react';
import { Breadcrumbs } from './Breadcrumbs';
import { NotificationCenter } from './NotificationCenter';
import { UserMenu } from './UserMenu';
import Link from 'next/link';

interface AdminHeaderProps {
  onToggleSidebar: () => void;
  onOpenSearch: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  onToggleSidebar,
  onOpenSearch,
}) => {
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('EN');
  const [isLangOpen, setIsLangOpen] = useState(false);

  const languages = [
    { code: 'EN', name: 'English', dir: 'ltr' },
    { code: 'UR', name: 'اردو (Urdu)', dir: 'rtl' },
    { code: 'HI', name: 'हिन्दी (Hindi)', dir: 'ltr' },
    { code: 'AR', name: 'العربية (Arabic)', dir: 'rtl' },
  ];

  return (
    <header className="sticky top-0 z-30 glass-header px-4 sm:px-6 py-3 flex items-center justify-between gap-4 select-none">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="p-2 text-slate-600 hover:text-emerald-900 hover:bg-emerald-50 rounded-xl lg:hidden focus:outline-none shrink-0"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0 hidden sm:block">
          <Breadcrumbs />
        </div>
      </div>

      {/* Right: Quick Search, Actions, Language, Notifications, User Menu */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Global Search Bar Trigger */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-3 px-3 py-1.5 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-600 text-xs shadow-soft transition-all focus:outline-none"
        >
          <Search className="w-4 h-4 text-emerald-800 shrink-0" />
          <span className="hidden md:inline font-normal">Search modules, actions...</span>
          <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-slate-500 bg-slate-100 border border-slate-200 rounded">
            ⌘K
          </kbd>
        </button>

        {/* Quick Actions Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsQuickActionOpen(!isQuickActionOpen)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-800 text-white hover:bg-emerald-900 text-xs font-semibold shadow-soft border border-emerald-900/40 transition-all focus:outline-none"
          >
            <Plus className="w-4 h-4 text-gold-300" />
            <span>New</span>
            <ChevronDown className="w-3 h-3 opacity-70 ml-0.5" />
          </button>

          {isQuickActionOpen && (
            <div
              className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-elevated border border-slate-200/90 p-1.5 z-50 animate-in zoom-in-95 duration-150 space-y-0.5 text-xs"
              onMouseLeave={() => setIsQuickActionOpen(false)}
            >
              <Link
                href="/admin/donations"
                onClick={() => setIsQuickActionOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:text-emerald-950 hover:bg-emerald-50 transition-colors"
              >
                <Receipt className="w-4 h-4 text-emerald-700" />
                <span>Record Offline Donation</span>
              </Link>
              <Link
                href="/admin/beneficiaries"
                onClick={() => setIsQuickActionOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:text-emerald-950 hover:bg-emerald-50 transition-colors"
              >
                <FolderHeart className="w-4 h-4 text-amber-700" />
                <span>Register Beneficiary</span>
              </Link>
              <Link
                href="/admin/finance"
                onClick={() => setIsQuickActionOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:text-emerald-950 hover:bg-emerald-50 transition-colors"
              >
                <FileText className="w-4 h-4 text-blue-700" />
                <span>Draft Journal Voucher</span>
              </Link>
            </div>
          )}
        </div>

        {/* Language Selector */}
        <div className="relative">
          <button
            onClick={() => setIsLangOpen(!isLangOpen)}
            className="flex items-center gap-1.5 p-2 text-slate-600 hover:text-emerald-900 hover:bg-emerald-50 rounded-xl transition-colors focus:outline-none text-xs font-semibold"
            aria-label="Change language"
          >
            <Globe className="w-4 h-4 text-emerald-800" />
            <span className="hidden sm:inline font-mono">{currentLang}</span>
          </button>

          {isLangOpen && (
            <div
              className="absolute right-0 mt-2 w-40 bg-white rounded-2xl shadow-elevated border border-slate-200/90 p-1.5 z-50 animate-in zoom-in-95 duration-150 space-y-0.5 text-xs"
              onMouseLeave={() => setIsLangOpen(false)}
            >
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setCurrentLang(lang.code);
                    setIsLangOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors ${
                    currentLang === lang.code
                      ? 'bg-emerald-50 text-emerald-950 font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{lang.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{lang.code}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <NotificationCenter />

        {/* User Menu */}
        <UserMenu />
      </div>
    </header>
  );
};
