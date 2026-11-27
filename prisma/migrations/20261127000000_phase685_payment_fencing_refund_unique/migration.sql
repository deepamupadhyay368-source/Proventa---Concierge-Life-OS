-- PROVENTA Phase 6.8.5 Migration: Distributed Fencing Token & Unique Refund Reference
-- Non-destructive, forward-only migration preserving all financial ledger and valuation history.
-- Target: Neon PostgreSQL (Staging / Production)
-- Generated: 2026-11-27

-- 1. PREFLIGHT DUPLICATE AUDIT VERIFICATION
-- Ensure no duplicate non-null refundReference values exist before applying unique constraint.
DO $$
DECLARE
    duplicate_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO duplicate_count
    FROM (
        SELECT "refundReference"
        FROM "ValuationRefund"
        WHERE "refundReference" IS NOT NULL
        GROUP BY "refundReference"
        HAVING COUNT(*) > 1
    ) duplicates;

    IF duplicate_count > 0 THEN
        RAISE EXCEPTION 'MIGRATION ABORTED: Found % duplicate non-null refundReference values in ValuationRefund table. Manual deduplication required before applying unique index.', duplicate_count;
    END IF;
END $$;

-- 2. ADD processingLockToken COLUMN TO ValuationRequest
ALTER TABLE "ValuationRequest" ADD COLUMN IF NOT EXISTS "processingLockToken" TEXT;

-- 3. CREATE INDEX ON ValuationRequest(processingLockToken) FOR DISTRIBUTED FENCING LOOKUPS
CREATE INDEX IF NOT EXISTS "ValuationRequest_processingLockToken_idx" ON "ValuationRequest"("processingLockToken");

-- 4. CREATE UNIQUE INDEX ON ValuationRefund(refundReference)
-- PostgreSQL allows multiple NULLs in unique indexes by default (SQL:2008 standard).
-- Only non-null provider refund IDs are constrained to be strictly unique.
CREATE UNIQUE INDEX IF NOT EXISTS "ValuationRefund_refundReference_key" ON "ValuationRefund"("refundReference");
