import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/auth/session', () => ({
  requireSuperAdmin: vi.fn(),
  requireConcierge: vi.fn(),
  requireAuth: vi.fn(),
  requireRole: vi.fn(),
  requireAnyRole: vi.fn(),
  getSession: vi.fn(),
}));

vi.mock('@/lib/email/sender', () => ({
  sendBookingConfirmationEmail: vi.fn().mockResolvedValue(true),
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
      findUnique: vi.fn(),
    },
  },
}));

import { requireConcierge, requireSuperAdmin } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { POST as actionHandler } from '@/app/api/admin/concierge/action/route';
import { GET as queueHandler } from '@/app/api/admin/concierge/queue/route';

describe('Admin Concierge Inbox & Operator Action API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const mockUser = {
      id: 'admin_concierge_01',
      name: 'Senior Concierge Lead',
      email: 'concierge@proventa.in',
      role: 'ADMIN',
      roles: ['CONCIERGE', 'ADMIN'],
    };
    (requireConcierge as any).mockResolvedValue(mockUser);
    (requireSuperAdmin as any).mockResolvedValue(mockUser);
  });

  describe('1. GET /api/admin/concierge/queue', () => {
    it('fetches tasks and partitions them into operational buckets', async () => {
      const mockTasks = [
        {
          id: 'task_1',
          category: 'DINING',
          status: 'REQUESTED',
          priority: 'NORMAL',
          isEscalated: false,
          customer: { user: { id: 'u1', name: 'Aarav Shah', email: 'aarav@proventa.in' } },
          events: [],
          updatedAt: new Date(),
          createdAt: new Date(),
        },
        {
          id: 'task_2',
          category: 'TRAVEL',
          status: 'NEEDS_HUMAN',
          priority: 'URGENT',
          isEscalated: true,
          customer: { user: { id: 'u2', name: 'Priya Patel', email: 'priya@proventa.in' } },
          events: [],
          updatedAt: new Date(),
          createdAt: new Date(),
        },
        {
          id: 'task_3',
          category: 'DINING',
          status: 'APPROVED',
          priority: 'HIGH',
          isEscalated: false,
          customer: { user: { id: 'u3', name: 'Rohan Mehta', email: 'rohan@proventa.in' } },
          events: [],
          updatedAt: new Date(),
          createdAt: new Date(),
        },
      ];

      (db.task.findMany as any).mockResolvedValue(mockTasks);

      const req = new Request('http://localhost:3000/api/admin/concierge/queue?tab=all');
      const res = await queueHandler(req as any);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.tasks).toHaveLength(3);
      expect(data.counts.total).toBe(3);
      expect(data.counts.new).toBe(1);
      expect(data.counts.escalated).toBe(1);
      expect(data.counts.ready_to_execute).toBe(1);
    });
  });

  describe('2. POST /api/admin/concierge/action — Zero Fabrication & Transitions', () => {
    const existingTask = {
      id: 'task_amd_101',
      title: 'Dinner at Agashiye',
      status: 'APPROVED',
      priority: 'HIGH',
      clientPreferences: {},
      options: [],
      customer: { user: { id: 'u1', name: 'Aarav Shah', email: 'aarav@proventa.in', phone: '+919876543210' } },
    };

    it('successfully claims a task without schema errors', async () => {
      (db.task.findUnique as any).mockResolvedValue(existingTask);
      (db.task.update as any).mockResolvedValue({
        ...existingTask,
        status: 'IN_PROGRESS',
        clientPreferences: { assignedOperator: 'Senior Concierge Lead' },
      });
      (db.taskEvent.create as any).mockResolvedValue({});

      const req = new Request('http://localhost:3000/api/admin/concierge/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: 'task_amd_101',
          action: 'CLAIM',
        }),
      });

      const res = await actionHandler(req as any);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(db.task.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'task_amd_101' },
          data: expect.objectContaining({
            assignedAgent: 'Senior Concierge Lead',
          }),
        })
      );
    });

    it('rejects synthetic and mock booking references on CONFIRM', async () => {
      (db.task.findUnique as any).mockResolvedValue(existingTask);

      const syntheticRefs = [
        'PV-12345',
        'PV-AMD-9901',
        'MOCK-TABLE-7',
        'TEST-BOOKING',
        'DEMO-CONFIRM',
        'FAKE-PNR',
      ];

      for (const invalidRef of syntheticRefs) {
        const req = new Request('http://localhost:3000/api/admin/concierge/action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            taskId: 'task_amd_101',
            action: 'CONFIRM',
            reference: invalidRef,
            providerName: 'Agashiye Desk',
          }),
        });

        const res = await actionHandler(req as any);
        const data = await res.json();

        expect(res.status).toBe(400);
        expect(data.error).toMatch(/zero-fabrication|synthetic|genuine/i);
      }
    });

    it('accepts genuine verified provider reference and marks task CONFIRMED', async () => {
      (db.task.findUnique as any).mockResolvedValue(existingTask);
      (db.task.update as any).mockResolvedValue({
        ...existingTask,
        status: 'CONFIRMED',
        externalReferenceId: 'AGS-VERIFIED-TABLE-14',
      });
      (db.taskEvent.create as any).mockResolvedValue({});

      const req = new Request('http://localhost:3000/api/admin/concierge/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: 'task_amd_101',
          action: 'CONFIRM',
          reference: 'AGS-VERIFIED-TABLE-14',
          providerName: 'Agashiye Heritage Desk',
          notes: 'Confirmed directly with Duty Manager. Table on terrace reserved.',
        }),
      });

      const res = await actionHandler(req as any);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(db.task.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'task_amd_101' },
          data: expect.objectContaining({
            status: 'CONFIRMED',
            externalReferenceId: 'AGS-VERIFIED-TABLE-14',
          }),
        })
      );
    });

    it('handles REQUEST_CUSTOMER_INFO and transitions to NEEDS_INFORMATION', async () => {
      (db.task.findUnique as any).mockResolvedValue(existingTask);
      (db.task.update as any).mockResolvedValue({
        ...existingTask,
        status: 'NEEDS_INFORMATION',
      });
      (db.taskEvent.create as any).mockResolvedValue({});

      const req = new Request('http://localhost:3000/api/admin/concierge/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: 'task_amd_101',
          action: 'REQUEST_CUSTOMER_INFO',
          notes: 'Please confirm dietary preferences and seating preference.',
        }),
      });

      const res = await actionHandler(req as any);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(db.task.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'task_amd_101' },
          data: expect.objectContaining({
            status: 'NEEDS_INFORMATION',
          }),
        })
      );
    });

    it('handles ESCALATE action and flags task for senior review', async () => {
      (db.task.findUnique as any).mockResolvedValue(existingTask);
      (db.task.update as any).mockResolvedValue({
        ...existingTask,
        status: 'NEEDS_HUMAN',
        isEscalated: true,
      });
      (db.taskEvent.create as any).mockResolvedValue({});

      const req = new Request('http://localhost:3000/api/admin/concierge/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: 'task_amd_101',
          action: 'ESCALATE',
          notes: 'High-value customer request requires founder authorization.',
        }),
      });

      const res = await actionHandler(req as any);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(db.task.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'task_amd_101' },
          data: expect.objectContaining({
            status: 'NEEDS_HUMAN',
            isEscalated: true,
          }),
        })
      );
    });
  });
});
