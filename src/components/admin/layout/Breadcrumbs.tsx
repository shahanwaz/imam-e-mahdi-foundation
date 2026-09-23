'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

const ROUTE_NAME_MAP: Record<string, string> = {
  admin: 'Admin',
  dashboard: 'Command Center',
  campaigns: 'Campaigns & Appeals',
  donations: 'Donations & 80G Receipts',
  donors: 'Donor Directory',
  beneficiaries: 'Beneficiary Registry',
  projects: 'Projects & Programs',
  events: 'Events & Drives',
  volunteers: 'Volunteer Force',
  members: 'General Body Members',
  finance: 'Finance & Accounts',
  hr: 'HRMS & Payroll',
  communication: 'Communications Hub',
  compliance: 'Compliance Vault',
  users: 'Staff & Users',
  roles: 'Roles & Permissions',
  'audit-logs': 'Audit Ledger',
  'ai-tools': 'AI Intelligence Suite',
  settings: 'Organization Settings',
  profile: 'My Profile & Security',
};

export const Breadcrumbs: React.FC = () => {
  const pathname = usePathname() || '/admin/dashboard';
  const segments = pathname.split('/').filter(Boolean);

  let currentPath = '';

  return (
    <nav className="flex items-center gap-1.5 text-xs text-slate-500 overflow-x-auto py-1" aria-label="Breadcrumb">
      <Link
        href="/admin/dashboard"
        className="flex items-center gap-1 text-slate-500 hover:text-emerald-800 transition-colors shrink-0"
      >
        <Home className="w-3.5 h-3.5 text-slate-400" />
        <span className="sr-only">Home</span>
      </Link>

      {segments.map((segment, index) => {
        currentPath += `/${segment}`;
        const isLast = index === segments.length - 1;
        const displayName = ROUTE_NAME_MAP[segment] || segment.replace(/-/g, ' ');

        return (
          <React.Fragment key={currentPath}>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            {isLast ? (
              <span className="font-semibold text-emerald-950 capitalize truncate max-w-[200px]" aria-current="page">
                {displayName}
              </span>
            ) : (
              <Link
                href={currentPath}
                className="hover:text-emerald-800 transition-colors capitalize truncate max-w-[150px]"
              >
                {displayName}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
