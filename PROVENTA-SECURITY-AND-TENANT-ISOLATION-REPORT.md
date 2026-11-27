# PROVENTA — SECURITY & TENANT ISOLATION REPORT

**Date:** November 27, 2026  

---

## 1. Tenant Isolation & Authorisation Matrix
- **Mandatory Session Guard:** Every new intelligence API route (`/api/procurement/intelligence/{leakage,prices,timing,suppliers,multi-project,autopilot}`) and procurement route requires an authenticated `getSession()` (`401 UNAUTHORIZED` otherwise).
- **Organisation Scoping:** All Prisma queries filter explicitly on `organisationId: { in: orgIds }` resolved server-side via `getUserAuthorizedBusinesses(session.user.id)`.
- **Cross-Tenant Enforcement:** `PATCH /api/procurement/intelligence/leakage`, `POST /api/procurement/intelligence/autopilot`, `POST /api/procurement/approvals`, and `PATCH /api/procurement/disputes` verify record ownership against `orgIds` and return `403 FORBIDDEN` on cross-tenant access attempts.
- **Role Separation & Supplier Confidentiality:**
  - `SUPPLIER_OWNER`, `SUPPLIER_SALES_MANAGER`, and `SUPPLIER_OPS_MANAGER` have zero access to `quotation:read_buyer` or competitor pricing.
  - `POST /api/procurement/intelligence/suppliers` restricts `UPDATE_WEIGHTS` strictly to `PLATFORM_ADMIN` (`403` for buyers/suppliers); suppliers can only submit factual correction disputes routed to admin review.
  - `POST /api/procurement/intelligence/autopilot` explicitly blocks `AUTO_APPROVE` and `AUTO_AWARD` (`403 HUMAN_CONTROL_POLICY_VIOLATION`).
- **Immutable Audit Trails:** Leakage alert investigations, dispute updates, and autopilot confirmations append strictly to JSON audit logs without mutating or deleting prior entries.

## 2. Environment & Production Safety Compliance
- Zero production Neon database connections, migrations, seeds, or writes executed.
- Zero secrets printed or committed; `.env.preview.local` verified gitignored via `.gitignore:28:.env.*.local`.
- Zero deployments or git pushes performed.
