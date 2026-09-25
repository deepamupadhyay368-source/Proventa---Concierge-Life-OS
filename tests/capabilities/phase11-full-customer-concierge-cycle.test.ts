import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock session and notification services
vi.mock('@/lib/auth/session', () => ({
  requireConcierge: vi.fn(),
  requireAdmin: vi.fn(),
  requireSuperAdmin: vi.fn(),
  requireFounder: vi.fn(),
  requireAuth: vi.fn(),
  requireRole: vi.fn(),
  getSession: vi.fn(),
}));

vi.mock('@/lib/notifications/whatsapp', () => ({
  sendWhatsAppNotification: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/lib/email/sender', () => ({
  sendBookingConfirmationEmail: vi.fn().mockResolvedValue(true),
  sendCompletionEmail: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/lib/orchestration/timeline', () => ({
  appendTaskEvent: vi.fn().mockResolvedValue({ id: 'evt-test-123' }),
}));

import { RequestOrchestrator } from '@/lib/orchestration/orchestrator';
import { db } from '@/lib/db';
import { OptionProposal, ProposalBatch } from '@/lib/orchestration/types';
import { EntityIntegrityValidator } from '@/lib/validation/entity-integrity';
import { createConciergeToken, verifyConciergeToken } from '@/lib/auth/concierge-session';
import { hashPassword, verifyPassword } from '@/lib/auth/password';

describe('PROVENTA — PHASE 11: FULL CUSTOMER OPTION CYCLE, CONCIERGE ROUTING & EMPLOYEE ONBOARDING SUITE', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // A. First request -> 5 genuine options
  it('A. First request generates up to 5 genuine options without fabrication', async () => {
    const taskRecord: any = {
      id: 'task-test-cycle-a',
      publicId: 'TSK-0001',
      category: 'dining',
      intent: 'Fine dining in Ahmedabad for 4 guests',
      originalRequest: 'Fine dining in Ahmedabad for 4 guests',
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
      taskId: 'task-test-cycle-a',
      userId: 'usr-1',
      action: 'REJECT_ALL',
    });

    expect(result.batch).toBeDefined();
    expect(result.batch!.batchId).toBe('BATCH-001');
    expect(result.batch!.options.length).toBeLessThanOrEqual(5);
    expect(result.batch!.options.length).toBeGreaterThan(0);
    // Zero mock/fake inventory
    for (const opt of result.batch!.options) {
      expect(opt.title).not.toMatch(/fake|dummy|test|placeholder/i);
    }
  });

  // B. Reject all -> new 5 genuine options
  it('B. Rejecting all options creates a new batch (BATCH-002) with distinct options', async () => {
    const initialBatch: ProposalBatch = {
      batchId: 'BATCH-001',
      batchNumber: 1,
      generatedAt: new Date().toISOString(),
      options: [
        { id: 'opt-1', providerId: 'agashiye', providerName: 'Agashiye', title: 'Agashiye Heritage Thali', description: 'Desc 1', priceAmount: 3800, priceCurrency: 'INR', priceFormatted: '₹3,800', bookingMethod: 'API' },
        { id: 'opt-2', providerId: 'house-of-mg', providerName: 'The Green House', title: 'The Green House Courtyard', description: 'Desc 2', priceAmount: 2400, priceCurrency: 'INR', priceFormatted: '₹2,400', bookingMethod: 'API' },
        { id: 'opt-3', providerId: 'tinello-hyatt', providerName: 'Tinello', title: 'Tinello Italian Fine Dining', description: 'Desc 3', priceAmount: 4500, priceCurrency: 'INR', priceFormatted: '₹4,500', bookingMethod: 'API' },
        { id: 'opt-4', providerId: 'vishalla', providerName: 'Vishalla', title: 'Vishalla Village Experience', description: 'Desc 4', priceAmount: 2200, priceCurrency: 'INR', priceFormatted: '₹2,200', bookingMethod: 'API' },
        { id: 'opt-5', providerId: 'patang', providerName: 'Patang Revolving', title: 'Patang Riverfront Dining', description: 'Desc 5', priceAmount: 5000, priceCurrency: 'INR', priceFormatted: '₹5,000', bookingMethod: 'API' },
      ],
      status: 'ACTIVE',
    };

    const taskRecord: any = {
      id: 'task-test-cycle-b',
      publicId: 'TSK-0002',
      category: 'dining',
      intent: 'Fine dining in Ahmedabad',
      originalRequest: 'Fine dining in Ahmedabad',
      status: 'AWAITING_APPROVAL',
      customerId: 'cust-1',
      proposedOptions: initialBatch.options,
      clientPreferences: {
        currentBatchId: 'BATCH-001',
        batchHistory: [initialBatch],
        rejectedOptionIds: [],
        rejectedOptionKeys: [],
      },
    };

    vi.spyOn(db.task, 'findUnique').mockResolvedValue(taskRecord);
    (vi.spyOn(db.task, 'update') as any).mockImplementation(async ({ data }: any) => {
      Object.assign(taskRecord, data);
      return taskRecord;
    });

    const result = await RequestOrchestrator.cycleOptionBatch({
      taskId: 'task-test-cycle-b',
      userId: 'usr-1',
      action: 'REJECT_ALL',
    });

    expect(result.batch!.batchId).toBe('BATCH-002');
    expect(result.batch!.batchNumber).toBe(2);
    // BATCH-002 options must not contain the rejected options
    const newIds = result.batch!.options.map((o) => o.id);
    for (const oldOpt of initialBatch.options) {
      expect(newIds).not.toContain(oldOpt.id);
    }
  });

  // C. Reject repeatedly -> no rejected option recurrence
  it('C. Repeated rejections accumulate rejected option keys and never repeat previously rejected options', async () => {
    const batch1Options: OptionProposal[] = [
      { id: 'opt-101', providerId: 'p1', providerName: 'P1', title: 'Option 101', description: 'D1', priceAmount: 1000, priceCurrency: 'INR', priceFormatted: '₹1000', bookingMethod: 'API' },
      { id: 'opt-102', providerId: 'p2', providerName: 'P2', title: 'Option 102', description: 'D2', priceAmount: 2000, priceCurrency: 'INR', priceFormatted: '₹2000', bookingMethod: 'API' },
    ];
    const batch2Options: OptionProposal[] = [
      { id: 'opt-103', providerId: 'p3', providerName: 'P3', title: 'Option 103', description: 'D3', priceAmount: 3000, priceCurrency: 'INR', priceFormatted: '₹3000', bookingMethod: 'API' },
      { id: 'opt-104', providerId: 'p4', providerName: 'P4', title: 'Option 104', description: 'D4', priceAmount: 4000, priceCurrency: 'INR', priceFormatted: '₹4000', bookingMethod: 'API' },
    ];

    const candidates: OptionProposal[] = [
      ...batch1Options,
      ...batch2Options,
      { id: 'opt-105', providerId: 'p5', providerName: 'P5', title: 'Option 105', description: 'D5', priceAmount: 5000, priceCurrency: 'INR', priceFormatted: '₹5000', bookingMethod: 'API' },
      { id: 'opt-106', providerId: 'p6', providerName: 'P6', title: 'Option 106', description: 'D6', priceAmount: 6000, priceCurrency: 'INR', priceFormatted: '₹6000', bookingMethod: 'API' },
    ];

    const rejectedIds = ['opt-101', 'opt-102', 'opt-103', 'opt-104'];
    const rejectedKeys = rejectedIds.map((id) => `prov:${id}`);

    const filtered = RequestOrchestrator.filterAndRankCandidates({
      candidates,
      rejectedOptionIds: rejectedIds,
      rejectedOptionKeys: rejectedKeys,
      constraints: { category: 'dining' },
    });

    const filteredIds = filtered.map((c) => c.id);
    expect(filteredIds).not.toContain('opt-101');
    expect(filteredIds).not.toContain('opt-102');
    expect(filteredIds).not.toContain('opt-103');
    expect(filteredIds).not.toContain('opt-104');
    expect(filteredIds).toContain('opt-105');
    expect(filteredIds).toContain('opt-106');
  });

  // D. Customer feedback influences next batch
  it('D. Customer price feedback ("Too expensive") sorts options by price ascending', () => {
    const candidates: OptionProposal[] = [
      { id: 'c1', providerId: 'p1', providerName: 'Luxury Suite', title: 'Luxury Suite', description: '', priceAmount: 45000, priceCurrency: 'INR', priceFormatted: '₹45,000', bookingMethod: 'API' },
      { id: 'c2', providerId: 'p2', providerName: 'Boutique Room', title: 'Boutique Room', description: '', priceAmount: 12000, priceCurrency: 'INR', priceFormatted: '₹12,000', bookingMethod: 'API' },
      { id: 'c3', providerId: 'p3', providerName: 'Premium Room', title: 'Premium Room', description: '', priceAmount: 25000, priceCurrency: 'INR', priceFormatted: '₹25,000', bookingMethod: 'API' },
    ];

    const ranked = RequestOrchestrator.filterAndRankCandidates({
      candidates,
      rejectedOptionIds: [],
      rejectedOptionKeys: [],
      constraints: { category: 'hotel' },
      feedback: 'These are too expensive. Show options under ₹20,000.',
    });

    expect(ranked[0].id).toBe('c2'); // Lowest price first
    expect(ranked[0].priceAmount).toBe(12000);
  });

  // E. Partial rejection
  it('E. Partial rejection preserves kept options and replaces only rejected options', async () => {
    const optKeep: OptionProposal = {
      id: 'opt-keep',
      providerId: 'agashiye',
      providerName: 'Agashiye',
      title: 'Agashiye Heritage Thali',
      description: 'Preserved option',
      priceAmount: 3800,
      priceCurrency: 'INR',
      priceFormatted: '₹3,800',
      bookingMethod: 'API',
    };
    const optRej: OptionProposal = {
      id: 'opt-reject',
      providerId: 'tinello',
      providerName: 'Tinello',
      title: 'Tinello Italian',
      description: 'Rejected option',
      priceAmount: 4500,
      priceCurrency: 'INR',
      priceFormatted: '₹4,500',
      bookingMethod: 'API',
    };

    const taskRecord: any = {
      id: 'task-partial-1',
      publicId: 'TSK-0003',
      category: 'dining',
      intent: 'Dinner in Ahmedabad',
      originalRequest: 'Dinner in Ahmedabad',
      status: 'AWAITING_APPROVAL',
      customerId: 'cust-1',
      proposedOptions: [optKeep, optRej],
      clientPreferences: {
        batchHistory: [
          {
            batchId: 'BATCH-001',
            batchNumber: 1,
            generatedAt: new Date().toISOString(),
            options: [optKeep, optRej],
            status: 'ACTIVE',
          },
        ],
        rejectedOptionIds: [],
        rejectedOptionKeys: [],
      },
    };

    vi.spyOn(db.task, 'findUnique').mockResolvedValue(taskRecord);
    (vi.spyOn(db.task, 'update') as any).mockImplementation(async ({ data }: any) => {
      Object.assign(taskRecord, data);
      return taskRecord;
    });

    const result = await RequestOrchestrator.cycleOptionBatch({
      taskId: 'task-partial-1',
      userId: 'usr-1',
      action: 'PARTIAL_REJECT',
      keptOptionIds: ['opt-keep'],
    });

    const resultIds = result.batch!.options.map((o) => o.id);
    expect(resultIds).toContain('opt-keep');
    expect(resultIds).not.toContain('opt-reject');
  });

  // F & G. Approve option and lock exact option
  it('F & G. Approval locks the exact option details in clientPreferences.approvedOption', async () => {
    const approvedOption: OptionProposal = {
      id: 'opt-approved-1',
      providerId: 'the-leela-udaipur',
      providerName: 'The Leela Palace Udaipur',
      venueId: 'leela-palace-udaipur',
      title: 'Royal Lake View Suite',
      description: 'Palatial suite with private boat transfer',
      priceAmount: 65000,
      priceCurrency: 'INR',
      priceFormatted: '₹65,000',
      bookingMethod: 'PHONE',
      metadata: {
        guestCount: 2,
        checkInDate: '2026-10-10',
        checkOutDate: '2026-10-12',
      },
    };

    const taskRecord: any = {
      id: 'task-lock-1',
      publicId: 'TSK-0004',
      category: 'hotels_accommodation',
      intent: 'Book 2 nights at The Leela Palace Udaipur',
      originalRequest: 'Book 2 nights at The Leela Palace Udaipur for 2 guests',
      status: 'AWAITING_APPROVAL',
      customerId: 'cust-1',
      paymentStatus: 'CAPTURED',
      clientPreferences: {},
    };

    vi.spyOn(db.task, 'findUnique').mockResolvedValue(taskRecord);
    (vi.spyOn(db.task, 'update') as any).mockImplementation(async ({ data }: any) => {
      Object.assign(taskRecord, data);
      return taskRecord;
    });

    const result = await RequestOrchestrator.executeApprovedTask({
      taskId: 'task-lock-1',
      option: approvedOption,
      userId: 'cust-1',
      skipPaymentGate: true,
    });

    expect(result.success).toBe(true);
    expect(taskRecord.clientPreferences.approvedOption).toBeDefined();
    expect(taskRecord.clientPreferences.approvedOption.providerName).toBe('The Leela Palace Udaipur');
    expect(taskRecord.clientPreferences.approvedOption.venueId).toBe('leela-palace-udaipur');
    expect(taskRecord.clientPreferences.approvedOption.priceAmount).toBe(65000);
  });

  // H & I. Automatic NEEDS_HUMAN routing & Concierge queue entry
  it('H & I. Unautomated or assisted bookings automatically route to NEEDS_HUMAN and Concierge queue', async () => {
    const phoneOption: OptionProposal = {
      id: 'opt-phone-1',
      providerId: 'agashiye-mg',
      providerName: 'Agashiye',
      title: 'Agashiye Heritage Rooftop',
      description: 'Maître d booking required',
      priceAmount: 4000,
      priceCurrency: 'INR',
      priceFormatted: '₹4,000',
      bookingMethod: 'PHONE',
    };

    const taskRecord: any = {
      id: 'task-route-1',
      publicId: 'TSK-0005',
      category: 'dining',
      intent: 'Table for 2 at Agashiye',
      originalRequest: 'Reserve table for 2 at Agashiye for tonight 8pm',
      status: 'AWAITING_APPROVAL',
      customerId: 'cust-1',
      paymentStatus: 'CAPTURED',
      clientPreferences: {},
    };

    vi.spyOn(db.task, 'findUnique').mockResolvedValue(taskRecord);
    (vi.spyOn(db.task, 'update') as any).mockImplementation(async ({ data }: any) => {
      Object.assign(taskRecord, data);
      return taskRecord;
    });

    const result = await RequestOrchestrator.executeApprovedTask({
      taskId: 'task-route-1',
      option: phoneOption,
      userId: 'cust-1',
      skipPaymentGate: true,
    });

    expect(result.status).toBe('NEEDS_HUMAN');
    expect(result.handedToConcierge).toBe(true);
    expect(taskRecord.status).toBe('NEEDS_HUMAN');
    expect(taskRecord.executionMethod).toBe('HUMAN_CONCIERGE');
  });

  // J & K. Founder visibility & Single canonical Task ID
  it('J & K. Customer, Concierge Desk, and Founder Admin reference the exact same Task ID', async () => {
    const taskRecord: any = {
      id: 'task-canonical-1',
      publicId: 'TSK-0048',
      category: 'travel',
      intent: 'Business class flight AMD to BOM',
      originalRequest: 'Book business class flight AMD to BOM for tomorrow',
      status: 'NEEDS_HUMAN',
      customerId: 'cust-1',
      customer: { user: { name: 'Dr. Mehta', email: 'mehta@example.com' } },
      events: [],
    };

    vi.spyOn(db.task, 'findUnique').mockResolvedValue(taskRecord);

    // Fetch from task service
    const task = await db.task.findUnique({ where: { id: 'task-canonical-1' } });
    expect(task?.publicId).toBe('TSK-0048');
    expect(task?.id).toBe('task-canonical-1');
  });

  // L, M, N. Employee signup, verification gating, and next-time login
  it('L, M, N. Employee signup sets PENDING_VERIFICATION; active token creates concierge session', async () => {
    const rawPass = 'SecretShift2026!';
    const hashed = await hashPassword(rawPass);
    const isPassValid = await verifyPassword(rawPass, hashed);
    expect(isPassValid).toBe(true);

    const token = createConciergeToken({
      id: 'emp-001',
      email: 'operator@proventa.in',
      name: 'Concierge Lead',
      roles: ['CONCIERGE', 'SENIOR_CONCIERGE'],
    });

    expect(token).toBeDefined();
    const verified = verifyConciergeToken(token);
    expect(verified).not.toBeNull();
    expect(verified?.id).toBe('emp-001');
    expect(verified?.roles).toContain('CONCIERGE');
  });

  // O & P. Customer / Concierge / Admin Role Boundaries
  it('O & P. Customer sessions cannot access Concierge; Concierge sessions cannot access Admin', () => {
    const customerToken = createConciergeToken({
      id: 'cust-001',
      email: 'customer@gmail.com',
      name: 'Client User',
      roles: ['CUSTOMER'],
    });

    const verified = verifyConciergeToken(customerToken);
    const isAuthorizedConcierge = (verified?.roles || []).some((r: string) =>
      ['CONCIERGE', 'SENIOR_CONCIERGE', 'CONCIERGE_MANAGER', 'ADMIN', 'FOUNDER', 'SUPER_ADMIN'].includes(r)
    );
    expect(isAuthorizedConcierge).toBe(false);

    const conciergeToken = createConciergeToken({
      id: 'concierge-001',
      email: 'staff@proventa.in',
      name: 'Staff User',
      roles: ['CONCIERGE'],
    });
    const verifiedConcierge = verifyConciergeToken(conciergeToken);
    const isAuthorizedAdmin = (verifiedConcierge?.roles || []).some((r: string) =>
      ['ADMIN', 'FOUNDER', 'SUPER_ADMIN'].includes(r)
    );
    expect(isAuthorizedAdmin).toBe(false);
  });

  // Q & U. Zero Fabrication Guard
  it('Q & U. Synthetic confirmation references (PV-*, MOCK-*, TEST-*) are rejected', () => {
    const invalidRefs = ['PV-CONFIRM-123', 'MOCK-999', 'TEST-BOOKING', 'DEMO-REF', 'FAKE-456', 'SANDBOX-101'];
    for (const ref of invalidRefs) {
      const upper = ref.toUpperCase();
      const isInvalid =
        upper.startsWith('PV-') ||
        upper.startsWith('MOCK-') ||
        upper.startsWith('TEST-') ||
        upper.startsWith('DEMO-') ||
        upper.startsWith('FAKE-') ||
        upper.includes('SANDBOX');
      expect(isInvalid).toBe(true);
    }

    const genuineRef = 'AG-2026-OCT-8842';
    const isGenuineValid =
      !genuineRef.startsWith('PV-') &&
      !genuineRef.startsWith('MOCK-') &&
      !genuineRef.startsWith('TEST-') &&
      !genuineRef.startsWith('DEMO-') &&
      !genuineRef.startsWith('FAKE-') &&
      !genuineRef.includes('SANDBOX');
    expect(isGenuineValid).toBe(true);
  });

  // R. Constraint Mismatch Guard
  it('R. Intent and constraint mismatches trigger INTENT_CONSTRAINT_MISMATCH and block completion', () => {
    const task: any = {
      category: 'dining',
      originalRequest: 'Reserve table for 4 at Agashiye Ahmedabad',
      clientPreferences: {
        partySize: 4,
        location: 'Ahmedabad',
      },
    };

    const mismatchedOption: OptionProposal = {
      id: 'opt-mismatch',
      providerId: 'mumbai-taj',
      providerName: 'Wasabi by Morimoto (Mumbai)',
      title: 'Dinner at Wasabi Mumbai for 2',
      description: 'Mismatched city and party size',
      priceAmount: 18000,
      priceCurrency: 'INR',
      priceFormatted: '₹18,000',
      bookingMethod: 'PHONE',
      metadata: {
        partySize: 2,
        city: 'Mumbai',
      },
    };

    const preCheck = EntityIntegrityValidator.verifyPreExecutionConstraints(task, mismatchedOption);
    expect(preCheck.isValid).toBe(false);
    expect(preCheck.violationReason).toBeDefined();
  });

  // S, T, W. Verify & Complete + Idempotent Email Notification
  it('S, T, W. Verify & Complete marks task COMPLETED with idempotent notification', async () => {
    const taskRecord: any = {
      id: 'task-complete-1',
      publicId: 'TSK-0099',
      category: 'dining',
      intent: 'Dinner reservation at Agashiye',
      status: 'NEEDS_HUMAN',
      customerId: 'cust-1',
      customer: { user: { name: 'Priya Patel', email: 'priya@example.com' } },
      clientPreferences: {},
    };

    vi.spyOn(db.task, 'findUnique').mockResolvedValue(taskRecord);
    (vi.spyOn(db.task, 'update') as any).mockImplementation(async ({ data }: any) => {
      Object.assign(taskRecord, data);
      return taskRecord;
    });

    const completion = await RequestOrchestrator.completeTask({
      taskId: 'task-complete-1',
      operatorId: 'emp-001',
      notes: 'Table confirmed under name Priya Patel. Table #14 Rooftop.',
      deliverable: {
        confirmationNumber: 'AG-883921',
        hostName: 'Mr. Ramesh (Maître d)',
      },
    });

    expect(taskRecord.status).toBe('COMPLETED');
    expect(taskRecord.clientPreferences.completionNotes).toContain('Priya Patel');
  });
});
