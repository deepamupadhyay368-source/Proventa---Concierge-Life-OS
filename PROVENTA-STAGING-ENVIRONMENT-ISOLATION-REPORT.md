# PROVENTA — PHASE 3A: STAGING ENVIRONMENT ISOLATION REPORT

**Date:** November 27, 2026  
**Repository:** `C:\Users\Deepam\.gemini\antigravity\scratch\proventa`  
**Branch / Commit:** `main` @ `82ffb2cf9938b7ba0a0c295650dd5fe3714d937e` (with local uncommitted Phase 1–3 transformation work)  
**Gate Decision:** **STOPPED AT PHASE A — ISOLATION NOT YET PROVEN**

---

## 1. Seven-Point Staging Isolation Verification

| # | Isolation Requirement | Status | Observed Evidence (No Secrets Exposed) |
| :--- | :--- | :--- | :--- |
| 1 | Staging DB belongs to dedicated `proventa-staging` Neon project | **BLOCKED** | Vercel `PROVENTA_STAGING_*` variables are marked `Secret` (`[SENSITIVE]`) and cannot be pulled via CLI to inspect host/project identity locally. |
| 2 | Hostname & database identity correspond to staging project | **BLOCKED** | Local `.env.preview.local` contains `DATABASE_URL="[SENSITIVE]"` and `PROVENTA_STAGING_DATABASE_URL="[SENSITIVE]"`. |
| 3 | Confirmed NOT production database or production branch | **BLOCKED** | Cannot execute read-only `SELECT current_database(), inet_server_addr()` without the staging connection string. |
| 4 | Vercel Preview `DATABASE_URL` resolves to staging | **UNVERIFIED** | `vercel env ls preview` shows `DATABASE_URL` is `Secret` (`Preview`, created 71d ago — predating the `PROVENTA_STAGING_*` integration created 2h ago). |
| 5 | Any required `DIRECT_URL` resolves exclusively to staging | **FAIL** | **Critical Finding:** In `.env.preview.local` (pulled from Vercel `preview`), `DIRECT_URL` resolves to **`ep-gentle-bu***` (`matches_prod_host = True`)** — the **PRODUCTION** Neon host! |
| 6 | Local staging configuration resolves exclusively to staging | **FAIL** | `.env.preview.local` lacks a usable staging `DATABASE_URL` and currently contains the production `DIRECT_URL`. No `.env.staging.local` exists yet. |
| 7 | Prisma uses intended environment variables | **PASS** | `prisma/schema.prisma` (`url = env("DATABASE_URL")`) and `src/lib/db.ts` read exclusively `process.env.DATABASE_URL`. |

---

## 2. Exact Action Required to Unblock Phases C–F

**No Production credentials are requested or needed.** To unblock Phase 3 (Migrations, 7-Feature DB Integration, Cross-Feature Workflow, Concurrency & Browser UAT):

1. Create a gitignored file at `C:\Users\Deepam\.gemini\antigravity\scratch\proventa\.env.staging.local` (already gitignored via `.gitignore:28:.env.*.local`).
2. Paste **ONLY** the independent `proventa-staging` Neon connection string (pooled URL for `DATABASE_URL`, unpooled URL for `DIRECT_URL`):
   ```env
   DATABASE_URL="postgresql://<staging_user>:<staging_password>@<proventa-staging-pooler-host>/neondb?sslmode=require"
   DIRECT_URL="postgresql://<staging_user>:<staging_password>@<proventa-staging-unpooled-host>/neondb?sslmode=require"
   ```
3. *(Recommended for Vercel Preview hygiene)* In Vercel Dashboard → Settings → Environment Variables, ensure Preview's `DATABASE_URL` points to `proventa-staging` (not the 71-day-old secret) and remove `Preview` from the legacy production `DIRECT_URL`.

## 3. Zero-Mutation Confirmation
- Zero connections opened to Production Neon or any database.
- Zero migrations applied; zero `prisma db push` executed; zero seeds executed.
- Zero commits pushed; zero deployments triggered.
