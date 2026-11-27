-- PROVENTA — Construction Procurement & Seven Intelligence Features
-- Strictly Additive Migration (Zero DROP, Zero ALTER existing tables, Zero data loss)
-- Prepared for verified isolated PostgreSQL 16 staging deployment ONLY.

-- 1. Enums
DO $$ BEGIN CREATE TYPE "ConstructionProjectStatus" AS ENUM ('PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "ProcurementRequirementStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'PUBLISHED', 'CLOSED', 'CANCELLED'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "ApprovalDecisionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'RETURNED_FOR_REVISION'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "ProcurementAwardStatus" AS ENUM ('ACTIVE', 'AMENDED', 'CANCELLED'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "DeliveryFulfilmentStatus" AS ENUM ('AWAITING_SUPPLIER_CONFIRMATION', 'CONFIRMED', 'PROCESSING', 'READY_FOR_DISPATCH', 'DISPATCHED', 'IN_TRANSIT', 'PARTIALLY_DELIVERED', 'DELIVERED', 'DELIVERY_DISCREPANCY', 'REJECTED', 'CANCELLED'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "ThreeWayMatchStatus" AS ENUM ('MATCHED', 'QUANTITY_DISCREPANCY', 'RATE_DISCREPANCY', 'TAX_DISCREPANCY', 'MISSING_GRN', 'ON_HOLD'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "ProcurementDisputeType" AS ENUM ('QUALITY_MISMATCH', 'QUANTITY_SHORTAGE', 'LATE_DELIVERY', 'INCORRECT_INVOICE', 'DAMAGED_MATERIAL', 'PAYMENT_DISPUTE', 'SUPPLIER_MISREPRESENTATION'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "ProcurementDisputeStatus" AS ENUM ('OPEN', 'UNDER_REVIEW', 'AWAITING_EVIDENCE', 'RESOLVED', 'CLOSED'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "SavingsClassification" AS ENUM ('POTENTIAL', 'REALISED'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "LeakageAlertCategory" AS ENUM ('POTENTIAL_COST_LEAKAGE', 'DUPLICATE_TRANSACTION_RISK', 'QUANTITY_DISCREPANCY', 'PRICE_ANOMALY', 'APPROVAL_POLICY_VIOLATION', 'MISSING_DOCUMENTATION', 'REQUIRES_HUMAN_REVIEW'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "LeakageAlertSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "LeakageInvestigationStatus" AS ENUM ('OPEN', 'UNDER_INVESTIGATION', 'CONFIRMED_LEAKAGE', 'RESOLVED', 'DISMISSED'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "PriceObservationSource" AS ENUM ('SUPPLIER_QUOTATION', 'VERIFIED_PO', 'VERIFIED_INVOICE', 'PUBLIC_MARKET_REF', 'MANUAL_OBSERVATION', 'IMPORTED_DATASET'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "TimingConfidenceLevel" AS ENUM ('HIGH', 'MODERATE', 'LOW', 'INSUFFICIENT_DATA'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "AutomationExecutionStatus" AS ENUM ('DRAFT_AWAITING_CONFIRMATION', 'CONFIRMED_QUEUED', 'COMPLETED', 'FAILED', 'CANCELLED'); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. Construction Projects & Material Taxonomy
CREATE TABLE IF NOT EXISTS "construction_projects" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "projectCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL DEFAULT 'Ahmedabad',
    "state" TEXT NOT NULL DEFAULT 'Gujarat',
    "projectType" TEXT NOT NULL,
    "developerOrContractor" TEXT NOT NULL,
    "projectManagerUserId" TEXT,
    "projectManagerName" TEXT,
    "startDate" TIMESTAMP(3),
    "expectedCompletionDate" TIMESTAMP(3),
    "status" "ConstructionProjectStatus" NOT NULL DEFAULT 'ACTIVE',
    "approvedBudgetPaise" BIGINT NOT NULL DEFAULT 0,
    "materialBudgetPaise" BIGINT NOT NULL DEFAULT 0,
    "createdByUserId" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "construction_projects_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "construction_projects_organisationId_projectCode_key" ON "construction_projects"("organisationId", "projectCode");
CREATE INDEX IF NOT EXISTS "construction_projects_organisationId_idx" ON "construction_projects"("organisationId");
CREATE INDEX IF NOT EXISTS "construction_projects_status_idx" ON "construction_projects"("status");

CREATE TABLE IF NOT EXISTS "material_categories" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "division" TEXT NOT NULL,
    "description" TEXT,
    "requiredSpecSchemaJson" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "material_categories_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "material_categories_slug_key" ON "material_categories"("slug");
CREATE INDEX IF NOT EXISTS "material_categories_division_idx" ON "material_categories"("division");

CREATE TABLE IF NOT EXISTS "material_products" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "skuCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "standardCode" TEXT,
    "defaultUnit" TEXT NOT NULL,
    "specificationsJson" JSONB NOT NULL,
    "gstRatePercent" INTEGER NOT NULL DEFAULT 18,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "material_products_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "material_products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "material_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "material_products_skuCode_key" ON "material_products"("skuCode");
CREATE INDEX IF NOT EXISTS "material_products_categoryId_idx" ON "material_products"("categoryId");

-- 3. Requirements, Approvals, Awards, Deliveries, GRN, Three-Way Match & Disputes
CREATE TABLE IF NOT EXISTS "procurement_requirements" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "categoryId" TEXT,
    "requirementCode" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "materialName" TEXT NOT NULL,
    "specificationsJson" JSONB NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "preferredBrands" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "acceptableAlternatives" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "deliveryLocation" TEXT NOT NULL,
    "requiredDeliveryDate" TIMESTAMP(3) NOT NULL,
    "deliveryScheduleNotes" TEXT,
    "budgetPaise" BIGINT,
    "budgetDisclosed" BOOLEAN NOT NULL DEFAULT false,
    "paymentTerms" TEXT,
    "specialInstructions" TEXT,
    "boqDocumentKey" TEXT,
    "status" "ProcurementRequirementStatus" NOT NULL DEFAULT 'DRAFT',
    "linkedRfqId" TEXT,
    "createdByUserId" TEXT NOT NULL,
    "approvedByUserId" TEXT,
    "approvedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "procurement_requirements_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "procurement_requirements_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "construction_projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "procurement_requirements_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "material_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "procurement_requirements_organisationId_requirementCode_key" ON "procurement_requirements"("organisationId", "requirementCode");
CREATE INDEX IF NOT EXISTS "procurement_requirements_organisationId_status_idx" ON "procurement_requirements"("organisationId", "status");
CREATE INDEX IF NOT EXISTS "procurement_requirements_projectId_idx" ON "procurement_requirements"("projectId");

CREATE TABLE IF NOT EXISTS "procurement_approval_workflows" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "minAmountPaise" BIGINT NOT NULL DEFAULT 0,
    "maxAmountPaise" BIGINT,
    "requiredRoles" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "enforceSeparation" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "procurement_approval_workflows_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "procurement_approval_workflows_organisationId_isActive_idx" ON "procurement_approval_workflows"("organisationId", "isActive");

CREATE TABLE IF NOT EXISTS "procurement_approval_records" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "workflowId" TEXT,
    "rfqId" TEXT NOT NULL,
    "quotationId" TEXT NOT NULL,
    "recommendedAmountPaise" BIGINT NOT NULL,
    "requestedByUserId" TEXT NOT NULL,
    "approverUserId" TEXT,
    "approverRole" TEXT NOT NULL,
    "levelOrder" INTEGER NOT NULL DEFAULT 1,
    "status" "ApprovalDecisionStatus" NOT NULL DEFAULT 'PENDING',
    "decisionReason" TEXT,
    "decidedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "procurement_approval_records_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "procurement_approval_records_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "procurement_approval_workflows"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "procurement_approval_records_organisationId_status_idx" ON "procurement_approval_records"("organisationId", "status");
CREATE INDEX IF NOT EXISTS "procurement_approval_records_rfqId_quotationId_idx" ON "procurement_approval_records"("rfqId", "quotationId");

CREATE TABLE IF NOT EXISTS "procurement_awards" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "rfqId" TEXT NOT NULL,
    "quotationId" TEXT NOT NULL,
    "supplierBusinessId" TEXT NOT NULL,
    "purchaseOrderId" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "awardedAmountPaise" BIGINT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "awardedByUserId" TEXT NOT NULL,
    "approvedByUserId" TEXT,
    "technicalEvalPassed" BOOLEAN NOT NULL DEFAULT true,
    "status" "ProcurementAwardStatus" NOT NULL DEFAULT 'ACTIVE',
    "immutableSnapshotJson" JSONB NOT NULL,
    "amendmentsJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "procurement_awards_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "procurement_awards_rfqId_key" ON "procurement_awards"("rfqId");
CREATE UNIQUE INDEX IF NOT EXISTS "procurement_awards_purchaseOrderId_key" ON "procurement_awards"("purchaseOrderId");
CREATE UNIQUE INDEX IF NOT EXISTS "procurement_awards_idempotencyKey_key" ON "procurement_awards"("idempotencyKey");
CREATE INDEX IF NOT EXISTS "procurement_awards_organisationId_idx" ON "procurement_awards"("organisationId");
CREATE INDEX IF NOT EXISTS "procurement_awards_supplierBusinessId_idx" ON "procurement_awards"("supplierBusinessId");

CREATE TABLE IF NOT EXISTS "procurement_deliveries" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "purchaseOrderId" TEXT NOT NULL,
    "supplierBusinessId" TEXT NOT NULL,
    "deliveryCode" TEXT NOT NULL,
    "status" "DeliveryFulfilmentStatus" NOT NULL DEFAULT 'AWAITING_SUPPLIER_CONFIRMATION',
    "dispatchDate" TIMESTAMP(3),
    "expectedDeliveryDate" TIMESTAMP(3),
    "actualDeliveryDate" TIMESTAMP(3),
    "vehicleNumber" TEXT,
    "transporterName" TEXT,
    "ewayBillRef" TEXT,
    "deliveryChallanRef" TEXT,
    "orderedQuantity" DOUBLE PRECISION NOT NULL,
    "dispatchedQuantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "receivedQuantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unit" TEXT NOT NULL,
    "receivingEmployeeName" TEXT,
    "discrepancyNotes" TEXT,
    "supportingDocumentKeys" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "procurement_deliveries_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "procurement_deliveries_deliveryCode_key" ON "procurement_deliveries"("deliveryCode");
CREATE INDEX IF NOT EXISTS "procurement_deliveries_organisationId_purchaseOrderId_idx" ON "procurement_deliveries"("organisationId", "purchaseOrderId");
CREATE INDEX IF NOT EXISTS "procurement_deliveries_supplierBusinessId_idx" ON "procurement_deliveries"("supplierBusinessId");

CREATE TABLE IF NOT EXISTS "goods_receipts" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "deliveryId" TEXT NOT NULL,
    "purchaseOrderId" TEXT NOT NULL,
    "grnNumber" TEXT NOT NULL,
    "receivedQuantity" DOUBLE PRECISION NOT NULL,
    "acceptedQuantity" DOUBLE PRECISION NOT NULL,
    "rejectedQuantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unit" TEXT NOT NULL,
    "qualityStatus" TEXT NOT NULL DEFAULT 'PASSED',
    "inspectionNotes" TEXT,
    "receivedByUserId" TEXT NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "goods_receipts_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "goods_receipts_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "procurement_deliveries"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "goods_receipts_grnNumber_key" ON "goods_receipts"("grnNumber");
CREATE INDEX IF NOT EXISTS "goods_receipts_organisationId_purchaseOrderId_idx" ON "goods_receipts"("organisationId", "purchaseOrderId");

CREATE TABLE IF NOT EXISTS "three_way_match_records" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "purchaseOrderId" TEXT NOT NULL,
    "goodsReceiptId" TEXT,
    "invoiceNumber" TEXT NOT NULL,
    "supplierGstin" TEXT NOT NULL,
    "poTotalPaise" BIGINT NOT NULL,
    "grnValuePaise" BIGINT NOT NULL,
    "invoiceTotalPaise" BIGINT NOT NULL,
    "taxAmountPaise" BIGINT NOT NULL DEFAULT 0,
    "variancePaise" BIGINT NOT NULL DEFAULT 0,
    "status" "ThreeWayMatchStatus" NOT NULL,
    "discrepancyReasons" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "verifiedByUserId" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "three_way_match_records_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "three_way_match_records_organisationId_purchaseOrderId_invoiceNumber_key" ON "three_way_match_records"("organisationId", "purchaseOrderId", "invoiceNumber");
CREATE INDEX IF NOT EXISTS "three_way_match_records_organisationId_status_idx" ON "three_way_match_records"("organisationId", "status");

CREATE TABLE IF NOT EXISTS "procurement_disputes" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "purchaseOrderId" TEXT NOT NULL,
    "deliveryId" TEXT,
    "invoiceNumber" TEXT,
    "disputeCode" TEXT NOT NULL,
    "disputeType" "ProcurementDisputeType" NOT NULL,
    "status" "ProcurementDisputeStatus" NOT NULL DEFAULT 'OPEN',
    "summary" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "evidenceDocumentKeys" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "raisedByUserId" TEXT NOT NULL,
    "assignedReviewerUserId" TEXT,
    "resolutionNotes" TEXT,
    "closureReason" TEXT,
    "immutableHistoryJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "procurement_disputes_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "procurement_disputes_disputeCode_key" ON "procurement_disputes"("disputeCode");
CREATE INDEX IF NOT EXISTS "procurement_disputes_organisationId_status_idx" ON "procurement_disputes"("organisationId", "status");
CREATE INDEX IF NOT EXISTS "procurement_disputes_purchaseOrderId_idx" ON "procurement_disputes"("purchaseOrderId");

CREATE TABLE IF NOT EXISTS "procurement_benchmarks" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT,
    "materialCategorySlug" TEXT NOT NULL,
    "productSpecification" TEXT NOT NULL,
    "geography" TEXT NOT NULL DEFAULT 'Ahmedabad & Gandhinagar',
    "unit" TEXT NOT NULL,
    "benchmarkRatePaise" BIGINT NOT NULL,
    "dataSource" TEXT NOT NULL,
    "observationDate" TIMESTAMP(3) NOT NULL,
    "sampleSize" INTEGER NOT NULL,
    "limitationsDisclosure" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "procurement_benchmarks_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "procurement_benchmarks_materialCategorySlug_geography_idx" ON "procurement_benchmarks"("materialCategorySlug", "geography");

CREATE TABLE IF NOT EXISTS "procurement_savings_records" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "projectId" TEXT,
    "rfqId" TEXT NOT NULL,
    "purchaseOrderId" TEXT,
    "goodsReceiptId" TEXT,
    "invoiceNumber" TEXT,
    "classification" "SavingsClassification" NOT NULL,
    "materialName" TEXT NOT NULL,
    "specificationSummary" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "baselineUnitPaise" BIGINT NOT NULL,
    "comparedUnitPaise" BIGINT NOT NULL,
    "savingsTotalPaise" BIGINT NOT NULL,
    "benchmarkSource" TEXT NOT NULL,
    "limitationsNote" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "procurement_savings_records_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "procurement_savings_records_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "construction_projects"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "procurement_savings_records_organisationId_classification_idx" ON "procurement_savings_records"("organisationId", "classification");
CREATE INDEX IF NOT EXISTS "procurement_savings_records_projectId_idx" ON "procurement_savings_records"("projectId");

-- 4. Seven Core Intelligence Models
CREATE TABLE IF NOT EXISTS "procurement_leakage_alerts" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "alertCode" TEXT NOT NULL,
    "category" "LeakageAlertCategory" NOT NULL,
    "severity" "LeakageAlertSeverity" NOT NULL,
    "projectId" TEXT,
    "materialName" TEXT NOT NULL,
    "supplierBusinessId" TEXT,
    "supplierName" TEXT,
    "transactionType" TEXT NOT NULL,
    "transactionRef" TEXT NOT NULL,
    "detectedAmountPaise" BIGINT NOT NULL,
    "baselineAmountPaise" BIGINT,
    "potentialExposurePaise" BIGINT NOT NULL DEFAULT 0,
    "confirmedLeakagePaise" BIGINT NOT NULL DEFAULT 0,
    "recoveredSavingsPaise" BIGINT NOT NULL DEFAULT 0,
    "percentageDeviation" DOUBLE PRECISION,
    "explanation" TEXT NOT NULL,
    "supportingEvidenceJson" JSONB NOT NULL,
    "status" "LeakageInvestigationStatus" NOT NULL DEFAULT 'OPEN',
    "assignedReviewerUserId" TEXT,
    "resolutionNotes" TEXT,
    "correctiveAction" TEXT,
    "dismissalReason" TEXT,
    "auditTrailJson" JSONB NOT NULL,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "procurement_leakage_alerts_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "procurement_leakage_alerts_alertCode_key" ON "procurement_leakage_alerts"("alertCode");
CREATE INDEX IF NOT EXISTS "procurement_leakage_alerts_organisationId_status_idx" ON "procurement_leakage_alerts"("organisationId", "status");
CREATE INDEX IF NOT EXISTS "procurement_leakage_alerts_organisationId_category_idx" ON "procurement_leakage_alerts"("organisationId", "category");
CREATE INDEX IF NOT EXISTS "procurement_leakage_alerts_projectId_idx" ON "procurement_leakage_alerts"("projectId");

CREATE TABLE IF NOT EXISTS "material_price_observations" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT,
    "materialCategorySlug" TEXT NOT NULL,
    "materialName" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "specificationsJson" JSONB NOT NULL,
    "unit" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "supplierBusinessId" TEXT,
    "supplierName" TEXT,
    "city" TEXT NOT NULL DEFAULT 'Ahmedabad',
    "locality" TEXT,
    "basePriceUnitPaise" BIGINT NOT NULL,
    "gstRatePercent" INTEGER NOT NULL DEFAULT 18,
    "gstUnitPaise" BIGINT NOT NULL DEFAULT 0,
    "freightUnitPaise" BIGINT NOT NULL DEFAULT 0,
    "loadingUnloadingPaise" BIGINT NOT NULL DEFAULT 0,
    "otherChargesUnitPaise" BIGINT NOT NULL DEFAULT 0,
    "landedPriceUnitPaise" BIGINT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "observationDate" TIMESTAMP(3) NOT NULL,
    "validUntil" TIMESTAMP(3),
    "sourceType" "PriceObservationSource" NOT NULL,
    "verificationStatus" TEXT NOT NULL DEFAULT 'VERIFIED',
    "supportingDocumentRef" TEXT,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "material_price_observations_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "material_price_observations_materialCategorySlug_grade_unit_idx" ON "material_price_observations"("materialCategorySlug", "grade", "unit");
CREATE INDEX IF NOT EXISTS "material_price_observations_organisationId_observationDate_idx" ON "material_price_observations"("organisationId", "observationDate");
CREATE INDEX IF NOT EXISTS "material_price_observations_city_idx" ON "material_price_observations"("city");

CREATE TABLE IF NOT EXISTS "project_milestones" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phaseCode" TEXT,
    "plannedStartDate" TIMESTAMP(3) NOT NULL,
    "plannedEndDate" TIMESTAMP(3) NOT NULL,
    "materialCategorySlug" TEXT NOT NULL,
    "materialName" TEXT NOT NULL,
    "boqPlannedQuantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "leadTimeDays" INTEGER NOT NULL DEFAULT 14,
    "safetyStockQuantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "project_milestones_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "project_milestones_organisationId_projectId_idx" ON "project_milestones"("organisationId", "projectId");

CREATE TABLE IF NOT EXISTS "project_inventory_records" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "materialCategorySlug" TEXT NOT NULL,
    "materialName" TEXT NOT NULL,
    "specificationSummary" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "availableQuantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reservedQuantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reorderThresholdQuantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastCountedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "project_inventory_records_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "project_inventory_records_organisationId_projectId_materialCategorySlug_materialName_key" ON "project_inventory_records"("organisationId", "projectId", "materialCategorySlug", "materialName");
CREATE INDEX IF NOT EXISTS "project_inventory_records_organisationId_projectId_idx" ON "project_inventory_records"("organisationId", "projectId");

CREATE TABLE IF NOT EXISTS "supplier_reliability_configs" (
    "id" TEXT NOT NULL,
    "configKey" TEXT NOT NULL DEFAULT 'DEFAULT',
    "deliveryReliabilityPct" INTEGER NOT NULL DEFAULT 25,
    "qualityPerformancePct" INTEGER NOT NULL DEFAULT 25,
    "quantityFulfilmentPct" INTEGER NOT NULL DEFAULT 15,
    "quotationResponsePct" INTEGER NOT NULL DEFAULT 10,
    "commercialAccuracyPct" INTEGER NOT NULL DEFAULT 10,
    "disputePerformancePct" INTEGER NOT NULL DEFAULT 10,
    "documentationPct" INTEGER NOT NULL DEFAULT 5,
    "minSampleTransactions" INTEGER NOT NULL DEFAULT 3,
    "updatedByUserId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "supplier_reliability_configs_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "supplier_reliability_configs_configKey_key" ON "supplier_reliability_configs"("configKey");

CREATE TABLE IF NOT EXISTS "supplier_reliability_snapshots" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT,
    "supplierBusinessId" TEXT NOT NULL,
    "supplierName" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "completedTransactions" INTEGER NOT NULL DEFAULT 0,
    "hasSufficientData" BOOLEAN NOT NULL DEFAULT false,
    "compositeScore" DOUBLE PRECISION,
    "dimensionScoresJson" JSONB NOT NULL,
    "methodologyVersion" TEXT NOT NULL DEFAULT 'PROVENTA-REL-V1',
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "supplier_reliability_snapshots_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "supplier_reliability_snapshots_supplierBusinessId_idx" ON "supplier_reliability_snapshots"("supplierBusinessId");
CREATE INDEX IF NOT EXISTS "supplier_reliability_snapshots_organisationId_supplierBusinessId_idx" ON "supplier_reliability_snapshots"("organisationId", "supplierBusinessId");

CREATE TABLE IF NOT EXISTS "supplier_score_disputes" (
    "id" TEXT NOT NULL,
    "supplierBusinessId" TEXT NOT NULL,
    "submittedByUserId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "supportingEvidenceRef" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "adminReviewNotes" TEXT,
    "reviewedByAdminId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "supplier_score_disputes_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "supplier_score_disputes_supplierBusinessId_status_idx" ON "supplier_score_disputes"("supplierBusinessId", "status");

CREATE TABLE IF NOT EXISTS "consolidation_opportunities" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "opportunityCode" TEXT NOT NULL,
    "materialCategorySlug" TEXT NOT NULL,
    "materialName" TEXT NOT NULL,
    "specificationSignature" TEXT NOT NULL,
    "projectIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "combinedQuantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "supplierOverlapIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "compatibilityVerified" BOOLEAN NOT NULL DEFAULT false,
    "incompatibilityReasons" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "status" TEXT NOT NULL DEFAULT 'IDENTIFIED',
    "linkedRfqId" TEXT,
    "createdByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "consolidation_opportunities_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "consolidation_opportunities_opportunityCode_key" ON "consolidation_opportunities"("organisationId", "opportunityCode");
CREATE INDEX IF NOT EXISTS "consolidation_opportunities_organisationId_status_idx" ON "consolidation_opportunities"("organisationId", "status");

CREATE TABLE IF NOT EXISTS "procurement_automation_executions" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "workflowType" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "initiatedByUserId" TEXT NOT NULL,
    "requiresConfirmation" BOOLEAN NOT NULL DEFAULT true,
    "confirmedByUserId" TEXT,
    "confirmedAt" TIMESTAMP(3),
    "status" "AutomationExecutionStatus" NOT NULL DEFAULT 'DRAFT_AWAITING_CONFIRMATION',
    "inputPayloadJson" JSONB NOT NULL,
    "outputSummaryJson" JSONB,
    "errorMessage" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "auditTrailJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "procurement_automation_executions_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "procurement_automation_executions_idempotencyKey_key" ON "procurement_automation_executions"("idempotencyKey");
CREATE INDEX IF NOT EXISTS "procurement_automation_executions_organisationId_workflowType_status_idx" ON "procurement_automation_executions"("organisationId", "workflowType", "status");
