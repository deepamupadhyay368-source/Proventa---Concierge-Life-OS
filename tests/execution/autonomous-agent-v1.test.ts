import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AIExecutionAgent, AutonomousExecutionAgent } from '@/lib/orchestration/execution/execution-agent';
import { ExecutionPlanner } from '@/lib/orchestration/execution/execution-planner';
import { PreExecutionConstraintGate } from '@/lib/orchestration/execution/constraint-gate';
import { DeterministicVerificationGate } from '@/lib/orchestration/execution/verification-gate';
import { ExecutionToolRegistry } from '@/lib/orchestration/execution/tool-registry';
import { ExecutionCapabilityRegistry } from '@/lib/orchestration/execution/execution-capability-registry';
import { db } from '@/lib/db';
import type { OptionProposal } from '@/lib/orchestration/types';

describe('PROVENTA — AUTONOMOUS AGENT V1 SUITE', { timeout: 25000 }, () => {
  const dummyUserId = 'usr_auto_test_001';
  const dummyCustomerId = 'cust_auto_test_001';
  const dummyTaskId = 'tsk_auto_test_001';

  const mockCustomer = {
    id: dummyCustomerId,
    userId: dummyUserId,
    membershipTier: 'PRIVATE',
    user: {
      id: dummyUserId,
      name: 'Rohan Mehta',
      email: 'rohan.mehta@example.com',
      phone: '+919876543210',
    },
  };

  const validApprovedFlight: OptionProposal = {
    id: 'opt_flight_amd_del_01',
    title: 'IndiGo 6E-204 Ahmedabad to Delhi',
    description: 'Direct morning flight from Ahmedabad to Delhi',
    providerName: 'IndiGo',
    providerId: 'duffel_flights',
    priceAmount: 485000, // ₹4,850.00 in paise
    priceFormatted: '₹4,850',
    priceCurrency: 'INR',
    environment: 'REAL',
    isMock: false,
    bookingMethod: 'API',
    metadata: {
      airline: 'IndiGo',
      flightNumber: '6E-204',
      origin: 'AMD',
      destination: 'DEL',
      date: '2026-10-15',
      departureDate: '2026-10-15',
      passengers: 1,
      cabinClass: 'ECONOMY',
    },
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(db.taskEvent, 'create').mockResolvedValue({} as any);
    vi.spyOn(db.booking, 'create').mockResolvedValue({} as any);
    vi.spyOn(db.notification, 'create').mockResolvedValue({} as any);
    vi.spyOn(ExecutionCapabilityRegistry, 'getCapability').mockReturnValue({
      capabilityId: 'cap_duffel_flights',
      service: 'flights',
      provider: 'Duffel Flights',
      providerId: 'duffel_flights',
      toolName: 'DuffelFlightsBookingTool',
      executionMethod: 'API',
      environment: 'REAL',
      capabilityStatus: 'LIVE_PRODUCTION',
      credentialsConfigured: true,
      credentialsVerified: true,
      actuallyExecutableInProduction: true,
      requiresPayment: false,
      requiresCustomerApproval: true,
      supportsAutomatedExecution: true,
      supportsAssistedExecution: true,
      supportsHumanExecution: true,
      verificationMethod: 'PNR',
      fallbackMethod: 'CONCIERGE',
    });
  });

  // Test 1: Approved flight executes through authorized provider (Level 1)
  it('1. Approved flight executes through authorized provider (Level 1 True Autonomous)', async () => {
    const taskRecord = {
      id: dummyTaskId,
      customerId: dummyCustomerId,
      category: 'travel',
      intent: 'Book flight from Ahmedabad to Delhi on 15 Oct',
      rawInput: 'Book flight AMD to DEL on 2026-10-15 for 1 passenger',
      status: 'APPROVED',
      customer: mockCustomer,
      extractedData: {
        origin: 'AMD',
        destination: 'DEL',
        date: '2026-10-15',
        passengers: 1,
      },
      proposedOptions: [validApprovedFlight],
      clientPreferences: {},
    };

    vi.spyOn(db.task, 'findUnique').mockResolvedValue(taskRecord as any);
    vi.spyOn(db.task as any, 'update').mockImplementation(async ({ data }: any) => ({
      ...taskRecord,
      ...data,
    }));
    vi.spyOn(db.taskEvent, 'create').mockResolvedValue({} as any);
    vi.spyOn(db.booking, 'create').mockResolvedValue({} as any);
    vi.spyOn(ExecutionCapabilityRegistry, 'isAutomatedExecutionAllowed').mockReturnValue(true);
    vi.spyOn(ExecutionCapabilityRegistry, 'getCapability').mockReturnValue({
      capabilityId: 'cap_duffel_flights',
      service: 'flights',
      provider: 'Duffel Flights',
      providerId: 'duffel_flights',
      toolName: 'DuffelFlightsBookingTool',
      executionMethod: 'API',
      environment: 'REAL',
      capabilityStatus: 'LIVE_PRODUCTION',
      credentialsConfigured: true,
      credentialsVerified: true,
      actuallyExecutableInProduction: true,
      requiresPayment: false,
      requiresCustomerApproval: true,
      supportsAutomatedExecution: true,
      supportsAssistedExecution: true,
      supportsHumanExecution: true,
      verificationMethod: 'PNR',
      fallbackMethod: 'CONCIERGE',
    });

    const mockTool = {
      toolName: 'DuffelFlightsBookingTool',
      providerId: 'duffel_flights',
      capabilityStatus: 'LIVE_PRODUCTION' as const,
      environment: 'REAL' as const,
      execute: vi.fn().mockResolvedValue({
        success: true,
        provider: 'duffel_flights',
        providerReference: 'ord_live_ind_998877',
        status: 'CONFIRMED',
        amount: 485000,
        currency: 'INR',
        isMock: false,
        environment: 'REAL',
        timestamp: new Date().toISOString(),
        confirmedDetails: {
          pnr: 'IND6E1',
          eTicket: '9988776655443',
        },
      }),
      verify: vi.fn().mockResolvedValue({ verified: true, status: 'CONFIRMED' }),
    };

    vi.spyOn(ExecutionToolRegistry, 'resolveTool').mockReturnValue(mockTool as any);

    const result = await AIExecutionAgent.executeTask({
      taskId: dummyTaskId,
      option: validApprovedFlight,
      userId: dummyUserId,
      skipPaymentGate: true,
    });

    expect(result.success).toBe(true);
    expect(result.status).toBe('CONFIRMED');
    expect(result.executionTier).toBe('LEVEL_1_TRUE_AUTONOMOUS');
    expect(result.confirmationReference).toBe('ord_live_ind_998877');
    expect(result.handedToConcierge).toBe(false);
    expect(result.verificationPassed).toBe(true);
  });

  // Test 2: Unapproved flight cannot execute
  it('2. Unapproved task or missing option cannot execute', async () => {
    const taskRecord = {
      id: dummyTaskId,
      customerId: dummyCustomerId,
      category: 'travel',
      status: 'SEARCHING',
      customer: mockCustomer,
      proposedOptions: [],
      clientPreferences: {},
    };

    vi.spyOn(db.task, 'findUnique').mockResolvedValue(taskRecord as any);

    const result = await AIExecutionAgent.executeTask({
      taskId: dummyTaskId,
      userId: dummyUserId,
    });

    expect(result.success).toBe(false);
    expect(result.message).toContain('No approved option');
  });

  // Test 3: Origin mismatch blocked (AUTONOMOUS_EXECUTION_GUARD_FAILED / INTENT_CONSTRAINT_MISMATCH)
  it('3. Origin mismatch is blocked by constraint gate and escalated to Concierge', async () => {
    const taskRecord = {
      id: dummyTaskId,
      customerId: dummyCustomerId,
      category: 'travel',
      status: 'APPROVED',
      customer: mockCustomer,
      extractedData: {
        origin: 'BOM', // Customer asked for Mumbai
        destination: 'DEL',
        date: '2026-10-15',
        passengers: 1,
      },
      proposedOptions: [validApprovedFlight], // Flight is from AMD
      clientPreferences: {},
    };

    vi.spyOn(db.task, 'findUnique').mockResolvedValue(taskRecord as any);
    const updateSpy = vi.spyOn(db.task as any, 'update').mockImplementation(async ({ data }: any) => ({
      ...taskRecord,
      ...data,
    }));
    vi.spyOn(db.taskEvent, 'create').mockResolvedValue({} as any);

    const result = await AIExecutionAgent.executeTask({
      taskId: dummyTaskId,
      option: validApprovedFlight,
      userId: dummyUserId,
    });

    expect(result.success).toBe(false);
    expect(result.status).toBe('NEEDS_HUMAN');
    expect(result.failureCategory).toBe('AUTONOMOUS_EXECUTION_GUARD_FAILED');
    expect(result.handedToConcierge).toBe(true);
    expect(result.handoffSummary).toBeDefined();
    expect(result.handoffSummary?.executionDetails.executionTier).toBe('LEVEL_3_HUMAN_CONCIERGE');
  });

  // Test 4: Destination mismatch blocked
  it('4. Destination mismatch is blocked by constraint gate', () => {
    const taskRecord = {
      category: 'travel',
      extractedData: {
        origin: 'AMD',
        destination: 'BLR', // Customer asked for Bangalore
        date: '2026-10-15',
      },
    };

    const plan = ExecutionPlanner.createPlan({
      taskId: dummyTaskId,
      taskRecord,
      approvedOption: validApprovedFlight, // Flight goes to DEL
    });

    const check = PreExecutionConstraintGate.evaluate({
      taskRecord,
      approvedOption: validApprovedFlight,
      executionPlan: plan,
    });

    expect(check.passed).toBe(false);
    expect(check.reason).toContain('Destination airport mismatch');
  });

  // Test 5: Date mismatch blocked
  it('5. Departure date mismatch is blocked by constraint gate', () => {
    const taskRecord = {
      category: 'travel',
      extractedData: {
        origin: 'AMD',
        destination: 'DEL',
        date: '2026-10-20', // Requested 20th Oct
      },
    };

    const plan = ExecutionPlanner.createPlan({
      taskId: dummyTaskId,
      taskRecord,
      approvedOption: validApprovedFlight, // Flight is 15th Oct
    });

    const check = PreExecutionConstraintGate.evaluate({
      taskRecord,
      approvedOption: validApprovedFlight,
      executionPlan: plan,
    });

    expect(check.passed).toBe(false);
    expect(check.reason).toContain('Date mismatch');
  });

  // Test 6: Passenger count mismatch blocked
  it('6. Passenger count mismatch is blocked by constraint gate', () => {
    const taskRecord = {
      category: 'travel',
      extractedData: {
        origin: 'AMD',
        destination: 'DEL',
        date: '2026-10-15',
        passengers: 4, // 4 passengers requested
      },
    };

    const plan = ExecutionPlanner.createPlan({
      taskId: dummyTaskId,
      taskRecord,
      approvedOption: validApprovedFlight, // Option only for 1
    });

    const check = PreExecutionConstraintGate.evaluate({
      taskRecord,
      approvedOption: validApprovedFlight,
      executionPlan: plan,
    });

    expect(check.passed).toBe(false);
    expect(check.reason).toContain('Passenger count mismatch');
  });

  // Test 7: Provider unavailable -> Escalates cleanly to Concierge
  it('7. Provider unavailable escalates to Concierge (Level 3)', async () => {
    const taskRecord = {
      id: dummyTaskId,
      customerId: dummyCustomerId,
      category: 'travel',
      status: 'APPROVED',
      customer: mockCustomer,
      extractedData: { origin: 'AMD', destination: 'DEL', date: '2026-10-15' },
      proposedOptions: [validApprovedFlight],
      clientPreferences: {},
    };

    vi.spyOn(db.task, 'findUnique').mockResolvedValue(taskRecord as any);
    vi.spyOn(db.task as any, 'update').mockImplementation(async ({ data }: any) => ({ ...taskRecord, ...data }));
    vi.spyOn(db.taskEvent, 'create').mockResolvedValue({} as any);
    vi.spyOn(ExecutionCapabilityRegistry, 'isAutomatedExecutionAllowed').mockReturnValue(false); // Provider unavailable

    const result = await AIExecutionAgent.executeTask({
      taskId: dummyTaskId,
      option: validApprovedFlight,
      userId: dummyUserId,
      skipPaymentGate: true,
    });

    expect(result.status).toBe('NEEDS_HUMAN');
    expect(result.handedToConcierge).toBe(true);
    expect(result.failureCategory).toBe('PROVIDER_UNAVAILABLE');
    expect(result.handoffSummary?.executionDetails.executionTier).toBe('LEVEL_3_HUMAN_CONCIERGE');
  });

  // Test 8: Provider unverified -> Escalates to Concierge
  it('8. Provider unverified or sandbox escalates to Concierge', async () => {
    const unverifiedOption: OptionProposal = {
      ...validApprovedFlight,
      environment: 'MOCK',
      isMock: true,
    };

    const taskRecord = {
      id: dummyTaskId,
      customerId: dummyCustomerId,
      category: 'travel',
      status: 'APPROVED',
      customer: mockCustomer,
      extractedData: { origin: 'AMD', destination: 'DEL', date: '2026-10-15' },
      proposedOptions: [unverifiedOption],
      clientPreferences: {},
    };

    vi.spyOn(db.task, 'findUnique').mockResolvedValue(taskRecord as any);
    vi.spyOn(db.task as any, 'update').mockImplementation(async ({ data }: any) => ({ ...taskRecord, ...data }));
    vi.spyOn(db.taskEvent, 'create').mockResolvedValue({} as any);

    const result = await AIExecutionAgent.executeTask({
      taskId: dummyTaskId,
      option: unverifiedOption,
      userId: dummyUserId,
      skipPaymentGate: true,
    });

    expect(result.status).toBe('NEEDS_HUMAN');
    expect(result.handedToConcierge).toBe(true);
  });

  // Test 9: Provider API failure -> Escalates to Concierge
  it('9. Provider API failure escalates to Concierge without crashing', async () => {
    const taskRecord = {
      id: dummyTaskId,
      customerId: dummyCustomerId,
      category: 'travel',
      status: 'APPROVED',
      customer: mockCustomer,
      extractedData: { origin: 'AMD', destination: 'DEL', date: '2026-10-15' },
      proposedOptions: [validApprovedFlight],
      clientPreferences: {},
    };

    vi.spyOn(db.task, 'findUnique').mockResolvedValue(taskRecord as any);
    vi.spyOn(db.task as any, 'update').mockImplementation(async ({ data }: any) => ({ ...taskRecord, ...data }));
    vi.spyOn(db.taskEvent, 'create').mockResolvedValue({} as any);
    vi.spyOn(ExecutionCapabilityRegistry, 'isAutomatedExecutionAllowed').mockReturnValue(true);

    const failingTool = {
      toolName: 'DuffelFlightsBookingTool',
      providerId: 'duffel_flights',
      capabilityStatus: 'LIVE_PRODUCTION' as const,
      environment: 'REAL' as const,
      execute: vi.fn().mockResolvedValue({
        success: false,
        provider: 'duffel_flights',
        status: 'FAILED',
        errorCode: 'PROVIDER_API_500',
        errorMessage: 'Airline inventory locked or provider internal error',
        isMock: false,
        environment: 'REAL',
        timestamp: new Date().toISOString(),
      }),
    };

    vi.spyOn(ExecutionToolRegistry, 'resolveTool').mockReturnValue(failingTool as any);

    const result = await AIExecutionAgent.executeTask({
      taskId: dummyTaskId,
      option: validApprovedFlight,
      userId: dummyUserId,
      skipPaymentGate: true,
    });

    expect(result.status).toBe('NEEDS_HUMAN');
    expect(result.handedToConcierge).toBe(true);
    expect(result.verificationPassed).toBe(false);
  });

  // Test 10: Duplicate execution prevented by idempotency
  it('10. Duplicate execution is prevented by idempotency key', async () => {
    const plan = ExecutionPlanner.createPlan({
      taskId: dummyTaskId,
      taskRecord: { category: 'travel' },
      approvedOption: validApprovedFlight,
    });

    const taskRecord = {
      id: dummyTaskId,
      customerId: dummyCustomerId,
      category: 'travel',
      status: 'CONFIRMED',
      externalReferenceId: 'ord_live_already_confirmed_123',
      customer: mockCustomer,
      proposedOptions: [validApprovedFlight],
      clientPreferences: {
        executionIdempotencyKey: plan.idempotencyKey,
      },
    };

    vi.spyOn(db.task, 'findUnique').mockResolvedValue(taskRecord as any);

    const result = await AIExecutionAgent.executeTask({
      taskId: dummyTaskId,
      option: validApprovedFlight,
      userId: dummyUserId,
      skipPaymentGate: true,
    });

    expect(result.success).toBe(true);
    expect(result.confirmationReference).toBe('ord_live_already_confirmed_123');
    expect(result.message).toContain('confirmed');
  });

  // Test 11: Uncertain booking status -> Verification before retry
  it('11. Uncertain booking status checks verification before performing retry', async () => {
    const taskRecord = {
      id: dummyTaskId,
      customerId: dummyCustomerId,
      category: 'travel',
      status: 'APPROVED',
      customer: mockCustomer,
      extractedData: { origin: 'AMD', destination: 'DEL', date: '2026-10-15' },
      proposedOptions: [validApprovedFlight],
      clientPreferences: {},
    };

    vi.spyOn(db.task, 'findUnique').mockResolvedValue(taskRecord as any);
    vi.spyOn(db.task as any, 'update').mockImplementation(async ({ data }: any) => ({ ...taskRecord, ...data }));
    vi.spyOn(db.taskEvent, 'create').mockResolvedValue({} as any);
    vi.spyOn(db.booking, 'create').mockResolvedValue({} as any);
    vi.spyOn(ExecutionCapabilityRegistry, 'isAutomatedExecutionAllowed').mockReturnValue(true);

    const verifyMock = vi.fn().mockResolvedValue({ verified: true, status: 'CONFIRMED' });

    const timeoutTool = {
      toolName: 'DuffelFlightsBookingTool',
      providerId: 'duffel_flights',
      capabilityStatus: 'LIVE_PRODUCTION' as const,
      environment: 'REAL' as const,
      execute: vi.fn().mockResolvedValue({
        success: false,
        provider: 'duffel_flights',
        providerReference: 'ord_live_uncertain_ref_456',
        status: 'FAILED',
        errorCode: 'TIMEOUT',
        isMock: false,
        environment: 'REAL',
        timestamp: new Date().toISOString(),
        confirmedDetails: { pnr: 'UNCERT1' },
      }),
      verify: verifyMock,
    };

    vi.spyOn(ExecutionToolRegistry, 'resolveTool').mockReturnValue(timeoutTool as any);

    const result = await AIExecutionAgent.executeTask({
      taskId: dummyTaskId,
      option: validApprovedFlight,
      userId: dummyUserId,
      skipPaymentGate: true,
    });

    expect(verifyMock).toHaveBeenCalledWith('ord_live_uncertain_ref_456');
    expect(result.status).toBe('CONFIRMED');
    expect(result.confirmationReference).toBe('ord_live_uncertain_ref_456');
  });

  // Test 12: Fake reference rejected (PV-*, MOCK-*, TEST-*, DEMO-*, FAKE-*)
  it('12. Fake and synthetic reference prefixes are rejected by verification gate', () => {
    const fakeRefs = ['PV-123456', 'MOCK-9988', 'TEST-ORD', 'DEMO-FLY', 'FAKE-PNR', 'ORD_SANDBOX_123'];

    for (const ref of fakeRefs) {
      const result = DeterministicVerificationGate.evaluate({
        taskRecord: { category: 'travel' },
        approvedOption: validApprovedFlight,
        executionPlan: {} as any,
        toolResult: {
          success: true,
          provider: 'duffel_flights',
          providerReference: ref,
          status: 'CONFIRMED',
          isMock: false,
          environment: 'REAL',
          timestamp: new Date().toISOString(),
        },
      });

      expect(result.passed).toBe(false);
      expect(result.errorCode).toBe('SYNTHETIC_EVIDENCE_REJECTED');
    }
  });

  // Test 13: Sandbox provider never marked live
  it('13. Sandbox provider is never marked live production', () => {
    const sandboxResult = DeterministicVerificationGate.evaluate({
      taskRecord: { category: 'travel' },
      approvedOption: validApprovedFlight,
      executionPlan: {} as any,
      toolResult: {
        success: true,
        provider: 'duffel_flights',
        providerReference: 'ord_sandbox_reallooking',
        status: 'CONFIRMED',
        isMock: false,
        environment: 'SANDBOX',
        timestamp: new Date().toISOString(),
      },
    });

    expect(sandboxResult.passed).toBe(false);
  });

  // Test 14: Genuine provider reference accepted
  it('14. Genuine provider reference passes verification gate', () => {
    const validRefs = ['ord_0000A1B2C3D4E5', 'ABCDEF', '6E9988', '1762345678901'];

    for (const ref of validRefs) {
      const result = DeterministicVerificationGate.evaluate({
        taskRecord: { category: 'travel' },
        approvedOption: validApprovedFlight,
        executionPlan: {} as any,
        toolResult: {
          success: true,
          provider: 'duffel_flights',
          providerReference: ref,
          status: 'CONFIRMED',
          isMock: false,
          environment: 'REAL',
          timestamp: new Date().toISOString(),
        },
      });

      expect(result.passed).toBe(true);
    }
  });

  // Test 15: Successful verification -> CONFIRMED
  it('15. Successful verification transitions task to CONFIRMED', async () => {
    const taskRecord = {
      id: dummyTaskId,
      customerId: dummyCustomerId,
      category: 'travel',
      status: 'APPROVED',
      customer: mockCustomer,
      extractedData: { origin: 'AMD', destination: 'DEL', date: '2026-10-15' },
      proposedOptions: [validApprovedFlight],
      clientPreferences: {},
    };

    vi.spyOn(db.task, 'findUnique').mockResolvedValue(taskRecord as any);
    const updateSpy = vi.spyOn(db.task as any, 'update').mockImplementation(async ({ data }: any) => ({
      ...taskRecord,
      ...data,
    }));
    vi.spyOn(db.taskEvent, 'create').mockResolvedValue({} as any);
    vi.spyOn(db.booking, 'create').mockResolvedValue({} as any);
    vi.spyOn(ExecutionCapabilityRegistry, 'isAutomatedExecutionAllowed').mockReturnValue(true);

    const validTool = {
      toolName: 'DuffelFlightsBookingTool',
      providerId: 'duffel_flights',
      capabilityStatus: 'LIVE_PRODUCTION' as const,
      environment: 'REAL' as const,
      execute: vi.fn().mockResolvedValue({
        success: true,
        provider: 'duffel_flights',
        providerReference: 'ord_live_genuine_7788',
        status: 'CONFIRMED',
        amount: 485000,
        currency: 'INR',
        isMock: false,
        environment: 'REAL',
        timestamp: new Date().toISOString(),
      }),
      verify: vi.fn().mockResolvedValue({ verified: true }),
    };

    vi.spyOn(ExecutionToolRegistry, 'resolveTool').mockReturnValue(validTool as any);

    const result = await AIExecutionAgent.executeTask({
      taskId: dummyTaskId,
      option: validApprovedFlight,
      userId: dummyUserId,
      skipPaymentGate: true,
    });

    expect(result.status).toBe('CONFIRMED');
    expect(result.handedToConcierge).toBe(false);
  });

  // Test 16: Failed verification -> NEEDS_HUMAN
  it('16. Failed verification escalates to NEEDS_HUMAN', async () => {
    const taskRecord = {
      id: dummyTaskId,
      customerId: dummyCustomerId,
      category: 'travel',
      status: 'APPROVED',
      customer: mockCustomer,
      extractedData: { origin: 'AMD', destination: 'DEL', date: '2026-10-15' },
      proposedOptions: [validApprovedFlight],
      clientPreferences: {},
    };

    vi.spyOn(db.task, 'findUnique').mockResolvedValue(taskRecord as any);
    vi.spyOn(db.task as any, 'update').mockImplementation(async ({ data }: any) => ({ ...taskRecord, ...data }));
    vi.spyOn(db.taskEvent, 'create').mockResolvedValue({} as any);
    vi.spyOn(ExecutionCapabilityRegistry, 'isAutomatedExecutionAllowed').mockReturnValue(true);

    const toolWithUnverifiedRef = {
      toolName: 'DuffelFlightsBookingTool',
      providerId: 'duffel_flights',
      capabilityStatus: 'LIVE_PRODUCTION' as const,
      environment: 'REAL' as const,
      execute: vi.fn().mockResolvedValue({
        success: true,
        provider: 'duffel_flights',
        providerReference: 'PV-SYNTHETIC-99', // Synthetic reference will fail verification gate
        status: 'CONFIRMED',
        isMock: false,
        environment: 'REAL',
        timestamp: new Date().toISOString(),
      }),
    };

    vi.spyOn(ExecutionToolRegistry, 'resolveTool').mockReturnValue(toolWithUnverifiedRef as any);

    const result = await AIExecutionAgent.executeTask({
      taskId: dummyTaskId,
      option: validApprovedFlight,
      userId: dummyUserId,
      skipPaymentGate: true,
    });

    expect(result.status).toBe('NEEDS_HUMAN');
    expect(result.handedToConcierge).toBe(true);
    expect(result.verificationPassed).toBe(false);
  });

  // Test 17: Customer sees correct success message
  it('17. Customer receives clear confirmed message format', async () => {
    const taskRecord = {
      id: dummyTaskId,
      customerId: dummyCustomerId,
      category: 'travel',
      status: 'APPROVED',
      customer: mockCustomer,
      extractedData: { origin: 'AMD', destination: 'DEL', date: '2026-10-15' },
      proposedOptions: [validApprovedFlight],
      clientPreferences: {},
    };

    vi.spyOn(db.task, 'findUnique').mockResolvedValue(taskRecord as any);
    vi.spyOn(db.task as any, 'update').mockImplementation(async ({ data }: any) => ({ ...taskRecord, ...data }));
    vi.spyOn(db.taskEvent, 'create').mockResolvedValue({} as any);
    vi.spyOn(db.booking, 'create').mockResolvedValue({} as any);
    vi.spyOn(ExecutionCapabilityRegistry, 'isAutomatedExecutionAllowed').mockReturnValue(true);

    const mockTool = {
      toolName: 'DuffelFlightsBookingTool',
      providerId: 'duffel_flights',
      capabilityStatus: 'LIVE_PRODUCTION' as const,
      environment: 'REAL' as const,
      execute: vi.fn().mockResolvedValue({
        success: true,
        provider: 'duffel_flights',
        providerReference: 'ord_live_indigo_6e',
        status: 'CONFIRMED',
        isMock: false,
        environment: 'REAL',
        timestamp: new Date().toISOString(),
      }),
    };

    vi.spyOn(ExecutionToolRegistry, 'resolveTool').mockReturnValue(mockTool as any);

    const result = await AIExecutionAgent.executeTask({
      taskId: dummyTaskId,
      option: validApprovedFlight,
      userId: dummyUserId,
      skipPaymentGate: true,
    });

    expect(result.message).toContain('Done. Your reservation with IndiGo is confirmed. Reference: ord_live_indigo_6e');
  });

  // Test 18: Customer sees correct Concierge fallback message
  it('18. Customer receives exact friendly Concierge fallback message on escalation', async () => {
    const taskRecord = {
      id: dummyTaskId,
      customerId: dummyCustomerId,
      category: 'travel',
      status: 'APPROVED',
      customer: mockCustomer,
      extractedData: { origin: 'AMD', destination: 'DEL', date: '2026-10-15' },
      proposedOptions: [validApprovedFlight],
      clientPreferences: {},
    };

    vi.spyOn(db.task, 'findUnique').mockResolvedValue(taskRecord as any);
    vi.spyOn(db.task as any, 'update').mockImplementation(async ({ data }: any) => ({ ...taskRecord, ...data }));
    vi.spyOn(db.taskEvent, 'create').mockResolvedValue({} as any);
    vi.spyOn(ExecutionCapabilityRegistry, 'isAutomatedExecutionAllowed').mockReturnValue(false);

    const result = await AIExecutionAgent.executeTask({
      taskId: dummyTaskId,
      option: validApprovedFlight,
      userId: dummyUserId,
      skipPaymentGate: true,
    });

    expect(result.message).toBe('Your request is approved and has been handed to your Proventa Concierge for execution.');
  });

  // Test 19: All AUTONOMOUS_* audit events emitted
  it('19. All AUTONOMOUS_* audit events are emitted into the task timeline', async () => {
    const emittedEvents: string[] = [];

    vi.spyOn(db.taskEvent as any, 'create').mockImplementation((async ({ data }: any) => {
      emittedEvents.push(data.eventType);
      return {} as any;
    }) as any);

    const taskRecord = {
      id: dummyTaskId,
      customerId: dummyCustomerId,
      category: 'travel',
      status: 'APPROVED',
      customer: mockCustomer,
      extractedData: { origin: 'AMD', destination: 'DEL', date: '2026-10-15' },
      proposedOptions: [validApprovedFlight],
      clientPreferences: {},
    };

    vi.spyOn(db.task, 'findUnique').mockResolvedValue(taskRecord as any);
    vi.spyOn(db.task as any, 'update').mockImplementation((async ({ data }: any) => ({ ...taskRecord, ...data })) as any);
    vi.spyOn(db.booking, 'create').mockResolvedValue({} as any);
    vi.spyOn(ExecutionCapabilityRegistry, 'isAutomatedExecutionAllowed').mockReturnValue(true);

    const mockTool = {
      toolName: 'DuffelFlightsBookingTool',
      providerId: 'duffel_flights',
      capabilityStatus: 'LIVE_PRODUCTION' as const,
      environment: 'REAL' as const,
      execute: vi.fn().mockResolvedValue({
        success: true,
        provider: 'duffel_flights',
        providerReference: 'ord_live_indigo_audit_test',
        status: 'CONFIRMED',
        isMock: false,
        environment: 'REAL',
        timestamp: new Date().toISOString(),
      }),
    };

    vi.spyOn(ExecutionToolRegistry, 'resolveTool').mockReturnValue(mockTool as any);

    await AIExecutionAgent.executeTask({
      taskId: dummyTaskId,
      option: validApprovedFlight,
      userId: dummyUserId,
      skipPaymentGate: true,
    });

    expect(emittedEvents).toContain('AUTONOMOUS_EXECUTION_STARTED');
    expect(emittedEvents).toContain('AUTONOMOUS_TOOL_SELECTED');
    expect(emittedEvents).toContain('AUTONOMOUS_PROVIDER_CALLED');
    expect(emittedEvents).toContain('AUTONOMOUS_PROVIDER_RESPONSE');
    expect(emittedEvents).toContain('AUTONOMOUS_VERIFICATION_STARTED');
    expect(emittedEvents).toContain('AUTONOMOUS_VERIFICATION_PASSED');
    expect(emittedEvents).toContain('AUTONOMOUS_EXECUTION_CONFIRMED');
  });

  // Test 20: No secrets logged in task events or outputs
  it('20. No secrets (API tokens, auth keys, secret headers) are logged in task events or outputs', async () => {
    const emittedDataList: any[] = [];

    vi.spyOn(db.taskEvent as any, 'create').mockImplementation((async ({ data }: any) => {
      emittedDataList.push(data);
      return {} as any;
    }) as any);

    const taskRecord = {
      id: dummyTaskId,
      customerId: dummyCustomerId,
      category: 'travel',
      status: 'APPROVED',
      customer: mockCustomer,
      extractedData: { origin: 'AMD', destination: 'DEL', date: '2026-10-15' },
      proposedOptions: [validApprovedFlight],
      clientPreferences: {},
    };

    vi.spyOn(db.task, 'findUnique').mockResolvedValue(taskRecord as any);
    vi.spyOn(db.task as any, 'update').mockImplementation((async ({ data }: any) => ({ ...taskRecord, ...data })) as any);
    vi.spyOn(db.booking, 'create').mockResolvedValue({} as any);
    vi.spyOn(ExecutionCapabilityRegistry, 'isAutomatedExecutionAllowed').mockReturnValue(true);

    const mockTool = {
      toolName: 'DuffelFlightsBookingTool',
      providerId: 'duffel_flights',
      capabilityStatus: 'LIVE_PRODUCTION' as const,
      environment: 'REAL' as const,
      execute: vi.fn().mockResolvedValue({
        success: true,
        provider: 'duffel_flights',
        providerReference: 'ord_live_indigo_sec_01',
        status: 'CONFIRMED',
        isMock: false,
        environment: 'REAL',
        timestamp: new Date().toISOString(),
      }),
    };

    vi.spyOn(ExecutionToolRegistry, 'resolveTool').mockReturnValue(mockTool as any);

    const result = await AutonomousExecutionAgent.executeTask({
      taskId: dummyTaskId,
      option: validApprovedFlight,
      userId: dummyUserId,
      skipPaymentGate: true,
    });

    const serializedEvents = JSON.stringify(emittedDataList);
    const serializedOutput = JSON.stringify(result);

    const forbiddenPatterns = [
      /duffel_live_[a-zA-Z0-9_-]+/i,
      /duffel_test_[a-zA-Z0-9_-]+/i,
      /bearer\s+[a-zA-Z0-9_-]+/i,
      /rzp_live_[a-zA-Z0-9_-]+/i,
      /rzp_test_[a-zA-Z0-9_-]+/i,
      /AIzaSy[a-zA-Z0-9_-]+/i,
    ];

    for (const pattern of forbiddenPatterns) {
      expect(pattern.test(serializedEvents)).toBe(false);
      expect(pattern.test(serializedOutput)).toBe(false);
    }
  });
});
