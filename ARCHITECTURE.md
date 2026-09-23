# System Architecture & Technical Blueprint
## Imam E Mahdi Foundation Digital Operating System (IMF-DOS)

**Document Version:** 2.0.0  
**Status:** Approved Technical Architecture  
**Lead Roles:** Solution Architect & Database Architect  
**Architecture Pattern:** Modular Monolith with Clean/Hexagonal Domain Boundaries  

---

## 1. System Topology & Architectural Principles

The Imam E Mahdi Foundation Digital Operating System (IMF-DOS) is architected as a **High-Cohesion, Low-Coupling Modular Monolith**. It avoids the premature operational overhead, network latency, and distributed transaction pitfalls of microservices, while enforcing strict domain isolation, standardized abstraction interfaces, and asynchronous background worker queues.

```
+---------------------------------------------------------------------------------------------------+
|                                      EDGE & SECURITY GATEWAY                                      |
|  - Cloudflare CDN / DDoS Shield / SSL Termination (TLS 1.3)                                       |
|  - Edge Middleware: Geolocation, Locale Routing, Security Headers, Edge Token Validation           |
+---------------------------------------------------------------------------------------------------+
                                                  │
                                                  ▼
+---------------------------------------------------------------------------------------------------+
|                                 APPLICATION PRESENTATION LAYER                                    |
|  Next.js 15+ (App Router) + React 19 (Server & Client Components)                                 |
|  - Public Portal        - Donor Self-Service      - Volunteer Hub         - Member Portal         |
|  - NGO Admin ERP        - QR Verification Gateway - Field Worker Mobile PWA                        |
+---------------------------------------------------------------------------------------------------+
                                                  │
                                                  ▼
+---------------------------------------------------------------------------------------------------+
|                               APPLICATION & USE-CASE ORCHESTRATION                                |
|  - NextAuth.js v5 (JWT & Multi-Portal Session Engine)                                             |
|  - Granular RBAC / ABAC Authorization Interceptors (65+ Permissions)                              |
|  - Zod Input Sanitization & Request DTO Enveloping                                                |
|  - Domain Event Bus (In-process Pub/Sub & Inter-module Event Dispatcher)                          |
+---------------------------------------------------------------------------------------------------+
                                                  │
                    ┌─────────────────────────────┴─────────────────────────────┐
                    ▼                                                           ▼
+---------------------------------------+                   +---------------------------------------+
|        CORE DOMAIN MODULES            |                   |       INFRASTRUCTURE ABSTRACTIONS     |
| - Identity & Access (IAM)             |                   | - Payment Provider Gateway (SPI)      |
| - Donations, Zakat & Crowdfunding     |                   |   (Razorpay, Stripe, UPI, Bank Wire)  |
| - Finance & Double-Entry Ledger       |                   | - Notification & Broadcast Engine     |
| - Beneficiaries, KYC & Vulnerability  |                   |   (WhatsApp, SES Email, SMS, WebPush) |
| - Projects, M&E & Field Operations    |                   | - File & Object Storage Adapter (S3)  |
| - Human Resources & Payroll (HRMS)    |                   | - AI & Intelligence Engine Adapter    |
| - Volunteers, Members & Events        |                   |   (Gemini, OCR Pipeline, Dedup)       |
| - Compliance, Vault & QR Verification |                   | - Vector PDF & Cryptographic QR Engine|
| - Analytics & Audit Telemetry         |                   | - Multilingual & Bi-Directional (i18n)|
+---------------------------------------+                   +---------------------------------------+
                    │                                                           │
                    └─────────────────────────────┬─────────────────────────────┘
                                                  │
                                                  ▼
+---------------------------------------------------------------------------------------------------+
|                                     DATA & PERSISTENCE LAYER                                      |
|  - Primary Store: PostgreSQL 16 (Relational, ACID, JSONB Audit, Spatial, AES-256 PII Vault)        |
|  - Caching & Job Queue: Redis 7 + BullMQ (Asynchronous PDF, Broadcasts, OCR, Ledger Balancer)     |
|  - Object Storage: S3 / MinIO (Encrypted Vault: Tax Receipts, KYC Dossiers, Legal Documents)      |
+---------------------------------------------------------------------------------------------------+
```

---

## 2. Layered Application Architecture (Clean / Hexagonal Pattern)

Each domain module within the modular monolith follows strict internal layer separation:

```
[ Domain Module Architecture ]
┌─────────────────────────────────────────────────────────────────────────┐
│ 1. PRESENTATION LAYER (Controllers, Server Actions, Route Handlers)     │
│    - Validates incoming DTOs using Zod schemas                          │
│    - Extracts user session and checks permission requirements           │
│    - Calls Application Use Cases                                        │
├─────────────────────────────────────────────────────────────────────────┤
│ 2. APPLICATION / USE-CASE LAYER (Services, Command/Query Handlers)      │
│    - Orchestrates business workflows across repositories and adapters   │
│    - Enforces business transaction boundaries (DB Transactions)         │
│    - Dispatches domain events (e.g., `DONATION_COMPLETED`)              │
├─────────────────────────────────────────────────────────────────────────┤
│ 3. DOMAIN MODEL LAYER (Entities, Value Objects, Domain Rules)           │
│    - Pure business logic (e.g., Zakat Nisab calculator, Ledger balance) │
│    - Zero external dependencies on frameworks or databases             │
├─────────────────────────────────────────────────────────────────────────┤
│ 4. INFRASTRUCTURE & DATA ACCESS LAYER (Prisma Repos, External Adapters) │
│    - Implements domain repository interfaces                            │
│    - Executes PostgreSQL queries via Prisma ORM                         │
│    - Communicates with payment gateways, Redis queues, and AI APIs      │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Strict Module Boundaries & Inter-Module Communication

To maintain modular decoupling without microservices:

1. **No Direct Cross-Module Table Joins**: Modules access other domains strictly through typed **Domain Service Interfaces** or asynchronous **Domain Events**.
2. **Domain Event Bus**: When a state mutation occurs in one module that another module needs to react to, a domain event is published.
   * *Example*: `DonationModule` completes a donation $\rightarrow$ Emits `DonationCompletedEvent` $\rightarrow$ `FinanceModule` creates Journal Voucher, `DocumentModule` enqueues 80G PDF generation, and `NotificationModule` queues WhatsApp message.
3. **Circular Dependency Ban**: Module dependencies form a Directed Acyclic Graph (DAG). `FinanceModule` and `IAMModule` are foundational and never depend on downstream feature modules.

---

## 4. Architectural Classifications & Placement Matrix

| Dimension | Frontend (Client/RSC) | Backend (Server Actions/API) | Database (PostgreSQL/Redis) |
|---|---|---|---|
| **What Belongs Here** | • Interactive Forms & UI state<br>• Client validation feedback<br>• Camera/QR scanner reader<br>• Chart rendering (Recharts)<br>• Responsive & RTL layouts<br>• Optimistic UI updates | • Business logic orchestration<br>• Payment signature verification<br>• Double-entry ledger balancing<br>• Vector PDF generation<br>• Server-side RBAC validation<br>• AI Prompt & OCR pipelines | • Relational constraints & FKs<br>• ACID transactional rollbacks<br>• JSONB audit delta storage<br>• AES-256 encrypted PII fields<br>• High-speed Redis queue jobs<br>• Fast composite B-tree indexes |
| **What is Reusable** | • Design System UI components<br>• Filter & DataTable widgets<br>• Modal & Drawer controllers<br>• Document QR scanner hook<br>• Currency & Date formatters | • Standard API Response Envelopes<br>• Zod Schema validators<br>• HMAC signature generator<br>• BullMQ worker base class<br>• Storage S3 wrapper | • Prisma client singleton<br>• Soft-delete query extension<br>• Audit logger middleware<br>• Encryption / Decryption hooks |
| **What is Configurable** | • Organization display branding<br>• Active UI theme & font size<br>• Active language / locale<br>• Table column visibility | • Payment Gateway API keys<br>• SMTP / WhatsApp credentials<br>• Zakat Nisab gold/silver rates<br>• Dynamic Role-Permission matrix<br>• Rate limiting window thresholds | • Connection pool dimensions<br>• Redis queue concurrency<br>• Database vacuum parameters<br>• Storage bucket bucket policies |
| **What is Extensible** | • New custom dashboard widgets<br>• New certificate print themes<br>• Additional language packs | • Pluggable Payment Gateways<br>• Pluggable Notification channels<br>• Pluggable AI Model providers<br>• Pluggable Jurisdiction Tax rules | • Multi-country chapter schemas<br>• Additional Account Head trees<br>• Custom demographic attributes |

---

## 5. Subsystem Architecture Deep-Dives

### 5.1 Authentication & Multi-Portal IAM Architecture
* **Hybrid Session Strategy**: Secure HTTP-only cookies storing rotating JWTs for stateless public/donor sessions; server-side database session validation for high-security administrative/finance roles.
* **Multi-Factor Authentication (TOTP)**: Built-in RFC 6238 time-based one-time password engine. Mandatory for `SUPER_ADMIN`, `DIRECTOR`, and `FINANCE_OFFICER`.
* **Multi-Portal Routing**: Clean path separation with dedicated middleware gatekeepers:
  * `/portal/donor/*` — Authenticated donors
  * `/portal/volunteer/*` — Authenticated field volunteers
  * `/portal/member/*` — Verified Foundation members
  * `/admin/*` — Executive ERP staff with strict RBAC

### 5.2 Granular RBAC & ABAC Architecture
* **Permission Resolution Algorithm**:
  $$\text{Effective Permissions} = \bigcup_{r \in \text{UserRoles}} \text{Permissions}(r) \cup \text{DirectUserOverrides}$$
* **Attribute-Based Access Control (ABAC)**: Support for scoping permissions by organizational branch or assigned project (e.g. `FieldWorker` can only edit beneficiaries assigned to their specific geographic region).

### 5.3 Storage & File Architecture (S3/MinIO Abstraction)
```typescript
export interface StorageService {
  uploadFile(params: {
    bucket: "public-assets" | "private-kyc" | "tax-receipts" | "legal-vault";
    key: string;
    body: Buffer | Uint8Array;
    contentType: string;
    isEncrypted?: boolean;
  }): Promise<{ url: string; fileKey: string }>;

  getPresignedDownloadUrl(fileKey: string, expiresInSeconds?: number): Promise<string>;
  deleteFile(fileKey: string): Promise<void>;
}
```
* **Storage Isolation**:
  * `public-assets`: Public campaign images, logos, news photos (Served directly via CDN).
  * `tax-receipts`: Generated 80G tax receipts and donation summaries (Signed URLs).
  * `private-kyc`: Aadhaar, PAN, Bank statements, and medical records (Encrypted with server-side AES-256 before upload; ephemeral signed URLs with 15-minute expiry).
  * `legal-vault`: Trust deeds, 12AB/80G registration certificates, and board resolutions.

### 5.4 Centralized Multi-Channel Communication Engine
```
[ Trigger Event (e.g. Donation Completed, Shift Assigned, Calendar Due Date) ]
                                      │
                                      ▼
                        [ CommunicationService (SPI) ]
                                      │
       ┌──────────────────────────────┼──────────────────────────────┬──────────────────────────────┐
       ▼                              ▼                              ▼                              ▼
 [ WhatsApp Business API ]     [ Email SES / SMTP ]           [ SMS Gateway ]              [ In-App Notifications ]
 (DLT / Meta Cloud API)       (DKIM/SPF Transactional)       (Twilio / Karix DLT)         (Server Sent Events / DB)
```
* **Priority-Based Dispatch Matrix**:
  * `PRIORITY_URGENT`: OTPs, Donation 80G receipts, emergency disaster alerts $\rightarrow$ WhatsApp + SMS immediate dispatch.
  * `PRIORITY_NORMAL`: Volunteer shift reminders, event updates, compliance due dates $\rightarrow$ Email + In-App notification.
  * `PRIORITY_LOW`: Monthly newsletters, quarterly impact digests $\rightarrow$ Batched background email queue.
* **Unified Variable Interpolation**: All templates utilize unified Mustache-style token replacements (`{{donorName}}`, `{{amount}}`, `{{documentNumber}}`, `{{verificationUrl}}`) with strict XSS escaping before rendering.

---

### 5.5 Centralized Document Engine & Universal Cryptographic QR Architecture
```
[ Trigger: Document Request (Donation, Certificate, Payslip, ID Card, Report) ]
                                      │
                                      ▼
                     [ Centralized DocumentService ]
                                      │
                     ┌────────────────┴────────────────┐
                     ▼                                 ▼
         [ Template Renderer ]            [ HMAC-SHA256 Signer ]
         (12 Document Schemas)            (Secret + Payload Hash)
                     │                                 │
                     └────────────────┬────────────────┘
                                      │
                                      ▼
                   [ Vector PDF with Embedded QR Code ]
                                      │
                                      ▼
                   [ Universal Verification Gateway ]
                       `GET /api/verify/[hash]`
```
* **12 Standardized Document Categories**:
  1. Donation Receipt (`DONATION_RECEIPT`)
  2. Member ID Card (`MEMBER_ID`)
  3. Employee ID Card (`EMPLOYEE_ID`)
  4. Membership Certificate (`MEMBERSHIP_CERTIFICATE`)
  5. Volunteer Certificate (`VOLUNTEER_CERTIFICATE`)
  6. Appreciation Certificate (`APPRECIATION_CERTIFICATE`)
  7. Appointment Letter (`APPOINTMENT_LETTER`)
  8. Offer Letter (`OFFER_LETTER`)
  9. Employee Payslip (`PAYSLIP`)
  10. Annual Donation Statement (`DONATION_STATEMENT`)
  11. Project Status Report (`PROJECT_REPORT`)
  12. Beneficiary Impact Report (`IMPACT_REPORT`)
* **Cryptographic QR Protocol**:
  $$\text{Payload} = \text{Type} \parallel \text{DocNumber} \parallel \text{EntityId} \parallel \text{IssueDate} \parallel \text{AmountOrRole}$$
  $$\text{Signature} = \text{HMAC-SHA256}(\text{APP\_SECRET}, \text{Payload})$$
  $$\text{QR URL} = \text{https://foundation.org/verify/doc/} + \text{Signature}$$
* **Constant-Time Verification**: Verification requests match against the authoritative database using constant-time string comparison (`crypto.timingSafeEqual`) to eliminate timing-attack vulnerabilities.

---

### 5.6 Human-in-the-Loop (HITL) AI Intelligence Engine
```typescript
export interface AiProvider {
  name: string;
  generateText(prompt: string, context?: Record<string, any>): Promise<AiGenerationResult>;
  summarize(text: string, maxLength?: number): Promise<string>;
  translate(text: string, targetLanguage: string): Promise<string>;
}
```
```
[ User Input / Task Prompt ] ──► [ Regex PII Sanitizer ] ──► [ Active AI Provider (Gemini / OpenAI / Claude) ]
                                                                                   │
                                                                                   ▼
                                                                        [ Generated AI Draft ]
                                                                                   │
                                      ┌────────────────────────────────────────────┴────────────────────────────────────────────┐
                                      ▼                                                                                         ▼
                      [ Non-Sensitive / General Content ]                                                       [ Legal / Financial / Compliance Content ]
                                      │                                                                                         │
                                      ▼                                                                                         ▼
                        [ Status: DRAFT_READY ]                                                                 [ Status: DRAFT_PENDING_REVIEW ]
                                      │                                                                                         │
                                      └────────────────────────────────────────────┬────────────────────────────────────────────┘
                                                                                   │
                                                                                   ▼
                                                                    [ Human Review by Admin ]
                                                                                   │
                                                                                   ▼
                                                                       [ Authorized Approval ]
                                                                                   │
                                                                                   ▼
                                                                   [ Published to Live Channel ]
```
* **Pluggable Multi-Provider Registry**: Supports Google Gemini (`gemini-1.5-flash`), OpenAI (`gpt-4o-mini`), Anthropic Claude (`claude-3-5-sonnet`), and Deterministic Mock providers with zero vendor lock-in.
* **Pre-Flight PII Sanitization (`scrubSensitiveData`)**: Automatically redacts Aadhaar numbers, PAN cards, credit cards, bank accounts, emails, and phone numbers before dispatching prompts to LLM APIs.
* **Non-Bypassable HITL State Machine**: Content classified under legal, financial, tax, or regulatory categories cannot be auto-published; it requires explicit Maker-Checker review with immutable audit attribution.

---

### 5.7 Global Multi-Country & 13 Indic/Global i18n Architecture
```
[ Incoming Request / User Context ]
                │
                ▼
      [ Locale & Country Matcher ]
                │
 ┌──────────────┼──────────────┬──────────────┐
 ▼              ▼              ▼              ▼
[ Country Spec ][ Currency FX ][ Number Format ][ Bi-Di i18n ]
(India / UK /   (INR / USD /   (Lakhs/Crores vs (LTR: en, hi...
 US / UAE /...)  GBP / EUR...)  Millions/Bill.)   RTL: ur, ar...)
```
* **Decoupled Country & Tax Configuration**: Zero hardcoded country-specific assumptions. Supports statutory tax schemes across jurisdictions:
  * India: Section 80G, Section 12AB, FCRA, CSR Form CSR-1
  * United Kingdom: HMRC Gift Aid Scheme
  * United States: 501(c)(3) Public Charity Deductibility
  * United Arab Emirates / GCC: IACAD Zakat al-Fitr / Zakat al-Mal certification
* **Global Formatter (`GlobalFormatter`)**: Dynamic formatting of currencies, localized dates, and numbering systems (e.g. `₹ 1,50,000` Indian format vs `$ 150,000.00` International format).
* **13 Indic & Global Language Coverage**: Full translation and bidirectional RTL/LTR support for English (`en`), Urdu (`ur`), Hindi (`hi`), Arabic (`ar`), Bengali (`bn`), Tamil (`ta`), Telugu (`te`), Marathi (`mr`), Gujarati (`gu`), Punjabi (`pa`), Kannada (`kn`), Malayalam (`ml`), Odia (`or`), Assamese (`as`), Persian (`fa`), and Swahili (`sw`).

---

### 5.8 Defense-in-Depth Security & Storage Architecture
* **Sliding-Window Rate Limiting**: In-memory token bucket rate limiters protecting authentication endpoints (5 attempts / 15m), AI prompt generation (15 req / min), donation checkouts (20 req / min), and public inquiry forms.
* **Canonical Path Traversal Sandbox**: Storage path resolver (`resolveSecureFilePath`) validates canonical paths, strips path traversal sequences (`..`), eliminates null bytes (`\0`), and enforces strict bucket-level sandboxing.
* **Envelope Encryption at Rest**: Sensitive files stored in `PRIVATE_KYC` (identity proofs, medical dossiers) and `LEGAL_VAULT` (board resolutions, statutory registrations) are encrypted at rest using AES-256-GCM. Ephemeral download URLs expire in 15 minutes.
* **Strict Server-Side RBAC Enforcement**: Role-Permission evaluation (`requirePermission`) protects all administrative actions. Super Admin credentials cannot have permissions revoked, and all mutations dynamically record the authenticated `userId`.

---

### 5.9 Immutable Audit & Telemetry Architecture
* Every data mutation writes an atomic entry to `AuditLog`:
  $$\text{AuditEntry} = \{\text{id}, \text{userId}, \text{action}, \text{entity}, \text{entityId}, \text{previousSnapshot}, \text{newSnapshot}, \text{ipAddress}, \text{timestamp}\}$$
* **Tamper Evident Chaining**: Sensitive financial audit records compute a rolling SHA-256 hash linking each log entry to the hash of the preceding entry, making retro-active log alteration mathematically detectable.

---

## 6. Global Multi-Country / Multi-Entity Architecture

IMF-DOS is architected to scale seamlessly from a single national foundation into a global multi-chapter federation:

```
+---------------------------------------------------------------------------------------------------+
|                                     GLOBAL FEDERATION CORE                                        |
|  - Global Currency Normalization Engine (Live Forex feeds with historical pegging)                |
|  - Universal Beneficiary Identity Namespace                                                       |
|  - Global Consolidated Impact & Financial Reporting                                              |
+---------------------------------------------------------------------------------------------------+
                                                  │
                    ┌─────────────────────────────┼─────────────────────────────┐
                    ▼                             ▼                             ▼
+-----------------------------------+ +-----------------------------------+ +-----------------------------------+
|        INDIA CHAPTER (HQ)         | |           UK CHAPTER              | |           US CHAPTER              |
| - Currency: INR (₹)               | | - Currency: GBP (£)               | | - Currency: USD ($)               |
| - Tax Module: Section 80G / 12AB  | | - Tax Module: HMRC Gift Aid       | | - Tax Module: 501(c)(3) Deductions|
| - Legal: FCRA, CSR Form CSR-1     | | - Legal: UK Charity Commission    | | - Legal: IRS Form 990 Reporting   |
| - Gateways: Razorpay, UPI, PayU   | | - Gateways: Stripe UK, GoCardless | | - Gateways: Stripe US, Plaid      |
+-----------------------------------+ +-----------------------------------+ +-----------------------------------+
```

* **Multi-Tenancy Readiness**: All database tables include optional `organizationId` / `countryCode` fields, indexed to allow clean tenant isolation and row-level security (RLS) as international branches are chartered.
* **Jurisdiction-Specific Tax Adapters**: Modular tax certificate generators (`Tax80GGenerator`, `GiftAidReportGenerator`, `IRS501c3ReceiptGenerator`) selected dynamically based on donor tax residency.

