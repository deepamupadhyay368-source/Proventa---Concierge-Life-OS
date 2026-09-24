import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock authentication, notifications, and emails
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

import { RequestOrchestrator } from '@/lib/orchestration/orchestrator';
import { POST as manualConfirmHandler } from '@/app/api/tasks/[id]/manual-confirm/route';
import { POST as approveHandler } from '@/app/api/tasks/[id]/approve/route';
import { requireConcierge, requireAuth } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { OptionProposal } from '@/lib/orchestration/types';

describe('Execution Rejection Fix & Human Concierge Fallback Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Test 1: Real provider execution succeeds with genuine reference
  it('1. real provider execution succeeds with genuine reference and transitions to CONFIRMED', async () => {
    const mockTask = {
      id: 'task-real-1',
      publicId: 'TSK-REAL-01',
      category: 'dining',
      intent: 'Dinner reservation at Agashiye',
      originalRequest: 'Dinner reservation at Agashiye',
      status: 'AWAITING_APPROVAL',
      executionMethod: 'API',
      customerId: 'cust-123',
      clientPreferences: {},
    };

    const mockProposal: OptionProposal = {
      id: 'opt-real-1',
      providerId: 'ahmedabad_verified',
      providerName: 'Agashiye — The House of MG',
      title: 'Heritage Thali Dinner',
      description: 'Gujarati thali dinner terrace seating',
      priceAmount: 2400,
      priceCurrency: 'INR',
      priceFormatted: '₹2,400',
      availability: 'Confirmed Available',
      bookingMethod: 'API',
      environment: 'REAL',
      isMock: false,
    };

    vi.spyOn(db.task, 'findUnique').mockResolvedValue(mockTask as any);
    (vi.spyOn(db.task, 'update') as any).mockImplementation(async ({ data }: any) => ({
      ...mockTask,
      ...data,
    }) as any);
    vi.spyOn(db.booking, 'create').mockResolvedValue({ id: 'bkg-1' } as any);

    // Mock agent executing with real reference
    const mockAgent = {
      execute: vi.fn().mockResolvedValue({
        success: true,
        providerId: 'ahmedabad_verified',
        externalReferenceId: 'AGS-VERIFIED-TABLE-14',
        environment: 'REAL',
        isMock: false,
        confirmedDetails: { table: 'Terrace Table 4' },
      }),
      verify: vi.fn().mockResolvedValue({
        verified: true,
        environment: 'REAL',
        isMock: false,
      }),
    };

    const { findAgentForTask } = await import('@/lib/orchestration/agents');
    vi.spyOn({ findAgentForTask }, 'findAgentForTask').mockReturnValue(mockAgent as any);

    const result = await RequestOrchestrator.executeApprovedTask({
      taskId: 'task-real-1',
      option: mockProposal,
      userId: 'usr-1',
    });

    expect(result.success).toBe(true);
  });

  // Test 2: Missing provider API routes to human concierge
  it('2. missing provider API or sandbox adapter routes seamlessly to human concierge without dead-end rejection', async () => {
    const mockTask = {
      id: 'task-fallback-1',
      publicId: 'TSK-FALLBACK-01',
      category: 'hotels',
      intent: 'Book luxury hotel in Delhi',
      originalRequest: 'Book luxury hotel in Delhi',
      status: 'AWAITING_APPROVAL',
      paymentStatus: 'CAPTURED',
      executionMethod: 'API',
      customerId: 'cust-123',
      clientPreferences: {
        preparedContext: {
          destination: 'Delhi',
          location: 'Delhi',
        },
      },
    };

    const mockProposal: OptionProposal = {
      id: 'opt-sandbox-1',
      providerId: 'mock_hotel',
      providerName: 'The Imperial, New Delhi',
      title: 'Heritage Suite',
      description: 'Luxury suite',
      priceAmount: 26000,
      priceCurrency: 'INR',
      priceFormatted: '₹26,000',
      availability: 'Available',
      bookingMethod: 'API',
      environment: 'SANDBOX',
      isMock: true,
      metadata: { city: 'Delhi', arrivalCity: 'Delhi' },
    };

    vi.spyOn(db.task, 'findUnique').mockResolvedValue(mockTask as any);
    const updateSpy = (vi.spyOn(db.task, 'update') as any).mockImplementation(async ({ data }: any) => ({
      ...mockTask,
      ...data,
    }) as any);

    const result = await RequestOrchestrator.executeApprovedTask({
      taskId: 'task-fallback-1',
      option: mockProposal,
      userId: 'usr-1',
    });

    // Must be success: true, handedToConcierge: true
    expect(result.success).toBe(true);
    expect((result as any).handedToConcierge).toBe(true);
    expect(result.message).toBe('Your request is approved and has been handed to your Proventa Concierge for execution.');

    // Status in DB must be NEEDS_HUMAN, executionMethod HUMAN_CONCIERGE, failedReason null
    expect(updateSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'task-fallback-1' },
        data: expect.objectContaining({
          status: 'NEEDS_HUMAN',
          executionMethod: 'HUMAN_CONCIERGE',
          isEscalated: true,
          failedReason: null,
        }),
      })
    );
  });

  // Test 3: Provider API failure routes to human concierge
  it('3. provider API execution failure escalates gracefully to human concierge instead of rejecting', async () => {
    const mockTask = {
      id: 'task-fail-1',
      publicId: 'TSK-FAIL-01',
      category: 'dining',
      intent: 'Fine dining booking',
      originalRequest: 'Fine dining booking',
      status: 'AWAITING_APPROVAL',
      executionMethod: 'API',
      customerId: 'cust-123',
      clientPreferences: {},
    };

    const mockProposal: OptionProposal = {
      id: 'opt-fail-1',
      providerId: 'swiggy',
      providerName: 'Swiggy Dineout',
      title: 'Dineout Table',
      description: 'Dinner table',
      priceAmount: 1500,
      priceCurrency: 'INR',
      priceFormatted: '₹1,500',
      availability: 'Available',
      bookingMethod: 'API',
      environment: 'REAL',
      isMock: false,
    };

    vi.spyOn(db.task, 'findUnique').mockResolvedValue(mockTask as any);
    const updateSpy = (vi.spyOn(db.task, 'update') as any).mockImplementation(async ({ data }: any) => ({
      ...mockTask,
      ...data,
    }) as any);

    // Mock agent executing with failure
    const mockAgent = {
      execute: vi.fn().mockResolvedValue({
        success: false,
        providerId: 'swiggy',
        errorMessage: 'Partner gateway 504 Gateway Timeout',
        environment: 'REAL',
        isMock: false,
      }),
      verify: vi.fn(),
    };

    const { findAgentForTask } = await import('@/lib/orchestration/agents');
    vi.spyOn({ findAgentForTask }, 'findAgentForTask').mockReturnValue(mockAgent as any);

    const result = await RequestOrchestrator.executeApprovedTask({
      taskId: 'task-fail-1',
      option: mockProposal,
      userId: 'usr-1',
    });

    expect(result.success).toBe(true);
    expect((result as any).handedToConcierge).toBe(true);
    expect(result.message).toBe('Your request is approved and has been handed to your Proventa Concierge for execution.');

    expect(updateSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'task-fail-1' },
        data: expect.objectContaining({
          status: 'NEEDS_HUMAN',
          executionMethod: 'HUMAN_CONCIERGE',
          isEscalated: true,
          failedReason: null,
        }),
      })
    );
  });

  // Test 4: Fake reference is rejected
  it('4. strictly rejects synthetic references (PV-*, MOCK-*, FAKE-*, DEMO-*, TEST-*) in manual confirmation', async () => {
    vi.mocked(requireConcierge).mockResolvedValue({
      id: 'usr-concierge-1',
      roles: ['SUPER_ADMIN', 'CONCIERGE'],
      email: 'concierge@proventa.in',
    } as any);

    const fakeRefs = [
      'PV-12345',
      'PV-AMD-999',
      'MOCK-HOTEL-88',
      'FAKE-PNR-77',
      'DEMO-CONF-11',
      'TEST-REF-00',
      'SANDBOX-PASS-22',
      'none',
      'N/A',
    ];

    for (const ref of fakeRefs) {
      const req = new NextRequest('http://localhost:3000/api/tasks/task-test-id/manual-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confirmationRef: ref,
          vendorName: 'Air India',
        }),
      });

      const res = await manualConfirmHandler(req, { params: Promise.resolve({ id: 'task-test-id' }) });
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBeDefined();
    }
  });

  // Test 5: Human-entered genuine reference is accepted
  it('5. accepts human-entered authentic airline/hotel reference and creates booking record', async () => {
    vi.mocked(requireConcierge).mockResolvedValue({
      id: 'usr-concierge-1',
      roles: ['SUPER_ADMIN', 'CONCIERGE'],
      email: 'concierge@proventa.in',
    } as any);

    const mockTask = {
      id: 'task-human-1',
      publicId: 'TSK-0088',
      status: 'NEEDS_HUMAN',
      category: 'travel',
      intent: 'Flight to Delhi',
      originalRequest: 'Flight to Delhi',
      customerId: 'cust-123',
      requestId: 'req-parent-1',
      vendorName: 'Air India',
      customer: {
        user: { name: 'Aarav Shah', email: 'aarav@proventa.in', phone: '+919876543210' },
      },
    };

    vi.spyOn(db.task, 'findUnique').mockResolvedValue(mockTask as any);
    const updateSpy = vi.spyOn(db.task, 'update').mockResolvedValue({
      ...mockTask,
      status: 'CONFIRMED',
      externalReferenceId: 'AI-DEL-9842K',
    } as any);
    const bookingSpy = vi.spyOn(db.booking, 'create').mockResolvedValue({ id: 'bkg-new-1' } as any);

    const req = new NextRequest('http://localhost:3000/api/tasks/task-human-1/manual-confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        confirmationRef: 'AI-DEL-9842K',
        vendorName: 'Air India SVPIA Desk',
        notes: 'Booked directly via Air India GDS. Seats 2A, 2B.',
      }),
    });

    const res = await manualConfirmHandler(req, { params: Promise.resolve({ id: 'task-human-1' }) });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);

    expect(updateSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'CONFIRMED',
          externalReferenceId: 'AI-DEL-9842K',
          vendorName: 'Air India SVPIA Desk',
        }),
      })
    );
    expect(bookingSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          confirmationRef: 'AI-DEL-9842K',
          status: 'CONFIRMED',
        }),
      })
    );
  });

  // Test 6: Task is never marked BOOKED without genuine confirmation
  it('6. ensures task is never transitioned to CONFIRMED or BOOKED without an authentic reference', async () => {
    vi.mocked(requireConcierge).mockResolvedValue({
      id: 'usr-concierge-1',
      roles: ['SUPER_ADMIN', 'CONCIERGE'],
      email: 'concierge@proventa.in',
    } as any);

    // Empty reference
    const req = new NextRequest('http://localhost:3000/api/tasks/task-test-id/manual-confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        confirmationRef: '',
        vendorName: 'Air India',
      }),
    });

    const res = await manualConfirmHandler(req, { params: Promise.resolve({ id: 'task-test-id' }) });
    expect(res.status).toBe(400);

    const updateSpy = vi.spyOn(db.task, 'update');
    expect(updateSpy).not.toHaveBeenCalled();
  });

  // Test 7: Customer receives correct execution status
  it('7. verifies customer approve endpoint returns polite concierge execution message without rejection', async () => {
    vi.mocked(requireAuth).mockResolvedValue({
      id: 'usr-cust-1',
      roles: ['CUSTOMER'],
      email: 'client@proventa.in',
    } as any);

    const mockTask = {
      id: 'task-approve-1',
      publicId: 'TSK-0099',
      status: 'AWAITING_APPROVAL',
      category: 'travel',
      intent: 'Flight to Delhi',
      originalRequest: 'Flight to Delhi',
      customerId: 'cust-123',
      customer: { userId: 'usr-cust-1' },
      proposedOptions: [
        {
          id: 'opt-flight-delhi',
          providerId: 'mock_flight',
          providerName: 'Air India Priority',
          title: 'Air India Business Class AMD to DEL',
          environment: 'SANDBOX',
          isMock: true,
          metadata: { arrivalAirport: 'DEL', destination: 'Delhi' },
        },
      ],
      clientPreferences: {
        preparedContext: { destination: 'Delhi', location: 'Delhi' },
      },
    };

    vi.spyOn(db.task, 'findUnique').mockResolvedValue(mockTask as any);
    (vi.spyOn(db.task, 'update') as any).mockImplementation(async ({ data }: any) => ({
      ...mockTask,
      ...data,
    }) as any);

    const req = new NextRequest('http://localhost:3000/api/tasks/task-approve-1/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ optionId: 'opt-flight-delhi' }),
    });

    const res = await approveHandler(req, { params: Promise.resolve({ id: 'task-approve-1' }) });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.message).toContain('Your request is approved and has been handed to your Proventa Concierge for execution.');
    expect(json.message).not.toContain('rejected');
  });

  // Test 8: Original destination/location/request constraints remain unchanged
  it('8. preserves exact customer origin, destination, and constraints during handoff to concierge', async () => {
    const mockTask = {
      id: 'task-preservation-1',
      publicId: 'TSK-0100',
      status: 'AWAITING_APPROVAL',
      paymentStatus: 'CAPTURED',
      category: 'travel',
      intent: 'Fly from Ahmedabad to Delhi business class for 2 passengers',
      originalRequest: 'Fly from Ahmedabad to Delhi business class for 2 passengers',
      customerId: 'cust-123',
      clientPreferences: {
        preparedContext: {
          origin: 'Ahmedabad',
          originAirport: 'AMD',
          destination: 'Delhi',
          destinationAirport: 'DEL',
          partySize: 2,
          cabinClass: 'BUSINESS',
        },
      },
    };

    const mockProposal: OptionProposal = {
      id: 'opt-flight-delhi',
      providerId: 'mock_flight',
      providerName: 'Air India Priority',
      title: 'Air India Business Class AMD to DEL',
      description: 'Air India Business Class flight AMD to DEL',
      priceAmount: 18000,
      priceCurrency: 'INR',
      priceFormatted: '₹18,000',
      availability: 'Available',
      bookingMethod: 'API',
      environment: 'SANDBOX',
      isMock: true,
      metadata: { arrivalAirport: 'DEL', departureAirport: 'AMD', destination: 'Delhi' },
    };

    vi.spyOn(db.task, 'findUnique').mockResolvedValue(mockTask as any);
    const updateSpy = (vi.spyOn(db.task, 'update') as any).mockImplementation(async ({ data }: any) => ({
      ...mockTask,
      ...data,
    }) as any);

    const result = await RequestOrchestrator.executeApprovedTask({
      taskId: 'task-preservation-1',
      option: mockProposal,
      userId: 'usr-1',
    });

    expect(result.success).toBe(true);
    expect(updateSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          clientPreferences: expect.objectContaining({
            preparedContext: expect.objectContaining({
              origin: 'Ahmedabad',
              originAirport: 'AMD',
              destination: 'Delhi',
              destinationAirport: 'DEL',
              partySize: 2,
            }),
            approvedOption: expect.objectContaining({
              id: 'opt-flight-delhi',
              title: 'Air India Business Class AMD to DEL',
            }),
          }),
        }),
      })
    );
  });
});
