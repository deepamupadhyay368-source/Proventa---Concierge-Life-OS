import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RequestOrchestrator } from '@/lib/orchestration/orchestrator';
import { db } from '@/lib/db';

vi.mock('@/lib/email/sender', () => ({
  sendBookingConfirmationEmail: vi.fn().mockResolvedValue({ success: true }),
  sendVerificationEmail: vi.fn().mockResolvedValue({ success: true }),
  sendPasswordResetEmail: vi.fn().mockResolvedValue({ success: true }),
  sendAuthKeyRecoveryEmail: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock('@/lib/notifications/whatsapp', () => ({
  sendWhatsAppNotification: vi.fn().mockResolvedValue({ success: true }),
}));

describe('Universal Discovery-First Architecture Evaluation', () => {
  let testCustomerId = 'cust-disc-001';
  const tasks = new Map<string, any>();
  const events: any[] = [];

  beforeEach(() => {
    vi.clearAllMocks();
    tasks.clear();
    events.length = 0;

    vi.spyOn(db.task as any, 'count').mockImplementation(async () => tasks.size as any);

    vi.spyOn(db.task as any, 'create').mockImplementation(async ({ data }: any) => {
      const id = data.id || `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const task = { ...data, id, createdAt: new Date(), updatedAt: new Date() };
      tasks.set(id, task);
      return task as any;
    });

    vi.spyOn(db.task as any, 'findUnique').mockImplementation(async ({ where }: any) => {
      if (where.id) return tasks.get(where.id) || null;
      if (where.publicId) {
        for (const t of tasks.values()) {
          if (t.publicId === where.publicId) return t;
        }
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
      };
      tasks.set(where.id, updated);
      return updated as any;
    });

    vi.spyOn(db.taskEvent as any, 'create').mockImplementation(async ({ data }: any) => {
      events.push(data);
      return data as any;
    });

    vi.spyOn(db.customerPreference as any, 'findMany').mockImplementation(async () => [] as any);

    vi.spyOn(db.customerProfile as any, 'findUnique').mockImplementation(async () => {
      return {
        id: testCustomerId,
        userId: 'user-disc-001',
        city: 'Ahmedabad',
        user: {
          id: 'user-disc-001',
          name: 'Discovery Test User',
          email: 'discovery.test@proventa.in',
          phone: '+919876543210',
        },
      } as any;
    });
  });

  it('1. Garba passes request MUST return genuine options before concierge handoff', async () => {
    const rawInput = 'Book 3 Garba passes in Ahmedabad on October 15, 2026';
    const result = await RequestOrchestrator.processRequest({
      rawInput,
      customerId: testCustomerId,
    });

    expect(result.task).toBeDefined();
    // Must NOT immediately escalate to human desk before discovery
    expect(result.task?.status).not.toBe('NEEDS_HUMAN');
    expect(result.task?.status).toBe('AWAITING_APPROVAL');
    expect(result.proposals.length).toBeGreaterThan(0);
    expect(result.proposals.length).toBeLessThanOrEqual(25);
    
    // Check authenticity of options
    const firstOption = result.proposals[0];
    expect(firstOption.title).toBeDefined();
    expect(firstOption.providerName).toBeDefined();
    expect(firstOption.priceAmount).toBeGreaterThan(0);

    // Verify task state in database
    const dbTask = await db.task.findUnique({ where: { id: result.task!.id } });
    expect(dbTask?.status).toBe('AWAITING_APPROVAL');
  });

  it('2. Hotel search in Mumbai MUST discover genuine hotel options first', async () => {
    const rawInput = 'Find me a hotel in Mumbai for 2 nights.';
    const result = await RequestOrchestrator.processRequest({
      rawInput,
      customerId: testCustomerId,
    });

    expect(result.task).toBeDefined();
    expect(result.task?.status).not.toBe('NEEDS_HUMAN');
    expect(result.proposals.length).toBeGreaterThan(0);
    expect(result.proposals.some(p => p.title.toLowerCase().includes('mumbai') || p.description.toLowerCase().includes('mumbai'))).toBe(true);
  });

  it('3. Flight search from Ahmedabad to Dubai MUST return flight options', async () => {
    const rawInput = 'Find me flights from Ahmedabad to Dubai.';
    const result = await RequestOrchestrator.processRequest({
      rawInput,
      customerId: testCustomerId,
    });

    expect(result.task).toBeDefined();
    expect(result.task?.status).not.toBe('NEEDS_HUMAN');
    expect(result.proposals.length).toBeGreaterThan(0);
    expect(result.proposals.some(p => p.title.toLowerCase().includes('dubai') || p.title.toLowerCase().includes('emirates') || p.title.toLowerCase().includes('flight') || p.title.toLowerCase().includes('amd'))).toBe(true);
  });

  it('4. Dining reservation for 4 in Ahmedabad MUST return verified restaurants', async () => {
    const rawInput = 'Book dinner for 4 in Ahmedabad.';
    const result = await RequestOrchestrator.processRequest({
      rawInput,
      customerId: testCustomerId,
    });

    expect(result.task).toBeDefined();
    expect(result.task?.status).not.toBe('NEEDS_HUMAN');
    expect(result.proposals.length).toBeGreaterThan(0);
    expect(result.proposals.some(p => p.title.includes('Agashiye') || p.title.includes('House of MG') || p.title.includes('Vishalla') || p.title.includes('Dining'))).toBe(true);
  });

  it('5. Healthcare / Cardiologist search MUST return specialist doctors', async () => {
    const rawInput = 'Find a cardiologist in Ahmedabad.';
    const result = await RequestOrchestrator.processRequest({
      rawInput,
      customerId: testCustomerId,
    });

    expect(result.task).toBeDefined();
    expect(result.task?.status).not.toBe('NEEDS_HUMAN');
    expect(result.proposals.length).toBeGreaterThan(0);
    expect(result.proposals.some(p => p.title.toLowerCase().includes('cardiolog') || p.title.toLowerCase().includes('apollo') || p.title.toLowerCase().includes('cims') || p.title.toLowerCase().includes('kd hospital'))).toBe(true);
  });

  it('6. Cinema / Movie request MUST discover genuine showtimes', async () => {
    const rawInput = 'Find a movie for tonight.';
    const result = await RequestOrchestrator.processRequest({
      rawInput,
      customerId: testCustomerId,
    });

    expect(result.task).toBeDefined();
    expect(result.task?.status).not.toBe('NEEDS_HUMAN');
    expect(result.proposals.length).toBeGreaterThan(0);
    expect(result.proposals.some(p => p.title.toLowerCase().includes('imax') || p.title.toLowerCase().includes('pvr') || p.title.toLowerCase().includes('inox'))).toBe(true);
  });

  it('7. Food delivery request MUST return verified restaurant options', async () => {
    const rawInput = 'Order food for me in Ahmedabad.';
    const result = await RequestOrchestrator.processRequest({
      rawInput,
      customerId: testCustomerId,
    });

    expect(result.task).toBeDefined();
    expect(result.task?.status).not.toBe('NEEDS_HUMAN');
    expect(result.proposals.length).toBeGreaterThan(0);
  });

  it('8. Gifting mandate MUST return curated gift options', async () => {
    const rawInput = 'Arrange a gift for my wife.';
    const result = await RequestOrchestrator.processRequest({
      rawInput,
      customerId: testCustomerId,
    });

    expect(result.task).toBeDefined();
    expect(result.task?.status).not.toBe('NEEDS_HUMAN');
    expect(result.proposals.length).toBeGreaterThan(0);
  });

  it('9. Weekend escape request MUST return curated getaway destinations', async () => {
    const rawInput = 'Find me a weekend escape from Ahmedabad.';
    const result = await RequestOrchestrator.processRequest({
      rawInput,
      customerId: testCustomerId,
    });

    expect(result.task).toBeDefined();
    expect(result.task?.status).not.toBe('NEEDS_HUMAN');
    expect(result.proposals.length).toBeGreaterThan(0);
  });

  it('10. Explicit phone request ("Call and book dinner at Agashiye") MUST still discover options first, then execute via concierge upon approval', async () => {
    const rawInput = 'Call and book dinner at Agashiye for 2';
    const result = await RequestOrchestrator.processRequest({
      rawInput,
      customerId: testCustomerId,
    });

    expect(result.task).toBeDefined();
    // Discovery first!
    expect(result.task?.status).not.toBe('NEEDS_HUMAN');
    expect(result.task?.status).toBe('AWAITING_APPROVAL');
    expect(result.proposals.length).toBeGreaterThan(0);

    // After approval, execution executes and appropriately assigns concierge if needed
    const approvedOption = result.proposals[0];
    const execResult = await RequestOrchestrator.executeApprovedTask({
      taskId: result.task!.id,
      option: approvedOption,
      customerId: testCustomerId,
      skipPaymentGate: true,
    });

    expect(execResult).toBeDefined();
    const updatedTask = await db.task.findUnique({ where: { id: result.task!.id } });
    expect(['COMPLETED', 'BOOKED', 'NEEDS_HUMAN']).toContain(updatedTask?.status);
  });
});
