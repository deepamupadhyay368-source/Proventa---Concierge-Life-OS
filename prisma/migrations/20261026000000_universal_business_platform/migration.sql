-- PROVENTA — Universal Business Discovery, Digital Storefront & Customer Enquiry Marketplace
-- Forward-only non-destructive migration preserving all existing tables and history.

-- 1. Extend existing enums safely
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'MODERATOR';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'BUSINESS_OWNER';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'BUSINESS_MEMBER';

ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'BUSINESS_APPROVED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'BUSINESS_MODERATION_UPDATE';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'ENQUIRY_MATCHED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'QUOTATION_RECEIVED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'QUOTATION_STATUS_UPDATED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'ENQUIRY_STATUS_UPDATED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'SUBSCRIPTION_UPDATED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'PLATFORM_ANNOUNCEMENT';

-- 2. Create Universal Business Platform Enums
DO $$ BEGIN
    CREATE TYPE "BusinessType" AS ENUM ('PRODUCT', 'SERVICE', 'HYBRID');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "BusinessStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'SUSPENDED', 'ARCHIVED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "BusinessOperatingStatus" AS ENUM ('OPEN', 'ACCEPTING_ENQUIRIES', 'TEMPORARILY_CLOSED', 'BY_APPOINTMENT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "VerificationLevel" AS ENUM ('UNVERIFIED', 'SELF_REPORTED', 'CONTACT_VERIFIED', 'DOCUMENT_REVIEWED', 'VERIFIED_BUSINESS');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "BusinessMemberRole" AS ENUM ('OWNER', 'MANAGER', 'RESPONDER', 'VIEWER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "ListingType" AS ENUM ('PRODUCT', 'SERVICE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "ListingStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED', 'SUSPENDED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "PriceDisplayType" AS ENUM ('FIXED_PRICE', 'INDICATIVE_PRICE', 'PRICE_ON_REQUEST', 'QUOTE_REQUIRED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "EnquiryStatus" AS ENUM ('DRAFT', 'OPEN', 'MATCHING', 'RESPONSES_RECEIVED', 'SHORTLISTED', 'ACCEPTED', 'CLOSED', 'CANCELLED', 'EXPIRED', 'FLAGGED_FOR_REVIEW');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "MatchStatus" AS ENUM ('MATCHED', 'NOTIFIED', 'VIEWED', 'RESPONDED', 'DECLINED', 'EXPIRED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "QuotationStatus" AS ENUM ('SUBMITTED', 'UPDATED', 'SHORTLISTED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "QuotationPriceType" AS ENUM ('FIXED_QUOTE', 'INDICATIVE_ESTIMATE', 'RANGE_ESTIMATE', 'INSPECTION_REQUIRED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "SubscriptionPlanTier" AS ENUM ('FREE', 'PRO', 'PREMIUM');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'PAST_DUE', 'CANCELLED', 'EXPIRED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "ReportTargetType" AS ENUM ('BUSINESS', 'LISTING', 'ENQUIRY', 'QUOTATION', 'REVIEW');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "ReportStatus" AS ENUM ('OPEN', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Create Marketplace Tables
CREATE TABLE IF NOT EXISTS "marketplace_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "parentId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "attributeSchema" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "marketplace_categories_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "marketplace_categories_slug_key" ON "marketplace_categories"("slug");
CREATE INDEX IF NOT EXISTS "marketplace_categories_slug_idx" ON "marketplace_categories"("slug");
CREATE INDEX IF NOT EXISTS "marketplace_categories_parentId_idx" ON "marketplace_categories"("parentId");
CREATE INDEX IF NOT EXISTS "marketplace_categories_active_sortOrder_idx" ON "marketplace_categories"("active", "sortOrder");

CREATE TABLE IF NOT EXISTS "businesses" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "legalName" TEXT,
    "slug" TEXT NOT NULL,
    "tagline" TEXT,
    "shortDescription" TEXT,
    "description" TEXT,
    "businessType" "BusinessType" NOT NULL DEFAULT 'HYBRID',
    "status" "BusinessStatus" NOT NULL DEFAULT 'DRAFT',
    "operatingStatus" "BusinessOperatingStatus" NOT NULL DEFAULT 'ACCEPTING_ENQUIRIES',
    "verificationLevel" "VerificationLevel" NOT NULL DEFAULT 'SELF_REPORTED',
    "primaryCategoryId" TEXT NOT NULL,
    "logoUrl" TEXT,
    "coverImageUrl" TEXT,
    "yearEstablished" INTEGER,
    "gstNumber" TEXT,
    "registrationNumber" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "whatsappNumber" TEXT,
    "website" TEXT,
    "socialLinks" JSONB,
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "area" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'Gujarat',
    "postalCode" TEXT,
    "country" TEXT NOT NULL DEFAULT 'India',
    "serviceAreas" TEXT[],
    "servesPanIndia" BOOLEAN NOT NULL DEFAULT false,
    "businessHours" JSONB,
    "highlights" TEXT[],
    "tags" TEXT[],
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "profileViews" INTEGER NOT NULL DEFAULT 0,
    "enquiryClicks" INTEGER NOT NULL DEFAULT 0,
    "contactClicks" INTEGER NOT NULL DEFAULT 0,
    "averageRating" DOUBLE PRECISION,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "moderationNote" TEXT,
    "publishedAt" TIMESTAMP(3),
    "suspendedAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "businesses_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "businesses_slug_key" ON "businesses"("slug");
CREATE INDEX IF NOT EXISTS "businesses_slug_idx" ON "businesses"("slug");
CREATE INDEX IF NOT EXISTS "businesses_ownerId_idx" ON "businesses"("ownerId");
CREATE INDEX IF NOT EXISTS "businesses_status_verificationLevel_idx" ON "businesses"("status", "verificationLevel");
CREATE INDEX IF NOT EXISTS "businesses_primaryCategoryId_status_idx" ON "businesses"("primaryCategoryId", "status");
CREATE INDEX IF NOT EXISTS "businesses_city_state_status_idx" ON "businesses"("city", "state", "status");
CREATE INDEX IF NOT EXISTS "businesses_businessType_status_idx" ON "businesses"("businessType", "status");
CREATE INDEX IF NOT EXISTS "businesses_featured_status_idx" ON "businesses"("featured", "status");

CREATE TABLE IF NOT EXISTS "business_category_assignments" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "business_category_assignments_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "business_category_assignments_businessId_categoryId_key" ON "business_category_assignments"("businessId", "categoryId");
CREATE INDEX IF NOT EXISTS "business_category_assignments_businessId_idx" ON "business_category_assignments"("businessId");
CREATE INDEX IF NOT EXISTS "business_category_assignments_categoryId_idx" ON "business_category_assignments"("categoryId");

CREATE TABLE IF NOT EXISTS "business_memberships" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "BusinessMemberRole" NOT NULL DEFAULT 'RESPONDER',
    "invitedBy" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "business_memberships_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "business_memberships_businessId_userId_key" ON "business_memberships"("businessId", "userId");
CREATE INDEX IF NOT EXISTS "business_memberships_businessId_idx" ON "business_memberships"("businessId");
CREATE INDEX IF NOT EXISTS "business_memberships_userId_idx" ON "business_memberships"("userId");

CREATE TABLE IF NOT EXISTS "business_listings" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "subcategoryId" TEXT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "shortSummary" TEXT,
    "description" TEXT NOT NULL,
    "listingType" "ListingType" NOT NULL DEFAULT 'SERVICE',
    "status" "ListingStatus" NOT NULL DEFAULT 'PUBLISHED',
    "priceDisplayType" "PriceDisplayType" NOT NULL DEFAULT 'INDICATIVE_PRICE',
    "priceAmount" INTEGER,
    "priceMaxAmount" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "priceUnit" TEXT,
    "images" TEXT[],
    "specifications" JSONB,
    "tags" TEXT[],
    "availabilityStatus" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "deliveryTimeframe" TEXT,
    "serviceAreaOverride" TEXT[],
    "ctaLabel" TEXT NOT NULL DEFAULT 'Send Enquiry',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "viewsCount" INTEGER NOT NULL DEFAULT 0,
    "enquiryCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "business_listings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "business_listings_slug_key" ON "business_listings"("slug");
CREATE INDEX IF NOT EXISTS "business_listings_businessId_status_idx" ON "business_listings"("businessId", "status");
CREATE INDEX IF NOT EXISTS "business_listings_categoryId_status_idx" ON "business_listings"("categoryId", "status");
CREATE INDEX IF NOT EXISTS "business_listings_subcategoryId_status_idx" ON "business_listings"("subcategoryId", "status");
CREATE INDEX IF NOT EXISTS "business_listings_listingType_status_idx" ON "business_listings"("listingType", "status");
CREATE INDEX IF NOT EXISTS "business_listings_slug_idx" ON "business_listings"("slug");

CREATE TABLE IF NOT EXISTS "business_media" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "title" TEXT,
    "caption" TEXT,
    "url" TEXT NOT NULL,
    "mediaType" TEXT NOT NULL DEFAULT 'IMAGE',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "business_media_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "business_media_businessId_sortOrder_idx" ON "business_media"("businessId", "sortOrder");

CREATE TABLE IF NOT EXISTS "business_verification_records" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "previousLevel" "VerificationLevel" NOT NULL,
    "newLevel" "VerificationLevel" NOT NULL,
    "method" TEXT NOT NULL,
    "documentType" TEXT,
    "documentRef" TEXT,
    "notes" TEXT,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "business_verification_records_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "business_verification_records_businessId_idx" ON "business_verification_records"("businessId");

CREATE TABLE IF NOT EXISTS "customer_enquiries" (
    "id" TEXT NOT NULL,
    "referenceCode" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "subcategoryId" TEXT,
    "targetBusinessId" TEXT,
    "targetListingId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requirementType" "BusinessType" NOT NULL DEFAULT 'HYBRID',
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'Gujarat',
    "deliveryMode" TEXT NOT NULL DEFAULT 'EITHER',
    "quantity" TEXT,
    "budgetMin" INTEGER,
    "budgetMax" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "timeline" TEXT,
    "urgency" TEXT NOT NULL DEFAULT 'STANDARD',
    "categoryAttributes" JSONB,
    "attachments" TEXT[],
    "preferredContactMethod" TEXT NOT NULL DEFAULT 'PLATFORM',
    "shareContactWithShortlistedOnly" BOOLEAN NOT NULL DEFAULT true,
    "status" "EnquiryStatus" NOT NULL DEFAULT 'OPEN',
    "matchedCount" INTEGER NOT NULL DEFAULT 0,
    "responsesCount" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "customer_enquiries_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "customer_enquiries_referenceCode_key" ON "customer_enquiries"("referenceCode");
CREATE INDEX IF NOT EXISTS "customer_enquiries_customerId_status_idx" ON "customer_enquiries"("customerId", "status");
CREATE INDEX IF NOT EXISTS "customer_enquiries_categoryId_status_idx" ON "customer_enquiries"("categoryId", "status");
CREATE INDEX IF NOT EXISTS "customer_enquiries_city_state_status_idx" ON "customer_enquiries"("city", "state", "status");
CREATE INDEX IF NOT EXISTS "customer_enquiries_status_createdAt_idx" ON "customer_enquiries"("status", "createdAt");
CREATE INDEX IF NOT EXISTS "customer_enquiries_referenceCode_idx" ON "customer_enquiries"("referenceCode");

CREATE TABLE IF NOT EXISTS "enquiry_matches" (
    "id" TEXT NOT NULL,
    "enquiryId" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "matchScore" DOUBLE PRECISION NOT NULL,
    "matchReasons" TEXT[],
    "scoreBreakdown" JSONB,
    "status" "MatchStatus" NOT NULL DEFAULT 'MATCHED',
    "notifiedAt" TIMESTAMP(3),
    "viewedAt" TIMESTAMP(3),
    "respondedAt" TIMESTAMP(3),
    "declinedAt" TIMESTAMP(3),
    "declineReason" TEXT,
    "notificationDedupeKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "enquiry_matches_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "enquiry_matches_notificationDedupeKey_key" ON "enquiry_matches"("notificationDedupeKey");
CREATE UNIQUE INDEX IF NOT EXISTS "enquiry_matches_enquiryId_businessId_key" ON "enquiry_matches"("enquiryId", "businessId");
CREATE INDEX IF NOT EXISTS "enquiry_matches_businessId_status_idx" ON "enquiry_matches"("businessId", "status");
CREATE INDEX IF NOT EXISTS "enquiry_matches_enquiryId_matchScore_idx" ON "enquiry_matches"("enquiryId", "matchScore");

CREATE TABLE IF NOT EXISTS "business_quotations" (
    "id" TEXT NOT NULL,
    "referenceCode" TEXT NOT NULL,
    "enquiryId" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "submittedById" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "detailedProposal" TEXT NOT NULL,
    "priceType" "QuotationPriceType" NOT NULL DEFAULT 'FIXED_QUOTE',
    "priceAmount" INTEGER,
    "priceMaxAmount" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "priceUnit" TEXT,
    "deliveryTimeline" TEXT NOT NULL,
    "validityDays" INTEGER NOT NULL DEFAULT 14,
    "validUntil" TIMESTAMP(3),
    "inclusions" TEXT[],
    "exclusions" TEXT,
    "termsAndAssumptions" TEXT,
    "availabilityNote" TEXT,
    "attachments" TEXT[],
    "followUpPreference" TEXT NOT NULL DEFAULT 'PLATFORM_AND_PHONE',
    "status" "QuotationStatus" NOT NULL DEFAULT 'SUBMITTED',
    "customerNote" TEXT,
    "shortlistedAt" TIMESTAMP(3),
    "acceptedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "business_quotations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "business_quotations_referenceCode_key" ON "business_quotations"("referenceCode");
CREATE UNIQUE INDEX IF NOT EXISTS "business_quotations_enquiryId_businessId_key" ON "business_quotations"("enquiryId", "businessId");
CREATE INDEX IF NOT EXISTS "business_quotations_enquiryId_status_idx" ON "business_quotations"("enquiryId", "status");
CREATE INDEX IF NOT EXISTS "business_quotations_businessId_status_idx" ON "business_quotations"("businessId", "status");
CREATE INDEX IF NOT EXISTS "business_quotations_submittedById_idx" ON "business_quotations"("submittedById");

CREATE TABLE IF NOT EXISTS "saved_businesses" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "saved_businesses_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "saved_businesses_userId_businessId_key" ON "saved_businesses"("userId", "businessId");
CREATE INDEX IF NOT EXISTS "saved_businesses_userId_idx" ON "saved_businesses"("userId");

CREATE TABLE IF NOT EXISTS "saved_listings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "saved_listings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "saved_listings_userId_listingId_key" ON "saved_listings"("userId", "listingId");
CREATE INDEX IF NOT EXISTS "saved_listings_userId_idx" ON "saved_listings"("userId");

CREATE TABLE IF NOT EXISTS "business_reviews" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "enquiryId" TEXT,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "comment" TEXT NOT NULL,
    "verifiedInteraction" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "business_reviews_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "business_reviews_businessId_userId_key" ON "business_reviews"("businessId", "userId");
CREATE INDEX IF NOT EXISTS "business_reviews_businessId_published_idx" ON "business_reviews"("businessId", "published");

CREATE TABLE IF NOT EXISTS "business_subscriptions" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "planTier" "SubscriptionPlanTier" NOT NULL DEFAULT 'FREE',
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "billingCycle" TEXT NOT NULL DEFAULT 'MONTHLY',
    "amountInr" INTEGER NOT NULL DEFAULT 0,
    "currentPeriodStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currentPeriodEnd" TIMESTAMP(3),
    "quotationsUsedMonth" INTEGER NOT NULL DEFAULT 0,
    "quotationsLimitMonth" INTEGER NOT NULL DEFAULT 5,
    "listingsLimit" INTEGER NOT NULL DEFAULT 5,
    "teamMembersLimit" INTEGER NOT NULL DEFAULT 1,
    "razorpayOrderId" TEXT,
    "razorpaySubscriptionId" TEXT,
    "razorpayPaymentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "business_subscriptions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "business_subscriptions_businessId_key" ON "business_subscriptions"("businessId");
CREATE INDEX IF NOT EXISTS "business_subscriptions_planTier_status_idx" ON "business_subscriptions"("planTier", "status");

CREATE TABLE IF NOT EXISTS "moderation_reports" (
    "id" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "targetType" "ReportTargetType" NOT NULL,
    "targetId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "details" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'OPEN',
    "resolutionNote" TEXT,
    "resolvedById" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "moderation_reports_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "moderation_reports_targetType_targetId_idx" ON "moderation_reports"("targetType", "targetId");
CREATE INDEX IF NOT EXISTS "moderation_reports_status_createdAt_idx" ON "moderation_reports"("status", "createdAt");

-- 4. Foreign Keys
ALTER TABLE "marketplace_categories" ADD CONSTRAINT "marketplace_categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "marketplace_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "businesses" ADD CONSTRAINT "businesses_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "businesses" ADD CONSTRAINT "businesses_primaryCategoryId_fkey" FOREIGN KEY ("primaryCategoryId") REFERENCES "marketplace_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "business_category_assignments" ADD CONSTRAINT "business_category_assignments_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "business_category_assignments" ADD CONSTRAINT "business_category_assignments_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "marketplace_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "business_memberships" ADD CONSTRAINT "business_memberships_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "business_memberships" ADD CONSTRAINT "business_memberships_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "business_listings" ADD CONSTRAINT "business_listings_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "business_listings" ADD CONSTRAINT "business_listings_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "marketplace_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "business_listings" ADD CONSTRAINT "business_listings_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "marketplace_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "business_media" ADD CONSTRAINT "business_media_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "business_verification_records" ADD CONSTRAINT "business_verification_records_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "customer_enquiries" ADD CONSTRAINT "customer_enquiries_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "customer_enquiries" ADD CONSTRAINT "customer_enquiries_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "marketplace_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "customer_enquiries" ADD CONSTRAINT "customer_enquiries_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "marketplace_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "customer_enquiries" ADD CONSTRAINT "customer_enquiries_targetBusinessId_fkey" FOREIGN KEY ("targetBusinessId") REFERENCES "businesses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "customer_enquiries" ADD CONSTRAINT "customer_enquiries_targetListingId_fkey" FOREIGN KEY ("targetListingId") REFERENCES "business_listings"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "enquiry_matches" ADD CONSTRAINT "enquiry_matches_enquiryId_fkey" FOREIGN KEY ("enquiryId") REFERENCES "customer_enquiries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "enquiry_matches" ADD CONSTRAINT "enquiry_matches_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "business_quotations" ADD CONSTRAINT "business_quotations_enquiryId_fkey" FOREIGN KEY ("enquiryId") REFERENCES "customer_enquiries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "business_quotations" ADD CONSTRAINT "business_quotations_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "business_quotations" ADD CONSTRAINT "business_quotations_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "saved_businesses" ADD CONSTRAINT "saved_businesses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "saved_businesses" ADD CONSTRAINT "saved_businesses_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "saved_listings" ADD CONSTRAINT "saved_listings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "saved_listings" ADD CONSTRAINT "saved_listings_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "business_listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "business_reviews" ADD CONSTRAINT "business_reviews_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "business_reviews" ADD CONSTRAINT "business_reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "business_subscriptions" ADD CONSTRAINT "business_subscriptions_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "moderation_reports" ADD CONSTRAINT "moderation_reports_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
