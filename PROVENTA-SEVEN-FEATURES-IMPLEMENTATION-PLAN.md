# PROVENTA — SEVEN CORE INTELLIGENCE FEATURES IMPLEMENTATION PLAN

**Platform:** PROVENTA — Construction Procurement & Intelligence Platform  
**Repository:** `C:\Users\Deepam\.gemini\antigravity\scratch\proventa`  
**Date:** November 27, 2026  

---

## 1. Shared Foundation & Architecture Principles
- Reuse existing Next.js 16, Prisma 5, PostgreSQL, NextAuth v5, and organisation models (`Business`, `ProcurementRfq`, `ProcurementQuotation`, `ProcurementOrder`, `CommercialInvoice`, `GoodsReceipt`).
- Extend `prisma/schema.prisma` additively with 9 intelligence persistence models (`LeakageAlert`, `PriceObservation`, `ProjectMilestone`, `InventoryRecord`, `SupplierReliabilityConfig`, `SupplierReliabilitySnapshot`, `SupplierScoreDispute`, `ConsolidationOpportunity`, `AutomationExecution`).
- Enforce integer `BigInt` paise financial math across all calculations; zero floating-point ledger arithmetic.
- Enforce strict deterministic intelligence rules; AI is optional assistance only and never fabricates prices, stock, verification status, or savings.
- Respect the Phase 6.8.7A database safety gate: zero production connections, migrations, or writes.

## 2. Seven Capabilities Execution Map
1. **True Landed Cost Engine** (`landed-cost-engine.ts`) — Anti-double-counting GST/freight, version deduplication, like-for-like validation, explainable decision support.
2. **Material Price Intelligence** (`price-intelligence.ts`, `/api/procurement/intelligence/prices`, `/buyer/intelligence/prices`) — Sourced observations, strict grade/unit lock, minimum 3 verified observations threshold, freshness & CSV export.
3. **Supplier Reliability Intelligence** (`supplier-reliability.ts`, `/api/procurement/intelligence/suppliers`, `/buyer/intelligence/suppliers`) — Configurable 7-dimension weighting (25/25/15/10/10/10/5), minimum sample-size enforcement, admin dispute review.
4. **Procurement Leakage Detector** (`leakage-detector.ts`, `/api/procurement/intelligence/leakage`, `/buyer/intelligence/leakage`) — Explainable anomaly scanning across POs, Invoices, GRNs, freight, approvals; strict separation of Potential Leakage, Confirmed Leakage, and Recovered Savings; CSV export & audit trail.
5. **Multi-Project Purchasing Intelligence** (`multi-project-intelligence.ts`, `/api/procurement/intelligence/multi-project`, `/buyer/intelligence/multi-project`) — Cross-project rate attribution, supplier concentration risk, specification/schedule-verified consolidation.
6. **Procurement Timing Intelligence** (`timing-intelligence.ts`, `/api/procurement/intelligence/timing`, `/buyer/intelligence/timing`) — Milestone + BOQ + stock + open-PO forecasting, shortage & lead-time alerts, confidence levels (`HIGH`, `MODERATE`, `LOW`, `INSUFFICIENT_DATA`).
7. **Procurement Autopilot** (`autopilot-engine.ts`, `/api/procurement/intelligence/autopilot`, `/buyer/autopilot`) — Human-controlled RFQ drafts, explainable supplier matching, deterministic quotation analysis, delivery exception monitoring; blocks `AUTO_APPROVE`/`AUTO_AWARD`.
