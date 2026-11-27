# PROVENTA — SHARED PROCUREMENT INTELLIGENCE ARCHITECTURE

**Date:** November 27, 2026  

---

## 1. Unified Data Flow

All seven intelligence modules read from and persist to the same PostgreSQL relational schema (`prisma/schema.prisma`):

`ConstructionProject` → `ProcurementRequirement` / `ProjectMilestone` / `InventoryRecord` → `ProcurementRfq` → `ProcurementQuotation` → `TrueLandedCost` → `ProcurementApprovalRecord` → `ProcurementAward` → `ProcurementOrder` → `ProcurementDelivery` → `GoodsReceipt` → `ThreeWayMatchRecord` → `SupplierReliabilitySnapshot` / `PriceObservation` / `LeakageAlert` / `ConsolidationOpportunity` / `AutomationExecution`

## 2. Deterministic Core + Optional AI Policy
- **Deterministic Layer (`src/lib/construction-procurement/`):** All financial arithmetic (`BigInt` paise), GST/freight anti-double-counting, specification equivalence locks, leakage anomaly rules, 7-dimension supplier reliability scoring, BOQ/inventory shortage forecasting, cross-project rate attribution, and 3-way matching execute deterministically with zero AI dependency.
- **AI Policy:** When `GEMINI_API_KEY` is absent, all seven capabilities operate deterministically and clearly surface `DETERMINISTIC MODE (AI KEY UNCONFIGURED)` in the Autopilot workspace. AI never invents prices, supplier stock, verification status, or savings.

## 3. Unified Navigation & Exports
- `BuyerWorkspaceShell.tsx` organises the buyer workspace into Core Operations, **Procurement Intelligence** (Leakage Detector, Material Price Intelligence, Procurement Timing, Supplier Reliability, Multi-Project Intelligence, Procurement Autopilot), and Execution & Control.
- CSV audit exports are live at `/api/procurement/intelligence/leakage?format=csv` and `/api/procurement/intelligence/prices?format=csv`.
