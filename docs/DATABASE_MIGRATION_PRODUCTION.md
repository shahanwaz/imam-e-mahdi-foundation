# Production Database Migration & Baseline Guide
## Imam E Mahdi Foundation Digital Operating System (IMF-DOS)

**Document Version:** 2.0.0  
**Status:** Approved Production Standard  
**Database Engine:** PostgreSQL 16+  
**ORM:** Prisma 6.x  

---

## 1. Overview & Policy

Production environments must **NEVER** use `prisma db push` or destructive migration commands like `prisma migrate reset`. All database changes must follow a strictly ordered, auditable sequential migration pipeline using Prisma Migrate.

The baseline migration:
- Path: `prisma/migrations/20260921000000_init_baseline/migration.sql`
- Contains the complete definitions for all 88 domain models, enum types, relational foreign keys, indexes, and unique constraints.

---

## 2. Standard Deployment Procedures

### 2.1 Fresh Production Database Initialization
When initializing a brand new PostgreSQL database instance in production:

```bash
# 1. Apply all pending migrations sequentially
npx prisma migrate deploy

# 2. Seed system roles, permissions, and statutory initializers
npm run prisma:seed
```

### 2.2 Existing Staging / Pre-Populated Database Baseline
If the database was previously synchronized via `prisma db push` and already contains tables and data:

```bash
# 1. Mark the baseline migration as already applied (WITHOUT executing SQL or dropping data)
npx prisma migrate resolve --applied 20260921000000_init_baseline

# 2. Verify migration status
npx prisma migrate status
```

---

## 3. Migration Safety Directives

1. **Zero Data Loss**: Migrations must only add tables, columns (with default values or nullability), or non-destructive indexes.
2. **Column Dropping / Renaming**: Any column deprecation must follow the Expand-Migrate-Contract pattern across multiple release stages.
3. **Continuous Deployment Pipeline**: CI/CD runs `npx prisma migrate deploy` prior to application startup container initialization.
