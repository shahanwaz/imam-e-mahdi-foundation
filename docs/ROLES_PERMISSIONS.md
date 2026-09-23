# Roles, Permissions & Access Control Matrix (RBAC)
## Imam E Mahdi Foundation Digital Operating System (IMF-DOS)

**Document Version:** 1.0.0  
**Status:** Approved Architectural Baseline  
**Security Standard:** Principle of Least Privilege & Separation of Duties  

---

## 1. Role Hierarchy & Profiles

IMF-DOS defines ten (10) standardized roles with explicit operational boundaries:

```
                                +---------------------------+
                                |        SUPER_ADMIN        | (Full System Authority)
                                +-------------+-------------+
                                              |
                     +------------------------+------------------------+
                     |                                                 |
        +------------v------------+                       +------------v------------+
        |         TRUSTEE         |                       |        DIRECTOR         |
        |  (Governance & Audit)   |                       |  (Executive Operations) |
        +------------+------------+                       +------------+------------+
                     |                                                 |
         +-----------+-----------+                     +---------------+---------------+
         |                       |                     |                               |
+--------v--------+     +--------v--------+   +--------v--------+             +--------v--------+
|     AUDITOR     |     | FINANCE_OFFICER |   | PROJECT_MANAGER |             |  FIELD_WORKER   |
| (Read-Only Cert)|     |  (Ledger/Vouch) |   | (Programs & M&E)|             | (KYC & Verify)  |
+-----------------+     +-----------------+   +-----------------+             +-----------------+
                                                       |
                                      +----------------+----------------+
                                      |                |                |
                             +--------v--------+ +-----v-----+ +--------v--------+
                             |      DONOR      | | VOLUNTEER | |     MEMBER      |
                             | (Giving Portal) | |(Hours/ID) | | (AGM / Voting)  |
                             +-----------------+ +-----------+ +-----------------+
```

---

## 2. Granular Permissions Catalog

Permissions are atomic string codes structured as `<MODULE>:<ACTION>`:

### 2.1 Identity & Governance (`AUTH`, `USERS`, `ROLES`)
* `users:read`, `users:create`, `users:update`, `users:delete`, `users:impersonate`
* `roles:read`, `roles:assign`, `roles:manage_permissions`

### 2.2 Donations & Fundraising (`DONATIONS`, `CAMPAIGNS`)
* `donations:read_all`, `donations:read_own`, `donations:create_manual`, `donations:export`, `donations:refund`
* `receipts:issue_80g`, `receipts:revoke`
* `campaigns:read`, `campaigns:create`, `campaigns:update`, `campaigns:delete`, `campaigns:publish_updates`

### 2.3 Beneficiaries & Aid Distribution (`BENEFICIARIES`, `AID`)
* `beneficiaries:read`, `beneficiaries:create`, `beneficiaries:verify_kyc`, `beneficiaries:view_pii`, `beneficiaries:delete`
* `aid:apply`, `aid:review_applications`, `aid:approve`, `aid:disburse`

### 2.4 Financial Management & Accounting (`FINANCE`)
* `finance:view_ledger`, `finance:create_voucher`, `finance:post_voucher`, `finance:edit_chart_of_accounts`, `finance:reconcile_bank`, `finance:export_audit_pack`, `finance:view_financial_statements`

### 2.5 Projects, Field Operations & Monitoring (`PROJECTS`)
* `projects:read`, `projects:create`, `projects:update`, `projects:allocate_budget`, `projects:log_field_activity`, `projects:sign_off_milestone`

### 2.6 Human Resources & Payroll (`HR`)
* `hr:view_employees`, `hr:manage_staff`, `hr:log_attendance`, `hr:approve_leaves`, `hr:calculate_payroll`, `hr:disburse_payroll`, `hr:view_payslips`

### 2.7 Volunteers, Members & Events (`VOLUNTEERS`, `MEMBERS`, `EVENTS`)
* `volunteers:read`, `volunteers:verify_hours`, `volunteers:issue_badges`, `volunteers:issue_certificates`
* `members:read_register`, `members:verify_kyc`, `members:manage_dues`, `members:access_resolutions`
* `events:create`, `events:manage_passes`, `events:scan_qr_checkin`

### 2.8 Compliance, System & AI (`COMPLIANCE`, `SYSTEM`, `AI`)
* `compliance:read_vault`, `compliance:upload_document`, `compliance:approve_filing`
* `system:view_audit_logs`, `system:edit_settings`, `ai:run_ocr`, `ai:trigger_deduplication`

---

## 3. Comprehensive Role-Permission Matrix

| Permission Code | Super Admin | Trustee | Director | Finance Officer | Project Manager | Field Worker | Auditor | Donor | Volunteer | Member |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `users:manage` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `roles:assign` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `donations:read_all` | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| `donations:read_own` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `donations:create_manual` | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `receipts:issue_80g` | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `campaigns:create` | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `beneficiaries:read` | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `beneficiaries:verify_kyc` | ✅ | ❌ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `aid:approve` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `aid:disburse` | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `finance:view_ledger` | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| `finance:create_voucher` | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `finance:post_voucher` | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `finance:export_audit_pack` | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| `projects:create` | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `projects:log_field_activity`| ✅ | ❌ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `hr:calculate_payroll` | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `hr:approve_leaves` | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `volunteers:verify_hours` | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `members:access_resolutions` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| `compliance:upload_document` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `system:view_audit_logs` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| `ai:run_ocr` | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## 4. Middleware & Code Enforcement Architecture

### 4.1 Server Route Guard Pattern
```typescript
// src/lib/auth/rbac.ts
export async function requirePermission(permissionCode: string) {
  const session = await auth();
  if (!session?.user) {
    throw new UnauthorizedError("Authentication required");
  }

  const hasPermission = await checkUserPermission(session.user.id, permissionCode);
  if (!hasPermission) {
    throw new ForbiddenError(`Forbidden: Missing permission [${permissionCode}]`);
  }
  return session.user;
}
```

### 4.2 Client Component Protection Pattern
```tsx
// src/components/auth/PermissionGuard.tsx
export function PermissionGuard({
  permission,
  children,
  fallback = null
}: {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { hasPermission, isLoading } = usePermission(permission);
  if (isLoading) return <Skeleton className="h-8 w-24" />;
  if (!hasPermission) return <>{fallback}</>;
  return <>{children}</>;
}
```
