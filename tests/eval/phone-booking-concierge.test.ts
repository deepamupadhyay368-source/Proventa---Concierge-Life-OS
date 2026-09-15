import { describe, it, expect, vi, beforeEach } from 'vitest';

// Top-level mock for auth to avoid next-auth ESM resolution issue in Vitest
vi.mock('@/lib/auth/session', () => ({
  requireConcierge: vi.fn(),
  requireAuth: vi.fn(),
  requireRole: vi.fn(),
  requireAnyRole: vi.fn(),
  getSession: vi.fn(),
}));

import { AhmedabadVerifiedAdapter } from '@/lib/orchestration/adapters/ahmedabad-verified.adapter';
import { DiningAgent } from '@/lib/orchestration/agents';
import { RequestOrchestrator } from '@/lib/orchestration/orchestrator';
import { db } from '@/lib/db';
import { requireConcierge } from '@/lib/auth/session';
import { AuthorizationError } from '@/lib/errors';
import { POST as manualConfirmHandler } from '@/app/api/tasks/[id]/manual-confirm/route';
import { GET as queueHandler } from '@/app/api/concierge/queue/route';
import type { OptionProposal } from '@/lib/orchestration/types';

describe('Phase 2, Priority 1: Ahmedabad Verified Phone-Booking Workflow', () => {
  const adapter = new AhmedabadVerifiedAdapter();
  const diningAgent = new DiningAgent();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('1. Phone Venue Execution Safety & Dispatch Payload', () => {
    it('executes a phone-booking venue without generating synthetic PV-AMD references or marking CONFIRMED', async () => {
      const proposals = await adapter.search({
        category: 'dining',
        rawInput: 'Agashiye heritage thali for 4 guests tonight',
      });

      expect(proposals.length).toBeGreaterThan(0);
      const agashiyeProp = proposals.find((p) => p.title.toLowerCase().includes('agashiye')) || proposals[0];

      expect(agashiyeProp.bookingMethod).toBe('PHONE');
      expect(agashiyeProp.providerId).toBe('ahmedabad_verified');

      const execution = await adapter.execute(agashiyeProp, {
        guests: 4,
        scheduledTime: '2026-10-20T19:30:00Z',
        specialRequests: 'Heritage terrace seating, no onion/garlic',
      });

      // Strict requirements
      expect(execution.success).toBe(true);
      expect(execution.providerId).toBe('ahmedabad_verified');
      expect(execution.status).toBe('AWAITING_CONCIERGE_CALL');
      expect(execution.externalReferenceId).toBeUndefined(); // Strictly no synthetic PV-AMD reference!
      expect(execution.environment).toBe('REAL');
      expect(execution.isMock).toBe(false);

      // Structured concierge dispatch payload verification
      const dispatch = execution.confirmedDetails.dispatchPayload;
      expect(dispatch).toBeDefined();
      expect(dispatch.providerId).toBe('ahmedabad_verified');
      expect(dispatch.venueName).toContain('Agashiye');
      expect(dispatch.venuePhone).toBeTruthy();
      expect(dispatch.venuePhone).toContain('+91');
      expect(dispatch.partySize).toBe(4);
      expect(dispatch.requestedDate).toBe('2026-10-20');
      expect(dispatch.requestedTime).toBe('19:30');
      expect(dispatch.specialRequests).toContain('Heritage terrace');
      expect(dispatch.bookingMethod).toBe('PHONE');
      expect(dispatch.requiresConciergeCall).toBe(true);
      expect(dispatch.status).toBe('AWAITING_CONCIERGE_CALL');
      expect(dispatch.externalConfirmationRequired).toBe(true);
      expect(dispatch.isConfirmed).toBe(false);
    });

    it('returns pending status when verifying without external reference and rejects mock references', async () => {
      // Empty reference
      const emptyVerify = await adapter.verify('');
      expect(emptyVerify.verified).toBe(false);
      expect(emptyVerify.status).toBe('PENDING');

      // Synthetic mock reference rejection
      const mockVerify = await adapter.verify('PV-AMD-MOCK-999');
      expect(mockVerify.verified).toBe(false);
      expect(mockVerify.status).toBe('FAILED');

      // Genuine reference confirmation
      const realVerify = await adapter.verify('AGS-TERRACE-2026');
      expect(realVerify.verified).toBe(true);
      expect(realVerify.status).toBe('CONFIRMED');
      expect(realVerify.confirmationReference).toBe('AGS-TERRACE-2026');
      expect(realVerify.isMock).toBe(false);
    });
  });

  describe('2. Orchestrator Integration & Task Lifecycle', () => {
    it('transitions task to NEEDS_HUMAN with HUMAN_CONCIERGE when execution returns AWAITING_CONCIERGE_CALL', async () => {
      const mockTaskRecord = {
        id: 'task-amd-phone-001',
        category: 'dining',
        intent: 'Agashiye Table Reservation',
        originalRequest: 'Agashiye dinner table for 2',
        status: 'AWAITING_APPROVAL',
        partySize: 2,
        targetDate: new Date('2026-10-20T20:00:00Z'),
        clientPreferences: { seating: 'Terrace' },
        customer: { user: { name: 'Dev VIP', phone: '+919876543210' } },
        proposedOptions: [],
      };

      const optionProposal: OptionProposal = {
        id: 'prop-amd-agashiye',
        providerId: 'ahmedabad_verified',
        venueId: 'prov_agashiye_the_house_of_mg',
        providerName: 'Agashiye — The House of MG',
        title: 'Agashiye — Verified Reservation',
        description: 'Heritage rooftop Gujarati dining',
        priceAmount: 3700,
        priceCurrency: 'INR',
        priceFormatted: '₹3,700',
        bookingMethod: 'PHONE',
        environment: 'REAL',
        isMock: false,
      };

      vi.spyOn(db.task, 'findUnique').mockResolvedValue(mockTaskRecord as any);
      (vi.spyOn(db.task, 'update') as any).mockImplementation(async (args: any) => ({
        ...mockTaskRecord,
        ...args.data,
      }));
      vi.spyOn(db.taskEvent, 'create').mockResolvedValue({ id: 'evt-1' } as any);

      const result = await RequestOrchestrator.executeApprovedTask({
        taskId: mockTaskRecord.id,
        option: optionProposal,
      });

      expect(result.success).toBe(true);
      expect(result.task.status).toBe('NEEDS_HUMAN');
      expect(result.task.executionMethod).toBe('HUMAN_CONCIERGE');
      expect(result.task.isEscalated).toBe(true);
      expect(result.execution.status).toBe('AWAITING_CONCIERGE_CALL');
      expect(result.execution.externalReferenceId).toBeUndefined();

      // Ensure it was NOT marked CONFIRMED
      expect(result.task.status).not.toBe('CONFIRMED');
    });

    it('strictly prevents simulated, mock, or sandbox executions from being marked as CONFIRMED', async () => {
      const mockTaskRecord = {
        id: 'task-sandbox-001',
        category: 'dining',
        intent: 'Sandbox Dinner',
        originalRequest: 'Simulated dinner reservation',
        status: 'AWAITING_APPROVAL',
        partySize: 2,
        customer: { user: { name: 'Test User' } },
      };

      const mockOptionProposal: OptionProposal = {
        id: 'prop-mock-dining',
        providerId: 'mock_dining',
        providerName: 'Mock Culinary Suite',
        title: 'Simulated Dining',
        description: 'Mock Dining',
        priceAmount: 1500,
        priceCurrency: 'INR',
        priceFormatted: '₹1,500',
        environment: 'SANDBOX',
        isMock: true,
      };

      vi.spyOn(db.task, 'findUnique').mockResolvedValue(mockTaskRecord as any);
      (vi.spyOn(db.task, 'update') as any).mockImplementation(async (args: any) => ({
        ...mockTaskRecord,
        ...args.data,
      }));
      vi.spyOn(db.taskEvent, 'create').mockResolvedValue({ id: 'evt-sandbox' } as any);

      const result = await RequestOrchestrator.executeApprovedTask({
        taskId: mockTaskRecord.id,
        option: mockOptionProposal,
      });

      // Must be rejected from automated CONFIRMED status
      expect(result.success).toBe(false);
      expect(result.task.status).toBe('NEEDS_HUMAN');
      expect(result.task.failedReason).toContain('Simulated, mock, or sandbox');
      expect(result.task.status).not.toBe('CONFIRMED');
    });
  });

  describe('3. Concierge Manual Confirmation Authorization & Verification', () => {
    it('forbids customers from calling manual-confirm (returns 403)', async () => {
      vi.mocked(requireConcierge).mockRejectedValueOnce(
        new AuthorizationError('You do not have permission to perform this action')
      );

      const req = new Request('http://localhost:3000/api/tasks/task-123/manual-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confirmationRef: 'HOTEL-REF-101',
          vendorName: 'Agashiye',
        }),
      });

      const response = await manualConfirmHandler(req as any, { params: Promise.resolve({ id: 'task-123' }) });
      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.error).toContain('You do not have permission');
    });

    it('rejects empty or placeholder confirmation references', async () => {
      vi.mocked(requireConcierge).mockResolvedValue({
        id: 'concierge-user-01',
        email: 'concierge@proventa.in',
        name: 'Senior Concierge Lead',
        roles: ['CONCIERGE'] as any,
      });

      // Placeholder 'n/a'
      const reqPlaceholder = new Request('http://localhost:3000/api/tasks/task-123/manual-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confirmationRef: 'n/a',
          vendorName: 'Agashiye',
        }),
      });

      const resPlaceholder = await manualConfirmHandler(reqPlaceholder as any, { params: Promise.resolve({ id: 'task-123' }) });
      expect(resPlaceholder.status).toBe(400);
      const dataPlaceholder = await resPlaceholder.json();
      expect(dataPlaceholder.error).toContain('Invalid reference');

      // Empty reference
      const reqEmpty = new Request('http://localhost:3000/api/tasks/task-123/manual-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confirmationRef: '',
        }),
      });

      const resEmpty = await manualConfirmHandler(reqEmpty as any, { params: Promise.resolve({ id: 'task-123' }) });
      expect(resEmpty.status).toBe(400);
    });

    it('allows authorized concierge to confirm with genuine venue reference and transitions to CONFIRMED', async () => {
      vi.mocked(requireConcierge).mockResolvedValue({
        id: 'concierge-user-01',
        email: 'concierge@proventa.in',
        name: 'Senior Concierge Lead',
        roles: ['CONCIERGE'] as any,
      });

      const mockExistingTask = {
        id: 'task-needs-call-01',
        status: 'NEEDS_HUMAN',
        vendorName: 'Agashiye — The House of MG',
        customerId: 'cust-1',
        requestId: 'req-1',
        customer: { id: 'cust-1' },
      };

      vi.spyOn(db.task, 'findUnique').mockResolvedValue(mockExistingTask as any);
      const taskUpdateSpy = (vi.spyOn(db.task, 'update') as any).mockImplementation(async (args: any) => ({
        ...mockExistingTask,
        ...args.data,
      }));
      vi.spyOn(db.taskEvent, 'create').mockResolvedValue({ id: 'evt-confirm' } as any);
      vi.spyOn(db.booking, 'create').mockResolvedValue({ id: 'booking-1' } as any);

      const req = new Request('http://localhost:3000/api/tasks/task-needs-call-01/manual-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confirmationRef: 'AGS-DUTY-MGR-8821',
          vendorName: 'Agashiye — The House of MG',
          notes: 'Spoke directly with Mr. Hitesh (Duty Manager). Heritage table 14 reserved.',
        }),
      });

      const response = await manualConfirmHandler(req as any, { params: Promise.resolve({ id: 'task-needs-call-01' }) });
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.task.status).toBe('CONFIRMED');
      expect(data.task.externalReferenceId).toBe('AGS-DUTY-MGR-8821');

      // Verify db.task.update was called with CONFIRMED and genuine ref
      expect(taskUpdateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'task-needs-call-01' },
          data: expect.objectContaining({
            status: 'CONFIRMED',
            externalReferenceId: 'AGS-DUTY-MGR-8821',
          }),
        })
      );
    });
  });

  describe('4. Provider Identity & Routing Integrity', () => {
    it('preserves providerId as ahmedabad_verified from search to dispatch', async () => {
      const proposals = await adapter.search({
        category: 'dining',
        rawInput: 'Tinello dinner at Hyatt Regency',
      });

      const tinello = proposals.find((p) => p.title.toLowerCase().includes('tinello')) || proposals[0];
      expect(tinello.providerId).toBe('ahmedabad_verified');

      const execution = await diningAgent.execute({ partySize: 2 }, tinello);
      expect(execution.providerId).toBe('ahmedabad_verified');
      expect(execution.status).toBe('AWAITING_CONCIERGE_CALL');
      expect(execution.confirmedDetails.dispatchPayload.providerId).toBe('ahmedabad_verified');
    });
  });

  describe('5. Phase 2, Priority 2: Concierge Operations Call Desk & Queue Integration', () => {
    it('surfaces NEEDS_HUMAN tasks with dispatchPayload, customer details, and phone in GET /api/concierge/queue', async () => {
      vi.mocked(requireConcierge).mockResolvedValue({
        id: 'concierge-user-01',
        email: 'concierge@proventa.in',
        name: 'Senior Concierge Lead',
        roles: ['CONCIERGE'] as any,
      });

      const mockEscalatedTask = {
        id: 'task-amd-call-desk-01',
        publicId: 'TASK-AMD-778',
        status: 'NEEDS_HUMAN',
        executionMethod: 'HUMAN_CONCIERGE',
        category: 'dining',
        intent: 'Agashiye Heritage Thali for 4',
        originalRequest: 'Agashiye heritage thali for 4 guests tonight',
        proposedOptions: [
          {
            id: 'opt-agashiye',
            title: 'Agashiye Heritage Dining Experience',
            providerName: 'Agashiye — The House of MG',
            bookingMethod: 'PHONE',
            metadata: {
              phone: '+91 79 2550 6941',
              guests: 4,
            },
          },
        ],
        customer: {
          id: 'cust-vip-01',
          user: {
            name: 'Kavita Patel',
            email: 'kavita.patel@example.com',
            phone: '+91 98250 12345',
          },
          preferences: [],
        },
        events: [
          {
            id: 'evt-call-needed',
            eventType: 'AWAITING_CONCIERGE_CALL',
            actorRole: 'SYSTEM',
            message: 'Requires human concierge telephone reservation with partner venue',
            data: {
              dispatchPayload: {
                providerId: 'ahmedabad_verified',
                venueId: 'agashiye',
                venueName: 'Agashiye — The House of MG',
                venuePhone: '+91 79 2550 6941',
                requestedDate: '2026-10-20',
                requestedTime: '19:30',
                partySize: 4,
                specialRequests: 'Terrace seating requested, no onion/garlic',
                bookingMethod: 'PHONE',
                requiresConciergeCall: true,
                status: 'AWAITING_CONCIERGE_CALL',
                externalConfirmationRequired: true,
                isConfirmed: false,
              },
            },
            createdAt: new Date(),
          },
        ],
      };

      vi.spyOn(db.conciergeRequest, 'findMany').mockResolvedValue([]);
      vi.spyOn(db.task, 'findMany').mockResolvedValue([mockEscalatedTask as any]);

      const req = new Request('http://localhost:3000/api/concierge/queue', {
        method: 'GET',
      });

      const response = await queueHandler(req as any);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.escalatedTasks).toBeDefined();
      expect(data.escalatedTasks.length).toBe(1);

      const returnedTask = data.escalatedTasks[0];
      expect(returnedTask.id).toBe('task-amd-call-desk-01');
      expect(returnedTask.status).toBe('NEEDS_HUMAN');
      expect(returnedTask.executionMethod).toBe('HUMAN_CONCIERGE');

      // Verify customer details
      expect(returnedTask.customer.user.name).toBe('Kavita Patel');
      expect(returnedTask.customer.user.email).toBe('kavita.patel@example.com');
      expect(returnedTask.customer.user.phone).toBe('+91 98250 12345');

      // Verify events and dispatchPayload
      expect(returnedTask.events.length).toBe(1);
      const callEvent = returnedTask.events.find((e: any) => e.eventType === 'AWAITING_CONCIERGE_CALL');
      expect(callEvent).toBeDefined();
      const payload = callEvent.data.dispatchPayload;
      expect(payload.venueName).toBe('Agashiye — The House of MG');
      expect(payload.venuePhone).toBe('+91 79 2550 6941');
      expect(payload.requestedDate).toBe('2026-10-20');
      expect(payload.requestedTime).toBe('19:30');
      expect(payload.partySize).toBe(4);
      expect(payload.specialRequests).toContain('Terrace seating');
      expect(payload.requiresConciergeCall).toBe(true);
    });

    it('handles tasks with missing dispatch details gracefully with fallback defaults without fabricating data', async () => {
      vi.mocked(requireConcierge).mockResolvedValue({
        id: 'concierge-user-01',
        email: 'concierge@proventa.in',
        name: 'Senior Concierge Lead',
        roles: ['CONCIERGE'] as any,
      });

      // Task with no events and empty options
      const bareTask = {
        id: 'task-bare-001',
        publicId: 'TASK-BARE-001',
        status: 'NEEDS_HUMAN',
        executionMethod: 'HUMAN_CONCIERGE',
        category: 'dining',
        intent: 'Table inquiry',
        originalRequest: 'Inquiry without pre-populated venue',
        proposedOptions: [],
        customer: {
          id: 'cust-anon-01',
          user: {
            name: null,
            email: 'anon@example.com',
            phone: null,
          },
          preferences: [],
        },
        events: [],
      };

      vi.spyOn(db.conciergeRequest, 'findMany').mockResolvedValue([]);
      vi.spyOn(db.task, 'findMany').mockResolvedValue([bareTask as any]);

      const req = new Request('http://localhost:3000/api/concierge/queue', {
        method: 'GET',
      });

      const response = await queueHandler(req as any);
      expect(response.status).toBe(200);

      const data = await response.json();
      const returnedTask = data.escalatedTasks[0];
      expect(returnedTask.id).toBe('task-bare-001');

      // The extractCallSheet function should handle this bare task without crashing
      // Let's verify by testing the exact logic used in the UI
      const dispatchEvent = returnedTask.events?.find((e: any) => e.eventType === 'AWAITING_CONCIERGE_CALL');
      const payload = dispatchEvent?.data?.dispatchPayload || dispatchEvent?.data || {};
      const firstOption = Array.isArray(returnedTask.proposedOptions) ? returnedTask.proposedOptions[0] : null;

      const venueName = payload.venueName || returnedTask.vendorName || firstOption?.providerName || 'Not provided';
      const venuePhone = payload.venuePhone || firstOption?.metadata?.phone || null;
      const requestedDate = payload.requestedDate || 'Not provided';
      const requestedTime = payload.requestedTime || 'Not provided';
      const partySize = payload.partySize || 'Not provided';
      const specialRequests = payload.specialRequests || 'Not provided';
      const customerName = returnedTask.customer?.user?.name || 'Not provided';
      const customerPhone = returnedTask.customer?.user?.phone || null;

      expect(venueName).toBe('Not provided');
      expect(venuePhone).toBeNull();
      expect(requestedDate).toBe('Not provided');
      expect(requestedTime).toBe('Not provided');
      expect(partySize).toBe('Not provided');
      expect(specialRequests).toBe('Not provided');
      expect(customerName).toBe('Not provided');
      expect(customerPhone).toBeNull();
    });

    it('rejects unauthenticated or unauthorized access to GET /api/concierge/queue', async () => {
      vi.mocked(requireConcierge).mockRejectedValueOnce(
        new AuthorizationError('Concierge access required')
      );

      const req = new Request('http://localhost:3000/api/concierge/queue', {
        method: 'GET',
      });

      const response = await queueHandler(req as any);
      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.error).toContain('Concierge access required');
    });

    it('confirms phone booking through manual-confirm endpoint and removes task from NEEDS_HUMAN queue', async () => {
      vi.mocked(requireConcierge).mockResolvedValue({
        id: 'concierge-user-01',
        email: 'concierge@proventa.in',
        name: 'Senior Concierge Lead',
        roles: ['CONCIERGE'] as any,
      });

      const mockEscalatedTask = {
        id: 'task-phone-finish-01',
        status: 'NEEDS_HUMAN',
        executionMethod: 'HUMAN_CONCIERGE',
        vendorName: 'Agashiye — The House of MG',
        customerId: 'cust-1',
        requestId: 'req-1',
        customer: { id: 'cust-1' },
      };

      vi.spyOn(db.task, 'findUnique').mockResolvedValue(mockEscalatedTask as any);
      const taskUpdateSpy = (vi.spyOn(db.task, 'update') as any).mockImplementation(async (args: any) => ({
        ...mockEscalatedTask,
        ...args.data,
      }));
      vi.spyOn(db.taskEvent, 'create').mockResolvedValue({ id: 'evt-manual-conf' } as any);
      vi.spyOn(db.booking, 'create').mockResolvedValue({ id: 'booking-99' } as any);

      // Perform manual confirmation call from Concierge Queue Call Sheet
      const confirmReq = new Request('http://localhost:3000/api/tasks/task-phone-finish-01/manual-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confirmationRef: 'AGS-VERIFIED-TABLE-12',
          vendorName: 'Agashiye — The House of MG',
          notes: 'Spoke with duty manager Mr. Ramesh. Confirmed for 4 guests tonight at 19:30.',
        }),
      });

      const confirmRes = await manualConfirmHandler(confirmReq as any, {
        params: Promise.resolve({ id: 'task-phone-finish-01' }),
      });

      expect(confirmRes.status).toBe(200);
      const confirmData = await confirmRes.json();
      expect(confirmData.success).toBe(true);
      expect(confirmData.task.status).toBe('CONFIRMED');
      expect(confirmData.task.externalReferenceId).toBe('AGS-VERIFIED-TABLE-12');

      // Verify db.task.update was called with CONFIRMED status
      expect(taskUpdateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'task-phone-finish-01' },
          data: expect.objectContaining({
            status: 'CONFIRMED',
            externalReferenceId: 'AGS-VERIFIED-TABLE-12',
          }),
        })
      );

      // Verify task will no longer be returned by queue since queue queries { status: 'NEEDS_HUMAN' }
      vi.spyOn(db.conciergeRequest, 'findMany').mockResolvedValue([]);
      // db.task.findMany with { where: { status: 'NEEDS_HUMAN' } } returns empty list after confirmation
      vi.spyOn(db.task, 'findMany').mockResolvedValue([]);

      const queueReq = new Request('http://localhost:3000/api/concierge/queue', {
        method: 'GET',
      });

      const queueRes = await queueHandler(queueReq as any);
      expect(queueRes.status).toBe(200);
      const queueData = await queueRes.json();
      expect(queueData.escalatedTasks).toHaveLength(0);
    });
  });
});
