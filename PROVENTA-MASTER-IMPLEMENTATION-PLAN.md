# PROVENTA — MASTER IMPLEMENTATION PLAN
## Construction Procurement & Intelligence Platform

**Platform:** PROVENTA (`https://proventa.in`)  
**Tagline:** *Source better. Compare smarter. Procure with confidence.*  
**Initial Operating Market:** Ahmedabad, Gandhinagar & Gujarat Construction Markets  
**Baseline Commit:** `82ffb2cf9938b7ba0a0c295650dd5fe3714d937e` (`82ffb2c`)  
**Date:** November 27, 2026  

---

## 1. Phase 0 — Repository & Infrastructure Audit Summary

### 1.1 Existing Reusable Infrastructure (Preserved)
- **Authentication & Session Security:** `src/lib/auth/session.ts`, NextAuth v5, passkey & email verification flows, RBAC helpers, `src/lib/business/auth-context.ts`.
- **Database Schema (`prisma/schema.prisma`):** Already includes `Business`, `BusinessMembership`, `BusinessVerificationRecord`, `BuyerProfile`, `SupplierProfile`, `SupplierProduct`, `BusinessDocument`, `BusinessAuditLog`, `ProcurementRfq`, `ProcurementQuotation`, `ProcurementOrder`, `SupplierWarehouse`, `SupplierServiceArea`, `SupplierPerformance`, `SavedSupplier`, `SupplierRFQMatch`, `CommercialInvoice`, `PaymentLedgerEntry`, `PaymentScheduleInstalment`, `PaymentVerificationRecord`, `PaymentDispute`, `Notification`, `AuditLog`.
- **Payment & Financial Concurrency Controls:** Phases 6.6–6.8.6 verified HMAC constant-time verification, row-locked refund serialization, over-refund quarantine, and distributed fencing.
- **Existing Procurement Routes:** `/buyer/*`, `/supplier/*`, `/rfq/new`, `/admin/procurement`, `/api/procurement/*`, `/api/supplier/*`, `/api/payment-intelligence/*`.

### 1.2 Real Estate Intelligence Modules (Isolated Safely, Not Deleted)
- Public routes (`/price`, `/location-intelligence`, `/project-intelligence`, `/investment-intelligence`, `/property-intelligence`) and backend valuation models (`Valuation*`) remain intact in the repository and database schema, removed from primary customer navigation so PROVENTA presents a unified Construction Procurement identity.

### 1.3 Critical Gaps Identified in Phase 0
1. **Brand & Navigation Mismatch:** `(public)/layout.tsx` and `(public)/page.tsx` presented the Real Estate Intelligence identity (`#F5F3ED` / `#202B3C`) instead of Construction Procurement (`#172B3A`, `#292F3D`, `#0F6B50`, `#C9A45B`, `#E9ECEF`, `#FFFFFF`).
2. **In-Memory Procurement Repository:** `src/lib/procurement/repository.ts` maintained in-memory state with non-blocking Prisma syncs; new core enterprise modules require Prisma-backed persistence, integer paise monetary math, and strict server-side authorization.
3. **Award Endpoint Authentication Gap:** `src/app/api/procurement/quotations/[id]/select/route.ts` checked ownership only when `session?.user?.id` existed, allowing unauthenticated requests to fall through.
4. **Missing Enterprise Procurement Modules:** Construction Projects, Structured Material Taxonomy & Equivalence Engine, Procurement Requirements, Intelligent Landed-Cost Comparison Centre, Savings Intelligence (Potential vs. Realised), Multi-Level Approval Workflows with Separation of Duties, GRN & Three-Way Matching (`PO + GRN + Invoice`), Documented Dispute Management, and Pacifica Companies Institutional Pilot Mode.

### 1.4 Infrastructure Safety Gate Status (Phase 6.8.7A)
- **Status:** **GATE ACTIVE — STAGING SECRET ACCESS PENDING.**
- Vercel CLI is authenticated (`deepamupadhyay368-9678`) and linked to `proventa` (`prj_GhD9zFqYdLmNxdXFzcsROfIxeGgq`).
- All 18 `PROVENTA_STAGING_*` variables and `DATABASE_URL` in Vercel Preview are marked `Secret` (`[SENSITIVE]`), so `vercel env pull` cannot retrieve their plaintext values locally.
- **Action:** Zero connections, zero migrations, and zero writes against Production Neon. All schema additions are validated via `npx prisma validate` and `npx prisma generate` with a reviewed migration SQL file prepared for isolated staging execution once Phase 6.8.7A passes.

---

## 2. Phased Implementation Map

| Phase | Scope | Key Deliverables |
| :--- | :--- | :--- |
| **Phase 0** | Repository & Infrastructure Audit | Audit complete; `PROVENTA-MASTER-IMPLEMENTATION-PLAN.md` |
| **Phase 1** | Brand & Application Restoration | Industrial corporate palette in `globals.css`, `ProcurementNav`, `ProcurementFooter`, Construction Procurement homepage, updated `/for-buyers` & `/for-suppliers` |
| **Phase 2** | Organisation & User RBAC | 11-role server-side RBAC matrix (`rbac.ts`), org tenant isolation, separation of duties |
| **Phase 3** | Procurement Foundation | `ConstructionProject`, `MaterialCategory`/`MaterialProduct` taxonomy (`taxonomy.ts`), `ProcurementRequirement`, `/buyer/projects`, `/buyer/catalogue`, `/buyer/requirements` + APIs |
| **Phase 4** | Quotation & Intelligence | Integer paise `money.ts`, Like-for-like `comparison-engine.ts`, `savings-intelligence.ts` (Potential vs. Realised), `/buyer/comparison`, `/buyer/analytics` + APIs |
| **Phase 5** | Procurement Control | Approval workflows & separation of duties, hardened `award-engine.ts` (`FOR UPDATE`, idempotency, 401/403/409 enforcement), `/buyer/approvals` + APIs |
| **Phase 6** | Fulfilment & Reconciliation | Partial/full deliveries, GRN, Three-Way Match (`PO + GRN + Invoice`), immutable Disputes, `/buyer/deliveries`, `/buyer/invoices`, `/buyer/disputes` + APIs |
| **Phase 7** | Administration & Commercialisation | Buyer Workspace Shell (all 15 modules), admin oversight & audit trail preservation |
| **Phase 8** | Security & Independent Testing | Comprehensive automated test suite (`master-transformation-integrity.test.ts`), `PROVENTA-SECURITY-AND-INTEGRITY-REPORT.md`, `PROVENTA-TEST-RESULTS.md` |
| **Phase 9** | Pacifica Pilot Readiness | Isolated Pacifica Pilot Mode (`/pilot/pacifica`), Procurement Savings Assessment Report, `PROVENTA-PACIFICA-PILOT-PROPOSAL.md` |
| **Phase 10** | Deployment Readiness | `PROVENTA-FEATURE-STATUS.md`, `prisma validate`, `tsc --noEmit`, full test verification; hold production deployment pending staging certification |
