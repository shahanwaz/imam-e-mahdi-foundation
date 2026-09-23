# Production Deployment Runbook & Operational Procedures (IMF-DOS)

**IMAM E MAHDI FOUNDATION** *(Section 8 Not-for-Profit Company | CIN: U88900DC2026NPL474906)*  
**Public Brand: IMAM MISSION — *Serving Humanity Beyond Boundaries***  
*Document Version: 3.0.0 | Target Domain: `https://imammission.org`*

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ PRODUCTION CONTAINER ARCHITECTURE (docker-compose.production.yml)             │
├──────────────────────────────────────────────────────────────────────────────┤
│ Ingress Layer:                                                               │
│   NGINX Reverse Proxy (Alpine) — Ports 80 & 443                              │
│   ├── SSL / TLS 1.3 Termination (Let's Encrypt / Custom Certificate)         │
│   ├── Strict Rate Limiting (Zones: general 30r/s, auth 5r/s, api 20r/s)      │
│   └── Host Routing: imammission.org, www, api, admin                         │
│                                      │ (imf_prod_network)                    │
│                                      ▼                                       │
│ Application Tier:                                                            │
│   IMF-DOS App (Next.js 16 + Node.js 22 Standalone) — Port 3000 (Internal)   │
│   ├── Multi-Stage Dockerfile (Alpine, Non-Root User: nextjs:nodejs UID 1001) │
│   ├── Server-Side Rendering (SSR) + API Route Handlers                       │
│   ├── Cryptographic PII Vault (AES-256-GCM) & HMAC-SHA256 Verification       │
│   └── Multi-Tenant Storage Layer (PUBLIC_ASSETS, PRIVATE_KYC, LEGAL_VAULT)   │
│                                      │                                       │
│                                      ├───► PostgreSQL 16 (Port 5432 Internal)│
│                                      │     └── Persistent Volume: pgdata     │
│                                      └───► Redis 7 (Port 6379 Internal)      │
│                                            └── Persistent Volume: redis_data │
│ Background Worker Daemon (Standalone / Subservice):                          │
│   Runs: `npm run worker:start` (Communication retries, Compliance alerts)   │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Server Prerequisites

### 1.1 Sizing & Operating System
- **Operating System**: Ubuntu 22.04 LTS or Ubuntu 24.04 LTS (x86_64 / ARM64)
- **Minimum Sizing**: 2 vCPU, 4 GB RAM, 50 GB NVMe SSD
- **Recommended Production Sizing**: 4 vCPU, 8 GB RAM, 100 GB NVMe SSD

### 1.2 DNS Records Configuration
Configure the following DNS records at your domain registrar (pointing to `<SERVER_PUBLIC_IP>`):
| Type | Host | Points To | TTL |
| :--- | :--- | :--- | :--- |
| `A` | `@` | `<SERVER_PUBLIC_IP>` | 300s |
| `CNAME` | `www` | `imammission.org` | 300s |
| `A` | `api` | `<SERVER_PUBLIC_IP>` | 300s |
| `A` | `admin`| `<SERVER_PUBLIC_IP>` | 300s |

### 1.3 Host Package Installation & Firewall
```bash
# Update OS packages
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git ufw fail2ban jq certbot python3-certbot-nginx

# Configure UFW firewall (Strict Least Privilege)
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp comment 'SSH Access'
sudo ufw allow 80/tcp comment 'HTTP ACME Challenge'
sudo ufw allow 443/tcp comment 'HTTPS TLS Traffic'
sudo ufw --force enable

# Install Docker CE & Docker Compose Plugin
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
newgrp docker

# Verify Docker engine
docker --version
docker compose version
```

---

## 2. Cloning Repository

```bash
# Target deployment directory
sudo mkdir -p /var/www/imf-dos
sudo chown -R $USER:$USER /var/www/imf-dos

# Clone production repository branch
git clone -b main https://github.com/imam-mission/imf-dos.git /var/www/imf-dos
cd /var/www/imf-dos
```

---

## 3. Environment Setup

```bash
# Create production environment file from template
cp .env.example .env.production
chmod 600 .env.production

# Generate Cryptographic Keys using OpenSSL
openssl rand -hex 32  # For JWT_SECRET
openssl rand -hex 32  # For ENCRYPTION_KEY_PII
openssl rand -hex 32  # For QR_HMAC_SECRET
openssl rand -hex 32  # For RECEIPT_SIGNING_SECRET
openssl rand -hex 32  # For BACKUP_ENCRYPTION_KEY
openssl rand -base64 24 # For DB_PASSWORD

# Edit configuration file
nano .env.production
```

Ensure the following variables are populated in `.env.production`:
```env
NODE_ENV=production
PORT=3000
DB_USER=imf_admin
DB_PASSWORD=<STRONG_GENERATED_PASSWORD>
DB_NAME=imf_production
DATABASE_URL=postgresql://imf_admin:<STRONG_GENERATED_PASSWORD>@postgres:5432/imf_production?schema=public
REDIS_URL=redis://redis:6379

JWT_SECRET=<32_HEX_STRING>
SESSION_COOKIE_NAME=imf_dos_session
ENCRYPTION_KEY_PII=<32_HEX_STRING>
QR_HMAC_SECRET=<32_HEX_STRING>
RECEIPT_SIGNING_SECRET=<32_HEX_STRING>
BACKUP_ENCRYPTION_KEY=<32_HEX_STRING>

STORAGE_DRIVER=local
STORAGE_LOCAL_DIR=/app/uploads
BACKUP_STORAGE_DIR=/app/backups
USE_MOCK_PAYMENTS=false

SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=<SMTP_KEY>
SMTP_FROM_EMAIL=contact@imammission.org

NEXT_PUBLIC_SITE_URL=https://imammission.org
NEXT_PUBLIC_APP_URL=https://imammission.org
```

---

## 4. Building Images

Build the production containers using multi-stage caching:
```bash
# Build production Docker images without running
docker compose -f docker-compose.production.yml --env-file .env.production build --no-cache
```

---

## 5. Starting Services

```bash
# Start all production services in daemon mode
docker compose -f docker-compose.production.yml --env-file .env.production up -d

# Verify all containers are running
docker compose -f docker-compose.production.yml ps
```

---

## 6. Database Migration

Run Prisma production migration deploy (non-destructive):
```bash
# Execute migration deploy inside the app container
docker compose -f docker-compose.production.yml exec app npx prisma migrate deploy

# Verify migration status
docker compose -f docker-compose.production.yml exec app npx prisma migrate status
```

> [!IMPORTANT]
> Never run `prisma db push` or `prisma migrate reset` in production. Always use `npx prisma migrate deploy`.

---

## 7. Checking Health

```bash
# 1. Check container health status
docker compose -f docker-compose.production.yml ps

# 2. Query HTTP health endpoint
curl -s http://localhost:3000/api/health | jq .

# Expected Output:
# {
#   "status": "UP",
#   "timestamp": "2026-09-19T...",
#   "uptimeSeconds": 120,
#   "responseTimeMs": 4,
#   "components": {
#     "database": { "status": "HEALTHY", "latencyMs": 2 },
#     "encryptionVault": { "status": "ACTIVE", "algorithm": "AES-256-GCM" },
#     "verificationEngine": { "status": "ACTIVE", "protocol": "HMAC-SHA256" }
#   }
# }

# 3. Run full 10-point automated post-deployment validation suite
docker compose -f docker-compose.production.yml exec app npx tsx scripts/verify-post-deployment.ts
```

---

## 8. Viewing Logs

```bash
# View combined live log stream
docker compose -f docker-compose.production.yml logs -f --tail=100

# View specific service logs
docker compose -f docker-compose.production.yml logs -f --tail=100 app
docker compose -f docker-compose.production.yml logs -f --tail=100 nginx
docker compose -f docker-compose.production.yml logs -f --tail=100 postgres
docker compose -f docker-compose.production.yml logs -f --tail=100 redis

# Search for errors across all logs
docker compose -f docker-compose.production.yml logs --tail=1000 | grep -i "error"
```

---

## 9. Restarting Services

```bash
# Graceful restart of the application container only
docker compose -f docker-compose.production.yml restart app

# Graceful restart of the entire production stack
docker compose -f docker-compose.production.yml restart
```

---

## 10. Stopping Services

```bash
# Gracefully stop all production containers without removing persistent data
docker compose -f docker-compose.production.yml stop

# Stop and remove containers and network (preserves volumes)
docker compose -f docker-compose.production.yml down
```

---

## 11. Backup

### 11.1 PostgreSQL Database Backup
```bash
# Create timestamped SQL dump
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
docker compose -f docker-compose.production.yml exec -T postgres pg_dump -U imf_admin -d imf_production -F c -b -v > /var/backups/imf_db_${TIMESTAMP}.dump

# Encrypt backup snapshot with AES-256-CBC
openssl enc -aes-256-cbc -salt -pbkdf2 -in /var/backups/imf_db_${TIMESTAMP}.dump -out /var/backups/imf_db_${TIMESTAMP}.dump.enc -pass pass:$BACKUP_ENCRYPTION_KEY
rm /var/backups/imf_db_${TIMESTAMP}.dump
```

### 11.2 Storage & Document Vault Backup
```bash
# Backup persistent uploads volume
docker run --rm \
  -v imf_prod_uploads_data:/source:ro \
  -v /var/backups:/backup \
  alpine tar -czf /backup/imf_uploads_${TIMESTAMP}.tar.gz -C /source .
```

### 11.3 Automated Comprehensive Backup CLI
```bash
docker compose -f docker-compose.production.yml exec app npx tsx scripts/backup-cli.ts create --type full
```

---

## 12. Restore

### 12.1 PostgreSQL Database Restore
```bash
# 1. Decrypt database backup
openssl enc -d -aes-256-cbc -pbkdf2 -in /var/backups/imf_db_<TIMESTAMP>.dump.enc -out /tmp/restore.dump -pass pass:$BACKUP_ENCRYPTION_KEY

# 2. Restore database schema and data
docker compose -f docker-compose.production.yml exec -T postgres pg_restore -U imf_admin -d imf_production --clean --if-exists -v /tmp/restore.dump

# 3. Clean up decrypted dump
rm /tmp/restore.dump
```

### 12.2 Storage Restore
```bash
docker run --rm \
  -v imf_prod_uploads_data:/destination \
  -v /var/backups:/backup \
  alpine sh -c "cd /destination && tar -xzf /backup/imf_uploads_<TIMESTAMP>.tar.gz"
```

---

## 13. Rollback Procedure

In the event of a critical deployment failure:

### 13.1 Application Rollback
```bash
# 1. Checkout previous stable Git commit or tag
git checkout v1.0.0

# 2. Rebuild and restart application container
docker compose -f docker-compose.production.yml --env-file .env.production up -d --build --no-deps app
```

### 13.2 Database Migration Rollback Considerations
> [!CAUTION]
> Prisma migrations are forward-only (`prisma migrate deploy`). If a migration contains irreversible schema changes or dropped columns, you MUST NOT attempt automatic down-migrations. Instead:
> 1. Restore the database from the pre-deployment backup snapshot taken in Section 11.1.
> 2. Alternatively, apply a forward-correcting Prisma migration that restores required columns or tables.

---

## 14. Updating Application

Zero-downtime rolling update workflow:
```bash
# 1. Pull latest verified source code
cd /var/www/imf-dos
git pull origin main

# 2. Build new application image
docker compose -f docker-compose.production.yml --env-file .env.production build app

# 3. Apply any new pending Prisma migrations
docker compose -f docker-compose.production.yml --env-file .env.production run --rm app npx prisma migrate deploy

# 4. Recreate and restart application container seamlessly
docker compose -f docker-compose.production.yml --env-file .env.production up -d --no-deps app

# 5. Verify health
docker compose -f docker-compose.production.yml exec app npx tsx scripts/verify-post-deployment.ts
```

---

## 15. Troubleshooting

| Issue / Symptom | Root Cause | Remediation Command |
| :--- | :--- | :--- |
| `502 Bad Gateway` from NGINX | App container is starting or crashed | `docker compose -f docker-compose.production.yml logs app` |
| `Database Unreachable` in `/api/health` | PostgreSQL container failed health check | `docker compose -f docker-compose.production.yml restart postgres` |
| `PrismaClientInitializationError` | Invalid `DATABASE_URL` or network partition | Verify credentials in `.env.production` and run `docker compose exec postgres pg_isready` |
| Redis Connection Refused | Redis container offline | `docker compose -f docker-compose.production.yml restart redis` |
| Permission Denied in `/app/uploads` | Volume ownership mismatch | Ensure `nextjs:nodejs` (UID 1001) owns directory |
| Rate Limit HTTP 429 triggered | High request volume hitting NGINX zone | Adjust `limit_req_zone` bursts in `deploy/nginx/nginx.production.conf` |
