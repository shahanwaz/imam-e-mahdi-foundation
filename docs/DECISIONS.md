# Architectural Decision Records (ADR)
## Imam E Mahdi Foundation Digital Operating System (IMF-DOS)

**Document Version:** 2.0.0  
**Status:** Approved Architectural Baseline  
**Lead Roles:** Solution Architect & Database Architect  

---

### ADR-001: Modular Monolith over Microservices
* **Status**: ACCEPTED
* **Context**: Building an enterprise-grade NGO platform with 21 interconnected sub-systems (Finance, Donations, Beneficiaries, HR, Projects, Volunteers).
* **Decision**: Architect IMF-DOS as a **Modular Monolith** using Clean/Hexagonal domain boundaries and an in-process Domain Event Bus backed by Redis/BullMQ.
* **Alternatives Considered**: 
  * *Microservices*: Rejected due to high operational complexity, distributed transaction failure risks (critical for double-entry financial ledger), deployment overhead, and network latency.
  * *Unstructured Monolith*: Rejected due to risk of spaghetti code and high coupling.
* **Consequences**: Provides unified type safety, instant atomic database transactions for ledger operations, simplified CI/CD, and zero network hops for internal domain calls, while strictly preventing spaghetti dependencies through clean module interfaces.

---

### ADR-002: Next.js 15 App Router with React 19 Server Actions as the Unified Platform Framework
* **Status**: ACCEPTED
* **Context**: Need a single repository capable of rendering public SEO-optimized landing pages, real-time donor checkout flows, and complex high-density administrative ERP dashboards.
* **Decision**: Adopt Next.js 15 with React 19 Server Components (RSC) and Server Actions.
* **Alternatives Considered**: 
  * *Separate React SPA + Express/NestJS Backend*: Rejected because it duplicates DTO definitions, increases boilerplate, and fractures authentication state.
* **Consequences**: Eliminates API drift by sharing Zod schemas across client and server; delivers sub-100ms initial page loads for public visitors via RSC while maintaining rich interactive states for administrative dashboards.

---

### ADR-003: PostgreSQL 16 & Prisma ORM for Double-Entry Financial Consistency
* **Status**: ACCEPTED
* **Context**: The Foundation handles Zakat, donor contributions, vendor payments, and employee payroll requiring absolute ACID guarantees and relational constraints.
* **Decision**: Standardize on PostgreSQL 16 managed via Prisma ORM 6.x.
* **Alternatives Considered**: 
  * *MongoDB / NoSQL*: Rejected due to lack of multi-table transactional guarantees and schema enforcement needed for accounting ledgers.
* **Consequences**: Enables strict foreign keys, atomic ledger transactions, type-safe migrations, and JSONB storage for audit trails.

---

### ADR-004: Redis 7 & BullMQ for Asynchronous Background Processing
* **Status**: ACCEPTED
* **Context**: Vector PDF generation (80G receipts), WhatsApp broadcast dispatches, and OCR image scanning must not block HTTP request threads.
* **Decision**: Deploy Redis 7 with BullMQ priority job queues.
* **Consequences**: Decouples payment confirmation from PDF rendering and notification dispatch, ensuring instant donor checkout responsiveness.

---

### ADR-005: HMAC-SHA256 Cryptographic Signatures for QR Verification (vs Blockchain)
* **Status**: ACCEPTED
* **Context**: Tax receipts, volunteer certificates, and membership IDs must be publicly verifiable and tamper-proof.
* **Decision**: Embed an HMAC-SHA256 cryptographic signature into QR verification URLs generated as:
  $$\text{Sig} = \text{HMAC-SHA256}(\text{Secret}, \text{Type} + \text{ID} + \text{Amount} + \text{Timestamp})$$
* **Alternatives Considered**: 
  * *Public Blockchain (Ethereum/Polygon)*: Rejected due to gas costs, transaction latency, unnecessary complexity, and environmental overhead.
* **Consequences**: Yields instantaneous zero-cost cryptographic validation directly against the Foundation's authoritative database.

---

### ADR-006: Bespoke Emerald & Gold Luxury Design System with Native RTL/LTR Engine
* **Status**: ACCEPTED
* **Context**: The Foundation requires a visual identity reflecting spiritual dignity, institutional trust, and cultural heritage, accessible in English, Hindi, Urdu, and Arabic.
* **Decision**: Establish custom CSS design tokens utilizing Deep Emerald (`#0B462D`) and Imperial Gold (`#C59A4E`), paired with CSS logical properties for bi-directional layouts.
* **Consequences**: Guarantees a cohesive, brand experience across all languages without duplicating stylesheet layouts.

---

### ADR-007: Theological & Legal Isolation of Zakat & Religious Funds
* **Status**: ACCEPTED
* **Context**: Islamic jurisprudence and statutory donor trust mandate that Zakat and Khums funds cannot be commingled with general administrative expenses.
* **Decision**: Create dedicated restricted Account Heads (`2010-ZAKAT-RESERVE`, `2020-KHUMS-RESERVE`) with automated transaction interceptors that prevent administrative expense vouchers from debiting Zakat heads.
* **Consequences**: Guarantees theological compliance and provides verifiable records for statutory and Sharia auditors.

---

### ADR-008: Mandatory Disclaimer on Unverified Statutory Registrations
* **Status**: ACCEPTED
* **Context**: Regulatory approvals (80G, 12AB, FCRA, CSR-1) must never be misrepresented or assumed before certified document proof is uploaded.
* **Decision**: Enforce a mandatory UI badge (`⚠️ REQUIRES ORGANIZATIONAL / CA / CS / LEGAL VERIFICATION`) across all statutory fields lacking verified document proofs in the Compliance Vault.
* **Consequences**: Protects the Foundation against legal liabilities and maintains transparent compliance.

---

### ADR-009: Hybrid Authentication Architecture (JWT for Portals, DB Sessions for ERP)
* **Status**: ACCEPTED
* **Context**: Public donors require fast, frictionless magic-link logins, while ERP administrators require high-security sessions with immediate revocation capability.
* **Decision**: Implement NextAuth.js v5 with rotating JWTs for donor/volunteer portals, combined with server-side database session validation and mandatory TOTP 2FA for administrative and financial roles.
* **Consequences**: Balances lightweight scalability for thousands of public users with strict security controls for internal staff.

---

### ADR-010: S3-Compatible Object Storage Abstraction with Encrypted KYC Vault
* **Status**: ACCEPTED
* **Context**: The system must store public campaign assets as well as highly confidential government IDs and medical dossiers.
* **Decision**: Implement a `StorageService` interface targeting S3/MinIO with bucket-level segregation (`public-assets`, `tax-receipts`, `private-kyc`). Sensitive KYC documents are client-encrypted with AES-256 before upload and accessed strictly via 15-minute ephemeral signed URLs.
* **Consequences**: Prevents unauthorized data exposure and ensures zero vendor lock-in between AWS S3, Cloudflare R2, or self-hosted MinIO.

---

### ADR-011: Multi-Provider Payment Gateway Abstraction
* **Status**: ACCEPTED
* **Context**: The Foundation receives donations via domestic Indian UPI/NetBanking, international diaspora cards, and offline direct bank transfers.
* **Decision**: Create a unified `PaymentGatewayProvider` interface with dedicated adapters for Razorpay (Domestic), Stripe (International), and Manual Bank Wire with maker-checker verification.
* **Consequences**: Allows swapping or adding payment gateways (e.g. PayU, Cashfree) without altering core donation and accounting workflows.

---

### ADR-012: Multi-Country / Multi-Chapter Tenant Sharding Readiness
* **Status**: ACCEPTED
* **Context**: The Foundation plans to establish international chapters (e.g. UK, USA, UAE) while maintaining centralized governance.
* **Decision**: Include `organizationId` and `countryCode` on all primary relational models, indexed for clean tenant partitioning and Row-Level Security (RLS).
* **Consequences**: Eliminates future schema migrations when onboarding international chapters, enabling unified consolidated reporting or isolated branch operations.

---

### ADR-013: Centralized Document Engine with Unified Cryptographic QR Verification
* **Status**: ACCEPTED
* **Context**: The Foundation generates 12 disparate categories of formal documents (donation receipts, member IDs, employee IDs, certificates, appointment letters, offer letters, payslips, reports). Generating disparate PDF templates and verification logic per module leads to code duplication, inconsistent seals, and fragmented verification gateways.
* **Decision**: Implement a single, centralized `DocumentService` and template registry in `src/lib/documents/` supporting all 12 document categories. Embed a standardized HMAC-SHA256 digital signature hash into QR codes pointing to a unified verification endpoint `/api/verify/[hash]`.
* **Alternatives Considered**:
  * *Per-Module Document Generators*: Rejected due to high code duplication, inconsistent layout styling, and maintenance overhead across 12 modules.
  * *Static Non-Verifiable PDFs*: Rejected because statutory and credential trust requires tamper-evident verification.
* **Consequences**: Standardizes security signatures, document numbering formats, authorized signatories, and provides a single universal verification portal for the entire organization.

---

### ADR-014: Human-in-the-Loop (HITL) AI Provider SPI with Pre-Flight PII Sanitization
* **Status**: ACCEPTED
* **Context**: Non-profit operations benefit from GenAI assistance (drafting blogs, newsletters, grant reports, campaigns), but sensitive legal, financial, compliance, or regulatory content must never be published without authorized human oversight. Furthermore, donor and beneficiary PII must not leak to third-party LLMs.
* **Decision**: Build an extensible `AiProvider` Service Provider Interface (supporting Google Gemini, OpenAI, Claude, and Mock fallback) paired with a pre-flight regex PII scrubber (`scrubSensitiveData`) and a strict 4-stage Human-in-the-Loop state machine:
  $$\text{AI Draft} \longrightarrow \text{Human Review} \longrightarrow \text{Approval} \longrightarrow \text{Publish}$$
* **Alternatives Considered**:
  * *Direct Auto-Publishing*: Strictly rejected due to statutory compliance risk and legal liability.
  * *Single Hardcoded AI Vendor*: Rejected to prevent vendor lock-in and provide failover resilience.
* **Consequences**: Protects sensitive constituent data, eliminates hallucination risks in statutory contexts, and ensures full audit trail attribution for all generated and approved content.

---

### ADR-015: Decoupled Multi-Country, Multi-Currency & Global i18n Architecture
* **Status**: ACCEPTED
* **Context**: The Foundation operates across India and international donor diaspora communities, requiring dynamic localization, varying number systems (Indian Lakhs/Crores vs International Millions/Billions), diverse tax compliance regimes (Section 80G, Gift Aid, 501(c)(3)), and multiple languages.
* **Decision**: Implement a decoupled global configuration layer (`src/lib/global/`) and i18n engine (`src/lib/i18n/`) with zero hardcoded country or currency assumptions. Format numbers, currencies, and dates dynamically via `GlobalFormatter` based on donor locale, and provide bi-directional RTL/LTR dictionaries.
* **Alternatives Considered**:
  * *Hardcoded INR/India Assumptions*: Rejected as it prevents international chapter scaling and diaspora engagement.
* **Consequences**: Enables effortless addition of new countries, currencies, tax schemes, and language packs without core database or UI refactoring.

---

### ADR-016: Multi-Layer Defense-in-Depth Security & Envelope Encryption
* **Status**: ACCEPTED
* **Context**: Managing sensitive vulnerable beneficiary records, employee salaries, KYC documents, and financial transactions requires strict protection against data breaches, brute-force attacks, path traversal, IDOR, and unauthorized administrative actions.
* **Decision**: Deploy defense-in-depth across the application:
  1. *Sliding-Window Rate Limiting* on sensitive routes (auth, donations, AI).
  2. *Canonical Storage Path Sandboxing* preventing path traversal and null-byte injection.
  3. *AES-256-GCM Envelope Encryption* for sensitive KYC and legal vault files at rest.
  4. *Server-Side Atomic RBAC Guards* with immutable Super Admin protection and dynamic session user attribution.
* **Consequences**: Guarantees compliance with international data privacy standards and protects organizational assets against automated exploit vectors.

---

### ADR-017: Independent 12-Persona Quality Assurance Certification
* **Status**: ACCEPTED
* **Context**: Theoretical code correctness does not guarantee end-to-end user journey integrity across diverse operational roles and device form factors.
* **Decision**: Standardize on a 12-persona independent quality assurance matrix (New Donor, Returning Donor, Volunteer, Member, Field Worker, Project Manager, Finance Admin, HR Admin, Content Admin, Director, Auditor, Super Admin) tested across desktop, tablet, and mobile viewports with comprehensive bug reproduction, root-cause analysis, and verification gates.
* **Consequences**: Validates real-world usability, ensures responsive UI consistency, and provides verifiable test telemetry documented in `TESTING.md`.

