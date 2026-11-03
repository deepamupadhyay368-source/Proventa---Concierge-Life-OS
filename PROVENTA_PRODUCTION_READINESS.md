# PROVENTA Family Wealth OS — Production Readiness Assessment

**Audit Date:** 2026-11-02  
**Target Commit:** `08f412c`  
**Overall Readiness Verdict:** **NOT PRODUCTION READY (BLOCKED)**  
**Auditor Role:** Senior FinTech Systems Architect & Site Reliability Engineer (SRE)

---

## 1. Production Readiness Scorecard

| Assessment Domain | Status | Score (1-10) | Blocker Issues |
| :--- | :---: | :---: | :--- |
| **Authentication & IAM** | `BLOCKED` | 6/10 | In-memory rate limiting, hardcoded secret fallback, missing re-auth on recovery |
| **Multi-Tenant Security** | `BLOCKED` | 4/10 | BOLA vulnerability on all `fam_...` family workspaces, unauthenticated DELETE APIs |
| **Database & Persistence** | `BLOCKED` | 5/10 | Family workspaces and members stored in memory only; `CustomerPreference` JSON blob concurrency issues |
| **Financial Computation** | `WARNING` | 7/10 | Amortisation final-month interest distortion, Buy-vs-Rent deficit suppression |
| **Document Vault** | `WARNING` | 5/10 | Metadata-only records, missing magic byte inspection, lack of presigned URL access controls |
| **Regulatory & Compliance** | `WARNING` | 6/10 | "Optimal Strategy" / "Recommendation" phrasing under SEBI (Investment Advisers) Regulations, 2013 |
| **Infrastructure & Logging** | `READY` | 8/10 | Structured Pino logging, Next.js 16 build passing across 163 routes, strict HTTP security headers |

---

## 2. Deep-Dive Architectural Blockers

### BLOCKER 1: Ephemeral In-Memory Family Workspaces
- **Severity:** `CRITICAL`
- **Location:** `src/lib/wealth/service.ts` (Lines 432–468, `createFamilyWorkspace`, `inviteFamilyMember`)
- **Impact:**
  When a user creates a multi-member family workspace (`POST /api/wealth/workspaces`), the workspace and membership records are saved exclusively to `globalThis.__proventaWealthStore` (a JavaScript in-memory `Map`).
  In a serverless production environment:
  1. Serverless lambda functions are ephemeral.
  2. The next request to `/dashboard` or `/family` handled by a new instance will find `store.workspaces` empty.
  3. All family workspaces, invitations, and member role mappings disappear completely upon serverless container recycling.
- **Production Requirement:** Create first-class Prisma models (`FamilyWorkspace`, `FamilyMember`, `FamilyInvitation`) in PostgreSQL with ACID transactional consistency.

---

### BLOCKER 2: Race Conditions & Overwrites in `CustomerPreference` JSON Storage
- **Severity:** `HIGH`
- **Location:** `src/lib/wealth/persistence.ts` (Lines 64–154)
- **Impact:**
  All assets for a workspace are stored as a single JSON array inside a `CustomerPreference` row:
  ```typescript
  await db.customerPreference.upsert({
    where: { customerId_category_key: { customerId, category: 'wealth_assets', key: workspaceId } },
    update: { value: assets as unknown as Prisma.InputJsonValue },
  });
  ```
  - **No Optimistic Locking:** If two family members (or two browser tabs of the same user) make concurrent updates (e.g. updating a valuation and adding a new asset simultaneously), the second write overwrites the entire JSON array, causing **data loss**.
  - **No Database Indexing:** As a portfolio scales to hundreds of holdings, transactions, and documents, PostgreSQL cannot index individual JSON objects inside the array. Every read requires deserializing the entire document into memory.
- **Production Requirement:** Migrate from JSON blob storage to dedicated relational tables (`wealth_assets`, `wealth_liabilities`, `wealth_transactions`) with foreign key constraints and row-level indexing.

---

### BLOCKER 3: Broken Object-Level Authorization (BOLA) in Family Workspaces
- **Severity:** `CRITICAL`
- **Location:** All routes in `src/app/api/wealth/*`
- **Impact:**
  As detailed in `PROVENTA_SECURITY_AUDIT.md`, API routes only verify personal workspaces (`ind_${userId}`). Any authenticated user can access any family workspace (`fam_...`) without being verified as an owner or member.
- **Production Requirement:** Centralized workspace authorization middleware applied uniformly across all `/api/wealth/*` routes.

---

### BLOCKER 4: Hardcoded Fallback JWT Secret in NextAuth
- **Severity:** `CRITICAL`
- **Location:** `src/lib/auth/config.ts` (Lines 672–676)
- **Impact:**
  A default fallback string is used when environment variables are omitted, opening the door to forged authentication tokens.
- **Production Requirement:** Strict environment variable assertion during application boot.

---

## 3. Regulatory Assessment (SEBI & RBI Compliance)

1. **SEBI (Investment Advisers) Regulations, 2013:**
   - **Finding:** In `src/app/(customer)/decision-lab/page.tsx`, outputs are titled:
     - `"Optimal Strategy: Invest Capital in Equity Index SIP"`
     - `"Recommendation: Acquire Property (Buy)"`
   - **Regulatory Risk:** SEBI has issued stern enforcement orders against automated platforms providing prescriptive "Strategies" or "Recommendations" regarding securities without SEBI RIA registration. Disclaimers do not grant exemption if the product language provides explicit actionable investment directions.
   - **Remediation:** Refactor all labels to neutral, comparative mathematical modeling:
     - Change "Optimal Strategy" to `"Comparative Yield Analysis"`.
     - Change "Recommendation" to `"Hypothetical Capital Advantage"`.

2. **DPDP Act, 2023 (Digital Personal Data Protection Act):**
   - **Finding:** While policy acceptance is logged in `db.policyAcceptance`, wealth records stored inside `CustomerPreference` lack an automated GDPR/DPDP-compliant deletion mechanism (`Right to Erasure`). Deleting a user does not automatically purge nested JSON entries if references are unlinked.
   - **Remediation:** Ensure cascade deletion triggers properly purge all user-scoped preferences across all wealth categories.

---

## 4. Go-Live Gate Summary

| Gate Requirement | Status | Current Reality |
| :--- | :---: | :--- |
| **No Demo Data in Production** | `PASSED` | Production stores start empty; demo fixtures restricted to `NODE_ENV === 'test'`. |
| **Deterministic Paise Precision** | `PASSED` | All currency math handles integer paise without IEEE 754 drift. |
| **Workspace BOLA Defense** | **`FAILED`** | Family workspaces (`fam_...`) accessible by any authenticated user. |
| **Persistent Family State** | **`FAILED`** | Family workspaces and members stored in memory; lost on restart. |
| **Distributed Rate Limiting** | **`FAILED`** | Brute-force rate limiting fails across serverless containers. |
| **Unauthenticated Deletion Defense** | **`FAILED`** | Asset/Liability `DELETE` APIs do not enforce session ownership. |
| **SEBI-Safe Terminology** | **`FAILED`** | Explicit "Optimal Strategy" recommendations present in Decision Lab. |
