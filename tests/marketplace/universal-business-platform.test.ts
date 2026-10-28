import { describe, it, expect, beforeEach } from 'vitest';
import { createHmac } from 'crypto';
import {
  BRAND_CONFIG,
  INITIAL_MARKETPLACE_CATEGORIES,
  BUSINESS_SUBSCRIPTION_PLANS,
} from '@/lib/brand';
import {
  resetMarketplaceStoreForTests,
  getCategories,
  getCategoryBySlugOrId,
  createCategory,
  createBusinessProfile,
  updateBusinessProfile,
  getBusinessBySlug,
  searchBusinesses,
  createBusinessListing,
  updateBusinessListing,
  searchListings,
  createCustomerEnquiry,
  getEnquiryByIdForViewer,
  listMatchedEnquiriesForBusiness,
  updateCustomerEnquiryLifecycle,
  submitOrUpdateQuotation,
  updateQuotationStatusByCustomer,
  toggleSavedBusiness,
  toggleSavedListing,
  getSavedItemsForUser,
  submitBusinessReview,
  upgradeBusinessSubscriptionPlan,
  addBusinessTeamMember,
  createModerationReport,
  executeAdminModeration,
  getAdminMarketplaceOverview,
} from '@/lib/marketplace/repository';
import {
  resetNotificationDedupeCacheForTests,
  sendMarketplaceNotification,
} from '@/lib/marketplace/notifications';
import { verifyRazorpayPaymentSignature } from '@/lib/marketplace/entitlements';
import { VERIFICATION_BADGE_META } from '@/lib/marketplace/types';
import { sanitizeCallbackPath } from '@/lib/auth/callback-url';

describe('PROVENTA — Universal Business Discovery, Storefront & Enquiry Marketplace', () => {
  beforeEach(() => {
    resetMarketplaceStoreForTests();
    resetNotificationDedupeCacheForTests();
  });

  // ============================================================
  // 1. BRAND & TAXONOMY VALIDATION
  // ============================================================
  describe('1. Brand Identity & Universal Taxonomy (18 Categories)', () => {
    it('configures PROVENTA with "Every Business. One Place." positioning', () => {
      expect(BRAND_CONFIG.name).toBe('PROVENTA');
      expect(BRAND_CONFIG.tagline).toBe('Every Business. One Place.');
      expect(BRAND_CONFIG.supportingStatement).toContain('Discover businesses.');
      expect(BRAND_CONFIG.centralValueProposition).toContain(
        'Businesses get discovered.',
      );
      expect(BRAND_CONFIG.initialCities).toContain('Ahmedabad');
      expect(BRAND_CONFIG.initialCities).toContain('Surat');
    });

    it('seeds all 18 universal industry categories with hierarchical subcategories', () => {
      expect(INITIAL_MARKETPLACE_CATEGORIES.length).toBe(18);
      const topLevel = getCategories({ onlyTopLevel: true });
      expect(topLevel.length).toBe(18);

      const mfg = getCategoryBySlugOrId('manufacturing');
      expect(mfg).not.toBeNull();
      expect(mfg?.name).toBe('Manufacturing');
      expect((mfg?.subcategories ?? []).length).toBeGreaterThanOrEqual(3);
      expect((mfg?.attributeSchema ?? []).length).toBeGreaterThanOrEqual(2);
    });

    it('allows admins to extend the category taxonomy without code changes', () => {
      const created = createCategory({
        name: 'CleanTech & Renewable Hydrogen',
        description: 'Green hydrogen electrolyzers and clean energy systems',
      });
      expect(created.slug).toBe('cleantech-renewable-hydrogen');
      const fetched = getCategoryBySlugOrId('cleantech-renewable-hydrogen');
      expect(fetched?.name).toBe('CleanTech & Renewable Hydrogen');
    });
  });

  // ============================================================
  // 2. BUSINESS ONBOARDING, SLUG UNIQUENESS & HONEST VERIFICATION
  // ============================================================
  describe('2. Business Profile Validation, Storefront Slugs & Honest Verification', () => {
    it('registers a business storefront as SELF_REPORTED (never falsely claiming legal verification)', () => {
      const biz = createBusinessProfile('owner_1', {
        name: 'Surya Precision CNC Works',
        shortDescription: 'Precision CNC turning and VMC milling components in Ahmedabad',
        description:
          'We manufacture high-tolerance CNC machined components, industrial shafts, and custom fixtures for automotive and engineering OEMs across Gujarat.',
        businessType: 'HYBRID',
        primaryCategoryId: 'manufacturing-industrial',
        city: 'Ahmedabad',
        state: 'Gujarat',
        serviceAreas: ['Ahmedabad', 'Vadodara', 'Rajkot'],
        servesPanIndia: true,
        contactPhone: '9876543210',
        contactEmail: 'sales@suryacnc.in',
        gstNumber: '24AAAAA0000A1Z5',
        tags: ['cnc', 'machining', 'vmc', 'fabrication'],
        publishImmediately: true,
      });

      expect(biz.name).toBe('Surya Precision CNC Works');
      expect(biz.status).toBe('PUBLISHED');
      expect(biz.verificationLevel).toBe('SELF_REPORTED');
      expect(VERIFICATION_BADGE_META[biz.verificationLevel].isVerified).toBe(false);
      expect(biz.slug).toContain('surya-precision-cnc-works');
      expect(biz.subscription?.planTier).toBe('FREE');
    });

    it('rejects reserved platform URL slugs and duplicate custom slugs', () => {
      expect(() =>
        createBusinessProfile('owner_1', {
          name: 'Admin Solutions',
          slug: 'admin',
          shortDescription: 'Valid summary of at least fifteen characters',
          description:
            'Valid full business description that is at least thirty characters long.',
          primaryCategoryId: 'it-software-digital',
          city: 'Surat',
        }),
      ).toThrow();

      createBusinessProfile('owner_1', {
        name: 'Kiran Textiles',
        slug: 'kiran-textiles-surat',
        shortDescription: 'Industrial fabrics and technical textiles in Surat',
        description:
          'Leading manufacturer and supplier of technical textiles and woven industrial fabrics in Surat.',
        primaryCategoryId: 'manufacturing-industrial',
        city: 'Surat',
      });

      expect(() =>
        createBusinessProfile('owner_2', {
          name: 'Another Kiran Textiles',
          slug: 'kiran-textiles-surat',
          shortDescription: 'Another textile company trying to use the same slug',
          description:
            'Trying to claim an existing business storefront slug should fail with conflict.',
          primaryCategoryId: 'manufacturing-industrial',
          city: 'Surat',
        }),
      ).toThrow(/already taken/i);
    });

    it('hides DRAFT businesses from public directory search while allowing owner preview', () => {
      const draftBiz = createBusinessProfile('owner_draft', {
        name: 'Stealth Software Labs',
        shortDescription: 'Custom enterprise ERP software development studio',
        description:
          'Building custom web applications, mobile apps, and cloud integrations for enterprises.',
        primaryCategoryId: 'it-software-digital',
        city: 'Gandhinagar',
        publishImmediately: false,
      });

      expect(draftBiz.status).toBe('DRAFT');

      const publicSearch = searchBusinesses({ query: 'Stealth Software' });
      expect(publicSearch.total).toBe(0);

      // Anonymous viewer cannot view a DRAFT storefront
      expect(() =>
        getBusinessBySlug(draftBiz.slug, { viewerUserId: null }),
      ).toThrow();

      // Owner CAN preview their own DRAFT storefront
      const ownerPreview = getBusinessBySlug(draftBiz.slug, {
        viewerUserId: 'owner_draft',
      });
      expect(ownerPreview.business.id).toBe(draftBiz.id);
    });
  });

  // ============================================================
  // 3. PRODUCT & SERVICE LISTING RULES & PRICE DISPLAY MODES
  // ============================================================
  describe('3. Product & Service Listings & Price Display Modes', () => {
    it('supports FIXED_PRICE, INDICATIVE_PRICE, PRICE_ON_REQUEST, and QUOTE_REQUIRED listings', () => {
      const biz = createBusinessProfile('owner_solar', {
        name: 'Gujarat Solar & EPC Solutions',
        shortDescription: 'Commercial and industrial solar rooftop EPC contractor',
        description:
          'Complete turnkey solar rooftop engineering, procurement, and construction across Gujarat.',
        primaryCategoryId: 'electronics-electrical-hardware',
        city: 'Ahmedabad',
        publishImmediately: true,
      });

      const fixedListing = createBusinessListing('owner_solar', {
        businessId: biz.id,
        categoryId: 'electronics-electrical-hardware',
        title: '10 kW On-Grid Solar Inverter Kit',
        listingType: 'PRODUCT',
        priceDisplayType: 'FIXED_PRICE',
        priceAmount: 85000,
        priceUnit: 'per kit',
        description: 'High-efficiency three-phase 10 kW solar inverter with Wi-Fi monitoring.',
      });
      expect(fixedListing.priceAmount).toBe(85000);

      const quoteListing = createBusinessListing('owner_solar', {
        businessId: biz.id,
        categoryId: 'electronics-electrical-hardware',
        title: '100 kW Industrial Factory Rooftop Solar EPC',
        listingType: 'SERVICE',
        priceDisplayType: 'QUOTE_REQUIRED',
        description:
          'Custom structural design, net metering, and turnkey solar panel installation for factories.',
      });
      expect(quoteListing.priceDisplayType).toBe('QUOTE_REQUIRED');
      expect(quoteListing.priceAmount).toBeNull();

      // Validation error when FIXED_PRICE is chosen without a positive priceAmount
      expect(() =>
        createBusinessListing('owner_solar', {
          businessId: biz.id,
          categoryId: 'electronics-electrical-hardware',
          title: 'Invalid Priced Item',
          listingType: 'PRODUCT',
          priceDisplayType: 'FIXED_PRICE',
          description: 'Missing price amount should fail validation immediately.',
        }),
      ).toThrow();

      const catalog = searchListings({ query: 'Solar' });
      expect(catalog.total).toBe(2);
    });
  });

  // ============================================================
  // 4. CUSTOMER ENQUIRY MARKETPLACE & BUSINESS MATCHING ENGINE
  // ============================================================
  describe('4. Customer Enquiry Validation, Matching Engine & Deduplicated Notifications', () => {
    it('matches enquiries to eligible PUBLISHED businesses and excludes DRAFT, SUSPENDED, or unrelated businesses', async () => {
      // 1. Eligible published business in Ahmedabad (Primary Category + City match + Keywords)
      const matchedBiz1 = createBusinessProfile('owner_b1', {
        name: 'Amdavad BuildCon & Civil Contractors',
        shortDescription: 'Industrial shed construction and turnkey civil engineering',
        description:
          'We specialize in factory construction, warehouse flooring, structural fabrication, and commercial civil contracting in Ahmedabad.',
        primaryCategoryId: 'construction-real-estate',
        city: 'Ahmedabad',
        state: 'Gujarat',
        tags: ['warehouse', 'industrial shed', 'concrete', 'civil'],
        publishImmediately: true,
      });

      // 2. Eligible published business in Surat that serves Ahmedabad
      const matchedBiz2 = createBusinessProfile('owner_b2', {
        name: 'Gujarat Structural Turnkey Projects',
        shortDescription: 'Pre-engineered buildings and warehouse contractors across Gujarat',
        description:
          'Turnkey PEB steel structures and industrial warehouse construction across Ahmedabad, Surat, and Vadodara.',
        primaryCategoryId: 'construction-real-estate',
        city: 'Surat',
        state: 'Gujarat',
        serviceAreas: ['Surat', 'Ahmedabad', 'Vadodara'],
        publishImmediately: true,
      });

      // 3. DRAFT business in same category (MUST NOT MATCH)
      createBusinessProfile('owner_b3', {
        name: 'Unpublished Draft Builders',
        shortDescription: 'Draft civil construction company in Ahmedabad',
        description: 'This business is still in draft mode and must never receive enquiries.',
        primaryCategoryId: 'construction-real-estate',
        city: 'Ahmedabad',
        publishImmediately: false,
      });

      // 4. Published business in an unrelated category (MUST NOT MATCH)
      createBusinessProfile('owner_b4', {
        name: 'Sweet Delights Bakery',
        shortDescription: 'Artisanal cakes and bakery products in Ahmedabad',
        description: 'Freshly baked cakes, pastries, and celebration desserts in Ahmedabad.',
        primaryCategoryId: 'food-beverage-hospitality',
        city: 'Ahmedabad',
        publishImmediately: true,
      });

      // Customer creates an enquiry in construction-real-estate for Ahmedabad
      const result = await createCustomerEnquiry(
        {
          id: 'cust_101',
          name: 'Rajesh Patel',
          email: 'rajesh@example.com',
          phone: '9898012345',
        },
        {
          categoryId: 'construction-real-estate',
          title: '15,000 sq.ft Industrial Warehouse Shed Construction in Ahmedabad',
          description:
            'We need a turnkey contractor for a 15,000 sq.ft industrial warehouse with VDF concrete flooring and PEB structure in Changodar, Ahmedabad.',
          requirementType: 'HYBRID',
          city: 'Ahmedabad',
          state: 'Gujarat',
          deliveryMode: 'ON_SITE',
          budgetMin: 8000000,
          budgetMax: 12000000,
          timeline: '1 to 3 months',
          categoryAttributes: {
            projectType: 'Industrial / Warehouse',
            siteArea: '15,000 sq.ft',
          },
          shareContactWithShortlistedOnly: true,
        },
      );

      expect(result.matchedBusinessesCount).toBe(2);
      expect(result.notificationsDispatched).toBe(2);
      expect(result.enquiry.status).toBe('MATCHING');

      const matchedIds = (result.enquiry.matches ?? []).map((m) => m.businessId);
      expect(matchedIds).toContain(matchedBiz1.id);
      expect(matchedIds).toContain(matchedBiz2.id);

      // Verify Ahmedabad exact city + keyword match scored higher than Surat service-area match
      const score1 = result.enquiry.matches?.find(
        (m) => m.businessId === matchedBiz1.id,
      )?.matchScore;
      const score2 = result.enquiry.matches?.find(
        (m) => m.businessId === matchedBiz2.id,
      )?.matchScore;
      expect(score1!).toBeGreaterThan(score2!);

      // Verify notification deduplication key prevents duplicate notifications
      const dedupeKey = result.enquiry.matches![0].notificationDedupeKey;
      const dupNotif = await sendMarketplaceNotification({
        userId: 'owner_b1',
        type: 'ENQUIRY_MATCHED',
        title: 'Duplicate Test',
        body: 'Should be deduplicated',
        dedupeKey,
      });
      expect(dupNotif.deduplicated).toBe(true);
      expect(dupNotif.delivered).toBe(false);
    });
  });

  // ============================================================
  // 5. QUOTATIONS, SHORTLISTING, ACCEPTANCE & PRIVACY PROTECTION
  // ============================================================
  describe('5. Quotations, Customer Comparison & Contact Privacy Protection', () => {
    it('protects customer email/phone until the customer shortlists or accepts a business quotation', async () => {
      const biz = createBusinessProfile('owner_it', {
        name: 'Navrangpura Cloud & AI Systems',
        shortDescription: 'Custom B2B web portals and mobile apps in Ahmedabad',
        description:
          'Full-stack Next.js, TypeScript, and PostgreSQL engineering studio in Ahmedabad.',
        primaryCategoryId: 'it-software-digital',
        city: 'Ahmedabad',
        publishImmediately: true,
      });

      const { enquiry } = await createCustomerEnquiry(
        {
          id: 'cust_privacy',
          name: 'Meera Shah',
          email: 'meera.private@company.in',
          phone: '9900112233',
        },
        {
          categoryId: 'it-software-digital',
          title: 'Custom Dealer Order Management Portal',
          description:
            'We require a web and mobile order management portal for 250 distributors across Gujarat.',
          city: 'Ahmedabad',
          state: 'Gujarat',
          shareContactWithShortlistedOnly: true,
        },
      );

      // Before shortlisting: matched business owner views enquiry -> contact details MUST BE REDACTED
      const viewBeforeShortlist = getEnquiryByIdForViewer(enquiry.id, {
        userId: 'owner_it',
      });
      expect(viewBeforeShortlist.customerEmail).toBeNull();
      expect(viewBeforeShortlist.customerPhone).toBeNull();

      // Unmatched third-party user attempting to view the enquiry -> AUTHORIZATION DENIED (IDOR check)
      expect(() =>
        getEnquiryByIdForViewer(enquiry.id, { userId: 'random_stranger' }),
      ).toThrow(/permission/i);

      // Matched business submits a structured quotation
      const quote = await submitOrUpdateQuotation('owner_it', {
        enquiryId: enquiry.id,
        businessId: biz.id,
        summary: 'Turnkey Next.js + PostgreSQL Dealer Portal with Mobile PWA',
        detailedProposal:
          'Includes role-based distributor login, catalog pricing tiers, invoice PDF generation, and 6 months support.',
        priceType: 'FIXED_QUOTE',
        priceAmount: 350000,
        deliveryTimeline: '6 weeks',
        validityDays: 30,
        inclusions: ['UI/UX Design', 'Backend API', 'Deployment'],
      });

      expect(quote.status).toBe('SUBMITTED');
      expect(quote.priceAmount).toBe(350000);

      // Customer shortlists the quotation
      const shortlisted = await updateQuotationStatusByCustomer(
        'cust_privacy',
        quote.id,
        'SHORTLIST',
        'Strong technical proposal, let us schedule a call.',
      );
      expect(shortlisted.status).toBe('SHORTLISTED');

      // After shortlisting: matched business owner IS NOW AUTHORIZED to view customer contact details
      const viewAfterShortlist = getEnquiryByIdForViewer(enquiry.id, {
        userId: 'owner_it',
      });
      expect(viewAfterShortlist.customerEmail).toBe('meera.private@company.in');
      expect(viewAfterShortlist.customerPhone).toBe('9900112233');

      // Customer accepts the quotation and closes the enquiry
      const accepted = await updateQuotationStatusByCustomer(
        'cust_privacy',
        quote.id,
        'ACCEPT',
      );
      expect(accepted.status).toBe('ACCEPTED');

      const closed = updateCustomerEnquiryLifecycle(
        'cust_privacy',
        enquiry.id,
        'CLOSE',
      );
      expect(closed.status).toBe('CLOSED');
    });
  });

  // ============================================================
  // 6. SUBSCRIPTION ENTITLEMENTS & RAZORPAY SIGNATURE SECURITY
  // ============================================================
  describe('6. Subscription Plan Entitlements (FREE, PRO, PREMIUM) & Payment Verification', () => {
    it('enforces FREE plan listing limits and unlocks higher limits when upgraded to PRO', () => {
      const biz = createBusinessProfile('owner_sub', {
        name: 'Rajkot Industrial Valves Co.',
        shortDescription: 'High-pressure ball valves, gate valves, and check valves',
        description:
          'Manufacturer of stainless steel industrial valves and pipe fittings in Rajkot.',
        primaryCategoryId: 'manufacturing-industrial',
        city: 'Rajkot',
        publishImmediately: true,
      });

      const freeLimit = BUSINESS_SUBSCRIPTION_PLANS.FREE.limits.maxListings;
      expect(freeLimit).toBe(5);

      for (let i = 1; i <= freeLimit; i++) {
        createBusinessListing('owner_sub', {
          businessId: biz.id,
          categoryId: 'manufacturing-industrial',
          title: `Industrial Valve Model V-${i}`,
          listingType: 'PRODUCT',
          priceDisplayType: 'FIXED_PRICE',
          priceAmount: 1500 * i,
          description: 'Stainless steel SS316 high-pressure industrial ball valve.',
        });
      }

      // 6th listing on FREE plan must be blocked by server-side entitlement check
      expect(() =>
        createBusinessListing('owner_sub', {
          businessId: biz.id,
          categoryId: 'manufacturing-industrial',
          title: 'Industrial Valve Model V-6 (Exceeds Free Plan)',
          listingType: 'PRODUCT',
          priceDisplayType: 'FIXED_PRICE',
          priceAmount: 9000,
          description: 'Should be blocked until business upgrades to Pro or Premium.',
        }),
      ).toThrow(/Upgrade your plan/i);

      // Upgrade business to PRO plan
      const upgradedSub = upgradeBusinessSubscriptionPlan(
        'owner_sub',
        biz.id,
        'PRO',
        'MONTHLY',
        true,
      );
      expect(upgradedSub.planTier).toBe('PRO');
      expect(upgradedSub.listingsLimit).toBe(50);

      // Now 6th listing succeeds
      const sixthListing = createBusinessListing('owner_sub', {
        businessId: biz.id,
        categoryId: 'manufacturing-industrial',
        title: 'Industrial Valve Model V-6',
        listingType: 'PRODUCT',
        priceDisplayType: 'FIXED_PRICE',
        priceAmount: 9000,
        description: 'Now allowed under the PRO business subscription plan.',
      });
      expect(sixthListing.title).toBe('Industrial Valve Model V-6');
    });

    it('verifies Razorpay HMAC-SHA256 payment signatures and rejects forged signatures', () => {
      const secret = 'test_razorpay_secret_key_12345';
      const orderId = 'order_PrvSub987654';
      const paymentId = 'pay_PrvPay123456';

      const validSig = createHmac('sha256', secret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      expect(
        verifyRazorpayPaymentSignature({
          orderId,
          paymentId,
          signature: validSig,
          secret,
        }),
      ).toBe(true);

      expect(
        verifyRazorpayPaymentSignature({
          orderId,
          paymentId,
          signature: 'forged_signature_000000000000',
          secret,
        }),
      ).toBe(false);
    });
  });

  // ============================================================
  // 7. OWNERSHIP, RBAC, SAVED ITEMS, REVIEWS & ADMIN MODERATION
  // ============================================================
  describe('7. Ownership Enforcement, Reviews & Admin Moderation Workflows', () => {
    it('prevents unauthorized users from editing another owner’s business or listings', () => {
      const biz = createBusinessProfile('legit_owner', {
        name: 'Vadodara Chemical Process Equipment',
        shortDescription: 'Glass-lined reactors and heat exchangers in Vadodara',
        description:
          'Specialized chemical process equipment manufacturer serving pharmaceutical and chemical plants.',
        primaryCategoryId: 'manufacturing-industrial',
        city: 'Vadodara',
        publishImmediately: true,
      });

      const listing = createBusinessListing('legit_owner', {
        businessId: biz.id,
        categoryId: 'manufacturing-industrial',
        title: '500L Stainless Steel Chemical Reactor',
        listingType: 'PRODUCT',
        priceDisplayType: 'INDICATIVE_PRICE',
        priceAmount: 450000,
        description: 'Jacketed SS316 chemical reactor vessel with agitator assembly.',
      });

      expect(() =>
        updateBusinessProfile('attacker_user', biz.id, {
          name: 'Hijacked Name',
        }),
      ).toThrow(/permission/i);

      expect(() =>
        updateBusinessListing('attacker_user', listing.id, {
          title: 'Hijacked Listing',
        }),
      ).toThrow(/permission/i);

      expect(() =>
        listMatchedEnquiriesForBusiness('attacker_user', biz.id),
      ).toThrow(/permission/i);
    });

    it('supports customer saved businesses/listings, verified reviews, and admin moderation actions', async () => {
      const biz = createBusinessProfile('owner_mod', {
        name: 'Surat Packaging & Corrugated Boxes',
        shortDescription: 'Custom printed corrugated packaging boxes and rolls',
        description:
          'High-strength 3-ply, 5-ply, and 7-ply corrugated boxes for e-commerce and textile exports.',
        primaryCategoryId: 'packaging-printing',
        city: 'Surat',
        publishImmediately: true,
      });

      // Save & unsave business
      const save1 = toggleSavedBusiness('cust_saver', biz.id);
      expect(save1.saved).toBe(true);
      expect(getSavedItemsForUser('cust_saver').savedBusinesses.length).toBe(1);

      // Submit customer review (owner cannot review own business)
      expect(() =>
        submitBusinessReview(
          { id: 'owner_mod', name: 'Owner' },
          {
            businessId: biz.id,
            rating: 5,
            comment: 'Trying to self-review my own business profile',
          },
        ),
      ).toThrow(/own business/i);

      const review = submitBusinessReview(
        { id: 'cust_saver', name: 'Aarav Desai' },
        {
          businessId: biz.id,
          rating: 5,
          title: 'Consistent corrugated box quality',
          comment: 'Delivered 5,000 export-grade cartons on schedule in Surat.',
        },
      );
      expect(review.rating).toBe(5);

      // Admin updates verification level to VERIFIED_BUSINESS after document review
      const verifiedBiz = (await executeAdminModeration('admin_1', {
        resourceType: 'BUSINESS',
        resourceId: biz.id,
        action: 'SET_VERIFICATION_LEVEL',
        verificationLevel: 'VERIFIED_BUSINESS',
        note: 'GSTIN and Shop Establishment certificate verified.',
      })) as { verificationLevel: string };

      expect(verifiedBiz.verificationLevel).toBe('VERIFIED_BUSINESS');

      // Submit and resolve an abuse report
      const report = createModerationReport('cust_saver', {
        targetType: 'BUSINESS',
        targetId: biz.id,
        reason: 'Outdated phone number inquiry',
      });
      expect(report.status).toBe('OPEN');

      await executeAdminModeration('admin_1', {
        resourceType: 'REPORT',
        resourceId: report.id,
        action: 'RESOLVE_REPORT',
        note: 'Contacted business owner and confirmed phone number.',
      });

      const overview = getAdminMarketplaceOverview();
      expect(overview.metrics.verifiedBusinesses).toBe(1);
      expect(overview.metrics.openReports).toBe(0);

      // Admin suspends a business -> immediately removed from public search & enquiry matching
      await executeAdminModeration('admin_1', {
        resourceType: 'BUSINESS',
        resourceId: biz.id,
        action: 'SUSPEND_BUSINESS',
        note: 'Suspended for policy violation test',
      });

      const afterSuspendSearch = searchBusinesses({ query: 'Surat Packaging' });
      expect(afterSuspendSearch.total).toBe(0);
    });
  });

  // ============================================================
  // 8. GOOGLE OAUTH & CALLBACK OPEN-REDIRECT SECURITY
  // ============================================================
  describe('8. Google OAuth & Callback URL Sanitization Security', () => {
    it('allows internal relative paths and blocks external/protocol-relative open redirects', () => {
      expect(sanitizeCallbackPath('/dashboard')).toBe('/dashboard');
      expect(sanitizeCallbackPath('/business/dashboard?tab=enquiries')).toBe(
        '/business/dashboard?tab=enquiries',
      );
      expect(sanitizeCallbackPath(null)).toBe('/dashboard');
      expect(sanitizeCallbackPath(undefined)).toBe('/dashboard');
      expect(sanitizeCallbackPath('https://evil.example.com/phish')).toBe(
        '/dashboard',
      );
      expect(sanitizeCallbackPath('//evil.example.com/phish')).toBe(
        '/dashboard',
      );
      expect(sanitizeCallbackPath('/\\evil.example.com')).toBe('/dashboard');
      expect(sanitizeCallbackPath('javascript:alert(1)')).toBe('/dashboard');
    });
  });
});
