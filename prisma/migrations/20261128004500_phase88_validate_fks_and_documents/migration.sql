-- PROVENTA Phase 8.8 — Complete Validated Foreign Keys & Private Property Documents
-- Strictly additive. Zero DROP, Zero TRUNCATE, Zero destructive SQL.

-- 1. Private Binary Property Documents table
CREATE TABLE IF NOT EXISTS "property_os_documents" (
    "id" TEXT NOT NULL,
    "passportId" TEXT NOT NULL,
    "ownerUserId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "storageKey" TEXT NOT NULL,
    "storageProvider" TEXT NOT NULL DEFAULT 'DATABASE_PRIVATE',
    "sha256Checksum" TEXT NOT NULL,
    "contentBase64" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "property_os_documents_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "property_os_documents_passportId_fkey" FOREIGN KEY ("passportId") REFERENCES "property_os_passports"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "property_os_documents_storageKey_key" ON "property_os_documents"("storageKey");
CREATE INDEX IF NOT EXISTS "property_os_documents_passportId_createdAt_idx" ON "property_os_documents"("passportId", "createdAt");
CREATE INDEX IF NOT EXISTS "property_os_documents_ownerUserId_idx" ON "property_os_documents"("ownerUserId");

-- 2. Add missing ownership FKs and VALIDATE ALL FKs (convalidated = true)
DO $$
DECLARE
  user_tbl TEXT;
BEGIN
  IF to_regclass('public.users') IS NOT NULL THEN
    user_tbl := '"users"';
  ELSIF to_regclass('public."User"') IS NOT NULL THEN
    user_tbl := '"User"';
  ELSE
    RAISE EXCEPTION 'Required users table not found in public schema';
  END IF;

  -- Add missing FKs on registry_properties and all Property OS child tables
  BEGIN
    EXECUTE format('ALTER TABLE "registry_properties" ADD CONSTRAINT "registry_properties_submittedByUserId_fkey" FOREIGN KEY ("submittedByUserId") REFERENCES %s("id") ON DELETE SET NULL ON UPDATE CASCADE', user_tbl);
  EXCEPTION WHEN duplicate_object THEN null; END;

  BEGIN
    EXECUTE format('ALTER TABLE "registry_properties" ADD CONSTRAINT "registry_properties_verifiedByAdminId_fkey" FOREIGN KEY ("verifiedByAdminId") REFERENCES %s("id") ON DELETE SET NULL ON UPDATE CASCADE', user_tbl);
  EXCEPTION WHEN duplicate_object THEN null; END;

  BEGIN
    EXECUTE format('ALTER TABLE "property_os_expenses" ADD CONSTRAINT "property_os_expenses_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES %s("id") ON DELETE CASCADE ON UPDATE CASCADE', user_tbl);
  EXCEPTION WHEN duplicate_object THEN null; END;

  BEGIN
    EXECUTE format('ALTER TABLE "property_os_leases" ADD CONSTRAINT "property_os_leases_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES %s("id") ON DELETE CASCADE ON UPDATE CASCADE', user_tbl);
  EXCEPTION WHEN duplicate_object THEN null; END;

  BEGIN
    EXECUTE format('ALTER TABLE "property_os_maintenance" ADD CONSTRAINT "property_os_maintenance_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES %s("id") ON DELETE CASCADE ON UPDATE CASCADE', user_tbl);
  EXCEPTION WHEN duplicate_object THEN null; END;

  BEGIN
    EXECUTE format('ALTER TABLE "property_os_timeline_events" ADD CONSTRAINT "property_os_timeline_events_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES %s("id") ON DELETE CASCADE ON UPDATE CASCADE', user_tbl);
  EXCEPTION WHEN duplicate_object THEN null; END;

  BEGIN
    EXECUTE format('ALTER TABLE "property_os_documents" ADD CONSTRAINT "property_os_documents_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES %s("id") ON DELETE CASCADE ON UPDATE CASCADE', user_tbl);
  EXCEPTION WHEN duplicate_object THEN null; END;

  -- Validate all 5 Phase 8.6 NOT VALID foreign keys so pg_constraint.convalidated = true
  ALTER TABLE "property_os_passports" VALIDATE CONSTRAINT "property_os_passports_linkedRegistryPropertyId_fkey";
  ALTER TABLE "property_os_passports" VALIDATE CONSTRAINT "property_os_passports_ownerUserId_fkey";
  ALTER TABLE "real_estate_watchlists" VALIDATE CONSTRAINT "real_estate_watchlists_userId_fkey";
  ALTER TABLE "real_estate_reports" VALIDATE CONSTRAINT "real_estate_reports_ownerUserId_fkey";
  ALTER TABLE "real_estate_notifications" VALIDATE CONSTRAINT "real_estate_notifications_userId_fkey";
END $$;
