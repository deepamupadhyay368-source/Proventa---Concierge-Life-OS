import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock authentication & notifications
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

vi.mock('@/lib/orchestration/timeline', () => ({
  appendTaskEvent: vi.fn().mockResolvedValue({ id: 'evt-test-123' }),
}));

import { FlightsAdapter } from '@/lib/orchestration/adapters/flights.adapter';
import { AmadeusFlightProvider } from '@/lib/providers/production/amadeus-flight-provider';
import { CapabilityRegistry } from '@/lib/capabilities/capability-registry';
import { flightSearchTool, flightBookTicketTool } from '@/lib/mcp/tools/travel';
import { understandRequest } from '@/lib/ai/agents/understanding';
import { TaskDecisionEngine } from '@/lib/capabilities/task-decision-engine';
import { POST as manualConfirmHandler } from '@/app/api/tasks/[id]/manual-confirm/route';
import { requireConcierge } from '@/lib/auth/session';
import { AuthorizationError } from '@/lib/errors';
import { db } from '@/lib/db';

describe('Phase 6 — Real Flight Execution Engine & Amadeus GDS Integration', () => {
  const flightsAdapter = new FlightsAdapter();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('1. Natural Language Intent & Search Parameter Extraction', () => {
    it('accurately parses flight intent, origin, destination, cabin, and passengers', async () => {
      const prompt = 'Book me 2 business class flight tickets from Ahmedabad to Mumbai for tomorrow morning';
      const extracted = await understandRequest(prompt);

      expect(extracted.serviceCategory).toBe('TRAVEL');
      expect(extracted.destination).toBe('Mumbai');
      expect(extracted.guests).toBe(2);
      expect(extracted.executionRequired).toBe(true);

      const decision = TaskDecisionEngine.evaluate({ rawInput: prompt });
      expect(decision.category).toBe('TRAVEL');
      expect(decision.approvalRequired).toBe(true);
      expect(['PROVIDER_API', 'HUMAN_CONCIERGE']).toContain(decision.executionMode);
    });

    it('identifies specialist suitability via CapabilityRegistry', () => {
      const cap = CapabilityRegistry.getCapability('TRAVEL');
      expect(cap).toBeDefined();
      expect(cap.specialistAgent).toBe('Travel & Accommodations Agent');
      expect(cap.customerApprovalRequired).toBe(true);
      expect(cap.verificationMethod).toContain('genuine airline');
    });
  });

  describe('2. Amadeus Client Authentication & Graceful Fallback', () => {
    it('safely handles unconfigured Amadeus credentials without throwing or crashing', async () => {
      const provider = new AmadeusFlightProvider();
      
      // When credentials are not provided, getStatus() should return NOT_CONNECTED
      const status = await provider.getStatus();
      expect(status).toBe('NOT_CONNECTED');
      
      // Attempting search without credentials should gracefully return handled ProviderResult failure
      const results = await provider.searchFlights({
        origin: 'AMD',
        destination: 'BOM',
        departureDate: '2026-10-01',
        passengers: 1,
      });

      expect(results.success).toBe(false);
      expect(results.error?.code).toBe('PROVIDER_NOT_CONNECTED');
    });

    it('fails safely with clear error if createBooking is attempted without connected credentials', async () => {
      const provider = new AmadeusFlightProvider();
      const booking = await provider.createBooking({
        flightId: 'flt-offer-test-1',
        fareKey: 'fare-key-1',
        contactEmail: 'aarav@vip.proventa.in',
        contactPhone: '+919876543210',
        passengers: [
          {
            title: 'MR',
            firstName: 'Aarav',
            lastName: 'Shah',
            dateOfBirth: '1990-01-01',
          },
        ],
      });

      expect(booking.success).toBe(false);
      expect(booking.status).toBe('FAILED');
      expect(booking.error?.code).toBe('PROVIDER_NOT_CONNECTED');
    });
  });

  describe('3. Flight Offer Normalization & Curated Schedule Intelligence', () => {
    it('normalizes flight inventory with verified flight numbers, baggage, and route metadata', async () => {
      const offers = await flightsAdapter.search({
        category: 'flights',
        rawInput: 'Fly from Ahmedabad to Delhi business class for 2 passengers',
      });

      expect(offers.length).toBeGreaterThanOrEqual(1);

      const topOffer = offers[0];
      expect(topOffer.providerId).toBe('amadeus_flights');
      expect(topOffer.priceAmount).toBeGreaterThan(5000);
      expect(topOffer.priceCurrency).toBe('INR');
      expect(topOffer.priceFormatted).toContain('₹');
      expect(topOffer.metadata).toBeDefined();
      expect(topOffer.metadata?.departureAirport).toBe('AMD');
      expect(topOffer.metadata?.arrivalAirport).toBe('DEL');
      expect(topOffer.metadata?.carrier).toBeDefined();
      expect(topOffer.metadata?.flightNumber).toBeDefined();
      expect(topOffer.metadata?.cabinClass).toBe('BUSINESS');
      expect(topOffer.metadata?.baggage).toBeDefined();
    });

    it('MCP aviation tools enforce schemas and execute structured flight search', async () => {
      expect(flightSearchTool.riskLevel).toBe('READ_ONLY');
      expect(flightBookTicketTool.riskLevel).toBe('CONSEQUENTIAL_FINANCIAL');
      expect(flightBookTicketTool.requiresApproval).toBe(true);

      const res = await flightSearchTool.execute(
        {
          origin: 'AMD',
          destination: 'BOM',
          departureDate: '2026-10-01',
          travelClass: 'BUSINESS',
          passengers: 2,
        },
        { userId: 'usr-vip-1', idempotencyKey: 'idemp-flt-001' }
      );

      expect(res.success).toBe(true);
      expect((res.data as any)?.flights?.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('4. Mandatory Customer Approval (No Auto-Purchase)', () => {
    it('enforces customer approval before any flight ticket execution', () => {
      const decision = TaskDecisionEngine.evaluate({
        rawInput: 'Book 2 tickets to Bangalore on Vistara',
      });

      expect(decision.approvalRequired).toBe(true);
      expect(decision.requiresHumanHandoff).toBe(true);
      expect(decision.explanation).toContain('approval');
    });
  });

  describe('5. Strict Zero-Fabrication Mandate (Adapter & Execution Gate)', () => {
    it('rejects simulated or synthetic PNR formats in flight verification', async () => {
      const fakePnrs = [
        'PV-FLIGHT-999',
        'PV-AMD-BOM-12',
        'MOCK-AIRLINE-PNR',
        'DEMO-TICKET-77',
        'SANDBOX-PNR-TEST',
        'TEST-PNR',
        'FAKE-PNR',
      ];

      for (const fakePnr of fakePnrs) {
        const result = await flightsAdapter.verify(fakePnr);
        expect(result.verified).toBe(false);
        expect(result.status).toBe('FAILED');
      }
    });

    it('verifies genuine airline GDS PNR formats (e.g. 6-character alphanumeric)', async () => {
      const genuinePnrs = ['AI-9X4K2P', '6E-W8P9Q', 'UK-5K7M9P', 'GDS882K'];

      for (const pnr of genuinePnrs) {
        const result = await flightsAdapter.verify(pnr);
        expect(result.verified).toBe(true);
        expect(result.status).toBe('CONFIRMED');
      }
    });
  });

  describe('6. Human Concierge Fallback & Call Sheet Generation', () => {
    it('escalates to AWAITING_CONCIERGE_CALL with structured flight dispatch brief when automated GDS is unavailable', async () => {
      const offers = await flightsAdapter.search({
        category: 'flights',
        rawInput: 'Ahmedabad to Mumbai flights',
      });

      const selectedOffer = offers[0];
      const execution = await flightsAdapter.execute(selectedOffer, { guests: 2 });

      expect(execution.success).toBe(true);
      expect(execution.status).toBe('AWAITING_CONCIERGE_CALL');
      expect(execution.externalReferenceId).toBeUndefined(); // Strictly zero fake PNR

      const dispatch = (execution.confirmedDetails as any)?.dispatchPayload;
      expect(dispatch).toBeDefined();
      expect(dispatch.carrier).toBeDefined();
      expect(dispatch.flightNumber).toBeDefined();
      expect(dispatch.origin).toBe('AMD');
      expect(dispatch.destination).toBe('BOM');
      expect(dispatch.bookingMethod).toBe('CONCIERGE_GDS_DESK');
      expect(dispatch.requiresConciergeCall).toBe(true);
    });
  });

  describe('7. Manual Operator Confirmation & Booking Record Creation', () => {
    it('rejects synthetic PNR input in manual-confirm API endpoint', async () => {
      vi.mocked(requireConcierge).mockResolvedValueOnce({
        id: 'usr-concierge-1',
        role: 'SUPER_ADMIN',
        email: 'founder@proventa.in',
        name: 'Chief Concierge',
      } as any);

      const req = new NextRequest('http://localhost:3000/api/tasks/tsk-test-1/manual-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confirmationRef: 'PV-FAKE-12345',
          vendorName: 'Air India',
        }),
      });

      const res = await manualConfirmHandler(req, { params: Promise.resolve({ id: 'tsk-test-1' }) });
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toContain('zero-fabrication policy');
    });

    it('accepts authentic airline PNR, marks task CONFIRMED, and creates booking record', async () => {
      vi.mocked(requireConcierge).mockResolvedValueOnce({
        id: 'usr-concierge-1',
        role: 'SUPER_ADMIN',
        email: 'founder@proventa.in',
        name: 'Senior Concierge',
      } as any);

      // Mock database lookup & updates
      const mockTask = {
        id: 'tsk-flight-test',
        publicId: 'TSK-9901',
        status: 'NEEDS_HUMAN',
        category: 'travel',
        intent: 'Flight to Mumbai',
        originalRequest: 'Book me flight to Mumbai',
        customerId: 'cust-test-123',
        requestId: 'req-flight-123',
        vendorName: 'Air India',
        customer: {
          user: {
            name: 'Aarav Shah',
            email: 'aarav@vip.proventa.in',
            phone: '+91 98765 43210',
          },
        },
      };

      vi.spyOn(db.task, 'findUnique').mockResolvedValueOnce(mockTask as any);
      vi.spyOn(db.task, 'update').mockResolvedValueOnce({
        ...mockTask,
        status: 'CONFIRMED',
        externalReferenceId: 'AI-8F92KM',
      } as any);
      vi.spyOn(db.booking, 'create').mockResolvedValueOnce({ id: 'bkg-123' } as any);

      const req = new NextRequest('http://localhost:3000/api/tasks/tsk-flight-test/manual-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confirmationRef: 'AI-8F92KM',
          vendorName: 'Air India SVPIA Desk',
          notes: 'Issued via Air India corporate ticketing portal. Seat 2A, 2B.',
        }),
      });

      const res = await manualConfirmHandler(req, { params: Promise.resolve({ id: 'tsk-flight-test' }) });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.task.status).toBe('CONFIRMED');
      expect(data.task.externalReferenceId).toBe('AI-8F92KM');
      expect(db.booking.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            confirmationRef: 'AI-8F92KM',
            customerId: 'cust-test-123',
            status: 'CONFIRMED',
          }),
        })
      );
    });
  });

  describe('8. Customer Isolation & Security Policy', () => {
    it('blocks non-concierge / unauthorized users from confirming tasks', async () => {
      vi.mocked(requireConcierge).mockRejectedValueOnce(
        new AuthorizationError('Forbidden: Concierge or Admin privilege required')
      );

      const req = new NextRequest('http://localhost:3000/api/tasks/tsk-flight-test/manual-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confirmationRef: 'AI-8F92KM',
        }),
      });

      const res = await manualConfirmHandler(req, { params: Promise.resolve({ id: 'tsk-flight-test' }) });
      const data = await res.json();

      expect(res.status).toBe(403);
      expect(data.error).toContain('Concierge or Admin privilege required');
    });
  });
});
