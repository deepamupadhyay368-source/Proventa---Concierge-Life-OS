# PROVENTA — FINAL PRODUCTION RELEASE READINESS REPORT

**Platform:** PROVENTA — Construction Procurement & Intelligence (`https://proventa.in`)  
**Release Candidate Branch & Commit:** `preview/construction-procurement-intelligence` @ `1ae4478620468e900ebe9d316b1039d3aa7934c8` (`1ae4478`)  
**Current Deployed Production Baseline (`origin/main`):** `e6911b9a176724e427c3fd742714b567d24ebbd0` (`e6911b9`)  
**Local `main`:** `82ffb2cf9938b7ba0a0c295650dd5fe3714d937e` (`82ffb2c`)  
**Preflight Date:** November 27, 2026  
**Overall Release Readiness:** **CONDITIONAL — 1 PRODUCTION ENV BLOCKER MUST BE RESOLVED BEFORE DEPLOY**

---

## 1. Requirement-by-Requirement Readiness Scorecard

| # | Requirement | Classification | Evidence & Findings |
| :--- | :--- | :---: | :--- |
| **1.1** | Production `DATABASE_URL` points to `neon-aqua-coin` | **FAIL (BLOCKER)** | `vercel env ls` shows `DATABASE_URL` (`Secret`) is currently assigned **exclusively to `Preview`** — **NO `DATABASE_URL` is assigned to `Production`**. Because `prisma/schema.prisma` and `src/lib/db.ts` consume `DATABASE_URL` exclusively, deploying to Production before adding a Production-scoped `DATABASE_URL` pointing to `neon-aqua-coin` would break DB-backed routes on `proventa.in`. |
| **1.2** | Production `DIRECT_URL` points to `neon-aqua-coin` | **PASS** | `DIRECT_URL` (`Config`, created 71d ago) is assigned to `Production, Preview, Development` and points to `neon-aqua-coin` (`ep-gentle-bu***`). *(Optional hygiene: uncheck `Preview` on legacy `DIRECT_URL` after release.)* |
| **1.3** | Preview `DATABASE_URL` connected to independent staging | **PASS** | Preview `DATABASE_URL` (`Secret`) and all 18 `PROVENTA_STAGING_*` variables are scoped exclusively to `Preview` and connected to `proventa-staging` (`hidden-butterfly-95638901`, `c-5.ap-southeast-1.aws.neon.tech`). |
| **1.4** | Zero staging credentials assigned to Production | **PASS** | All 18 `PROVENTA_STAGING_*` variables are scoped strictly to `Preview` (0 assigned to `Production`). |
| **2.1** | Production Neon backup & PITR restore point verified | **PASS** | `neon-aqua-coin` (`billowing-shadow-72487821`, `main` branch `br-rapid-river-b3llewvs`, `48.8 MB`, `PostgreSQL 18`) has **6-hour continuous PITR** (`history_retention_seconds: 21600`) and supports instant copy-on-write snapshot branching prior to migration. |
| **3.1** | All 7 Prisma migrations audited for zero destructive SQL | **PASS** | Automated scan across all 7 `prisma/migrations/*/migration.sql` files confirmed **0** `DROP TABLE`, `DROP COLUMN`, `TRUNCATE`, or `DELETE FROM` statements. |
| **3.2** | `20261116000000_baseline_profiles_and_valuation_tables` safe on existing Production | **PASS** | Uses exception-guarded `DO $$ BEGIN CREATE TYPE ... EXCEPTION WHEN duplicate_object THEN null; END $$;` for all 89 enums and `CREATE TABLE IF NOT EXISTS` for `buyer_profiles`, `supplier_profiles`, `ValuationRequest`, `ValuationPayment`, `ValuationRefund`. 100% safe no-op on existing Production tables; zero customer data overwritten. |
| **3.3** | Real-estate backward compatibility preserved | **PASS** | All existing real-estate valuation tables, auth tables, and Phase 6.8.5 refund row-lock/fencing protections remain intact (9/9 Phase 6.8.5 tests + live PG 18.7 `SELECT ... FOR UPDATE` test passed). |
| **4.1** | Build, TypeScript, Unit & Live PG 18.7 Staging Tests | **PASS** | `prisma validate` PASS, `tsc --noEmit` PASS (0 errors), `npm run build` PASS (293/293 routes), Unit/Procurement suites `101/101` PASS, Live `proventa-staging` PG 18.7 suite `4/4` PASS. |
| **4.2** | Preview Deployment Verification | **PASS** | `https://proventa-gp60ptcro-deepamupadhyay368-9678s-projects.vercel.app` (`READY`, `HOME:200`, unauthenticated `/api/procurement/intelligence/leakage` → `401`, `/api/procurement/pilot/pacifica` → `401`). |

---

## 2. Production Backup & Recovery Procedure (`neon-aqua-coin`)

Before executing any production migration, create an instant Neon restore-point branch on `neon-aqua-coin` (`billowing-shadow-72487821`):

```powershell
# 1. Create instant pre-release snapshot branch on Production Neon (zero downtime)
npx neonctl branches create `
  --project-id billowing-shadow-72487821 `
  --org-id org-blue-cake-22739884 `
  --parent main `
  --name backup-pre-release-20261127
```

- **Built-in PITR Window:** 6 hours (`21,600` seconds) continuous history retention on `br-rapid-river-b3llewvs`.
- **Logical Dump Backup (Optional Secondary):** `scripts/db-backup.sh` (`pg_dump --format=custom`) stored offline.

---

## 3. Exact Production Migration & Deployment Sequence (Execute ONLY After Explicit Approval)

1. **Step 1 — Resolve Blocker 1.1 (Production `DATABASE_URL`):**
   - Retrieve `neon-aqua-coin`'s pooled connection string via `neonctl` (piped via stdin — never printed) and add it to Vercel strictly for the **`production`** scope (`npx vercel env add DATABASE_URL production --sensitive`), leaving `preview` (`proventa-staging`) completely untouched.
2. **Step 2 — Create Neon Pre-Release Backup Branch:**
   - Run `npx neonctl branches create --project-id billowing-shadow-72487821 --org-id org-blue-cake-22739884 --parent main --name backup-pre-release-20261127` and confirm `current_state: ready`.
3. **Step 3 — Run Production Migrations (`prisma migrate deploy` — NEVER `db push`):**
   - Run `npx prisma migrate deploy` using `neon-aqua-coin`'s direct unpooled URL.
   - Verify `20261127000000_phase685_payment_fencing_refund_unique` PL/pgSQL duplicate preflight passes and `20261127140000_construction_procurement_intelligence` creates all 22 new tables cleanly.
   - Verify `npx prisma migrate status` reports `Database schema is up to date!`.
4. **Step 4 — Merge & Push Release Commit to `main`:**
   - Merge `preview/construction-procurement-intelligence` (`1ae4478`) into `main` (fast-forward) and push `origin/main` (170 files changed vs `e6911b9`).
5. **Step 5 — Deploy to Production (`https://proventa.in`):**
   - Run `npx vercel deploy --prod` (or allow Vercel Git integration on `main`).
6. **Step 6 — Production Smoke-Test Plan (Read-Only):**
   - `GET https://proventa.in/` → HTTP 200 (Construction Procurement homepage, industrial corporate palette)
   - `GET https://proventa.in/api/health` → HTTP 200 (DB healthy)
   - `GET https://proventa.in/api/procurement/intelligence/leakage` (unauthenticated) → HTTP 401 (`UNAUTHORIZED`)
   - `GET https://proventa.in/buyer/dashboard` → loads auth/workspace cleanly
   - `GET https://proventa.in/price` → legacy real-estate route still accessible and unaffected

---

## 4. Rollback Strategy
- **Application Rollback (< 30 seconds):** `npx vercel rollback` to previous Production deployment (`e6911b9`).
- **Database Rollback:** All new migrations are 100% additive; rolling back the application code requires zero destructive database rollback. In a catastrophic scenario, restore `neon-aqua-coin` `main` from `backup-pre-release-20261127` or Neon 6-hour PITR.

---

## 5. Absolute Restrictions Compliance Confirmation
- Production database (`neon-aqua-coin`) connections for writes: **0**
- Production migrations executed: **0**
- Production environment variables modified: **0**
- Production deployments triggered: **0**
- Pushes to `origin/main`: **0**
- External messages to Pacifica or suppliers: **0**

**Preflight complete. Stopped awaiting your explicit production deployment approval.**
