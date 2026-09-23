# Comprehensive Module Boundaries & Domain Specifications
## Imam E Mahdi Foundation Digital Operating System (IMF-DOS)

**Document Version:** 2.0.0  
**Status:** Approved Technical Blueprint  
**Lead Roles:** Solution Architect & Database Architect  
**Architecture Style:** Modular Monolith with Event-Driven Decoupled Boundaries  

---

## 1. Domain Boundary Architecture & Event Topology

All 21 modules are organized into distinct bounded contexts. Communication between bounded contexts occurs exclusively through **Typed Domain Service Interfaces** or **Asynchronous Domain Events** via BullMQ / Redis.

```
+---------------------------------------------------------------------------------------------------+
|                                  IN-PROCESS DOMAIN EVENT BUS                                      |
+---------------------------------------------------------------------------------------------------+
         ▲                                   ▲                                   ▲
         │ Emits Events                      │ Emits Events                      │ Emits Events
+--------┴------------------+       +--------┴------------------+       +--------┴------------------+
|      DONATION DOMAIN      |       |    BENEFICIARY DOMAIN     |       |       HRMS DOMAIN         |
| Events:                   |       | Events:                   |       | Events:                   |
| - `DONATION_COMPLETED`    |       | - `AID_APPROVED`          |       | - `PAYROLL_GENERATED`     |
| - `PLEDGE_RENEWED`        |       | - `AID_DISBURSED`         |       | - `LEAVE_APPROVED`        |
+--------┬------------------+       +--------┬------------------+       +--------┬------------------+
         │ Consumes Events                   │ Consumes Events                   │ Consumes Events
         ▼                                   ▼                                   ▼
+---------------------------------------------------------------------------------------------------+
|                        FINANCE, AUDIT, DOCUMENT & NOTIFICATION ADAPTERS                           |
| - `FinanceDomain`: Automatically generates double-entry Journal Vouchers upon financial events     |
| - `DocumentDomain`: Generates vector 80G receipts & certificates with HMAC-SHA256 QR codes        |
| - `NotificationDomain`: Dispatches multi-channel alerts (WhatsApp, SES Email, SMS)                |
| - `AuditDomain`: Appends immutable snapshots to the rolling SHA-256 change ledger                |
+---------------------------------------------------------------------------------------------------+
```

---

## 2. Exhaustive Sub-System Specifications

### Module 01: Public NGO Portal
* **Context**: Public Engagement & Brand Storytelling
* **Frontend Components**: Hero banner, live impact ticker, interactive cause cards, multimedia story blog, photo gallery, leadership profile cards, grievance & inquiry form.
* **Backend Services**: `PublicContentService`, `LiveMetricsAggregationService`.
* **Database Tables**: Reads from `Campaign`, `Project`, `FieldActivity`, `SystemSetting`.
* **Events Emitted**: `INQUIRY_SUBMITTED`.
* **Dependencies**: Read-only access to published campaigns and aggregated statistics.

---

### Module 02: Donor Self-Service Portal
* **Context**: Donor Retention & Tax Compliance
* **Frontend Components**: Single sign-on / magic link login, personal giving timeline, 80G tax receipt download grid, recurring pledge manager, donation category selector (Zakat / Sadaqah / General).
* **Backend Services**: `DonorProfileService`, `DonationHistoryService`.
* **Database Tables**: `DonorProfile`, `Donation`, `TaxExemption80G`, `RecurringPledge`.
* **Events Emitted**: `DONOR_PROFILE_UPDATED`, `PLEDGE_CANCELLED`.
* **Dependencies**: `IAMModule`, `DocumentModule`.

---

### Module 03: Volunteer Engagement & ID Portal
* **Context**: Community Mobilization & Field Coordination
* **Frontend Components**: Skill onboarding wizard, opportunity shift explorer, service hour log submitter, digital photo ID card with live cryptographic QR code.
* **Backend Services**: `VolunteerManagementService`, `HoursVerificationService`.
* **Database Tables**: `VolunteerProfile`, `VolunteerAttendance`.
* **Events Emitted**: `VOLUNTEER_REGISTERED`, `HOURS_LOGGED`, `BADGE_UPGRADED`.
* **Dependencies**: `IAMModule`, `DocumentModule`, `QRVerificationModule`.

---

### Module 04: Executive Membership & Governance
* **Context**: Trust Bylaw Governance & General Body Management
* **Frontend Components**: Membership application, KYC document uploader, annual dues renewal checkout, AGM resolution and meeting minutes reader.
* **Backend Services**: `MemberService`, `KYCVerificationService`.
* **Database Tables**: `MemberProfile`, `User`, `ComplianceDocument`.
* **Events Emitted**: `MEMBERSHIP_RENEWED`, `MEMBER_KYC_VERIFIED`.
* **Dependencies**: `IAMModule`, `PaymentModule`.

---

### Module 05: NGO Admin ERP Command Center
* **Context**: Executive Operations Mission Control
* **Frontend Components**: Executive KPI dashboard, cross-department task kanban, system-wide global search, alert center.
* **Backend Services**: `AdminDashboardService`, `GlobalSearchService`, `TaskWorkflowService`.
* **Database Tables**: Aggregates across all system entities.
* **Dependencies**: Unrestricted read access via `SUPER_ADMIN` / `DIRECTOR` roles.

---

### Module 06: Finance, Accounts & General Ledger
* **Context**: Double-Entry Accounting & Statutory Audit
* **Frontend Components**: Hierarchical Chart of Accounts tree, multi-type voucher entry form (Receipt, Payment, Journal, Contra), real-time financial statements (Balance Sheet, Income & Expenditure, Trial Balance), bank reconciliation statement uploader.
* **Backend Services**: `GeneralLedgerService`, `VoucherService`, `BankReconciliationService`.
* **Database Tables**: `AccountHead`, `Voucher`, `VoucherEntry`.
* **Events Emitted**: `VOUCHER_POSTED`, `LEDGER_BALANCED`.
* **Events Consumed**: `DONATION_COMPLETED` (auto-creates Receipt Voucher), `AID_DISBURSED` (auto-creates Payment Voucher), `PAYROLL_DISBURSED` (auto-creates Payroll Voucher).
* **Business Rule**: Enforces absolute mathematical balance: $\sum \text{Debits} == \sum \text{Credits}$ per voucher.

---

### Module 07: Human Resources & Payroll (HRMS)
* **Context**: Staff Directory, Attendance & Statutory Deductions
* **Frontend Components**: Staff directory, mobile geo-tagged attendance check-in, leave application & manager approval modal, salary slip viewer, monthly payroll run wizard.
* **Backend Services**: `EmployeeService`, `AttendanceService`, `PayrollCalculationService`.
* **Database Tables**: `EmployeeProfile`, `AttendanceRecord`, `LeaveRequest`, `PayrollRecord`.
* **Events Emitted**: `PAYROLL_GENERATED`, `LEAVE_APPROVED`.
* **Dependencies**: `IAMModule`, `FinanceModule`.

---

### Module 08: Project Management & M&E
* **Context**: Humanitarian Program Lifecycle & Field Delivery
* **Frontend Components**: Project portfolio view, Gantt milestone tracker, budget vs actuals variance chart, mobile field activity reporting form with geo-coordinates.
* **Backend Services**: `ProjectLifecycleService`, `FieldActivityService`, `IndicatorTrackingService`.
* **Database Tables**: `Project`, `ProjectMilestone`, `FieldActivity`.
* **Events Emitted**: `PROJECT_MILESTONE_REACHED`, `FIELD_ACTIVITY_LOGGED`.
* **Dependencies**: `FinanceModule` (budget tracking).

---

### Module 09: Beneficiary Registry, KYC & Need Assessment
* **Context**: Humanitarian Aid Delivery & Poverty Scoring
* **Frontend Components**: Family tree registry, socio-economic survey form, biometric/ID card scanner, vulnerability index calculator, direct benefit transfer (DBT) manager, confidential social worker case notes.
* **Backend Services**: `BeneficiaryService`, `VulnerabilityIndexService`, `AidApplicationService`.
* **Database Tables**: `Beneficiary`, `FamilyMember`, `AidApplication`, `AidDisbursement`.
* **Events Emitted**: `BENEFICIARY_REGISTERED`, `AID_APPLICATION_SUBMITTED`, `AID_DISBURSED`.
* **Dependencies**: `FinanceModule` (disbursements), `AIModule` (fuzzy deduplication).

---

### Module 10: Campaign & Crowdfunding Engine
* **Context**: High-Conversion Fundraising & Zakat Calculation
* **Frontend Components**: Campaign builder, real-time donation thermometer, interactive Zakat/Sadaqah calculator pegged to Nisab rates, multi-gateway donation checkout.
* **Backend Services**: `CampaignService`, `ZakatCalculatorService`, `DonationProcessorService`.
* **Database Tables**: `Campaign`, `CampaignUpdate`, `Donation`, `PaymentTransaction`.
* **Events Emitted**: `DONATION_INITIATED`, `DONATION_COMPLETED`, `CAMPAIGN_GOAL_REACHED`.
* **Dependencies**: `PaymentModule`, `FinanceModule`, `DocumentModule`.

---

### Module 11: Event Management & High-Speed QR Check-in
* **Context**: Public Drives, Medical Camps & Conferences
* **Frontend Components**: Event registration page, digital pass generator, offline-capable mobile camera QR gate scanner.
* **Backend Services**: `EventService`, `GateCheckinService`.
* **Database Tables**: `Event`, `EventRegistration`.
* **Events Emitted**: `ATTENDEE_CHECKED_IN`.
* **Dependencies**: `QRVerificationModule`, `NotificationModule`.

---

### Module 12: Multi-Channel Communication Engine
* **Context**: Constituent Engagement & Broadcasts
* **Frontend Components**: Drag-and-drop email newsletter composer, WhatsApp broadcast dispatcher, SMS notice sender, audience segmentation filter.
* **Backend Services**: `BroadcastService`, `WhatsAppAdapter`, `SESEmailAdapter`, `SMSDLTAdapter`.
* **Database Tables**: `Notification`, `AuditLog`.
* **Events Consumed**: Listens to all transactional notifications and routes according to user channel preferences.

---

### Module 13: Compliance, Legal & Document Vault
* **Context**: Statutory Integrity & Regulatory Expiry Monitoring
* **Frontend Components**: Secure document vault, statutory filing timeline (12AB, 80G, FCRA, CSR-1), unverified legal badge alert (`REQUIRES LEGAL VERIFICATION`), board resolution manager.
* **Backend Services**: `ComplianceVaultService`, `DocumentExpiryWatcherService`.
* **Database Tables**: `ComplianceDocument`.
* **Events Emitted**: `COMPLIANCE_EXPIRY_WARNING`.
* **Dependencies**: `StorageModule`.

---

### Module 14: Analytics, BI & Impact Reporting
* **Context**: Executive Intelligence & Public Transparency
* **Frontend Components**: Financial burn charts, donor cohort retention heatmaps, geo-spatial aid distribution maps, automated annual report PDF builder.
* **Backend Services**: `AnalyticsAggregationService`, `GeoSpatialMetricsService`.
* **Database Tables**: Aggregates from `Donation`, `AidDisbursement`, `Beneficiary`, `Voucher`.
* **Dependencies**: Read-only access across all operational tables.

---

### Module 15: AI Assistant & Automation Engine
* **Context**: OCR Data Entry & Smart Fraud Prevention
* **Frontend Components**: Bank wire screenshot dropzone, ID card OCR scanner, duplicate beneficiary comparison modal, AI appeal drafter assistant.
* **Backend Services**: `GeminiAIService`, `ReceiptOCRProcessor`, `BeneficiaryDedupMatcher`.
* **Dependencies**: `StorageModule`, `BeneficiaryModule`, `DonationModule`.

---

### Module 16: Multilingual & Bi-Directional (i18n) Engine
* **Context**: Linguistic Accessibility (English, Hindi, Urdu, Arabic)
* **Frontend Components**: Language toggle navbar, dynamic RTL layout wrapper, culturally paired typography fonts.
* **Backend Services**: `TranslationDictionaryService`, `LocaleResolver`.
* **Dependencies**: Global UI layer.

---

### Module 17: Notification & Priority Dispatch Engine
* **Context**: Event-Driven Alert Delivery
* **Frontend Components**: In-app notification bell with live counter, channel preference settings.
* **Backend Services**: `NotificationRouter`, `BullMQPriorityWorker`.
* **Database Tables**: `Notification`.
* **Dependencies**: `RedisModule`.

---

### Module 18: Document & Certificate Generator
* **Context**: Legally Compliant Vector PDF Generation
* **Frontend Components**: PDF preview modal, instant download buttons.
* **Backend Services**: `PDFKitVectorRenderer`, `Receipt80GBuilder`, `VolunteerCertificateBuilder`.
* **Database Tables**: `TaxExemption80G`, `GeneratedCertificate`.
* **Dependencies**: `QRVerificationModule`, `StorageModule`.

---

### Module 19: Cryptographic QR Verification Gateway
* **Context**: Public Authenticity & Fraud Elimination
* **Frontend Components**: Public verification landing page (`/verify/[code]`), verification status badges (VERIFIED / INVALID).
* **Backend Services**: `HMACSignatureService`, `VerificationResolver`.
* **Database Tables**: `GeneratedCertificate`, `TaxExemption80G`, `VolunteerProfile`.
* **Dependencies**: Node.js `crypto` native library.

---

### Module 20: Granular Role-Based Access Control (RBAC)
* **Context**: Identity, Authorization & Least Privilege
* **Frontend Components**: Dynamic menu filter based on active permissions, permission management table for Super Admins.
* **Backend Services**: `RBACMiddlewareService`, `PermissionCacheService`.
* **Database Tables**: `Role`, `Permission`, `RolePermission`, `UserRole`.
* **Dependencies**: `IAMModule`.

---

### Module 21: Audit Trail, Security & System Telemetry
* **Context**: Forensic Accountability & Threat Mitigation
* **Frontend Components**: Audit log viewer with JSON diff inspector, security event alert monitor.
* **Backend Services**: `AuditLoggerService`, `HashChainIntegrityService`.
* **Database Tables**: `AuditLog`.
* **Dependencies**: Intercepts all database write actions.
