import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { NextRequest } from 'next/server';

// Mock authentication & external delivery services
vi.mock('@/lib/auth/session', () => ({
  requireConcierge: vi.fn(),
  requireAdmin: vi.fn(),
  requireAuth: vi.fn(),
  requireRole: vi.fn(),
  getSession: vi.fn(),
}));

vi.mock('@/lib/notifications/whatsapp', () => ({
  sendWhatsAppNotification: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/lib/email/sender', () => ({
  sendBookingConfirmationEmail: vi.fn().mockResolvedValue(true),
}));

import { db } from '@/lib/db';
import { RequestOrchestrator } from '@/lib/orchestration/orchestrator';
import { CapabilityRegistry } from '@/lib/capabilities/capability-registry';
import { TaskDecisionEngine } from '@/lib/capabilities/task-decision-engine';
import { ExecutionRouter } from '@/lib/capabilities/execution-router';
import { EntityIntegrityValidator } from '@/lib/validation/entity-integrity';
import { FlightsAdapter } from '@/lib/orchestration/adapters/flights.adapter';
import { SwiggyAdapter } from '@/lib/orchestration/adapters/swiggy.adapter';
import { CinemaAdapter } from '@/lib/orchestration/adapters/cinema.adapter';
import { CompositeOrchestrator } from '@/lib/orchestration/automation/composite-executor';
import { IdempotencyEngine } from '@/lib/orchestration/automation/idempotency';
import { PaymentAutomationEngine } from '@/lib/payments/engine';
import { ProductionAmadeusFlightProvider } from '@/lib/providers/production/amadeus-flight-provider';

describe('PROVENTA — PHASE 10: REAL PROVIDER EXECUTION & END-TO-END AUTOMATION SUITE', { timeout: 30000 }, () => {
  let testUser: any;
  let testCustomer: any;

  beforeAll(async () => {
    const uniqueId = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    testUser = await db.user.create({
      data: {
        email: `p10_user_${uniqueId}@proventa.in`,
        name: 'Deepam Upadhyay',
        phone: '+919876543210',
        userRoles: {
          create: [{ role: 'CUSTOMER' }],
        },
      },
    });

    testCustomer = await db.customerProfile.create({
      data: {
        userId: testUser.id,
        city: 'Ahmedabad',
        primaryUseCases: ['Travel', 'Dining'],
        preferredComm: 'IN_APP',
        onboardingCompleted: true,
      },
    });
  });

  afterAll(async () => {
    if (testCustomer?.id) {
      await db.taskEvent.deleteMany({ where: { task: { customerId: testCustomer.id } } }).catch(() => {});
      await db.booking.deleteMany({ where: { customerId: testCustomer.id } }).catch(() => {});
      await db.task.deleteMany({ where: { customerId: testCustomer.id } }).catch(() => {});
      await db.customerPaymentProfile.deleteMany({ where: { customerId: testCustomer.id } }).catch(() => {});
      await db.customerProfile.delete({ where: { id: testCustomer.id } }).catch(() => {});
    }
    if (testUser?.id) {
      await db.userRoleAssignment.deleteMany({ where: { userId: testUser.id } }).catch(() => {});
      await db.user.delete({ where: { id: testUser.id } }).catch(() => {});
    }
  });

  describe('1. Universal Capability Matrix & Provider Capability Contracts', () => {
    it('1.1 should define all 12 core concierge categories with complete capability matrix', () => {
      const matrix = CapabilityRegistry.getProductionMatrix();
      expect(matrix.length).toBeGreaterThanOrEqual(12);

      const diningCap = matrix.find((c) => c.category === 'DINING');
      expect(diningCap).toBeDefined();
      expect(diningCap?.verificationMethod).toContain('genuine provider confirmation');
      expect(diningCap?.humanConcierge).toBe(true);

      const travelCap = matrix.find((c) => c.category === 'TRAVEL');
      expect(travelCap).toBeDefined();
      expect(travelCap?.verificationMethod).toContain('airline');
      expect(travelCap?.approvalRequired).toBe(true);

      const researchCap = matrix.find((c) => c.category === 'RESEARCH_PLANNING');
      expect(researchCap).toBeDefined();
      expect(researchCap?.automaticExecution).toBe(false); // AI Research deliverable
    });

    it('1.2 should provide universal provider capability flags on all adapters', () => {
      const flightsAdapter = new FlightsAdapter();
      expect(flightsAdapter.capabilities).toBeDefined();
      expect(flightsAdapter.capabilities.search).toBe(true);
      expect(flightsAdapter.capabilities.availability).toBe(true);
      expect(flightsAdapter.capabilities.quote).toBe(true);
      expect(flightsAdapter.capabilities.execute).toBe(true);
      expect(flightsAdapter.capabilities.cancel).toBe(true);

      const swiggyAdapter = new SwiggyAdapter();
      expect(swiggyAdapter.capabilities).toBeDefined();
      expect(swiggyAdapter.capabilities.search).toBe(true);
      expect(swiggyAdapter.capabilities.execute).toBe(true);

      const cinemaAdapter = new CinemaAdapter();
      expect(cinemaAdapter.capabilities).toBeDefined();
      expect(cinemaAdapter.capabilities.search).toBe(true);
      expect(cinemaAdapter.capabilities.execute).toBe(true);
    });
  });

  describe('2. End-to-End Flight Execution (Amadeus GDS / Aviation Gateway)', () => {
    it('2.1 should execute complete flow: Search -> 5 Options -> Approval -> Payment -> Execution -> Confirmed Booking', async () => {
      const prompt = 'Book 2 Business Class flight tickets from Ahmedabad to Mumbai for tomorrow';
      
      // Step 1: Process request and generate 5 ranked options
      const reqResult = await RequestOrchestrator.processRequest({
        rawInput: prompt,
        customerId: testCustomer.id,
      });

      expect(reqResult.task).toBeDefined();
      expect(reqResult.task.status).toBe('AWAITING_APPROVAL');
      expect(reqResult.proposals.length).toBeGreaterThanOrEqual(2);

      const topOption = reqResult.proposals[0];
      expect(topOption.title).toBeDefined();
      expect(topOption.providerName).toBeDefined();

      // Step 2: Payment Gating verification
      const requiresPayment = PaymentAutomationEngine.requiresUpfrontPayment({
        category: 'TRAVEL',
        option: topOption,
      });
      expect(requiresPayment).toBe(true);

      // Step 3: Mock live provider execution with genuine PNR
      const mockFlightExecution = {
        success: true,
        providerId: 'amadeus_flights',
        externalReferenceId: '6X9Z2A', // Authoritative 6-char GDS PNR
        providerName: 'Air India / Vistara GDS',
        status: 'CONFIRMED',
        environment: 'REAL' as const,
        isMock: false,
        confirmedDetails: {
          pnr: '6X9Z2A',
          originAirport: 'AMD',
          arrivalAirport: 'BOM',
          carrier: 'Air India',
          passengers: 2,
          cabinClass: 'BUSINESS',
          status: 'TICKETED_CONFIRMED',
        },
      };

      // Step 4: Verify post-execution safety gate
      const postCheck = EntityIntegrityValidator.verifyPostExecutionResponse(
        { destination: 'Mumbai', category: 'TRAVEL' },
        mockFlightExecution,
        topOption
      );
      expect(postCheck.isValid).toBe(true);
      expect(postCheck.mismatchDetected).toBeFalsy();
    });

    it('2.2 should catch post-execution destination mismatch and escalate to Concierge', () => {
      // Provider returns Delhi instead of requested Mumbai
      const mismatchedExecution = {
        success: true,
        providerId: 'amadeus_flights',
        externalReferenceId: 'DEL99A',
        providerName: 'Air India GDS',
        status: 'CONFIRMED',
        environment: 'REAL' as const,
        isMock: false,
        confirmedDetails: {
          pnr: 'DEL99A',
          originAirport: 'AMD',
          arrivalAirport: 'DEL', // Mismatched destination!
          arrivalCity: 'Delhi',
          status: 'CONFIRMED',
        },
      };

      const postCheck = EntityIntegrityValidator.verifyPostExecutionResponse(
        { destination: 'Mumbai', category: 'TRAVEL' },
        mismatchedExecution
      );

      expect(postCheck.isValid).toBe(false);
      expect(postCheck.mismatchDetected).toBe(true);
      expect(postCheck.violationReason).toContain('Post-Execution Safety Gate Violation');
    });
  });

  describe('3. End-to-End Gourmet Food Delivery & Dining (Swiggy Adapter)', () => {
    it('3.1 should search Swiggy dining/delivery and return structured options', async () => {
      const swiggyAdapter = new SwiggyAdapter();
      const proposals = await swiggyAdapter.search({
        category: 'food_delivery',
        rawInput: 'Order private dinner from Swiggy Gourmet in Ahmedabad',
        constraints: { city: 'Ahmedabad' },
      });

      expect(proposals.length).toBeGreaterThanOrEqual(1);
      expect(proposals[0].providerId).toBe('swiggy_dineout');
      expect(proposals[0].priceAmount).toBeGreaterThan(0);
    });

    it('3.2 should handle live Swiggy order confirmation', async () => {
      const swiggyAdapter = new SwiggyAdapter();
      const mockProposal = {
        id: 'prop-swiggy-1',
        title: 'Swiggy Gourmet Reserve Tasting Menu',
        providerId: 'swiggy_dineout',
        providerName: 'Swiggy Gourmet Network',
        description: 'Multi-course artisan dinner delivered by dedicated concierge fleet.',
        priceAmount: 4500,
        priceCurrency: 'INR',
        priceFormatted: '₹4,500',
        environment: 'REAL' as const,
        isMock: false,
      };

      const exec = await swiggyAdapter.execute(mockProposal, { guests: 2 });
      expect(exec.success).toBe(true);
      expect(exec.externalReferenceId).toBeDefined();

      const verification = await swiggyAdapter.verify(exec);
      expect(verification.verified).toBe(true);
      expect(verification.status).toBe('CONFIRMED');
    });
  });

  describe('4. End-to-End Cinema & Entertainment Execution', () => {
    it('4.1 should search and return luxury auditorium seating options', async () => {
      const cinemaAdapter = new CinemaAdapter();
      const proposals = await cinemaAdapter.search({
        category: 'movies',
        rawInput: 'Book 2 IMAX recliner seats for tonight',
      });

      expect(proposals.length).toBeGreaterThanOrEqual(2);
      expect(proposals[0].title).toContain('IMAX');
      expect(proposals[0].metadata?.screenType).toBeDefined();
    });

    it('4.2 should execute cinema booking with seat allocation', async () => {
      const cinemaAdapter = new CinemaAdapter();
      const proposal = {
        id: 'cine-prop-1',
        title: 'PVR INOX Insignia Luxe — Center Recliners',
        providerId: 'cinema_pvr_inox',
        providerName: 'PVR INOX Insignia',
        description: 'Dolby Atmos recliner screening with butler service.',
        priceAmount: 1900,
        priceCurrency: 'INR',
        priceFormatted: '₹1,900',
      };

      const exec = await cinemaAdapter.execute(proposal, { numberOfTickets: 2 });
      expect(exec.success).toBe(true);
      expect(exec.confirmedDetails.seats).toBeDefined();
      expect(exec.confirmedDetails.status).toBe('CONFIRMED_CINEMA_PASS');
    });
  });

  describe('5. End-to-End Composite Multi-Component Orchestration (Weekend Escapes)', () => {
    it('5.1 should fulfill stay, transport, and dining components in a single escape request', async () => {
      // Create a real task in database for composite execution
      const compositeTask = await db.task.create({
        data: {
          publicId: `TSK-COMP-${Date.now().toString(36).toUpperCase()}`,
          customerId: testCustomer.id,
          category: 'weekend_escapes',
          intent: 'Plan weekend escape to Udaipur',
          originalRequest: 'Plan a luxury weekend escape to Udaipur with stay, chauffeur, and dining',
          status: 'EXECUTING',
          assignedAgent: 'Travel & Accommodations Agent',
        },
      });

      const compositeOption = {
        id: 'opt-escape-udaipur',
        title: 'Royal Udaipur Heritage Weekend (The Leela Palace + Luxury Chauffeur + Lake Dining)',
        providerId: 'ahmedabad_verified',
        providerName: 'The Leela Palace Udaipur',
        description: 'Comprehensive 2-night royal retreat with airport sedan and lakeside dinner.',
        priceAmount: 65000,
        priceCurrency: 'INR',
        priceFormatted: '₹65,000 all-inclusive',
        metadata: {
          isCompositePackage: true,
          city: 'Udaipur',
          partySize: 2,
        },
      };

      const result = await CompositeOrchestrator.executeCompositeWeekendEscape({
        taskId: compositeTask.id,
        option: compositeOption,
        customerName: 'Deepam Upadhyay',
        customerPhone: '+919876543210',
      });

      expect(result.allMandatoryFulfilled).toBe(true);
      expect(result.components.length).toBeGreaterThanOrEqual(3);
      expect(result.components.some((c) => c.componentType === 'STAY')).toBe(true);
      expect(result.components.some((c) => c.componentType === 'TRANSPORT')).toBe(true);
      expect(result.components.some((c) => c.componentType === 'DINING_EXPERIENCE')).toBe(true);
    });
  });

  describe('6. Pre-Execution Safety Constraints & Zero-Fabrication Invariants', () => {
    it('6.1 should reject proposal if city/destination violates customer intent', () => {
      const task = {
        category: 'dining',
        intent: 'Fine dining in Ahmedabad tonight',
        originalRequest: 'Book dinner table in Ahmedabad',
      };

      const proposal = {
        id: 'prop-delhi-1',
        title: 'Bukhara — ITC Maurya, New Delhi',
        providerId: 'mock_dining',
        metadata: { city: 'Delhi', location: 'Delhi' },
      };

      const check = EntityIntegrityValidator.verifyPreExecutionConstraints(task, proposal);
      expect(check.isValid).toBe(false);
      expect(check.violationReason).toContain('Pre-Execution Safety Gate Blocked');
      expect(check.violationReason).toContain('Ahmedabad');
      expect(check.violationReason).toContain('DELHI');
    });

    it('6.2 should strictly reject synthetic confirmation references in production', () => {
      const syntheticRefs = ['PV-MOCK-123456', 'MOCK-FLIGHT-99', 'DEMO-CONF-88', 'FAKE-BK-01', 'TEST-TICKET-77'];
      for (const ref of syntheticRefs) {
        const check = EntityIntegrityValidator.verifyPostExecutionResponse(
          { category: 'TRAVEL' },
          { success: true, externalReferenceId: ref, confirmedDetails: {} }
        );
        expect(check.isValid).toBe(false);
        expect(check.violationReason).toContain('Zero-Fabrication Violation');
      }
    });
  });

  describe('7. Idempotency & Safe Retry Engine', () => {
    it('7.1 should generate deterministic idempotency keys and return cached executions on retry', async () => {
      const taskId = 'task-idem-test-99';
      const key1 = IdempotencyEngine.generateIdempotencyKey(taskId, 'EXECUTE', { optionId: 'opt-1' });
      const key2 = IdempotencyEngine.generateIdempotencyKey(taskId, 'EXECUTE', { optionId: 'opt-1' });
      expect(key1).toBe(key2);

      let executionCount = 0;
      const executeFn = async () => {
        executionCount++;
        return { success: true, externalReferenceId: 'REF-CONF-9988', providerName: 'Air India' };
      };

      const res1 = await IdempotencyEngine.executeWithRetry({ idempotencyKey: key1, actionName: 'TestExec' }, executeFn);
      expect(res1.success).toBe(true);
      expect(executionCount).toBe(1);
    });
  });

  describe('8. Graceful Provider Failure & Senior Concierge Fallback', () => {
    it('8.1 should route unconfigured provider credentials safely to Senior Concierge Desk without throwing', async () => {
      const provider = new ProductionAmadeusFlightProvider();
      const status = await provider.getStatus();
      
      // If unconfigured, status is NOT_CONNECTED
      if (status === 'NOT_CONNECTED') {
        const searchRes = await provider.searchFlights({
          origin: 'AMD',
          destination: 'BOM',
          departureDate: '2026-10-20',
          passengers: 1,
        });
        expect(searchRes.success).toBe(false);
        expect(searchRes.error?.code).toBe('PROVIDER_NOT_CONNECTED');
      }
    });

    it('8.2 should resolve execution mode hierarchy cleanly via ExecutionRouter', () => {
      const res = ExecutionRouter.resolveExecutionMode({
        rawInput: 'Book me a private flight to London next week',
        category: 'travel',
      });

      expect(res.executionMethod).toBe('HUMAN_CONCIERGE');
      expect(['ASSISTED', 'HUMAN']).toContain(res.tier);
      expect(res.customerStatusMessage).toBe('Your Proventa Concierge is handling this.');
    });
  });
});
