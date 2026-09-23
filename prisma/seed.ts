import { PrismaClient, RoleType, UserStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const PERMISSIONS_LIST = [
  // USERS & ROLES
  { code: 'users:read', module: 'USERS', description: 'View user directory and profiles' },
  { code: 'users:create', module: 'USERS', description: 'Create new user accounts' },
  { code: 'users:update', module: 'USERS', description: 'Edit user information and statuses' },
  { code: 'users:delete', module: 'USERS', description: 'Soft-delete or suspend user accounts' },
  { code: 'roles:read', module: 'ROLES', description: 'View system roles and permission matrices' },
  { code: 'roles:assign', module: 'ROLES', description: 'Assign roles to users' },
  { code: 'roles:manage_permissions', module: 'ROLES', description: 'Modify permissions attached to roles' },

  // DONATIONS & CAMPAIGNS
  { code: 'donations:read_all', module: 'DONATIONS', description: 'View all organization donations' },
  { code: 'donations:read_own', module: 'DONATIONS', description: 'View own personal donation history' },
  { code: 'donations:create_manual', module: 'DONATIONS', description: 'Record offline/cash donations' },
  { code: 'donations:export', module: 'DONATIONS', description: 'Export donation reports' },
  { code: 'donations:refund', module: 'DONATIONS', description: 'Process donation refund requests' },
  { code: 'receipts:issue_80g', module: 'DONATIONS', description: 'Generate and issue 80G tax exemption receipts' },
  { code: 'receipts:revoke', module: 'DONATIONS', description: 'Revoke an issued 80G tax certificate' },
  { code: 'campaigns:read', module: 'CAMPAIGNS', description: 'View public and draft campaigns' },
  { code: 'campaigns:create', module: 'CAMPAIGNS', description: 'Create new fundraising campaigns' },
  { code: 'campaigns:update', module: 'CAMPAIGNS', description: 'Update campaign targets, stories, and media' },
  { code: 'campaigns:delete', module: 'CAMPAIGNS', description: 'Archive or remove campaigns' },
  { code: 'campaigns:publish_updates', module: 'CAMPAIGNS', description: 'Publish field updates to donors' },

  // BENEFICIARIES & AID
  { code: 'beneficiaries:read', module: 'BENEFICIARIES', description: 'View beneficiary registry' },
  { code: 'beneficiaries:create', module: 'BENEFICIARIES', description: 'Register new household profiles' },
  { code: 'beneficiaries:update', module: 'BENEFICIARIES', description: 'Update beneficiary demographics' },
  { code: 'beneficiaries:verify_kyc', module: 'BENEFICIARIES', description: 'Verify national IDs and documents' },
  { code: 'beneficiaries:view_pii', module: 'BENEFICIARIES', description: 'Decrypt and view unmasked Aadhaar/PAN' },
  { code: 'beneficiaries:delete', module: 'BENEFICIARIES', description: 'Soft-delete beneficiary dossiers' },
  { code: 'aid:apply', module: 'AID', description: 'Submit an aid application' },
  { code: 'aid:review_applications', module: 'AID', description: 'Review submitted welfare applications' },
  { code: 'aid:approve', module: 'AID', description: 'Approve aid amounts for disbursement' },
  { code: 'aid:disburse', module: 'AID', description: 'Disburse financial DBT or ration kits' },

  // FINANCE & GENERAL LEDGER
  { code: 'finance:view_ledger', module: 'FINANCE', description: 'View general ledger and account balances' },
  { code: 'finance:create_voucher', module: 'FINANCE', description: 'Draft Payment, Receipt, Journal, or Contra vouchers' },
  { code: 'finance:post_voucher', module: 'FINANCE', description: 'Post and finalize balanced vouchers' },
  { code: 'finance:edit_chart_of_accounts', module: 'FINANCE', description: 'Manage Account Heads' },
  { code: 'finance:reconcile_bank', module: 'FINANCE', description: 'Perform bank reconciliation' },
  { code: 'finance:export_audit_pack', module: 'FINANCE', description: 'Generate audit-ready financial exports' },
  { code: 'finance:view_financial_statements', module: 'FINANCE', description: 'View Balance Sheet and Trial Balance' },

  // PROJECTS & FIELD
  { code: 'projects:read', module: 'PROJECTS', description: 'View projects portfolio and milestones' },
  { code: 'projects:create', module: 'PROJECTS', description: 'Create and charter new projects' },
  { code: 'projects:update', module: 'PROJECTS', description: 'Edit project details and budget allocations' },
  { code: 'projects:log_field_activity', module: 'PROJECTS', description: 'Submit geo-tagged field activity logs' },
  { code: 'projects:sign_off_milestone', module: 'PROJECTS', description: 'Sign off on completed M&E milestones' },

  // HR & PAYROLL
  { code: 'hr:view_employees', module: 'HR', description: 'View staff directory' },
  { code: 'hr:manage_staff', module: 'HR', description: 'Onboard and manage employees' },
  { code: 'hr:log_attendance', module: 'HR', description: 'Check in/out daily attendance' },
  { code: 'hr:approve_leaves', module: 'HR', description: 'Approve employee leave requests' },
  { code: 'hr:calculate_payroll', module: 'HR', description: 'Calculate monthly salary register' },
  { code: 'hr:disburse_payroll', module: 'HR', description: 'Finalize payroll and issue pay slips' },
  { code: 'hr:view_payslips', module: 'HR', description: 'View own monthly pay slips' },

  // VOLUNTEERS & EVENTS
  { code: 'volunteers:read', module: 'VOLUNTEERS', description: 'View volunteer directory' },
  { code: 'volunteers:verify_hours', module: 'VOLUNTEERS', description: 'Verify logged service hours' },
  { code: 'volunteers:issue_badges', module: 'VOLUNTEERS', description: 'Award service badges' },
  { code: 'volunteers:issue_certificates', module: 'VOLUNTEERS', description: 'Issue official volunteer certificates' },
  { code: 'events:create', module: 'EVENTS', description: 'Create events and drives' },
  { code: 'events:manage_passes', module: 'EVENTS', description: 'Manage RSVPs and event passes' },
  { code: 'events:scan_qr_checkin', module: 'EVENTS', description: 'Scan attendee/volunteer QR passes at gate' },

  // MEMBERS & GOVERNANCE
  { code: 'members:read_register', module: 'MEMBERS', description: 'View general body membership register' },
  { code: 'members:verify_kyc', module: 'MEMBERS', description: 'Approve member KYC documents' },
  { code: 'members:manage_dues', module: 'MEMBERS', description: 'Manage annual membership dues' },
  { code: 'members:access_resolutions', module: 'MEMBERS', description: 'Access board resolutions and minutes' },

  // COMPLIANCE, SYSTEM & AI
  { code: 'compliance:read_vault', module: 'COMPLIANCE', description: 'View compliance repository and filings' },
  { code: 'compliance:upload_document', module: 'COMPLIANCE', description: 'Upload statutory filings and deeds' },
  { code: 'compliance:approve_filing', module: 'COMPLIANCE', description: 'Verify legal compliance document' },
  { code: 'system:view_audit_logs', module: 'SYSTEM', description: 'View immutable system audit logs' },
  { code: 'system:edit_settings', module: 'SYSTEM', description: 'Manage organization configuration' },
  { code: 'storage:upload', module: 'STORAGE', description: 'Upload documents and assets' },
  { code: 'storage:read_private', module: 'STORAGE', description: 'Read private KYC files' },
  { code: 'ai:run_ocr', module: 'AI', description: 'Run receipt and ID OCR extraction' },
  { code: 'ai:trigger_deduplication', module: 'AI', description: 'Run AI beneficiary duplicate matcher' }
];

export async function main() {
  console.log('--- SEEDING IMF-DOS PLATFORM FOUNDATION ---');

  // 1. Seed Permissions
  console.log(`Seeding ${PERMISSIONS_LIST.length} atomic permissions...`);
  for (const perm of PERMISSIONS_LIST) {
    await prisma.permission.upsert({
      where: { code: perm.code },
      update: { description: perm.description, module: perm.module },
      create: perm
    });
  }

  // 2. Seed Standard Roles
  const rolesData: Array<{ name: RoleType; displayName: string; description: string }> = [
    { name: 'SUPER_ADMIN', displayName: 'Super Administrator', description: 'Full master authority over all platform sub-systems' },
    { name: 'TRUSTEE', displayName: 'Trustee / Board Member', description: 'Governance oversight, financial reports, and resolution access' },
    { name: 'DIRECTOR', displayName: 'Executive Director', description: 'Operational command, program approvals, and staff leadership' },
    { name: 'FINANCE_OFFICER', displayName: 'Finance Officer / Treasurer', description: 'Ledger management, vouchers, bank reconciliation, and payroll' },
    { name: 'PROJECT_MANAGER', displayName: 'Project Manager', description: 'Program execution, M&E milestones, and field activity supervision' },
    { name: 'FIELD_WORKER', displayName: 'Field Worker / Social Worker', description: 'Beneficiary intake, need assessment, and ration distribution' },
    { name: 'DONOR', displayName: 'Donor / Patron', description: 'Self-service giving, 80G tax receipts, and impact updates' },
    { name: 'VOLUNTEER', displayName: 'Community Volunteer', description: 'Shift registration, hours logging, and digital ID card' },
    { name: 'MEMBER', displayName: 'Foundation Member', description: 'General body voting rights, renewals, and board resolutions' },
    { name: 'AUDITOR', displayName: 'Statutory Auditor (CA)', description: 'Read-only access to vouchers, 80G certificates, and ledger' }
  ];

  console.log('Seeding 10 standardized roles...');
  for (const roleData of rolesData) {
    await prisma.role.upsert({
      where: { name: roleData.name },
      update: { displayName: roleData.displayName, description: roleData.description },
      create: roleData
    });
  }

  // 3. Map Permissions to Roles
  console.log('Mapping Role-Permission relationships...');
  const allPermissions = await prisma.permission.findMany();
  const superAdminRole = await prisma.role.findUniqueOrThrow({ where: { name: 'SUPER_ADMIN' } });

  // Super Admin gets ALL permissions
  for (const perm of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: superAdminRole.id,
          permissionId: perm.id
        }
      },
      update: {},
      create: {
        roleId: superAdminRole.id,
        permissionId: perm.id
      }
    });
  }

  // Helper function to assign permissions to a role
  const assignPermissionsToRole = async (roleName: RoleType, permissionCodes: string[]) => {
    const role = await prisma.role.findUniqueOrThrow({ where: { name: roleName } });
    for (const code of permissionCodes) {
      const perm = allPermissions.find(p => p.code === code);
      if (perm) {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: role.id,
              permissionId: perm.id
            }
          },
          update: {},
          create: {
            roleId: role.id,
            permissionId: perm.id
          }
        });
      }
    }
  };

  // Assign Trustee permissions
  await assignPermissionsToRole('TRUSTEE', [
    'users:read', 'donations:read_all', 'finance:view_ledger', 'finance:export_audit_pack',
    'finance:view_financial_statements', 'projects:read', 'members:access_resolutions',
    'compliance:read_vault', 'compliance:upload_document', 'system:view_audit_logs'
  ]);

  // Assign Finance Officer permissions
  await assignPermissionsToRole('FINANCE_OFFICER', [
    'donations:read_all', 'donations:create_manual', 'donations:export', 'receipts:issue_80g',
    'finance:view_ledger', 'finance:create_voucher', 'finance:post_voucher', 'finance:edit_chart_of_accounts',
    'finance:reconcile_bank', 'finance:export_audit_pack', 'finance:view_financial_statements',
    'hr:calculate_payroll', 'hr:disburse_payroll', 'storage:upload'
  ]);

  // Assign Field Worker permissions
  await assignPermissionsToRole('FIELD_WORKER', [
    'beneficiaries:read', 'beneficiaries:create', 'beneficiaries:update', 'beneficiaries:verify_kyc',
    'aid:apply', 'projects:log_field_activity', 'events:scan_qr_checkin', 'storage:upload'
  ]);

  // Assign Donor permissions
  await assignPermissionsToRole('DONOR', [
    'donations:read_own', 'campaigns:read'
  ]);

  // Assign Volunteer permissions
  await assignPermissionsToRole('VOLUNTEER', [
    'events:manage_passes'
  ]);

  // Assign Auditor permissions
  await assignPermissionsToRole('AUDITOR', [
    'donations:read_all', 'finance:view_ledger', 'finance:export_audit_pack',
    'finance:view_financial_statements', 'compliance:read_vault', 'system:view_audit_logs'
  ]);

  // 4. Create Default Super Admin User
  console.log('Seeding Default Master Administrator...');
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash('Admin@IMF2026!', salt);

  const superAdminUser = await prisma.user.upsert({
    where: { email: 'admin@imf-foundation.org' },
    update: {
      name: 'Imam E Mahdi Foundation Master Admin',
      status: UserStatus.ACTIVE,
      twoFactorEnabled: false
    },
    create: {
      email: 'admin@imf-foundation.org',
      passwordHash,
      name: 'Imam E Mahdi Foundation Master Admin',
      phone: '+919999900000',
      status: UserStatus.ACTIVE,
      preferredLanguage: 'en',
      countryCode: 'IND'
    }
  });

  // Assign SUPER_ADMIN role to super admin user
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: superAdminUser.id,
        roleId: superAdminRole.id
      }
    },
    update: {},
    create: {
      userId: superAdminUser.id,
      roleId: superAdminRole.id
    }
  });

  // 5. Seed Core System Settings
  console.log('Seeding Default System Settings...');
  const defaultSettings = [
    { key: 'ORGANIZATION_NAME', value: 'Imam E Mahdi Foundation', category: 'GENERAL', description: 'Official Legal Foundation Name' },
    { key: 'ORGANIZATION_LEGAL_DISCLAIMER', value: 'REQUIRES ORGANIZATIONAL / CA / CS / LEGAL VERIFICATION', category: 'COMPLIANCE', description: 'Statutory Verification Badge Tag' },
    { key: 'DEFAULT_CURRENCY', value: 'INR', category: 'FINANCE', description: 'Base Accounting Currency' },
    { key: 'PAN_NUMBER_STATUS', value: 'PENDING_VERIFICATION', category: 'COMPLIANCE', description: 'Organization PAN status' },
    { key: 'MFA_MANDATORY_FOR_ADMIN', value: 'true', category: 'SECURITY', description: 'Enforce TOTP 2FA on administrative roles' }
  ];

  for (const setting of defaultSettings) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting
    });
  }

  console.log('✅ IMF-DOS Foundation Seed Completed Successfully!');
}

if (require.main === module) {
  main()
    .catch((e) => {
      console.error('Seed Error:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
