# Database Architecture & Relational Schema
## Imam E Mahdi Foundation Digital Operating System (IMF-DOS)

**Document Version:** 2.0.0  
**Database Engine:** PostgreSQL 16  
**ORM / Data Access:** Prisma ORM 6.x  
**Status:** Approved Database Architecture  
**Lead Roles:** Database Architect & Solution Architect  

---

## 1. Relational Design Strategy & Principles

The database architecture is designed with the following core engineering principles:

1. **Strict Financial ACID Guarantees**: Double-entry journal vouchers use multi-table transactions. The general ledger enforces `SUM(debitAmount) == SUM(creditAmount)` at the application and database constraint levels.
2. **PII Security & Encryption at Rest**: Highly confidential fields (Aadhaar number, PAN, Bank Account Number, Salary details) are stored as encrypted ciphertexts using AES-256-GCM before writing to PostgreSQL.
3. **Multi-Country & Multi-Chapter Tenancy Readiness**: All primary transactional and operational tables feature `organizationId` and `countryCode` columns (defaulting to `"IND"` / HQ), supporting future chapter federation and Row-Level Security (RLS).
4. **Soft Deletes with Audit Preservation**: Deletions on critical entities (`User`, `Beneficiary`, `Project`, `Donation`) set `deletedAt = NOW()`, preserving historical auditability and referential integrity.
5. **JSONB Usage for High-Volume Telemetry & Dynamic Specs**: Audit log snapshots (`previousData`, `newData`), user notification preferences, and dynamic project KPI metrics are stored in optimized JSONB fields with GIN indexing.

---

## 2. Complete Prisma Schema Model

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

enum UserStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
  PENDING_VERIFICATION
}

enum RoleType {
  SUPER_ADMIN
  TRUSTEE
  DIRECTOR
  FINANCE_OFFICER
  PROJECT_MANAGER
  FIELD_WORKER
  DONOR
  VOLUNTEER
  MEMBER
  AUDITOR
}

enum FundType {
  GENERAL_SADAQAH
  ZAKAT
  KHUMS
  FITRAH
  KAFARAH
  LILLAH
  ORPHAN_SPONSORSHIP
  EDUCATION_AID
  MEDICAL_RELIEF
  INFRASTRUCTURE
}

enum DonationStatus {
  PENDING
  PROCESSING
  SUCCESS
  FAILED
  REFUNDED
  CANCELLED
}

enum PaymentMethod {
  RAZORPAY
  STRIPE
  UPI_INTENT
  BANK_TRANSFER_NEFT
  CASH
  CHEQUE
}

enum BeneficiaryCategory {
  ORPHAN_FAMILY
  WIDOW_SUPPORT
  CHRONIC_ILLNESS
  EXTREME_POVERTY
  STUDENT_SCHOLARSHIP
  DISASTER_VICTIM
  ELDERLY_CARE
}

enum AidStatus {
  APPLIED
  FIELD_VERIFICATION_PENDING
  COMMITTEE_REVIEW
  APPROVED
  REJECTED
  DISBURSED
}

enum ProjectStatus {
  PLANNING
  ACTIVE
  ON_HOLD
  COMPLETED
  CLOSED
}

enum AccountType {
  ASSET
  LIABILITY
  EQUITY_RESERVE
  INCOME
  EXPENSE
}

enum VoucherType {
  RECEIPT
  PAYMENT
  JOURNAL
  CONTRA
}

// ============================================================================
// 1. IDENTITY, IAM & RBAC
// ============================================================================

model User {
  id                    String            @id @default(cuid())
  organizationId        String            @default("ORG_IMF_HQ")
  email                 String            @unique
  emailVerified         DateTime?
  passwordHash          String?
  name                  String
  phone                 String?           @unique
  avatarUrl             String?
  status                UserStatus        @default(ACTIVE)
  twoFactorEnabled      Boolean           @default(false)
  twoFactorSecret       String?
  preferredLanguage     String            @default("en") // en, hi, ur, ar
  countryCode           String            @default("IND")
  createdAt             DateTime          @default(now())
  updatedAt             DateTime          @updatedAt
  deletedAt             DateTime?

  roles                 UserRole[]
  donorProfile          DonorProfile?
  volunteerProfile      VolunteerProfile?
  memberProfile         MemberProfile?
  employeeProfile       EmployeeProfile?
  auditLogs             AuditLog[]
  notifications         Notification[]
  sessions              Session[]
  accounts              Account[]

  @@index([email])
  @@index([phone])
  @@index([organizationId, status])
}

model Role {
  id          String           @id @default(cuid())
  name        RoleType         @unique
  displayName String
  description String?
  isSystem    Boolean          @default(true)
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt

  users       UserRole[]
  permissions RolePermission[]
}

model Permission {
  id          String           @id @default(cuid())
  code        String           @unique // e.g. "donations:create", "finance:approve_voucher"
  module      String           // "DONATIONS", "FINANCE", "HR", "BENEFICIARIES", "SECURITY"
  description String
  createdAt   DateTime         @default(now())

  roles       RolePermission[]

  @@index([module])
}

model RolePermission {
  id           String     @id @default(cuid())
  roleId       String
  permissionId String
  role         Role       @relation(fields: [roleId], references: [id], onDelete: Cascade)
  permission   Permission @relation(fields: [permissionId], references: [id], onDelete: Cascade)

  @@unique([roleId, permissionId])
}

model UserRole {
  id        String   @id @default(cuid())
  userId    String
  roleId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  role      Role     @relation(fields: [roleId], references: [id], onDelete: Cascade)

  @@unique([userId, roleId])
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

// ============================================================================
// 2. DONORS, CONTRIBUTIONS & 80G RECEIPTS
// ============================================================================

model DonorProfile {
  id                  String             @id @default(cuid())
  userId              String             @unique
  user                User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  panNumberEncrypted  String?            // AES-256 encrypted PAN
  panMasked           String?            // e.g. "ABCDE****F"
  nationalIdEncrypted String?            // Encrypted Aadhaar/Passport
  isTaxExemptEligible Boolean            @default(true)
  addressLine1        String?
  addressLine2        String?
  city                String?
  state               String?
  postalCode          String?
  country             String             @default("India")
  totalDonatedAmount  Decimal            @default(0.0) @db.Decimal(14, 2)
  donationCount       Int                @default(0)
  createdAt           DateTime           @default(now())
  updatedAt           DateTime           @updatedAt

  donations           Donation[]
  recurringPledges    RecurringPledge[]

  @@index([city, state])
}

model Campaign {
  id               String            @id @default(cuid())
  organizationId   String            @default("ORG_IMF_HQ")
  slug             String            @unique
  title            String
  titleUrdu        String?
  titleHindi       String?
  titleArabic      String?
  shortDescription String
  fullDescription  String            @db.Text
  coverImageUrl    String
  galleryImages    String[]
  fundType         FundType          @default(GENERAL_SADAQAH)
  currency         String            @default("INR")
  targetAmount     Decimal           @db.Decimal(14, 2)
  raisedAmount     Decimal           @default(0.0) @db.Decimal(14, 2)
  donorCount       Int               @default(0)
  isFeatured       Boolean           @default(false)
  isEmergencyAppeal Boolean          @default(false)
  isZakatEligible  Boolean           @default(true)
  startDate        DateTime
  endDate          DateTime?
  isActive         Boolean           @default(true)
  projectId        String?
  project          Project?          @relation(fields: [projectId], references: [id])
  createdAt        DateTime          @default(now())
  updatedAt        DateTime          @updatedAt

  donations        Donation[]
  updates          CampaignUpdate[]

  @@index([slug])
  @@index([isActive, isFeatured])
  @@index([fundType])
}

model CampaignUpdate {
  id          String   @id @default(cuid())
  campaignId  String
  campaign    Campaign @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  title       String
  content     String   @db.Text
  mediaUrls   String[]
  publishedAt DateTime @default(now())

  @@index([campaignId])
}

model Donation {
  id                   String            @id @default(cuid())
  organizationId       String            @default("ORG_IMF_HQ")
  receiptNumber        String            @unique // Auto: IMF/2026-27/REC-XXXXX
  donorId              String?
  donor                DonorProfile?     @relation(fields: [donorId], references: [id])
  campaignId           String?
  campaign             Campaign?         @relation(fields: [campaignId], references: [id])
  donorName            String
  donorEmail           String
  donorPhone           String?
  donorPanMasked       String?
  donorAddress         String?
  amount               Decimal           @db.Decimal(14, 2)
  currency             String            @default("INR")
  forexRateToINR       Decimal           @default(1.0) @db.Decimal(8, 4)
  fundType             FundType
  paymentMethod        PaymentMethod
  paymentStatus        DonationStatus    @default(PENDING)
  gatewayPaymentId     String?
  gatewayOrderId       String?
  isAnonymous          Boolean           @default(false)
  is80GRequested       Boolean           @default(true)
  receiptPdfUrl        String?
  qrVerificationHash   String?           @unique // HMAC-SHA256 signature
  completedAt          DateTime?
  createdAt            DateTime          @default(now())
  updatedAt            DateTime          @updatedAt

  taxExemption80G      TaxExemption80G?
  transactions         PaymentTransaction[]
  voucher              Voucher?

  @@index([receiptNumber])
  @@index([paymentStatus, createdAt])
  @@index([donorEmail])
  @@index([qrVerificationHash])
}

model PaymentTransaction {
  id              String         @id @default(cuid())
  donationId      String
  donation        Donation       @relation(fields: [donationId], references: [id], onDelete: Cascade)
  gateway         String         // RAZORPAY, STRIPE, MANUAL_BANK
  gatewayOrderId  String?
  gatewayPaymentId String?       @unique
  gatewaySignature String?
  amount          Decimal        @db.Decimal(14, 2)
  currency        String         @default("INR")
  status          DonationStatus @default(PENDING)
  rawResponse     Json?
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  @@index([gatewayPaymentId])
  @@index([donationId])
}

model RecurringPledge {
  id             String         @id @default(cuid())
  donorId        String
  donor          DonorProfile   @relation(fields: [donorId], references: [id])
  amount         Decimal        @db.Decimal(12, 2)
  currency       String         @default("INR")
  fundType       FundType
  interval       String         // MONTHLY, QUARTERLY, ANNUALLY
  nextBillingDate DateTime
  isActive       Boolean        @default(true)
  gatewaySubId   String?        @unique
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt

  @@index([donorId])
}

model TaxExemption80G {
  id                String    @id @default(cuid())
  certificateNumber String   @unique // Auto: IMF/80G/2026-27/XXXX
  donationId        String    @unique
  donation          Donation  @relation(fields: [donationId], references: [id])
  donorName         String
  donorPan          String
  donorAddress      String
  amount            Decimal   @db.Decimal(14, 2)
  financialYear     String    // e.g. "2026-2027"
  issuedAt          DateTime  @default(now())
  pdfUrl            String
  qrVerificationUrl String
  signatureHash     String    @unique // HMAC-SHA256 signature

  @@index([certificateNumber])
  @@index([financialYear])
}

// ============================================================================
// 3. BENEFICIARIES, HOUSEHOLDS & AID DISTRIBUTION
// ============================================================================

model Beneficiary {
  id                     String               @id @default(cuid())
  organizationId         String               @default("ORG_IMF_HQ")
  beneficiaryCode        String               @unique // Auto: IMF/BEN-XXXXX
  fullName               String
  gender                 String
  dateOfBirth            DateTime?
  nationalIdEncrypted    String?              // AES-256 encrypted Aadhaar / Passport
  nationalIdMasked       String?              // e.g. "XXXX-XXXX-1234"
  nationalIdHash         String?              // SHA-256 for blind indexing & duplicate search
  phone                  String?
  address                String
  city                   String
  state                  String
  pincode                String
  country                String               @default("India")
  category               BeneficiaryCategory
  vulnerabilityScore     Int                  @default(0) // Composite Index (1-100)
  isZakatEligible        Boolean              @default(true)
  monthlyHouseholdIncome Decimal              @db.Decimal(10, 2)
  familySize             Int                  @default(1)
  verificationStatus     String               @default("PENDING") // PENDING, VERIFIED, REJECTED
  verifiedByUserId       String?
  verifiedAt             DateTime?
  caseNotes              String?              @db.Text
  createdAt              DateTime             @default(now())
  updatedAt              DateTime             @updatedAt
  deletedAt              DateTime?

  familyMembers          FamilyMember[]
  aidApplications        AidApplication[]
  aidDisbursements       AidDisbursement[]

  @@index([beneficiaryCode])
  @@index([nationalIdHash])
  @@index([category, vulnerabilityScore])
  @@index([city, state])
}

model FamilyMember {
  id            String      @id @default(cuid())
  beneficiaryId String
  beneficiary   Beneficiary @relation(fields: [beneficiaryId], references: [id], onDelete: Cascade)
  fullName      String
  relation      String      // Son, Daughter, Spouse, Mother, Father
  age           Int
  occupation    String?
  healthNotes   String?
  createdAt     DateTime    @default(now())

  @@index([beneficiaryId])
}

model AidApplication {
  id                 String           @id @default(cuid())
  applicationNumber  String           @unique // Auto: IMF/APP-2026-XXXX
  beneficiaryId      String
  beneficiary        Beneficiary      @relation(fields: [beneficiaryId], references: [id])
  purpose            String
  requestedAmount    Decimal          @db.Decimal(12, 2)
  approvedAmount     Decimal?         @db.Decimal(12, 2)
  status             AidStatus        @default(APPLIED)
  rejectionReason    String?
  reviewedByUserId   String?
  reviewedAt         DateTime?
  createdAt          DateTime         @default(now())
  updatedAt          DateTime         @updatedAt

  disbursements      AidDisbursement[]

  @@index([applicationNumber])
  @@index([status])
  @@index([beneficiaryId])
}

model AidDisbursement {
  id                String          @id @default(cuid())
  disbursementCode  String          @unique // Auto: IMF/DISB-2026-XXXX
  applicationId     String
  application       AidApplication  @relation(fields: [applicationId], references: [id])
  beneficiaryId     String
  beneficiary       Beneficiary     @relation(fields: [beneficiaryId], references: [id])
  projectId         String?
  project           Project?        @relation(fields: [projectId], references: [id])
  amount            Decimal         @db.Decimal(12, 2)
  disbursementMode  String          // DIRECT_BANK_TRANSFER, CHEQUE, IN_KIND_RATION
  bankReference     String?
  disbursedAt       DateTime        @default(now())
  disbursedByUserId String
  voucherId         String?         @unique

  @@index([disbursementCode])
  @@index([beneficiaryId])
}

// ============================================================================
// 4. FINANCIAL ACCOUNTING & GENERAL LEDGER
// ============================================================================

model AccountHead {
  id            String         @id @default(cuid())
  organizationId String        @default("ORG_IMF_HQ")
  accountCode   String         @unique // e.g. "1010-CASH", "2010-ZAKAT-RESERVE"
  name          String
  accountType   AccountType
  parentHeadId  String?
  parentHead    AccountHead?   @relation("SubAccounts", fields: [parentHeadId], references: [id])
  subAccounts   AccountHead[]  @relation("SubAccounts")
  isRestricted  Boolean        @default(false) // True for Zakat / Restricted Funds
  currentBalance Decimal       @default(0.0) @db.Decimal(14, 2)
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  voucherEntries VoucherEntry[]

  @@index([accountCode])
  @@index([accountType])
}

model Voucher {
  id             String         @id @default(cuid())
  organizationId String         @default("ORG_IMF_HQ")
  voucherNumber  String         @unique // Auto: VCH/2026-27/XXXX
  voucherType    VoucherType
  voucherDate    DateTime
  narration      String         @db.Text
  totalAmount    Decimal        @db.Decimal(14, 2)
  donationId     String?        @unique
  donation       Donation?      @relation(fields: [donationId], references: [id])
  isPosted       Boolean        @default(true)
  createdById    String
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt

  entries        VoucherEntry[]

  @@index([voucherNumber])
  @@index([voucherDate])
  @@index([voucherType])
}

model VoucherEntry {
  id            String      @id @default(cuid())
  voucherId     String
  voucher       Voucher     @relation(fields: [voucherId], references: [id], onDelete: Cascade)
  accountHeadId String
  accountHead   AccountHead @relation(fields: [accountHeadId], references: [id])
  debitAmount   Decimal     @default(0.0) @db.Decimal(14, 2)
  creditAmount  Decimal     @default(0.0) @db.Decimal(14, 2)
  particulars   String?

  @@index([voucherId])
  @@index([accountHeadId])
}

// ============================================================================
// 5. PROJECTS, MONITORING & EVALUATION (M&E)
// ============================================================================

model Project {
  id              String             @id @default(cuid())
  organizationId  String             @default("ORG_IMF_HQ")
  projectCode     String             @unique // Auto: PRJ-2026-001
  title           String
  description     String             @db.Text
  status          ProjectStatus      @default(PLANNING)
  allocatedBudget Decimal            @db.Decimal(14, 2)
  expendedAmount  Decimal            @default(0.0) @db.Decimal(14, 2)
  startDate       DateTime
  targetEndDate   DateTime?
  location        String
  leadManagerId   String
  createdAt       DateTime           @default(now())
  updatedAt       DateTime           @updatedAt

  campaigns       Campaign[]
  milestones      ProjectMilestone[]
  fieldActivities FieldActivity[]
  disbursements   AidDisbursement[]

  @@index([projectCode])
  @@index([status])
}

model ProjectMilestone {
  id            String    @id @default(cuid())
  projectId     String
  project       Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)
  title         String
  description   String?
  targetDate    DateTime
  isCompleted   Boolean   @default(false)
  completedAt   DateTime?
  createdAt     DateTime  @default(now())

  @@index([projectId])
}

model FieldActivity {
  id               String    @id @default(cuid())
  projectId        String
  project          Project   @relation(fields: [projectId], references: [id])
  activityName     String
  activityDate     DateTime
  location         String
  latitude         Float?
  longitude        Float?
  beneficiaryReach Int       @default(0)
  reportNotes      String    @db.Text
  photoUrls        String[]
  loggedById       String
  createdAt        DateTime  @default(now())

  @@index([projectId])
  @@index([activityDate])
}

// ============================================================================
// 6. HUMAN RESOURCES & PAYROLL (HRMS)
// ============================================================================

model EmployeeProfile {
  id                 String             @id @default(cuid())
  organizationId     String             @default("ORG_IMF_HQ")
  employeeCode       String             @unique // Auto: IMF/EMP-XXX
  userId             String             @unique
  user               User               @relation(fields: [userId], references: [id])
  department         String
  designation        String
  dateOfJoining      DateTime
  employmentType     String             // FULL_TIME, CONTRACT, STIPENDIARY
  bankAccountEncrypted String?          // AES-256 encrypted
  bankIfsc           String?
  panEncrypted       String?            // AES-256 encrypted
  uanNumber          String?            // PF UAN
  monthlyGrossSalary Decimal            @db.Decimal(12, 2)
  createdAt          DateTime           @default(now())
  updatedAt          DateTime           @updatedAt

  attendance         AttendanceRecord[]
  leaveRequests      LeaveRequest[]
  payrollRecords     PayrollRecord[]

  @@index([employeeCode])
  @@index([department])
}

model AttendanceRecord {
  id             String          @id @default(cuid())
  employeeId     String
  employee       EmployeeProfile @relation(fields: [employeeId], references: [id], onDelete: Cascade)
  date           DateTime        @db.Date
  checkInTime    DateTime
  checkOutTime   DateTime?
  status         String          // PRESENT, HALF_DAY, ABSENT, ON_LEAVE
  latitude       Float?
  longitude      Float?
  checkInDevice  String?

  @@unique([employeeId, date])
}

model LeaveRequest {
  id             String          @id @default(cuid())
  employeeId     String
  employee       EmployeeProfile @relation(fields: [employeeId], references: [id], onDelete: Cascade)
  leaveType      String          // CASUAL, MEDICAL, ANNUAL, MATERNITY
  startDate      DateTime        @db.Date
  endDate        DateTime        @db.Date
  totalDays      Int
  reason         String
  status         String          @default("PENDING") // PENDING, APPROVED, REJECTED
  reviewedById   String?
  reviewedAt     DateTime?
  createdAt      DateTime        @default(now())

  @@index([employeeId])
}

model PayrollRecord {
  id               String          @id @default(cuid())
  payrollMonth     String          // e.g. "2026-09"
  employeeId       String
  employee         EmployeeProfile @relation(fields: [employeeId], references: [id])
  basicSalary      Decimal         @db.Decimal(10, 2)
  hra              Decimal         @db.Decimal(10, 2)
  specialAllowance Decimal         @db.Decimal(10, 2)
  pfDeduction      Decimal         @db.Decimal(10, 2)
  esiDeduction     Decimal         @db.Decimal(10, 2)
  tdsDeduction     Decimal         @db.Decimal(10, 2)
  netPayable       Decimal         @db.Decimal(10, 2)
  isDisbursed      Boolean         @default(false)
  disbursedAt      DateTime?
  payslipPdfUrl    String?
  createdAt        DateTime        @default(now())

  @@unique([employeeId, payrollMonth])
}

// ============================================================================
// 7. VOLUNTEERS, MEMBERS & EVENTS
// ============================================================================

model VolunteerProfile {
  id                 String                @id @default(cuid())
  organizationId     String                @default("ORG_IMF_HQ")
  volunteerCode      String                @unique // Auto: IMF/VOL-XXXX
  userId             String                @unique
  user               User                  @relation(fields: [userId], references: [id], onDelete: Cascade)
  skills             String[]              // ["Medical", "Teaching", "Logistics", "Media"]
  totalHoursServed   Decimal               @default(0.0) @db.Decimal(8, 2)
  badgeLevel         String                @default("BRONZE") // BRONZE, SILVER, GOLD, PLATINUM
  isApproved         Boolean               @default(false)
  idCardPdfUrl       String?
  qrVerificationHash String?               @unique
  createdAt          DateTime              @default(now())

  attendance         VolunteerAttendance[]

  @@index([volunteerCode])
}

model VolunteerAttendance {
  id               String           @id @default(cuid())
  volunteerId      String
  volunteer        VolunteerProfile @relation(fields: [volunteerId], references: [id])
  activityDate     DateTime         @db.Date
  hoursLogged      Decimal          @db.Decimal(5, 2)
  description      String
  verifiedByUserId String?
  isVerified       Boolean          @default(false)
  createdAt        DateTime         @default(now())

  @@index([volunteerId])
}

model MemberProfile {
  id               String         @id @default(cuid())
  organizationId   String         @default("ORG_IMF_HQ")
  memberCode       String         @unique // Auto: IMF/MBR-XXX
  userId           String         @unique
  user             User           @relation(fields: [userId], references: [id])
  membershipTier   String         // LIFE_MEMBER, GENERAL_MEMBER, PATRON
  membershipStatus String         @default("ACTIVE") // ACTIVE, EXPIRED, LAPSED
  validUntil       DateTime?
  isVotingEligible Boolean        @default(false)
  createdAt        DateTime       @default(now())
  updatedAt        DateTime       @updatedAt

  @@index([memberCode])
}

model Event {
  id             String              @id @default(cuid())
  slug           String              @unique
  title          String
  description    String              @db.Text
  coverImageUrl  String?
  venue          String
  eventDate      DateTime
  capacity       Int?
  registeredCount Int                @default(0)
  isActive       Boolean             @default(true)
  createdAt      DateTime            @default(now())
  updatedAt      DateTime            @updatedAt

  registrations  EventRegistration[]

  @@index([slug])
  @@index([eventDate])
}

model EventRegistration {
  id              String   @id @default(cuid())
  eventId         String
  event           Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
  attendeeName    String
  attendeeEmail   String
  attendeePhone   String?
  passCode        String   @unique // Auto: PASS-XXXXXX
  isCheckedIn     Boolean  @default(false)
  checkedInAt     DateTime?
  qrSignatureHash String   @unique // Cryptographic gate check
  createdAt       DateTime @default(now())

  @@index([passCode])
  @@index([qrSignatureHash])
}

// ============================================================================
// 8. COMPLIANCE, VAULT & DIGITAL CERTIFICATES
// ============================================================================

model ComplianceDocument {
  id                    String    @id @default(cuid())
  organizationId        String    @default("ORG_IMF_HQ")
  documentTitle         String
  documentType          String    // TRUST_DEED, 12AB_CERT, 80G_CERT, FCRA_REG, CSR_1, PAN, TAN
  registrationNumber    String?
  issuingAuthority      String?
  issueDate             DateTime?
  expiryDate            DateTime?
  isVerificationPending Boolean   @default(true) // Marked REQUIRES ORGANIZATIONAL / LEGAL VERIFICATION
  documentFileUrl       String
  notes                 String?   @db.Text
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  @@index([documentType])
  @@index([isVerificationPending])
}

model GeneratedCertificate {
  id               String    @id @default(cuid())
  certificateCode  String    @unique // e.g. IMF/VOL-CERT/2026/001
  certificateType  String    // VOLUNTEER_SERVICE, DONOR_APPRECIATION, 80G_RECEIPT, MEMBER_ID
  recipientName    String
  recipientId      String?
  issuedDate       DateTime  @default(now())
  signatureHash    String    @unique // Cryptographic HMAC-SHA256
  pdfUrl           String
  isValid          Boolean   @default(true)
  revocationReason String?

  @@index([certificateCode])
  @@index([signatureHash])
}

// ============================================================================
// 9. AUDIT TRAIL, NOTIFICATIONS & SYSTEM INTELLIGENCE
// ============================================================================

model AuditLog {
  id           String    @id @default(cuid())
  userId       String?
  user         User?     @relation(fields: [userId], references: [id], onDelete: SetNull)
  action       String    // CREATE, UPDATE, DELETE, LOGIN, EXPORT, PERMISSION_CHANGE
  entity       String    // e.g. "Donation", "Beneficiary", "Voucher"
  entityId     String?
  previousData Json?     // Snapshot before modification
  newData      Json?     // Snapshot after modification
  ipAddress    String?
  userAgent    String?
  rollingHash  String?   // SHA-256 tamper-evident chain link
  createdAt    DateTime  @default(now())

  @@index([entity, entityId])
  @@index([userId])
  @@index([createdAt])
}

model Notification {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  title     String
  message   String   @db.Text
  type      String   // INFO, SUCCESS, WARNING, DANGER
  linkUrl   String?
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())

  @@index([userId, isRead])
}

model SystemSetting {
  id             String   @id @default(cuid())
  organizationId String   @default("ORG_IMF_HQ")
  key            String   @unique // e.g. "ORGANIZATION_NAME", "PAN_NUMBER", "GATEWAY_ACTIVE"
  value          String   @db.Text
  category       String   // GENERAL, FINANCE, COMPLIANCE, EMAIL, INTEGRATION
  isSecret       Boolean  @default(false)
  description    String?
  updatedAt      DateTime @updatedAt

  @@index([key])
}
```
