# PROVENTA — SECURITY & FINANCIAL INTEGRITY REPORT

**Platform:** PROVENTA — Construction Procurement & Intelligence Platform  
**Date:** November 27, 2026  

---

## 1. Threat Model & Mandatory Security Controls

| Threat Scenario | Control Implemented | Verification Status |
| :--- | :--- | :--- |
| **1. Buyer A reads Buyer B's RFQs / Projects / POs** | Server-side `getSession()` + `getUserAuthorizedBusinesses()` + `assertOrganisationIsolation()` on all `/api/procurement/*` routes. | **Verified (Unit + Route Code)** |
| **2. Supplier A reads Supplier B's quotations** | `hasProcurementPermission(['SUPPLIER_OWNER'], 'quotation:read_buyer') === false`; supplier routes scoped via `resolveSupplierContext()`. | **Verified (Unit + Route Code)** |
| **3. Unauthenticated user executes Purchase Award** | **Fixed in this phase:** Added mandatory `401 UNAUTHORIZED` guard to `src/app/api/procurement/quotations/[id]/select/route.ts`. | **Verified (Code + Tests)** |
| **4. RFQ Creator self-approves high-value award** | `evaluateSeparationOfDuties()` enforces dual-control threshold (default ₹50,000); blocks creator self-approval with `403 SEPARATION_OF_DUTIES`. | **Verified (Unit Test)** |
| **5. Concurrent / Duplicate Awards** | `executeProtectedAward()` acquires PostgreSQL `SELECT ... FOR UPDATE` on `procurement_rfqs`, enforces `@unique` on `rfqId` & `idempotencyKey`, returns `409 ALREADY_AWARDED`. | **Verified (Mocked) / Pending Live Staging PostgreSQL** |
| **6. Award of Expired Quotation** | `executeProtectedAward()` validates `validUntil >= now`, rejecting expired quotes with `409 QUOTATION_EXPIRED`. | **Verified (Unit Test)** |
| **7. Floating-Point Financial Ledger Drift** | All new financial calculations (`money.ts`, `comparison-engine.ts`, `savings-intelligence.ts`, `fulfilment-engine.ts`) use `BigInt` integer paise. | **Verified (Unit Test)** |
| **8. Fabricated Realised Savings Claims** | `computeProcurementSavings()` throws `SAVINGS_INTEGRITY_ERROR` if `REALISED` lacks an approved `purchaseOrderId` or `goodsReceiptId`/`invoiceNumber`. | **Verified (Unit Test)** |
| **9. Silent Alteration of Dispute History** | `ProcurementDispute` uses `appendDisputeAuditEntry()` append-only immutable audit log in `PATCH /api/procurement/disputes`. | **Verified (Unit Test)** |
| **10. Webhook Replay & Over-Refund Attacks** | Preserved Phase 6.8.5 `SELECT ... FOR UPDATE` row-locking, `P2002` idempotency, and `HTTP 422` over-refund quarantine intact. | **Verified (9/9 Phase 6.8.5 Tests Passing)** |

---

## 2. Infrastructure Safety Gate Compliance

- **Production Neon Database:** **0 connections, 0 migrations, 0 writes.**
- **Vercel Production Environment:** **0 modifications, 0 deployments.**
- **Git History:** **0 pushes, 0 destructive operations.**
- **Active Blocker:** Vercel `vercel env ls` revealed that `DATABASE_URL` is currently scoped to `Preview` only (and marked `Secret`), while `PROVENTA_STAGING_*` variables are also `Secret`. Operator confirmation of Production `DATABASE_URL` and provisioning of a local gitignored staging connection string (`.env.preview.local`) are required before running Phase 6.8.7A/B live PostgreSQL concurrency verification.
