'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Command,
  LayoutDashboard,
  Receipt,
  FolderHeart,
  Briefcase,
  DollarSign,
  UserCheck,
  ShieldAlert,
  Settings,
  User,
  PlusCircle,
  FileText,
  X,
  ArrowRight,
} from 'lucide-react';

interface SearchItem {
  id: string;
  title: string;
  category: string;
  href: string;
  icon: React.ReactNode;
  shortcut?: string;
}

const SEARCH_DATABASE: SearchItem[] = [
  // Modules
  { id: '1', title: 'Command Center Dashboard', category: 'Modules', href: '/admin/dashboard', icon: <LayoutDashboard className="w-4 h-4 text-emerald-700" /> },
  { id: '2', title: 'Donations & 80G Tax Receipts', category: 'Modules', href: '/admin/donations', icon: <Receipt className="w-4 h-4 text-emerald-700" /> },
  { id: '3', title: 'Beneficiary Registry & Need Assessment', category: 'Modules', href: '/admin/beneficiaries', icon: <FolderHeart className="w-4 h-4 text-emerald-700" /> },
  { id: '4', title: 'Projects & Program Management', category: 'Modules', href: '/admin/projects', icon: <Briefcase className="w-4 h-4 text-emerald-700" /> },
  { id: '5', title: 'Finance, Vouchers & General Ledger', category: 'Modules', href: '/admin/finance', icon: <DollarSign className="w-4 h-4 text-emerald-700" /> },
  { id: '6', title: 'HRMS Staff & Monthly Payroll', category: 'Modules', href: '/admin/hr', icon: <UserCheck className="w-4 h-4 text-emerald-700" /> },
  { id: '7', title: 'Compliance & Statutory Document Vault', category: 'Modules', href: '/admin/compliance', icon: <ShieldAlert className="w-4 h-4 text-emerald-700" /> },
  { id: '8', title: 'Organization Settings', category: 'Modules', href: '/admin/settings', icon: <Settings className="w-4 h-4 text-emerald-700" /> },
  { id: '9', title: 'My Profile & 2FA Security', category: 'Account', href: '/admin/profile', icon: <User className="w-4 h-4 text-emerald-700" /> },
  
  // Quick Actions
  { id: '10', title: 'Record New Offline Donation / Zakat', category: 'Quick Actions', href: '/admin/donations', icon: <PlusCircle className="w-4 h-4 text-gold-600" /> },
  { id: '11', title: 'Register New Beneficiary Household', category: 'Quick Actions', href: '/admin/beneficiaries', icon: <PlusCircle className="w-4 h-4 text-gold-600" /> },
  { id: '12', title: 'Draft Financial Journal Voucher', category: 'Quick Actions', href: '/admin/finance', icon: <FileText className="w-4 h-4 text-gold-600" /> },
  { id: '13', title: 'Upload Statutory Filing to Vault', category: 'Quick Actions', href: '/admin/compliance', icon: <FileText className="w-4 h-4 text-gold-600" /> },
];

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filteredItems = SEARCH_DATABASE.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (item: SearchItem) => {
    router.push(item.href);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 pt-20">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Search Palette Container */}
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-elevated border border-slate-200 overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 bg-surface-bg/40">
          <Search className="w-5 h-5 text-emerald-800 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command, module, or task..."
            className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-slate-600 rounded">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-100 border border-slate-200 rounded">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-slate-100/60">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No results found for &ldquo;<span className="text-slate-600 font-semibold">{query}</span>&rdquo;
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const isSelected = selectedIndex === index;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-emerald-50 text-emerald-950 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-white border border-slate-200/80 shadow-soft shrink-0">
                      {item.icon}
                    </div>
                    <div className="flex flex-col">
                      <span>{item.title}</span>
                      <span className="text-[10px] text-slate-400 font-normal">{item.category}</span>
                    </div>
                  </div>
                  <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-700' : 'text-slate-300'}`} />
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-50/80 border-t border-slate-100 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span>Navigation:</span>
            <kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded text-[9px]">↑</kbd>
            <kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded text-[9px]">↓</kbd>
            <kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded text-[9px]">↵</kbd>
          </div>
          <span className="font-mono text-[10px] text-emerald-800">IMF-DOS Search</span>
        </div>
      </div>
    </div>
  );
};
