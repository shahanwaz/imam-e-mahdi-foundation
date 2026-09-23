# Changelog & Architectural Governance Log
## Imam E Mahdi Foundation Digital Operating System (IMF-DOS)

All notable architectural decisions, schema migrations, and system releases will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-09-15

### Initialized (Phase 0 Baseline)
- **Master Strategic Plan (`/docs/MASTER_PLAN.md`)**: Formulated complete 21-subsystem strategic operating blueprint, brand guidelines (Deep Emerald `#0B462D` & Imperial Gold `#C59A4E`), multi-agent governance, and legal compliance policy.
- **System Architecture (`/docs/ARCHITECTURE.md`)**: Defined Next.js 15 App Router + React 19 + TypeScript + PostgreSQL 16 + Redis 7 + Prisma ORM + BullMQ modular monolith topology.
- **Module Specifications (`/docs/MODULES.md`)**: Authored detailed functional and technical specifications for all 21 core sub-systems.
- **Database Schema (`/docs/DATABASE_SCHEMA.md`)**: Architected complete PostgreSQL relational model with 25+ models, strict foreign keys, indexing, and Prisma schema definitions.
- **API Contracts (`/docs/API_DOCUMENTATION.md`)**: Defined RESTful endpoints, Server Actions, error envelopes, and webhook contracts.
- **Roles & Permissions (`/docs/ROLES_PERMISSIONS.md`)**: Established 10 standardized roles with 65+ granular atomic permissions and middleware enforcement patterns.
- **Security Posture (`/docs/SECURITY.md`)**: Configured OWASP Top 10 mitigation guidelines, AES-256 PII encryption vault, and HMAC-SHA256 tamper-proof QR verification protocol.
- **Testing & Verification (`/docs/TESTING.md`)**: Established multi-tier testing strategy (Vitest, Playwright, k6) and automated quality gates.
- **DevOps & Deployment (`/docs/DEPLOYMENT.md`)**: Created multi-stage Dockerfile, environment variables matrix, zero-downtime rolling update strategy, and disaster recovery protocol.
- **Development Roadmap (`/docs/DEVELOPMENT_ROADMAP.md`)**: Formulated 6-phase milestone execution plan with strict exit verification criteria and agent assignment matrix.
- **Architectural Decision Records (`/docs/DECISIONS.md`)**: Recorded foundational ADR-001 through ADR-007.

---

## [2.0.0] - 2026-09-15

### Architectural Expansion & UX/UI Architecture Baseline
- **System Architecture v2.0 (`/docs/ARCHITECTURE.md`)**: Completed 14-dimension architectural deep-dive covering Clean/Hexagonal layers, Storage SPI, Payment SPI, Notification SPI, AI SPI, and Multi-Country Chapter federation.
- **Database Architecture v2.0 (`/docs/DATABASE_SCHEMA.md`)**: Engineered complete PostgreSQL 16 schema with 25+ models, multi-chapter fields (`organizationId`, `countryCode`), AES-256 encrypted PII annotations, and GIN/B-tree index optimization.
- **Module Boundaries v2.0 (`/docs/MODULES.md`)**: Formalized 21 bounded contexts with explicit domain event bus topology and dependency rules.
- **API Contracts v2.0 (`/docs/API_DOCUMENTATION.md`)**: Specified Zod DTO request schemas, Server Actions signatures, idempotency key mechanisms, and signed webhook contracts.
- **Architectural Decisions v2.0 (`/docs/DECISIONS.md`)**: Documented ADR-001 through ADR-012 with context, alternatives considered, and trade-offs.
- **UX Architecture & "Noor" Design System (`/docs/UX_UI_DESIGN_SYSTEM.md`)**: Authored comprehensive design system specification featuring Deep Emerald (`#0B462D`) & Imperial Gold (`#C59A4E`) tokens, reusable component primitives (buttons, inputs, datatables, cards, modals, drawers, tabs, badges, alerts, states), unified sitemap across 4 portal contexts, and end-to-end user journeys for giving, beneficiary intake, volunteer shifts, events, HRMS payroll, and financial ledger balancing.

---

## [2.1.0] - 2026-09-15

### Admin ERP Shell & Reusable Component System
- **Admin ERP Layout Shell (`src/components/admin/layout/*`)**: Built high-craft, production-grade layout integrating collapsible sidebar, top command header, dynamic breadcrumbs, `Cmd+K` global search palette, interactive notification drawer, and user profile menu.
- **"Noor" Design System UI Primitives (`src/components/ui/*`)**: Created reusable component system for `Button`, `Badge`, `Card`, `MetricCard`, `Modal`, `Drawer`, `Tabs`, `Alert`, `Skeleton`, and `EmptyState`.
- **Executive Command Center (`src/app/admin/dashboard/page.tsx`)**: Delivered executive dashboard with live KPI metric cards (+18.4% collections, 14,820 beneficiaries, 28 active projects, 1,250 volunteers), direct operational shortcuts bar, active campaigns progress thermometers, restricted religious reserves, live audit stream, and statutory compliance alert banner.
- **Profile & 2FA Security Center (`src/app/admin/profile/page.tsx`)**: Created profile details, role permissions summary, and interactive RFC 6238 TOTP 2FA configuration modal.
- **Organization Settings (`src/app/admin/settings/page.tsx`)**: Implemented organizational legal identity, financial defaults, and statutory compliance matrix with unverified regulatory badges.
- **Multi-Device Browser Verification**: Verified responsive layout resilience and drawer behaviors across Desktop (1440x900), Tablet (768x1024), and Mobile (375x812) viewports.

---

## [2.2.0] - 2026-09-15

### CMS Engine & 25-Page Public Website Delivery
- **CMS Database Architecture (`prisma/schema.prisma`)**: Integrated PostgreSQL relational models for `CmsPage`, `CmsProgram`, `CmsArticle`, `CmsStory`, `CmsMediaAsset`, `CmsFaq`, `CmsMenuItem`, `PublicInquiry`, `VolunteerApplication`, `JobPosting`, and `ContentWorkflowStatus`.
- **Dynamic Content & Fallback Service (`src/lib/cms/content-service.ts`)**: Built high-fidelity, zero-hardcoding content service with database querying and rich baseline content dictionaries for all 25 public pages.
- **SEO & Structured Data Engine (`src/lib/seo/metadata.ts`)**: Implemented metadata generator constructing OpenGraph, Twitter Cards, canonical URLs, robots indexing, and schema.org NGO/Organization JSON-LD.
- **Public Layout Shell (`src/components/public/layout/*`, `src/app/(public)/layout.tsx`)**: Built glassmorphic `PublicNavbar` with dropdowns and responsive drawer, and 5-column `PublicFooter` with newsletter subscribe and statutory 80G/12A notice.
- **Interactive Public Components (`src/components/public/*`)**:
  - `HeroBanner.tsx`: High-impact hero with live impact telemetry card.
  - `ZakatCalculatorWidget.tsx`: Interactive Zakat al-Mal, Fitrah, and Khums Nisab calculator with real-time computation and 80G tax benefit option.
  - `CauseGrid.tsx`: Urgent appeals cards with progress thermometers and Zakat 100% eligibility badges.
  - `ImpactCounterSection.tsx`: Verifiable telemetry counters for 48,500+ beneficiaries, ₹4.2+ Cr aid disbursed, 2,850+ scholarships.
  - `StoryCarousel.tsx`: Transformative beneficiary case studies with quotes and verified outcome badges.
  - `PublicFaqAccordion.tsx`: Searchable accordion categorized by Zakat, 80G receipts, volunteering, and aid.
  - `PublicInquiryForm.tsx` & `VolunteerApplicationForm.tsx`: Interactive public forms with API submission endpoints.
- **25 CMS-Driven Public Pages (`src/app/(public)/*`)**:
  1. Home (`/`)
  2. About (`/about`)
  3. Vision & Mission (`/vision-mission`)
  4. Leadership (`/leadership`)
  5. Governance (`/governance`)
  6. Programs (`/programs`)
  7. Projects (`/projects`)
  8. Campaigns / Causes (`/causes`)
  9. Events & Health Camps (`/events`)
  10. Impact Telemetry (`/impact`)
  11. Success Stories (`/stories`)
  12. News & Dispatches (`/news`)
  13. Blog & Theological Research (`/blog`)
  14. Photo Gallery (`/gallery`)
  15. Documentary Videos (`/videos`)
  16. Volunteer Opportunities (`/volunteer`)
  17. Donate & Zakat Gateway (`/donate`)
  18. Contact & Secretariats (`/contact`)
  19. Radical Transparency (`/transparency`)
  20. Audited Annual Reports (`/reports`)
  21. Careers & Fellowships (`/careers`)
  22. FAQ (`/faq`)
  23. Privacy Policy (`/privacy`)
  24. Terms of Giving (`/terms`)
  25. Accessibility Statement (`/accessibility`)
- **Admin CMS Management Suite (`src/app/admin/cms/page.tsx`)**: Executive CMS dashboard for managing 25 public pages, content workflow (`DRAFT → REVIEW → APPROVED → PUBLISHED → ARCHIVED`), incoming citizen inquiries, and volunteer candidate approvals.
- **Automated & Browser Verification**:
  - `npm run type-check`: 0 TypeScript errors.
  - `npm run test`: 33 passing automated tests.
  - `browser_subagent`: Visual and interactive validation on Desktop (1440px) and Mobile (375px).

---

## [2.3.0] - 2026-09-15

### Enterprise Donation, Payment SPI, Donor CRM & Double-Entry Accounting
- **Payment Abstraction Layer (SPI) (`src/lib/payments/*`)**:
  - Strategy Pattern decoupling gateway implementations: `RazorpayProvider` (domestic INR/UPI), `StripeProvider` (international FX/Cards), `BankTransferProvider` (direct NEFT/RTGS with virtual reference reconciliation), and `MockPaymentProvider` (deterministic local sandbox).
  - Webhook verification with raw text body signature checks & timestamp tolerance.
- **Strict Configurable Compliance Framework (`src/lib/donations/donation-service.ts`)**:
  - Zero unverified assumptions: 80G tax exemptions and religious reserves (100% Zakat Direct, Khums Sahm-e-Imam/Sadat) only display and issue when `complianceStatus === 'APPROVED'`.
  - Mandatory 10-character PAN validation for 80G tax exemption receipts.
  - AES-256 GCM encryption at rest for sensitive PII and masked PAN format (`ABCDE****F`).
- **Cryptographic Receipts & QR Audit Verification (`src/lib/donations/receipt-service.ts`, `src/app/(public)/verify/receipt/[hash]/page.tsx`)**:
  - Sequential receipt numbering (`IMF-REC-YYYY-XXXXX`) and Form 10BE compliant 80G tax certificate numbering (`IMF-80G-YYYY-XXXX`).
  - Tamper-proof HMAC-SHA256 signature hashing verifying integrity against the immutable database registry.
  - Public verification page with official seal, printable layout, and cryptographic verification hash inspection.
- **Double-Entry General Ledger & Trial Balance (`src/lib/finance/general-ledger-service.ts`, `src/app/admin/finance/ledger/page.tsx`)**:
  - Standard non-profit Chart of Accounts (`1010-HDFC-BANK-MAIN`, `1020-RAZORPAY-CLEARING`, `2010-ZAKAT-MAL-RESERVE`, `2020-KHUMS-SEHAM-IMAM`, `3010-GENERAL-SADAQAH`, etc.).
  - Automated journal voucher posting upon payment capture: debiting clearing account, crediting restricted reserve, maintaining $\sum \text{Debits} == \sum \text{Credits}$ balance.
  - Real-time Trial Balance balancing calculation and restricted Sharia pool isolation viewer.
- **Admin ERP Giving Suite (`src/app/admin/donations/page.tsx`, `src/app/admin/donors/page.tsx`)**:
  - Executive Donation Receipts Ledger with live metrics (Zakat reserve, Khums pool, General Sadaqah), search, multi-criteria filters, and authorized refund execution with ledger reversal.
  - Donor CRM Directory with lifetime contribution tiers (Platinum, Gold, Silver, Active), masked PAN, giving counts, and transaction history.
- **Public Multi-Currency Giving Portal (`src/app/(public)/donate/page.tsx`)**:
  - Dynamic category loading with verified compliance badges.
  - Multi-currency selector (INR, USD, EUR, GBP, AED).
  - Multi-tier checkout modal with simulated sandbox authorization, instant receipt generation, and QR verification link.
- **Testing & Verification**:
  - 12 Vitest test suites with 56 automated unit and integration tests passing (100% success rate).
  - TypeScript type-check passing with 0 errors.
  - Multi-device browser verification across Giving Portal, Public QR Verification, Admin Donations Ledger, Donor Directory, and Finance General Ledger.

---

## [2.4.0] - 2026-09-18

### Centralized Communication Engine, Centralized Document Engine & QR Verification Suite
- **Centralized Communication Engine (`src/lib/communication/*`)**:
  - Unified multi-channel dispatcher supporting Email (SES/SMTP), WhatsApp Business API, SMS (Twilio/Karix), and In-App Notifications.
  - Templating engine with variable interpolation (`{{donorName}}`, `{{amount}}`, `{{dueDate}}`) supporting 10 standardized transactional and alert templates.
- **ONE Centralized Document Engine (`src/lib/documents/*`)**:
  - Single unified generation and verification orchestrator supporting all 12 document categories: Donation Receipts, Member IDs, Employee IDs, Membership Certificates, Volunteer Certificates, Appreciation Certificates, Appointment Letters, Offer Letters, Payslips, Donation Statements, Project Reports, and Impact Reports.
  - Standardized tamper-proof HMAC-SHA256 digital signatures embedded in QR codes for instant offline/online authentication.
- **Universal Verification Gateway (`src/app/api/verify/[hash]/route.ts`, `src/app/(public)/verify/doc/[hash]/page.tsx`)**:
  - Single verification gateway verifying any foundation credential in constant time.

---

## [2.5.0] - 2026-09-18

### Statutory Compliance & Legal Document Management Vault
- **Statutory Document Catalog (`src/lib/compliance/statutory-catalog.ts`)**:
  - Comprehensive registry covering 12 statutory document types: Incorporation Certificate, MOA, AOA, Section 8 License, PAN, TAN, 80G Certificate, 12A/12AB, FCRA, CSR-1, Statutory Audit Reports, Board Resolutions, Governance Policies, and Material Vendor Agreements.
- **Compliance Calendar Engine (`src/lib/compliance/compliance-service.ts`)**:
  - Automated tracking of statutory recurring deadlines, responsible trustees, notification reminders, and document attachments.
- **Mandatory Safe Harbor Disclaimer**:
  - Enforced system-wide non-advisory disclaimer: `⚠️ REQUIRES ORGANIZATIONAL / CA / CS / LEGAL VERIFICATION` across all statutory registries.

---

## [2.6.0] - 2026-09-18

### Non-Profit AI Intelligence Engine & Human-in-the-Loop (HITL) Governance
- **Multi-Provider AI SPI (`src/lib/ai/providers/*`)**:
  - Strategy Pattern supporting Google Gemini (`gemini-1.5-flash`), OpenAI (`gpt-4o-mini`), Anthropic Claude (`claude-3-5-sonnet`), and Deterministic Mock providers.
- **PII Scrubbing & Sanitization Engine (`src/lib/ai/sanitizer.ts`)**:
  - Pre-flight regex filtering redacting Aadhaar numbers, PAN cards, credit cards, bank accounts, emails, and phone numbers before LLM dispatch.
- **Mandatory HITL State Machine (`src/lib/ai/ai-service.ts`)**:
  - Strict enforcement: `AI Draft` $\to$ `Human Review` $\to$ `Approval` $\to$ `Publish`. Content flagged with Legal, Financial, Compliance, or Regulatory keywords is locked in `DRAFT_PENDING_REVIEW` and cannot be auto-published without authorized human review.

---

## [2.7.0] - 2026-09-18

### Global Architecture, Multi-Currency Forex & 13 Indic + Global i18n Suite
- **Decoupled Country & Tax Configuration (`src/lib/global/*`)**:
  - Zero hardcoded country assumptions. Dynamic registry for countries, currencies, timezones, and tax compliance schemes (Section 80G, Gift Aid, 501(c)(3), Zakat al-Fitr).
- **International Numbering & Currency Engine (`src/lib/global/formatter.ts`, `currencies.ts`)**:
  - Seamless support for Indian Lakhs/Crores (`₹ 1,50,000`) vs International Millions/Billions (`$ 150,000.00`) with real-time Forex conversion.
- **13 Indic Languages & Global Bi-Directional Architecture (`src/lib/i18n/*`)**:
  - Comprehensive dictionaries for English, Urdu, Hindi, Arabic with RTL directionality and extensible support for Bengali, Tamil, Telugu, Marathi, Gujarati, Punjabi, Kannada, Malayalam, Odia, Assamese, Persian, and Swahili.

---

## [2.8.0] - 2026-09-18

### Enterprise 26-Dimension Security Audit & Defense-in-Depth Hardening
- **Sliding-Window Rate Limiting (`src/lib/rate-limit.ts`, `src/middleware.ts`)**:
  - In-memory rate limiting defending against brute force on auth endpoints (5 attempts / 15m), AI prompts (15 req / min), and donation creation (20 req / min).
- **Storage Path Traversal Hardening (`src/lib/storage.ts`)**:
  - Canonical path resolution (`resolveSecureFilePath`) rejecting null bytes and traversal sequences (`..`), coupled with automatic AES-256-GCM encryption for `PRIVATE_KYC` and `LEGAL_VAULT`.
- **RBAC & Authorization Hardening**:
  - Server-side atomic permission guards (`requirePermission`) enforced across all administrative endpoints, protecting sensitive employee compensation, beneficiary PII unmasking, donation refunds, and compliance deletions.

---

## [2.9.0] - 2026-09-19

### Independent Quality Assurance & 12 User Persona Certification
- **12 Persona Full Workflow Validation (`TESTING.md`)**:
  - Real browser workflow validation across New Donor, Returning Donor, Volunteer, Member, Field Worker, Project Manager, Finance Admin, HR Admin, Content Admin, Director, Auditor, and Super Admin.
- **44-Route Full HTTP 200 Certification**:
  - All 44 core routes across public and administrative portals verified 100% operational.
- **Bug Remediation**:
  - Fixed information disclosure in receipt API, resolved Server Component event handler on `/reports`, corrected client module evaluation on `/admin/ai-tools`, and added resilient offline fallbacks.
- **Automated Test Health**:
  - 34 test files, 243 passing automated tests (100%), 0 TypeScript compilation errors.

---

## [2.10.0] - 2026-09-19

### Code Review & Architectural Alignment
- **Codebase Review & Anti-Pattern Elimination**:
  - Audited full source tree across 15 dimensions (duplicate code, duplicate components, duplicate APIs, unnecessary complexity, poor naming, insecure patterns, hardcoded values, technical debt, unused code, dead code, poor error handling, UI consistency, performance, accessibility, architecture violations).
  - Dynamic user session extraction eliminating hardcoded session constants across administrative mutation APIs (`/api/admin/ai/generate`, `/api/admin/ai/drafts/[id]`, `/api/admin/donations/refund`, `/api/admin/volunteers/[idOrNumber]/verify`).
  - Next.js 15 Server/Client boundary compliance: extracted client event handlers (`ReportDownloadButton.tsx`) to prevent hydration failures on static server components.
- **Security & Authorization Hardening**:
  - Standardized unified API error envelope (`apiSuccess`, `apiError`) preventing internal stack trace leaks in production.
  - Constant-time verification comparisons (`crypto.timingSafeEqual`) preventing timing attacks on cryptographic hashes.
  - AES-256 envelope encryption across private KYC dossiers and statutory legal registries.
- **Documentation & Architectural Synchronization**:
  - Synchronized `CHANGELOG.md`, `DECISIONS.md` (ADR-013 through ADR-017), and `ARCHITECTURE.md` to reflect the completed Centralized Document Engine, Centralized Communication Engine, Pluggable AI SPI with HITL Governance, and Decoupled Global & i18n architecture.



