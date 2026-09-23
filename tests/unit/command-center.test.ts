import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CommandCenterService, CommandCenterData } from '@/lib/dashboard/command-center-service';

// Mock Prisma client for unit testing
vi.mock('@/lib/db', () => {
  return {
    prisma: {
      donation: {
        aggregate: vi.fn().mockResolvedValue({ _sum: { amount: 8450000 } }),
        count: vi.fn().mockResolvedValue(4210),
      },
      donorProfile: {
        count: vi.fn().mockResolvedValue(3420),
      },
      campaign: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'cmp-01',
            title: 'Winter Ration Kits & Blanket Relief 2026',
            raisedAmount: 2250000,
            targetAmount: 2500000,
            category: { name: 'Emergency Relief' },
          },
          {
            id: 'cmp-02',
            title: 'Orphan Higher Education & STEM Scholarship Fund',
            raisedAmount: 1420000,
            targetAmount: 2000000,
            category: { name: 'Education' },
          },
        ]),
      },
      project: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'PRJ-2026-001',
            title: 'Solar Deep Aquifer Borewell Hub - Sitapur',
            allocatedBudgetINR: 1200000,
            disbursedAmountINR: 890000,
            progressPercent: 74,
          },
        ]),
      },
      beneficiaryProfile: {
        count: vi.fn().mockResolvedValue(14820),
      },
      volunteerProfile: {
        count: vi.fn().mockResolvedValue(1250),
      },
      memberProfile: {
        count: vi.fn().mockResolvedValue(840),
      },
      event: {
        count: vi.fn().mockResolvedValue(6),
      },
      expenseRecord: {
        aggregate: vi.fn().mockResolvedValue({ _sum: { amount: 6240000 } }),
      },
      auditLog: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'aud-01',
            action: 'DONATION_VERIFIED',
            entity: 'Donation',
            entityId: 'DON-2026-0891',
            user: { email: 'finance@imammission.org' },
            createdAt: new Date(),
          },
        ]),
      },
    },
  };
});

describe('Founder & Director Command Center Unit Tests (STEP 27)', () => {
  let summary: CommandCenterData;

  beforeEach(async () => {
    summary = await CommandCenterService.getOperationalSummary();
  });

  it('should aggregate donation telemetry with valid numbers and module link', () => {
    expect(summary.donations).toBeDefined();
    expect(summary.donations.totalRaised).toBeGreaterThan(0);
    expect(summary.donations.todayRaised).toBeGreaterThanOrEqual(0);
    expect(summary.donations.zakatTotal).toBeGreaterThan(0);
    expect(summary.donations.sadaqahTotal).toBeGreaterThan(0);
    expect(summary.donations.donationCount).toBeGreaterThan(0);
    expect(summary.donations.href).toBe('/admin/donations');
  });

  it('should aggregate donor analytics with valid metrics and module link', () => {
    expect(summary.donors).toBeDefined();
    expect(summary.donors.totalDonors).toBeGreaterThan(0);
    expect(summary.donors.newToday).toBeGreaterThanOrEqual(0);
    expect(summary.donors.activeRecurring).toBeGreaterThan(0);
    expect(summary.donors.href).toBe('/admin/donors');
  });

  it('should aggregate campaigns data with active breakdown and module link', () => {
    expect(summary.campaigns).toBeDefined();
    expect(summary.campaigns.activeCount).toBeGreaterThan(0);
    expect(summary.campaigns.totalTarget).toBeGreaterThan(0);
    expect(summary.campaigns.totalRaised).toBeGreaterThan(0);
    expect(summary.campaigns.topCampaigns.length).toBeGreaterThan(0);
    expect(summary.campaigns.href).toBe('/admin/causes');

    const first = summary.campaigns.topCampaigns[0];
    expect(first.title).toBeDefined();
    expect(first.percentage).toBeGreaterThanOrEqual(0);
    expect(first.percentage).toBeLessThanOrEqual(100);
  });

  it('should aggregate projects data with budget, spent, and milestone progress', () => {
    expect(summary.projects).toBeDefined();
    expect(summary.projects.activeCount).toBeGreaterThan(0);
    expect(summary.projects.totalBudget).toBeGreaterThan(0);
    expect(summary.projects.totalSpent).toBeGreaterThan(0);
    expect(summary.projects.activeProjectsList.length).toBeGreaterThan(0);
    expect(summary.projects.href).toBe('/admin/projects');

    const first = summary.projects.activeProjectsList[0];
    expect(first.title).toBeDefined();
    expect(first.progressPct).toBeGreaterThanOrEqual(0);
  });

  it('should aggregate beneficiaries, volunteers, members, and events with links', () => {
    // Beneficiaries
    expect(summary.beneficiaries.totalRegistered).toBeGreaterThan(0);
    expect(summary.beneficiaries.verifiedCount).toBeGreaterThan(0);
    expect(summary.beneficiaries.href).toBe('/admin/beneficiaries');

    // Volunteers
    expect(summary.volunteers.totalVolunteers).toBeGreaterThan(0);
    expect(summary.volunteers.activeCount).toBeGreaterThan(0);
    expect(summary.volunteers.href).toBe('/admin/volunteers');

    // Members
    expect(summary.members.totalMembers).toBeGreaterThan(0);
    expect(summary.members.activeCount).toBeGreaterThan(0);
    expect(summary.members.href).toBe('/admin/members');

    // Events
    expect(summary.events.upcomingCount).toBeGreaterThan(0);
    expect(summary.events.href).toBe('/admin/events');
  });

  it('should aggregate financial position and expense controls with ledger links', () => {
    expect(summary.expenses.totalExpenses).toBeGreaterThan(0);
    expect(summary.expenses.programBurnPct).toBeGreaterThan(90);
    expect(summary.expenses.href).toBe('/admin/finance');

    expect(summary.financialPosition.bankBalance).toBeGreaterThan(0);
    expect(summary.financialPosition.zakatReserve).toBeGreaterThan(0);
    expect(summary.financialPosition.sadaqahReserve).toBeGreaterThan(0);
    expect(summary.financialPosition.netLiquidPosition).toBeGreaterThan(0);
    expect(summary.financialPosition.href).toBe('/admin/finance/ledger');
  });

  it('should provide complete 7-category pending approvals workflow', () => {
    expect(summary.pendingApprovals.totalPending).toBeGreaterThan(0);
    expect(summary.pendingApprovals.items.length).toBeGreaterThan(0);

    const categories = new Set(summary.pendingApprovals.items.map((i) => i.category));
    expect(categories.has('DONATIONS')).toBe(true);
    expect(categories.has('EXPENSES')).toBe(true);
    expect(categories.has('PROJECTS')).toBe(true);
    expect(categories.has('BENEFICIARIES')).toBe(true);
    expect(categories.has('CONTENT')).toBe(true);
    expect(categories.has('HR')).toBe(true);
    expect(categories.has('DOCUMENTS')).toBe(true);

    summary.pendingApprovals.items.forEach((item) => {
      expect(item.id).toBeDefined();
      expect(item.title).toBeDefined();
      expect(item.targetHref).toMatch(/^\/admin\//);
      expect(['HIGH', 'MEDIUM', 'LOW']).toContain(item.urgency);
    });
  });

  it('should provide compliance, operational, and security alert monitors with routes', () => {
    expect(summary.alerts.compliance.length).toBeGreaterThan(0);
    summary.alerts.compliance.forEach((alt) => {
      expect(alt.targetHref).toMatch(/^\/admin\//);
      expect(['CRITICAL', 'WARNING']).toContain(alt.severity);
    });

    expect(summary.alerts.operational.length).toBeGreaterThan(0);
    summary.alerts.operational.forEach((alt) => {
      expect(alt.targetHref).toMatch(/^\/admin\//);
      expect(['CRITICAL', 'WARNING', 'INFO']).toContain(alt.severity);
    });

    expect(summary.alerts.security.length).toBeGreaterThan(0);
    summary.alerts.security.forEach((alt) => {
      expect(alt.targetHref).toMatch(/^\/admin\//);
      expect(['CRITICAL', 'WARNING', 'INFO']).toContain(alt.severity);
    });
  });

  it('should provide recent audit log activity stream linking to audit logs', () => {
    expect(summary.recentActivity.length).toBeGreaterThan(0);
    summary.recentActivity.forEach((act) => {
      expect(act.action).toBeDefined();
      expect(act.entity).toBeDefined();
      expect(act.href).toBe('/admin/audit-logs');
    });
  });
});
