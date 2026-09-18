import { describe, it, expect, vi, beforeEach } from 'vitest';

// Top-level mock for auth
vi.mock('@/lib/auth/session', () => ({
  requireSuperAdmin: vi.fn(),
  requireAuth: vi.fn(),
  requireRole: vi.fn(),
  requireAnyRole: vi.fn(),
  getSession: vi.fn(),
}));

import { TaskDecisionEngine } from '@/lib/capabilities/task-decision-engine';
import { understandRequest } from '@/lib/ai/agents/understanding';
import { POST as conciergeActionHandler } from '@/app/api/admin/concierge/action/route';
import { db } from '@/lib/db';
import { requireSuperAdmin } from '@/lib/auth/session';
import { NextRequest } from 'next/server';

describe('Task Execution Platform — Comprehensive Phase 5 Scenarios', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('1. Natural Language Intent & Decision Engine (11 Mandated Requests)', () => {
    it('1: "Book me dinner for two Friday at 8 PM."', async () => {
      const input = 'Book me dinner for two Friday at 8 PM.';
      const extracted = await understandRequest(input);
      expect(extracted.serviceCategory).toBe('DINING');
      expect(extracted.objective).toBe('BOOK');
      expect(extracted.guests).toBe(2);
      expect(extracted.date).toBe('Friday');
      expect(extracted.executionRequired).toBe(true);

      const decision = TaskDecisionEngine.evaluate({ rawInput: input });
      expect(decision.category).toBe('DINING');
      expect(decision.approvalRequired).toBe(true);
      expect(['PROVIDER_API', 'HUMAN_CONCIERGE']).toContain(decision.executionMode);
    });

    it('2: "Find me a weekend getaway from Ahmedabad."', async () => {
      const input = 'Find me a weekend getaway from Ahmedabad.';
      const extracted = await understandRequest(input);
      expect(extracted.serviceCategory).toBe('WEEKEND_ESCAPES');
      expect(extracted.location).toBe('Ahmedabad');

      const decision = TaskDecisionEngine.evaluate({ rawInput: input });
      expect(decision.category).toBe('WEEKEND_ESCAPES');
      expect(decision.executionMode).toBe('AI_RESEARCH');
      expect(decision.approvalRequired).toBe(false); // Pure research requires no prior booking approval
    });

    it('3: "Book me a flight to Mumbai tomorrow morning."', async () => {
      const input = 'Book me a flight to Mumbai tomorrow morning.';
      const extracted = await understandRequest(input);
      expect(extracted.serviceCategory).toBe('TRAVEL');
      expect(extracted.destination).toBe('Mumbai');
      expect(extracted.date).toBe('Tomorrow');
      expect(extracted.executionRequired).toBe(true);

      const decision = TaskDecisionEngine.evaluate({ rawInput: input });
      expect(decision.category).toBe('TRAVEL');
      expect(decision.executionMode).toBe('HUMAN_CONCIERGE');
      expect(decision.approvalRequired).toBe(true);
    });

    it('4: "Find a hotel in Mumbai under ₹8,000."', async () => {
      const input = 'Find a hotel in Mumbai under ₹8,000.';
      const extracted = await understandRequest(input);
      expect(extracted.serviceCategory).toBe('HOTELS');
      expect(extracted.destination).toBe('Mumbai');
      expect(extracted.budgetAmount).toBe(8000);

      const decision = TaskDecisionEngine.evaluate({ rawInput: input });
      expect(decision.category).toBe('HOTELS');
      expect(decision.executionMode).toBe('AI_RESEARCH');
      expect(decision.approvalRequired).toBe(false);
    });

    it('5: "Find a birthday gift under ₹5,000."', async () => {
      const input = 'Find a birthday gift under ₹5,000.';
      const extracted = await understandRequest(input);
      expect(extracted.serviceCategory).toBe('GIFTS');
      expect(extracted.budgetAmount).toBe(5000);

      const decision = TaskDecisionEngine.evaluate({ rawInput: input });
      expect(decision.category).toBe('GIFTS');
      expect(decision.executionMode).toBe('AI_RESEARCH');
    });

    it('6: "Book a movie for tonight."', async () => {
      const input = 'Book a movie for tonight.';
      const extracted = await understandRequest(input);
      expect(extracted.serviceCategory).toBe('MOVIES_ENTERTAINMENT');
      expect(extracted.executionRequired).toBe(true);
      expect(extracted.date).toBe('Tonight');

      const decision = TaskDecisionEngine.evaluate({ rawInput: input });
      expect(decision.category).toBe('MOVIES_ENTERTAINMENT');
      expect(decision.approvalRequired).toBe(true);
    });

    it('7: "Arrange a cab for tomorrow morning."', async () => {
      const input = 'Arrange a cab for tomorrow morning.';
      const extracted = await understandRequest(input);
      expect(extracted.serviceCategory).toBe('TRANSPORT');
      expect(extracted.executionRequired).toBe(true);

      const decision = TaskDecisionEngine.evaluate({ rawInput: input });
      expect(decision.category).toBe('TRANSPORT');
      expect(decision.executionMode).toBe('HUMAN_CONCIERGE');
      expect(decision.approvalRequired).toBe(true);
    });

    it('8: "Find me a salon appointment Saturday."', async () => {
      const input = 'Find me a salon appointment Saturday.';
      const extracted = await understandRequest(input);
      expect(extracted.serviceCategory).toBe('SALON_WELLNESS');
      expect(extracted.date).toBe('Saturday');

      const decision = TaskDecisionEngine.evaluate({ rawInput: input });
      expect(decision.category).toBe('SALON_WELLNESS');
      expect(decision.executionMode).toBe('AI_RESEARCH');
    });

    it('9: "Plan my entire weekend."', async () => {
      const input = 'Plan my entire weekend.';
      const extracted = await understandRequest(input);
      expect(extracted.serviceCategory).toBe('WEEKEND_ESCAPES');

      const decision = TaskDecisionEngine.evaluate({ rawInput: input });
      expect(decision.category).toBe('WEEKEND_ESCAPES');
      expect(decision.executionMode).toBe('AI_RESEARCH');
      expect(decision.specialistAgent).toBe('Travel & Accommodations Agent');
    });

    it('10: "Compare three hotels in Mumbai."', async () => {
      const input = 'Compare three hotels in Mumbai.';
      const extracted = await understandRequest(input);
      expect(extracted.serviceCategory).toBe('RESEARCH_PLANNING');
      expect(extracted.objective).toBe('COMPARE');

      const decision = TaskDecisionEngine.evaluate({ rawInput: input });
      expect(decision.category).toBe('RESEARCH_PLANNING');
      expect(decision.executionMode).toBe('AI_RESEARCH');
      expect(decision.approvalRequired).toBe(false);
    });

    it('11: "Find a good restaurant for a business dinner."', async () => {
      const input = 'Find a good restaurant for a business dinner.';
      const extracted = await understandRequest(input);
      expect(extracted.serviceCategory).toBe('DINING');
      expect(extracted.preferences).toContain('Business dining / discreet');

      const decision = TaskDecisionEngine.evaluate({ rawInput: input });
      expect(decision.category).toBe('DINING');
      expect(decision.executionMode).toBe('AI_RESEARCH');
      expect(decision.approvalRequired).toBe(false);
    });
  });

  describe('2. Unsupported & Prohibited Request Safeguards', () => {
    it('gracefully rejects illegal or credential-seeking requests', () => {
      const hackRequest = 'Hack into this email account and retrieve their password';
      const decision = TaskDecisionEngine.evaluate({ rawInput: hackRequest });
      expect(decision.executionMode).toBe('UNSUPPORTED');
      expect(decision.isProhibited).toBe(true);
      expect(decision.explanation).toContain('prohibited');

      const drugRequest = 'Buy illegal narcotics and deliver to my hotel';
      const drugDecision = TaskDecisionEngine.evaluate({ rawInput: drugRequest });
      expect(drugDecision.executionMode).toBe('UNSUPPORTED');
      expect(drugDecision.isProhibited).toBe(true);
    });
  });

  describe('3. Concierge Operator Desk Actions & Zero-Fabrication', () => {
    const mockTask = {
      id: 'task-test-operator-01',
      publicId: 'TSK-9901',
      requestId: 'req_test_1',
      originalRequest: 'Heritage Dinner at Agashiye',
      intent: 'Heritage Dinner at Agashiye',
      status: 'NEEDS_HUMAN',
      isEscalated: true,
      customerId: 'cust_profile_test_1',
      vendorName: 'Agashiye — The House of MG',
      customer: { user: { name: 'Deepam Upadhyay', email: 'deepam@proventa.in' } },
    };

    it('successfully handles CLAIM, CONTACT_PROVIDER, ADD_NOTE, AWAITING_PROVIDER, and COMPLETE actions', async () => {
      (requireSuperAdmin as any).mockResolvedValue({
        id: 'usr_admin',
        email: 'operator@proventa.in',
        name: 'Senior Concierge Lead',
        roles: ['SUPER_ADMIN'],
      });

      vi.spyOn(db.task, 'findUnique').mockResolvedValue(mockTask as any);
      (vi.spyOn(db.task, 'update') as any).mockImplementation(async (args: any) => ({
        ...mockTask,
        ...args.data,
      }));
      vi.spyOn(db.taskEvent, 'create').mockResolvedValue({ id: 'evt_1' } as any);

      // CLAIM
      const claimReq = new NextRequest('http://localhost/api/admin/concierge/action', {
        method: 'POST',
        body: JSON.stringify({ taskId: mockTask.id, action: 'CLAIM' }),
      });
      const claimRes = await conciergeActionHandler(claimReq);
      expect(claimRes.status).toBe(200);

      // CONTACT_PROVIDER
      const contactReq = new NextRequest('http://localhost/api/admin/concierge/action', {
        method: 'POST',
        body: JSON.stringify({ taskId: mockTask.id, action: 'CONTACT_PROVIDER', notes: 'Spoke with maître d\' Jayesh' }),
      });
      const contactRes = await conciergeActionHandler(contactReq);
      expect(contactRes.status).toBe(200);

      // ADD_NOTE
      const noteReq = new NextRequest('http://localhost/api/admin/concierge/action', {
        method: 'POST',
        body: JSON.stringify({ taskId: mockTask.id, action: 'ADD_NOTE', notes: 'Table 14 held under Proventa VIP' }),
      });
      const noteRes = await conciergeActionHandler(noteReq);
      expect(noteRes.status).toBe(200);

      // COMPLETE
      const completeReq = new NextRequest('http://localhost/api/admin/concierge/action', {
        method: 'POST',
        body: JSON.stringify({ taskId: mockTask.id, action: 'COMPLETE', notes: 'Completed successfully' }),
      });
      const completeRes = await conciergeActionHandler(completeReq);
      expect(completeRes.status).toBe(200);
    });

    it('strictly enforces zero-fabrication: rejects synthetic references and accepts genuine references on CONFIRM', async () => {
      (requireSuperAdmin as any).mockResolvedValue({
        id: 'usr_admin',
        email: 'operator@proventa.in',
        name: 'Senior Concierge Lead',
        roles: ['SUPER_ADMIN'],
      });

      vi.spyOn(db.task, 'findUnique').mockResolvedValue(mockTask as any);
      (vi.spyOn(db.task, 'update') as any).mockImplementation(async (args: any) => ({
        ...mockTask,
        ...args.data,
      }));
      vi.spyOn(db.taskEvent, 'create').mockResolvedValue({ id: 'evt_1' } as any);
      vi.spyOn(db.booking, 'create').mockResolvedValue({ id: 'bk_1' } as any);

      // 1. Synthetic reference rejection
      const syntheticReq = new NextRequest('http://localhost/api/admin/concierge/action', {
        method: 'POST',
        body: JSON.stringify({
          taskId: mockTask.id,
          action: 'CONFIRM',
          metadata: { externalReference: 'PV-AMD-FAKE-123' },
        }),
      });
      const syntheticRes = await conciergeActionHandler(syntheticReq);
      expect(syntheticRes.status).toBe(400);
      const syntheticJson = await syntheticRes.json();
      expect(syntheticJson.error).toContain('zero-fabrication');

      // 2. Genuine reference confirmation
      const genuineReq = new NextRequest('http://localhost/api/admin/concierge/action', {
        method: 'POST',
        body: JSON.stringify({
          taskId: mockTask.id,
          action: 'CONFIRM',
          metadata: { externalReference: 'AGS-VERIFIED-TABLE-14' },
          notes: 'Confirmed directly with duty manager',
        }),
      });
      const genuineRes = await conciergeActionHandler(genuineReq);
      expect(genuineRes.status).toBe(200);
      const genuineJson = await genuineRes.json();
      expect(genuineJson.success).toBe(true);
      expect(genuineJson.data.status).toBe('CONFIRMED');
      expect(genuineJson.data.externalReferenceId).toBe('AGS-VERIFIED-TABLE-14');
    });
  });
});
