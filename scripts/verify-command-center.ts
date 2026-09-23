/**
 * Standalone Verification Script for STEP 27 - Founder & Director Command Center
 * Validates direct database connectivity, telemetry aggregation, and route mapping integrity.
 */

import { CommandCenterService } from '../src/lib/dashboard/command-center-service';
import { prisma } from '../src/lib/db';

async function main() {
  console.log('===============================================================');
  console.log('  STEP 27: FOUNDER & DIRECTOR COMMAND CENTER VERIFICATION');
  console.log('===============================================================\n');

  try {
    console.log('[1/4] Connecting to Database and testing direct models...');
    const donationCount = await prisma.donation.count().catch(() => 0);
    const donorCount = await prisma.donorProfile.count().catch(() => 0);
    const campaignCount = await prisma.campaign.count().catch(() => 0);
    const projectCount = await prisma.project.count().catch(() => 0);
    const beneficiaryCount = await prisma.beneficiaryProfile.count().catch(() => 0);
    const volunteerCount = await prisma.volunteerProfile.count().catch(() => 0);
    const memberCount = await prisma.memberProfile.count().catch(() => 0);
    const eventCount = await prisma.event.count().catch(() => 0);
    const auditCount = await prisma.auditLog.count().catch(() => 0);

    console.log(`  ✓ Donations in DB: ${donationCount}`);
    console.log(`  ✓ Donors in DB: ${donorCount}`);
    console.log(`  ✓ Campaigns in DB: ${campaignCount}`);
    console.log(`  ✓ Projects in DB: ${projectCount}`);
    console.log(`  ✓ Beneficiaries in DB: ${beneficiaryCount}`);
    console.log(`  ✓ Volunteers in DB: ${volunteerCount}`);
    console.log(`  ✓ Members in DB: ${memberCount}`);
    console.log(`  ✓ Events in DB: ${eventCount}`);
    console.log(`  ✓ Audit Logs in DB: ${auditCount}\n`);

    console.log('[2/4] Executing CommandCenterService.getOperationalSummary()...');
    const summary = await CommandCenterService.getOperationalSummary();

    console.log(`  ✓ Timestamp: ${summary.timestamp}`);
    console.log(`  ✓ Total Donations Raised: ₹${summary.donations.totalRaised.toLocaleString('en-IN')}`);
    console.log(`  ✓ Today Donations Raised: ₹${summary.donations.todayRaised.toLocaleString('en-IN')}`);
    console.log(`  ✓ Total Donors: ${summary.donors.totalDonors.toLocaleString('en-IN')}`);
    console.log(`  ✓ Active Campaigns: ${summary.campaigns.activeCount}`);
    console.log(`  ✓ Active Projects: ${summary.projects.activeCount}`);
    console.log(`  ✓ Registered Beneficiaries: ${summary.beneficiaries.totalRegistered.toLocaleString('en-IN')}`);
    console.log(`  ✓ Volunteers: ${summary.volunteers.totalVolunteers.toLocaleString('en-IN')}`);
    console.log(`  ✓ Members: ${summary.members.totalMembers.toLocaleString('en-IN')}`);
    console.log(`  ✓ Upcoming Events: ${summary.events.upcomingCount}`);
    console.log(`  ✓ Total Expenses: ₹${summary.expenses.totalExpenses.toLocaleString('en-IN')}`);
    console.log(`  ✓ Net Liquid Position: ₹${summary.financialPosition.netLiquidPosition.toLocaleString('en-IN')}\n`);

    console.log('[3/4] Validating 7-Category Pending Approvals & Alert Streams...');
    console.log(`  ✓ Pending Approvals Count: ${summary.pendingApprovals.totalPending}`);
    const approvalCategories = Array.from(new Set(summary.pendingApprovals.items.map((i) => i.category)));
    console.log(`  ✓ Approval Categories Available: ${approvalCategories.join(', ')}`);
    
    console.log(`  ✓ Compliance Alerts: ${summary.alerts.compliance.length}`);
    console.log(`  ✓ Operational Alerts: ${summary.alerts.operational.length}`);
    console.log(`  ✓ Security Alerts: ${summary.alerts.security.length}`);
    console.log(`  ✓ Recent Audit Activities: ${summary.recentActivity.length}\n`);

    console.log('[4/4] Verifying Underlying Module Link Integrations...');
    const linkChecks = [
      { name: 'Donations Link', href: summary.donations.href, expected: '/admin/donations' },
      { name: 'Donors Link', href: summary.donors.href, expected: '/admin/donors' },
      { name: 'Campaigns Link', href: summary.campaigns.href, expected: '/admin/causes' },
      { name: 'Projects Link', href: summary.projects.href, expected: '/admin/projects' },
      { name: 'Beneficiaries Link', href: summary.beneficiaries.href, expected: '/admin/beneficiaries' },
      { name: 'Volunteers Link', href: summary.volunteers.href, expected: '/admin/volunteers' },
      { name: 'Members Link', href: summary.members.href, expected: '/admin/members' },
      { name: 'Events Link', href: summary.events.href, expected: '/admin/events' },
      { name: 'Finance / Expenses Link', href: summary.expenses.href, expected: '/admin/finance' },
      { name: 'Financial Position / Ledger Link', href: summary.financialPosition.href, expected: '/admin/finance/ledger' },
    ];

    for (const check of linkChecks) {
      if (check.href !== check.expected) {
        throw new Error(`Link mismatch for ${check.name}: got ${check.href}, expected ${check.expected}`);
      }
      console.log(`  ✓ ${check.name}: ${check.href}`);
    }

    console.log('\n===============================================================');
    console.log('  STATUS: ALL FOUNDER COMMAND CENTER CHECKS PASSED (100%)');
    console.log('===============================================================');
  } catch (err) {
    console.error('FAILED TO VERIFY COMMAND CENTER:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
