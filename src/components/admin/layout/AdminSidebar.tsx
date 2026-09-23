'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  HeartHandshake,
  Receipt,
  Users,
  FolderHeart,
  Briefcase,
  CalendarCheck,
  Award,
  BookOpen,
  DollarSign,
  UserCheck,
  MessageSquare,
  ShieldAlert,
  ShieldCheck,
  Settings,
  Sparkles,
  History,
  Lock,
  Globe,
  ChevronRight,
  X,
} from 'lucide-react';
import { Logo } from '@/components/shared/Logo';

export interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  permission?: string;
  badge?: string | number;
  badgeVariant?: 'gold' | 'emerald' | 'amber';
}

export interface NavGroup {
  category: string;
  items: NavItem[];
}

const NAVIGATION_GROUPS: NavGroup[] = [
  {
    category: 'OVERVIEW',
    items: [
      {
        title: 'Command Center',
        href: '/admin/dashboard',
        icon: <LayoutDashboard className="w-4 h-4" />,
      },
    ],
  },
  {
    category: 'FUNDRAISING & DONORS',
    items: [
      {
        title: 'Campaigns & Appeals',
        href: '/admin/campaigns',
        icon: <HeartHandshake className="w-4 h-4" />,
        permission: 'campaigns:read',
        badge: 'Active',
        badgeVariant: 'emerald',
      },
      {
        title: 'Donations & 80G Receipts',
        href: '/admin/donations',
        icon: <Receipt className="w-4 h-4" />,
        permission: 'donations:read_all',
      },
      {
        title: 'Donor Directory',
        href: '/admin/donors',
        icon: <Users className="w-4 h-4" />,
        permission: 'donations:read_all',
      },
    ],
  },
  {
    category: 'HUMANITARIAN & FIELD',
    items: [
      {
        title: 'Beneficiary Registry',
        href: '/admin/beneficiaries',
        icon: <FolderHeart className="w-4 h-4" />,
        permission: 'beneficiaries:read',
        badge: '12 Pending',
        badgeVariant: 'amber',
      },
      {
        title: 'Projects & M&E',
        href: '/admin/projects',
        icon: <Briefcase className="w-4 h-4" />,
        permission: 'projects:read',
      },
      {
        title: 'Events & Drives',
        href: '/admin/events',
        icon: <CalendarCheck className="w-4 h-4" />,
        permission: 'events:create',
      },
    ],
  },
  {
    category: 'COMMUNITY & NETWORK',
    items: [
      {
        title: 'Volunteer Force',
        href: '/admin/volunteers',
        icon: <Award className="w-4 h-4" />,
        permission: 'volunteers:read',
      },
      {
        title: 'General Body Members',
        href: '/admin/members',
        icon: <BookOpen className="w-4 h-4" />,
        permission: 'members:read_register',
      },
    ],
  },
  {
    category: 'ENTERPRISE ERP',
    items: [
      {
        title: 'Finance & Ledger',
        href: '/admin/finance',
        icon: <DollarSign className="w-4 h-4" />,
        permission: 'finance:view_ledger',
      },
      {
        title: 'HRMS & Payroll',
        href: '/admin/hr',
        icon: <UserCheck className="w-4 h-4" />,
        permission: 'hr:view_employees',
      },
      {
        title: 'Communications',
        href: '/admin/communication',
        icon: <MessageSquare className="w-4 h-4" />,
      },
      {
        title: 'Compliance & Vault',
        href: '/admin/compliance',
        icon: <ShieldAlert className="w-4 h-4" />,
        permission: 'compliance:read_vault',
        badge: 'Review',
        badgeVariant: 'gold',
      },
    ],
  },
  {
    category: 'GOVERNANCE & SYSTEM',
    items: [
      {
        title: 'Staff & Users',
        href: '/admin/users',
        icon: <Users className="w-4 h-4" />,
        permission: 'users:read',
      },
      {
        title: 'Roles & Permissions',
        href: '/admin/roles',
        icon: <Lock className="w-4 h-4" />,
        permission: 'roles:read',
      },
      {
        title: 'Audit Ledger',
        href: '/admin/audit-logs',
        icon: <History className="w-4 h-4" />,
        permission: 'system:view_audit_logs',
      },
      {
        title: 'AI Intelligence Suite',
        href: '/admin/ai-tools',
        icon: <Sparkles className="w-4 h-4" />,
        badge: 'AI',
        badgeVariant: 'gold',
      },
      {
        title: 'Global & i18n Studio',
        href: '/admin/i18n-global',
        icon: <Globe className="w-4 h-4" />,
        badge: 'Global',
        badgeVariant: 'gold',
      },
      {
        title: 'Organization Settings',
        href: '/admin/settings',
        icon: <Settings className="w-4 h-4" />,
        permission: 'system:edit_settings',
      },
    ],
  },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userPermissions?: string[];
  isSuperAdmin?: boolean;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isOpen,
  onClose,
  userPermissions = [],
  isSuperAdmin = true,
}) => {
  const pathname = usePathname();

  const isVisible = (item: NavItem) => {
    if (isSuperAdmin) return true;
    if (!item.permission) return true;
    return userPermissions.includes(item.permission);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-72 bg-emerald-950 text-slate-100 flex flex-col border-r border-emerald-900/60 shadow-elevated transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between p-5 border-b border-emerald-900/80 bg-emerald-950/90">
          <Logo size="sm" variant="white" href="/admin/dashboard" />
          <button
            onClick={onClose}
            className="p-1.5 text-emerald-300 hover:text-white hover:bg-emerald-900/80 rounded-lg lg:hidden focus:outline-none"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Indicator */}
        <div className="px-5 py-2.5 bg-emerald-900/40 border-b border-emerald-900/50 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 text-emerald-300 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>IMF-DOS Operational</span>
          </div>
          <span className="text-[10px] font-mono text-gold-400/80 uppercase">v2.0 Ent</span>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6">
          {NAVIGATION_GROUPS.map((group) => {
            const visibleItems = group.items.filter(isVisible);
            if (visibleItems.length === 0) return null;

            return (
              <div key={group.category} className="space-y-1">
                <p className="px-3 text-[10px] font-bold font-mono tracking-wider text-emerald-400/70 uppercase">
                  {group.category}
                </p>
                <div className="space-y-0.5 mt-1.5">
                  {visibleItems.map((item) => {
                    const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => {
                          if (window.innerWidth < 1024) onClose();
                        }}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 group select-none ${
                          isActive
                            ? 'bg-gradient-to-r from-emerald-800 to-emerald-800/80 text-white font-semibold shadow-soft border border-emerald-700/60'
                            : 'text-emerald-100/70 hover:text-white hover:bg-emerald-900/50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={`shrink-0 transition-colors ${
                              isActive ? 'text-gold-400' : 'text-emerald-400 group-hover:text-gold-300'
                            }`}
                          >
                            {item.icon}
                          </span>
                          <span className="truncate">{item.title}</span>
                        </div>

                        {item.badge && (
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                              item.badgeVariant === 'gold'
                                ? 'bg-gold-500/20 text-gold-300 border border-gold-500/30'
                                : item.badgeVariant === 'amber'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-emerald-700 text-emerald-100'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Security Badge */}
        <div className="p-4 border-t border-emerald-900/80 bg-emerald-950/80">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-emerald-900/50 border border-emerald-800/60">
            <div className="p-1.5 rounded-lg bg-emerald-800 text-gold-400 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold text-emerald-100 truncate">AES-256 Vault Active</p>
              <p className="text-[10px] text-emerald-400/80 truncate">HMAC QR Verification</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
