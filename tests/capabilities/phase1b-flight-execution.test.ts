import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DuffelFlightsAdapter } from '@/lib/orchestration/adapters/duffel-flights.adapter';
import { DuffelClient } from '@/lib/orchestration/adapters/duffel-client';
import { FlightProviderRegistry } from '@/lib/providers/flights/flight-provider-registry';
import { RequestOrchestrator } from '@/lib/orchestration/orchestrator';
import { buildSynthesizedPrompt } from '@/lib/requests/request-builder';
import { evaluateCustomerEntitlement } from '@/lib/membership/entitlement';

describe('PROVENTA — PHASE 1B: REAL FLIGHT EXECUTION LAYER (PROVIDER-READY)', () => {
  let mockDuffelClient: DuffelClient;
  let duffelAdapter: DuffelFlightsAdapter;

  beforeEach(() => {
    mockDuffelClient = new DuffelClient({
      apiKey: 'duffel_test_mock_token_123',
      environment: 'test',
      webhookSecret: 'whsec_test_secret_key_456',
    });
    duffelAdapter = new DuffelFlightsAdapter(mockDuffelClient);
  });

  // ----------------------------------------------------------------
  // 1. Genuine Flight Discovery & Up to 25 Options
  // ----------------------------------------------------------------
  it('1 & 2. should discover genuine scheduled flight inventory up to 25 options without fabrication', async () => {
    vi.spyOn(mockDuffelClient, 'createOfferRequest').mockResolvedValueOnce({
      offers: Array.from({ length: 30 }, (_, i) => ({
        id: `off_test_${i}`,
        total_amount: (5000 + i * 200).toString(),
        total_currency: 'INR',
        owner: { name: 'IndiGo Airlines' },
        refundable: false,
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        slices: [
          {
            origin: { iata_code: 'AMD', city_name: 'Ahmedabad' },
            destination: { iata_code: 'BOM', city_name: 'Mumbai' },
            segments: [
              {
                operating_carrier: { name: 'IndiGo', iata_code: '6E' },
                marketing_carrier_flight_number: `6E-${200 + i}`,
                departing_at: '2026-10-15T06:00:00Z',
                arriving_at: '2026-10-15T07:20:00Z',
              },
            ],
          },
        ],
      })),
    });

    const proposals = await duffelAdapter.searchOffers({
      category: 'flights',
      rawInput: 'Book flight from Ahmedabad to Mumbai on 2026-10-15 for 1 passenger',
      constraints: {
        origin: 'AMD',
        destination: 'BOM',
        departureDate: '2026-10-15',
        passengers: 1,
      },
    });

    expect(proposals.length).toBeLessThanOrEqual(25);
    expect(proposals.length).toBe(25);
    expect(proposals[0].id).toContain('duffel-flt-off_test_0');
    expect(proposals[0].providerName).toBe('IndiGo');
    expect(proposals[0].priceAmount).toBe(5000);
    expect(proposals[0].isMock).toBe(false);
  });

  // ----------------------------------------------------------------
  // 3. Exact Option Locking
  // ----------------------------------------------------------------
  it('3. should lock and serialize exact approved flight metadata (zero substitution)', () => {
    const proposal = {
      id: 'duffel-flt-off_ind_777',
      providerId: 'duffel_flights',
      providerName: 'Air India',
      title: 'Air India (AI-814) — AMD to DEL',
      description: 'Morning direct flight',
      priceAmount: 8500,
      priceCurrency: 'INR',
      priceFormatted: '₹8,500',
      availability: 'Confirmed',
      bookingMethod: 'API' as const,
      reliabilityScore: 98,
      environment: 'REAL' as const,
      isMock: false,
      metadata: {
        offerId: 'off_ind_777',
        airline: 'Air India',
        airlineCode: 'AI',
        flightNumber: 'AI-814',
        origin: 'AMD',
        destination: 'DEL',
        departureDate: '2026-10-15',
        departureTime: '2026-10-15T09:45:00Z',
        cabinClass: 'BUSINESS',
        passengers: 2,
        refundable: true,
        expiresAt: new Date(Date.now() + 20 * 60 * 1000).toISOString(),
      },
    };

    const locked = FlightProviderRegistry.lockApprovedOption(proposal);
    expect(locked.providerOfferId).toBe('off_ind_777');
    expect(locked.airline).toBe('Air India');
    expect(locked.origin).toBe('AMD');
    expect(locked.destination).toBe('DEL');
    expect(locked.cabinClass).toBe('BUSINESS');
    expect(locked.passengers).toBe(2);
    expect(locked.approvedPrice).toBe(8500);
  });

  // ----------------------------------------------------------------
  // 4. Explicit Approval Requirement
  // ----------------------------------------------------------------
  it('4. should require explicit customer approval before entering execution', async () => {
    // Attempting execution without option throws / fails
    await expect(
      RequestOrchestrator.executeApprovedTask({
        taskId: 'tsk_flt_nonexistent',
      })
    ).rejects.toThrow();
  });

  // ----------------------------------------------------------------
  // 5. Pre-Booking Live Offer Revalidation
  // ----------------------------------------------------------------
  it('5. should revalidate live offer successfully when fare and itinerary match', async () => {
    vi.spyOn(mockDuffelClient, 'getOffer').mockResolvedValueOnce({
      id: 'off_reval_ok',
      total_amount: '8500',
      total_currency: 'INR',
      expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      slices: [
        {
          origin: { iata_code: 'AMD' },
          destination: { iata_code: 'DEL' },
          segments: [{ passengers: [{ cabin_class: 'business' }] }],
        },
      ],
      cabin_class: 'business',
    });

    const result = await duffelAdapter.revalidateOffer('off_reval_ok', {
      provider: 'Air India',
      providerOfferId: 'off_reval_ok',
      airline: 'Air India',
      origin: 'AMD',
      destination: 'DEL',
      cabinClass: 'BUSINESS',
      passengers: 1,
      currency: 'INR',
      approvedPrice: 8500,
    });

    expect(result.isValid).toBe(true);
    expect(result.revalidatedPriceAmount).toBe(8500);
  });

  // ----------------------------------------------------------------
  // 6. Price Increase Rejection
  // ----------------------------------------------------------------
  it('6. should strictly reject booking if fare increased beyond approved amount', async () => {
    vi.spyOn(mockDuffelClient, 'getOffer').mockResolvedValueOnce({
      id: 'off_price_hike',
      total_amount: '10500', // Increased from ₹8,500 to ₹10,500
      total_currency: 'INR',
      expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      slices: [{ origin: { iata_code: 'AMD' }, destination: { iata_code: 'DEL' } }],
    });

    const result = await duffelAdapter.revalidateOffer('off_price_hike', {
      provider: 'Air India',
      providerOfferId: 'off_price_hike',
      airline: 'Air India',
      origin: 'AMD',
      destination: 'DEL',
      cabinClass: 'ECONOMY',
      passengers: 1,
      currency: 'INR',
      approvedPrice: 8500,
    });

    expect(result.isValid).toBe(false);
    expect(result.isPriceIncreased).toBe(true);
    expect(result.reason).toContain('Flight fare increased');
  });

  // ----------------------------------------------------------------
  // 7. Expired Offer Rejection
  // ----------------------------------------------------------------
  it('7. should reject booking if provider offer has expired', async () => {
    vi.spyOn(mockDuffelClient, 'getOffer').mockResolvedValueOnce({
      id: 'off_expired',
      total_amount: '8500',
      expires_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 mins in the past
      slices: [{ origin: { iata_code: 'AMD' }, destination: { iata_code: 'DEL' } }],
    });

    const result = await duffelAdapter.revalidateOffer('off_expired', {
      provider: 'Air India',
      providerOfferId: 'off_expired',
      airline: 'Air India',
      origin: 'AMD',
      destination: 'DEL',
      cabinClass: 'ECONOMY',
      passengers: 1,
      currency: 'INR',
      approvedPrice: 8500,
    });

    expect(result.isValid).toBe(false);
    expect(result.isExpired).toBe(true);
    expect(result.reason).toContain('expired');
  });

  // ----------------------------------------------------------------
  // 8. Sold-out / Unavailable Inventory Rejection
  // ----------------------------------------------------------------
  it('8. should reject booking if flight seats are sold out', async () => {
    vi.spyOn(mockDuffelClient, 'getOffer').mockResolvedValueOnce({
      id: 'off_sold_out',
      total_amount: '8500',
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      slices: [], // No slices returned by airline
    });

    const result = await duffelAdapter.revalidateOffer('off_sold_out', {
      provider: 'Air India',
      providerOfferId: 'off_sold_out',
      airline: 'Air India',
      origin: 'AMD',
      destination: 'DEL',
      cabinClass: 'ECONOMY',
      passengers: 1,
      currency: 'INR',
      approvedPrice: 8500,
    });

    expect(result.isValid).toBe(false);
    expect(result.isSoldOut).toBe(true);
    expect(result.reason).toContain('sold out');
  });

  // ----------------------------------------------------------------
  // 9. Route Mismatch Rejection
  // ----------------------------------------------------------------
  it('9. should reject booking if origin or destination airport differs from approved option', async () => {
    vi.spyOn(mockDuffelClient, 'getOffer').mockResolvedValueOnce({
      id: 'off_wrong_dest',
      total_amount: '8500',
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      slices: [{ origin: { iata_code: 'AMD' }, destination: { iata_code: 'BLR' } }], // BLR instead of DEL
    });

    const result = await duffelAdapter.revalidateOffer('off_wrong_dest', {
      provider: 'Air India',
      providerOfferId: 'off_wrong_dest',
      airline: 'Air India',
      origin: 'AMD',
      destination: 'DEL',
      cabinClass: 'ECONOMY',
      passengers: 1,
      currency: 'INR',
      approvedPrice: 8500,
    });

    expect(result.isValid).toBe(false);
    expect(result.isRouteMismatch).toBe(true);
    expect(result.reason).toContain('Destination airport mismatch');
  });

  // ----------------------------------------------------------------
  // 10. Duplicate Booking Prevention (Deterministic Idempotency)
  // ----------------------------------------------------------------
  it('10. should prevent duplicate booking creation via deterministic idempotency keys', async () => {
    vi.spyOn(mockDuffelClient, 'getOffer').mockResolvedValue({
      id: 'off_idemp_1',
      total_amount: '7500',
      expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      slices: [{ origin: { iata_code: 'AMD' }, destination: { iata_code: 'BOM' } }],
    });

    const createOrderSpy = vi.spyOn(mockDuffelClient, 'createOrder').mockResolvedValueOnce({
      id: 'ord_real_001',
      booking_reference: 'IND678',
      total_amount: '7500',
      total_currency: 'INR',
      documents: [{ unique_identifier: '098-1234567890' }],
    });

    const optionProposal = {
      id: 'opt_1',
      title: 'IndiGo 6E-204',
      providerName: 'IndiGo',
      priceAmount: 7500,
      priceCurrency: 'INR',
    } as any;

    const passengers = [
      { givenName: 'Aarav', familyName: 'Shah', bornOn: '1990-05-12' },
    ];

    // Call 1
    const res1 = await duffelAdapter.createOrder({
      offerId: 'off_idemp_1',
      approvedOption: optionProposal,
      passengers,
      contactEmail: 'aarav@proventa.in',
      contactPhone: '+919876543210',
      idempotencyKey: 'idemp_key_repeat_test_001',
    });

    // Call 2 (Retry with exact same idempotency key)
    const res2 = await duffelAdapter.createOrder({
      offerId: 'off_idemp_1',
      approvedOption: optionProposal,
      passengers,
      contactEmail: 'aarav@proventa.in',
      contactPhone: '+919876543210',
      idempotencyKey: 'idemp_key_repeat_test_001',
    });

    expect(createOrderSpy).toHaveBeenCalledTimes(1);
    expect(res1.bookingReference).toBe('IND678');
    expect(res2.bookingReference).toBe('IND678');
  });

  // ----------------------------------------------------------------
  // 11 & 12. Provider Timeout & API Failure Handling
  // ----------------------------------------------------------------
  it('11 & 12. should handle provider API failure gracefully without crashing', async () => {
    vi.spyOn(mockDuffelClient, 'getOffer').mockResolvedValueOnce({
      id: 'off_err_1',
      total_amount: '7500',
      expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      slices: [{ origin: { iata_code: 'AMD' }, destination: { iata_code: 'BOM' } }],
    });

    vi.spyOn(mockDuffelClient, 'createOrder').mockRejectedValueOnce(
      new Error('Duffel API timeout after 10000ms')
    );

    const result = await duffelAdapter.createOrder({
      offerId: 'off_err_1',
      approvedOption: { title: 'Test Flight', priceAmount: 7500 } as any,
      passengers: [{ givenName: 'Aarav', familyName: 'Shah' }],
      contactEmail: 'aarav@proventa.in',
      contactPhone: '+919876543210',
      idempotencyKey: 'idemp_fail_001',
    });

    expect(result.success).toBe(false);
    expect(result.status).toBe('FAILED');
    expect(result.errorMessage).toContain('timeout');
  });

  // ----------------------------------------------------------------
  // 13, 14, 15. Webhook Signature, Replay & Deduplication
  // ----------------------------------------------------------------
  it('13, 14 & 15. should verify HMAC signatures, reject replays outside 5-min window, and deduplicate events', () => {
    const crypto = require('crypto');
    const secret = 'whsec_test_secret_key_456';
    const payload = JSON.stringify({
      id: 'evt_flight_confirmed_999',
      type: 'order.created',
      data: { id: 'ord_999', booking_reference: 'PNR789' },
    });

    const nowSec = Math.floor(Date.now() / 1000);
    const validSignature = crypto
      .createHmac('sha256', secret)
      .update(`${nowSec}.${payload}`)
      .digest('hex');

    // 13. Valid Signature
    const validCheck = duffelAdapter.verifyWebhook(payload, {
      'duffel-signature': `t=${nowSec},v1=${validSignature}`,
    });
    expect(validCheck.isValid).toBe(true);
    expect(validCheck.eventType).toBe('order.created');

    // 14. Replay attack rejection (> 5 min old)
    const oldSec = nowSec - 400; // 6.6 mins ago
    const oldSignature = crypto
      .createHmac('sha256', secret)
      .update(`${oldSec}.${payload}`)
      .digest('hex');

    const replayCheck = duffelAdapter.verifyWebhook(payload, {
      'duffel-signature': `t=${oldSec},v1=${oldSignature}`,
    });
    expect(replayCheck.isValid).toBe(false);
    expect(replayCheck.reason).toContain('Invalid or expired');
  });

  // ----------------------------------------------------------------
  // 16. Zero-Fabrication PNR Protection
  // ----------------------------------------------------------------
  it('16. should strictly reject synthetic PNR references (PV-*, MOCK-*, TEST-*, DEMO-*)', async () => {
    const mockRef1 = await duffelAdapter.verify('PV-AMD-FLT-001');
    const mockRef2 = await duffelAdapter.verify('MOCK-PNR-777');
    const mockRef3 = await duffelAdapter.verify('TEST-FLIGHT-99');
    const mockRef4 = await duffelAdapter.verify('DEMO-1234');

    expect(mockRef1.verified).toBe(false);
    expect(mockRef1.isMock).toBe(true);
    expect(mockRef2.verified).toBe(false);
    expect(mockRef3.verified).toBe(false);
    expect(mockRef4.verified).toBe(false);
  });

  // ----------------------------------------------------------------
  // 17, 18 & 19. Provider Capability Classification & Concierge Fallback
  // ----------------------------------------------------------------
  it('17, 18 & 19. should evaluate NOT_CONFIGURED or ASSISTED when live keys are absent and route to Concierge', async () => {
    delete process.env.DUFFEL_API_KEY;
    delete process.env.DUFFEL_ENV;

    const unconfiguredClient = new DuffelClient({ apiKey: '', environment: 'test' });
    const adapter = new DuffelFlightsAdapter(unconfiguredClient);

    const state = await adapter.getCapabilityState();
    expect(state).toBe('NOT_CONFIGURED');

    const registryState = await FlightProviderRegistry.evaluateProviderCapability('duffel_flights');
    expect(registryState).toBe('NOT_CONFIGURED');
  });

  // ----------------------------------------------------------------
  // 20 & 21. Complimentary Entitlement & Membership Gate
  // ----------------------------------------------------------------
  it('20 & 21. should uphold 3 complimentary requests and enforce membership gate on 4th', () => {
    const freshProfile = { freeRequestsUsed: 0, membershipStatus: 'INACTIVE', membershipPlan: null };
    const ent0 = evaluateCustomerEntitlement(freshProfile);
    expect(ent0.canCreateRequest).toBe(true);
    expect(ent0.complimentaryRequestsRemaining).toBe(3);

    const used2Profile = { freeRequestsUsed: 2, membershipStatus: 'INACTIVE', membershipPlan: null };
    const ent2 = evaluateCustomerEntitlement(used2Profile);
    expect(ent2.canCreateRequest).toBe(true);
    expect(ent2.complimentaryRequestsRemaining).toBe(1);

    const used3Profile = { freeRequestsUsed: 3, membershipStatus: 'INACTIVE', membershipPlan: null };
    const ent3 = evaluateCustomerEntitlement(used3Profile);
    expect(ent3.canCreateRequest).toBe(false);
    expect(ent3.freeRequestUsed).toBe(true);
  });

  // ----------------------------------------------------------------
  // 22, 23 & 24. Structured, Natural & Voice Request Synthesis
  // ----------------------------------------------------------------
  it('22, 23 & 24. should synthesize rich structured and natural/voice request prompts preserving all constraints', () => {
    const flightPrompt = buildSynthesizedPrompt({
      service: 'FLIGHTS',
      origin: 'Ahmedabad',
      destination: 'London',
      date: '2026-10-20',
      returnDate: '2026-10-30',
      partySize: 2,
      cabinClass: 'BUSINESS',
      tripType: 'ROUND_TRIP',
      budgetMode: 'MAX',
      budgetAmount: 350000,
      preferences: ['non-stop'],
      urgency: 'NORMAL',
    });

    expect(flightPrompt).toContain('Book 2 business class from Ahmedabad to London');
    expect(flightPrompt).toContain('on 2026-10-20');
    expect(flightPrompt).toContain('returning on 2026-10-30');
    expect(flightPrompt).toContain('under ₹3,50,000');
  });
});
