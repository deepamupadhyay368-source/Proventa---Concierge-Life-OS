-- PROVENTA Phase 8.6 — Strictly Additive Hardening, Reports & Notifications Migration
-- Zero DROP, Zero TRUNCATE, Zero destructive modifications.

ALTER TYPE "RegistryVerificationStatus" ADD VALUE IF NOT EXISTS 'ADMIN_SUBMITTED';
ALTER TYPE "RegistryVerificationStatus" ADD VALUE IF NOT EXISTS 'SYNTHETIC_TEST_DATA';

-- Prevent concurrent duplicate property submissions (TOCTOU race fix)
CREATE UNIQUE INDEX IF NOT EXISTS "registry_properties_active_normalizedAddressKey_uq"
  ON "registry_properties"("normalizedAddressKey")
  WHERE "deletedAt" IS NULL;

-- Persisted PDF Intelligence Reports (strictly owner-scoped)
CREATE TABLE IF NOT EXISTS "real_estate_reports" (
    "id" TEXT NOT NULL,
    "reportReference" TEXT NOT NULL,
    "ownerUserId" TEXT NOT NULL,
    "reportType" TEXT NOT NULL,
    "subjectTitle" TEXT NOT NULL,
    "geography" TEXT NOT NULL,
    "metricsJson" JSONB NOT NULL,
    "methodology" TEXT NOT NULL,
    "dataSources" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "confidenceLevel" TEXT NOT NULL,
    "assumptions" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "limitations" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "nonCertifiedDisclaimer" TEXT NOT NULL,
    "pdfBase64" TEXT NOT NULL,
    "sha256Checksum" TEXT NOT NULL,
    "pageCount" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "real_estate_reports_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "real_estate_reports_reportReference_key" ON "real_estate_reports"("reportReference");
CREATE INDEX IF NOT EXISTS "real_estate_reports_ownerUserId_createdAt_idx" ON "real_estate_reports"("ownerUserId", "createdAt");
CREATE INDEX IF NOT EXISTS "real_estate_reports_reportType_idx" ON "real_estate_reports"("reportType");

-- Real Estate In-App Notifications (Watchlist, Lease Expiry, Maintenance, Verification)
CREATE TABLE IF NOT EXISTS "real_estate_notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "targetUrl" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "real_estate_notifications_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "real_estate_notifications_userId_isRead_createdAt_idx" ON "real_estate_notifications"("userId", "isRead", "createdAt");

-- Additive Referential Integrity Foreign Keys (guarded for idempotency)
DO $$ BEGIN
  ALTER TABLE "property_os_passports"
    ADD CONSTRAINT "property_os_passports_linkedRegistryPropertyId_fkey"
    FOREIGN KEY ("linkedRegistryPropertyId") REFERENCES "registry_properties"("id") ON DELETE SET NULL ON UPDATE CASCADE NOT VALID;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$
DECLARE
  user_tbl TEXT;
BEGIN
  IF to_regclass('public.users') IS NOT NULL THEN
    user_tbl := '"users"';
  ELSIF to_regclass('public."User"') IS NOT NULL THEN
    user_tbl := '"User"';
  ELSE
    user_tbl := NULL;
  END IF;

  IF user_tbl IS NOT NULL THEN
    BEGIN
      EXECUTE format('ALTER TABLE "property_os_passports" ADD CONSTRAINT "property_os_passports_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES %s("id") ON DELETE CASCADE ON UPDATE CASCADE NOT VALID', user_tbl);
    EXCEPTION WHEN duplicate_object THEN null; END;

    BEGIN
      EXECUTE format('ALTER TABLE "real_estate_watchlists" ADD CONSTRAINT "real_estate_watchlists_userId_fkey" FOREIGN KEY ("userId") REFERENCES %s("id") ON DELETE CASCADE ON UPDATE CASCADE NOT VALID', user_tbl);
    EXCEPTION WHEN duplicate_object THEN null; END;

    BEGIN
      EXECUTE format('ALTER TABLE "real_estate_reports" ADD CONSTRAINT "real_estate_reports_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES %s("id") ON DELETE CASCADE ON UPDATE CASCADE NOT VALID', user_tbl);
    EXCEPTION WHEN duplicate_object THEN null; END;

    BEGIN
      EXECUTE format('ALTER TABLE "real_estate_notifications" ADD CONSTRAINT "real_estate_notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES %s("id") ON DELETE CASCADE ON UPDATE CASCADE NOT VALID', user_tbl);
    EXCEPTION WHEN duplicate_object THEN null; END;
  END IF;
END $$;
