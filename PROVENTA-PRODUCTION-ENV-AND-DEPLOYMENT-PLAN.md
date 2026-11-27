# PROVENTA — PRODUCTION ENVIRONMENT AUDIT & RELEASE PLAN (DRAFT — DO NOT EXECUTE BEFORE STAGING CERTIFICATION)

**Platform:** PROVENTA — Construction Procurement & Intelligence (`https://proventa.in`)  
**Date:** November 27, 2026  
**Status:** **HOLD — STAGING CERTIFICATION REQUIRED BEFORE PRODUCTION DEPLOYMENT**

---

## 1. Read-Only Production Database Dependency Audit
- **Application Code (`src/lib/db.ts` & `prisma/schema.prisma`):** Depends **exclusively** on `process.env.DATABASE_URL`. `DIRECT_URL` is checked only as a status indicator in `src/app/admin/system/page.tsx` and is not declared in `prisma/schema.prisma`.
- **Missing Production Configuration Finding (Reported Separately):**
  - `vercel env ls` showed only one `DATABASE_URL` entry, currently scoped exclusively to **`Preview`** (created 71d ago).
  - Meanwhile, `PROVENTA_DATABASE_DATABASE_URL` and `DIRECT_URL` (created 71d ago) remain assigned to `Production, Preview, Development`.
  - **Required Operator Verification before any Production deploy:** Confirm in Vercel Dashboard → Settings → Environment Variables that `Production` has a dedicated `DATABASE_URL` pointing to `neon-aqua-coin` (production Neon), completely separate from Preview's `proventa-staging`.

## 2. Production Backup & Migration Strategy
1. Take a Neon point-in-time snapshot/branch backup of `neon-aqua-coin` before running any migration.
2. Apply only reviewed, additive migrations via `npx prisma migrate deploy` (never `prisma db push`):
   - `20261127000000_phase685_payment_fencing_refund_unique` (includes PL/pgSQL preflight duplicate guard)
   - `20261127140000_construction_procurement_intelligence` (100% additive: `CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`, zero `DROP`/`ALTER` on existing tables).
3. **Backward Compatibility:** All existing real estate valuation tables, auth tables, and procurement tables remain untouched and fully backward-compatible.

## 3. Rollback & Smoke-Test Procedure
- **Application Rollback:** Instant Vercel rollback to baseline commit `e6911b9` if any smoke test fails.
- **Schema Rollback:** Because both pending migrations are strictly additive, rolling back the application code requires zero destructive schema rollback; if desired, unused additive tables can be dropped only after verifying zero rows written.
- **Production Smoke Tests (Post-Approval Only):** Verify `/`, `/pilot/pacifica`, `/buyer/dashboard` (401 redirect/guard), `/api/procurement/intelligence/leakage` (401 unauthenticated), and `/api/health`.
