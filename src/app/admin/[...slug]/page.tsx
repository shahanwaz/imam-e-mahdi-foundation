import React from 'react';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Layers, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface ModulePageProps {
  params: Promise<{ slug: string[] }>;
}

const MODULE_TITLES: Record<string, { title: string; desc: string; phase: string }> = {
  campaigns: {
    title: 'Campaigns & Crowdfunding Management',
    desc: 'Manage active humanitarian appeals, Zakat/Sadaqah targets, and donor storytelling.',
    phase: 'Phase 2 Milestone',
  },
  donations: {
    title: 'Donations & 80G Receipts Management',
    desc: 'Double-entry donation ledger, automated 80G tax receipt generation, and payment gateway webhooks.',
    phase: 'Phase 2 Milestone',
  },
  donors: {
    title: 'Donor CRM & Giving History',
    desc: 'Comprehensive donor directory, giving frequency, and automated impact dispatch updates.',
    phase: 'Phase 2 Milestone',
  },
  beneficiaries: {
    title: 'Beneficiary Registry & Need Assessment',
    desc: 'Biometric/Aadhaar deduplication, socio-economic vulnerability index scoring (1-100), and DBT aid tracking.',
    phase: 'Phase 3 Milestone',
  },
  projects: {
    title: 'Projects & Monitoring & Evaluation (M&E)',
    desc: 'Project lifecycle management, milestone tracking, and budget vs actuals variance monitoring.',
    phase: 'Phase 3 Milestone',
  },
  events: {
    title: 'Event Management & Gate Pass Scanner',
    desc: 'Coordination of medical camps, seminars, food drives, and high-speed QR gate check-in.',
    phase: 'Phase 3 Milestone',
  },
  volunteers: {
    title: 'Volunteer Force & Service Records',
    desc: 'Volunteer onboarding, skill profiling, service hours verification, and digital photo ID generation.',
    phase: 'Phase 3 Milestone',
  },
  members: {
    title: 'General Body & Life Member Register',
    desc: 'Trust governance, annual dues renewal, KYC document approval, and AGM resolutions.',
    phase: 'Phase 3 Milestone',
  },
  finance: {
    title: 'Finance, Accounts & General Ledger',
    desc: 'Double-entry accounting, Payment/Receipt/Journal vouchers, and automated Balance Sheet generation.',
    phase: 'Phase 4 Milestone',
  },
  hr: {
    title: 'Human Resources & Payroll (HRMS)',
    desc: 'Staff directory, geo-tagged mobile attendance check-in, leave approval, and monthly salary registers.',
    phase: 'Phase 4 Milestone',
  },
  communication: {
    title: 'Multi-Channel Communications Hub',
    desc: 'Broadcasts via WhatsApp Business API, transactional SMS, and SES newsletter composer.',
    phase: 'Phase 5 Milestone',
  },
  compliance: {
    title: 'Compliance, Legal & Document Vault',
    desc: 'Centralized repository for 12AB, 80G, FCRA, CSR-1, Trust Deeds, and automated expiry alerts.',
    phase: 'Phase 4 Milestone',
  },
  users: {
    title: 'Staff Directory & User Management',
    desc: 'Manage staff accounts, assign standardized roles, and control access permissions.',
    phase: 'Foundation Active',
  },
  roles: {
    title: 'Role-Based Access Control (RBAC) Matrix',
    desc: 'Configure atomic permissions across all 10 system roles.',
    phase: 'Foundation Active',
  },
  'audit-logs': {
    title: 'Immutable Audit Trail Ledger',
    desc: 'Forensic change data capture with SHA-256 rolling hash tamper-evident verification.',
    phase: 'Foundation Active',
  },
  'ai-tools': {
    title: 'AI Intelligence & OCR Automation',
    desc: 'Bank receipt OCR extraction, AI duplicate beneficiary matcher, and appeal letter drafter.',
    phase: 'Phase 5 Milestone',
  },
};

export default async function GenericAdminModulePage(props: ModulePageProps) {
  const { slug } = await props.params;
  const primarySlug = slug[0] || 'module';
  const info = MODULE_TITLES[primarySlug] || {
    title: primarySlug.replace(/-/g, ' ').toUpperCase(),
    desc: 'Module shell ready for domain-specific implementation.',
    phase: 'Planned Milestone',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold font-display text-emerald-950 tracking-tight">
              {info.title}
            </h1>
            <Badge variant="gold" size="sm">
              {info.phase}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">{info.desc}</p>
        </div>

        <Link href="/admin/dashboard">
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
            Back to Dashboard
          </Button>
        </Link>
      </div>

      {/* Empty State Content Shell */}
      <EmptyState
        title={`${info.title} Shell Active`}
        description="This module shell is configured with the Noor Design System, server-side RBAC guardrails, and audit logging. Downstream business logic will be integrated in its designated milestone."
        icon={<Layers className="w-6 h-6 text-emerald-800" />}
        action={
          <Link href="/admin/dashboard">
            <Button variant="primary" size="sm">
              Return to Command Center
            </Button>
          </Link>
        }
      />
    </div>
  );
}
