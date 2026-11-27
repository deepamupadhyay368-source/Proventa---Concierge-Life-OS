-- PROVENTA — Real Estate Intelligence & Property OS (Strictly Additive Migration)
-- Zero DROP, Zero TRUNCATE, Zero modifications to existing tables.

DO $$ BEGIN CREATE TYPE "RegistryVerificationStatus" AS ENUM ('VERIFIED', 'UNVERIFIED', 'USER_SUBMITTED', 'EXTERNALLY_SOURCED', 'REJECTED'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "InfrastructureLifecycleStatus" AS ENUM ('OPERATIONAL', 'UNDER_CONSTRUCTION', 'PROPOSED', 'UNVERIFIED'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "PropertyExpenseCategory" AS ENUM ('ACQUISITION', 'STAMP_DUTY_REGISTRATION', 'PROPERTY_TAX', 'MAINTENANCE', 'RENOVATION', 'UTILITIES', 'INSURANCE', 'BROKERAGE', 'OTHER'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "WatchlistTargetType" AS ENUM ('PROPERTY', 'PROJECT', 'LOCALITY', 'SEGMENT'); EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS "registry_properties" (
    "id" TEXT NOT NULL,
    "proventaPropertyId" TEXT NOT NULL,
    "landParcelCode" TEXT,
    "projectSlug" TEXT,
    "buildingName" TEXT,
    "unitNumber" TEXT,
    "propertyCategory" TEXT NOT NULL,
    "propertyType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "normalizedAddressKey" TEXT NOT NULL,
    "locality" TEXT NOT NULL,
    "city" TEXT NOT NULL DEFAULT 'Ahmedabad',
    "state" TEXT NOT NULL DEFAULT 'Gujarat',
    "pincode" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "plotAreaSqFt" DOUBLE PRECISION,
    "carpetAreaSqFt" DOUBLE PRECISION,
    "builtUpAreaSqFt" DOUBLE PRECISION,
    "constructionStatus" TEXT NOT NULL DEFAULT 'READY_TO_MOVE',
    "buildingAgeYears" INTEGER,
    "floorInfo" TEXT,
    "configuration" TEXT,
    "developerName" TEXT,
    "reraNumber" TEXT,
    "registrationRef" TEXT,
    "verificationStatus" "RegistryVerificationStatus" NOT NULL DEFAULT 'USER_SUBMITTED',
    "sourceProvenance" TEXT NOT NULL,
    "isPublicRegistry" BOOLEAN NOT NULL DEFAULT true,
    "submittedByUserId" TEXT,
    "verifiedByAdminId" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "registry_properties_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "registry_properties_proventaPropertyId_key" ON "registry_properties"("proventaPropertyId");
CREATE INDEX IF NOT EXISTS "registry_properties_locality_city_idx" ON "registry_properties"("locality", "city");
CREATE INDEX IF NOT EXISTS "registry_properties_normalizedAddressKey_idx" ON "registry_properties"("normalizedAddressKey");
CREATE INDEX IF NOT EXISTS "registry_properties_reraNumber_idx" ON "registry_properties"("reraNumber");
CREATE INDEX IF NOT EXISTS "registry_properties_verificationStatus_isPublicRegistry_idx" ON "registry_properties"("verificationStatus", "isPublicRegistry");

CREATE TABLE IF NOT EXISTS "property_lifecycle_events" (
    "id" TEXT NOT NULL,
    "registryPropertyId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "summary" TEXT NOT NULL,
    "sourceProvenance" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "property_lifecycle_events_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "property_lifecycle_events_registryPropertyId_fkey" FOREIGN KEY ("registryPropertyId") REFERENCES "registry_properties"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "property_lifecycle_events_registryPropertyId_eventDate_idx" ON "property_lifecycle_events"("registryPropertyId", "eventDate");

CREATE TABLE IF NOT EXISTS "real_estate_market_observations" (
    "id" TEXT NOT NULL,
    "locality" TEXT NOT NULL,
    "city" TEXT NOT NULL DEFAULT 'Ahmedabad',
    "segment" TEXT NOT NULL,
    "propertyType" TEXT NOT NULL,
    "pricePerSqFtPaise" BIGINT NOT NULL,
    "rentalYieldPct" DOUBLE PRECISION,
    "transactionCount" INTEGER NOT NULL DEFAULT 1,
    "reportingPeriod" TEXT NOT NULL,
    "observationDate" TIMESTAMP(3) NOT NULL,
    "dataSource" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "methodology" TEXT NOT NULL,
    "confidenceLevel" TEXT NOT NULL DEFAULT 'MODERATE',
    "verificationStatus" "RegistryVerificationStatus" NOT NULL DEFAULT 'EXTERNALLY_SOURCED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "real_estate_market_observations_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "real_estate_market_observations_locality_segment_observationDate_idx" ON "real_estate_market_observations"("locality", "segment", "observationDate");
CREATE INDEX IF NOT EXISTS "real_estate_market_observations_city_verificationStatus_idx" ON "real_estate_market_observations"("city", "verificationStatus");

CREATE TABLE IF NOT EXISTS "real_estate_infrastructure_assets" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "locality" TEXT NOT NULL,
    "corridor" TEXT NOT NULL,
    "city" TEXT NOT NULL DEFAULT 'Ahmedabad',
    "category" TEXT NOT NULL,
    "status" "InfrastructureLifecycleStatus" NOT NULL DEFAULT 'PROPOSED',
    "expectedCompletionYear" INTEGER,
    "sourceReference" TEXT NOT NULL,
    "lastVerifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "real_estate_infrastructure_assets_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "real_estate_infrastructure_assets_locality_status_idx" ON "real_estate_infrastructure_assets"("locality", "status");
CREATE INDEX IF NOT EXISTS "real_estate_infrastructure_assets_corridor_idx" ON "real_estate_infrastructure_assets"("corridor");

CREATE TABLE IF NOT EXISTS "property_os_passports" (
    "id" TEXT NOT NULL,
    "ownerUserId" TEXT NOT NULL,
    "passportCode" TEXT NOT NULL,
    "linkedRegistryPropertyId" TEXT,
    "nickname" TEXT NOT NULL,
    "propertyCategory" TEXT NOT NULL,
    "propertyType" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "locality" TEXT NOT NULL,
    "city" TEXT NOT NULL DEFAULT 'Ahmedabad',
    "carpetAreaSqFt" DOUBLE PRECISION,
    "acquisitionDate" TIMESTAMP(3),
    "purchasePricePaise" BIGINT NOT NULL DEFAULT 0,
    "currentEstimatedPaise" BIGINT NOT NULL DEFAULT 0,
    "ownershipNotes" TEXT,
    "occupancyStatus" TEXT NOT NULL DEFAULT 'OWNER_OCCUPIED',
    "isPrivate" BOOLEAN NOT NULL DEFAULT true,
    "documentKeys" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "property_os_passports_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "property_os_passports_passportCode_key" ON "property_os_passports"("passportCode");
CREATE INDEX IF NOT EXISTS "property_os_passports_ownerUserId_deletedAt_idx" ON "property_os_passports"("ownerUserId", "deletedAt");

CREATE TABLE IF NOT EXISTS "property_os_expenses" (
    "id" TEXT NOT NULL,
    "passportId" TEXT NOT NULL,
    "ownerUserId" TEXT NOT NULL,
    "category" "PropertyExpenseCategory" NOT NULL,
    "amountPaise" BIGINT NOT NULL,
    "expenseDate" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "receiptDocKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "property_os_expenses_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "property_os_expenses_passportId_fkey" FOREIGN KEY ("passportId") REFERENCES "property_os_passports"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "property_os_expenses_passportId_expenseDate_idx" ON "property_os_expenses"("passportId", "expenseDate");
CREATE INDEX IF NOT EXISTS "property_os_expenses_ownerUserId_idx" ON "property_os_expenses"("ownerUserId");

CREATE TABLE IF NOT EXISTS "property_os_leases" (
    "id" TEXT NOT NULL,
    "passportId" TEXT NOT NULL,
    "ownerUserId" TEXT NOT NULL,
    "tenantName" TEXT NOT NULL,
    "tenantContact" TEXT,
    "monthlyRentPaise" BIGINT NOT NULL,
    "securityDepositPaise" BIGINT NOT NULL DEFAULT 0,
    "leaseStartDate" TIMESTAMP(3) NOT NULL,
    "leaseEndDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "agreementDocKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "property_os_leases_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "property_os_leases_passportId_fkey" FOREIGN KEY ("passportId") REFERENCES "property_os_passports"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "property_os_leases_passportId_status_idx" ON "property_os_leases"("passportId", "status");
CREATE INDEX IF NOT EXISTS "property_os_leases_ownerUserId_leaseEndDate_idx" ON "property_os_leases"("ownerUserId", "leaseEndDate");

CREATE TABLE IF NOT EXISTS "property_os_maintenance" (
    "id" TEXT NOT NULL,
    "passportId" TEXT NOT NULL,
    "ownerUserId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "contractorName" TEXT,
    "costPaise" BIGINT NOT NULL DEFAULT 0,
    "scheduledDate" TIMESTAMP(3),
    "completedDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "property_os_maintenance_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "property_os_maintenance_passportId_fkey" FOREIGN KEY ("passportId") REFERENCES "property_os_passports"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "property_os_maintenance_passportId_status_idx" ON "property_os_maintenance"("passportId", "status");
CREATE INDEX IF NOT EXISTS "property_os_maintenance_ownerUserId_idx" ON "property_os_maintenance"("ownerUserId");

CREATE TABLE IF NOT EXISTS "property_os_timeline_events" (
    "id" TEXT NOT NULL,
    "passportId" TEXT NOT NULL,
    "ownerUserId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "property_os_timeline_events_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "property_os_timeline_events_passportId_fkey" FOREIGN KEY ("passportId") REFERENCES "property_os_passports"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "property_os_timeline_events_passportId_eventDate_idx" ON "property_os_timeline_events"("passportId", "eventDate");

CREATE TABLE IF NOT EXISTS "real_estate_watchlists" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "targetType" "WatchlistTargetType" NOT NULL,
    "targetIdOrSlug" TEXT NOT NULL,
    "targetLabel" TEXT NOT NULL,
    "alertFrequency" TEXT NOT NULL DEFAULT 'WEEKLY',
    "emailEnabled" BOOLEAN NOT NULL DEFAULT true,
    "inAppEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "real_estate_watchlists_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "real_estate_watchlists_userId_targetType_targetIdOrSlug_key" ON "real_estate_watchlists"("userId", "targetType", "targetIdOrSlug");
CREATE INDEX IF NOT EXISTS "real_estate_watchlists_userId_idx" ON "real_estate_watchlists"("userId");
