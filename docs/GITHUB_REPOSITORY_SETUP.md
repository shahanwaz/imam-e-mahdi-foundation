# IMF-DOS — GitHub Repository Setup & Security Specification

**Project:** IMAM E MAHDI FOUNDATION Digital Operating System (IMF-DOS)  
**Security Classification:** Enterprise Non-Profit ERP / Core Banking & Donation Infrastructure  
**Author:** IMF Core Architecture & Security Engineering Bureau  
**Version:** 1.0.0 Production  

---

## 1. Repository Setup & Connecting GitHub

### Initial Local Git Status
This repository is initialized locally with the primary default branch named `main`.  
No remote origins have been configured, and no code has been pushed externally.

### Step-by-Step Instructions to Connect GitHub:
When you are ready to publish this audited, clean repository to your organization's private GitHub account:

1. **Create a Private GitHub Repository** (e.g. `imam-e-mahdi-dos` on GitHub).  
   *Note: Do NOT initialize with a README, .gitignore, or License on GitHub since they already exist locally.*

2. **Add Remote Origin:**
   ```bash
   git remote add origin git@github.com:<YOUR_ORGANIZATION_OR_USERNAME>/imam-e-mahdi.git
   ```
   *(Or using HTTPS: `git remote add origin https://github.com/<YOUR_ORGANIZATION_OR_USERNAME>/imam-e-mahdi.git`)*

3. **Verify Remote Configuration:**
   ```bash
   git remote -v
   ```

4. **Push to Main:**
   ```bash
   git push -u origin main
   ```

---

## 2. Environment Variable & Secrets Management

### Security Principles:
1. **Never commit real secrets:** `.env` and all `.env.*` files (except `.env.example`) are strictly ignored by `.gitignore`.
2. **Template Synchronization:** Always keep `.env.example` updated with variable keys only. Never place live production keys in `.env.example`.
3. **Secret Injection in Production:** Production environments should inject secrets via container runtime environment variables, Docker Secrets, Kubernetes Secrets, or a dedicated vault (e.g. HashiCorp Vault, AWS Secrets Manager, Doppler).

### Setting Up Local Development:
1. Clone the repository to your workstation:
   ```bash
   git clone git@github.com:<YOUR_ORGANIZATION>/imam-e-mahdi.git
   cd imam-e-mahdi
   ```
2. Copy the environment template:
   ```bash
   cp .env.example .env
   ```
3. Configure your local `.env` with development credentials (e.g., local PostgreSQL connection and development secret keys).

---

## 3. Local Development Setup

### Prerequisites:
- **Node.js:** v20.x or v22.x LTS
- **Package Manager:** npm v10+
- **Database:** PostgreSQL 16
- **Cache/Queue:** Redis 7 (optional for local in-process testing)

### Installation & Run Steps:
```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma Client
npx prisma generate

# 3. Apply baseline database schema (for local development)
npx prisma db push

# 4. Run automated test suite (all 273 unit and integration tests)
npm test

# 5. Start development server
npm run dev
# Server runs on http://localhost:3000 (or http://localhost:3001)
```

---

## 4. Production Deployment & Database Migrations

### Migration Strategy (Zero-Downtime):
IMF-DOS uses **formal sequential Prisma migrations**.  
**NEVER run `prisma db push` or `prisma migrate reset` in production.**

Production deployments MUST execute:
```bash
npx prisma migrate deploy
```

Refer to [`docs/DATABASE_MIGRATION_PRODUCTION.md`](file:///Users/shahanwazali/Projects/imam-e-mahdi/docs/DATABASE_MIGRATION_PRODUCTION.md) for full zero-downtime forward/backward compatibility guidelines.

### Production Build & Container Execution:
```bash
# Build standalone Next.js bundle
npm run build

# Or launch complete multi-container production stack
docker compose -f docker-compose.production.yml up -d
```

---

## 5. Security & Access Control Rules

1. **Production Fail-Closed Mandate:**
   - If live payment credentials (`RAZORPAY_KEY_ID`, `STRIPE_SECRET_KEY`) or communication credentials (`SMTP_HOST`, `WHATSAPP_API_TOKEN`, `SMS_GATEWAY_API_KEY`) are missing in `NODE_ENV=production`, the application **fails closed** with an explicit error.
   - Mock providers (`MockPaymentProvider`, `MockEmailProvider`, `MockWhatsAppProvider`, `MockSmsProvider`, `MockAiProvider`) are blocked from running in production unless `ALLOW_MOCK_IN_PRODUCTION=true` is explicitly set.

2. **Data Partitioning & RBAC:**
   - Patrons can only query their own records (`/donor/dashboard` enforces strict session ownership).
   - Donor A can never view or modify Donor B's contributions or personal information.
   - PII (PAN numbers, National IDs) is encrypted at rest using AES-256-GCM.

3. **Regulatory & Tax Compliance Safety:**
   - `COMPLIANCE_80G_STATUS` defaults to `NOT_VERIFIED`.
   - The platform will NEVER display or claim Section 80G tax deductions until formal registration orders are verified by a licensed Chartered Accountant and toggled in configuration.

---

## 6. Disaster Recovery & Backup Warnings

1. **Automated Encrypted Backups:**
   - Scheduled hourly and daily backup snapshots are written to the local `/backups/` directory (mounted via Docker volume `imf_prod_backups_data`).
   - Backup files (`*.imfbak`) and database dumps (`*.sql`, `*.dump`) are strictly excluded from Git.

2. **Offsite Vaulting:**
   - Production backups should be periodically synced to an offsite S3/GCS immutable bucket with Object Lock enabled.
   - Keep backup encryption keys (`BACKUP_ENCRYPTION_KEY`) in an isolated, multi-custody offline vault.

---
*For full architectural specifications, consult [`ARCHITECTURE.md`](file:///Users/shahanwazali/Projects/imam-e-mahdi/ARCHITECTURE.md) and [`docs/MASTER_PLAN.md`](file:///Users/shahanwazali/Projects/imam-e-mahdi/docs/MASTER_PLAN.md).*
