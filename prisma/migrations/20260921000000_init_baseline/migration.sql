-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION');

-- CreateEnum
CREATE TYPE "RoleType" AS ENUM ('SUPER_ADMIN', 'TRUSTEE', 'DIRECTOR', 'FINANCE_OFFICER', 'PROJECT_MANAGER', 'FIELD_WORKER', 'DONOR', 'VOLUNTEER', 'MEMBER', 'AUDITOR');

-- CreateEnum
CREATE TYPE "StorageBucket" AS ENUM ('PUBLIC_ASSETS', 'PRIVATE_KYC', 'TAX_RECEIPTS', 'LEGAL_VAULT');

-- CreateEnum
CREATE TYPE "ContentWorkflowStatus" AS ENUM ('DRAFT', 'REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ArticleType" AS ENUM ('BLOG', 'NEWS', 'PRESS_RELEASE');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('PHOTO', 'VIDEO');

-- CreateEnum
CREATE TYPE "FaqCategory" AS ENUM ('GENERAL', 'ZAKAT_KHUMS', 'DONATIONS_80G', 'VOLUNTEERING', 'BENEFICIARY_AID');

-- CreateEnum
CREATE TYPE "ComplianceStatus" AS ENUM ('UNVERIFIED', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "FundType" AS ENUM ('ZAKAT_MAL', 'ZAKAT_FITRAH', 'KHUMS_SEHAM_E_IMAM', 'KHUMS_SEHAM_E_SADAT', 'GENERAL_SADAQAH', 'ORPHAN_AID', 'MEDICAL_AID', 'EDUCATION_GRANT', 'WATER_INFRASTRUCTURE', 'EMERGENCY_DISASTER_RELIEF');

-- CreateEnum
CREATE TYPE "DonationStatus" AS ENUM ('INITIATED', 'PENDING', 'SUCCESS', 'FAILED', 'CANCELLED', 'REFUNDED', 'PARTIALLY_REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentProviderType" AS ENUM ('RAZORPAY', 'STRIPE', 'UPI_MANUAL', 'BANK_TRANSFER', 'MOCK');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CARD', 'NETBANKING', 'UPI', 'WALLET', 'BANK_TRANSFER_NEFT', 'CASH', 'CHEQUE', 'STRIPE_CHECKOUT');

-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('ASSET', 'LIABILITY', 'EQUITY_RESERVE', 'INCOME', 'EXPENSE');

-- CreateEnum
CREATE TYPE "VoucherType" AS ENUM ('RECEIPT', 'PAYMENT', 'JOURNAL', 'CONTRA');

-- CreateEnum
CREATE TYPE "MembershipType" AS ENUM ('ANNUAL', 'LIFETIME', 'PATRON', 'HONORARY', 'STUDENT');

-- CreateEnum
CREATE TYPE "MembershipStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED', 'EXPIRED', 'LAPSED');

-- CreateEnum
CREATE TYPE "VolunteerStatus" AS ENUM ('APPLIED', 'UNDER_REVIEW', 'APPROVED', 'ACTIVE', 'ON_LEAVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CertificateType" AS ENUM ('MEMBERSHIP_CERTIFICATE', 'VOLUNTEER_APPRECIATION', 'VOLUNTEER_EXCELLENCE', 'DONOR_HONOR', 'INTERNSHIP_COMPLETION');

-- CreateEnum
CREATE TYPE "ProjectStage" AS ENUM ('IDEA', 'PROPOSAL', 'APPROVED', 'FUNDRAISING', 'EXECUTION', 'FIELD_OPERATIONS', 'MONITORING', 'IMPACT_EVALUATION', 'CLOSURE', 'FINAL_REPORT_SUBMITTED');

-- CreateEnum
CREATE TYPE "ProjectCategory" AS ENUM ('WATER_SANITATION', 'HEALTHCARE_MEDICAL', 'ORPHAN_EDUCATION', 'EMERGENCY_DISASTER_RELIEF', 'FOOD_SECURITY', 'LIVELIHOOD_EMPOWERMENT', 'INFRASTRUCTURE_HOUSING', 'RELIGIOUS_COMMUNITY');

-- CreateEnum
CREATE TYPE "BeneficiaryCategory" AS ENUM ('ORPHAN_SUPPORT', 'WIDOW_ASSISTANCE', 'MEDICAL_EMERGENCY', 'EDUCATION_AID', 'FOOD_NUTRITION', 'DISABILITY_SUPPORT', 'LIVELIHOOD_HOUSING', 'GENERAL_DISTRESS');

-- CreateEnum
CREATE TYPE "VulnerabilityTier" AS ENUM ('CRITICAL_URGENT', 'HIGH_PRIORITY', 'MODERATE', 'STABLE_MONITORING');

-- CreateEnum
CREATE TYPE "BeneficiaryVerificationStatus" AS ENUM ('PENDING_VERIFICATION', 'FIELD_VERIFIED', 'APPROVED', 'REJECTED', 'INACTIVE');

-- CreateEnum
CREATE TYPE "AssistanceType" AS ENUM ('DIRECT_BANK_TRANSFER', 'IN_KIND_GOODS', 'MEDICAL_SUBSIDY', 'RATION_KIT', 'FEE_PAYMENT', 'HOUSING_REPAIR');

-- CreateEnum
CREATE TYPE "FieldVisitStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'SUBMITTED_FOR_REVIEW', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('IN_PERSON', 'VIRTUAL_ONLINE', 'HYBRID');

-- CreateEnum
CREATE TYPE "EventCategory" AS ENUM ('MEDICAL_CAMP', 'COMMUNITY_MAJLIS', 'VOLUNTEER_DRIVE', 'SEMINAR_WORKSHOP', 'ANNUAL_GALA', 'EMERGENCY_MOBILIZATION', 'YOUTH_CONFERENCE');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "EventRegistrationStatus" AS ENUM ('REGISTERED', 'WAITLISTED', 'CONFIRMED', 'CHECKED_IN', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "TicketType" AS ENUM ('STANDARD', 'VIP', 'VOLUNTEER_DELEGATE', 'SPEAKER_GUEST');

-- CreateEnum
CREATE TYPE "AttendanceMethod" AS ENUM ('QR_SCAN_GATE', 'MANUAL_OVERRIDE', 'VIRTUAL_JOIN_LOG');

-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'CONSULTANT');

-- CreateEnum
CREATE TYPE "EmployeeStatus" AS ENUM ('PROBATION', 'ACTIVE', 'ON_LEAVE', 'SUSPENDED', 'NOTICE_PERIOD', 'RESIGNED', 'TERMINATED', 'RETIRED');

-- CreateEnum
CREATE TYPE "JobPostingStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'INTERNAL_ONLY', 'ON_HOLD', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "JobApplicationStatus" AS ENUM ('APPLIED', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'INTERVIEWED', 'OFFER_EXTENDED', 'OFFER_ACCEPTED', 'OFFER_REJECTED', 'HIRED_APPOINTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "InterviewRound" AS ENUM ('HR_SCREENING', 'TECHNICAL_ASSESSMENT', 'LEADERSHIP_BOARD', 'SHARIA_GOVERNANCE');

-- CreateEnum
CREATE TYPE "InterviewRecommendation" AS ENUM ('STRONG_HIRE', 'HIRE', 'NEUTRAL_HOLD', 'DO_NOT_HIRE');

-- CreateEnum
CREATE TYPE "JobOfferStatus" AS ENUM ('DRAFT', 'EXTENDED_PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'HALF_DAY', 'ON_LEAVE', 'REMOTE_WORK', 'HOLIDAY');

-- CreateEnum
CREATE TYPE "LeaveType" AS ENUM ('ANNUAL_CASUAL', 'SICK_MEDICAL', 'MATERNITY_PATERNITY', 'HAJJ_UMRAH_PILGRIMAGE', 'BEREAVEMENT', 'UNPAID_LOP');

-- CreateEnum
CREATE TYPE "LeaveApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PerformanceRating" AS ENUM ('EXCEEDS_EXPECTATIONS', 'MEETS_EXPECTATIONS', 'NEEDS_DEVELOPMENT', 'UNSATISFACTORY');

-- CreateEnum
CREATE TYPE "ExitClearanceStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'CLEARED', 'DISPUTED');

-- CreateEnum
CREATE TYPE "PayrollPeriodStatus" AS ENUM ('DRAFT', 'PROCESSING', 'PENDING_APPROVAL', 'APPROVED', 'DISBURSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PayslipStatus" AS ENUM ('DRAFT', 'CALCULATED', 'APPROVED', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DisbursementMode" AS ENUM ('BANK_TRANSFER', 'UPI_DIRECT', 'NEFT_RTGS', 'CHEQUE', 'CASH_IMPREST');

-- CreateEnum
CREATE TYPE "StatutoryRuleCategory" AS ENUM ('INCOME_TAX_TDS', 'PROVIDENT_FUND', 'EMPLOYEE_STATE_INSURANCE', 'PROFESSIONAL_TAX', 'CUSTOM_ALLOWANCE', 'CUSTOM_DEDUCTION');

-- CreateEnum
CREATE TYPE "GrantType" AS ENUM ('INSTITUTIONAL_GRANT', 'CSR_CORPORATE', 'GOVERNMENT_SUBSIDY', 'FOUNDATION_TRUST', 'BILATERAL_AID', 'OTHER');

-- CreateEnum
CREATE TYPE "GrantStatus" AS ENUM ('PROPOSED', 'SANCTIONED', 'ACTIVE', 'FULLY_UTILIZED', 'EXPIRED', 'TERMINATED');

-- CreateEnum
CREATE TYPE "VendorCategory" AS ENUM ('SUPPLIES_MATERIALS', 'CONTRACTOR_SERVICES', 'MEDICAL_LOGISTICS', 'UTILITIES_RENT', 'PROFESSIONAL_LEGAL_AUDIT', 'IT_INFRASTRUCTURE', 'OTHER');

-- CreateEnum
CREATE TYPE "ExpenseCategory" AS ENUM ('PROJECT_EXECUTION', 'ADMINISTRATIVE_OVERHEAD', 'FIELD_LOGISTICS', 'RELIEF_AID_DIRECT', 'UTILITIES_RENT', 'LEGAL_AND_AUDIT', 'CAPITAL_EXPENDITURE', 'MARKETING_COMMUNICATION');

-- CreateEnum
CREATE TYPE "ExpenseStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'PAID', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BudgetStatus" AS ENUM ('DRAFT', 'APPROVED', 'ACTIVE', 'REVISED', 'CLOSED');

-- CreateEnum
CREATE TYPE "ReconciliationStatus" AS ENUM ('PENDING', 'RECONCILED', 'DISCREPANCY_FLAGGED');

-- CreateEnum
CREATE TYPE "ReconciliationItemType" AS ENUM ('UNCREDITED_DEPOSIT', 'UNPRESENTED_CHEQUE', 'BANK_CHARGE_UNRECORDED', 'DIRECT_DEBIT', 'INTEREST_CREDIT', 'OTHER_ADJUSTMENT');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('DONATION_RECEIPT', 'MEMBER_ID', 'EMPLOYEE_ID', 'MEMBERSHIP_CERTIFICATE', 'VOLUNTEER_CERTIFICATE', 'APPRECIATION_CERTIFICATE', 'APPOINTMENT_LETTER', 'OFFER_LETTER', 'PAYSLIP', 'DONATION_STATEMENT', 'PROJECT_REPORT', 'IMPACT_REPORT');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('VALID', 'REVOKED', 'EXPIRED', 'PENDING_APPROVAL');

-- CreateEnum
CREATE TYPE "CommunicationChannel" AS ENUM ('EMAIL', 'WHATSAPP', 'SMS', 'IN_APP');

-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('QUEUED', 'SENT', 'DELIVERED', 'FAILED', 'READ');

-- CreateEnum
CREATE TYPE "ComplianceCategory" AS ENUM ('INCORPORATION_GOVERNANCE', 'DIRECT_TAX_12A_80G', 'INDIRECT_TAX_GST_PT', 'FCRA_FOREIGN_CONTRIBUTION', 'CSR_CORPORATE_GRANTS', 'STATUTORY_AUDIT_ACCOUNTS', 'ANNUAL_STATUTORY_FILINGS', 'ORGANIZATIONAL_POLICIES', 'LEGAL_AGREEMENTS_CONTRACTS', 'LABOUR_EPF_ESIC');

-- CreateEnum
CREATE TYPE "CompliancePeriodicity" AS ENUM ('ANNUAL', 'SEMI_ANNUAL', 'QUARTERLY', 'MONTHLY', 'ONE_TIME', 'EVENT_DRIVEN');

-- CreateEnum
CREATE TYPE "ComplianceFilingStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'FILED_PENDING_ACK', 'COMPLETED', 'OVERDUE', 'EXEMPTED');

-- CreateEnum
CREATE TYPE "ProfessionalVerificationStatus" AS ENUM ('UNVERIFIED', 'REQUIRES_PROFESSIONAL_VERIFICATION', 'VERIFIED_BY_CHARTERED_ACCOUNTANT', 'VERIFIED_BY_COMPANY_SECRETARY', 'VERIFIED_BY_LEGAL_COUNSEL', 'REJECTED_NEEDS_REVISION');

-- CreateEnum
CREATE TYPE "AiTaskType" AS ENUM ('CONTENT_DRAFTING', 'CAMPAIGN_WRITING', 'BLOG_DRAFTING', 'EMAIL_DRAFTING', 'WHATSAPP_DRAFTING', 'TRANSLATION', 'SUMMARIZATION', 'REPORT_DRAFTING', 'IMPACT_REPORT_DRAFTING', 'DATA_INSIGHTS', 'DASHBOARD_EXPLANATION', 'FAQ_GENERATION', 'SEO_ASSISTANCE');

-- CreateEnum
CREATE TYPE "AiSafetyDomain" AS ENUM ('GENERAL_PUBLIC', 'LEGAL', 'FINANCIAL', 'COMPLIANCE', 'REGULATORY');

-- CreateEnum
CREATE TYPE "AiDraftStatus" AS ENUM ('DRAFT_PENDING_REVIEW', 'APPROVED', 'REJECTED', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "OfficeType" AS ENUM ('GLOBAL_HEADQUARTERS', 'REGIONAL_CHAPTER', 'NATIONAL_OFFICE', 'FIELD_OUTPOST', 'LIAISON_OFFICE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL DEFAULT 'ORG_IMF_HQ',
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "passwordHash" TEXT,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "avatarUrl" TEXT,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorSecret" TEXT,
    "preferredLanguage" TEXT NOT NULL DEFAULT 'en',
    "countryCode" TEXT NOT NULL DEFAULT 'IND',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" "RoleType" NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "previousData" JSONB,
    "newData" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "rollingHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemSetting" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL DEFAULT 'ORG_IMF_HQ',
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "isSecret" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StorageObject" (
    "id" TEXT NOT NULL,
    "fileKey" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "bucket" "StorageBucket" NOT NULL,
    "isEncrypted" BOOLEAN NOT NULL DEFAULT false,
    "encryptionIv" TEXT,
    "authTag" TEXT,
    "uploadedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "StorageObject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CmsPage" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleUrdu" TEXT,
    "titleHindi" TEXT,
    "titleArabic" TEXT,
    "subtitle" TEXT,
    "contentHtml" TEXT NOT NULL,
    "contentJson" JSONB,
    "status" "ContentWorkflowStatus" NOT NULL DEFAULT 'DRAFT',
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "ogImageUrl" TEXT,
    "authorId" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CmsPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CmsProgram" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "iconName" TEXT NOT NULL DEFAULT 'Heart',
    "coverImageUrl" TEXT NOT NULL,
    "beneficiariesCount" INTEGER NOT NULL DEFAULT 0,
    "status" "ContentWorkflowStatus" NOT NULL DEFAULT 'DRAFT',
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CmsProgram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CmsArticle" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "ArticleType" NOT NULL DEFAULT 'BLOG',
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "coverImageUrl" TEXT NOT NULL,
    "tags" TEXT[],
    "authorName" TEXT NOT NULL DEFAULT 'Editorial Team',
    "authorId" TEXT,
    "readingMinutes" INTEGER NOT NULL DEFAULT 4,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "status" "ContentWorkflowStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CmsArticle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CmsStory" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "beneficiaryName" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "quote" TEXT NOT NULL,
    "storyFull" TEXT NOT NULL,
    "coverImageUrl" TEXT NOT NULL,
    "beforeAfterImage" TEXT,
    "status" "ContentWorkflowStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CmsStory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CmsMediaAsset" (
    "id" TEXT NOT NULL,
    "type" "MediaType" NOT NULL DEFAULT 'PHOTO',
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "mediaUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "eventDate" TIMESTAMP(3),
    "status" "ContentWorkflowStatus" NOT NULL DEFAULT 'PUBLISHED',
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CmsMediaAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CmsFaq" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "category" "FaqCategory" NOT NULL DEFAULT 'GENERAL',
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "status" "ContentWorkflowStatus" NOT NULL DEFAULT 'PUBLISHED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CmsFaq_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CmsMenuItem" (
    "id" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "parentId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "CmsMenuItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublicInquiry" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'GENERAL',
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PublicInquiry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VolunteerApplication" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT,
    "skills" TEXT[],
    "availability" TEXT NOT NULL,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VolunteerApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DonationCategory" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL DEFAULT 'ORG_IMF_HQ',
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fundType" "FundType" NOT NULL DEFAULT 'GENERAL_SADAQAH',
    "description" TEXT NOT NULL,
    "iconName" TEXT NOT NULL DEFAULT 'Heart',
    "is80GEligible" BOOLEAN NOT NULL DEFAULT false,
    "is12ABEligible" BOOLEAN NOT NULL DEFAULT false,
    "isFcraEligible" BOOLEAN NOT NULL DEFAULT false,
    "isZakatEligible" BOOLEAN NOT NULL DEFAULT false,
    "isKhumsEligible" BOOLEAN NOT NULL DEFAULT false,
    "taxDeductionPercent" INTEGER NOT NULL DEFAULT 0,
    "complianceStatus" "ComplianceStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "complianceApprovedBy" TEXT,
    "complianceApprovalDate" TIMESTAMP(3),
    "complianceNotes" TEXT,
    "chartOfAccountId" TEXT,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DonationCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL DEFAULT 'ORG_IMF_HQ',
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleUrdu" TEXT,
    "titleHindi" TEXT,
    "titleArabic" TEXT,
    "shortDescription" TEXT NOT NULL,
    "fullDescription" TEXT NOT NULL,
    "coverImageUrl" TEXT NOT NULL,
    "galleryImages" TEXT[],
    "categoryId" TEXT,
    "fundType" "FundType" NOT NULL DEFAULT 'GENERAL_SADAQAH',
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "targetAmount" DECIMAL(14,2) NOT NULL,
    "raisedAmount" DECIMAL(14,2) NOT NULL DEFAULT 0.0,
    "donorCount" INTEGER NOT NULL DEFAULT 0,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isEmergencyAppeal" BOOLEAN NOT NULL DEFAULT false,
    "is80GEligible" BOOLEAN NOT NULL DEFAULT false,
    "is12ABEligible" BOOLEAN NOT NULL DEFAULT false,
    "isFcraEligible" BOOLEAN NOT NULL DEFAULT false,
    "isZakatEligible" BOOLEAN NOT NULL DEFAULT false,
    "isKhumsEligible" BOOLEAN NOT NULL DEFAULT false,
    "taxDeductionPercent" INTEGER NOT NULL DEFAULT 0,
    "complianceStatus" "ComplianceStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "complianceApprovedBy" TEXT,
    "complianceApprovalDate" TIMESTAMP(3),
    "complianceNotes" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DonorProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "panEncrypted" TEXT,
    "panMasked" TEXT,
    "nationalIdEncrypted" TEXT,
    "isTaxExemptEligible" BOOLEAN NOT NULL DEFAULT false,
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "postalCode" TEXT,
    "country" TEXT NOT NULL DEFAULT 'India',
    "totalDonatedAmount" DECIMAL(14,2) NOT NULL DEFAULT 0.0,
    "donationCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DonorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Donation" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL DEFAULT 'ORG_IMF_HQ',
    "receiptNumber" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "donorId" TEXT,
    "campaignId" TEXT,
    "categoryId" TEXT,
    "donorName" TEXT NOT NULL,
    "donorEmail" TEXT NOT NULL,
    "donorPhone" TEXT,
    "donorPanMasked" TEXT,
    "donorAddress" TEXT,
    "amount" DECIMAL(14,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "forexRateToINR" DECIMAL(8,4) NOT NULL DEFAULT 1.0,
    "amountInINR" DECIMAL(14,2) NOT NULL,
    "fundType" "FundType" NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'UPI',
    "paymentProvider" "PaymentProviderType" NOT NULL DEFAULT 'MOCK',
    "paymentStatus" "DonationStatus" NOT NULL DEFAULT 'INITIATED',
    "gatewayOrderId" TEXT,
    "gatewayPaymentId" TEXT,
    "gatewaySignature" TEXT,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "is80GRequested" BOOLEAN NOT NULL DEFAULT false,
    "is80GIssued" BOOLEAN NOT NULL DEFAULT false,
    "receiptPdfUrl" TEXT,
    "qrVerificationHash" TEXT,
    "failedReason" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Donation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentTransaction" (
    "id" TEXT NOT NULL,
    "donationId" TEXT NOT NULL,
    "provider" "PaymentProviderType" NOT NULL,
    "gatewayOrderId" TEXT,
    "gatewayPaymentId" TEXT,
    "gatewaySignature" TEXT,
    "amount" DECIMAL(14,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" "DonationStatus" NOT NULL DEFAULT 'PENDING',
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "rawPayload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxExemptionReceipt" (
    "id" TEXT NOT NULL,
    "certificateNumber" TEXT NOT NULL,
    "donationId" TEXT NOT NULL,
    "donorName" TEXT NOT NULL,
    "donorPan" TEXT NOT NULL,
    "donorAddress" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "financialYear" TEXT NOT NULL,
    "deductionPercent" INTEGER NOT NULL DEFAULT 50,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pdfUrl" TEXT,
    "qrVerificationUrl" TEXT NOT NULL,
    "signatureHash" TEXT NOT NULL,

    CONSTRAINT "TaxExemptionReceipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefundRecord" (
    "id" TEXT NOT NULL,
    "donationId" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "reason" TEXT NOT NULL,
    "gatewayRefundId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "approvedByUserId" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RefundRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountHead" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL DEFAULT 'ORG_IMF_HQ',
    "accountCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "accountType" "AccountType" NOT NULL,
    "parentHeadId" TEXT,
    "isRestricted" BOOLEAN NOT NULL DEFAULT false,
    "currentBalance" DECIMAL(14,2) NOT NULL DEFAULT 0.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccountHead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Voucher" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL DEFAULT 'ORG_IMF_HQ',
    "voucherNumber" TEXT NOT NULL,
    "voucherType" "VoucherType" NOT NULL DEFAULT 'RECEIPT',
    "voucherDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "narration" TEXT NOT NULL,
    "totalAmount" DECIMAL(14,2) NOT NULL,
    "donationId" TEXT,
    "isPosted" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT NOT NULL DEFAULT 'SYSTEM_ENGINE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Voucher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VoucherEntry" (
    "id" TEXT NOT NULL,
    "voucherId" TEXT NOT NULL,
    "accountHeadId" TEXT NOT NULL,
    "debitAmount" DECIMAL(14,2) NOT NULL DEFAULT 0.0,
    "creditAmount" DECIMAL(14,2) NOT NULL DEFAULT 0.0,
    "particulars" TEXT,

    CONSTRAINT "VoucherEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemberProfile" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL DEFAULT 'ORG_IMF_HQ',
    "membershipNumber" TEXT NOT NULL,
    "userId" TEXT,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "gender" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "avatarUrl" TEXT,
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT,
    "postalCode" TEXT,
    "country" TEXT NOT NULL DEFAULT 'India',
    "membershipType" "MembershipType" NOT NULL DEFAULT 'ANNUAL',
    "status" "MembershipStatus" NOT NULL DEFAULT 'PENDING',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3) NOT NULL,
    "renewedAt" TIMESTAMP(3),
    "renewalCount" INTEGER NOT NULL DEFAULT 0,
    "digitalCardUrl" TEXT,
    "qrVerificationHash" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MemberProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MembershipRenewalRecord" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "previousEndDate" TIMESTAMP(3) NOT NULL,
    "newEndDate" TIMESTAMP(3) NOT NULL,
    "amountPaid" DECIMAL(14,2) NOT NULL DEFAULT 0.0,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'UPI',
    "paymentReference" TEXT,
    "renewedBy" TEXT NOT NULL DEFAULT 'SELF',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MembershipRenewalRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VolunteerProfile" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL DEFAULT 'ORG_IMF_HQ',
    "volunteerNumber" TEXT NOT NULL,
    "userId" TEXT,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT,
    "country" TEXT NOT NULL DEFAULT 'India',
    "avatarUrl" TEXT,
    "status" "VolunteerStatus" NOT NULL DEFAULT 'APPLIED',
    "skills" TEXT[],
    "languages" TEXT[],
    "availability" TEXT NOT NULL,
    "interests" TEXT[],
    "emergencyContactName" TEXT,
    "emergencyContactPhone" TEXT,
    "totalHoursLogged" DECIMAL(10,2) NOT NULL DEFAULT 0.0,
    "totalAssignmentsCount" INTEGER NOT NULL DEFAULT 0,
    "performanceRating" DECIMAL(3,2) NOT NULL DEFAULT 5.0,
    "digitalBadgeUrl" TEXT,
    "qrVerificationHash" TEXT NOT NULL,
    "verifiedByUserId" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VolunteerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VolunteerAssignment" (
    "id" TEXT NOT NULL,
    "assignmentNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "volunteerId" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "programOrProject" TEXT,
    "requiredSkills" TEXT[],
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "status" "AssignmentStatus" NOT NULL DEFAULT 'ASSIGNED',
    "coordinatorName" TEXT,
    "coordinatorContact" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VolunteerAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VolunteerHoursLog" (
    "id" TEXT NOT NULL,
    "volunteerId" TEXT NOT NULL,
    "assignmentId" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hoursLogged" DECIMAL(6,2) NOT NULL,
    "tasksCompleted" TEXT NOT NULL,
    "supervisorRating" INTEGER NOT NULL DEFAULT 5,
    "supervisorNotes" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT true,
    "verifiedBy" TEXT NOT NULL DEFAULT 'COORDINATOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VolunteerHoursLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfficialCertificate" (
    "id" TEXT NOT NULL,
    "certificateNumber" TEXT NOT NULL,
    "certificateType" "CertificateType" NOT NULL,
    "recipientName" TEXT NOT NULL,
    "recipientEmail" TEXT NOT NULL,
    "memberId" TEXT,
    "volunteerId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "signatureHash" TEXT NOT NULL,
    "qrVerificationUrl" TEXT NOT NULL,
    "pdfUrl" TEXT,
    "signatoryName" TEXT NOT NULL DEFAULT 'Central Governance Board',
    "signatoryTitle" TEXT NOT NULL DEFAULT 'Executive Director & Trustee',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OfficialCertificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL DEFAULT 'ORG_IMF_HQ',
    "projectNumber" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "ProjectCategory" NOT NULL DEFAULT 'EMERGENCY_DISASTER_RELIEF',
    "stage" "ProjectStage" NOT NULL DEFAULT 'IDEA',
    "locationCountry" TEXT NOT NULL DEFAULT 'India',
    "locationState" TEXT,
    "locationDistrict" TEXT,
    "targetBeneficiariesCount" INTEGER NOT NULL DEFAULT 0,
    "actualBeneficiariesCount" INTEGER NOT NULL DEFAULT 0,
    "allocatedBudgetINR" DECIMAL(14,2) NOT NULL DEFAULT 0.0,
    "disbursedAmountINR" DECIMAL(14,2) NOT NULL DEFAULT 0.0,
    "startDate" TIMESTAMP(3),
    "targetCompletionDate" TIMESTAMP(3),
    "actualCompletionDate" TIMESTAMP(3),
    "projectManagerUserId" TEXT,
    "isPublicFeatured" BOOLEAN NOT NULL DEFAULT false,
    "closureReportSummary" TEXT,
    "closureAuditedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectMilestone" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "targetDate" TIMESTAMP(3) NOT NULL,
    "completionDate" TIMESTAMP(3),
    "budgetAllocationINR" DECIMAL(14,2) NOT NULL DEFAULT 0.0,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "verificationNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectMilestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectMetric" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "indicatorName" TEXT NOT NULL,
    "unitOfMeasure" TEXT NOT NULL,
    "targetValue" DECIMAL(12,2) NOT NULL,
    "currentValue" DECIMAL(12,2) NOT NULL DEFAULT 0.0,
    "lastEvaluatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "evaluationNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BeneficiaryProfile" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL DEFAULT 'ORG_IMF_HQ',
    "beneficiaryNumber" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3),
    "phone" TEXT,
    "city" TEXT NOT NULL,
    "district" TEXT,
    "state" TEXT,
    "country" TEXT NOT NULL DEFAULT 'India',
    "addressLine" TEXT,
    "category" "BeneficiaryCategory" NOT NULL DEFAULT 'GENERAL_DISTRESS',
    "vulnerabilityTier" "VulnerabilityTier" NOT NULL DEFAULT 'MODERATE',
    "vulnerabilityScore" INTEGER NOT NULL DEFAULT 50,
    "verificationStatus" "BeneficiaryVerificationStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "verifiedByUserId" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "encryptedNationalId" TEXT,
    "nationalIdMasked" TEXT,
    "encryptedRationCard" TEXT,
    "rationCardMasked" TEXT,
    "encryptedBankAccount" TEXT,
    "bankAccountMasked" TEXT,
    "encryptedIfscCode" TEXT,
    "householdMemberCount" INTEGER NOT NULL DEFAULT 1,
    "monthlyIncomeINR" DECIMAL(12,2) NOT NULL DEFAULT 0.0,
    "primaryNeedSummary" TEXT NOT NULL,
    "estimatedAidRequiredINR" DECIMAL(14,2) NOT NULL DEFAULT 0.0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BeneficiaryProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BeneficiaryProjectLink" (
    "id" TEXT NOT NULL,
    "beneficiaryId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BeneficiaryProjectLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BeneficiaryFamilyMember" (
    "id" TEXT NOT NULL,
    "beneficiaryId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "relation" TEXT NOT NULL,
    "age" INTEGER,
    "gender" TEXT,
    "occupation" TEXT,
    "healthStatus" TEXT,
    "isDependent" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BeneficiaryFamilyMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BeneficiaryDocument" (
    "id" TEXT NOT NULL,
    "beneficiaryId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "encryptedFileUrl" TEXT NOT NULL,
    "fileMimeType" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedByUserId" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BeneficiaryDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BeneficiaryAssistance" (
    "id" TEXT NOT NULL,
    "assistanceNumber" TEXT NOT NULL,
    "beneficiaryId" TEXT NOT NULL,
    "projectId" TEXT,
    "assistanceType" "AssistanceType" NOT NULL DEFAULT 'DIRECT_BANK_TRANSFER',
    "amountINR" DECIMAL(14,2) NOT NULL DEFAULT 0.0,
    "itemDescription" TEXT NOT NULL,
    "disbursementDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "disbursedByUserId" TEXT,
    "paymentReference" TEXT,
    "receiptReference" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DISBURSED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BeneficiaryAssistance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BeneficiaryFollowUp" (
    "id" TEXT NOT NULL,
    "beneficiaryId" TEXT NOT NULL,
    "followUpDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "officerUserId" TEXT,
    "findingsNotes" TEXT NOT NULL,
    "socioeconomicOutcome" TEXT NOT NULL,
    "nextFollowUpDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BeneficiaryFollowUp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FieldVisit" (
    "id" TEXT NOT NULL,
    "visitNumber" TEXT NOT NULL,
    "projectId" TEXT,
    "beneficiaryId" TEXT,
    "officerOrVolunteerUserId" TEXT NOT NULL,
    "scheduledDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedDate" TIMESTAMP(3),
    "status" "FieldVisitStatus" NOT NULL DEFAULT 'SCHEDULED',
    "gpsLatitude" DECIMAL(10,7),
    "gpsLongitude" DECIMAL(10,7),
    "locationAddress" TEXT,
    "geoPhotoUrls" TEXT[],
    "fieldObservations" TEXT,
    "needsVerificationSummary" TEXT,
    "supervisorReviewNotes" TEXT,
    "supervisorRating" INTEGER,
    "reviewedByUserId" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FieldVisit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FieldSurveyResponse" (
    "id" TEXT NOT NULL,
    "surveyNumber" TEXT NOT NULL,
    "fieldVisitId" TEXT,
    "beneficiaryId" TEXT,
    "surveyTemplateTitle" TEXT NOT NULL,
    "answersJson" JSONB NOT NULL,
    "isOfflineCaptured" BOOLEAN NOT NULL DEFAULT false,
    "clientCapturedAt" TIMESTAMP(3),
    "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "syncDeviceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FieldSurveyResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "eventNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "eventType" "EventType" NOT NULL DEFAULT 'IN_PERSON',
    "category" "EventCategory" NOT NULL DEFAULT 'COMMUNITY_MAJLIS',
    "status" "EventStatus" NOT NULL DEFAULT 'DRAFT',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "registrationDeadline" TIMESTAMP(3),
    "capacityMax" INTEGER NOT NULL DEFAULT 100,
    "capacityReserved" INTEGER NOT NULL DEFAULT 0,
    "isFree" BOOLEAN NOT NULL DEFAULT true,
    "ticketFeeINR" DECIMAL(10,2) NOT NULL DEFAULT 0.0,
    "allowWaitlist" BOOLEAN NOT NULL DEFAULT true,
    "requiresApproval" BOOLEAN NOT NULL DEFAULT false,
    "venueName" TEXT,
    "venueAddress" TEXT,
    "venueCity" TEXT,
    "venueMapUrl" TEXT,
    "venueGpsLat" DECIMAL(10,7),
    "venueGpsLng" DECIMAL(10,7),
    "isVirtual" BOOLEAN NOT NULL DEFAULT false,
    "meetingPlatform" TEXT,
    "meetingJoinUrl" TEXT,
    "meetingStreamKeyMasked" TEXT,
    "meetingRecordingUrl" TEXT,
    "streamEmbedCode" TEXT,
    "coverImageUrl" TEXT,
    "bannerImageUrl" TEXT,
    "galleryUrls" TEXT[],
    "organizerName" TEXT NOT NULL DEFAULT 'Imam E Mahdi Foundation',
    "organizerEmail" TEXT NOT NULL DEFAULT 'events@imf-ngo.org',
    "organizerPhone" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventSpeaker" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "titleRole" TEXT NOT NULL,
    "organization" TEXT,
    "bio" TEXT,
    "photoUrl" TEXT,
    "topicTitle" TEXT,
    "presentationTime" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventSpeaker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventRegistration" (
    "id" TEXT NOT NULL,
    "registrationNumber" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "city" TEXT,
    "organization" TEXT,
    "notes" TEXT,
    "registrationStatus" "EventRegistrationStatus" NOT NULL DEFAULT 'REGISTERED',
    "ticketType" "TicketType" NOT NULL DEFAULT 'STANDARD',
    "passSignatureHash" TEXT NOT NULL,
    "qrVerificationUrl" TEXT NOT NULL,
    "isCheckedIn" BOOLEAN NOT NULL DEFAULT false,
    "checkedInAt" TIMESTAMP(3),
    "checkedInByUserId" TEXT,
    "attendanceMethod" "AttendanceMethod",
    "hasSubmittedFeedback" BOOLEAN NOT NULL DEFAULT false,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventFeedback" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "registrationId" TEXT,
    "participantName" TEXT,
    "ratingOverall" INTEGER NOT NULL DEFAULT 5,
    "ratingContent" INTEGER NOT NULL DEFAULT 5,
    "ratingVenueOrPlatform" INTEGER NOT NULL DEFAULT 5,
    "comments" TEXT,
    "suggestions" TEXT,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventReport" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "totalRegistered" INTEGER NOT NULL DEFAULT 0,
    "totalAttended" INTEGER NOT NULL DEFAULT 0,
    "totalVolunteersEngaged" INTEGER NOT NULL DEFAULT 0,
    "attendanceRatePercent" DECIMAL(5,2) NOT NULL DEFAULT 0.0,
    "totalCostINR" DECIMAL(14,2) NOT NULL DEFAULT 0.0,
    "keyOutcomes" TEXT NOT NULL,
    "shariaComplianceCertified" BOOLEAN NOT NULL DEFAULT true,
    "submittedByUserId" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "headOfDeptUserId" TEXT,
    "budgetAllocationINR" DECIMAL(14,2) NOT NULL DEFAULT 0.0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Designation" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "payBandGrade" TEXT,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Designation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeProfile" (
    "id" TEXT NOT NULL,
    "employeeNumber" TEXT NOT NULL,
    "userId" TEXT,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "gender" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "bloodGroup" TEXT,
    "departmentId" TEXT NOT NULL,
    "designationId" TEXT NOT NULL,
    "employmentType" "EmploymentType" NOT NULL DEFAULT 'FULL_TIME',
    "status" "EmployeeStatus" NOT NULL DEFAULT 'PROBATION',
    "joiningDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmationDate" TIMESTAMP(3),
    "probationEndDate" TIMESTAMP(3),
    "resignationDate" TIMESTAMP(3),
    "lastWorkingDate" TIMESTAMP(3),
    "reportingManagerId" TEXT,
    "encryptedNationalId" TEXT,
    "encryptedTaxId" TEXT,
    "encryptedBankAccount" TEXT,
    "encryptedIfscCode" TEXT,
    "encryptedMonthlySalaryINR" TEXT,
    "maskedNationalId" TEXT,
    "maskedBankAccount" TEXT,
    "payBandGrade" TEXT,
    "emergencyContactName" TEXT,
    "emergencyContactPhone" TEXT,
    "emergencyContactRelation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeDocument" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "verifiedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmployeeDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobPosting" (
    "id" TEXT NOT NULL,
    "jobCode" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "designationId" TEXT NOT NULL,
    "employmentType" "EmploymentType" NOT NULL DEFAULT 'FULL_TIME',
    "locationCity" TEXT NOT NULL DEFAULT 'New Delhi',
    "isRemoteAllowed" BOOLEAN NOT NULL DEFAULT false,
    "vacanciesCount" INTEGER NOT NULL DEFAULT 1,
    "experienceMinYears" INTEGER NOT NULL DEFAULT 0,
    "qualification" TEXT,
    "salaryRangeDisplay" TEXT,
    "description" TEXT NOT NULL,
    "requirements" TEXT NOT NULL,
    "benefits" TEXT,
    "status" "JobPostingStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "closingDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobPosting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobApplication" (
    "id" TEXT NOT NULL,
    "applicationNumber" TEXT NOT NULL,
    "jobPostingId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "city" TEXT,
    "currentOrganization" TEXT,
    "currentDesignation" TEXT,
    "totalExperienceYears" DECIMAL(4,1),
    "resumeUrl" TEXT NOT NULL,
    "coverLetter" TEXT,
    "portfolioUrl" TEXT,
    "status" "JobApplicationStatus" NOT NULL DEFAULT 'APPLIED',
    "shortlistRating" INTEGER,
    "reviewNotes" TEXT,
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobInterview" (
    "id" TEXT NOT NULL,
    "interviewNumber" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "round" "InterviewRound" NOT NULL DEFAULT 'HR_SCREENING',
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "interviewerNames" TEXT[],
    "evaluationScore" INTEGER,
    "technicalCompetencyNotes" TEXT,
    "culturalFitNotes" TEXT,
    "recommendation" "InterviewRecommendation",
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobInterview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobOffer" (
    "id" TEXT NOT NULL,
    "offerNumber" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "employeeProfileId" TEXT,
    "offeredDesignation" TEXT NOT NULL,
    "offeredDepartment" TEXT NOT NULL,
    "annualCTC_INR" DECIMAL(14,2) NOT NULL,
    "monthlyGrossINR" DECIMAL(14,2) NOT NULL,
    "joiningDate" TIMESTAMP(3) NOT NULL,
    "offerExpiryDate" TIMESTAMP(3) NOT NULL,
    "offerLetterUrl" TEXT,
    "status" "JobOfferStatus" NOT NULL DEFAULT 'DRAFT',
    "acceptedAt" TIMESTAMP(3),
    "declinedReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobOffer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeAttendance" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "checkInTime" TIMESTAMP(3),
    "checkOutTime" TIMESTAMP(3),
    "totalHoursWorked" DECIMAL(4,2) NOT NULL DEFAULT 0.0,
    "status" "AttendanceStatus" NOT NULL DEFAULT 'PRESENT',
    "remarks" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmployeeAttendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeLeave" (
    "id" TEXT NOT NULL,
    "leaveNumber" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "leaveType" "LeaveType" NOT NULL DEFAULT 'ANNUAL_CASUAL',
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "totalDays" DECIMAL(4,1) NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "LeaveApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedByUserId" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,

    CONSTRAINT "EmployeeLeave_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeAppraisal" (
    "id" TEXT NOT NULL,
    "reviewNumber" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "reviewerUserId" TEXT NOT NULL,
    "reviewCycleYear" INTEGER NOT NULL DEFAULT 2026,
    "reviewPeriod" TEXT NOT NULL,
    "kpiAchievementScore" INTEGER NOT NULL DEFAULT 4,
    "valuesAndEthicsScore" INTEGER NOT NULL DEFAULT 5,
    "leadershipScore" INTEGER NOT NULL DEFAULT 4,
    "overallRating" "PerformanceRating" NOT NULL DEFAULT 'MEETS_EXPECTATIONS',
    "keyStrengths" TEXT NOT NULL,
    "developmentPlan" TEXT NOT NULL,
    "recommendedPromotionOrIncrement" TEXT,
    "status" TEXT NOT NULL DEFAULT 'FINALIZED',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmployeeAppraisal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeExit" (
    "id" TEXT NOT NULL,
    "exitNumber" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "resignationNoticeDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requestedRelievingDate" TIMESTAMP(3) NOT NULL,
    "agreedLastWorkingDate" TIMESTAMP(3),
    "exitReason" TEXT NOT NULL,
    "handoverNotes" TEXT,
    "assetReturnCompleted" BOOLEAN NOT NULL DEFAULT false,
    "itClearanceStatus" "ExitClearanceStatus" NOT NULL DEFAULT 'PENDING',
    "financeClearanceStatus" "ExitClearanceStatus" NOT NULL DEFAULT 'PENDING',
    "hrClearanceStatus" "ExitClearanceStatus" NOT NULL DEFAULT 'PENDING',
    "governanceClearanceStatus" "ExitClearanceStatus" NOT NULL DEFAULT 'PENDING',
    "exitInterviewFeedback" TEXT,
    "eligibleForRehire" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeExit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HrStatutoryConfig" (
    "id" TEXT NOT NULL,
    "configKey" TEXT NOT NULL,
    "configCategory" TEXT NOT NULL,
    "settingName" TEXT NOT NULL,
    "settingValueJson" JSONB NOT NULL,
    "disclaimerTag" TEXT NOT NULL DEFAULT 'REQUIRES_PROFESSIONAL_VERIFICATION',
    "verifiedByLegalAdvisor" BOOLEAN NOT NULL DEFAULT false,
    "lastVerifiedAt" TIMESTAMP(3),
    "notes" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HrStatutoryConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalaryStructure" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "baseSalaryMonthly" DECIMAL(12,2) NOT NULL DEFAULT 0.0,
    "housingAllowanceMonthly" DECIMAL(12,2) NOT NULL DEFAULT 0.0,
    "transportAllowanceMonthly" DECIMAL(12,2) NOT NULL DEFAULT 0.0,
    "medicalAllowanceMonthly" DECIMAL(12,2) NOT NULL DEFAULT 0.0,
    "specialAllowanceMonthly" DECIMAL(12,2) NOT NULL DEFAULT 0.0,
    "grossMonthlySalary" DECIMAL(12,2) NOT NULL DEFAULT 0.0,
    "annualCTC" DECIMAL(14,2) NOT NULL DEFAULT 0.0,
    "customComponents" JSONB,
    "payGrade" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalaryStructure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollPeriod" (
    "id" TEXT NOT NULL,
    "periodCode" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "totalWorkingDays" INTEGER NOT NULL DEFAULT 30,
    "status" "PayrollPeriodStatus" NOT NULL DEFAULT 'DRAFT',
    "totalGrossAmountINR" DECIMAL(14,2) NOT NULL DEFAULT 0.0,
    "totalDeductionsINR" DECIMAL(14,2) NOT NULL DEFAULT 0.0,
    "totalNetAmountINR" DECIMAL(14,2) NOT NULL DEFAULT 0.0,
    "totalEmployeesCount" INTEGER NOT NULL DEFAULT 0,
    "approvedByUserId" TEXT,
    "approvedAt" TIMESTAMP(3),
    "approvalRemarks" TEXT,
    "disbursedByUserId" TEXT,
    "disbursedAt" TIMESTAMP(3),
    "disbursementMode" "DisbursementMode" NOT NULL DEFAULT 'BANK_TRANSFER',
    "disbursementReference" TEXT,
    "voucherId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PayrollPeriod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payslip" (
    "id" TEXT NOT NULL,
    "payslipNumber" TEXT NOT NULL,
    "payrollPeriodId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "status" "PayslipStatus" NOT NULL DEFAULT 'DRAFT',
    "workingDaysInMonth" INTEGER NOT NULL DEFAULT 30,
    "daysPresent" DECIMAL(4,1) NOT NULL DEFAULT 0.0,
    "paidLeaveDays" DECIMAL(4,1) NOT NULL DEFAULT 0.0,
    "unpaidLeaveDays" DECIMAL(4,1) NOT NULL DEFAULT 0.0,
    "payableDays" DECIMAL(4,1) NOT NULL DEFAULT 0.0,
    "basicPay" DECIMAL(12,2) NOT NULL DEFAULT 0.0,
    "hraAllowance" DECIMAL(12,2) NOT NULL DEFAULT 0.0,
    "transportAllowance" DECIMAL(12,2) NOT NULL DEFAULT 0.0,
    "medicalAllowance" DECIMAL(12,2) NOT NULL DEFAULT 0.0,
    "specialAllowance" DECIMAL(12,2) NOT NULL DEFAULT 0.0,
    "performanceBonus" DECIMAL(12,2) NOT NULL DEFAULT 0.0,
    "overtimeOrArrears" DECIMAL(12,2) NOT NULL DEFAULT 0.0,
    "totalEarningsGross" DECIMAL(12,2) NOT NULL DEFAULT 0.0,
    "lossOfPayDeduction" DECIMAL(12,2) NOT NULL DEFAULT 0.0,
    "statutoryTaxTDS" DECIMAL(12,2) NOT NULL DEFAULT 0.0,
    "statutoryProvidentFund" DECIMAL(12,2) NOT NULL DEFAULT 0.0,
    "statutoryInsurance" DECIMAL(12,2) NOT NULL DEFAULT 0.0,
    "voluntaryDeductions" DECIMAL(12,2) NOT NULL DEFAULT 0.0,
    "totalDeductions" DECIMAL(12,2) NOT NULL DEFAULT 0.0,
    "netPayableINR" DECIMAL(12,2) NOT NULL DEFAULT 0.0,
    "employerProvidentFund" DECIMAL(12,2) NOT NULL DEFAULT 0.0,
    "employerInsurance" DECIMAL(12,2) NOT NULL DEFAULT 0.0,
    "maskedBankSnapshot" TEXT,
    "maskedPanSnapshot" TEXT,
    "encryptedBankSnapshot" TEXT,
    "verificationHash" TEXT NOT NULL,
    "digitalQrUrl" TEXT,
    "payslipPdfUrl" TEXT,
    "disbursedVia" "DisbursementMode",
    "transactionReference" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payslip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollStatutoryRuleConfig" (
    "id" TEXT NOT NULL,
    "ruleCode" TEXT NOT NULL,
    "ruleName" TEXT NOT NULL,
    "ruleCategory" "StatutoryRuleCategory" NOT NULL DEFAULT 'INCOME_TAX_TDS',
    "calculationType" TEXT NOT NULL,
    "ruleParamsJson" JSONB NOT NULL,
    "isEmployerContribution" BOOLEAN NOT NULL DEFAULT false,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "disclaimerNotice" TEXT NOT NULL DEFAULT 'REQUIRES_PROFESSIONAL_VERIFICATION',
    "verifiedByLegalAdvisor" BOOLEAN NOT NULL DEFAULT false,
    "lastVerifiedAt" TIMESTAMP(3),
    "notes" TEXT,
    "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PayrollStatutoryRuleConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrantAndCsrFunding" (
    "id" TEXT NOT NULL,
    "grantNumber" TEXT NOT NULL,
    "fundingAgencyName" TEXT NOT NULL,
    "agencyContactPerson" TEXT,
    "agencyEmail" TEXT,
    "agencyPhone" TEXT,
    "grantType" "GrantType" NOT NULL DEFAULT 'INSTITUTIONAL_GRANT',
    "status" "GrantStatus" NOT NULL DEFAULT 'ACTIVE',
    "sanctionedAmountINR" DECIMAL(14,2) NOT NULL,
    "disbursedAmountINR" DECIMAL(14,2) NOT NULL DEFAULT 0.0,
    "utilizedAmountINR" DECIMAL(14,2) NOT NULL DEFAULT 0.0,
    "balanceAmountINR" DECIMAL(14,2) NOT NULL DEFAULT 0.0,
    "purpose" TEXT NOT NULL,
    "grantStartDate" DATE NOT NULL,
    "grantEndDate" DATE NOT NULL,
    "complianceTerms" TEXT,
    "utilizationNotes" TEXT,
    "projectId" TEXT,
    "voucherId" TEXT,
    "createdById" TEXT NOT NULL DEFAULT 'FINANCE_OFFICER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GrantAndCsrFunding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vendor" (
    "id" TEXT NOT NULL,
    "vendorCode" TEXT NOT NULL,
    "legalName" TEXT NOT NULL,
    "tradeName" TEXT,
    "category" "VendorCategory" NOT NULL DEFAULT 'SUPPLIES_MATERIALS',
    "contactPerson" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "pinCode" TEXT,
    "panTaxId" TEXT,
    "gstNumber" TEXT,
    "bankName" TEXT,
    "bankAccountNumber" TEXT,
    "bankIfscCode" TEXT,
    "encryptedBankAccount" TEXT,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "isBlacklisted" BOOLEAN NOT NULL DEFAULT false,
    "verifiedByUserId" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vendor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpenseRecord" (
    "id" TEXT NOT NULL,
    "expenseNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" "ExpenseCategory" NOT NULL DEFAULT 'PROJECT_EXECUTION',
    "amount" DECIMAL(14,2) NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'BANK_TRANSFER_NEFT',
    "paymentReference" TEXT,
    "vendorId" TEXT,
    "projectId" TEXT,
    "budgetLineId" TEXT,
    "voucherId" TEXT,
    "invoiceUrl" TEXT,
    "remarks" TEXT,
    "status" "ExpenseStatus" NOT NULL DEFAULT 'DRAFT',
    "approvedByUserId" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL DEFAULT 'FINANCE_OFFICER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExpenseRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnnualBudget" (
    "id" TEXT NOT NULL,
    "budgetCode" TEXT NOT NULL,
    "fiscalYear" INTEGER NOT NULL DEFAULT 2026,
    "title" TEXT NOT NULL,
    "totalAllocatedINR" DECIMAL(14,2) NOT NULL DEFAULT 0.0,
    "totalSpentINR" DECIMAL(14,2) NOT NULL DEFAULT 0.0,
    "status" "BudgetStatus" NOT NULL DEFAULT 'ACTIVE',
    "approvedByUserId" TEXT,
    "approvedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnnualBudget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BudgetLine" (
    "id" TEXT NOT NULL,
    "budgetId" TEXT NOT NULL,
    "lineCode" TEXT NOT NULL,
    "category" "ExpenseCategory" NOT NULL DEFAULT 'PROJECT_EXECUTION',
    "title" TEXT NOT NULL,
    "allocatedAmountINR" DECIMAL(14,2) NOT NULL,
    "spentAmountINR" DECIMAL(14,2) NOT NULL DEFAULT 0.0,
    "projectId" TEXT,
    "accountHeadId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BudgetLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankReconciliationStatement" (
    "id" TEXT NOT NULL,
    "reconCode" TEXT NOT NULL,
    "bankAccountHeadId" TEXT NOT NULL,
    "statementDate" DATE NOT NULL,
    "statementClosingBalance" DECIMAL(14,2) NOT NULL,
    "bookClosingBalance" DECIMAL(14,2) NOT NULL,
    "uncreditedDeposits" DECIMAL(14,2) NOT NULL DEFAULT 0.0,
    "unpresentedCheques" DECIMAL(14,2) NOT NULL DEFAULT 0.0,
    "netAdjustments" DECIMAL(14,2) NOT NULL DEFAULT 0.0,
    "reconciledBalance" DECIMAL(14,2) NOT NULL,
    "discrepancyAmount" DECIMAL(14,2) NOT NULL DEFAULT 0.0,
    "status" "ReconciliationStatus" NOT NULL DEFAULT 'PENDING',
    "verifiedByAuditorUserId" TEXT,
    "auditorSignOffNotes" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BankReconciliationStatement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReconciliationItem" (
    "id" TEXT NOT NULL,
    "statementId" TEXT NOT NULL,
    "transactionDate" DATE NOT NULL,
    "referenceNumber" TEXT,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "itemType" "ReconciliationItemType" NOT NULL DEFAULT 'UNCREDITED_DEPOSIT',
    "isCleared" BOOLEAN NOT NULL DEFAULT false,
    "clearedAt" TIMESTAMP(3),
    "voucherId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReconciliationItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountingStatutoryConfig" (
    "id" TEXT NOT NULL,
    "configKey" TEXT NOT NULL,
    "configCategory" TEXT NOT NULL,
    "ruleName" TEXT NOT NULL,
    "ruleParamsJson" JSONB NOT NULL,
    "disclaimerTag" TEXT NOT NULL DEFAULT 'REQUIRES_PROFESSIONAL_VERIFICATION',
    "verifiedByAuditor" BOOLEAN NOT NULL DEFAULT false,
    "lastVerifiedAt" TIMESTAMP(3),
    "notes" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccountingStatutoryConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeneratedDocument" (
    "id" TEXT NOT NULL,
    "documentNumber" TEXT NOT NULL,
    "documentType" "DocumentType" NOT NULL,
    "title" TEXT NOT NULL,
    "templateVersion" TEXT NOT NULL DEFAULT '1.0.0',
    "status" "DocumentStatus" NOT NULL DEFAULT 'VALID',
    "recipientName" TEXT NOT NULL,
    "recipientEmail" TEXT,
    "recipientPhone" TEXT,
    "metadataJson" JSONB NOT NULL,
    "signatoriesJson" JSONB NOT NULL,
    "signatureHash" TEXT NOT NULL,
    "qrCodeSvg" TEXT,
    "qrVerificationUrl" TEXT NOT NULL,
    "htmlContent" TEXT,
    "fileUrl" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "revokedReason" TEXT,
    "donationId" TEXT,
    "memberProfileId" TEXT,
    "volunteerProfileId" TEXT,
    "employeeProfileId" TEXT,
    "payslipId" TEXT,
    "projectId" TEXT,
    "createdById" TEXT NOT NULL DEFAULT 'SYSTEM',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GeneratedDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunicationTemplate" (
    "id" TEXT NOT NULL,
    "templateKey" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'GENERAL',
    "description" TEXT,
    "subjectTemplate" TEXT,
    "bodyTemplate" TEXT NOT NULL,
    "whatsappTemplateName" TEXT,
    "smsTemplateId" TEXT,
    "allowedChannels" "CommunicationChannel"[],
    "variablesJson" JSONB NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0.0',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunicationTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunicationLog" (
    "id" TEXT NOT NULL,
    "channel" "CommunicationChannel" NOT NULL,
    "templateKey" TEXT NOT NULL,
    "recipientIdentifier" TEXT NOT NULL,
    "recipientName" TEXT,
    "subject" TEXT,
    "messageContent" TEXT NOT NULL,
    "status" "DeliveryStatus" NOT NULL DEFAULT 'SENT',
    "providerMessageId" TEXT,
    "errorDetails" TEXT,
    "metadataJson" JSONB,
    "documentId" TEXT,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveredAt" TIMESTAMP(3),
    "readAt" TIMESTAMP(3),

    CONSTRAINT "CommunicationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InAppNotification" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'SYSTEM',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isUrgent" BOOLEAN NOT NULL DEFAULT false,
    "linkUrl" TEXT,
    "documentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),

    CONSTRAINT "InAppNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatutoryDocument" (
    "id" TEXT NOT NULL,
    "documentCode" TEXT NOT NULL,
    "category" "ComplianceCategory" NOT NULL,
    "documentType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "registrationNumber" TEXT,
    "issuingAuthority" TEXT NOT NULL,
    "effectiveDate" DATE,
    "expiryDate" DATE,
    "isPerpetual" BOOLEAN NOT NULL DEFAULT false,
    "fileUrl" TEXT,
    "fileName" TEXT,
    "fileSizeBytes" INTEGER,
    "mimeType" TEXT,
    "isConfidential" BOOLEAN NOT NULL DEFAULT false,
    "encryptedMetadata" TEXT,
    "verificationStatus" "ProfessionalVerificationStatus" NOT NULL DEFAULT 'REQUIRES_PROFESSIONAL_VERIFICATION',
    "verifiedByProfessionalName" TEXT,
    "professionalRegnNumber" TEXT,
    "professionalFirmName" TEXT,
    "verificationNotes" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "disclaimerNotice" TEXT NOT NULL DEFAULT 'Administrative record tracking. Does not constitute government certification or legal advice. REQUIRES ORGANIZATIONAL / CA / CS / LEGAL VERIFICATION.',
    "createdById" TEXT NOT NULL DEFAULT 'SYSTEM',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StatutoryDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplianceCalendarItem" (
    "id" TEXT NOT NULL,
    "itemCode" TEXT NOT NULL,
    "requirementName" TEXT NOT NULL,
    "category" "ComplianceCategory" NOT NULL,
    "periodicity" "CompliancePeriodicity" NOT NULL DEFAULT 'ANNUAL',
    "statutoryAuthority" TEXT NOT NULL,
    "applicableActOrRule" TEXT NOT NULL,
    "fiscalYear" TEXT NOT NULL,
    "dueDate" DATE NOT NULL,
    "extendedDueDate" DATE,
    "filingDate" DATE,
    "responsiblePersonName" TEXT NOT NULL,
    "responsiblePersonRole" TEXT NOT NULL,
    "responsiblePersonEmail" TEXT NOT NULL,
    "responsiblePersonPhone" TEXT,
    "status" "ComplianceFilingStatus" NOT NULL DEFAULT 'PENDING',
    "acknowledgementNumber" TEXT,
    "statutoryDocumentId" TEXT,
    "reminderDaysBefore" INTEGER[] DEFAULT ARRAY[30, 15, 7, 1]::INTEGER[],
    "lastReminderSentAt" TIMESTAMP(3),
    "verificationStatus" "ProfessionalVerificationStatus" NOT NULL DEFAULT 'REQUIRES_PROFESSIONAL_VERIFICATION',
    "verifiedByProfessionalName" TEXT,
    "professionalRegnNumber" TEXT,
    "verificationNotes" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "disclaimerNotice" TEXT NOT NULL DEFAULT 'Administrative tracking tool. Software does not provide legal approval or tax advice. REQUIRES ORGANIZATIONAL / CA / CS / LEGAL VERIFICATION.',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComplianceCalendarItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiDraftRecord" (
    "id" TEXT NOT NULL,
    "draftCode" TEXT NOT NULL,
    "taskType" "AiTaskType" NOT NULL,
    "safetyDomain" "AiSafetyDomain" NOT NULL DEFAULT 'GENERAL_PUBLIC',
    "title" TEXT NOT NULL,
    "promptSanitized" TEXT NOT NULL,
    "generatedOutput" TEXT NOT NULL,
    "editedOutput" TEXT,
    "status" "AiDraftStatus" NOT NULL DEFAULT 'DRAFT_PENDING_REVIEW',
    "providerName" TEXT NOT NULL DEFAULT 'GEMINI',
    "modelName" TEXT NOT NULL DEFAULT 'gemini-1.5-flash',
    "tokensUsed" INTEGER NOT NULL DEFAULT 0,
    "latencyMs" INTEGER NOT NULL DEFAULT 0,
    "targetModule" TEXT,
    "targetEntityId" TEXT,
    "requiresHumanApproval" BOOLEAN NOT NULL DEFAULT true,
    "reviewedByUserId" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "approvalNotes" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL DEFAULT 'SYSTEM',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiDraftRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiGenerationLog" (
    "id" TEXT NOT NULL,
    "taskType" "AiTaskType" NOT NULL,
    "safetyDomain" "AiSafetyDomain" NOT NULL,
    "providerName" TEXT NOT NULL,
    "modelName" TEXT NOT NULL,
    "promptSanitized" TEXT NOT NULL,
    "responsePreview" TEXT,
    "tokensPrompt" INTEGER NOT NULL DEFAULT 0,
    "tokensCompletion" INTEGER NOT NULL DEFAULT 0,
    "latencyMs" INTEGER NOT NULL DEFAULT 0,
    "isSuccess" BOOLEAN NOT NULL DEFAULT true,
    "errorMessage" TEXT,
    "createdById" TEXT NOT NULL DEFAULT 'SYSTEM',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiGenerationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfficeLocation" (
    "id" TEXT NOT NULL,
    "officeCode" TEXT NOT NULL,
    "officeName" TEXT NOT NULL,
    "officeType" "OfficeType" NOT NULL DEFAULT 'REGIONAL_CHAPTER',
    "countryCode" TEXT NOT NULL,
    "stateProvince" TEXT,
    "city" TEXT NOT NULL,
    "postalCode" TEXT,
    "addressLine" TEXT,
    "defaultCurrency" TEXT NOT NULL DEFAULT 'INR',
    "defaultTimezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "defaultLanguage" TEXT NOT NULL DEFAULT 'en',
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT,
    "representativeName" TEXT,
    "taxRegistrationNumber" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OfficeLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExchangeRateRecord" (
    "id" TEXT NOT NULL,
    "baseCurrency" TEXT NOT NULL DEFAULT 'INR',
    "targetCurrency" TEXT NOT NULL,
    "rate" DECIMAL(18,6) NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'MANUAL_TREASURY',
    "effectiveDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExchangeRateRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InternationalDonorProfile" (
    "id" TEXT NOT NULL,
    "donorNumber" TEXT NOT NULL,
    "userId" TEXT,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "countryCode" TEXT NOT NULL,
    "preferredCurrency" TEXT NOT NULL DEFAULT 'USD',
    "preferredLanguage" TEXT NOT NULL DEFAULT 'en',
    "preferredTimezone" TEXT,
    "taxIdType" TEXT,
    "taxIdMasked" TEXT,
    "giftAidConsentUK" BOOLEAN NOT NULL DEFAULT false,
    "giftAidConsentDate" TIMESTAMP(3),
    "taxExemptionEligible" BOOLEAN NOT NULL DEFAULT true,
    "statutoryCategory" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InternationalDonorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CountryComplianceSetting" (
    "id" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "countryName" TEXT NOT NULL,
    "defaultCurrency" TEXT NOT NULL,
    "supportedCurrencies" TEXT[],
    "defaultLanguage" TEXT NOT NULL,
    "supportedLanguages" TEXT[],
    "defaultTimezone" TEXT NOT NULL,
    "numberingSystem" TEXT NOT NULL DEFAULT 'INTERNATIONAL_MILLION_BILLION',
    "dateFormat" TEXT NOT NULL DEFAULT 'DD/MM/YYYY',
    "taxSchemeName" TEXT,
    "taxIdLabel" TEXT,
    "taxIdRegex" TEXT,
    "isTaxReceiptEligible" BOOLEAN NOT NULL DEFAULT false,
    "preferredPaymentProvider" TEXT NOT NULL DEFAULT 'STRIPE',
    "statutoryDisclaimer" TEXT,
    "isDonationActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CountryComplianceSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_phone_idx" ON "User"("phone");

-- CreateIndex
CREATE INDEX "User_organizationId_status_idx" ON "User"("organizationId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_code_key" ON "Permission"("code");

-- CreateIndex
CREATE INDEX "Permission_module_idx" ON "Permission"("module");

-- CreateIndex
CREATE UNIQUE INDEX "RolePermission_roleId_permissionId_key" ON "RolePermission"("roleId", "permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "UserRole_userId_roleId_key" ON "UserRole"("userId", "roleId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_entity_entityId_idx" ON "AuditLog"("entity", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SystemSetting_key_key" ON "SystemSetting"("key");

-- CreateIndex
CREATE INDEX "SystemSetting_key_idx" ON "SystemSetting"("key");

-- CreateIndex
CREATE UNIQUE INDEX "StorageObject_fileKey_key" ON "StorageObject"("fileKey");

-- CreateIndex
CREATE INDEX "StorageObject_bucket_idx" ON "StorageObject"("bucket");

-- CreateIndex
CREATE INDEX "StorageObject_uploadedById_idx" ON "StorageObject"("uploadedById");

-- CreateIndex
CREATE UNIQUE INDEX "CmsPage_slug_key" ON "CmsPage"("slug");

-- CreateIndex
CREATE INDEX "CmsPage_slug_idx" ON "CmsPage"("slug");

-- CreateIndex
CREATE INDEX "CmsPage_status_idx" ON "CmsPage"("status");

-- CreateIndex
CREATE UNIQUE INDEX "CmsProgram_slug_key" ON "CmsProgram"("slug");

-- CreateIndex
CREATE INDEX "CmsProgram_slug_idx" ON "CmsProgram"("slug");

-- CreateIndex
CREATE INDEX "CmsProgram_status_idx" ON "CmsProgram"("status");

-- CreateIndex
CREATE UNIQUE INDEX "CmsArticle_slug_key" ON "CmsArticle"("slug");

-- CreateIndex
CREATE INDEX "CmsArticle_slug_idx" ON "CmsArticle"("slug");

-- CreateIndex
CREATE INDEX "CmsArticle_type_status_idx" ON "CmsArticle"("type", "status");

-- CreateIndex
CREATE UNIQUE INDEX "CmsStory_slug_key" ON "CmsStory"("slug");

-- CreateIndex
CREATE INDEX "CmsStory_slug_idx" ON "CmsStory"("slug");

-- CreateIndex
CREATE INDEX "CmsStory_status_idx" ON "CmsStory"("status");

-- CreateIndex
CREATE INDEX "CmsMediaAsset_type_status_idx" ON "CmsMediaAsset"("type", "status");

-- CreateIndex
CREATE INDEX "CmsFaq_category_status_idx" ON "CmsFaq"("category", "status");

-- CreateIndex
CREATE INDEX "CmsMenuItem_location_orderIndex_idx" ON "CmsMenuItem"("location", "orderIndex");

-- CreateIndex
CREATE INDEX "PublicInquiry_status_idx" ON "PublicInquiry"("status");

-- CreateIndex
CREATE INDEX "VolunteerApplication_status_idx" ON "VolunteerApplication"("status");

-- CreateIndex
CREATE UNIQUE INDEX "DonationCategory_slug_key" ON "DonationCategory"("slug");

-- CreateIndex
CREATE INDEX "DonationCategory_slug_idx" ON "DonationCategory"("slug");

-- CreateIndex
CREATE INDEX "DonationCategory_fundType_idx" ON "DonationCategory"("fundType");

-- CreateIndex
CREATE INDEX "DonationCategory_complianceStatus_idx" ON "DonationCategory"("complianceStatus");

-- CreateIndex
CREATE INDEX "DonationCategory_isActive_idx" ON "DonationCategory"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Campaign_slug_key" ON "Campaign"("slug");

-- CreateIndex
CREATE INDEX "Campaign_slug_idx" ON "Campaign"("slug");

-- CreateIndex
CREATE INDEX "Campaign_isActive_isFeatured_idx" ON "Campaign"("isActive", "isFeatured");

-- CreateIndex
CREATE INDEX "Campaign_fundType_idx" ON "Campaign"("fundType");

-- CreateIndex
CREATE INDEX "Campaign_complianceStatus_idx" ON "Campaign"("complianceStatus");

-- CreateIndex
CREATE UNIQUE INDEX "DonorProfile_userId_key" ON "DonorProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DonorProfile_email_key" ON "DonorProfile"("email");

-- CreateIndex
CREATE INDEX "DonorProfile_email_idx" ON "DonorProfile"("email");

-- CreateIndex
CREATE INDEX "DonorProfile_phone_idx" ON "DonorProfile"("phone");

-- CreateIndex
CREATE INDEX "DonorProfile_city_state_idx" ON "DonorProfile"("city", "state");

-- CreateIndex
CREATE UNIQUE INDEX "Donation_receiptNumber_key" ON "Donation"("receiptNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Donation_idempotencyKey_key" ON "Donation"("idempotencyKey");

-- CreateIndex
CREATE UNIQUE INDEX "Donation_gatewayPaymentId_key" ON "Donation"("gatewayPaymentId");

-- CreateIndex
CREATE UNIQUE INDEX "Donation_qrVerificationHash_key" ON "Donation"("qrVerificationHash");

-- CreateIndex
CREATE INDEX "Donation_receiptNumber_idx" ON "Donation"("receiptNumber");

-- CreateIndex
CREATE INDEX "Donation_idempotencyKey_idx" ON "Donation"("idempotencyKey");

-- CreateIndex
CREATE INDEX "Donation_paymentStatus_createdAt_idx" ON "Donation"("paymentStatus", "createdAt");

-- CreateIndex
CREATE INDEX "Donation_donorEmail_idx" ON "Donation"("donorEmail");

-- CreateIndex
CREATE INDEX "Donation_qrVerificationHash_idx" ON "Donation"("qrVerificationHash");

-- CreateIndex
CREATE INDEX "Donation_gatewayOrderId_idx" ON "Donation"("gatewayOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentTransaction_gatewayPaymentId_key" ON "PaymentTransaction"("gatewayPaymentId");

-- CreateIndex
CREATE INDEX "PaymentTransaction_gatewayPaymentId_idx" ON "PaymentTransaction"("gatewayPaymentId");

-- CreateIndex
CREATE INDEX "PaymentTransaction_donationId_idx" ON "PaymentTransaction"("donationId");

-- CreateIndex
CREATE INDEX "PaymentTransaction_status_idx" ON "PaymentTransaction"("status");

-- CreateIndex
CREATE UNIQUE INDEX "TaxExemptionReceipt_certificateNumber_key" ON "TaxExemptionReceipt"("certificateNumber");

-- CreateIndex
CREATE UNIQUE INDEX "TaxExemptionReceipt_donationId_key" ON "TaxExemptionReceipt"("donationId");

-- CreateIndex
CREATE UNIQUE INDEX "TaxExemptionReceipt_signatureHash_key" ON "TaxExemptionReceipt"("signatureHash");

-- CreateIndex
CREATE INDEX "TaxExemptionReceipt_certificateNumber_idx" ON "TaxExemptionReceipt"("certificateNumber");

-- CreateIndex
CREATE INDEX "TaxExemptionReceipt_financialYear_idx" ON "TaxExemptionReceipt"("financialYear");

-- CreateIndex
CREATE INDEX "TaxExemptionReceipt_signatureHash_idx" ON "TaxExemptionReceipt"("signatureHash");

-- CreateIndex
CREATE UNIQUE INDEX "RefundRecord_gatewayRefundId_key" ON "RefundRecord"("gatewayRefundId");

-- CreateIndex
CREATE INDEX "RefundRecord_donationId_idx" ON "RefundRecord"("donationId");

-- CreateIndex
CREATE INDEX "RefundRecord_status_idx" ON "RefundRecord"("status");

-- CreateIndex
CREATE UNIQUE INDEX "AccountHead_accountCode_key" ON "AccountHead"("accountCode");

-- CreateIndex
CREATE INDEX "AccountHead_accountCode_idx" ON "AccountHead"("accountCode");

-- CreateIndex
CREATE INDEX "AccountHead_accountType_idx" ON "AccountHead"("accountType");

-- CreateIndex
CREATE UNIQUE INDEX "Voucher_voucherNumber_key" ON "Voucher"("voucherNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Voucher_donationId_key" ON "Voucher"("donationId");

-- CreateIndex
CREATE INDEX "Voucher_voucherNumber_idx" ON "Voucher"("voucherNumber");

-- CreateIndex
CREATE INDEX "Voucher_voucherDate_idx" ON "Voucher"("voucherDate");

-- CreateIndex
CREATE INDEX "Voucher_voucherType_idx" ON "Voucher"("voucherType");

-- CreateIndex
CREATE INDEX "VoucherEntry_voucherId_idx" ON "VoucherEntry"("voucherId");

-- CreateIndex
CREATE INDEX "VoucherEntry_accountHeadId_idx" ON "VoucherEntry"("accountHeadId");

-- CreateIndex
CREATE UNIQUE INDEX "MemberProfile_membershipNumber_key" ON "MemberProfile"("membershipNumber");

-- CreateIndex
CREATE UNIQUE INDEX "MemberProfile_userId_key" ON "MemberProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "MemberProfile_email_key" ON "MemberProfile"("email");

-- CreateIndex
CREATE UNIQUE INDEX "MemberProfile_qrVerificationHash_key" ON "MemberProfile"("qrVerificationHash");

-- CreateIndex
CREATE INDEX "MemberProfile_membershipNumber_idx" ON "MemberProfile"("membershipNumber");

-- CreateIndex
CREATE INDEX "MemberProfile_email_idx" ON "MemberProfile"("email");

-- CreateIndex
CREATE INDEX "MemberProfile_membershipType_idx" ON "MemberProfile"("membershipType");

-- CreateIndex
CREATE INDEX "MemberProfile_status_idx" ON "MemberProfile"("status");

-- CreateIndex
CREATE INDEX "MemberProfile_qrVerificationHash_idx" ON "MemberProfile"("qrVerificationHash");

-- CreateIndex
CREATE INDEX "MembershipRenewalRecord_memberId_idx" ON "MembershipRenewalRecord"("memberId");

-- CreateIndex
CREATE INDEX "MembershipRenewalRecord_createdAt_idx" ON "MembershipRenewalRecord"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "VolunteerProfile_volunteerNumber_key" ON "VolunteerProfile"("volunteerNumber");

-- CreateIndex
CREATE UNIQUE INDEX "VolunteerProfile_userId_key" ON "VolunteerProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VolunteerProfile_email_key" ON "VolunteerProfile"("email");

-- CreateIndex
CREATE UNIQUE INDEX "VolunteerProfile_qrVerificationHash_key" ON "VolunteerProfile"("qrVerificationHash");

-- CreateIndex
CREATE INDEX "VolunteerProfile_volunteerNumber_idx" ON "VolunteerProfile"("volunteerNumber");

-- CreateIndex
CREATE INDEX "VolunteerProfile_email_idx" ON "VolunteerProfile"("email");

-- CreateIndex
CREATE INDEX "VolunteerProfile_status_idx" ON "VolunteerProfile"("status");

-- CreateIndex
CREATE INDEX "VolunteerProfile_qrVerificationHash_idx" ON "VolunteerProfile"("qrVerificationHash");

-- CreateIndex
CREATE UNIQUE INDEX "VolunteerAssignment_assignmentNumber_key" ON "VolunteerAssignment"("assignmentNumber");

-- CreateIndex
CREATE INDEX "VolunteerAssignment_assignmentNumber_idx" ON "VolunteerAssignment"("assignmentNumber");

-- CreateIndex
CREATE INDEX "VolunteerAssignment_volunteerId_idx" ON "VolunteerAssignment"("volunteerId");

-- CreateIndex
CREATE INDEX "VolunteerAssignment_status_idx" ON "VolunteerAssignment"("status");

-- CreateIndex
CREATE INDEX "VolunteerHoursLog_volunteerId_idx" ON "VolunteerHoursLog"("volunteerId");

-- CreateIndex
CREATE INDEX "VolunteerHoursLog_assignmentId_idx" ON "VolunteerHoursLog"("assignmentId");

-- CreateIndex
CREATE INDEX "VolunteerHoursLog_date_idx" ON "VolunteerHoursLog"("date");

-- CreateIndex
CREATE UNIQUE INDEX "OfficialCertificate_certificateNumber_key" ON "OfficialCertificate"("certificateNumber");

-- CreateIndex
CREATE UNIQUE INDEX "OfficialCertificate_signatureHash_key" ON "OfficialCertificate"("signatureHash");

-- CreateIndex
CREATE INDEX "OfficialCertificate_certificateNumber_idx" ON "OfficialCertificate"("certificateNumber");

-- CreateIndex
CREATE INDEX "OfficialCertificate_certificateType_idx" ON "OfficialCertificate"("certificateType");

-- CreateIndex
CREATE INDEX "OfficialCertificate_recipientEmail_idx" ON "OfficialCertificate"("recipientEmail");

-- CreateIndex
CREATE INDEX "OfficialCertificate_signatureHash_idx" ON "OfficialCertificate"("signatureHash");

-- CreateIndex
CREATE UNIQUE INDEX "Project_projectNumber_key" ON "Project"("projectNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");

-- CreateIndex
CREATE INDEX "Project_projectNumber_idx" ON "Project"("projectNumber");

-- CreateIndex
CREATE INDEX "Project_slug_idx" ON "Project"("slug");

-- CreateIndex
CREATE INDEX "Project_stage_idx" ON "Project"("stage");

-- CreateIndex
CREATE INDEX "Project_category_idx" ON "Project"("category");

-- CreateIndex
CREATE INDEX "ProjectMilestone_projectId_idx" ON "ProjectMilestone"("projectId");

-- CreateIndex
CREATE INDEX "ProjectMilestone_targetDate_idx" ON "ProjectMilestone"("targetDate");

-- CreateIndex
CREATE INDEX "ProjectMilestone_isCompleted_idx" ON "ProjectMilestone"("isCompleted");

-- CreateIndex
CREATE INDEX "ProjectMetric_projectId_idx" ON "ProjectMetric"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "BeneficiaryProfile_beneficiaryNumber_key" ON "BeneficiaryProfile"("beneficiaryNumber");

-- CreateIndex
CREATE INDEX "BeneficiaryProfile_beneficiaryNumber_idx" ON "BeneficiaryProfile"("beneficiaryNumber");

-- CreateIndex
CREATE INDEX "BeneficiaryProfile_category_idx" ON "BeneficiaryProfile"("category");

-- CreateIndex
CREATE INDEX "BeneficiaryProfile_vulnerabilityTier_idx" ON "BeneficiaryProfile"("vulnerabilityTier");

-- CreateIndex
CREATE INDEX "BeneficiaryProfile_verificationStatus_idx" ON "BeneficiaryProfile"("verificationStatus");

-- CreateIndex
CREATE INDEX "BeneficiaryProfile_city_idx" ON "BeneficiaryProfile"("city");

-- CreateIndex
CREATE INDEX "BeneficiaryProjectLink_beneficiaryId_idx" ON "BeneficiaryProjectLink"("beneficiaryId");

-- CreateIndex
CREATE INDEX "BeneficiaryProjectLink_projectId_idx" ON "BeneficiaryProjectLink"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "BeneficiaryProjectLink_beneficiaryId_projectId_key" ON "BeneficiaryProjectLink"("beneficiaryId", "projectId");

-- CreateIndex
CREATE INDEX "BeneficiaryFamilyMember_beneficiaryId_idx" ON "BeneficiaryFamilyMember"("beneficiaryId");

-- CreateIndex
CREATE INDEX "BeneficiaryDocument_beneficiaryId_idx" ON "BeneficiaryDocument"("beneficiaryId");

-- CreateIndex
CREATE UNIQUE INDEX "BeneficiaryAssistance_assistanceNumber_key" ON "BeneficiaryAssistance"("assistanceNumber");

-- CreateIndex
CREATE INDEX "BeneficiaryAssistance_assistanceNumber_idx" ON "BeneficiaryAssistance"("assistanceNumber");

-- CreateIndex
CREATE INDEX "BeneficiaryAssistance_beneficiaryId_idx" ON "BeneficiaryAssistance"("beneficiaryId");

-- CreateIndex
CREATE INDEX "BeneficiaryAssistance_projectId_idx" ON "BeneficiaryAssistance"("projectId");

-- CreateIndex
CREATE INDEX "BeneficiaryAssistance_assistanceType_idx" ON "BeneficiaryAssistance"("assistanceType");

-- CreateIndex
CREATE INDEX "BeneficiaryFollowUp_beneficiaryId_idx" ON "BeneficiaryFollowUp"("beneficiaryId");

-- CreateIndex
CREATE INDEX "BeneficiaryFollowUp_followUpDate_idx" ON "BeneficiaryFollowUp"("followUpDate");

-- CreateIndex
CREATE UNIQUE INDEX "FieldVisit_visitNumber_key" ON "FieldVisit"("visitNumber");

-- CreateIndex
CREATE INDEX "FieldVisit_visitNumber_idx" ON "FieldVisit"("visitNumber");

-- CreateIndex
CREATE INDEX "FieldVisit_projectId_idx" ON "FieldVisit"("projectId");

-- CreateIndex
CREATE INDEX "FieldVisit_beneficiaryId_idx" ON "FieldVisit"("beneficiaryId");

-- CreateIndex
CREATE INDEX "FieldVisit_status_idx" ON "FieldVisit"("status");

-- CreateIndex
CREATE INDEX "FieldVisit_scheduledDate_idx" ON "FieldVisit"("scheduledDate");

-- CreateIndex
CREATE UNIQUE INDEX "FieldSurveyResponse_surveyNumber_key" ON "FieldSurveyResponse"("surveyNumber");

-- CreateIndex
CREATE INDEX "FieldSurveyResponse_surveyNumber_idx" ON "FieldSurveyResponse"("surveyNumber");

-- CreateIndex
CREATE INDEX "FieldSurveyResponse_fieldVisitId_idx" ON "FieldSurveyResponse"("fieldVisitId");

-- CreateIndex
CREATE INDEX "FieldSurveyResponse_beneficiaryId_idx" ON "FieldSurveyResponse"("beneficiaryId");

-- CreateIndex
CREATE INDEX "FieldSurveyResponse_isOfflineCaptured_idx" ON "FieldSurveyResponse"("isOfflineCaptured");

-- CreateIndex
CREATE UNIQUE INDEX "Event_eventNumber_key" ON "Event"("eventNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");

-- CreateIndex
CREATE INDEX "Event_eventNumber_idx" ON "Event"("eventNumber");

-- CreateIndex
CREATE INDEX "Event_slug_idx" ON "Event"("slug");

-- CreateIndex
CREATE INDEX "Event_status_idx" ON "Event"("status");

-- CreateIndex
CREATE INDEX "Event_category_idx" ON "Event"("category");

-- CreateIndex
CREATE INDEX "Event_startDate_idx" ON "Event"("startDate");

-- CreateIndex
CREATE INDEX "EventSpeaker_eventId_idx" ON "EventSpeaker"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "EventRegistration_registrationNumber_key" ON "EventRegistration"("registrationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "EventRegistration_passSignatureHash_key" ON "EventRegistration"("passSignatureHash");

-- CreateIndex
CREATE INDEX "EventRegistration_registrationNumber_idx" ON "EventRegistration"("registrationNumber");

-- CreateIndex
CREATE INDEX "EventRegistration_eventId_idx" ON "EventRegistration"("eventId");

-- CreateIndex
CREATE INDEX "EventRegistration_email_idx" ON "EventRegistration"("email");

-- CreateIndex
CREATE INDEX "EventRegistration_passSignatureHash_idx" ON "EventRegistration"("passSignatureHash");

-- CreateIndex
CREATE INDEX "EventRegistration_registrationStatus_idx" ON "EventRegistration"("registrationStatus");

-- CreateIndex
CREATE UNIQUE INDEX "EventFeedback_registrationId_key" ON "EventFeedback"("registrationId");

-- CreateIndex
CREATE INDEX "EventFeedback_eventId_idx" ON "EventFeedback"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "EventReport_eventId_key" ON "EventReport"("eventId");

-- CreateIndex
CREATE INDEX "EventReport_eventId_idx" ON "EventReport"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "Department_code_key" ON "Department"("code");

-- CreateIndex
CREATE INDEX "Department_code_idx" ON "Department"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Designation_code_key" ON "Designation"("code");

-- CreateIndex
CREATE INDEX "Designation_code_idx" ON "Designation"("code");

-- CreateIndex
CREATE INDEX "Designation_departmentId_idx" ON "Designation"("departmentId");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeProfile_employeeNumber_key" ON "EmployeeProfile"("employeeNumber");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeProfile_userId_key" ON "EmployeeProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeProfile_email_key" ON "EmployeeProfile"("email");

-- CreateIndex
CREATE INDEX "EmployeeProfile_employeeNumber_idx" ON "EmployeeProfile"("employeeNumber");

-- CreateIndex
CREATE INDEX "EmployeeProfile_email_idx" ON "EmployeeProfile"("email");

-- CreateIndex
CREATE INDEX "EmployeeProfile_departmentId_idx" ON "EmployeeProfile"("departmentId");

-- CreateIndex
CREATE INDEX "EmployeeProfile_designationId_idx" ON "EmployeeProfile"("designationId");

-- CreateIndex
CREATE INDEX "EmployeeProfile_status_idx" ON "EmployeeProfile"("status");

-- CreateIndex
CREATE INDEX "EmployeeProfile_employmentType_idx" ON "EmployeeProfile"("employmentType");

-- CreateIndex
CREATE INDEX "EmployeeDocument_employeeId_idx" ON "EmployeeDocument"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "JobPosting_jobCode_key" ON "JobPosting"("jobCode");

-- CreateIndex
CREATE UNIQUE INDEX "JobPosting_slug_key" ON "JobPosting"("slug");

-- CreateIndex
CREATE INDEX "JobPosting_jobCode_idx" ON "JobPosting"("jobCode");

-- CreateIndex
CREATE INDEX "JobPosting_slug_idx" ON "JobPosting"("slug");

-- CreateIndex
CREATE INDEX "JobPosting_status_idx" ON "JobPosting"("status");

-- CreateIndex
CREATE INDEX "JobPosting_departmentId_idx" ON "JobPosting"("departmentId");

-- CreateIndex
CREATE UNIQUE INDEX "JobApplication_applicationNumber_key" ON "JobApplication"("applicationNumber");

-- CreateIndex
CREATE INDEX "JobApplication_applicationNumber_idx" ON "JobApplication"("applicationNumber");

-- CreateIndex
CREATE INDEX "JobApplication_jobPostingId_idx" ON "JobApplication"("jobPostingId");

-- CreateIndex
CREATE INDEX "JobApplication_email_idx" ON "JobApplication"("email");

-- CreateIndex
CREATE INDEX "JobApplication_status_idx" ON "JobApplication"("status");

-- CreateIndex
CREATE UNIQUE INDEX "JobInterview_interviewNumber_key" ON "JobInterview"("interviewNumber");

-- CreateIndex
CREATE INDEX "JobInterview_interviewNumber_idx" ON "JobInterview"("interviewNumber");

-- CreateIndex
CREATE INDEX "JobInterview_applicationId_idx" ON "JobInterview"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "JobOffer_offerNumber_key" ON "JobOffer"("offerNumber");

-- CreateIndex
CREATE INDEX "JobOffer_offerNumber_idx" ON "JobOffer"("offerNumber");

-- CreateIndex
CREATE INDEX "JobOffer_applicationId_idx" ON "JobOffer"("applicationId");

-- CreateIndex
CREATE INDEX "EmployeeAttendance_employeeId_idx" ON "EmployeeAttendance"("employeeId");

-- CreateIndex
CREATE INDEX "EmployeeAttendance_date_idx" ON "EmployeeAttendance"("date");

-- CreateIndex
CREATE INDEX "EmployeeAttendance_status_idx" ON "EmployeeAttendance"("status");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeAttendance_employeeId_date_key" ON "EmployeeAttendance"("employeeId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeLeave_leaveNumber_key" ON "EmployeeLeave"("leaveNumber");

-- CreateIndex
CREATE INDEX "EmployeeLeave_leaveNumber_idx" ON "EmployeeLeave"("leaveNumber");

-- CreateIndex
CREATE INDEX "EmployeeLeave_employeeId_idx" ON "EmployeeLeave"("employeeId");

-- CreateIndex
CREATE INDEX "EmployeeLeave_status_idx" ON "EmployeeLeave"("status");

-- CreateIndex
CREATE INDEX "EmployeeLeave_startDate_idx" ON "EmployeeLeave"("startDate");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeAppraisal_reviewNumber_key" ON "EmployeeAppraisal"("reviewNumber");

-- CreateIndex
CREATE INDEX "EmployeeAppraisal_reviewNumber_idx" ON "EmployeeAppraisal"("reviewNumber");

-- CreateIndex
CREATE INDEX "EmployeeAppraisal_employeeId_idx" ON "EmployeeAppraisal"("employeeId");

-- CreateIndex
CREATE INDEX "EmployeeAppraisal_reviewCycleYear_idx" ON "EmployeeAppraisal"("reviewCycleYear");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeExit_exitNumber_key" ON "EmployeeExit"("exitNumber");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeExit_employeeId_key" ON "EmployeeExit"("employeeId");

-- CreateIndex
CREATE INDEX "EmployeeExit_exitNumber_idx" ON "EmployeeExit"("exitNumber");

-- CreateIndex
CREATE INDEX "EmployeeExit_employeeId_idx" ON "EmployeeExit"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "HrStatutoryConfig_configKey_key" ON "HrStatutoryConfig"("configKey");

-- CreateIndex
CREATE INDEX "HrStatutoryConfig_configKey_idx" ON "HrStatutoryConfig"("configKey");

-- CreateIndex
CREATE INDEX "HrStatutoryConfig_configCategory_idx" ON "HrStatutoryConfig"("configCategory");

-- CreateIndex
CREATE UNIQUE INDEX "SalaryStructure_employeeId_key" ON "SalaryStructure"("employeeId");

-- CreateIndex
CREATE INDEX "SalaryStructure_employeeId_idx" ON "SalaryStructure"("employeeId");

-- CreateIndex
CREATE INDEX "SalaryStructure_isActive_idx" ON "SalaryStructure"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "PayrollPeriod_periodCode_key" ON "PayrollPeriod"("periodCode");

-- CreateIndex
CREATE UNIQUE INDEX "PayrollPeriod_voucherId_key" ON "PayrollPeriod"("voucherId");

-- CreateIndex
CREATE INDEX "PayrollPeriod_periodCode_idx" ON "PayrollPeriod"("periodCode");

-- CreateIndex
CREATE INDEX "PayrollPeriod_status_idx" ON "PayrollPeriod"("status");

-- CreateIndex
CREATE UNIQUE INDEX "PayrollPeriod_year_month_key" ON "PayrollPeriod"("year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "Payslip_payslipNumber_key" ON "Payslip"("payslipNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Payslip_verificationHash_key" ON "Payslip"("verificationHash");

-- CreateIndex
CREATE INDEX "Payslip_payslipNumber_idx" ON "Payslip"("payslipNumber");

-- CreateIndex
CREATE INDEX "Payslip_payrollPeriodId_idx" ON "Payslip"("payrollPeriodId");

-- CreateIndex
CREATE INDEX "Payslip_employeeId_idx" ON "Payslip"("employeeId");

-- CreateIndex
CREATE INDEX "Payslip_status_idx" ON "Payslip"("status");

-- CreateIndex
CREATE INDEX "Payslip_verificationHash_idx" ON "Payslip"("verificationHash");

-- CreateIndex
CREATE UNIQUE INDEX "PayrollStatutoryRuleConfig_ruleCode_key" ON "PayrollStatutoryRuleConfig"("ruleCode");

-- CreateIndex
CREATE INDEX "PayrollStatutoryRuleConfig_ruleCode_idx" ON "PayrollStatutoryRuleConfig"("ruleCode");

-- CreateIndex
CREATE INDEX "PayrollStatutoryRuleConfig_ruleCategory_idx" ON "PayrollStatutoryRuleConfig"("ruleCategory");

-- CreateIndex
CREATE INDEX "PayrollStatutoryRuleConfig_isEnabled_idx" ON "PayrollStatutoryRuleConfig"("isEnabled");

-- CreateIndex
CREATE UNIQUE INDEX "GrantAndCsrFunding_grantNumber_key" ON "GrantAndCsrFunding"("grantNumber");

-- CreateIndex
CREATE INDEX "GrantAndCsrFunding_grantNumber_idx" ON "GrantAndCsrFunding"("grantNumber");

-- CreateIndex
CREATE INDEX "GrantAndCsrFunding_grantType_idx" ON "GrantAndCsrFunding"("grantType");

-- CreateIndex
CREATE INDEX "GrantAndCsrFunding_status_idx" ON "GrantAndCsrFunding"("status");

-- CreateIndex
CREATE INDEX "GrantAndCsrFunding_projectId_idx" ON "GrantAndCsrFunding"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "Vendor_vendorCode_key" ON "Vendor"("vendorCode");

-- CreateIndex
CREATE INDEX "Vendor_vendorCode_idx" ON "Vendor"("vendorCode");

-- CreateIndex
CREATE INDEX "Vendor_category_idx" ON "Vendor"("category");

-- CreateIndex
CREATE INDEX "Vendor_email_idx" ON "Vendor"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ExpenseRecord_expenseNumber_key" ON "ExpenseRecord"("expenseNumber");

-- CreateIndex
CREATE INDEX "ExpenseRecord_expenseNumber_idx" ON "ExpenseRecord"("expenseNumber");

-- CreateIndex
CREATE INDEX "ExpenseRecord_category_idx" ON "ExpenseRecord"("category");

-- CreateIndex
CREATE INDEX "ExpenseRecord_status_idx" ON "ExpenseRecord"("status");

-- CreateIndex
CREATE INDEX "ExpenseRecord_vendorId_idx" ON "ExpenseRecord"("vendorId");

-- CreateIndex
CREATE INDEX "ExpenseRecord_projectId_idx" ON "ExpenseRecord"("projectId");

-- CreateIndex
CREATE INDEX "ExpenseRecord_budgetLineId_idx" ON "ExpenseRecord"("budgetLineId");

-- CreateIndex
CREATE INDEX "ExpenseRecord_paymentDate_idx" ON "ExpenseRecord"("paymentDate");

-- CreateIndex
CREATE UNIQUE INDEX "AnnualBudget_budgetCode_key" ON "AnnualBudget"("budgetCode");

-- CreateIndex
CREATE INDEX "AnnualBudget_budgetCode_idx" ON "AnnualBudget"("budgetCode");

-- CreateIndex
CREATE INDEX "AnnualBudget_fiscalYear_idx" ON "AnnualBudget"("fiscalYear");

-- CreateIndex
CREATE INDEX "AnnualBudget_status_idx" ON "AnnualBudget"("status");

-- CreateIndex
CREATE UNIQUE INDEX "AnnualBudget_fiscalYear_budgetCode_key" ON "AnnualBudget"("fiscalYear", "budgetCode");

-- CreateIndex
CREATE INDEX "BudgetLine_budgetId_idx" ON "BudgetLine"("budgetId");

-- CreateIndex
CREATE INDEX "BudgetLine_lineCode_idx" ON "BudgetLine"("lineCode");

-- CreateIndex
CREATE INDEX "BudgetLine_category_idx" ON "BudgetLine"("category");

-- CreateIndex
CREATE INDEX "BudgetLine_projectId_idx" ON "BudgetLine"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "BankReconciliationStatement_reconCode_key" ON "BankReconciliationStatement"("reconCode");

-- CreateIndex
CREATE INDEX "BankReconciliationStatement_reconCode_idx" ON "BankReconciliationStatement"("reconCode");

-- CreateIndex
CREATE INDEX "BankReconciliationStatement_bankAccountHeadId_idx" ON "BankReconciliationStatement"("bankAccountHeadId");

-- CreateIndex
CREATE INDEX "BankReconciliationStatement_status_idx" ON "BankReconciliationStatement"("status");

-- CreateIndex
CREATE INDEX "BankReconciliationStatement_statementDate_idx" ON "BankReconciliationStatement"("statementDate");

-- CreateIndex
CREATE INDEX "ReconciliationItem_statementId_idx" ON "ReconciliationItem"("statementId");

-- CreateIndex
CREATE INDEX "ReconciliationItem_itemType_idx" ON "ReconciliationItem"("itemType");

-- CreateIndex
CREATE INDEX "ReconciliationItem_isCleared_idx" ON "ReconciliationItem"("isCleared");

-- CreateIndex
CREATE UNIQUE INDEX "AccountingStatutoryConfig_configKey_key" ON "AccountingStatutoryConfig"("configKey");

-- CreateIndex
CREATE INDEX "AccountingStatutoryConfig_configKey_idx" ON "AccountingStatutoryConfig"("configKey");

-- CreateIndex
CREATE INDEX "AccountingStatutoryConfig_configCategory_idx" ON "AccountingStatutoryConfig"("configCategory");

-- CreateIndex
CREATE UNIQUE INDEX "GeneratedDocument_documentNumber_key" ON "GeneratedDocument"("documentNumber");

-- CreateIndex
CREATE UNIQUE INDEX "GeneratedDocument_signatureHash_key" ON "GeneratedDocument"("signatureHash");

-- CreateIndex
CREATE INDEX "GeneratedDocument_documentNumber_idx" ON "GeneratedDocument"("documentNumber");

-- CreateIndex
CREATE INDEX "GeneratedDocument_documentType_idx" ON "GeneratedDocument"("documentType");

-- CreateIndex
CREATE INDEX "GeneratedDocument_signatureHash_idx" ON "GeneratedDocument"("signatureHash");

-- CreateIndex
CREATE INDEX "GeneratedDocument_recipientEmail_idx" ON "GeneratedDocument"("recipientEmail");

-- CreateIndex
CREATE INDEX "GeneratedDocument_status_idx" ON "GeneratedDocument"("status");

-- CreateIndex
CREATE INDEX "GeneratedDocument_generatedAt_idx" ON "GeneratedDocument"("generatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "CommunicationTemplate_templateKey_key" ON "CommunicationTemplate"("templateKey");

-- CreateIndex
CREATE INDEX "CommunicationTemplate_templateKey_idx" ON "CommunicationTemplate"("templateKey");

-- CreateIndex
CREATE INDEX "CommunicationTemplate_category_idx" ON "CommunicationTemplate"("category");

-- CreateIndex
CREATE INDEX "CommunicationLog_channel_idx" ON "CommunicationLog"("channel");

-- CreateIndex
CREATE INDEX "CommunicationLog_templateKey_idx" ON "CommunicationLog"("templateKey");

-- CreateIndex
CREATE INDEX "CommunicationLog_recipientIdentifier_idx" ON "CommunicationLog"("recipientIdentifier");

-- CreateIndex
CREATE INDEX "CommunicationLog_status_idx" ON "CommunicationLog"("status");

-- CreateIndex
CREATE INDEX "CommunicationLog_sentAt_idx" ON "CommunicationLog"("sentAt");

-- CreateIndex
CREATE INDEX "InAppNotification_userId_idx" ON "InAppNotification"("userId");

-- CreateIndex
CREATE INDEX "InAppNotification_isRead_idx" ON "InAppNotification"("isRead");

-- CreateIndex
CREATE INDEX "InAppNotification_category_idx" ON "InAppNotification"("category");

-- CreateIndex
CREATE INDEX "InAppNotification_createdAt_idx" ON "InAppNotification"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "StatutoryDocument_documentCode_key" ON "StatutoryDocument"("documentCode");

-- CreateIndex
CREATE INDEX "StatutoryDocument_category_idx" ON "StatutoryDocument"("category");

-- CreateIndex
CREATE INDEX "StatutoryDocument_documentType_idx" ON "StatutoryDocument"("documentType");

-- CreateIndex
CREATE INDEX "StatutoryDocument_verificationStatus_idx" ON "StatutoryDocument"("verificationStatus");

-- CreateIndex
CREATE INDEX "StatutoryDocument_expiryDate_idx" ON "StatutoryDocument"("expiryDate");

-- CreateIndex
CREATE UNIQUE INDEX "ComplianceCalendarItem_itemCode_key" ON "ComplianceCalendarItem"("itemCode");

-- CreateIndex
CREATE INDEX "ComplianceCalendarItem_dueDate_idx" ON "ComplianceCalendarItem"("dueDate");

-- CreateIndex
CREATE INDEX "ComplianceCalendarItem_status_idx" ON "ComplianceCalendarItem"("status");

-- CreateIndex
CREATE INDEX "ComplianceCalendarItem_category_idx" ON "ComplianceCalendarItem"("category");

-- CreateIndex
CREATE INDEX "ComplianceCalendarItem_fiscalYear_idx" ON "ComplianceCalendarItem"("fiscalYear");

-- CreateIndex
CREATE INDEX "ComplianceCalendarItem_verificationStatus_idx" ON "ComplianceCalendarItem"("verificationStatus");

-- CreateIndex
CREATE UNIQUE INDEX "AiDraftRecord_draftCode_key" ON "AiDraftRecord"("draftCode");

-- CreateIndex
CREATE INDEX "AiDraftRecord_taskType_idx" ON "AiDraftRecord"("taskType");

-- CreateIndex
CREATE INDEX "AiDraftRecord_safetyDomain_idx" ON "AiDraftRecord"("safetyDomain");

-- CreateIndex
CREATE INDEX "AiDraftRecord_status_idx" ON "AiDraftRecord"("status");

-- CreateIndex
CREATE INDEX "AiDraftRecord_createdAt_idx" ON "AiDraftRecord"("createdAt");

-- CreateIndex
CREATE INDEX "AiGenerationLog_taskType_idx" ON "AiGenerationLog"("taskType");

-- CreateIndex
CREATE INDEX "AiGenerationLog_providerName_idx" ON "AiGenerationLog"("providerName");

-- CreateIndex
CREATE INDEX "AiGenerationLog_createdAt_idx" ON "AiGenerationLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "OfficeLocation_officeCode_key" ON "OfficeLocation"("officeCode");

-- CreateIndex
CREATE INDEX "OfficeLocation_countryCode_idx" ON "OfficeLocation"("countryCode");

-- CreateIndex
CREATE INDEX "OfficeLocation_officeType_idx" ON "OfficeLocation"("officeType");

-- CreateIndex
CREATE INDEX "OfficeLocation_isActive_idx" ON "OfficeLocation"("isActive");

-- CreateIndex
CREATE INDEX "ExchangeRateRecord_baseCurrency_idx" ON "ExchangeRateRecord"("baseCurrency");

-- CreateIndex
CREATE INDEX "ExchangeRateRecord_targetCurrency_idx" ON "ExchangeRateRecord"("targetCurrency");

-- CreateIndex
CREATE UNIQUE INDEX "ExchangeRateRecord_baseCurrency_targetCurrency_key" ON "ExchangeRateRecord"("baseCurrency", "targetCurrency");

-- CreateIndex
CREATE UNIQUE INDEX "InternationalDonorProfile_donorNumber_key" ON "InternationalDonorProfile"("donorNumber");

-- CreateIndex
CREATE INDEX "InternationalDonorProfile_countryCode_idx" ON "InternationalDonorProfile"("countryCode");

-- CreateIndex
CREATE INDEX "InternationalDonorProfile_preferredCurrency_idx" ON "InternationalDonorProfile"("preferredCurrency");

-- CreateIndex
CREATE INDEX "InternationalDonorProfile_email_idx" ON "InternationalDonorProfile"("email");

-- CreateIndex
CREATE UNIQUE INDEX "CountryComplianceSetting_countryCode_key" ON "CountryComplianceSetting"("countryCode");

-- CreateIndex
CREATE INDEX "CountryComplianceSetting_countryCode_idx" ON "CountryComplianceSetting"("countryCode");

-- CreateIndex
CREATE INDEX "CountryComplianceSetting_isDonationActive_idx" ON "CountryComplianceSetting"("isDonationActive");

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StorageObject" ADD CONSTRAINT "StorageObject_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CmsPage" ADD CONSTRAINT "CmsPage_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CmsArticle" ADD CONSTRAINT "CmsArticle_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DonationCategory" ADD CONSTRAINT "DonationCategory_chartOfAccountId_fkey" FOREIGN KEY ("chartOfAccountId") REFERENCES "AccountHead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "DonationCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DonorProfile" ADD CONSTRAINT "DonorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "DonorProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "DonationCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentTransaction" ADD CONSTRAINT "PaymentTransaction_donationId_fkey" FOREIGN KEY ("donationId") REFERENCES "Donation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxExemptionReceipt" ADD CONSTRAINT "TaxExemptionReceipt_donationId_fkey" FOREIGN KEY ("donationId") REFERENCES "Donation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefundRecord" ADD CONSTRAINT "RefundRecord_donationId_fkey" FOREIGN KEY ("donationId") REFERENCES "Donation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountHead" ADD CONSTRAINT "AccountHead_parentHeadId_fkey" FOREIGN KEY ("parentHeadId") REFERENCES "AccountHead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Voucher" ADD CONSTRAINT "Voucher_donationId_fkey" FOREIGN KEY ("donationId") REFERENCES "Donation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoucherEntry" ADD CONSTRAINT "VoucherEntry_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "Voucher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoucherEntry" ADD CONSTRAINT "VoucherEntry_accountHeadId_fkey" FOREIGN KEY ("accountHeadId") REFERENCES "AccountHead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberProfile" ADD CONSTRAINT "MemberProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MembershipRenewalRecord" ADD CONSTRAINT "MembershipRenewalRecord_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "MemberProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerProfile" ADD CONSTRAINT "VolunteerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerAssignment" ADD CONSTRAINT "VolunteerAssignment_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES "VolunteerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerHoursLog" ADD CONSTRAINT "VolunteerHoursLog_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES "VolunteerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerHoursLog" ADD CONSTRAINT "VolunteerHoursLog_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "VolunteerAssignment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfficialCertificate" ADD CONSTRAINT "OfficialCertificate_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "MemberProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfficialCertificate" ADD CONSTRAINT "OfficialCertificate_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES "VolunteerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_projectManagerUserId_fkey" FOREIGN KEY ("projectManagerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMilestone" ADD CONSTRAINT "ProjectMilestone_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMetric" ADD CONSTRAINT "ProjectMetric_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeneficiaryProjectLink" ADD CONSTRAINT "BeneficiaryProjectLink_beneficiaryId_fkey" FOREIGN KEY ("beneficiaryId") REFERENCES "BeneficiaryProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeneficiaryProjectLink" ADD CONSTRAINT "BeneficiaryProjectLink_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeneficiaryFamilyMember" ADD CONSTRAINT "BeneficiaryFamilyMember_beneficiaryId_fkey" FOREIGN KEY ("beneficiaryId") REFERENCES "BeneficiaryProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeneficiaryDocument" ADD CONSTRAINT "BeneficiaryDocument_beneficiaryId_fkey" FOREIGN KEY ("beneficiaryId") REFERENCES "BeneficiaryProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeneficiaryAssistance" ADD CONSTRAINT "BeneficiaryAssistance_beneficiaryId_fkey" FOREIGN KEY ("beneficiaryId") REFERENCES "BeneficiaryProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeneficiaryAssistance" ADD CONSTRAINT "BeneficiaryAssistance_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeneficiaryFollowUp" ADD CONSTRAINT "BeneficiaryFollowUp_beneficiaryId_fkey" FOREIGN KEY ("beneficiaryId") REFERENCES "BeneficiaryProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FieldVisit" ADD CONSTRAINT "FieldVisit_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FieldVisit" ADD CONSTRAINT "FieldVisit_beneficiaryId_fkey" FOREIGN KEY ("beneficiaryId") REFERENCES "BeneficiaryProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FieldSurveyResponse" ADD CONSTRAINT "FieldSurveyResponse_fieldVisitId_fkey" FOREIGN KEY ("fieldVisitId") REFERENCES "FieldVisit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventSpeaker" ADD CONSTRAINT "EventSpeaker_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRegistration" ADD CONSTRAINT "EventRegistration_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventFeedback" ADD CONSTRAINT "EventFeedback_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventFeedback" ADD CONSTRAINT "EventFeedback_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "EventRegistration"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventReport" ADD CONSTRAINT "EventReport_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Designation" ADD CONSTRAINT "Designation_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeProfile" ADD CONSTRAINT "EmployeeProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeProfile" ADD CONSTRAINT "EmployeeProfile_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeProfile" ADD CONSTRAINT "EmployeeProfile_designationId_fkey" FOREIGN KEY ("designationId") REFERENCES "Designation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeProfile" ADD CONSTRAINT "EmployeeProfile_reportingManagerId_fkey" FOREIGN KEY ("reportingManagerId") REFERENCES "EmployeeProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeDocument" ADD CONSTRAINT "EmployeeDocument_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "EmployeeProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobPosting" ADD CONSTRAINT "JobPosting_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobPosting" ADD CONSTRAINT "JobPosting_designationId_fkey" FOREIGN KEY ("designationId") REFERENCES "Designation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_jobPostingId_fkey" FOREIGN KEY ("jobPostingId") REFERENCES "JobPosting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobInterview" ADD CONSTRAINT "JobInterview_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "JobApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobOffer" ADD CONSTRAINT "JobOffer_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "JobApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobOffer" ADD CONSTRAINT "JobOffer_employeeProfileId_fkey" FOREIGN KEY ("employeeProfileId") REFERENCES "EmployeeProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeAttendance" ADD CONSTRAINT "EmployeeAttendance_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "EmployeeProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeLeave" ADD CONSTRAINT "EmployeeLeave_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "EmployeeProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeAppraisal" ADD CONSTRAINT "EmployeeAppraisal_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "EmployeeProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeExit" ADD CONSTRAINT "EmployeeExit_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "EmployeeProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryStructure" ADD CONSTRAINT "SalaryStructure_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "EmployeeProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollPeriod" ADD CONSTRAINT "PayrollPeriod_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "Voucher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payslip" ADD CONSTRAINT "Payslip_payrollPeriodId_fkey" FOREIGN KEY ("payrollPeriodId") REFERENCES "PayrollPeriod"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payslip" ADD CONSTRAINT "Payslip_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "EmployeeProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrantAndCsrFunding" ADD CONSTRAINT "GrantAndCsrFunding_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrantAndCsrFunding" ADD CONSTRAINT "GrantAndCsrFunding_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "Voucher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpenseRecord" ADD CONSTRAINT "ExpenseRecord_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpenseRecord" ADD CONSTRAINT "ExpenseRecord_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpenseRecord" ADD CONSTRAINT "ExpenseRecord_budgetLineId_fkey" FOREIGN KEY ("budgetLineId") REFERENCES "BudgetLine"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpenseRecord" ADD CONSTRAINT "ExpenseRecord_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "Voucher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetLine" ADD CONSTRAINT "BudgetLine_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "AnnualBudget"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetLine" ADD CONSTRAINT "BudgetLine_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetLine" ADD CONSTRAINT "BudgetLine_accountHeadId_fkey" FOREIGN KEY ("accountHeadId") REFERENCES "AccountHead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankReconciliationStatement" ADD CONSTRAINT "BankReconciliationStatement_bankAccountHeadId_fkey" FOREIGN KEY ("bankAccountHeadId") REFERENCES "AccountHead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReconciliationItem" ADD CONSTRAINT "ReconciliationItem_statementId_fkey" FOREIGN KEY ("statementId") REFERENCES "BankReconciliationStatement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReconciliationItem" ADD CONSTRAINT "ReconciliationItem_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "Voucher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceCalendarItem" ADD CONSTRAINT "ComplianceCalendarItem_statutoryDocumentId_fkey" FOREIGN KEY ("statutoryDocumentId") REFERENCES "StatutoryDocument"("id") ON DELETE SET NULL ON UPDATE CASCADE;

