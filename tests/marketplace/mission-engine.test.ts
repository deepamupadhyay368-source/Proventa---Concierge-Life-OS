import { describe, it, expect, beforeEach } from 'vitest';
import {
  createBusinessProfile,
  resetMarketplaceStoreForTests,
} from '@/lib/marketplace/repository';
import { resetNotificationDedupeCacheForTests } from '@/lib/marketplace/notifications';
import {
  extractMissionBriefFallback,
  structuredMissionBriefSchema,
} from '@/lib/marketplace/mission-ai';
import {
  acceptMissionQuotation,
  approveMissionRfqDistribution,
  cancelMission,
  confirmMissionCompletion,
  createMission,
  getMissionById,
  listCustomerMissions,
  requestConciergeMissionFallback,
  shortlistMissionQuotation,
  submitMissionQuotation,
} from '@/lib/marketplace/mission-service';

describe('PROVENTA Mission Engine — AI Extraction, Truth Separation & End-to-End Workflow', () => {
  beforeEach(() => {
    resetMarketplaceStoreForTests();
    resetNotificationDedupeCacheForTests();
  });

  // ============================================================
  // 1. AI REQUIREMENT EXTRACTION & SCHEMA VALIDATION
  // ============================================================
  describe('1. Natural Language Extraction & Schema Validation', () => {
    it('extracts structured deliverables, specifications, and clarification questions from plain English', () => {
      const prompt =
        'We need 500 units of custom 5-axis CNC machined anodized aluminum enclosures for an IoT gateway in Ahmedabad within 3 weeks. ISO 9001 required. Budget ₹1.5 Lakhs.';

      const brief = extractMissionBriefFallback({
        naturalLanguagePrompt: prompt,
      });

      // Strict Zod validation
      const validation = structuredMissionBriefSchema.safeParse(brief);
      expect(validation.success).toBe(true);

      expect(brief.categorySlug).toBe('manufacturing');
      expect(brief.city).toBe('Ahmedabad');
      expect(brief.budgetMin).toBeGreaterThanOrEqual(100000);
      expect(brief.budgetMax).toBeLessThanOrEqual(200000);
      expect(brief.deliverables.length).toBeGreaterThanOrEqual(1);
      expect(brief.deliverables[0]).toContain('500 units');
      expect(brief.specifications.location).toBe('Ahmedabad');
      expect(brief.priorities).toContain('Verified business credentials');
    });

    it('identifies missing critical information and generates polite clarification questions', () => {
      // Vague prompt missing quantity and budget
      const vaguePrompt = 'Looking for someone to do CNC machining work in Ahmedabad.';
      const brief = extractMissionBriefFallback({
        naturalLanguagePrompt: vaguePrompt,
      });

      expect(brief.missingInformation.length).toBeGreaterThan(0);
      expect(brief.missingInformation).toContain('Indicative budget target or cap');
      expect(brief.missingInformation).toContain('Precise quantity or scope volume');
      expect(brief.clarificationQuestions.length).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // 2. CANDIDATE MATCHING & TRUTH SEPARATION (FACTS vs CLAIMS vs ESTIMATES)
  // ============================================================
  describe('2. Candidate Supplier Matching & Truth Separation', () => {
    it('separates verified facts, supplier-provided claims, and AI fit estimates for matched businesses', async () => {
      // Seed real verified business
      createBusinessProfile('supplier_owner_1', {
        name: 'Aether Precision Aerospace Machining Pvt Ltd',
        shortDescription: 'High precision 5-axis CNC milling and turning components in Ahmedabad',
        description: 'Manufacturer of aerospace and industrial CNC components with full inspection reports.',
        businessType: 'PRODUCT',
        primaryCategoryId: 'manufacturing',
        city: 'Ahmedabad',
        state: 'Gujarat',
        yearEstablished: 2018,
        contactEmail: 'aether@precision.in',
        contactPhone: '9876543210',
        gstNumber: '24AAAAA0000A1Z5',
        tags: ['cnc', 'machining', 'aerospace', 'aluminum'],
        highlights: ['ISO 9001:2015 Certified', '48-hour prototype turnaround', 'CMM Inspection Lab'],
        publishImmediately: true,
      });

      // Customer initializes mission
      const mission = await createMission(
        {
          id: 'customer_101',
          name: 'Vikram Mehta',
          email: 'vikram@iotcorp.in',
          phone: '9988776655',
        },
        {
          naturalLanguagePrompt:
            'Need custom CNC machined aluminum enclosures for our gateway in Ahmedabad.',
          structuredOverrides: { city: 'Ahmedabad', budgetMin: 80000, budgetMax: 150000 },
        },
      );

      expect(mission.candidateSuppliers.length).toBe(1);
      const supplier = mission.candidateSuppliers[0];

      // 1. Verified Facts (legal badges, registered address, active listings)
      expect(supplier.verifiedFacts.registeredCity).toBe('Ahmedabad');
      expect(supplier.verifiedFacts.gstVerified).toBe(true);
      expect(supplier.verifiedFacts.establishedYear).toBe(2018);

      // 2. Supplier Claims (self-reported highlights, turnaround, tags)
      expect(supplier.supplierClaims.highlights).toContain('ISO 9001:2015 Certified');
      expect(supplier.supplierClaims.turnaroundClaim).toContain('48-hour prototype turnaround');
      expect(supplier.supplierClaims.tags).toContain('cnc');

      // 3. AI Estimates (match confidence, rationale)
      expect(supplier.aiEstimates.matchScore).toBeGreaterThanOrEqual(70);
      expect(['HIGH', 'MEDIUM']).toContain(supplier.aiEstimates.capabilityFit);
      expect(supplier.aiEstimates.relevanceRationale).toContain('category');
    });
  });

  // ============================================================
  // 3. CUSTOMER-APPROVED RFQ DISTRIBUTION
  // ============================================================
  describe('3. Customer-Approved RFQ Distribution', () => {
    it('holds mission in RFQ_PENDING_APPROVAL until customer explicitly selects and approves target suppliers', async () => {
      const biz = createBusinessProfile('supplier_owner_2', {
        name: 'Apex Industrial Fab',
        shortDescription: 'Industrial CNC machining and metal fabrication in Ahmedabad',
        description: 'CNC turning, milling, and sheet metal fabrication for engineering applications.',
        primaryCategoryId: 'manufacturing',
        city: 'Ahmedabad',
        publishImmediately: true,
      });

      const mission = await createMission(
        { id: 'customer_102', name: 'Kavita Patel' },
        {
          naturalLanguagePrompt: 'CNC machining batch requirement for 200 parts in Ahmedabad.',
        },
      );

      // Verify mission is initially in RFQ_PENDING_APPROVAL (not yet dispatched)
      expect(mission.missionStage).toBe('RFQ_PENDING_APPROVAL');
      expect(mission.candidateSuppliers[0].approvedForRfq).toBe(false);
      expect(mission.candidateSuppliers[0].notifiedAt).toBeNull();

      // Customer reviews and approves RFQ distribution
      const updated = await approveMissionRfqDistribution(
        mission.id,
        'customer_102',
        [biz.id],
      );

      expect(updated.missionStage).toBe('RFQ_DISPATCHED');
      expect(updated.approvedSupplierIds).toContain(biz.id);
      expect(updated.candidateSuppliers[0].approvedForRfq).toBe(true);

      // Verify audit history logged RFQ approval
      const auditTitles = updated.activities.map((a) => a.title);
      expect(auditTitles).toContain('Customer Approved RFQ Distribution');
      expect(auditTitles).toContain('RFQs Dispatched to Suppliers');
    });

    it('rejects RFQ distribution approval from non-owners', async () => {
      const mission = await createMission(
        { id: 'customer_real_owner', name: 'Real Owner' },
        { naturalLanguagePrompt: 'Industrial packaging boxes in Surat.' },
      );

      await expect(
        approveMissionRfqDistribution(mission.id, 'imposter_user', ['biz_123']),
      ).rejects.toThrow(/only the mission owner/i);
    });
  });

  // ============================================================
  // 4. SUPPLIER PROPOSAL SUBMISSION & CONTACT PRIVACY REDACTION
  // ============================================================
  describe('4. Supplier Proposal Submission & Contact Privacy Protection', () => {
    it('masks customer email and phone until customer shortlists or accepts a supplier quotation', async () => {
      const biz = createBusinessProfile('supplier_owner_3', {
        name: 'Surat Tech Packaging',
        shortDescription: 'Export grade corrugated packaging and printed cartons in Surat',
        description: 'Manufacturer of 5-ply export packaging cartons and corrugated boxes in Surat.',
        primaryCategoryId: 'industrial-supplies',
        city: 'Surat',
        publishImmediately: true,
      });

      const mission = await createMission(
        {
          id: 'customer_privacy_test',
          name: 'Aarav Desai',
          email: 'aarav.private@company.in',
          phone: '9825012345',
        },
        {
          naturalLanguagePrompt: '5,000 export-grade 5-ply cartons in Surat within 2 weeks.',
          structuredOverrides: { city: 'Surat' },
        },
      );

      await approveMissionRfqDistribution(mission.id, 'customer_privacy_test', [biz.id]);

      // Supplier views mission before quoting -> contact MUST be masked
      const viewBeforeQuote = getMissionById(mission.id, {
        userId: 'supplier_owner_3',
        role: 'BUSINESS',
      });
      expect(viewBeforeQuote.customerEmail).toBeNull();
      expect(viewBeforeQuote.customerPhone).toBeNull();

      // Supplier submits formal quotation
      await submitMissionQuotation(
        mission.id,
        { id: 'supplier_owner_3', name: 'Surat Tech Desk' },
        {
          businessId: biz.id,
          summary: '5,000 units 5-Ply Heavy Duty Export Cartons (Bursting Factor 18)',
          detailedProposal: 'Craft linerboard with water-resistant coating, strapped on wooden pallets for dispatch.',
          priceType: 'FIXED_QUOTE',
          priceAmount: 85000,
          deliveryTimeline: '10 business days',
          inclusions: ['Printing of company logo', 'Palletizing', 'GST Invoice'],
        },
      );

      // Customer shortlists the quotation
      const missionWithQuotes = getMissionById(mission.id, { userId: 'customer_privacy_test' });
      const quoteId = missionWithQuotes.quotations[0].quotationId;

      await shortlistMissionQuotation(
        mission.id,
        'customer_privacy_test',
        quoteId,
        'Shortlisted for final dispatch verification.',
      );

      // After shortlisting -> supplier is now authorized to view customer contact coordinates
      const viewAfterShortlist = getMissionById(mission.id, {
        userId: 'supplier_owner_3',
        role: 'BUSINESS',
      });
      expect(viewAfterShortlist.customerEmail).toBe('aarav.private@company.in');
      expect(viewAfterShortlist.customerPhone).toBe('9825012345');
    });
  });

  // ============================================================
  // 5. SIDE-BY-SIDE QUOTATION COMPARISON & COMMERCIAL AWARD
  // ============================================================
  describe('5. Side-by-Side Quotation Comparison & Commercial Acceptance', () => {
    it('compares proposals transparently and transitions mission to OFFER_ACCEPTED upon award', async () => {
      const biz1 = createBusinessProfile('supplier_1', {
        name: 'Vendor Fast Tech',
        shortDescription: 'Rapid turnaround precision engineering in Ahmedabad',
        description: 'CNC components with 5-day rush delivery capability.',
        primaryCategoryId: 'manufacturing',
        city: 'Ahmedabad',
        publishImmediately: true,
      });

      const biz2 = createBusinessProfile('supplier_2', {
        name: 'Vendor Premium Precision',
        shortDescription: 'Aerospace certified precision manufacturing in Ahmedabad',
        description: 'Certified AS9100 and ISO 9001 precision facility.',
        primaryCategoryId: 'manufacturing',
        city: 'Ahmedabad',
        publishImmediately: true,
      });

      const mission = await createMission(
        { id: 'customer_compare', name: 'Nikhil Shah' },
        { naturalLanguagePrompt: 'Precision machining batch in Ahmedabad.' },
      );

      await approveMissionRfqDistribution(mission.id, 'customer_compare', [biz1.id, biz2.id]);

      // Both vendors submit proposals
      await submitMissionQuotation(
        mission.id,
        { id: 'supplier_1' },
        {
          businessId: biz1.id,
          summary: 'Fast turnaround delivery proposal',
          detailedProposal: 'Complete machining within 5 days.',
          priceType: 'FIXED_QUOTE',
          priceAmount: 95000,
          deliveryTimeline: '5 days',
        },
      );

      await submitMissionQuotation(
        mission.id,
        { id: 'supplier_2' },
        {
          businessId: biz2.id,
          summary: 'Premium certified machining proposal',
          detailedProposal: 'Full CMM inspection and material test certificates included.',
          priceType: 'FIXED_QUOTE',
          priceAmount: 88000,
          deliveryTimeline: '12 days',
        },
      );

      // Customer reviews side-by-side comparison
      const missionAfterQuotes = getMissionById(mission.id, { userId: 'customer_compare' });
      expect(missionAfterQuotes.quotations.length).toBe(2);

      const winningQuote = missionAfterQuotes.quotations.find((q) => q.businessId === biz2.id)!;
      const otherQuote = missionAfterQuotes.quotations.find((q) => q.businessId === biz1.id)!;

      // Customer accepts winning quotation
      const awardedMission = await acceptMissionQuotation(
        mission.id,
        'customer_compare',
        winningQuote.quotationId,
      );

      expect(awardedMission.missionStage).toBe('OFFER_ACCEPTED');
      expect(awardedMission.acceptedQuotationId).toBe(winningQuote.quotationId);

      // Verify winning quote is ACCEPTED and other is REJECTED
      const updatedWinning = awardedMission.quotations.find((q) => q.quotationId === winningQuote.quotationId);
      const updatedOther = awardedMission.quotations.find((q) => q.quotationId === otherQuote.quotationId);
      expect(updatedWinning?.status).toBe('ACCEPTED');
      expect(updatedOther?.status).toBe('REJECTED');
    });
  });

  // ============================================================
  // 6. CONCIERGE FALLBACK, COMPLETION & FULL AUDIT LEDGER
  // ============================================================
  describe('6. Concierge Fallback, Completion Confirmation & Activity Ledger', () => {
    it('supports Concierge Sourcing fallback and customer completion confirmation', async () => {
      const mission = await createMission(
        { id: 'cust_fallback', name: 'Pooja Trivedi' },
        {
          naturalLanguagePrompt: 'Rare cleanroom cryogenic equipment in Gandhinagar.',
          structuredOverrides: { city: 'Gandhinagar' },
        },
      );

      // Customer requests concierge assisted sourcing
      const withConcierge = await requestConciergeMissionFallback(
        mission.id,
        'cust_fallback',
        'Need concierge team to source specialized cryogenic engineering partners.',
      );

      expect(withConcierge.conciergeFallback).toBe(true);

      // Confirm completion
      const completed = await confirmMissionCompletion(
        mission.id,
        'cust_fallback',
        'Suppliers delivered and tested to specifications.',
      );

      expect(completed.missionStage).toBe('COMPLETED');
      expect(completed.completionNote).toContain('delivered and tested');

      // Verify activity history contains full audit trail
      const activities = completed.activities;
      expect(activities.length).toBeGreaterThanOrEqual(4);
      const types = activities.map((a) => a.type);
      expect(types).toContain('MISSION_CREATED');
      expect(types).toContain('AI_PARSED');
      expect(types).toContain('CONCIERGE_FALLBACK_REQUESTED');
      expect(types).toContain('COMPLETION_CONFIRMED');
    });

    it('lists missions by customer with stage filtering', async () => {
      await createMission(
        { id: 'user_multi', name: 'Multi User' },
        { naturalLanguagePrompt: 'Mission 1: Industrial logistics in Ahmedabad.' },
      );

      await createMission(
        { id: 'user_multi', name: 'Multi User' },
        { naturalLanguagePrompt: 'Mission 2: Software portal development in Surat.' },
      );

      const customerMissions = listCustomerMissions('user_multi');
      expect(customerMissions.length).toBe(2);
      expect(customerMissions[0].customerId).toBe('user_multi');
    });
  });
});
