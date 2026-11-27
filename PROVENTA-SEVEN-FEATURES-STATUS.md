# PROVENTA — SEVEN CORE INTELLIGENCE FEATURES STATUS

**Date:** November 27, 2026  
**Classifications Used:** `Not started` | `In progress` | `Implemented, not verified` | `Verified in isolated staging` | `Blocked`

---

## Feature-by-Feature Status Matrix

| # | Capability | Status | Files Created / Modified | Known Limitations & Dependencies |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **Procurement Leakage Detector** | **Implemented, not verified (DB)** *(Unit-verified)* | `leakage-detector.ts`, `/api/procurement/intelligence/leakage`, `/buyer/intelligence/leakage`, Prisma `LeakageAlert` | Unit tests pass; live PostgreSQL persistence & staging concurrency await Phase 6.8.7A staging secret access. |
| **2** | **Material Price Intelligence** | **Implemented, not verified (DB)** *(Unit-verified)* | `price-intelligence.ts`, `/api/procurement/intelligence/prices`, `/buyer/intelligence/prices`, Prisma `PriceObservation` | Unit tests pass (including `INSUFFICIENT_DATA` threshold & CSV export); live DB verification pending staging gate. |
| **3** | **Procurement Timing Intelligence** | **Implemented, not verified (DB)** *(Unit-verified)* | `timing-intelligence.ts`, `/api/procurement/intelligence/timing`, `/buyer/intelligence/timing`, Prisma `ProjectMilestone`, `InventoryRecord` | Unit tests pass; live email/WhatsApp reminders require configured Resend/WhatsApp credentials. |
| **4** | **Supplier Reliability Intelligence** | **Implemented, not verified (DB)** *(Unit-verified)* | `supplier-reliability.ts`, `/api/procurement/intelligence/suppliers`, `/buyer/intelligence/suppliers`, Prisma `SupplierReliabilityConfig/Snapshot/Dispute` | Unit tests pass; automatic recalculation on live DB awaits staging migration deployment. |
| **5** | **Multi-Project Purchasing Intelligence** | **Implemented, not verified (DB)** *(Unit-verified)* | `multi-project-intelligence.ts`, `/api/procurement/intelligence/multi-project`, `/buyer/intelligence/multi-project`, Prisma `ConsolidationOpportunity` | Unit tests pass; cross-project DB joins pending staging migration. |
| **6** | **True Landed Cost Engine** | **Implemented, not verified (DB)** *(Unit-verified)* | `landed-cost-engine.ts`, `money.ts`, `comparison-engine.ts`, `/api/procurement/comparison`, `/buyer/comparison` | Anti-double-counting, version deduplication, and decision-support unit-tested; live DB concurrency pending staging gate. |
| **7** | **Procurement Autopilot** | **Implemented, not verified (DB)** *(Unit-verified)* | `autopilot-engine.ts`, `/api/procurement/intelligence/autopilot`, `/buyer/autopilot`, Prisma `AutomationExecution` | Deterministic mode fully verified; AI extraction optional when `GEMINI_API_KEY` configured; external email/WhatsApp dispatch requires provider credentials. |
| **Gate** | **Isolated Staging PostgreSQL Certification** | **Blocked** | Vercel `DATABASE_URL` & `PROVENTA_STAGING_*` are `Secret` (`[SENSITIVE]`) | Requires operator to confirm Production `DATABASE_URL` on Vercel and supply staging connection string into gitignored `.env.preview.local`. |
