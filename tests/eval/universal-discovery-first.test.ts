import { describe, it, expect, beforeAll } from 'vitest';
import { RequestOrchestrator } from '@/lib/orchestration/orchestrator';
import { db } from '@/lib/db';

describe('Universal Discovery-First Architecture Evaluation', () => {
  let testCustomerId: string;

  beforeAll(async () => {
    // Ensure test user and customer profile exist
    const user = await db.user.upsert({
      where: { email: 'discovery.test@proventa.in' },
      update: {},
      create: {
        email: 'discovery.test@proventa.in',
        name: 'Discovery Test User',
        status: 'ACTIVE',
      },
    });

    const profile = await db.customerProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        city: 'Ahmedabad',
      },
    });

    testCustomerId = profile.id;
  }, 30000);

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
    expect(Array.isArray(dbTask?.proposedOptions)).toBe(true);
    expect((dbTask?.proposedOptions as any[]).length).toBe(result.proposals.length);
  }, 20000);

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
  }, 20000);

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
  }, 20000);

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
  }, 20000);

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
  }, 20000);

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
  }, 20000);

  it('7. Food delivery request MUST return verified restaurant options', async () => {
    const rawInput = 'Order food for me in Ahmedabad.';
    const result = await RequestOrchestrator.processRequest({
      rawInput,
      customerId: testCustomerId,
    });

    expect(result.task).toBeDefined();
    expect(result.task?.status).not.toBe('NEEDS_HUMAN');
    expect(result.proposals.length).toBeGreaterThan(0);
  }, 20000);

  it('8. Gifting mandate MUST return curated gift options', async () => {
    const rawInput = 'Arrange a gift for my wife.';
    const result = await RequestOrchestrator.processRequest({
      rawInput,
      customerId: testCustomerId,
    });

    expect(result.task).toBeDefined();
    expect(result.task?.status).not.toBe('NEEDS_HUMAN');
    expect(result.proposals.length).toBeGreaterThan(0);
  }, 20000);

  it('9. Weekend escape request MUST return curated getaway destinations', async () => {
    const rawInput = 'Find me a weekend escape from Ahmedabad.';
    const result = await RequestOrchestrator.processRequest({
      rawInput,
      customerId: testCustomerId,
    });

    expect(result.task).toBeDefined();
    expect(result.task?.status).not.toBe('NEEDS_HUMAN');
    expect(result.proposals.length).toBeGreaterThan(0);
  }, 20000);

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
  }, 20000);
});
