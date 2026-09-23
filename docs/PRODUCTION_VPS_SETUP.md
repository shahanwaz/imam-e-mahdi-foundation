# Production VPS Setup, Hardening & Docker Deployment Runbook (IMF-DOS)

**IMAM E MAHDI FOUNDATION** *(Section 8 Not-for-Profit Company | CIN: `U88900DC2026NPL474906`)*  
**Public Brand: IMAM MISSION — *Serving Humanity Beyond Boundaries***  
*Document Version: 1.0.0 | Step: 32 Production VPS Provisioning | Target Domain: `https://imammission.org`*

---

## 1. Executive Overview & Target Topology

This document details the standard operating procedure (SOP) for provisioning the target production Virtual Private Server (VPS), hardening the Linux operating system, deploying the multi-stage Docker production stack, and establishing persistent, encrypted storage for the **Imam E Mahdi Foundation Digital Operating System (IMF-DOS)**.

```mermaid
graph TD
    Internet([Public Internet / Patrons / Donors]) --> Cloudflare[Cloudflare Edge DNS / WAF]
    Cloudflare --> NGINX[NGINX Ingress Gateway - Ports 80 & 443]
    
    subgraph "Production Host: Ubuntu 24.04 LTS (x86_64)"
        subgraph "Docker Production Network (imf_prod_network - Isolated Bridge)"
            NGINX -->|HTTP Proxy :3000| App[IMF-DOS Standalone App - Next.js 16 / Node.js 22]
            App -->|TCP :5432| DB[(PostgreSQL 16 Engine & PII Vault)]
            App -->|TCP :6379| Redis[(Redis 7 Cache & Queue Broker)]
        end
        
        subgraph "Host Persistent Encrypted Volumes"
            App --> VolUploads[/var/lib/docker/volumes/imf_prod_uploads_data -> /app/uploads]
            App --> VolBackups[/var/lib/docker/volumes/imf_prod_backups_data -> /app/backups]
            DB --> VolPGData[/var/lib/docker/volumes/imf_prod_pgdata -> /var/lib/postgresql/data]
            Redis --> VolRedis[/var/lib/docker/volumes/imf_prod_redis_data -> /data]
            NGINX --> VolCerts[/etc/letsencrypt -> /etc/letsencrypt]
        end
    end
```

---

## 2. VPS Pre-Flight & Hardware Baseline

### 2.1 Hardware & System Requirements

| Metric | Minimum Requirement | Recommended Production Specification |
| :--- | :--- | :--- |
| **Operating System** | Ubuntu 22.04 LTS (x86_64) | **Ubuntu 24.04 LTS (Noble Numbat, 64-bit)** |
| **CPU Architecture** | 2 vCPU (x86_64 / amd64) | **4 vCPU (High-Performance Compute)** |
| **System Memory (RAM)** | 4 GB RAM + 2 GB Swap | **8 GB RAM + 4 GB Swap** |
| **Storage Capacity** | 40 GB NVMe SSD | **80 GB - 160 GB Enterprise NVMe SSD** |
| **Network Interface** | 100 Mbps Public Uplink | **1 Gbps Unmetered Static Public IPv4** |
| **Firewall Ingress** | TCP Ports `22`, `80`, `443` | **Strict UFW (All other ingress blocked)** |
| **Container Engine** | Docker Engine 26.0+ | **Docker Engine 27.x + Docker Compose v2.29+** |

### 2.2 Workstation vs. Target Host Inspection

During local pre-flight auditing (workstation: Darwin arm64), all code artifacts and test suites achieved 100% pass. The target production server must be booted with native Linux Docker binaries following the provisioning steps below.

---

## 3. Server Provisioning & OS Hardening

Execute these steps on the newly provisioned Ubuntu VPS instance:

### Step 3.1: System Updates & Base Tooling Installation

```bash
# 1. Update package indices and upgrade existing packages
sudo apt update && sudo apt upgrade -y

# 2. Install essential system utilities and security tooling
sudo apt install -y \
  curl \
  wget \
  git \
  ufw \
  fail2ban \
  htop \
  unzip \
  ca-certificates \
  gnupg \
  lsb-release \
  openssl
```

### Step 3.2: Non-Root Deployment User Setup

```bash
# 1. Create dedicated system user for IMF-DOS management
sudo adduser --gecos "" imfapp
sudo usermod -aG sudo imfapp

# 2. Authorize deployment SSH key
sudo mkdir -p /home/imfapp/.ssh
sudo cp /root/.ssh/authorized_keys /home/imfapp/.ssh/
sudo chown -R imfapp:imfapp /home/imfapp/.ssh
sudo chmod 700 /home/imfapp/.ssh
sudo chmod 600 /home/imfapp/.ssh/authorized_keys
```

### Step 3.3: SSH Hardening

Edit `/etc/ssh/sshd_config.d/50-imf-hardening.conf`:

```ini
# SSH Hardening Configuration for IMF-DOS Production Host
PermitRootLogin no
PasswordAuthentication no
ChallengeResponseAuthentication no
MaxAuthTries 4
PubkeyAuthentication yes
X11Forwarding no
AllowUsers imfapp
```

Restart the SSH daemon:
```bash
sudo sshd -t && sudo systemctl restart ssh
```

### Step 3.4: Firewall Configuration (UFW)

```bash
# 1. Set default policies
sudo ufw default deny incoming
sudo ufw default allow outgoing

# 2. Allow only required public ingress ports
sudo ufw allow 22/tcp comment 'SSH Management'
sudo ufw allow 80/tcp comment 'HTTP ACME & Web Ingress'
sudo ufw allow 443/tcp comment 'HTTPS Encrypted Ingress'

# 3. Explicitly verify internal database/cache ports are NOT allowed
# (PostgreSQL 5432 and Redis 6379 are blocked by default deny)

# 4. Enable firewall
sudo ufw --force enable
sudo ufw status verbose
```

### Step 3.5: Docker Engine & Compose Installation

```bash
# 1. Add official Docker GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# 2. Add Docker APT repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 3. Install Docker Engine and Docker Compose Plugin
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 4. Add imfapp user to docker group
sudo usermod -aG docker imfapp
sudo systemctl enable docker
sudo systemctl start docker
```

---

## 4. Environment Variables & Secret Configuration

On the VPS, create the deployment directory `/var/www/imf-dos` and configure `.env.production`.

```bash
sudo mkdir -p /var/www/imf-dos
sudo chown -R imfapp:imfapp /var/www/imf-dos
cd /var/www/imf-dos
```

### 4.1 Production Environment File (`/var/www/imf-dos/.env.production`)

> [!CAUTION]
> Generate unique 256-bit cryptographic secrets for production. Never commit `.env.production` to Git.

```bash
# ==============================================================================
# IMF-DOS PRODUCTION ENVIRONMENT VARIABLES (.env.production)
# ==============================================================================

# Core System
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_SITE_URL=https://imammission.org
NEXT_PUBLIC_APP_URL=https://imammission.org

# Database Configuration (PostgreSQL 16)
DB_USER=imf_admin
DB_PASSWORD=<GENERATE_STRONG_RANDOM_PASSWORD_64_CHARS>
DB_NAME=imf_production
DATABASE_URL="postgresql://imf_admin:<DB_PASSWORD>@postgres:5432/imf_production?schema=public"

# Cache & Message Broker (Redis 7)
REDIS_URL="redis://redis:6379"

# Security & Cryptographic Secrets (Generate via: openssl rand -hex 32)
JWT_SECRET=<GENERATE_64_CHAR_HEX_SECRET>
SESSION_COOKIE_NAME="imf_dos_prod_session"
ENCRYPTION_KEY_PII=<GENERATE_64_CHAR_HEX_KEY>
QR_HMAC_SECRET=<GENERATE_64_CHAR_HEX_KEY>
RECEIPT_SIGNING_SECRET=<GENERATE_64_CHAR_HEX_KEY>
BACKUP_ENCRYPTION_KEY=<GENERATE_64_CHAR_HEX_KEY>

# Storage Configuration
STORAGE_DRIVER=local
STORAGE_LOCAL_DIR=/app/uploads
BACKUP_STORAGE_DIR=/app/backups

# Payment Safety (MOCK disabled in production; LIVE disabled until merchant onboarding)
USE_MOCK_PAYMENTS=false
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Compliance Central Defaults (All tax-exemption claims strictly NOT_VERIFIED)
COMPLIANCE_80G_STATUS=NOT_VERIFIED
COMPLIANCE_12AB_STATUS=NOT_VERIFIED
COMPLIANCE_FCRA_STATUS=NOT_VERIFIED
COMPLIANCE_CSR_STATUS=NOT_VERIFIED
COMPLIANCE_DARPAN_STATUS=NOT_VERIFIED

# Email & Multi-Channel Communications
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=
SMTP_FROM_EMAIL=contact@imammission.org
WHATSAPP_API_KEY=
```

Secure the permissions on the environment file:
```bash
chmod 600 /var/www/imf-dos/.env.production
```

---

## 5. Docker Stack Architecture & Launch

The production container stack is orchestrated using [`docker-compose.production.yml`](file:///Users/shahanwazali/Projects/imam-e-mahdi/docker-compose.production.yml):

### 5.1 Service Inventory

| Service | Container Name | Image / Build Target | Internal Port | Exposed Host Port | Health Check Probe |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`nginx`** | `imf-prod-nginx` | `nginx:alpine` | `80`, `443` | `80:80`, `443:443` | `nginx -t` (every 30s) |
| **`app`** | `imf-prod-app` | Custom (`Dockerfile` Stage 3, UID 1001) | `3000` | *None* | `wget http://localhost:3000/api/health` |
| **`postgres`** | `imf-prod-postgres`| `postgres:16-alpine` | `5432` | *None* | `pg_isready -U imf_admin -d imf_production` |
| **`redis`** | `imf-prod-redis` | `redis:7-alpine` | `6379` | *None* | `redis-cli ping` |

### 5.2 Launch Commands

```bash
cd /var/www/imf-dos

# 1. Pull base images and build Next.js standalone container
docker compose -f docker-compose.production.yml build

# 2. Launch container stack in detached background mode
docker compose -f docker-compose.production.yml --env-file .env.production up -d

# 3. Verify container health status
docker compose -f docker-compose.production.yml ps
```

---

## 6. Database Migration & Schema Application

> [!IMPORTANT]
> **DATABASE SAFETY MANDATE:**  
> Never use `prisma migrate reset` in production. Always determine if data exists before running migrations.

```bash
# 1. Execute safe non-destructive migration deployment
docker compose -f docker-compose.production.yml exec app npx prisma migrate deploy

# 2. If initial database has no migration table, push schema safely:
# docker compose -f docker-compose.production.yml exec app npx prisma db push --skip-generate

# 3. Seed default compliance and administrative roles (non-destructive):
# docker compose -f docker-compose.production.yml exec app npx prisma db seed
```

---

## 7. SSL/TLS Certificate Provisioning (Let's Encrypt / Certbot)

```bash
# 1. Obtain certificates for all subdomains using Certbot standalone/webroot mode
sudo certbot certonly --webroot \
  -w /var/www/certbot \
  -d imammission.org \
  -d www.imammission.org \
  -d api.imammission.org \
  -d admin.imammission.org \
  --email tech@imammission.org \
  --agree-tos \
  --no-eff-email

# 2. Reload NGINX to apply newly generated certificates
docker compose -f docker-compose.production.yml exec nginx nginx -s reload
```

---

## 8. Backup & Disaster Recovery Setup

### 8.1 Automated Backup Crontab

Configure host cron to take daily encrypted snapshots at 02:00 UTC:

```bash
sudo crontab -u imfapp -e
```

Add the following entry:
```cron
# IMF-DOS Daily Encrypted Backup at 02:00 UTC
0 2 * * * cd /var/www/imf-dos && docker compose -f docker-compose.production.yml exec -T app npx tsx scripts/backup-cli.ts backup >> /var/log/imf-backup.log 2>&1
```

### 8.2 Manual Backup & Restore Verification

```bash
# Create an immediate manual backup:
docker compose -f docker-compose.production.yml exec app npx tsx scripts/backup-cli.ts backup

# Execute a Disaster Recovery restore drill:
docker compose -f docker-compose.production.yml exec app npx tsx scripts/backup-cli.ts drill
```

---

## 9. Verification & Smoke Test Checklist

Execute these verification checks immediately following deployment:

| Check | Command | Expected Output |
| :--- | :--- | :--- |
| **Container Status** | `docker compose -f docker-compose.production.yml ps` | All 4 containers `healthy` / `running` |
| **Port Exposure** | `sudo lsof -i -P -n \| grep LISTEN` | Only `sshd (22)`, `docker-proxy (80, 443)` |
| **PostgreSQL Isolation** | `nc -zv 127.0.0.1 5432` | Connection refused on host interface |
| **Redis Isolation** | `nc -zv 127.0.0.1 6379` | Connection refused on host interface |
| **Health API** | `curl -s http://localhost:3000/api/health` | `{"status":"UP","components":{...}}` |
| **NGINX Config Test** | `docker compose exec nginx nginx -t` | `syntax is ok / test is successful` |
| **Public Landing** | `curl -I https://imammission.org` | `HTTP/2 200` |
| **Admin Subdomain** | `curl -I https://admin.imammission.org` | `HTTP/2 200` |

---

## 10. Rollback & Emergency Runbook

In the event of a deployment regression or critical runtime incident:

```bash
cd /var/www/imf-dos

# 1. Stop the current container stack
docker compose -f docker-compose.production.yml down

# 2. Revert to previous Git release tag
git checkout <PREVIOUS_STABLE_RELEASE_TAG>

# 3. Restore database snapshot if schema was altered
docker compose -f docker-compose.production.yml exec -T app npx tsx scripts/backup-cli.ts restore <PATH_TO_BACKUP_ARCHIVE>

# 4. Rebuild and restart containers
docker compose -f docker-compose.production.yml build
docker compose -f docker-compose.production.yml --env-file .env.production up -d

# 5. Verify system recovery via health probe
curl -s http://localhost:3000/api/health
```

---

## 11. Security Audit Sign-Off

```
========================================================================================
  IMAM E MAHDI FOUNDATION DIGITAL OPERATING SYSTEM (IMF-DOS)
  PRODUCTION VPS PROVISIONING & CONTAINER DEPLOYMENT RUNBOOK
========================================================================================
  OS Hardening:         UFW Firewall Active, SSH Password Auth Disabled, Non-Root Runner
  Network Isolation:    PostgreSQL (5432) & Redis (6379) Confined to Private Docker Network
  Data Vault:           AES-256-GCM Envelope Encryption on Persistent Uploads & Backups
  Payment Safety:       Live Gateways Blocked, Mock Gateways Disabled in Production Mode
  Compliance Guard:     80G, 12AB, FCRA, CSR-1 Defaulted to NOT_VERIFIED
========================================================================================
```
