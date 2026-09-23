'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  ShieldCheck,
  Settings,
  History,
  LogOut,
  ChevronDown,
  Lock,
} from 'lucide-react';

interface UserMenuProps {
  user?: {
    name: string;
    email: string;
    role: string;
    twoFactorEnabled?: boolean;
    avatarUrl?: string;
  };
}

export const UserMenu: React.FC<UserMenuProps> = ({
  user = {
    name: 'Master Administrator',
    email: 'admin@imf-foundation.org',
    role: 'Super Administrator',
    twoFactorEnabled: true,
  },
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
      router.push('/login');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-1.5 pl-2 rounded-xl border border-slate-200/80 bg-white hover:bg-emerald-50/40 transition-all focus:outline-none shadow-soft select-none"
        aria-label="User navigation menu"
      >
        {/* Avatar */}
        <div className="w-7 h-7 rounded-lg bg-emerald-800 text-gold-300 font-bold text-xs flex items-center justify-center border border-emerald-700/60 shadow-sm shrink-0">
          {getInitials(user.name)}
        </div>

        {/* User text (Desktop) */}
        <div className="hidden sm:flex flex-col text-left">
          <span className="text-xs font-bold text-emerald-950 truncate max-w-[130px] leading-tight">
            {user.name}
          </span>
          <span className="text-[10px] text-slate-500 font-medium truncate max-w-[130px]">
            {user.role}
          </span>
        </div>

        <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-elevated border border-slate-200/90 overflow-hidden z-50 animate-in zoom-in-95 duration-150 divide-y divide-slate-100">
          {/* Header */}
          <div className="p-4 bg-surface-bg/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-800 text-gold-300 font-bold text-sm flex items-center justify-center border border-emerald-700/60 shadow-sm shrink-0">
                {getInitials(user.name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-emerald-950 truncate">{user.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
                  <ShieldCheck className="w-3 h-3 text-emerald-700" />
                  <span>{user.role}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="p-1.5 space-y-0.5 text-xs">
            <Link
              href="/admin/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:text-emerald-950 hover:bg-emerald-50 transition-colors"
            >
              <User className="w-4 h-4 text-emerald-700" />
              <span>My Profile &amp; Credentials</span>
            </Link>

            <Link
              href="/admin/profile#mfa"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-xl text-slate-700 hover:text-emerald-950 hover:bg-emerald-50 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Lock className="w-4 h-4 text-gold-600" />
                <span>2FA Multi-Factor Auth</span>
              </div>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${user.twoFactorEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                {user.twoFactorEnabled ? 'Active' : 'Setup'}
              </span>
            </Link>

            <Link
              href="/admin/audit-logs"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:text-emerald-950 hover:bg-emerald-50 transition-colors"
            >
              <History className="w-4 h-4 text-emerald-700" />
              <span>Audit Change Ledger</span>
            </Link>

            <Link
              href="/admin/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:text-emerald-950 hover:bg-emerald-50 transition-colors"
            >
              <Settings className="w-4 h-4 text-emerald-700" />
              <span>Organization Settings</span>
            </Link>
          </div>

          {/* Logout */}
          <div className="p-1.5">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors text-left focus:outline-none disabled:opacity-50"
            >
              <LogOut className="w-4 h-4 text-red-600" />
              <span>{isLoggingOut ? 'Signing out...' : 'Sign Out of IMF-DOS'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
