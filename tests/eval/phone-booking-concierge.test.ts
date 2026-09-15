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
});
