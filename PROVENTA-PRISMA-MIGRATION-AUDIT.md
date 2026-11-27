# PROVENTA — PHASE 3B: PRISMA SCHEMA & MIGRATION AUDIT REPORT

**Date:** November 27, 2026  
**Prisma Version:** `5.22.0` (`package.json`: `^5.17.0`)  
**Target Engine:** PostgreSQL 16 (Neon `proventa-staging`)  
**Migration Prepared (NOT YET APPLIED):** `prisma/migrations/20261127140000_construction_procurement_intelligence/migration.sql`

---

## 1. Migration Inventory (6 Total)

| # | Migration Directory | Scope | Destructive Ops? |
| :--- | :--- | :--- | :--- |
| 1 | `20260916000000_init` | Core auth, users, concierge, base tables | None |
| 2 | `20260920044746_phase8_concierge_performance_indexes` | Performance indexes | None |
| 3 | `20261026000000_universal_business_platform` | Business, BuyerProfile, SupplierProfile | None |
| 4 | `20261117000000_proventa2_procurement_payment_intelligence` | ProcurementRfq, Quotation, Order, Invoices | None |
| 5 | `20261127000000_phase685_payment_fencing_refund_unique` | `processingLockToken`, `ValuationRefund_refundReference_key` + preflight duplicate guard | None |
| 6 | `20261127140000_construction_procurement_intelligence` | 13 procurement tables + 9 intelligence tables + 15 enums | **None (100% additive)** |

---

## 2. Audit of All 9 New Intelligence Models & 13 Procurement Models

| Audit Criterion | Result | Evidence |
| :--- | :--- | :--- |
| **Tenant / Organisation Ownership** | **PASS** | Every tenant-owned table (`construction_projects`, `procurement_requirements`, `procurement_approval_records`, `procurement_awards`, `procurement_deliveries`, `goods_receipts`, `three_way_match_records`, `procurement_disputes`, `procurement_savings_records`, `procurement_leakage_alerts`, `project_milestones`, `project_inventory_records`, `consolidation_opportunities`, `procurement_automation_executions`) carries indexed `organisationId`. |
| **Unique Constraints & Idempotency** | **PASS** | `procurement_awards` enforces unique `rfqId`, `purchaseOrderId`, and `idempotencyKey`; `procurement_automation_executions` enforces unique `idempotencyKey`; `three_way_match_records` enforces unique `(organisationId, purchaseOrderId, invoiceNumber)`; `project_inventory_records` enforces unique `(organisationId, projectId, materialCategorySlug, materialName)`. |
| **Financial Precision (BigInt Paise)** | **PASS** | All monetary columns (`approvedBudgetPaise`, `materialBudgetPaise`, `awardedAmountPaise`, `poTotalPaise`, `grnValuePaise`, `invoiceTotalPaise`, `variancePaise`, `potentialExposurePaise`, `confirmedLeakagePaise`, `recoveredSavingsPaise`, `landedPriceUnitPaise`, `savingsTotalPaise`) use PostgreSQL `BIGINT` (integer paise — zero floating-point ledger drift). |
| **Referential Integrity & Deletion Safety** | **PASS** | Foreign keys use `ON DELETE RESTRICT` for financial/operational parents (`procurement_requirements.projectId`, `goods_receipts.deliveryId`, `material_products.categoryId`) and `ON DELETE SET NULL` for optional links; `ConstructionProject` and `ProcurementRequirement` support soft deletion via `deletedAt`. |
| **Auditability** | **PASS** | `procurement_awards` stores `immutableSnapshotJson`; `procurement_disputes` stores `immutableHistoryJson`; `procurement_leakage_alerts` and `procurement_automation_executions` store `auditTrailJson`. |
| **Destructive Statement Scan** | **PASS** | Zero `DROP TABLE`, zero `DROP COLUMN`, zero `TRUNCATE`, zero `ALTER COLUMN TYPE`. All DDL statements use `CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`, and exception-guarded `CREATE TYPE`. |
| **Schema Validation** | **PASS** | `npx prisma validate` passed with 0 errors; `npx prisma generate` succeeded. |

---

## 3. Staging Application Gate
Migration `20261127140000_construction_procurement_intelligence` is **APPROVED FOR STAGING ONLY** via `npx prisma migrate deploy` once `.env.staging.local` is populated and Phase A isolation is proven. Do **NOT** use `prisma db push`.
