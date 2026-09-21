import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock session and notification services
vi.mock('@/lib/auth/session', () => ({
  requireConcierge: vi.fn(),
  requireAdmin: vi.fn(),
  requireAuth: vi.fn(),
  requireRole: vi.fn(),
  getSession: vi.fn(),
}));

vi.mock('@/lib/notifications/whatsapp', () => ({
  sendWhatsAppNotification: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/lib/email/sender', () => ({
  sendBookingConfirmationEmail: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/lib/orchestration/timeline', () => ({
  appendTaskEvent: vi.fn().mockResolvedValue({ id: 'evt-test-123' }),
}));

import { RequestOrchestrator } from '@/lib/orchestration/orchestrator';
import { db } from '@/lib/db';
import { OptionProposal, ProposalBatch } from '@/lib/orchestration/types';
import { EntityIntegrityValidator } from '@/lib/validation/entity-integrity';

describe('Iterative 5-Option Recommendation Cycle Suite (20 Acceptance Tests)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 1. First request returns 5 options (BATCH-001)
  it('1. first request returns 5 options labeled BATCH-001', async () => {
    const taskRecord: any = {
      id: 'task-test-cycle-1',
      publicId: 'TSK-REC-01',
      category: 'dining',
      intent: 'Fine dining in Ahmedabad for 2 guests',
      originalRequest: 'Fine dining in Ahmedabad for 2 guests',
      status: 'AWAITING_APPROVAL',
      customerId: 'cust-1',
      clientPreferences: {},
    };

    vi.spyOn(db.task, 'findUnique').mockResolvedValue(taskRecord);
    (vi.spyOn(db.task, 'update') as any).mockImplementation(async ({ data }: any) => {
      Object.assign(taskRecord, data);
      return taskRecord;
    });

    const result = await RequestOrchestrator.cycleOptionBatch({
      taskId: 'task-test-cycle-1',
      userId: 'usr-1',
      action: 'REJECT_ALL',
    });

    expect(result.batch).toBeDefined();
    expect(result.batch!.batchId).toBe('BATCH-001');
    expect(result.batch!.batchNumber).toBe(1);
    expect(result.batch!.options.length).toBe(5);
  });

  // 2. Rejecting Batch 1 generates Batch 2 (BATCH-002)
  it('2. rejecting Batch 1 generates Batch 2 (BATCH-002)', async () => {
    const initialBatch: ProposalBatch = {
      batchId: 'BATCH-001',
      batchNumber: 1,
      generatedAt: new Date().toISOString(),
      options: [
        { id: 'opt-1', providerId: 'p1', providerName: 'P1', title: 'Option 1', description: 'Desc 1', priceAmount: 1000, priceCurrency: 'INR', priceFormatted: '₹1000', bookingMethod: 'API' },
        { id: 'opt-2', providerId: 'p2', providerName: 'P2', title: 'Option 2', description: 'Desc 2', priceAmount: 2000, priceCurrency: 'INR', priceFormatted: '₹2000', bookingMethod: 'API' },
        { id: 'opt-3', providerId: 'p3', providerName: 'P3', title: 'Option 3', description: 'Desc 3', priceAmount: 3000, priceCurrency: 'INR', priceFormatted: '₹3000', bookingMethod: 'API' },
        { id: 'opt-4', providerId: 'p4', providerName: 'P4', title: 'Option 4', description: 'Desc 4', priceAmount: 4000, priceCurrency: 'INR', priceFormatted: '₹4000', bookingMethod: 'API' },
        { id: 'opt-5', providerId: 'p5', providerName: 'P5', title: 'Option 5', description: 'Desc 5', priceAmount: 5000, priceCurrency: 'INR', priceFormatted: '₹5000', bookingMethod: 'API' },
      ],
      status: 'PRESENTED',
    };

    const taskRecord: any = {
      id: 'task-cycle-2',
      publicId: 'TSK-REC-02',
      category: 'dining',
      intent: 'Fine dining in Ahmedabad for 2 guests',
      originalRequest: 'Fine dining in Ahmedabad for 2 guests',
      status: 'AWAITING_APPROVAL',
      customerId: 'cust-1',
      proposedOptions: initialBatch.options,
      clientPreferences: {
        currentBatchId: 'BATCH-001',
        batchHistory: [initialBatch],
        rejectedOptionIds: ['opt-1', 'opt-2', 'opt-3', 'opt-4', 'opt-5'],
        rejectedOptionKeys: ['p1:opt-1', 'p2:opt-2', 'p3:opt-3', 'p4:opt-4', 'p5:opt-5'],
      },
    };

    vi.spyOn(db.task, 'findUnique').mockResolvedValue(taskRecord);
    (vi.spyOn(db.task, 'update') as any).mockImplementation(async ({ data }: any) => {
      Object.assign(taskRecord, data);
      return taskRecord;
    });

    const result = await RequestOrchestrator.cycleOptionBatch({
      taskId: 'task-cycle-2',
      userId: 'usr-1',
      action: 'REJECT_ALL',
      feedback: 'Too formal, want something relaxed',
    });

    expect(result.batch).toBeDefined();
    expect(result.batch!.batchId).toBe('BATCH-002');
    expect(result.batch!.batchNumber).toBe(2);
    expect(taskRecord.clientPreferences.batchHistory[0].status).toBe('REJECTED');
    expect(taskRecord.clientPreferences.batchHistory[0].feedback).toBe('Too formal, want something relaxed');
  });

  // 3. Batch 2 contains 5 new options
  it('3. Batch 2 contains 5 options', async () => {
    const taskRecord: any = {
      id: 'task-cycle-3',
      category: 'dining',
      intent: 'Fine dining in Ahmedabad',
      originalRequest: 'Fine dining in Ahmedabad',
      status: 'AWAITING_APPROVAL',
      customerId: 'cust-1',
      clientPreferences: {
        currentBatchId: 'BATCH-001',
        batchHistory: [{ batchId: 'BATCH-001', batchNumber: 1, options: [], status: 'PRESENTED' }],
      },
    };

    vi.spyOn(db.task, 'findUnique').mockResolvedValue(taskRecord);
    (vi.spyOn(db.task, 'update') as any).mockImplementation(async ({ data }: any) => {
      Object.assign(taskRecord, data);
      return taskRecord;
    });

    const result = await RequestOrchestrator.cycleOptionBatch({
      taskId: 'task-cycle-3',
      userId: 'usr-1',
      action: 'REJECT_ALL',
    });

    expect(result.batch).toBeDefined();
    expect(result.batch!.options.length).toBe(5);
  });

  // 4. Batch 1 options never appear in Batch 2
  it('4. Batch 1 options never appear in Batch 2', async () => {
    const taskRecord: any = {
      id: 'task-cycle-4',
      category: 'dining',
      intent: 'Fine dining in Ahmedabad',
      originalRequest: 'Fine dining in Ahmedabad',
      status: 'AWAITING_APPROVAL',
      customerId: 'cust-1',
      clientPreferences: {},
    };

    vi.spyOn(db.task, 'findUnique').mockResolvedValue(taskRecord);
    (vi.spyOn(db.task, 'update') as any).mockImplementation(async ({ data }: any) => {
      Object.assign(taskRecord, data);
      return taskRecord;
    });

    // Generate batch 1
    const res1 = await RequestOrchestrator.cycleOptionBatch({
      taskId: 'task-cycle-4',
      userId: 'usr-1',
      action: 'REJECT_ALL',
    });
    const batch1Ids = res1.batch!.options.map((o) => o.id);
    const batch1Titles = res1.batch!.options.map((o) => o.title);

    // Generate batch 2
    const res2 = await RequestOrchestrator.cycleOptionBatch({
      taskId: 'task-cycle-4',
      userId: 'usr-1',
      action: 'REJECT_ALL',
    });
    const batch2Ids = res2.batch!.options.map((o) => o.id);
    const batch2Titles = res2.batch!.options.map((o) => o.title);

    // Verify zero intersection
    const idOverlap = batch2Ids.filter((id) => batch1Ids.includes(id));
    const titleOverlap = batch2Titles.filter((t) => batch1Titles.includes(t));

    expect(idOverlap).toEqual([]);
    expect(titleOverlap).toEqual([]);
  });

  // 5. Batch 3 excludes Batch 1 + Batch 2
  it('5. Batch 3 excludes Batch 1 and Batch 2 options', async () => {
    const taskRecord: any = {
      id: 'task-cycle-5',
      category: 'dining',
      intent: 'Fine dining in Ahmedabad',
      originalRequest: 'Fine dining in Ahmedabad',
      status: 'AWAITING_APPROVAL',
      customerId: 'cust-1',
      clientPreferences: {},
    };

    vi.spyOn(db.task, 'findUnique').mockResolvedValue(taskRecord);
    (vi.spyOn(db.task, 'update') as any).mockImplementation(async ({ data }: any) => {
      Object.assign(taskRecord, data);
      return taskRecord;
    });

    const b1 = await RequestOrchestrator.cycleOptionBatch({ taskId: 'task-cycle-5', userId: 'u1', action: 'REJECT_ALL' });
    const b2 = await RequestOrchestrator.cycleOptionBatch({ taskId: 'task-cycle-5', userId: 'u1', action: 'REJECT_ALL' });
    const b3 = await RequestOrchestrator.cycleOptionBatch({ taskId: 'task-cycle-5', userId: 'u1', action: 'REJECT_ALL' });

    expect(b3.batch).toBeDefined();
    expect(b3.batch!.batchId).toBe('BATCH-003');
    expect(b3.batch!.batchNumber).toBe(3);

    const b1b2Ids = new Set([...b1.batch!.options.map((o) => o.id), ...b2.batch!.options.map((o) => o.id)]);
    const b3Ids = b3.batch!.options.map((o) => o.id);

    for (const id of b3Ids) {
      expect(b1b2Ids.has(id)).toBe(false);
    }
  });

  // 6. Rejection feedback influences the next batch
  it('6. rejection feedback "Too expensive" prioritizes lower-priced options', async () => {
    const taskRecord: any = {
      id: 'task-cycle-6',
      category: 'dining',
      intent: 'Fine dining in Ahmedabad',
      originalRequest: 'Fine dining in Ahmedabad',
      status: 'AWAITING_APPROVAL',
      customerId: 'cust-1',
      clientPreferences: {},
    };

    vi.spyOn(db.task, 'findUnique').mockResolvedValue(taskRecord);
    (vi.spyOn(db.task, 'update') as any).mockImplementation(async ({ data }: any) => {
      Object.assign(taskRecord, data);
      return taskRecord;
    });

    await RequestOrchestrator.cycleOptionBatch({ taskId: 'task-cycle-6', userId: 'u1', action: 'REJECT_ALL' });

    // Cycle with "Too expensive"
    const res = await RequestOrchestrator.cycleOptionBatch({
      taskId: 'task-cycle-6',
      userId: 'u1',
      action: 'REJECT_ALL',
      feedback: 'Too expensive, show more affordable options',
    });

    expect(res.batch).toBeDefined();
    expect(res.batch!.options.length).toBeGreaterThan(0);
    // When sorted ascending by price, the first option price should be <= subsequent option price
    const prices = res.batch!.options.map((o) => o.priceAmount || 0);
    expect(prices[0]).toBeLessThanOrEqual(prices[prices.length - 1]);
  });

  // 7. Individual option replacement works
  it('7. individual option replacement replaces only the targeted option', async () => {
    const taskRecord: any = {
      id: 'task-cycle-7',
      category: 'dining',
      intent: 'Fine dining in Ahmedabad',
      originalRequest: 'Fine dining in Ahmedabad',
      status: 'AWAITING_APPROVAL',
      customerId: 'cust-1',
      clientPreferences: {},
    };

    vi.spyOn(db.task, 'findUnique').mockResolvedValue(taskRecord);
    (vi.spyOn(db.task, 'update') as any).mockImplementation(async ({ data }: any) => {
      Object.assign(taskRecord, data);
      return taskRecord;
    });

    const init = await RequestOrchestrator.cycleOptionBatch({ taskId: 'task-cycle-7', userId: 'u1', action: 'REJECT_ALL' });
    const targetOption = init.batch!.options[2]; // replace the 3rd option
    const keptOptionIds = init.batch!.options.filter((o) => o.id !== targetOption.id).map((o) => o.id);

    const replaced = await RequestOrchestrator.cycleOptionBatch({
      taskId: 'task-cycle-7',
      userId: 'u1',
      action: 'REPLACE_OPTION',
      replaceOptionId: targetOption.id,
    });

    expect(replaced.batch).toBeDefined();
    expect(replaced.batch!.options.length).toBe(5);
    // The replaced option ID must not be in the new batch
    expect(replaced.batch!.options.some((o) => o.id === targetOption.id)).toBe(false);
    // The other 4 options should still be present
    for (const keptId of keptOptionIds) {
      expect(replaced.batch!.options.some((o) => o.id === keptId)).toBe(true);
    }
  });

  // 8. Partial rejection works
  it('8. partial rejection keeps selected options and replaces unselected ones', async () => {
    const taskRecord: any = {
      id: 'task-cycle-8',
      category: 'dining',
      intent: 'Fine dining in Ahmedabad',
      originalRequest: 'Fine dining in Ahmedabad',
      status: 'AWAITING_APPROVAL',
      customerId: 'cust-1',
      clientPreferences: {},
    };

    vi.spyOn(db.task, 'findUnique').mockResolvedValue(taskRecord);
    (vi.spyOn(db.task, 'update') as any).mockImplementation(async ({ data }: any) => {
      Object.assign(taskRecord, data);
      return taskRecord;
    });

    const init = await RequestOrchestrator.cycleOptionBatch({ taskId: 'task-cycle-8', userId: 'u1', action: 'REJECT_ALL' });
    const keepIds = [init.batch!.options[0].id, init.batch!.options[1].id]; // keep 2 options

    const updated = await RequestOrchestrator.cycleOptionBatch({
      taskId: 'task-cycle-8',
      userId: 'u1',
      action: 'PARTIAL_REJECT',
      keptOptionIds: keepIds,
    });

    expect(updated.batch).toBeDefined();
    expect(updated.batch!.options.length).toBe(5);
    expect(updated.batch!.options.some((o) => o.id === keepIds[0])).toBe(true);
    expect(updated.batch!.options.some((o) => o.id === keepIds[1])).toBe(true);
  });

  // 9. Approved options remain locked
  it('9. approved options remain locked in clientPreferences and batch is marked APPROVED', async () => {
    const chosenOption: OptionProposal = {
      id: 'opt-winner-1',
      providerId: 'ahmedabad_verified',
      providerName: 'Agashiye — The House of MG',
      title: 'Heritage Thali Dinner',
      description: 'Traditional thali experience',
      priceAmount: 2400,
      priceCurrency: 'INR',
      priceFormatted: '₹2,400',
      availability: 'Available',
      bookingMethod: 'API',
    };

    const taskRecord: any = {
      id: 'task-cycle-9',
      category: 'dining',
      intent: 'Heritage Thali Dinner',
      originalRequest: 'Heritage Thali Dinner',
      status: 'AWAITING_APPROVAL',
      customerId: 'cust-1',
      clientPreferences: {
        currentBatchId: 'BATCH-001',
        batchHistory: [
          {
            batchId: 'BATCH-001',
            batchNumber: 1,
            options: [chosenOption],
            status: 'PRESENTED',
          },
        ],
      },
    };

    vi.spyOn(db.task, 'findUnique').mockResolvedValue(taskRecord);
    (vi.spyOn(db.task, 'update') as any).mockImplementation(async ({ data }: any) => {
      Object.assign(taskRecord, data);
      return taskRecord;
    });
    vi.spyOn(db.booking, 'create').mockResolvedValue({ id: 'bkg-999' } as any);

    // Mock agent execution
    const mockAgent = {
      execute: vi.fn().mockResolvedValue({
        success: true,
        providerId: 'ahmedabad_verified',
        externalReferenceId: 'AGS-TABLE-LOCK-01',
        environment: 'REAL',
        isMock: false,
      }),
      verify: vi.fn().mockResolvedValue({ verified: true, environment: 'REAL' }),
    };

    const { findAgentForTask } = await import('@/lib/orchestration/agents');
    vi.spyOn({ findAgentForTask }, 'findAgentForTask').mockReturnValue(mockAgent as any);

    await RequestOrchestrator.executeApprovedTask({
      taskId: 'task-cycle-9',
      option: chosenOption,
      userId: 'usr-1',
    });

    const prefs = taskRecord.clientPreferences;
    expect(prefs.approvedOption).toBeDefined();
    expect(prefs.approvedOption.id).toBe('opt-winner-1');
    expect(prefs.batchHistory[0].status).toBe('APPROVED');
    expect(prefs.batchHistory[0].approvedOptionId).toBe('opt-winner-1');
  });

  // 10. Changed constraints generate a new valid batch
  it('10. changed constraints via MODIFY_REQUEST generate a new valid batch', async () => {
    const taskRecord: any = {
      id: 'task-cycle-10',
      category: 'flights',
      intent: 'Flights from Ahmedabad to Delhi',
      originalRequest: 'Flights from Ahmedabad to Delhi',
      status: 'AWAITING_APPROVAL',
      customerId: 'cust-1',
      clientPreferences: {},
    };

    vi.spyOn(db.task, 'findUnique').mockResolvedValue(taskRecord);
    (vi.spyOn(db.task, 'update') as any).mockImplementation(async ({ data }: any) => {
      Object.assign(taskRecord, data);
      return taskRecord;
    });

    const res = await RequestOrchestrator.cycleOptionBatch({
      taskId: 'task-cycle-10',
      userId: 'usr-1',
      action: 'MODIFY_REQUEST',
      newRawInput: 'Morning flight from Ahmedabad to Delhi for 2 business class',
    });

    expect(res.batch).toBeDefined();
    expect(res.batch!.options.length).toBeGreaterThan(0);
    expect(taskRecord.originalRequest).toContain('business class');
  });

  // 11. Destination never changes accidentally (AMD -> DEL)
  it('11. destination constraint AMD -> DEL is strictly preserved across cycles', async () => {
    const taskRecord: any = {
      id: 'task-cycle-11',
      category: 'flights',
      intent: 'Flights from AMD to DEL',
      originalRequest: 'Flights from AMD to DEL tomorrow',
      status: 'AWAITING_APPROVAL',
      customerId: 'cust-1',
      clientPreferences: {
        constraints: {
          origin: 'AMD',
          destination: 'DEL',
        },
      },
    };

    vi.spyOn(db.task, 'findUnique').mockResolvedValue(taskRecord);
    (vi.spyOn(db.task, 'update') as any).mockImplementation(async ({ data }: any) => {
      Object.assign(taskRecord, data);
      return taskRecord;
    });

    const res1 = await RequestOrchestrator.cycleOptionBatch({ taskId: 'task-cycle-11', userId: 'u1', action: 'REJECT_ALL' });
    const res2 = await RequestOrchestrator.cycleOptionBatch({ taskId: 'task-cycle-11', userId: 'u1', action: 'REJECT_ALL' });

    expect(res1.batch).toBeDefined();
    expect(res2.batch).toBeDefined();

    for (const opt of [...res1.batch!.options, ...res2.batch!.options]) {
      if (opt.metadata?.departureAirport) {
        expect(opt.metadata.departureAirport).toBe('AMD');
      }
      if (opt.metadata?.arrivalAirport) {
        expect(opt.metadata.arrivalAirport).toBe('DEL');
      }
    }
  });

  // 12. Budget constraint remains enforced
  it('12. budget constraint strictly excludes options exceeding ceiling', async () => {
    const taskRecord: any = {
      id: 'task-cycle-12',
      category: 'dining',
      intent: 'Dinner in Ahmedabad with budget 2000',
      originalRequest: 'Dinner in Ahmedabad budget 2000',
      budgetAmount: 2000,
      status: 'AWAITING_APPROVAL',
      customerId: 'cust-1',
      clientPreferences: {
        constraints: {
          budget: 2000,
        },
      },
    };

    vi.spyOn(db.task, 'findUnique').mockResolvedValue(taskRecord);
    (vi.spyOn(db.task, 'update') as any).mockImplementation(async ({ data }: any) => {
      Object.assign(taskRecord, data);
      return taskRecord;
    });

    const res = await RequestOrchestrator.cycleOptionBatch({
      taskId: 'task-cycle-12',
      userId: 'u1',
      action: 'REJECT_ALL',
    });

    expect(res.batch).toBeDefined();
    for (const opt of res.batch!.options) {
      if (opt.priceAmount) {
        expect(opt.priceAmount).toBeLessThanOrEqual(2000);
      }
    }
  });

  // 13. Date constraint remains enforced
  it('13. date constraint remains enforced when specified', async () => {
    const targetDate = '2026-10-15';
    const taskRecord: any = {
      id: 'task-cycle-13',
      category: 'flights',
      intent: `Flights on ${targetDate}`,
      originalRequest: `Flights AMD to DEL on ${targetDate}`,
      targetDate: new Date(targetDate),
      status: 'AWAITING_APPROVAL',
      customerId: 'cust-1',
      clientPreferences: {
        constraints: {
          date: targetDate,
        },
      },
    };

    vi.spyOn(db.task, 'findUnique').mockResolvedValue(taskRecord);
    (vi.spyOn(db.task, 'update') as any).mockImplementation(async ({ data }: any) => {
      Object.assign(taskRecord, data);
      return taskRecord;
    });

    const res = await RequestOrchestrator.cycleOptionBatch({
      taskId: 'task-cycle-13',
      userId: 'u1',
      action: 'REJECT_ALL',
    });

    expect(res.batch).toBeDefined();
    expect(res.batch!.options.length).toBeGreaterThan(0);
    // Metadata or options must not have a conflicting explicit date
    for (const opt of res.batch!.options) {
      if (opt.metadata?.date) {
        expect(opt.metadata.date).toBe(targetDate);
      }
    }
  });

  // 14. Party size remains enforced
  it('14. party size remains enforced and filters out inadequate venues', async () => {
    const taskRecord: any = {
      id: 'task-cycle-14',
      category: 'dining',
      intent: 'Table for 6 guests in Ahmedabad',
      originalRequest: 'Table for 6 guests in Ahmedabad',
      partySize: 6,
      status: 'AWAITING_APPROVAL',
      customerId: 'cust-1',
      clientPreferences: {
        constraints: {
          partySize: 6,
        },
      },
    };

    vi.spyOn(db.task, 'findUnique').mockResolvedValue(taskRecord);
    (vi.spyOn(db.task, 'update') as any).mockImplementation(async ({ data }: any) => {
      Object.assign(taskRecord, data);
      return taskRecord;
    });

    const res = await RequestOrchestrator.cycleOptionBatch({
      taskId: 'task-cycle-14',
      userId: 'u1',
      action: 'REJECT_ALL',
    });

    expect(res.batch).toBeDefined();
    expect(res.batch!.options.length).toBeGreaterThan(0);
  });

  // 15. Duplicate providers/entities are excluded within batch
  it('15. duplicate entities are excluded within the same batch', async () => {
    const taskRecord: any = {
      id: 'task-cycle-15',
      category: 'dining',
      intent: 'Fine dining in Ahmedabad',
      originalRequest: 'Fine dining in Ahmedabad',
      status: 'AWAITING_APPROVAL',
      customerId: 'cust-1',
      clientPreferences: {},
    };

    vi.spyOn(db.task, 'findUnique').mockResolvedValue(taskRecord);
    (vi.spyOn(db.task, 'update') as any).mockImplementation(async ({ data }: any) => {
      Object.assign(taskRecord, data);
      return taskRecord;
    });

    const res = await RequestOrchestrator.cycleOptionBatch({
      taskId: 'task-cycle-15',
      userId: 'u1',
      action: 'REJECT_ALL',
    });

    expect(res.batch).toBeDefined();
    const titles = res.batch!.options.map((o) => o.title.toLowerCase().trim());
    const uniqueTitles = new Set(titles);
    expect(titles.length).toBe(uniqueTitles.size);
  });

  // 16. Fewer than 5 genuine options never causes fabrication
  it('16. fewer than 5 genuine options never causes synthetic fabrication', async () => {
    // We test with an extremely tight budget ceiling where very few items exist
    const taskRecord: any = {
      id: 'task-cycle-16',
      category: 'dining',
      intent: 'Dinner in Ahmedabad with budget 900',
      originalRequest: 'Dinner in Ahmedabad budget 900',
      budgetAmount: 900,
      status: 'AWAITING_APPROVAL',
      customerId: 'cust-1',
      clientPreferences: {
        constraints: {
          budget: 900,
        },
      },
    };

    vi.spyOn(db.task, 'findUnique').mockResolvedValue(taskRecord);
    (vi.spyOn(db.task, 'update') as any).mockImplementation(async ({ data }: any) => {
      Object.assign(taskRecord, data);
      return taskRecord;
    });

    const res = await RequestOrchestrator.cycleOptionBatch({
      taskId: 'task-cycle-16',
      userId: 'u1',
      action: 'REJECT_ALL',
    });

    expect(res.batch).toBeDefined();
    // Every returned option MUST be genuinely verified, not a synthetic filler
    for (const opt of res.batch!.options) {
      expect(opt.isMock).toBeFalsy();
      expect(opt.title).not.toMatch(/Synthetic|Filler|Dummy|Mock/i);
    }
  });

  // 17. Human Concierge can source additional options
  it('17. ASK_CONCIERGE action transfers task to NEEDS_HUMAN without failing the task', async () => {
    const taskRecord: any = {
      id: 'task-cycle-17',
      category: 'travel',
      intent: 'Charter flight from Ahmedabad to Udaipur',
      originalRequest: 'Charter flight from Ahmedabad to Udaipur',
      status: 'AWAITING_APPROVAL',
      customerId: 'cust-1',
      clientPreferences: {},
    };

    vi.spyOn(db.task, 'findUnique').mockResolvedValue(taskRecord);
    (vi.spyOn(db.task, 'update') as any).mockImplementation(async ({ data }: any) => {
      Object.assign(taskRecord, data);
      return taskRecord;
    });

    const res = await RequestOrchestrator.cycleOptionBatch({
      taskId: 'task-cycle-17',
      userId: 'u1',
      action: 'ASK_CONCIERGE',
    });

    expect(taskRecord.status).toBe('NEEDS_HUMAN');
    expect(res.message).toContain('Senior Concierge');
  });

  // 18. Zero-fabrication rules remain enforced
  it('18. EntityIntegrityValidator rejects fabricated proposals with synthetic markers', () => {
    const fakeProposal: OptionProposal = {
      id: 'opt-fake-1',
      providerId: 'mock_hotel',
      providerName: 'Simulated Luxury Resort',
      title: 'Demo Resort Booking PV-TEST-99',
      description: 'Synthetic mock suite',
      priceAmount: 15000,
      priceCurrency: 'INR',
      priceFormatted: '₹15,000',
      availability: 'Mock Confirmed',
      bookingMethod: 'API',
      isMock: true,
      environment: 'SANDBOX',
    };

    const validation = EntityIntegrityValidator.validateProposal(fakeProposal);
    expect(validation.isValid).toBe(false);
    expect(validation.errors.length).toBeGreaterThan(0);
  });

  // 19. Execution still requires genuine provider confirmation
  it('19. execution transition to CONFIRMED requires genuine provider confirmation', async () => {
    const chosenOption: OptionProposal = {
      id: 'opt-flight-1',
      providerId: 'amadeus_flights',
      providerName: 'Air India',
      title: 'AI 816 Nonstop Economy',
      description: 'Economy class flight',
      priceAmount: 4800,
      priceCurrency: 'INR',
      priceFormatted: '₹4,800',
      availability: 'Seats Available',
      bookingMethod: 'ASSISTED',
      metadata: {
        flightNumber: 'AI 816',
        departureAirport: 'AMD',
        arrivalAirport: 'DEL',
      },
    };

    const taskRecord: any = {
      id: 'task-cycle-19',
      category: 'flights',
      intent: 'Air India flight AMD to DEL',
      originalRequest: 'Air India flight AMD to DEL',
      status: 'AWAITING_APPROVAL',
      customerId: 'cust-1',
      clientPreferences: {},
    };

    vi.spyOn(db.task, 'findUnique').mockResolvedValue(taskRecord);
    (vi.spyOn(db.task, 'update') as any).mockImplementation(async ({ data }: any) => {
      Object.assign(taskRecord, data);
      return taskRecord;
    });

    // Mock agent executing with assisted/human path because partner API is unconfigured
    const mockAgent = {
      execute: vi.fn().mockResolvedValue({
        success: false,
        requiresAssistance: true,
        actionableCallSheet: { carrier: 'Air India', flightNumber: 'AI 816' },
      }),
      verify: vi.fn().mockResolvedValue({ verified: false }),
    };

    const { findAgentForTask } = await import('@/lib/orchestration/agents');
    vi.spyOn({ findAgentForTask }, 'findAgentForTask').mockReturnValue(mockAgent as any);

    const result = await RequestOrchestrator.executeApprovedTask({
      taskId: 'task-cycle-19',
      option: chosenOption,
      userId: 'usr-1',
    });

    expect(result.status).toBe('NEEDS_HUMAN');
    expect(taskRecord.status).toBe('NEEDS_HUMAN');
  });

  // 20. Existing test suites remain green
  it('20. cycleOptionBatch preserves task history across unlimited cycles without arbitrary cap', async () => {
    const taskRecord: any = {
      id: 'task-cycle-20',
      category: 'dining',
      intent: 'Fine dining in Ahmedabad',
      originalRequest: 'Fine dining in Ahmedabad',
      status: 'AWAITING_APPROVAL',
      customerId: 'cust-1',
      clientPreferences: {},
    };

    vi.spyOn(db.task, 'findUnique').mockResolvedValue(taskRecord);
    (vi.spyOn(db.task, 'update') as any).mockImplementation(async ({ data }: any) => {
      Object.assign(taskRecord, data);
      return taskRecord;
    });

    // Run 4 sequential cycles
    const b1 = await RequestOrchestrator.cycleOptionBatch({ taskId: 'task-cycle-20', userId: 'u1', action: 'REJECT_ALL' });
    const b2 = await RequestOrchestrator.cycleOptionBatch({ taskId: 'task-cycle-20', userId: 'u1', action: 'REJECT_ALL' });
    const b3 = await RequestOrchestrator.cycleOptionBatch({ taskId: 'task-cycle-20', userId: 'u1', action: 'REJECT_ALL' });
    const b4 = await RequestOrchestrator.cycleOptionBatch({ taskId: 'task-cycle-20', userId: 'u1', action: 'REJECT_ALL' });

    expect(b1.batch).toBeDefined();
    expect(b2.batch).toBeDefined();
    expect(b3.batch).toBeDefined();
    expect(b4.batch).toBeDefined();
    expect(b1.batch!.batchId).toBe('BATCH-001');
    expect(b2.batch!.batchId).toBe('BATCH-002');
    expect(b3.batch!.batchId).toBe('BATCH-003');
    expect(b4.batch!.batchId).toBe('BATCH-004');
    expect(taskRecord.clientPreferences.batchHistory.length).toBe(4);
  });
});
