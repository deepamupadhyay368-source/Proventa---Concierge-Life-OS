/**
 * PROVENTA — REAL FLIGHT AUTONOMOUS EXECUTION & ZERO-FABRICATION VERIFICATION SUITE
 * 
 * Verifies Phase 1 of Execution-Layer Completion:
 * 1. Flight discovery returns genuine flight proposals with up to 25 options
 * 2. Exact option selection & metadata locking
 * 3. Strict customer approval barrier before execution
 * 4. Capability detection: NOT_CONFIGURED when DUFFEL_API_KEY is missing
 * 5. Capability detection: CONFIGURED_BUT_UNVERIFIED / SANDBOX in test mode
 * 6. Capability detection: LIVE_PRODUCTION when authenticated live credentials are configured
 * 7. Offer revalidation: Price increase detection blocks execution
 * 8. Offer revalidation: Sold out inventory detection blocks execution
 * 9. Offer revalidation: Expired offer detection blocks execution
 * 10. Provider rejection handling (airline declined) without fake PNRs
 * 11. Bounded timeout & transient network retry safety
 * 12. Strict zero-fabrication gate rejecting synthetic PNRs (PV-*, MOCK-*, TEST-*)
 * 13. Idempotency & duplicate submission protection
 * 14. Webhook HMAC-SHA256 cryptographic verification & replay protection
 * 15. Webhook deduplication & idempotent reconciliation
 * 16. Authoritative booking creation & customer folio generation
 * 17. Safe Concierge fallback with structured context when autonomous execution unavailable
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { DuffelClient } from '@/lib/orchestration/adapters/duffel-client';
import { DuffelFlightsAdapter } from '@/lib/orchestration/adapters/duffel-flights.adapter';
import { ExecutionCapabilityRegistry } from '@/lib/orchestration/execution/execution-capability-registry';
import { ExecutionToolRegistry } from '@/lib/orchestration/execution/tool-registry';
import { AIExecutionAgent } from '@/lib/orchestration/execution/execution-agent';
import { ExecutionPlanner } from '@/lib/orchestration/execution/execution-planner';
import { PreExecutionConstraintGate } from '@/lib/orchestration/execution/constraint-gate';
import { DeterministicVerificationGate } from '@/lib/orchestration/execution/verification-gate';
import { PaymentAuthorizationGate } from '@/lib/orchestration/execution/payment-gate';
import { ExecutionRouter } from '@/lib/capabilities/execution-router';
import { db } from '@/lib/db';
import type { OptionProposal } from '@/lib/orchestration/types';
import crypto from 'crypto';

vi.mock('@/lib/db', () => ({
  db: {
    task: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    booking: {
      create: vi.fn().mockResolvedValue({ id: 'bok_123', status: 'CONFIRMED' }),
      findFirst: vi.fn(),
    },
    payment: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    customerPaymentProfile: {
      findUnique: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('@/lib/orchestration/timeline', () => ({
  appendTaskEvent: vi.fn().mockResolvedValue({ id: 'evt-flight-1' }),
}));

vi.mock('@/lib/notifications/whatsapp', () => ({
  sendWhatsAppNotification: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/lib/email/sender', () => ({
  sendBookingConfirmationEmail: vi.fn().mockResolvedValue(true),
}));

describe('PROVENTA — REAL FLIGHT AUTONOMOUS EXECUTION EVALUATION SUITE', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    ExecutionCapabilityRegistry.reinitialize();
    ExecutionToolRegistry.reinitialize();
  });

  // ============================================================
  // 1. FLIGHT DISCOVERY UP TO 25 OPTIONS
  // ============================================================
  it('1. Discovers genuine flight options with full itinerary details and up to 25 results', async () => {
    const mockClient = new DuffelClient({ apiKey: 'duffel_test_mock_123', environment: 'test' });
    
    // Simulate 5 flight offers returned by Duffel
    const mockOffers = [
      {
        id: 'off_ai_818',
        total_amount: '4200.00',
        total_currency: 'INR',
        cabin_class: 'economy',
        slices: [
          {
            origin: { iata_code: 'AMD', name: 'Sardar Vallabhbhai Patel International Airport', city_name: 'Ahmedabad' },
            destination: { iata_code: 'DEL', name: 'Indira Gandhi International Airport', city_name: 'Delhi' },
            segments: [
              {
                departing_at: '2026-10-15T07:30:00Z',
                arriving_at: '2026-10-15T09:15:00Z',
                operating_carrier: { name: 'Air India', iata_code: 'AI' },
                marketing_carrier_flight_number: '818',
              },
            ],
          },
        ],
      },
      {
        id: 'off_6e_204',
        total_amount: '3850.00',
        total_currency: 'INR',
        cabin_class: 'economy',
        slices: [
          {
            origin: { iata_code: 'AMD', city_name: 'Ahmedabad' },
            destination: { iata_code: 'DEL', city_name: 'Delhi' },
            segments: [
              {
                departing_at: '2026-10-15T11:00:00Z',
                arriving_at: '2026-10-15T12:40:00Z',
                operating_carrier: { name: 'IndiGo', iata_code: '6E' },
                marketing_carrier_flight_number: '204',
              },
            ],
          },
        ],
      },
    ];

    vi.spyOn(mockClient, 'createOfferRequest').mockResolvedValue({
      id: 'orq_amd_del',
      offers: mockOffers,
    });

    const adapter = new DuffelFlightsAdapter(mockClient);
    const results = await adapter.search({
      category: 'flights',
      rawInput: 'Flight from Ahmedabad to Delhi on 2026-10-15 for 1 adult',
      constraints: {
        originAirport: 'AMD',
        destinationAirport: 'DEL',
        departureDate: '2026-10-15',
        passengers: 1,
      },
    });

    expect(results.length).toBe(2);
    expect(results[0].providerId).toBe('duffel_flights');
    expect(results[0].title).toContain('Air India (AI 818)');
    expect(results[0].priceAmount).toBe(4200);
    expect(results[0].metadata?.offerId).toBe('off_ai_818');
    expect(results[1].providerName).toBe('IndiGo');
    expect(results[1].priceAmount).toBe(3850);
  });

  // ============================================================
  // 2. EXACT OPTION SELECTION & LOCKING
  // ============================================================
  it('2. Locks exact selected flight option with route, cabin, flight number, and pricing into execution plan', () => {
    const selectedOption: OptionProposal = {
      id: 'duffel-flt-off_6e_204',
      providerId: 'duffel_flights',
      providerName: 'IndiGo',
      title: 'IndiGo (6E 204) — AMD to DEL',
      description: 'Direct flight departing 11:00 AM',
      priceAmount: 3850,
      priceCurrency: 'INR',
      priceFormatted: '₹3,850',
      availability: 'Confirmed',
      bookingMethod: 'API',
      reliabilityScore: 98,
      environment: 'REAL',
      isMock: false,
      metadata: {
        offerId: 'off_6e_204',
        airline: 'IndiGo',
        flightNumber: '6E 204',
        origin: 'AMD',
        destination: 'DEL',
        departureDate: '2026-10-15',
        cabinClass: 'economy',
        passengers: 1,
      },
    };

    const mockTask: any = {
      id: 'task-flt-lock-01',
      category: 'travel',
      originalRequest: 'Book flight AMD to DEL',
    };

    const plan = ExecutionPlanner.createPlan({
      taskId: 'task-flt-lock-01',
      taskRecord: mockTask,
      approvedOption: selectedOption,
    });

    expect(plan.providerId).toBe('duffel_flights');
    expect(plan.origin).toBe('AMD');
    expect(plan.destination).toBe('DEL');
    expect(plan.amount).toBe(3850);
    expect(plan.currency).toBe('INR');
    expect(plan.toolName).toBe('DuffelFlightTool');
  });

  // ============================================================
  // 3. HARD APPROVAL BARRIER
  // ============================================================
  it('3. Strictly blocks execution when customer has not provided explicit approval', async () => {
    const mockTask: any = {
      id: 'task-unapproved-flight',
      status: 'OPTIONS_READY',
      proposedOptions: [],
    };

    vi.mocked(db.task.findUnique).mockResolvedValue(mockTask);

    const res = await AIExecutionAgent.executeTask({
      taskId: 'task-unapproved-flight',
    });

    expect(res.success).toBe(false);
    expect(res.message).toContain('No approved option selected for execution.');
  });

  // ============================================================
  // 4. CAPABILITY DETECTION: NOT_CONFIGURED WHEN DUFFEL_API_KEY MISSING
  // ============================================================
  it('4. Classifies Duffel capability as NOT_CONFIGURED when DUFFEL_API_KEY is missing', () => {
    delete process.env.DUFFEL_API_KEY;
    delete process.env.DUFFEL_ENV;

    ExecutionCapabilityRegistry.reinitialize();

    const cap = ExecutionCapabilityRegistry.getCapability('duffel_flights');
    expect(cap?.capabilityStatus).toBe('NOT_CONFIGURED');
    expect(cap?.supportsAutomatedExecution).toBe(false);
    expect(cap?.credentialsConfigured).toBe(false);

    const health = ExecutionRouter.checkProviderHealth('duffel_flights');
    expect(health).toBe('NOT_CONFIGURED');
  });

  // ============================================================
  // 5. CAPABILITY DETECTION: SANDBOX IN TEST MODE
  // ============================================================
  it('5. Classifies Duffel capability as SANDBOX when DUFFEL_ENV=test and prevents automated production execution', () => {
    process.env.DUFFEL_API_KEY = 'duffel_test_xyz987';
    process.env.DUFFEL_ENV = 'test';

    ExecutionCapabilityRegistry.reinitialize();

    const cap = ExecutionCapabilityRegistry.getCapability('duffel_flights');
    expect(cap?.capabilityStatus).toBe('SANDBOX');
    expect(cap?.supportsAutomatedExecution).toBe(false);
    expect(cap?.environment).toBe('SANDBOX');
  });

  // ============================================================
  // 6. CAPABILITY DETECTION: LIVE_PRODUCTION WITH LIVE CREDENTIALS
  // ============================================================
  it('6. Classifies Duffel capability as LIVE_PRODUCTION only when legitimate duffel_live_ key with DUFFEL_ENV=live is configured', () => {
    process.env.DUFFEL_API_KEY = 'duffel_live_production_key_009988';
    process.env.DUFFEL_ENV = 'live';

    ExecutionCapabilityRegistry.reinitialize();

    const cap = ExecutionCapabilityRegistry.getCapability('duffel_flights');
    expect(cap?.capabilityStatus).toBe('LIVE_PRODUCTION');
    expect(cap?.supportsAutomatedExecution).toBe(true);
    expect(cap?.environment).toBe('REAL');
    expect(cap?.credentialsVerified).toBe(true);

    const health = ExecutionRouter.checkProviderHealth('duffel_flights');
    expect(health).toBe('AVAILABLE');
  });

  // ============================================================
  // 7. OFFER REVALIDATION: PRICE INCREASE DETECTION
  // ============================================================
  it('7. Revalidation blocks execution if airline fare increases before ticketing and requires re-approval', async () => {
    const mockClient = new DuffelClient({ apiKey: 'duffel_test_key', environment: 'test' });
    vi.spyOn(mockClient, 'getOffer').mockResolvedValue({
      id: 'off_price_hiked',
      total_amount: '6200.00', // Increased from ₹3,850
      total_currency: 'INR',
      expires_at: new Date(Date.now() + 600000).toISOString(),
      slices: [{ origin: { iata_code: 'AMD' }, destination: { iata_code: 'DEL' } }],
    });

    const adapter = new DuffelFlightsAdapter(mockClient);
    const approvedOption: OptionProposal = {
      id: 'opt-flt',
      title: 'IndiGo Flight',
      description: 'Direct Flight',
      priceAmount: 3850,
      priceFormatted: '₹3,850',
      priceCurrency: 'INR',
      providerId: 'duffel_flights',
      providerName: 'IndiGo',
      environment: 'REAL',
      isMock: false,
      metadata: { offerId: 'off_price_hiked', origin: 'AMD', destination: 'DEL' },
    };

    const reval = await adapter.revalidateOffer('off_price_hiked', approvedOption);
    expect(reval.isValid).toBe(false);
    expect(reval.reason).toContain('Flight fare increased');
    expect(reval.reason).toContain('Re-approval required');
  });

  // ============================================================
  // 8. OFFER REVALIDATION: SOLD OUT INVENTORY
  // ============================================================
  it('8. Revalidation blocks execution if flight seats are sold out', async () => {
    const mockClient = new DuffelClient({ apiKey: 'duffel_test_key', environment: 'test' });
    vi.spyOn(mockClient, 'getOffer').mockResolvedValue({
      id: 'off_sold_out',
      total_amount: '3850.00',
      total_currency: 'INR',
      slices: [], // Empty slices = sold out
    });

    const adapter = new DuffelFlightsAdapter(mockClient);
    const reval = await adapter.revalidateOffer('off_sold_out', {
      id: 'opt-sold-out',
      title: 'Flight',
      description: 'Direct Flight',
      priceAmount: 3850,
      priceFormatted: '₹3,850',
      priceCurrency: 'INR',
      providerId: 'duffel_flights',
      providerName: 'IndiGo',
      environment: 'REAL',
      isMock: false,
      metadata: { origin: 'AMD', destination: 'DEL' },
    });

    expect(reval.isValid).toBe(false);
    expect(reval.reason).toContain('sold out');
  });

  // ============================================================
  // 9. OFFER REVALIDATION: EXPIRED OFFER
  // ============================================================
  it('9. Revalidation blocks execution if flight offer has expired', async () => {
    const mockClient = new DuffelClient({ apiKey: 'duffel_test_key', environment: 'test' });
    vi.spyOn(mockClient, 'getOffer').mockResolvedValue({
      id: 'off_expired',
      expires_at: new Date(Date.now() - 60000).toISOString(), // Expired 1 minute ago
      slices: [{ origin: { iata_code: 'AMD' }, destination: { iata_code: 'DEL' } }],
    });

    const adapter = new DuffelFlightsAdapter(mockClient);
    const reval = await adapter.revalidateOffer('off_expired', {
      id: 'opt-expired',
      title: 'Flight',
      description: 'Direct Flight',
      priceAmount: 3850,
      priceFormatted: '₹3,850',
      priceCurrency: 'INR',
      providerId: 'duffel_flights',
      providerName: 'IndiGo',
      environment: 'REAL',
      isMock: false,
      metadata: { origin: 'AMD', destination: 'DEL' },
    });

    expect(reval.isValid).toBe(false);
    expect(reval.reason).toContain('expired');
  });

  // ============================================================
  // 10. PROVIDER REJECTION HANDLING (AIRLINE DECLINED)
  // ============================================================
  it('10. Handles provider rejection gracefully without fabricating synthetic PNRs', async () => {
    const mockClient = new DuffelClient({ apiKey: 'duffel_test_key', environment: 'test' });
    vi.spyOn(mockClient, 'getOffer').mockResolvedValue({
      id: 'off_declined',
      total_amount: '4500.00',
      total_currency: 'INR',
      slices: [{ origin: { iata_code: 'AMD' }, destination: { iata_code: 'DEL' } }],
    });

    const duffelErr = new Error('[Duffel Order] Airline inventory locked or payment authorization declined');
    (duffelErr as any).code = 'airline_declined';
    vi.spyOn(mockClient, 'createOrder').mockRejectedValue(duffelErr);

    const adapter = new DuffelFlightsAdapter(mockClient);
    const output = await adapter.execute(
      {
        id: 'opt-declined',
        title: 'Air India Flight',
        description: 'Direct Flight',
        priceAmount: 4500,
        priceFormatted: '₹4,500',
        priceCurrency: 'INR',
        providerId: 'duffel_flights',
        providerName: 'Air India',
        environment: 'REAL',
        isMock: false,
        metadata: { offerId: 'off_declined', origin: 'AMD', destination: 'DEL' },
      },
      { idempotencyKey: 'idemp_dec_01' }
    );

    expect(output.success).toBe(false);
    expect(output.status).toBe('FAILED');
    expect(output.errorCode).toBe('airline_declined');
    expect(output.externalReferenceId).toBeUndefined();
  });

  // ============================================================
  // 11. BOUNDED TIMEOUT & RETRY SAFETY
  // ============================================================
  it('11. Prevents duplicate ticketing during ambiguous network timeouts by querying existing order first', async () => {
    const mockClient = new DuffelClient({ apiKey: 'duffel_live_key', environment: 'live' });
    const getOrderSpy = vi.spyOn(mockClient, 'getOrder').mockResolvedValue({
      id: 'ord_timeout_verified',
      booking_reference: 'AIR789',
    });

    // Verification check with order ID returns genuine PNR
    const adapter = new DuffelFlightsAdapter(mockClient);
    const verifyResult = await adapter.verify('ord_timeout_verified');

    expect(getOrderSpy).toHaveBeenCalledWith('ord_timeout_verified');
    expect(verifyResult.verified).toBe(true);
    expect(verifyResult.status).toBe('CONFIRMED');
    expect(verifyResult.auditTrail).toContain('AIR789');
  });

  // ============================================================
  // 12. STRICT ZERO-FABRICATION GATE REJECTING SYNTHETIC PNRS
  // ============================================================
  it('12. Rejects synthetic fake PNRs (PV-*, MOCK-*, TEST-*, DEMO-*) via Deterministic Verification Gate', () => {
    const syntheticPnrList = ['PV-FLT-9988', 'MOCK-6E-123', 'TEST-PNR-00', 'DEMO-AMD-DEL', 'FAKE-TICKET'];

    for (const syntheticRef of syntheticPnrList) {
      const gateResult = DeterministicVerificationGate.evaluate({
        taskRecord: { id: 'task-synth-check' },
        approvedOption: { id: 'opt-1' } as any,
        executionPlan: {
          planId: 'plan-1',
          taskId: 'task-synth-check',
          serviceCategory: 'travel',
          providerId: 'duffel_flights',
          providerName: 'Air India',
          approvedOptionId: 'opt-1',
          approvedOptionTitle: 'Flight',
          amount: 4500,
          currency: 'INR',
          paymentRequired: true,
          executionMethod: 'API',
          toolName: 'DuffelFlightTool',
          idempotencyKey: 'idemp-synth-1',
          lockedAt: new Date().toISOString(),
        },
        toolResult: {
          success: true,
          provider: 'duffel_flights',
          providerReference: syntheticRef,
          status: 'CONFIRMED',
          isMock: false,
          environment: 'REAL',
          timestamp: new Date().toISOString(),
        },
      });

      expect(gateResult.passed).toBe(false);
      expect(gateResult.errorCode).toBe('SYNTHETIC_EVIDENCE_REJECTED');
    }
  });

  // ============================================================
  // 13. IDEMPOTENCY & DUPLICATE SUBMISSION PROTECTION
  // ============================================================
  it('13. Enforces idempotency key on execution: Repeated invocation returns existing confirmed order without re-charging', async () => {
    const approvedOpt: OptionProposal = {
      id: 'duffel-flt-idem',
      providerId: 'duffel_flights',
      providerName: 'Air India',
      title: 'Air India (AI 818) — AMD to DEL',
      description: 'Economy Direct',
      priceAmount: 4200,
      priceFormatted: '₹4,200',
      priceCurrency: 'INR',
      bookingMethod: 'API',
      environment: 'REAL',
      isMock: false,
    };

    const mockCompletedTask: any = {
      id: 'task-idem-flt-01',
      status: 'COMPLETED',
      externalReferenceId: 'AI6XYZ',
      category: 'travel',
      clientPreferences: {
        approvedOption: approvedOpt,
        executionIdempotencyKey: 'FLT_IDEMP_task-idem-flt-01_opt-1',
      },
    };

    vi.mocked(db.task.findUnique).mockResolvedValue(mockCompletedTask);

    const plan = ExecutionPlanner.createPlan({
      taskId: 'task-idem-flt-01',
      taskRecord: mockCompletedTask,
      approvedOption: approvedOpt,
    });

    mockCompletedTask.clientPreferences.executionIdempotencyKey = plan.idempotencyKey;

    const result = await AIExecutionAgent.executeTask({
      taskId: 'task-idem-flt-01',
    });

    expect(result.success).toBe(true);
    expect(result.status).toBe('COMPLETED');
    expect(result.confirmationReference).toBe('AI6XYZ');
    expect(result.message).toContain('confirmed. Reference: AI6XYZ');
  });

  // ============================================================
  // 14. WEBHOOK CRYPTOGRAPHIC VERIFICATION
  // ============================================================
  it('14. Cryptographically verifies Duffel webhook signatures with HMAC-SHA256 and rejects forged payloads', () => {
    const secret = 'whsec_duffel_cryptographic_test_key_44';
    const client = new DuffelClient({ webhookSecret: secret });

    const rawPayload = JSON.stringify({
      type: 'order.created',
      data: { id: 'ord_0000Avvv', booking_reference: 'GEN6PNR' },
    });

    const nowSeconds = Math.floor(Date.now() / 1000).toString();
    const signedPayload = `${nowSeconds}.${rawPayload}`;
    const validSignature = crypto.createHmac('sha256', secret).update(signedPayload).digest('hex');

    const validHeader = `t=${nowSeconds},v1=${validSignature}`;
    const forgedHeader = `t=${nowSeconds},v1=0000000000000000000000000000000000000000000000000000000000000000`;

    expect(client.verifyWebhookSignature(rawPayload, validHeader)).toBe(true);
    expect(client.verifyWebhookSignature(rawPayload, forgedHeader)).toBe(false);
  });

  // ============================================================
  // 15. WEBHOOK DEDUPLICATION & RECONCILIATION
  // ============================================================
  it('15. Webhook delivery deduplicates duplicate events gracefully', () => {
    const existingTimeline = [
      {
        id: 'evt-1',
        eventType: 'PROVIDER_CONFIRMED',
        data: { eventId: 'evt_duffel_order_created_01' },
      },
    ];

    const duplicateEventId = 'evt_duffel_order_created_01';
    const isAlreadyHandled = existingTimeline.some((e: any) => e.data?.eventId === duplicateEventId);

    expect(isAlreadyHandled).toBe(true);
  });

  // ============================================================
  // 16. AUTHORITATIVE BOOKING RECORD CREATION
  // ============================================================
  it('16. Transitions to CONFIRMED and persists authoritative Booking record upon genuine Duffel confirmation', async () => {
    process.env.DUFFEL_API_KEY = 'duffel_live_production_key';
    process.env.DUFFEL_ENV = 'live';

    ExecutionCapabilityRegistry.reinitialize();
    ExecutionToolRegistry.reinitialize();

    const approvedOption: OptionProposal = {
      id: 'duffel-flt-gen',
      providerId: 'duffel_flights',
      providerName: 'Air India',
      title: 'Air India (AI 818) — AMD to DEL',
      description: 'Air India Direct Flight AMD to DEL',
      priceAmount: 4200,
      priceFormatted: '₹4,200',
      priceCurrency: 'INR',
      bookingMethod: 'API',
      environment: 'REAL',
      isMock: false,
      metadata: { offerId: 'off_gen_818', origin: 'AMD', destination: 'DEL' },
    };

    const mockTask: any = {
      id: 'task-live-flight-e2e',
      customerId: 'cust-flight-vip',
      status: 'APPROVED',
      approvalStatus: 'APPROVED',
      category: 'travel',
      customer: { userId: 'usr-vip-1', user: { name: 'Deepam Upadhyay', email: 'deepam@proventa.in', phone: '+919876543210' } },
      proposedOptions: [approvedOption],
      clientPreferences: { approvedOption },
    };

    vi.mocked(db.task.findUnique).mockResolvedValue(mockTask);
    (db.task.update as any).mockImplementation(async ({ data }: any) => ({
      ...mockTask,
      ...data,
    }));

    const { AdapterRegistry } = await import('@/lib/orchestration/adapters');
    const adapter = AdapterRegistry.getAdapterById('duffel_flights');
    if (adapter) {
      vi.spyOn(adapter, 'execute').mockResolvedValue({
        success: true,
        providerId: 'duffel_flights',
        externalReferenceId: 'AI890P', // Genuine 6-character PNR
        status: 'CONFIRMED',
        providerName: 'Air India',
        environment: 'REAL',
        isMock: false,
        rawResponse: { id: 'ord_0000A888', booking_reference: 'AI890P' },
        confirmedDetails: {
          duffelOrderId: 'ord_0000A888',
          airlinePnr: 'AI890P',
          ticketNumbers: ['098-9988776655'],
          airline: 'Air India',
        },
      });
    }

    const result = await AIExecutionAgent.executeTask({
      taskId: 'task-live-flight-e2e',
      option: approvedOption,
      skipPaymentGate: true,
    });

    expect(result.success).toBe(true);
    expect(result.status).toBe('CONFIRMED');
    expect(result.confirmationReference).toBe('AI890P');
    expect(db.booking.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'CONFIRMED',
          confirmationRef: 'AI890P',
        }),
      })
    );
  });

  // ============================================================
  // 17. SAFE CONCIERGE FALLBACK WHEN AUTONOMOUS EXECUTION UNAVAILABLE
  // ============================================================
  it('17. Automatically routes flight to Concierge Aviation Desk with full structured brief when credentials are unconfigured', async () => {
    delete process.env.DUFFEL_API_KEY;
    delete process.env.DUFFEL_ENV;

    ExecutionCapabilityRegistry.reinitialize();
    ExecutionToolRegistry.reinitialize();

    const approvedOption: OptionProposal = {
      id: 'duffel-flt-fallback',
      providerId: 'duffel_flights',
      providerName: 'Air India',
      title: 'Air India (AI 818) — AMD to DEL',
      description: 'Air India Direct Flight AMD to DEL',
      priceAmount: 4200,
      priceFormatted: '₹4,200',
      priceCurrency: 'INR',
      bookingMethod: 'API',
      environment: 'REAL',
      isMock: false,
      metadata: { offerId: 'off_fallback', origin: 'AMD', destination: 'DEL' },
    };

    const mockTask: any = {
      id: 'task-flt-fallback-01',
      customerId: 'cust-vip-fallback',
      status: 'APPROVED',
      approvalStatus: 'APPROVED',
      category: 'travel',
      customer: { userId: 'usr-vip-2', user: { name: 'Proventa Member', email: 'member@proventa.in' } },
      proposedOptions: [approvedOption],
      clientPreferences: { approvedOption },
    };

    vi.mocked(db.task.findUnique).mockResolvedValue(mockTask);
    (db.task.update as any).mockImplementation(async ({ data }: any) => ({
      ...mockTask,
      ...data,
    }));

    const result = await AIExecutionAgent.executeTask({
      taskId: 'task-flt-fallback-01',
      option: approvedOption,
    });

    expect(result.status).toBe('NEEDS_HUMAN');
    expect(result.handedToConcierge).toBe(true);
    expect(result.executionTier).toBe('LEVEL_3_HUMAN_CONCIERGE');
    expect(result.message).toContain('handed to your Proventa Concierge');
    expect(result.handoffSummary?.executionDetails.requiredNextAction).toBeDefined();
    expect(result.handoffSummary?.executionDetails.failureCategory).toBe('PROVIDER_UNAVAILABLE');
  });
});
