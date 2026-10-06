import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RequestOrchestrator } from '@/lib/orchestration/orchestrator';
import { ExecutionRouter } from '@/lib/capabilities/execution-router';
import { db } from '@/lib/db';
import { sendBookingConfirmationEmail } from '@/lib/email/sender';

// Mock DB and external services
vi.mock('@/lib/email/sender', () => ({
  sendBookingConfirmationEmail: vi.fn().mockResolvedValue({ success: true }),
  sendVerificationEmail: vi.fn().mockResolvedValue({ success: true }),
  sendPasswordResetEmail: vi.fn().mockResolvedValue({ success: true }),
  sendAuthKeyRecoveryEmail: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock('@/lib/notifications/whatsapp', () => ({
  sendWhatsAppNotification: vi.fn().mockResolvedValue({ success: true }),
}));

function createSimulatedTaskEnvironment(initialTask: any) {
  let task = { ...initialTask };
  const events: any[] = [];

  vi.spyOn(db.task as any, 'findUnique').mockImplementation(async ({ where }: any) => {
    if (where.id === task.id || where.publicId === task.publicId) {
      return task as any;
    }
    return null;
  });

  vi.spyOn(db.task as any, 'update').mockImplementation(async ({ data }: any) => {
    task = {
      ...task,
      ...data,
      clientPreferences: {
        ...(task.clientPreferences || {}),
        ...(data.clientPreferences || {}),
      },
    };
    return task as any;
  });

  vi.spyOn(db.taskEvent as any, 'create').mockImplementation(async ({ data }: any) => {
    events.push(data);
    return data as any;
  });

  vi.spyOn(db.customerPreference as any, 'findMany').mockImplementation(async () => [] as any);

  vi.spyOn(db.customerProfile as any, 'findUnique').mockImplementation(async () => {
    return {
      id: task.customerId,
      userId: 'user-sim-101',
      city: 'Ahmedabad',
      user: {
        id: 'user-sim-101',
        name: 'Arjun Mehta',
        email: 'arjun.mehta@example.com',
        phone: '+919876543210',
      },
    } as any;
  });

  return {
    getTask: () => task,
    getEvents: () => events,
  };
}

describe('PROVENTA — AUTONOMOUS TASK COMPLETION WITHOUT PROVIDER API CREDENTIALS', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // A. Pure research -> AUTOMATED_INTERNAL_EXECUTION -> COMPLETED
  it('A. Pure research request executes via AUTOMATED_INTERNAL_EXECUTION and completes without Human Concierge', async () => {
    const resolution = ExecutionRouter.resolveExecutionMode({
      rawInput: 'Research the best luxury watch restoration ateliers in India',
      category: 'research_planning',
      objective: 'RESEARCH',
    });

    expect(resolution.requiresExternalTransaction).toBe(false);
    expect(resolution.executionModeType).toBe('AUTOMATED_INTERNAL_EXECUTION');
    expect(resolution.tier).toBe('AUTOMATED');

    const env = createSimulatedTaskEnvironment({
      id: 'task-research-auto',
      publicId: 'TSK-RES-001',
      status: 'UNDERSTANDING',
      category: 'research_planning',
      intent: 'Research luxury watch restoration ateliers',
      originalRequest: 'Research the best luxury watch restoration ateliers in India',
      customerId: 'cust-auto-01',
      clientPreferences: {
        isDeliverable: true,
      },
    });

    const res = await RequestOrchestrator.processRequest({
      rawInput: 'Research the best luxury watch restoration ateliers in India',
      customerId: 'cust-auto-01',
      existingTaskId: 'task-research-auto',
    });

    expect(res.task.status).toBe('COMPLETED');
    expect(res.deliverable).toBeDefined();
    expect(res.task.executionMethod).not.toBe('HUMAN_CONCIERGE');
  });

  // B. Itinerary -> AUTOMATED_INTERNAL_EXECUTION -> COMPLETED
  it('B. Itinerary creation executes via AUTOMATED_INTERNAL_EXECUTION and produces complete deliverable', async () => {
    const resolution = ExecutionRouter.resolveExecutionMode({
      rawInput: 'Create a 7-day Japan itinerary for cherry blossom season',
      category: 'planning',
    });

    expect(resolution.requiresExternalTransaction).toBe(false);
    expect(resolution.executionModeType).toBe('AUTOMATED_INTERNAL_EXECUTION');

    const env = createSimulatedTaskEnvironment({
      id: 'task-japan-itinerary',
      publicId: 'TSK-JPN-002',
      status: 'UNDERSTANDING',
      category: 'planning',
      intent: 'Create a 7-day Japan itinerary',
      originalRequest: 'Create a 7-day Japan itinerary for cherry blossom season',
      customerId: 'cust-auto-02',
      clientPreferences: {
        isDeliverable: true,
      },
    });

    const res = await RequestOrchestrator.processRequest({
      rawInput: 'Create a 7-day Japan itinerary for cherry blossom season',
      customerId: 'cust-auto-02',
      existingTaskId: 'task-japan-itinerary',
    });

    expect(res.task.status).toBe('COMPLETED');
    expect(res.deliverable).toBeDefined();
    expect(res.proposals.length).toBeGreaterThan(0);
  });

  // C. Restaurant discovery -> AUTOMATED_INTERNAL_EXECUTION -> COMPLETED
  it('C. Restaurant discovery ("Find me 20 good restaurants in Ahmedabad") completes internally without human handoff', async () => {
    const resolution = ExecutionRouter.resolveExecutionMode({
      rawInput: 'Find me 20 good restaurants in Ahmedabad for Saturday',
      category: 'dining',
      objective: 'SEARCH',
    });

    expect(resolution.requiresExternalTransaction).toBe(false);
    expect(resolution.executionModeType).toBe('AUTOMATED_INTERNAL_EXECUTION');

    const env = createSimulatedTaskEnvironment({
      id: 'task-dining-discovery',
      publicId: 'TSK-DINE-003',
      status: 'UNDERSTANDING',
      category: 'dining',
      intent: 'Find 20 good restaurants in Ahmedabad for Saturday',
      originalRequest: 'Find me 20 good restaurants in Ahmedabad for Saturday',
      customerId: 'cust-auto-03',
      clientPreferences: {
        isDeliverable: true,
      },
    });

    const res = await RequestOrchestrator.processRequest({
      rawInput: 'Find me 20 good restaurants in Ahmedabad for Saturday',
      customerId: 'cust-auto-03',
      existingTaskId: 'task-dining-discovery',
    });

    expect(res.task.status).toBe('COMPLETED');
    expect(res.proposals.length).toBeGreaterThan(0);
  });

  // D. Weekend plan -> AUTOMATED_INTERNAL_EXECUTION -> COMPLETED
  it('D. Weekend getaway planning ("Plan me a 3-day romantic weekend from Ahmedabad") completes internally', async () => {
    const resolution = ExecutionRouter.resolveExecutionMode({
      rawInput: 'Plan me a 3-day romantic weekend from Ahmedabad',
      category: 'research_planning',
    });

    expect(resolution.requiresExternalTransaction).toBe(false);
    expect(resolution.executionModeType).toBe('AUTOMATED_INTERNAL_EXECUTION');

    const env = createSimulatedTaskEnvironment({
      id: 'task-weekend-plan',
      publicId: 'TSK-WKND-004',
      status: 'UNDERSTANDING',
      category: 'research_planning',
      intent: 'Plan a 3-day romantic weekend from Ahmedabad',
      originalRequest: 'Plan me a 3-day romantic weekend from Ahmedabad',
      customerId: 'cust-auto-04',
      clientPreferences: {
        isDeliverable: true,
      },
    });

    const res = await RequestOrchestrator.processRequest({
      rawInput: 'Plan me a 3-day romantic weekend from Ahmedabad',
      customerId: 'cust-auto-04',
      existingTaskId: 'task-weekend-plan',
    });

    expect(res.task.status).toBe('COMPLETED');
    expect(res.deliverable).toBeDefined();
  });

  // E. Reminder / structured plan -> AUTOMATED_INTERNAL_EXECUTION -> COMPLETED
  it('E. Reminder or personalized plan completes internally without external booking dependency', async () => {
    const resolution = ExecutionRouter.resolveExecutionMode({
      rawInput: 'Remind me to renew my passport before the December trip',
      category: 'bespoke_requests',
    });

    expect(resolution.requiresExternalTransaction).toBe(false);
    expect(resolution.executionModeType).toBe('AUTOMATED_INTERNAL_EXECUTION');
  });

  // F. External booking with live legitimate provider -> TRUE_AUTONOMOUS_EXTERNAL_EXECUTION
  it('F. External booking with live provider (Healthcare consultation OPD token) executes autonomously', async () => {
    const resolution = ExecutionRouter.resolveExecutionMode({
      rawInput: 'Book an appointment with cardiologist Dr. Keyur Parikh in Marengo CIMS Ahmedabad',
      category: 'health_wellness',
      objective: 'BOOK',
      extractedData: { executionRequired: true },
    });

    expect(resolution.requiresExternalTransaction).toBe(true);
    expect(resolution.executionModeType).toBe('TRUE_AUTONOMOUS_EXTERNAL_EXECUTION');
    expect(resolution.tier).toBe('AUTOMATED');
  });

  // G. External booking without provider credentials -> HUMAN_CONCIERGE ONLY AFTER customer approval
  it('G. External booking without live API credentials routes to HUMAN_CONCIERGE only AFTER customer approval', async () => {
    const resolution = ExecutionRouter.resolveExecutionMode({
      rawInput: 'Book 2 Business Class flights from Ahmedabad to London Heathrow on October 20',
      category: 'travel',
      objective: 'BOOK',
      extractedData: { executionRequired: true },
    });

    expect(resolution.requiresExternalTransaction).toBe(true);
    expect(resolution.executionModeType).toBe('ASSISTED_EXECUTION');

    const env = createSimulatedTaskEnvironment({
      id: 'task-flight-approval',
      publicId: 'TSK-FLT-007',
      status: 'UNDERSTANDING',
      category: 'travel',
      intent: 'Book 2 Business Class flights from Ahmedabad to London Heathrow',
      originalRequest: 'Book 2 Business Class flights from Ahmedabad to London Heathrow on October 20',
      customerId: 'cust-flight-07',
      clientPreferences: {},
    });

    // 1. Process Request -> discovers options and waits for approval (does NOT prematurely escalate)
    const discovery = await RequestOrchestrator.processRequest({
      rawInput: 'Book 2 Business Class flights from Ahmedabad to London Heathrow on October 20',
      customerId: 'cust-flight-07',
      existingTaskId: 'task-flight-approval',
    });

    expect(discovery.task.status).toBe('AWAITING_APPROVAL');
    expect(discovery.proposals.length).toBeGreaterThan(0);

    // 2. Customer Approves -> Hands off to Senior Concierge Desk with structured context
    const approved = await RequestOrchestrator.executeApprovedTask({
      taskId: 'task-flight-approval',
      option: discovery.proposals[0],
      skipPaymentGate: true,
    });

    expect(approved.success).toBe(true);
    expect(approved.status).toBe('NEEDS_HUMAN');
    expect(env.getTask().executionMethod).toBe('HUMAN_CONCIERGE');
  });

  // H. Explicit customer request for human assistance -> HUMAN_CONCIERGE
  it('H. Explicit customer request for human assistance ("Call the restaurant directly") routes to HUMAN_CONCIERGE after options curation', async () => {
    const resolution = ExecutionRouter.resolveExecutionMode({
      rawInput: 'Call Agashiye directly and book a specific rooftop terrace table for 4',
      category: 'dining',
      objective: 'BOOK',
    });

    expect(resolution.requiresExternalTransaction).toBe(true);
    expect(resolution.executionModeType).toBe('HUMAN_CONCIERGE_EXECUTION');
    expect(resolution.tier).toBe('HUMAN');
  });

  // I. Zero fabrication: Deliverables do not invent fake PNRs or confirmation codes
  it('I. Zero fabrication guarantee: Internal deliverables do not create fake airline PNRs or fake tickets', async () => {
    const env = createSimulatedTaskEnvironment({
      id: 'task-zero-fab',
      publicId: 'TSK-FAB-009',
      status: 'UNDERSTANDING',
      category: 'research_planning',
      intent: 'Compare luxury hotels in Jaipur with private plunge pools',
      originalRequest: 'Compare luxury hotels in Jaipur with private plunge pools',
      customerId: 'cust-fab-09',
      clientPreferences: {
        isDeliverable: true,
      },
    });

    const res = await RequestOrchestrator.processRequest({
      rawInput: 'Compare luxury hotels in Jaipur with private plunge pools',
      customerId: 'cust-fab-09',
      existingTaskId: 'task-zero-fab',
    });

    expect(res.task.status).toBe('COMPLETED');
    expect(res.task.externalReferenceId).toBeFalsy();
    expect(res.deliverable).toBeDefined();
    expect(res.deliverable?.status).toBe('FULFILLED');
  });
});
