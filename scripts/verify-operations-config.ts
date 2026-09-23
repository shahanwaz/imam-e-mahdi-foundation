/**
 * STEP 26 — NGO Operational Setup Verification Script
 * Validates the operational setup across Organization, Programs, Roles, and Workflows.
 */

import { NGO_OPERATIONAL_CONFIG } from '../src/lib/operations/operational-config';

interface OperationalCheckResult {
  section: string;
  item: string;
  passed: boolean;
  details: string;
}

export async function runOperationalConfigVerification(): Promise<{
  allPassed: boolean;
  results: OperationalCheckResult[];
}> {
  console.log('========================================================================================');
  console.log('            IMAM E MAHDI FOUNDATION — NGO OPERATIONAL SETUP AUDIT                       ');
  console.log('========================================================================================');
  console.log(`  Legal Entity:  ${NGO_OPERATIONAL_CONFIG.organization.legalEntityName}`);
  console.log(`  Structure:     ${NGO_OPERATIONAL_CONFIG.organization.legalEntityType}`);
  console.log(`  CIN:           ${NGO_OPERATIONAL_CONFIG.organization.cin}`);
  console.log(`  Public Brand:  ${NGO_OPERATIONAL_CONFIG.organization.publicBrandName}`);
  console.log('----------------------------------------------------------------------------------------\n');

  const results: OperationalCheckResult[] = [];

  // 1. Organization Checks
  const org = NGO_OPERATIONAL_CONFIG.organization;
  results.push({
    section: 'ORGANIZATION',
    item: 'Legal Identity & CIN Verification',
    passed: org.legalEntityName === 'IMAM E MAHDI FOUNDATION' && org.cin === 'CIN: U88900DC2026NPL474906',
    details: `${org.legalEntityName} (${org.cin})`,
  });

  results.push({
    section: 'ORGANIZATION',
    item: 'Mission & Vision Declarations',
    passed: Boolean(org.mission && org.vision && org.coreValues.length >= 4),
    details: `Mission (${org.mission.length} chars), Vision (${org.vision.length} chars), 4 Core Values.`,
  });

  results.push({
    section: 'ORGANIZATION',
    item: 'Departmental Structure (9 Departments)',
    passed: org.departments.length === 9,
    details: `${org.departments.length} departments registered (${org.departments.map((d) => d.code).join(', ')})`,
  });

  results.push({
    section: 'ORGANIZATION',
    item: 'Locations Registry (6 Centers)',
    passed: org.locations.length >= 6,
    details: `${org.locations.length} centers (HQ, Lucknow, Varanasi, London, Houston, Dubai)`,
  });

  results.push({
    section: 'ORGANIZATION',
    item: 'Contact Information Structure',
    passed: Boolean(org.contactInformation.primaryEmail.endsWith('@imammission.org') && org.contactInformation.primaryPhone),
    details: `Email: ${org.contactInformation.primaryEmail}, Phone: ${org.contactInformation.primaryPhone}`,
  });

  // 2. Programs Checks (5 Core Strategic Pillars)
  const requiredPrograms = [
    'Education & Scholarships',
    'Healthcare Assistance',
    'Community Welfare',
    'Humanitarian Relief',
    'Livelihood & Empowerment',
  ];

  for (const progName of requiredPrograms) {
    const found = NGO_OPERATIONAL_CONFIG.programs.find((p) => p.title.toLowerCase() === progName.toLowerCase());
    results.push({
      section: 'PROGRAMS',
      item: `Program: ${progName}`,
      passed: Boolean(found && found.subInitiatives.length >= 3 && found.kpiMetrics.length >= 2),
      details: found
        ? `Code: ${found.code}, ${found.subInitiatives.length} initiatives, ${found.kpiMetrics.length} KPIs`
        : 'Missing program definition',
    });
  }

  // 3. Roles Checks (10 Operational Roles)
  const requiredRoles = [
    { key: 'SUPER_ADMIN', title: 'Super Admin' },
    { key: 'DIRECTOR', title: 'Director / Management' },
    { key: 'FINANCE', title: 'Finance & Accounts' },
    { key: 'HR', title: 'Human Resources & Volunteer Admin' },
    { key: 'PROJECTS', title: 'Projects & Program Management' },
    { key: 'FIELD_OPS', title: 'Field Operations & Beneficiary Welfare' },
    { key: 'VOLUNTEERS', title: 'Volunteers & Field Assistants' },
    { key: 'CONTENT', title: 'Content & Media Communications' },
    { key: 'COMPLIANCE', title: 'Statutory Compliance & Legal' },
    { key: 'AUDITOR', title: 'Auditor & Independent Oversight' },
  ];

  for (const rDef of requiredRoles) {
    const found = NGO_OPERATIONAL_CONFIG.roles.find((r) => r.roleKey === rDef.key);
    results.push({
      section: 'ROLES',
      item: `Role: ${rDef.title}`,
      passed: Boolean(found && found.coreResponsibilities.length >= 3 && found.approvalPermissions.length >= 3),
      details: found
        ? `Key: ${found.roleKey} (Authority: ${found.authorityLevel}, ${found.approvalPermissions.length} perms)`
        : 'Missing role definition',
    });
  }

  // 4. Workflows Checks (8 Standard Workflows)
  const requiredWorkflows = [
    { key: 'DONATION', name: 'Donation Approval' },
    { key: 'EXPENSE', name: 'Expense Approval' },
    { key: 'PROJECT', name: 'Project Approval' },
    { key: 'BENEFICIARY', name: 'Beneficiary Approval' },
    { key: 'VOLUNTEER', name: 'Volunteer Approval' },
    { key: 'CONTENT', name: 'Content Publishing' },
    { key: 'DOCUMENT', name: 'Document Approval' },
    { key: 'FINANCIAL', name: 'Financial Reconciliation' },
  ];

  for (const wf of requiredWorkflows) {
    const found = NGO_OPERATIONAL_CONFIG.workflows.find((w) => w.workflowKey.includes(wf.key));
    results.push({
      section: 'WORKFLOWS',
      item: `Workflow: ${wf.name}`,
      passed: Boolean(found && found.stages.length >= 3 && found.auditRequirement),
      details: found
        ? `${found.title} (${found.stages.length} stages, Responsible: ${found.stages[0]?.responsibleRole})`
        : 'Missing workflow definition',
    });
  }

  // Print results
  results.forEach((r, idx) => {
    const num = (idx + 1).toString().padStart(2, '0');
    const symbol = r.passed ? '✓ [PASS]' : '✗ [FAIL]';
    console.log(`${symbol} ${num}. [${r.section}] ${r.item.padEnd(46)} -> ${r.details}`);
  });

  const allPassed = results.every((r) => r.passed);
  console.log('\n----------------------------------------------------------------------------------------');
  console.log(`  OPERATIONAL AUDIT OUTCOME: ${allPassed ? '✓ ALL 28 OPERATIONAL CRITERIA PASSED (100%)' : '✗ CONFIGURATION AUDIT DEFECTS DETECTED'}`);
  console.log('========================================================================================\n');

  return { allPassed, results };
}

// If executed directly via CLI
if (require.main === module || process.argv[1]?.includes('verify-operations-config')) {
  runOperationalConfigVerification()
    .then(({ allPassed }) => process.exit(allPassed ? 0 : 1))
    .catch((err) => {
      console.error('Fatal operational config failure:', err);
      process.exit(1);
    });
}
