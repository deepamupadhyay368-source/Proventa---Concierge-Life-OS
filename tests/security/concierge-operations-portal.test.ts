import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/auth/session', () => ({
  requireConcierge: vi.fn(),
  requireSeniorConcierge: vi.fn(),
  requireConciergeManager: vi.fn(),
  requireAdmin: vi.fn(),
  requireSuperAdmin: vi.fn(),
  requireFounder: vi.fn(),
  requireCustomer: vi.fn(),
  requireAuth: vi.fn(),
  requireRole: vi.fn(),
  requireAnyRole: vi.fn(),
  getSession: vi.fn(),
}));

vi.mock('@/lib/email/sender', () => ({
  sendBookingConfirmationEmail: vi.fn().mockResolvedValue(true),
  sendEmail: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/lib/notifications/whatsapp', () => ({
  sendWhatsAppNotification: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/lib/db', () => ({
  db: {
    task: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    taskEvent: {
      create: vi.fn(),
    },
    user: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    customerProfile: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

import { requireConcierge, requireSeniorConcierge } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { GET as getTasksHandler } from '@/app/api/concierge/tasks/route';
import { GET as getTaskDetailHandler } from '@/app/api/concierge/tasks/[id]/route';
import { POST as conciergeActionHandler } from '@/app/api/concierge/action/route';
import { POST as aiAssistHandler } from '@/app/api/concierge/ai-assist/route';
import { GET as getTeamHandler } from '@/app/api/concierge/team/route';
import { GET as getCustomersHandler } from '@/app/api/concierge/customers/route';
import { AuthorizationError } from '@/lib/errors';

describe('PROVENTA CONCIERGE OPERATIONS PORTAL — RBAC, CONCURRENCY & ZERO-FABRICATION', () => {
  const mockConciergeOperator = {
    id: 'emp_c1',
    name: 'Priya Patel',
    email: 'priya@proventa.in',
    roles: ['CONCIERGE'],
  };

  const mockSeniorConcierge = {
    id: 'emp_snr1',
    name: 'Rajesh Sharma',
    email: 'rajesh.lead@proventa.in',
    roles: ['SENIOR_CONCIERGE', 'CONCIERGE'],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (requireConcierge as any).mockResolvedValue(mockConciergeOperator);
    (requireSeniorConcierge as any).mockResolvedValue(mockSeniorConcierge);
  });

  describe('1. Security & RBAC Enforcement', () => {
    it('allows authenticated concierge employees to view operations queue', async () => {
      (db.task.findMany as any).mockResolvedValueOnce([
        {
          id: 'task_001',
          publicId: 'PV-TASK-001',
          category: 'Fine Dining',
          intent: 'Agashiye Heritage Table',
          originalRequest: 'Table for 4 at Agashiye on Friday 8 PM',
          priority: 'URGENT',
          status: 'NEEDS_HUMAN',
          isEscalated: false,
          assignedAgent: 'Unassigned',
          clientPreferences: {},
          createdAt: new Date(),
          updatedAt: new Date(),
          customer: {
            user: { id: 'u1', name: 'Aarav Mehta', email: 'aarav@proventa.in', phone: '+919876543210' },
          },
          events: [],
        },
      ]);

      const req = new NextRequest('http://localhost:3000/api/concierge/tasks?filter=all');
      const res = await getTasksHandler(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.tasks.length).toBe(1);
      expect(data.tasks[0].publicId).toBe('PV-TASK-001');
    });

    it('rejects unauthorized customers attempting to access concierge operations API with 403', async () => {
      (requireConcierge as any).mockRejectedValueOnce(new AuthorizationError('Access denied. Concierge permissions required.'));

      const req = new NextRequest('http://localhost:3000/api/concierge/tasks?filter=all');
      const res = await getTasksHandler(req);
      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.error).toContain('Concierge permissions required');
    });
  });

  describe('2. Task Claiming & Concurrency Locking', () => {
    it('successfully claims an unassigned task and records claiming event', async () => {
      (db.task.findUnique as any).mockResolvedValueOnce({
        id: 'task_claim_1',
        publicId: 'PV-TASK-002',
        status: 'NEEDS_HUMAN',
        assignedAgent: 'Unassigned',
        clientPreferences: {},
      });

      (db.task.update as any).mockResolvedValueOnce({
        id: 'task_claim_1',
        assignedAgent: 'Priya Patel',
      });

      const req = new NextRequest('http://localhost:3000/api/concierge/action', {
        method: 'POST',
        body: JSON.stringify({ action: 'CLAIM', taskId: 'task_claim_1' }),
      });

      const res = await conciergeActionHandler(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.assignedOperator).toBe('Priya Patel');

      expect(db.taskEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            taskId: 'task_claim_1',
            eventType: 'OPERATOR_CLAIMED',
          }),
        })
      );
    });

    it('prevents another ordinary operator from claiming an already claimed task (returns 409 Conflict)', async () => {
      (db.task.findUnique as any).mockResolvedValueOnce({
        id: 'task_claimed_already',
        publicId: 'PV-TASK-003',
        status: 'EXECUTING',
        assignedAgent: 'Other Operator',
        clientPreferences: {
          assignedOperator: 'Other Operator',
          assignedOperatorEmail: 'other@proventa.in',
        },
      });

      const req = new NextRequest('http://localhost:3000/api/concierge/action', {
        method: 'POST',
        body: JSON.stringify({ action: 'CLAIM', taskId: 'task_claimed_already' }),
      });

      const res = await conciergeActionHandler(req);
      expect(res.status).toBe(409);
      const data = await res.json();
      expect(data.error).toContain('already claimed');
    });

    it('allows Senior Concierge or Manager to reassign or override a claimed task', async () => {
      (requireConcierge as any).mockResolvedValueOnce(mockSeniorConcierge);

      (db.task.findUnique as any).mockResolvedValueOnce({
        id: 'task_reassign_1',
        publicId: 'PV-TASK-004',
        status: 'EXECUTING',
        assignedAgent: 'Other Operator',
        clientPreferences: {
          assignedOperator: 'Other Operator',
          assignedOperatorEmail: 'other@proventa.in',
        },
      });

      (db.task.update as any).mockResolvedValueOnce({
        id: 'task_reassign_1',
        assignedAgent: 'Rajesh Sharma',
      });

      const req = new NextRequest('http://localhost:3000/api/concierge/action', {
        method: 'POST',
        body: JSON.stringify({ action: 'REASSIGN', taskId: 'task_reassign_1', targetOperatorEmail: 'priya@proventa.in', targetOperatorName: 'Priya Patel' }),
      });

      const res = await conciergeActionHandler(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
    });
  });

  describe('3. Strict Zero-Fabrication Validation in Provider Confirmation', () => {
    it('accepts genuine verified provider reference and completes confirmation', async () => {
      (db.task.findUnique as any).mockResolvedValueOnce({
        id: 'task_confirm_real',
        publicId: 'PV-TASK-005',
        status: 'EXECUTING',
        originalRequest: 'Agashiye Rooftop Dinner',
        clientPreferences: {},
        customer: {
          user: { name: 'Aarav Mehta', email: 'aarav@proventa.in', phone: '+919876543210' },
        },
      });

      (db.task.update as any).mockResolvedValueOnce({
        id: 'task_confirm_real',
        status: 'CONFIRMED',
        externalReferenceId: 'AG-RES-99812',
      });

      const req = new NextRequest('http://localhost:3000/api/concierge/action', {
        method: 'POST',
        body: JSON.stringify({
          action: 'CONFIRM',
          taskId: 'task_confirm_real',
          confirmationReference: 'AG-RES-99812',
          hostName: 'Vikram Patel (Reservations Lead)',
          amount: 5200,
          notes: 'Rooftop table #4 reserved under Aarav Mehta. Deposit acknowledged.',
        }),
      });

      const res = await conciergeActionHandler(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.reference).toBe('AG-RES-99812');
    });

    it('strictly REJECTS synthetic/mock reference codes (e.g. PV-*, MOCK-*, TEST-*, FAKE-*) with 400 Bad Request', async () => {
      (db.task.findUnique as any).mockResolvedValueOnce({
        id: 'task_confirm_fake',
        publicId: 'PV-TASK-006',
        status: 'EXECUTING',
        clientPreferences: {},
      });

      const req = new NextRequest('http://localhost:3000/api/concierge/action', {
        method: 'POST',
        body: JSON.stringify({
          action: 'CONFIRM',
          taskId: 'task_confirm_fake',
          confirmationReference: 'PV-SYNTHETIC-999',
        }),
      });

      const res = await conciergeActionHandler(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('Zero-Fabrication Policy');
    });
  });

  describe('4. Private Internal Notes & Member Communication Privacy', () => {
    it('appends private staff-only note into task clientPreferences without exposing to customer', async () => {
      (db.task.findUnique as any).mockResolvedValueOnce({
        id: 'task_notes_1',
        clientPreferences: {
          internalNotes: [],
        },
      });

      (db.task.update as any).mockResolvedValueOnce({});

      const req = new NextRequest('http://localhost:3000/api/concierge/action', {
        method: 'POST',
        body: JSON.stringify({
          action: 'ADD_INTERNAL_NOTE',
          taskId: 'task_notes_1',
          note: 'Spoke with General Manager. They agreed to waive the corkage fee for our VIP member.',
        }),
      });

      const res = await conciergeActionHandler(req);
      expect(res.status).toBe(200);

      expect(db.task.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            clientPreferences: expect.objectContaining({
              internalNotes: expect.arrayContaining([
                expect.objectContaining({
                  content: expect.stringContaining('Spoke with General Manager'),
                  author: 'Priya Patel',
                }),
              ]),
            }),
          }),
        })
      );
    });

    it('requests information from customer and sets task status to NEEDS_INFORMATION', async () => {
      (db.task.findUnique as any).mockResolvedValueOnce({
        id: 'task_info_1',
        clientPreferences: {},
        customer: {
          user: { name: 'Aarav Mehta', email: 'aarav@proventa.in', phone: '+919876543210' },
        },
      });

      (db.task.update as any).mockResolvedValueOnce({});

      const req = new NextRequest('http://localhost:3000/api/concierge/action', {
        method: 'POST',
        body: JSON.stringify({
          action: 'REQUEST_CUSTOMER_INFO',
          taskId: 'task_info_1',
          question: 'Do you prefer indoor AC seating or heritage courtyard seating?',
        }),
      });

      const res = await conciergeActionHandler(req);
      expect(res.status).toBe(200);

      expect(db.task.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'NEEDS_INFORMATION',
          }),
        })
      );
    });
  });

  describe('5. AI Copilot Assistance for Operators', () => {
    it('generates call script draft via AI Assist route', async () => {
      (db.task.findUnique as any).mockResolvedValueOnce({
        id: 'task_ai_1',
        originalRequest: 'Private dining at Agashiye for 6 guests',
        category: 'Fine Dining',
        customer: {
          user: { name: 'Aarav Mehta', email: 'aarav@proventa.in' },
        },
      });

      const req = new NextRequest('http://localhost:3000/api/concierge/ai-assist', {
        method: 'POST',
        body: JSON.stringify({
          action: 'DRAFT_CALL_SCRIPT',
          taskId: 'task_ai_1',
          parameters: { venueName: 'Agashiye Ahmedabad', partySize: 6, targetTime: 'Friday 8:00 PM' },
        }),
      });

      const res = await aiAssistHandler(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.result).toBeTruthy();
      expect(data.result).toContain('Proventa');
    });
  });

  describe('6. Team Workload & Client Directory Endpoints', () => {
    it('returns team members with workload stats', async () => {
      (db.user.findMany as any).mockResolvedValueOnce([
        {
          id: 'u_emp1',
          name: 'Priya Patel',
          email: 'priya@proventa.in',
          userRoles: [{ role: 'CONCIERGE' }],
          createdAt: new Date(),
        },
      ]);
      (db.task.findMany as any).mockResolvedValueOnce([
        {
          id: 't_active1',
          assignedAgent: 'Priya Patel',
          clientPreferences: { assignedOperator: 'Priya Patel' },
          status: 'EXECUTING',
          priority: 'HIGH',
          isEscalated: false,
        },
      ]);

      const req = new NextRequest('http://localhost:3000/api/concierge/team');
      const res = await getTeamHandler(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.team.length).toBe(1);
      expect(data.team[0].activeTasksCount).toBe(1);
    });

    it('returns customer context directory for concierge lookups', async () => {
      (db.customerProfile.findMany as any).mockResolvedValueOnce([
        {
          id: 'cust_01',
          preferences: { city: 'Ahmedabad', tier: 'Private Client' },
          createdAt: new Date(),
          user: { id: 'u_c1', name: 'Aarav Mehta', email: 'aarav@proventa.in', phone: '+919876543210', createdAt: new Date() },
          _count: { tasks: 4 },
        },
      ]);

      const req = new NextRequest('http://localhost:3000/api/concierge/customers');
      const res = await getCustomersHandler(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.customers.length).toBe(1);
      expect(data.customers[0].name).toBe('Aarav Mehta');
      expect(data.customers[0].tasksCount).toBe(4);
    });
  });
});
