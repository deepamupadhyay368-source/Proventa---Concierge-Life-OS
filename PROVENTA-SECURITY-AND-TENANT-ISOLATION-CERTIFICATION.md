# PROVENTA — PHASE 3E: SECURITY, TENANT ISOLATION & CONCURRENCY CERTIFICATION

**Date:** November 27, 2026  
**Database:** Real PostgreSQL 18.7 (`proventa-staging`, `ep-raspy-cake-bitrl3yd-pooler.c-5.ap-southeast-1.aws.neon.tech`)

---

## Certified Controls
1. **Live Unauthenticated API Guard (Vercel Preview):** `GET /api/procurement/intelligence/leakage` on `https://proventa-ciooybtrb-deepamupadhyay368-9678s-projects.vercel.app` returned `{"error":"Authentication required. Please sign in.","code":"UNAUTHORIZED"}` (HTTP 401).
2. **Two-Organisation PostgreSQL Tenant Isolation:** Verified live on `proventa-staging` that records persisted under `orgA` return `0` rows when queried by `orgB`.
3. **Real PostgreSQL Award Concurrency:** 2 parallel `prisma.procurementAward.create` calls on the same `rfqId` resulted in **1 fulfilled, 1 rejected** at the PostgreSQL constraint layer.
4. **Real PostgreSQL Refund Row-Lock Serialization (`SELECT ... FOR UPDATE`):** 2 simultaneous partial refund transactions (`50,000` + `49,900` = `99,900` paise) serialized cleanly on `ValuationPayment`; a subsequent refund attempt against the now-`REFUNDED` row was rejected with `409`.
5. **RBAC & Separation of Duties:** 11-role matrix, cross-tenant rejection, unauthenticated award `401` guard, and creator self-approval block above threshold verified.
6. **Zero Production Impact:** Zero connections, queries, migrations, or env changes made to Production Neon (`neon-aqua-coin`) or `https://proventa.in`.
