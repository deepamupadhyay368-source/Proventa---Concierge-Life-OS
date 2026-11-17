-- PROVENTA 2.0 — Procurement Platform & Payment Intelligence Engine Migration
-- Forward-only, non-destructive migration preserving all existing database records, buyer profiles, and transactions.
-- Generated: 2026-11-17

-- 1. PROCUREMENT RFQs
CREATE TABLE IF NOT EXISTS "procurement_rfqs" (
    "id" TEXT NOT NULL,
    "buyerBusinessId" TEXT,
    "creatorUserId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "deliveryDistrict" TEXT NOT NULL,
    "deliveryState" TEXT NOT NULL,
    "deliveryPincode" TEXT,
    "deliveryAddress" TEXT,
    "targetDate" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "items" JSONB NOT NULL,
    "eligibleSupplierIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "purchaseOrderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "procurement_rfqs_pkey" PRIMARY KEY ("id")
);

-- 2. PROCUREMENT QUOTATIONS
CREATE TABLE IF NOT EXISTS "procurement_quotations" (
    "id" TEXT NOT NULL,
    "rfqId" TEXT NOT NULL,
    "supplierBusinessId" TEXT,
    "supplierId" TEXT NOT NULL,
    "supplierName" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "totalBasePrice" DOUBLE PRECISION NOT NULL,
    "totalGst" DOUBLE PRECISION NOT NULL,
    "freightCharge" DOUBLE PRECISION NOT NULL,
    "totalLandedCost" DOUBLE PRECISION NOT NULL,
    "leadTimeDays" INTEGER NOT NULL,
    "validUntil" TIMESTAMP(3),
    "paymentTerms" TEXT,
    "itemQuotes" JSONB NOT NULL,
    "revisionNumber" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "procurement_quotations_pkey" PRIMARY KEY ("id")
);

-- 3. PROCUREMENT ORDERS
CREATE TABLE IF NOT EXISTS "procurement_orders" (
    "id" TEXT NOT NULL,
    "rfqId" TEXT NOT NULL,
    "quotationId" TEXT NOT NULL,
    "buyerBusinessId" TEXT,
    "supplierBusinessId" TEXT,
    "supplierId" TEXT NOT NULL,
    "supplierName" TEXT NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "trackingDetails" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "procurement_orders_pkey" PRIMARY KEY ("id")
);

-- 4. SUPPLIER WAREHOUSES
CREATE TABLE IF NOT EXISTS "supplier_warehouses" (
    "id" TEXT NOT NULL,
    "supplierProfileId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "pincode" TEXT NOT NULL,
    "capacitySqFt" INTEGER,
    "operatingZones" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "railSidingAccess" BOOLEAN NOT NULL DEFAULT false,
    "weighbridgeAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "supplier_warehouses_pkey" PRIMARY KEY ("id")
);

-- 5. SUPPLIER SERVICE AREAS
CREATE TABLE IF NOT EXISTS "supplier_service_areas" (
    "id" TEXT NOT NULL,
    "supplierProfileId" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "districts" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "pincodes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "standardLeadTimeDays" INTEGER NOT NULL DEFAULT 3,
    "minimumOrderValue" INTEGER,
    "panIndiaDelivery" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "supplier_service_areas_pkey" PRIMARY KEY ("id")
);

-- 6. SUPPLIER PERFORMANCES
CREATE TABLE IF NOT EXISTS "supplier_performances" (
    "id" TEXT NOT NULL,
    "supplierProfileId" TEXT NOT NULL,
    "rfqsReceived" INTEGER NOT NULL DEFAULT 0,
    "rfqsResponded" INTEGER NOT NULL DEFAULT 0,
    "responseRatePercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgResponseTimeHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "quotationsAwarded" INTEGER NOT NULL DEFAULT 0,
    "ordersCompleted" INTEGER NOT NULL DEFAULT 0,
    "onTimeDeliveryRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cancellationRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "totalDeliveredTonnage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sampleThresholdMet" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "supplier_performances_pkey" PRIMARY KEY ("id")
);

-- 7. SAVED SUPPLIERS
CREATE TABLE IF NOT EXISTS "saved_suppliers" (
    "id" TEXT NOT NULL,
    "buyerBusinessId" TEXT NOT NULL,
    "supplierBusinessId" TEXT NOT NULL,
    "notes" TEXT,
    "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_suppliers_pkey" PRIMARY KEY ("id")
);

-- 8. SUPPLIER RFQ MATCHES
CREATE TABLE IF NOT EXISTS "supplier_rfq_matches" (
    "id" TEXT NOT NULL,
    "rfqId" TEXT NOT NULL,
    "supplierBusinessId" TEXT NOT NULL,
    "matchScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "matchingReasons" JSONB NOT NULL,
    "matchedProductIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "matchType" TEXT NOT NULL DEFAULT 'AUTOMATIC',
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "viewedAt" TIMESTAMP(3),
    "respondedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "supplier_rfq_matches_pkey" PRIMARY KEY ("id")
);

-- 9. COMMERCIAL INVOICES
CREATE TABLE IF NOT EXISTS "commercial_invoices" (
    "id" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "purchaseOrderId" TEXT,
    "rfqId" TEXT,
    "buyerBusinessId" TEXT NOT NULL,
    "supplierBusinessId" TEXT NOT NULL,
    "issuerUserId" TEXT NOT NULL,
    "recipientUserId" TEXT,
    "invoiceDate" TIMESTAMP(3) NOT NULL,
    "contractualDueDate" TIMESTAMP(3) NOT NULL,
    "revisedDueDate" TIMESTAMP(3),
    "dueRevisionReason" TEXT,
    "paymentTerms" TEXT NOT NULL DEFAULT 'NET_30',
    "paymentTermsDays" INTEGER NOT NULL DEFAULT 30,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "subtotal" DECIMAL(14,2) NOT NULL,
    "taxAmount" DECIMAL(14,2) NOT NULL,
    "totalAmount" DECIMAL(14,2) NOT NULL,
    "paidAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "outstandingAmount" DECIMAL(14,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
    "verificationStatus" TEXT NOT NULL DEFAULT 'UNVERIFIED',
    "items" JSONB NOT NULL,
    "documentUrl" TEXT,
    "documentFileName" TEXT,
    "notes" TEXT,
    "isDisputed" BOOLEAN NOT NULL DEFAULT false,
    "disputeId" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "commercial_invoices_pkey" PRIMARY KEY ("id")
);

-- 10. PAYMENT LEDGER ENTRIES
CREATE TABLE IF NOT EXISTS "payment_ledger_entries" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "payerBusinessId" TEXT NOT NULL,
    "payeeBusinessId" TEXT NOT NULL,
    "recordedByUserId" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "utrNumber" TEXT,
    "bankReference" TEXT,
    "receiptUrl" TEXT,
    "receiptFileName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'RECORDED',
    "verificationStatus" TEXT NOT NULL DEFAULT 'UNVERIFIED',
    "verifiedAt" TIMESTAMP(3),
    "verifiedByUserId" TEXT,
    "notes" TEXT,
    "isReversal" BOOLEAN NOT NULL DEFAULT false,
    "reversedEntryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_ledger_entries_pkey" PRIMARY KEY ("id")
);

-- 11. PAYMENT SCHEDULE INSTALMENTS
CREATE TABLE IF NOT EXISTS "payment_schedule_instalments" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "instalmentNumber" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "percentage" DECIMAL(5,2),
    "dueDate" TIMESTAMP(3) NOT NULL,
    "revisedDueDate" TIMESTAMP(3),
    "expectedAmount" DECIMAL(14,2) NOT NULL,
    "paidAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_schedule_instalments_pkey" PRIMARY KEY ("id")
);

-- 12. PAYMENT VERIFICATION RECORDS
CREATE TABLE IF NOT EXISTS "payment_verification_records" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT,
    "paymentEntryId" TEXT,
    "verifiedByUserId" TEXT NOT NULL,
    "verificationType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'VERIFIED',
    "evidenceUrl" TEXT,
    "evidenceType" TEXT,
    "notes" TEXT,
    "verifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_verification_records_pkey" PRIMARY KEY ("id")
);

-- 13. PAYMENT DISPUTES
CREATE TABLE IF NOT EXISTS "payment_disputes" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "disputedByBusinessId" TEXT NOT NULL,
    "disputedByUserId" TEXT NOT NULL,
    "counterpartyBusinessId" TEXT NOT NULL,
    "disputeType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "disputedAmount" DECIMAL(14,2),
    "reason" TEXT NOT NULL,
    "evidenceUrls" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "counterpartyResponse" TEXT,
    "counterpartyRespondedAt" TIMESTAMP(3),
    "resolutionNotes" TEXT,
    "resolvedByUserId" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "adjustmentAmount" DECIMAL(14,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_disputes_pkey" PRIMARY KEY ("id")
);

-- 14. PAYMENT SCORES
CREATE TABLE IF NOT EXISTS "payment_scores" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "scoreType" TEXT NOT NULL DEFAULT 'DUAL',
    "buyerScore" INTEGER,
    "supplierScore" INTEGER,
    "buyerClassification" TEXT,
    "supplierClassification" TEXT,
    "buyerConfidence" TEXT NOT NULL DEFAULT 'LOW',
    "supplierConfidence" TEXT NOT NULL DEFAULT 'LOW',
    "onTimePaymentRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "averageDelayDays" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "overdueFrequencyRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "outstandingRatio" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "verifiedInvoiceCount" INTEGER NOT NULL DEFAULT 0,
    "verifiedTransactionCount" INTEGER NOT NULL DEFAULT 0,
    "verifiedTransactionValue" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "observationPeriodDays" INTEGER NOT NULL DEFAULT 0,
    "positiveFactors" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "negativeFactors" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "isPubliclyVisible" BOOLEAN NOT NULL DEFAULT true,
    "consentGranted" BOOLEAN NOT NULL DEFAULT true,
    "lastCalculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_scores_pkey" PRIMARY KEY ("id")
);

-- 15. PAYMENT SCORE SNAPSHOTS
CREATE TABLE IF NOT EXISTS "payment_score_snapshots" (
    "id" TEXT NOT NULL,
    "scoreId" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "scoreType" TEXT NOT NULL,
    "scoreValue" INTEGER NOT NULL,
    "classification" TEXT NOT NULL,
    "triggerReason" TEXT NOT NULL,
    "factorBreakdown" JSONB NOT NULL,
    "snapshotDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_score_snapshots_pkey" PRIMARY KEY ("id")
);

-- 16. PAYMENT AUDIT LOGS
CREATE TABLE IF NOT EXISTS "payment_audit_logs" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT,
    "paymentId" TEXT,
    "disputeId" TEXT,
    "businessId" TEXT,
    "actorUserId" TEXT NOT NULL,
    "actorRole" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "previousValues" JSONB,
    "newValues" JSONB,
    "reason" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_audit_logs_pkey" PRIMARY KEY ("id")
);

-- 17. PAYMENT REMINDERS
CREATE TABLE IF NOT EXISTS "payment_reminders" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "recipientUserId" TEXT NOT NULL,
    "reminderType" TEXT NOT NULL,
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_reminders_pkey" PRIMARY KEY ("id")
);

-- 18. PAYMENT CONSENTS
CREATE TABLE IF NOT EXISTS "payment_consents" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "scoreSharingAllowed" BOOLEAN NOT NULL DEFAULT true,
    "rfqCounterpartyVisibility" BOOLEAN NOT NULL DEFAULT true,
    "profilePublicScoreVisibility" BOOLEAN NOT NULL DEFAULT true,
    "anonymizeConfidentialDetails" BOOLEAN NOT NULL DEFAULT true,
    "updatedByUserId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_consents_pkey" PRIMARY KEY ("id")
);

-- ============================================================
-- UNIQUE CONSTRAINTS & INDEXES
-- ============================================================

CREATE UNIQUE INDEX IF NOT EXISTS "procurement_orders_rfqId_key" ON "procurement_orders"("rfqId");
CREATE UNIQUE INDEX IF NOT EXISTS "supplier_performances_supplierProfileId_key" ON "supplier_performances"("supplierProfileId");
CREATE UNIQUE INDEX IF NOT EXISTS "saved_suppliers_buyerBusinessId_supplierBusinessId_key" ON "saved_suppliers"("buyerBusinessId", "supplierBusinessId");
CREATE UNIQUE INDEX IF NOT EXISTS "supplier_rfq_matches_rfqId_supplierBusinessId_key" ON "supplier_rfq_matches"("rfqId", "supplierBusinessId");
CREATE UNIQUE INDEX IF NOT EXISTS "payment_scores_businessId_key" ON "payment_scores"("businessId");
CREATE UNIQUE INDEX IF NOT EXISTS "payment_consents_businessId_key" ON "payment_consents"("businessId");

CREATE INDEX IF NOT EXISTS "procurement_rfqs_buyerBusinessId_idx" ON "procurement_rfqs"("buyerBusinessId");
CREATE INDEX IF NOT EXISTS "procurement_rfqs_status_idx" ON "procurement_rfqs"("status");
CREATE INDEX IF NOT EXISTS "procurement_rfqs_category_idx" ON "procurement_rfqs"("category");

CREATE INDEX IF NOT EXISTS "procurement_quotations_rfqId_idx" ON "procurement_quotations"("rfqId");
CREATE INDEX IF NOT EXISTS "procurement_quotations_supplierId_idx" ON "procurement_quotations"("supplierId");
CREATE INDEX IF NOT EXISTS "procurement_quotations_supplierBusinessId_idx" ON "procurement_quotations"("supplierBusinessId");

CREATE INDEX IF NOT EXISTS "procurement_orders_rfqId_idx" ON "procurement_orders"("rfqId");
CREATE INDEX IF NOT EXISTS "procurement_orders_buyerBusinessId_idx" ON "procurement_orders"("buyerBusinessId");
CREATE INDEX IF NOT EXISTS "procurement_orders_supplierBusinessId_idx" ON "procurement_orders"("supplierBusinessId");

CREATE INDEX IF NOT EXISTS "supplier_warehouses_supplierProfileId_idx" ON "supplier_warehouses"("supplierProfileId");
CREATE INDEX IF NOT EXISTS "supplier_warehouses_district_state_idx" ON "supplier_warehouses"("district", "state");

CREATE INDEX IF NOT EXISTS "supplier_service_areas_supplierProfileId_idx" ON "supplier_service_areas"("supplierProfileId");
CREATE INDEX IF NOT EXISTS "supplier_service_areas_state_idx" ON "supplier_service_areas"("state");

CREATE INDEX IF NOT EXISTS "saved_suppliers_buyerBusinessId_idx" ON "saved_suppliers"("buyerBusinessId");

CREATE INDEX IF NOT EXISTS "supplier_rfq_matches_rfqId_idx" ON "supplier_rfq_matches"("rfqId");
CREATE INDEX IF NOT EXISTS "supplier_rfq_matches_supplierBusinessId_idx" ON "supplier_rfq_matches"("supplierBusinessId");

CREATE INDEX IF NOT EXISTS "commercial_invoices_buyerBusinessId_idx" ON "commercial_invoices"("buyerBusinessId");
CREATE INDEX IF NOT EXISTS "commercial_invoices_supplierBusinessId_idx" ON "commercial_invoices"("supplierBusinessId");
CREATE INDEX IF NOT EXISTS "commercial_invoices_purchaseOrderId_idx" ON "commercial_invoices"("purchaseOrderId");
CREATE INDEX IF NOT EXISTS "commercial_invoices_status_idx" ON "commercial_invoices"("status");
CREATE INDEX IF NOT EXISTS "commercial_invoices_contractualDueDate_idx" ON "commercial_invoices"("contractualDueDate");
CREATE INDEX IF NOT EXISTS "commercial_invoices_invoiceNumber_idx" ON "commercial_invoices"("invoiceNumber");

CREATE INDEX IF NOT EXISTS "payment_ledger_entries_invoiceId_idx" ON "payment_ledger_entries"("invoiceId");
CREATE INDEX IF NOT EXISTS "payment_ledger_entries_payerBusinessId_idx" ON "payment_ledger_entries"("payerBusinessId");
CREATE INDEX IF NOT EXISTS "payment_ledger_entries_payeeBusinessId_idx" ON "payment_ledger_entries"("payeeBusinessId");
CREATE INDEX IF NOT EXISTS "payment_ledger_entries_status_idx" ON "payment_ledger_entries"("status");
CREATE INDEX IF NOT EXISTS "payment_ledger_entries_utrNumber_idx" ON "payment_ledger_entries"("utrNumber");

CREATE INDEX IF NOT EXISTS "payment_schedule_instalments_invoiceId_idx" ON "payment_schedule_instalments"("invoiceId");
CREATE INDEX IF NOT EXISTS "payment_schedule_instalments_dueDate_idx" ON "payment_schedule_instalments"("dueDate");
CREATE INDEX IF NOT EXISTS "payment_schedule_instalments_status_idx" ON "payment_schedule_instalments"("status");

CREATE INDEX IF NOT EXISTS "payment_verification_records_invoiceId_idx" ON "payment_verification_records"("invoiceId");
CREATE INDEX IF NOT EXISTS "payment_verification_records_paymentEntryId_idx" ON "payment_verification_records"("paymentEntryId");

CREATE INDEX IF NOT EXISTS "payment_disputes_invoiceId_idx" ON "payment_disputes"("invoiceId");
CREATE INDEX IF NOT EXISTS "payment_disputes_disputedByBusinessId_idx" ON "payment_disputes"("disputedByBusinessId");
CREATE INDEX IF NOT EXISTS "payment_disputes_counterpartyBusinessId_idx" ON "payment_disputes"("counterpartyBusinessId");
CREATE INDEX IF NOT EXISTS "payment_disputes_status_idx" ON "payment_disputes"("status");

CREATE INDEX IF NOT EXISTS "payment_scores_buyerScore_idx" ON "payment_scores"("buyerScore");
CREATE INDEX IF NOT EXISTS "payment_scores_supplierScore_idx" ON "payment_scores"("supplierScore");
CREATE INDEX IF NOT EXISTS "payment_scores_buyerClassification_idx" ON "payment_scores"("buyerClassification");

CREATE INDEX IF NOT EXISTS "payment_score_snapshots_scoreId_idx" ON "payment_score_snapshots"("scoreId");
CREATE INDEX IF NOT EXISTS "payment_score_snapshots_businessId_idx" ON "payment_score_snapshots"("businessId");
CREATE INDEX IF NOT EXISTS "payment_score_snapshots_snapshotDate_idx" ON "payment_score_snapshots"("snapshotDate");

CREATE INDEX IF NOT EXISTS "payment_audit_logs_invoiceId_idx" ON "payment_audit_logs"("invoiceId");
CREATE INDEX IF NOT EXISTS "payment_audit_logs_businessId_idx" ON "payment_audit_logs"("businessId");
CREATE INDEX IF NOT EXISTS "payment_audit_logs_actorUserId_idx" ON "payment_audit_logs"("actorUserId");
CREATE INDEX IF NOT EXISTS "payment_audit_logs_action_idx" ON "payment_audit_logs"("action");

CREATE INDEX IF NOT EXISTS "payment_reminders_invoiceId_idx" ON "payment_reminders"("invoiceId");
CREATE INDEX IF NOT EXISTS "payment_reminders_recipientUserId_idx" ON "payment_reminders"("recipientUserId");
CREATE INDEX IF NOT EXISTS "payment_reminders_status_scheduledFor_idx" ON "payment_reminders"("status", "scheduledFor");

-- ============================================================
-- FOREIGN KEY CONSTRAINTS (SAFE ALTER TABLE IF NOT EXISTS)
-- ============================================================

DO $$ BEGIN
    ALTER TABLE "procurement_rfqs" ADD CONSTRAINT "procurement_rfqs_buyerBusinessId_fkey" FOREIGN KEY ("buyerBusinessId") REFERENCES "businesses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "procurement_quotations" ADD CONSTRAINT "procurement_quotations_rfqId_fkey" FOREIGN KEY ("rfqId") REFERENCES "procurement_rfqs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "procurement_quotations" ADD CONSTRAINT "procurement_quotations_supplierBusinessId_fkey" FOREIGN KEY ("supplierBusinessId") REFERENCES "businesses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "procurement_orders" ADD CONSTRAINT "procurement_orders_rfqId_fkey" FOREIGN KEY ("rfqId") REFERENCES "procurement_rfqs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "procurement_orders" ADD CONSTRAINT "procurement_orders_buyerBusinessId_fkey" FOREIGN KEY ("buyerBusinessId") REFERENCES "businesses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "procurement_orders" ADD CONSTRAINT "procurement_orders_supplierBusinessId_fkey" FOREIGN KEY ("supplierBusinessId") REFERENCES "businesses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "supplier_warehouses" ADD CONSTRAINT "supplier_warehouses_supplierProfileId_fkey" FOREIGN KEY ("supplierProfileId") REFERENCES "supplier_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "supplier_service_areas" ADD CONSTRAINT "supplier_service_areas_supplierProfileId_fkey" FOREIGN KEY ("supplierProfileId") REFERENCES "supplier_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "supplier_performances" ADD CONSTRAINT "supplier_performances_supplierProfileId_fkey" FOREIGN KEY ("supplierProfileId") REFERENCES "supplier_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "saved_suppliers" ADD CONSTRAINT "saved_suppliers_buyerBusinessId_fkey" FOREIGN KEY ("buyerBusinessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "saved_suppliers" ADD CONSTRAINT "saved_suppliers_supplierBusinessId_fkey" FOREIGN KEY ("supplierBusinessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "supplier_rfq_matches" ADD CONSTRAINT "supplier_rfq_matches_rfqId_fkey" FOREIGN KEY ("rfqId") REFERENCES "procurement_rfqs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "supplier_rfq_matches" ADD CONSTRAINT "supplier_rfq_matches_supplierBusinessId_fkey" FOREIGN KEY ("supplierBusinessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "commercial_invoices" ADD CONSTRAINT "commercial_invoices_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "procurement_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "commercial_invoices" ADD CONSTRAINT "commercial_invoices_buyerBusinessId_fkey" FOREIGN KEY ("buyerBusinessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "commercial_invoices" ADD CONSTRAINT "commercial_invoices_supplierBusinessId_fkey" FOREIGN KEY ("supplierBusinessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "commercial_invoices" ADD CONSTRAINT "commercial_invoices_issuerUserId_fkey" FOREIGN KEY ("issuerUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "payment_ledger_entries" ADD CONSTRAINT "payment_ledger_entries_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "commercial_invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "payment_schedule_instalments" ADD CONSTRAINT "payment_schedule_instalments_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "commercial_invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "payment_verification_records" ADD CONSTRAINT "payment_verification_records_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "commercial_invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "payment_verification_records" ADD CONSTRAINT "payment_verification_records_paymentEntryId_fkey" FOREIGN KEY ("paymentEntryId") REFERENCES "payment_ledger_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "payment_disputes" ADD CONSTRAINT "payment_disputes_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "commercial_invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "payment_disputes" ADD CONSTRAINT "payment_disputes_disputedByBusinessId_fkey" FOREIGN KEY ("disputedByBusinessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "payment_disputes" ADD CONSTRAINT "payment_disputes_counterpartyBusinessId_fkey" FOREIGN KEY ("counterpartyBusinessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "payment_scores" ADD CONSTRAINT "payment_scores_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "payment_score_snapshots" ADD CONSTRAINT "payment_score_snapshots_scoreId_fkey" FOREIGN KEY ("scoreId") REFERENCES "payment_scores"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "payment_audit_logs" ADD CONSTRAINT "payment_audit_logs_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "commercial_invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "payment_audit_logs" ADD CONSTRAINT "payment_audit_logs_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payment_ledger_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "payment_reminders" ADD CONSTRAINT "payment_reminders_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "commercial_invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "payment_consents" ADD CONSTRAINT "payment_consents_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
