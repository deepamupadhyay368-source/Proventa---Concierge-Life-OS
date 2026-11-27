# PROVENTA — FINANCIAL INTEGRITY REPORT

**Date:** November 27, 2026  

---

## 1. Monetary Precision & Anti-Double-Counting
- **Integer Paise Arithmetic:** All landed-cost, benchmark, leakage exposure, three-way matching, and savings calculations use `BigInt` integer paise (`src/lib/construction-procurement/money.ts` and `landed-cost-engine.ts`), eliminating floating-point rounding drift.
- **Rounding Policy:** Half-up integer rounding to the nearest 1 paise (`₹0.01`) with 3-decimal quantity scaling (`× 1000`).
- **Double-Count Prevention:** `computeTrueLandedCost()` inspects `gstIncludedInBase` and `freightIncludedInBase`, suppressing duplicate GST or freight additions and emitting explicit audit notes.
- **Quotation Version Deduplication:** `deduplicateQuotationVersions()` guarantees revised supplier quotes are never treated as separate competing offers.

## 2. Strict Financial Distinctions
- **Leakage Detector:** Separates `potentialExposurePaise`, `confirmedLeakagePaise`, and `recoveredSavingsPaise` into distinct columns and summary cards; never combines them into one misleading number.
- **Savings Intelligence:** Separates `POTENTIAL` savings from `REALISED` savings; recording `REALISED` without an approved `purchaseOrderId` AND `goodsReceiptId`/`invoiceNumber` throws `SAVINGS_INTEGRITY_ERROR`.
- **Three-Way Matching:** Reconciles `PO + GRN + Supplier Invoice` in integer paise; any quantity overbill, unit-rate mismatch, or GST variance > ₹1 automatically places payment `ON_HOLD`.

## 3. Concurrency & Transactional Safeguards
- **Protected Award Engine (`award-engine.ts`):** Uses `db.$transaction` + `SELECT ... FOR UPDATE` on `procurement_rfqs`, `@unique` constraints on `rfqId` and `idempotencyKey`, expiry checks, and separation-of-duties validation.
- **Preserved Phase 6.8.5 Controls:** Razorpay refund row-locking, `P2002` idempotency, over-refund HTTP 422 quarantine, and valuation lease fencing remain intact (9/9 tests passing).
- **Staging Certification Note:** Real PostgreSQL lock contention remains unverified live pending Phase 6.8.7A isolated staging database access.
