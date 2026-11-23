import { describe, it, expect, beforeEach } from 'vitest';
import { homeDataStore } from '@/lib/home/repository';
import { HomeAllocationEngine } from '@/lib/home/allocation-engine';
import { HomePricingEngine } from '@/lib/home/pricing-engine';
import { HOME_SERVICE_CATEGORIES, HOME_SUBSCRIPTION_PLANS, AHMEDABAD_LOCALITIES } from '@/lib/home/constants';

describe('PROVENTA HOME — Comprehensive Platform & Economics Test Suite', () => {

  describe('1. Static Constants & Coverage Data Integrity', () => {
    it('should have 7 core household service categories with valid service items', () => {
      expect(HOME_SERVICE_CATEGORIES).toHaveLength(7);
      HOME_SERVICE_CATEGORIES.forEach(cat => {
        expect(cat.name).toBeDefined();
        expect(cat.services.length).toBeGreaterThan(0);
        cat.services.forEach(srv => {
          expect(srv.standardPrice).toBeGreaterThan(0);
          expect(srv.technicianPayout).toBeGreaterThan(0);
          expect(srv.estimatedDurationMin).toBeGreaterThan(0);
        });
      });
    });

    it('should have 3 subscription plans with structured entitlements', () => {
      expect(HOME_SUBSCRIPTION_PLANS).toHaveLength(3);
      const essential = HOME_SUBSCRIPTION_PLANS.find(p => p.tier === 'ESSENTIAL');
      const family = HOME_SUBSCRIPTION_PLANS.find(p => p.tier === 'FAMILY');
      const premium = HOME_SUBSCRIPTION_PLANS.find(p => p.tier === 'PREMIUM');

      expect(essential?.includedVisitsPerBillingMonth).toBe(1);
      expect(family?.includedVisitsPerBillingMonth).toBe(2);
      expect(premium?.includedVisitsPerBillingMonth).toBe(4);

      expect(essential?.visitRolloverAllowed).toBe(false);
      expect(family?.visitRolloverAllowed).toBe(true);
      expect(premium?.visitRolloverAllowed).toBe(true);
    });

    it('should cover key Ahmedabad operational localities', () => {
      expect(AHMEDABAD_LOCALITIES.length).toBeGreaterThanOrEqual(10);
      const bopal = AHMEDABAD_LOCALITIES.find(l => l.name === 'Bopal');
      expect(bopal).toBeDefined();
      expect(bopal?.isOperational).toBe(true);
      expect(bopal?.pincodes).toContain('380058');
    });
  });

  describe('2. In-Memory Store & Subscription Entitlements', () => {
    it('should load initial seed customers, technicians, and subscriptions', () => {
      const customers = homeDataStore.getAllCustomers();
      const technicians = homeDataStore.getAllTechnicians();
      const subscriptions = homeDataStore.getAllSubscriptions();

      expect(customers.length).toBeGreaterThanOrEqual(3);
      expect(technicians.length).toBeGreaterThanOrEqual(6);
      expect(subscriptions.length).toBeGreaterThanOrEqual(3);
    });

    it('should correctly consume a subscription visit and enforce remaining balance', () => {
      const customer = homeDataStore.getCustomerById('cust-bopal-01');
      expect(customer).toBeDefined();

      const sub = homeDataStore.getSubscriptionByCustomerId(customer!.id);
      expect(sub).toBeDefined();
      const initialRemaining = sub!.visitsRemainingCurrentPeriod;

      const result = homeDataStore.consumeSubscriptionVisit(sub!.id);
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(initialRemaining - 1);
    });

    it('should create a new subscription and calculate period dates correctly', () => {
      const newCustomer = homeDataStore.createCustomer({
        userId: 'usr-test-99',
        fullName: 'Kirit Parikh',
        mobile: '+91 98980 99887',
        email: 'kirit.parikh@example.in',
        addressLine1: '302, Shivalik Highstreet',
        apartmentOrSociety: 'Shivalik Highstreet',
        flatOrHouseNumber: '302',
        locality: 'Satellite',
        city: 'Ahmedabad',
        pincode: '380015'
      });

      const sub = homeDataStore.createSubscription({
        customerId: newCustomer.id,
        planTier: 'FAMILY',
        billingFrequency: 'ANNUAL'
      });

      expect(sub.customerId).toBe(newCustomer.id);
      expect(sub.planTier).toBe('FAMILY');
      expect(sub.status).toBe('ACTIVE');
      expect(sub.visitsRemainingCurrentPeriod).toBe(2);
    });
  });

  describe('3. Service Request Lifecycle & Additional Material Approval', () => {
    it('should create a service request and deduct entitlement if covered', () => {
      const request = homeDataStore.createServiceRequest({
        customerId: 'cust-bopal-01',
        categoryKey: 'PLUMBING',
        serviceCode: 'PLUMB-LEAK-01',
        serviceName: 'Under-Sink Basin Pipe Leakage',
        issueDescription: 'Dripping water from flexible connection under vanity counter.',
        preferredDate: '2026-11-26',
        preferredTimeSlot: '10:00 AM - 12:00 PM',
        urgency: 'STANDARD'
      });

      expect(request.id).toBeDefined();
      expect(request.requestCode).toMatch(/^PH-REQ-2026-\d{4}$/);
      expect(request.status).toBe('SUBMITTED');
      expect(request.isSubscriptionCovered).toBe(true);
      expect(request.baseServiceCharge).toBe(0);
    });

    it('should support additional spare parts approval flow and update totals', () => {
      const request = homeDataStore.createServiceRequest({
        customerId: 'cust-bopal-01',
        categoryKey: 'ELECTRICAL',
        serviceCode: 'ELEC-MCB-01',
        serviceName: 'MCB Switch Diagnostics',
        issueDescription: 'Tripping circuit',
        preferredDate: '2026-11-26',
        preferredTimeSlot: '02:00 PM - 04:00 PM',
        urgency: 'STANDARD'
      });

      // Technician requests spare part approval
      const withCharge = homeDataStore.addAdditionalCharge(request.id, {
        description: 'Schneider 32A C-Curve Breaker',
        materialCost: 550,
        labourExtraCost: 0
      });

      expect(withCharge).not.toBeNull();
      expect(withCharge!.status).toBe('AWAITING_CUSTOMER_APPROVAL');
      expect(withCharge!.additionalCharges).toHaveLength(1);
      const chargeId = withCharge!.additionalCharges[0].id;

      // Customer approves the charge
      const approved = homeDataStore.respondToAdditionalCharge(request.id, chargeId, true);
      expect(approved).not.toBeNull();
      expect(approved!.additionalCharges[0].status).toBe('APPROVED_BY_CUSTOMER');
      expect(approved!.totalCustomerPayable).toBe(550);
      expect(approved!.status).toBe('WORK_STARTED');
    });

    it('should complete job, assign rating, and generate partner payout', () => {
      const request = homeDataStore.createServiceRequest({
        customerId: 'cust-satellite-02',
        categoryKey: 'PLUMBING',
        serviceCode: 'PLUMB-DIV-02',
        serviceName: 'Concealed Shower Diverter',
        issueDescription: 'Dripping faucet',
        preferredDate: '2026-11-27',
        preferredTimeSlot: '11:00 AM - 01:00 PM',
        urgency: 'STANDARD'
      });

      homeDataStore.assignTechnician(request.id, 'tech-plumb-02');

      const completed = homeDataStore.updateRequestStatus(request.id, 'WORK_COMPLETED', {
        workCompletedAt: new Date().toISOString(),
        notes: 'Cartridge cleaned and tested under 3.5 bar pressure.',
        customerRating: 5,
        customerFeedback: 'Flawless repair!'
      });

      expect(completed).not.toBeNull();
      expect(completed!.status).toBe('WORK_COMPLETED');
      expect(completed!.customerRating).toBe(5);

      // Verify payout created
      const payouts = homeDataStore.getAllPayouts('tech-plumb-02');
      const latestPayout = payouts.find(p => p.requestId === request.id);
      expect(latestPayout).toBeDefined();
      expect(latestPayout?.grossAmount).toBe(350);
    });
  });

  describe('4. Intelligent Technician Allocation Engine', () => {
    it('should recommend qualified technicians ranked by score for a Bopal electrical issue', () => {
      const request = homeDataStore.createServiceRequest({
        customerId: 'cust-bopal-01',
        categoryKey: 'ELECTRICAL',
        serviceCode: 'ELEC-MCB-01',
        serviceName: 'Distribution Board & MCB Tripping Diagnostics',
        issueDescription: 'Kitchen power circuit tripping with burning smell',
        preferredDate: '2026-11-28',
        preferredTimeSlot: '10:00 AM - 12:00 PM',
        urgency: 'PRIORITY'
      });

      const recommendations = HomeAllocationEngine.recommendTechniciansForRequest(request);
      expect(recommendations.length).toBeGreaterThan(0);

      const top = recommendations[0];
      // Jignesh Solanki is an approved Bopal electrician with high rating and customer preference
      expect(top.technician.serviceCategories).toContain('ELECTRICAL');
      expect(top.totalScore).toBeGreaterThanOrEqual(70);
      expect(top.distanceCategory).toBe('SAME_LOCALITY');
    });

    it('should successfully auto-dispatch when top score is confident', () => {
      const request = homeDataStore.createServiceRequest({
        customerId: 'cust-bopal-01',
        categoryKey: 'ELECTRICAL',
        serviceCode: 'ELEC-MCB-01',
        serviceName: 'Distribution Board Tripping',
        issueDescription: 'Main breaker tripping',
        preferredDate: '2026-11-28',
        preferredTimeSlot: '02:00 PM - 04:00 PM',
        urgency: 'STANDARD'
      });

      const result = HomeAllocationEngine.autoDispatchIfEligible(request.id);
      expect(result.assigned).toBe(true);
      expect(result.technicianId).toBeDefined();

      const updated = homeDataStore.getRequestById(request.id);
      expect(updated?.status).toBe('TECHNICIAN_ASSIGNED');
    });
  });

  describe('5. Unit Economics & Subscription Financial Simulator', () => {
    it('should calculate accurate economics for Family Plan under expected baseline', () => {
      const cohort = 1500;
      const avgVisits = 0.9;
      const sim = HomePricingEngine.calculatePlanEconomics('FAMILY', cohort, avgVisits);

      expect(sim.monthlySubscriptionPrice).toBe(599);
      expect(sim.grossRevenue).toBe(599 * 1500);
      expect(sim.directTechnicianCost).toBe(0.9 * 280 * 1500);
      expect(sim.isProfitable).toBe(true);
      expect(sim.contributionMarginPercent).toBeGreaterThan(20);
    });

    it('should evaluate sensitivity across Low, Expected, and High utilization scenarios', () => {
      const low = HomePricingEngine.runScenario('LOW_UTILISATION');
      const expected = HomePricingEngine.runScenario('EXPECTED_UTILISATION');
      const high = HomePricingEngine.runScenario('HIGH_UTILISATION');

      expect(low.isViableOverall).toBe(true);
      expect(low.blendedContributionMarginPercent).toBeGreaterThan(expected.blendedContributionMarginPercent);
      expect(expected.isViableOverall).toBe(true);
      expect(expected.blendedContributionMarginPercent).toBeGreaterThan(20);
      expect(high.blendedMonthlyRevenue).toBe(expected.blendedMonthlyRevenue);
      expect(high.blendedVariableCost).toBeGreaterThan(expected.blendedVariableCost);
    });
  });

});
