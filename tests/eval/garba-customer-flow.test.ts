import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
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

import { POST as tasksPostHandler } from '@/app/api/tasks/route';
import { GET as taskDetailGetHandler } from '@/app/api/tasks/[id]/route';
import { db } from '@/lib/db';
import { getOrCreateCustomerProfile } from '@/lib/membership/entitlement';
import { requireAuth } from '@/lib/auth/session';
import { randomBytes } from 'crypto';

describe('PROVENTA — Navratri & Garba Customer Request Routing & Autonomous AI Discovery', { timeout: 60000 }, () => {
  const uniqueTag = randomBytes(4).toString('hex');
  const userEmail = `garba_test_${uniqueTag}@proventa.internal`;
  let customerUser: any;
  let customerProfile: any;
  const createdTaskIds: string[] = [];

  beforeAll(async () => {
    customerUser = await db.user.create({
      data: {
        email: userEmail,
        name: 'Garba Discovery Test User',
        status: 'ACTIVE',
        emailVerified: new Date(),
        userRoles: {
          create: [{ role: 'CUSTOMER' }],
        },
      },
      include: { userRoles: true },
    });
    customerProfile = await getOrCreateCustomerProfile(customerUser);
  }, 60000);

  afterAll(async () => {
    try {
      for (const tId of createdTaskIds) {
        await db.taskEvent.deleteMany({ where: { taskId: tId } }).catch(() => {});
        await db.task.deleteMany({ where: { id: tId } }).catch(() => {});
      }
      if (customerUser?.id) {
        await db.customerProfile.deleteMany({ where: { userId: customerUser.id } }).catch(() => {});
        await db.userRoleAssignment.deleteMany({ where: { userId: customerUser.id } }).catch(() => {});
        await db.user.deleteMany({ where: { id: customerUser.id } }).catch(() => {});
      }
    } catch {}
  }, 60000);

  it('1. Submits "Navratri Garba passes": Returns HTTP 201 with AWAITING_APPROVAL and 5 genuine options without Concierge escalation', async () => {
    vi.mocked(requireAuth).mockResolvedValue({
      id: customerUser.id,
      email: customerUser.email,
      roles: ['CUSTOMER'],
    } as any);

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
    createdTaskIds.push(data.task.id);

    expect(data.task.status).toBe('AWAITING_APPROVAL');
    expect(data.task.isEscalated).toBe(false);
    expect(data.task.failedReason).toBeNull();
    expect(data.task.proposedOptions).toHaveLength(5);
    expect(data.proposals).toHaveLength(5);

    // Verify persisted record in Postgres
    const persisted = await db.task.findUnique({
      where: { id: data.task.id },
    });
    expect(persisted).not.toBeNull();
    expect(persisted!.status).toBe('AWAITING_APPROVAL');
    expect(persisted!.isEscalated).toBe(false);
    expect(persisted!.failedReason).toBeNull();
    expect((persisted!.proposedOptions as any[])).toHaveLength(5);

    // Verify option integrity
    const firstOption = (persisted!.proposedOptions as any[])[0];
    expect(firstOption.providerId).toBe('events_discovery');
    expect(firstOption.title).toContain('Garba');
    expect(firstOption.priceAmount).toBeGreaterThan(0);
  });

  it('2. Submits "Garba passes for 13 October 2026": Returns HTTP 201 with AWAITING_APPROVAL and 5 genuine options', async () => {
    // Enable active membership so member can submit multiple requests
    await db.customerProfile.update({
      where: { id: customerProfile.id },
      data: { membershipStatus: 'ACTIVE', membershipPlan: 'SELECT' },
    });

    vi.mocked(requireAuth).mockResolvedValue({
      id: customerUser.id,
      email: customerUser.email,
      roles: ['CUSTOMER'],
    } as any);

    const req = new NextRequest('http://localhost:3000/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawInput: 'Garba passes for 13 October 2026', urgency: 'NORMAL' }),
    });

    const res = await tasksPostHandler(req);
    expect(res.status).toBe(201);

    const data = await res.json();
    expect(data.task).toBeDefined();
    createdTaskIds.push(data.task.id);

    expect(data.task.status).toBe('AWAITING_APPROVAL');
    expect(data.task.isEscalated).toBe(false);
    expect(data.task.failedReason).toBeNull();
    expect(data.task.proposedOptions).toHaveLength(5);

    // Verify task detail route loads the 5 options for the customer UI
    const detailReq = new NextRequest(`http://localhost:3000/api/tasks/${data.task.id}`);
    const detailRes = await taskDetailGetHandler(detailReq, { params: { id: data.task.id } } as any);
    expect(detailRes.status).toBe(200);
    const detailData = await detailRes.json();
    expect(detailData.task.proposedOptions).toHaveLength(5);
    expect(detailData.task.status).toBe('AWAITING_APPROVAL');
  });
});
