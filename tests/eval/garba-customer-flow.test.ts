import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Top-level mock for auth session
vi.mock('@/lib/auth/session', () => ({
  requireAuth: vi.fn(),
  getSession: vi.fn(),
  requireRole: vi.fn(),
  requireCustomer: vi.fn(),
  requireConcierge: vi.fn(),
  requireAdmin: vi.fn(),
}));

vi.mock('@/lib/email/sender', () => ({
  sendBookingConfirmationEmail: vi.fn().mockResolvedValue({ success: true }),
  sendVerificationEmail: vi.fn().mockResolvedValue({ success: true }),
  sendPasswordResetEmail: vi.fn().mockResolvedValue({ success: true }),
  sendAuthKeyRecoveryEmail: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock('@/lib/notifications/whatsapp', () => ({
  sendWhatsAppNotification: vi.fn().mockResolvedValue({ success: true }),
}));

import { POST as tasksPostHandler } from '@/app/api/tasks/route';
import { GET as taskDetailGetHandler } from '@/app/api/tasks/[id]/route';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth/session';

describe('PROVENTA — Navratri & Garba Customer Request Routing & Autonomous AI Discovery', () => {
  const customerUser = {
    id: 'usr-garba-test-01',
    email: 'garba_test@proventa.internal',
    name: 'Garba Discovery Test User',
    status: 'ACTIVE',
    deletedAt: null,
    roles: ['CUSTOMER'],
  };

  const customerProfile = {
    id: 'prof-garba-test-01',
    userId: customerUser.id,
    membershipStatus: 'ACTIVE',
    membershipPlan: 'SELECT',
    freeRequestUsed: false,
    _count: { tasks: 0 },
  };

  const tasks = new Map<string, any>();
  const events: any[] = [];

  beforeEach(() => {
    vi.clearAllMocks();
    tasks.clear();
    events.length = 0;

    vi.mocked(requireAuth).mockResolvedValue(customerUser as any);

    // Mock DB operations
    vi.spyOn(db.user as any, 'findUnique').mockImplementation(async ({ where }: any) => {
      if (where.id === customerUser.id || where.email === customerUser.email) {
        return { ...customerUser, customerProfile, userRoles: [{ role: 'CUSTOMER' }] } as any;
      }
      return null;
    });

    vi.spyOn(db.customerProfile as any, 'findUnique').mockImplementation(async ({ where }: any) => {
      if (where.userId === customerUser.id || where.id === customerProfile.id) {
        return { ...customerProfile, _count: { tasks: tasks.size } } as any;
      }
      return null;
    });

    vi.spyOn(db.customerProfile as any, 'update').mockImplementation(async () => customerProfile as any);

    vi.spyOn(db.task as any, 'count').mockImplementation(async () => tasks.size as any);

    vi.spyOn(db.task as any, 'create').mockImplementation(async ({ data }: any) => {
      const id = data.id || `task-garba-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const task = {
        ...data,
        id,
        createdAt: new Date(),
        updatedAt: new Date(),
        customer: customerProfile,
        events: [],
      };
      tasks.set(id, task);
      return task as any;
    });

    vi.spyOn(db.task as any, 'findUnique').mockImplementation(async ({ where, include }: any) => {
      let t: any = null;
      if (where.id) t = tasks.get(where.id) || null;
      if (!t && where.publicId) {
        for (const item of tasks.values()) {
          if (item.publicId === where.publicId) {
            t = item;
            break;
          }
        }
      }
      if (t) {
        return {
          ...t,
          customer: t.customer || customerProfile,
          events: include?.events ? events.filter((e) => e.taskId === t.id) : t.events || [],
          agentRuns: include?.agentRuns ? [] : undefined,
        } as any;
      }
      return null;
    });

    vi.spyOn(db.task as any, 'update').mockImplementation(async ({ where, data }: any) => {
      const existing = tasks.get(where.id) || {};
      const updated = {
        ...existing,
        ...data,
        clientPreferences: {
          ...(existing.clientPreferences || {}),
          ...(data.clientPreferences || {}),
        },
        updatedAt: new Date(),
        customer: customerProfile,
      };
      tasks.set(where.id, updated);
      return updated as any;
    });

    vi.spyOn(db.taskEvent as any, 'create').mockImplementation(async ({ data }: any) => {
      const event = { ...data, id: `evt-${events.length + 1}`, createdAt: new Date() };
      events.push(event);
      return event as any;
    });

    vi.spyOn(db.taskEvent as any, 'findMany').mockImplementation(async ({ where }: any) => {
      return events.filter((e) => !where?.taskId || e.taskId === where.taskId) as any;
    });
  });

  it('1. Submits "Navratri Garba passes": Returns HTTP 201 with AWAITING_APPROVAL and 5 genuine options without Concierge escalation', async () => {
    const req = new NextRequest('http://localhost:3000/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawInput: 'Navratri Garba passes', urgency: 'NORMAL' }),
    });

    const res = await tasksPostHandler(req);
    expect(res.status).toBe(201);

    const data = await res.json();
    expect(data.task).toBeDefined();
    expect(data.task.id).toBeDefined();

    expect(data.task.status).toBe('AWAITING_APPROVAL');
    expect(data.task.isEscalated).toBe(false);
    expect(data.task.failedReason).toBeNull();
    expect(data.task.proposedOptions).toHaveLength(5);
    expect(data.proposals).toHaveLength(5);

    // Verify option integrity
    const firstOption = data.task.proposedOptions[0];
    expect(firstOption.providerId).toBe('events_discovery');
    expect(firstOption.title).toContain('Garba');
    expect(firstOption.priceAmount).toBeGreaterThan(0);
  });

  it('2. Submits "Garba passes for 13 October 2026": Returns HTTP 201 with AWAITING_APPROVAL and 5 genuine options', async () => {
    const req = new NextRequest('http://localhost:3000/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawInput: 'Garba passes for 13 October 2026', urgency: 'NORMAL' }),
    });

    const res = await tasksPostHandler(req);
    expect(res.status).toBe(201);

    const data = await res.json();
    expect(data.task).toBeDefined();

    expect(data.task.status).toBe('AWAITING_APPROVAL');
    expect(data.task.isEscalated).toBe(false);
    expect(data.task.failedReason).toBeNull();
    expect(data.task.proposedOptions).toHaveLength(5);

    // Verify task detail route loads the 5 options for the customer UI
    const detailReq = new NextRequest(`http://localhost:3000/api/tasks/${data.task.id}`);
    const detailRes = await taskDetailGetHandler(detailReq, { params: Promise.resolve({ id: data.task.id }) } as any);
    expect(detailRes.status).toBe(200);
    const detailData = await detailRes.json();
    expect(detailData.task.proposedOptions).toHaveLength(5);
    expect(detailData.task.status).toBe('AWAITING_APPROVAL');
  });
});
