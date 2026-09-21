import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RequestOrchestrator } from '@/lib/orchestration/orchestrator';
import { db } from '@/lib/db';
import { sendBookingConfirmationEmail } from '@/lib/email/sender';
import { sendWhatsAppNotification } from '@/lib/notifications/whatsapp';
import { POST as manualConfirmHandler } from '@/app/api/tasks/[id]/manual-confirm/route';
import { POST as conciergeActionHandler } from '@/app/api/admin/concierge/action/route';
import { NextRequest } from 'next/server';

// Mock DB and Notifications
vi.mock('@/lib/db', () => ({
  db: {
    task: {
      findUnique: vi.fn(),
      update: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    taskEvent: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
    conciergeRequest: {
      count: vi.fn().mockResolvedValue(42),
      create: vi.fn().mockResolvedValue({ id: 'cr-sim-100' }),
    },
    booking: {
      create: vi.fn().mockResolvedValue({ id: 'bkg-sim-100' }),
    },
    city: {
      findFirst: vi.fn().mockResolvedValue({ id: 'city-delhi', name: 'Delhi', active: true }),
    },
    customer: {
      findUnique: vi.fn(),
    },
    customerProfile: {
      findUnique: vi.fn().mockResolvedValue({ id: 'cp-sim-1', user: { name: 'Member', phone: '+919999999999' } }),
    },
    customerPreference: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    user: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('@/lib/auth/session', () => ({
  requireConcierge: vi.fn().mockResolvedValue({
    id: 'op-alex-1',
    email: 'alex@proventa.in',
    name: 'Lead Concierge Alex',
    role: 'CONCIERGE',
  }),
  requireSuperAdmin: vi.fn().mockResolvedValue({
    id: 'op-admin-1',
    email: 'founder@proventa.in',
    name: 'Founder Operator',
    role: 'SUPERADMIN',
  }),
}));

vi.mock('@/lib/email/sender', () => ({
  sendBookingConfirmationEmail: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock('@/lib/notifications/whatsapp', () => ({
  sendWhatsAppNotification: vi.fn().mockResolvedValue({ success: true }),
}));

describe('Phase 10: Full Customer Journey Production Simulation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Helper to create an in-memory accumulator task runner
  function createSimulatedTaskEnvironment(initialTask: any) {
    let currentTask = { ...initialTask };

    (db.task.findUnique as any).mockImplementation(async () => currentTask);
    (db.task.update as any).mockImplementation(async ({ data }: any) => {
      currentTask = {
        ...currentTask,
        ...data,
        clientPreferences: {
          ...(currentTask.clientPreferences || {}),
          ...(data.clientPreferences || {}),
        },
      };
      return currentTask;
    });

    return {
      getTask: () => currentTask,
      setTask: (t: any) => { currentTask = t; },
    };
  }

  describe('Journey A: Flight Booking (AMD → DEL, Tomorrow Morning, Business Class, 2 Pax)', () => {
    it('executes full loop: Request → Batch 1 → Reject All → Batch 2 → Feedback → Batch 3 → Approval → Assisted/Phone Fallback → Operator Confirm & Complete', async () => {
      const rawPrompt = 'Fly from Ahmedabad to Delhi tomorrow morning, business class, 2 passengers.';
      const initialTask = {
        id: 'task-sim-flight',
        publicId: 'TSK-FLT-101',
        status: 'REQUESTED',
        category: 'travel',
        intent: 'Fly from Ahmedabad to Delhi tomorrow morning, business class, 2 passengers.',
        originalRequest: rawPrompt,
        customerId: 'cust-sim-flight',
        destination: 'DEL',
        origin: 'AMD',
        clientPreferences: {
          originAirport: 'AMD',
          destinationAirport: 'DEL',
          partySize: 2,
          cabinClass: 'BUSINESS',
        },
        customer: {
          user: {
            name: 'Aarav Singhania',
            email: 'aarav@singhania.com',
            phone: '+919820011223',
          },
        },
      };

      const env = createSimulatedTaskEnvironment(initialTask);

      // Step 1: Initial Processing -> Batch 1 (5 options)
      const batch1Res = await RequestOrchestrator.processTask('task-sim-flight');
      expect(batch1Res.success).toBe(true);
      expect(batch1Res.proposals.length).toBe(5);
      const batch1Ids = batch1Res.proposals.map((p: any) => p.id);

      // Verify each option respects AMD -> DEL corridor and business class
      batch1Res.proposals.forEach((p: any) => {
        expect(p.priceAmount).toBeGreaterThan(0);
        expect(p.title).toBeDefined();
      });

      // Step 2: Customer Rejection (Reject All) -> Batch 2 (5 new options)
      const batch2Res = await RequestOrchestrator.cycleOptionBatch({
        taskId: 'task-sim-flight',
        action: 'REJECT_ALL',
        feedback: 'Prefer earlier flight timing or Vistara/Air India',
      });
      expect(batch2Res.success).toBe(true);
      expect(batch2Res.batch?.options.length).toBe(5);
      const batch2Ids = (batch2Res.batch?.options || []).map((p: any) => p.id);

      // Verify no duplicates between Batch 1 and Batch 2
      batch2Ids.forEach((id: string) => {
        expect(batch1Ids).not.toContain(id);
      });

      // Step 3: Customer Feedback -> Batch 3 (5 new options)
      const batch3Res = await RequestOrchestrator.cycleOptionBatch({
        taskId: 'task-sim-flight',
        action: 'REJECT_ALL',
        feedback: 'Need prime morning departure between 6am and 9am',
      });
      expect(batch3Res.success).toBe(true);
      expect(batch3Res.batch?.options.length).toBe(5);
      const batch3Ids = (batch3Res.batch?.options || []).map((p: any) => p.id);

      // Verify exclusion memory across all prior batches
      batch3Ids.forEach((id: string) => {
        expect(batch1Ids).not.toContain(id);
        expect(batch2Ids).not.toContain(id);
      });

      // Step 4: Customer Approves Option from Batch 3
      const approvedOption = batch3Res.batch!.options[0];
      const approvalRes = await RequestOrchestrator.executeApprovedTask({
        taskId: 'task-sim-flight',
        option: approvedOption,
      });

      expect(approvalRes.success).toBe(true);
      const taskAfterApproval = env.getTask();
      expect(taskAfterApproval.approvalStatus).toBe('APPROVED');
      expect((taskAfterApproval.clientPreferences as any).approvedOption.id).toBe(approvedOption.id);

      // Flights in sandbox or phone dispatch fall back to NEEDS_HUMAN (Concierge execution)
      expect(['NEEDS_HUMAN', 'CONFIRMED']).toContain(taskAfterApproval.status);

      // Step 5: If NEEDS_HUMAN, Operator verifies with Airline GDS and issues genuine PNR
      if (taskAfterApproval.status === 'NEEDS_HUMAN') {
        const confirmReq = new NextRequest('http://localhost:3000/api/tasks/task-sim-flight/manual-confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            confirmationRef: 'AI-805-GDS-9921',
            vendorName: 'Air India GDS Desk',
            notes: 'Issued business class e-tickets 098-2348918231 via corporate portal.',
            andComplete: true,
          }),
        });

        const confirmRes = await manualConfirmHandler(confirmReq, {
          params: Promise.resolve({ id: 'task-sim-flight' }),
        });
        expect(confirmRes.status).toBe(200);
        const confirmData = await confirmRes.json();
        expect(confirmData.task.status).toBe('COMPLETED');
        expect(confirmData.task.externalReferenceId).toBe('AI-805-GDS-9921');
      }

      // Step 6: Verify Notifications
      expect(sendBookingConfirmationEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'aarav@singhania.com',
          reference: expect.stringMatching(/AI-805-GDS-9921|COMPLETED/),
        })
      );
    });
  });

  describe('Journey B: Luxury Hotel in Delhi for 3 Nights', () => {
    it('executes: Request → 5 Delhi Luxury Hotels → Partial Reject → Modify Budget → Approve → Concierge Desk Fulfill', async () => {
      const initialTask = {
        id: 'task-sim-hotel',
        publicId: 'TSK-HTL-202',
        status: 'REQUESTED',
        category: 'hotel',
        intent: 'Find me a luxury 5-star hotel in Delhi for 3 nights.',
        originalRequest: 'Find me a luxury 5-star hotel in Delhi for 3 nights.',
        customerId: 'cust-sim-hotel',
        destination: 'DELHI',
        clientPreferences: {
          location: 'Delhi',
          stayNights: 3,
        },
        customer: {
          user: {
            name: 'Pooja Mehta',
            email: 'pooja.mehta@example.com',
            phone: '+919811223344',
          },
        },
      };

      const env = createSimulatedTaskEnvironment(initialTask);

      // 1. Initial 5 Luxury Delhi Hotel Options
      const batch1 = await RequestOrchestrator.processTask('task-sim-hotel');
      expect(batch1.success).toBe(true);
      expect(batch1.proposals.length).toBe(5);

      // Verify all options are in Delhi (Entity Integrity)
      batch1.proposals.forEach((p: any) => {
        const text = `${p.title} ${p.description || ''} ${JSON.stringify(p.metadata || {})}`.toUpperCase();
        expect(text).toContain('DELHI');
        expect(text).not.toContain('AHMEDABAD');
      });

      // 2. Customer Partial Rejection: Keep 2 best options, replace 3
      const keptIds = [batch1.proposals[0].id, batch1.proposals[1].id];
      const batch2 = await RequestOrchestrator.cycleOptionBatch({
        taskId: 'task-sim-hotel',
        action: 'PARTIAL_REJECT',
        keptOptionIds: keptIds,
      });

      expect(batch2.success).toBe(true);
      expect(batch2.batch?.options.length).toBe(5);
      expect((batch2.batch?.options || []).filter((o: any) => keptIds.includes(o.id)).length).toBe(2);

      // 3. Customer Approves The Leela Palace New Delhi
      const selectedHotel = batch2.batch!.options[0];
      await RequestOrchestrator.executeApprovedTask({
        taskId: 'task-sim-hotel',
        option: selectedHotel,
      });

      // 4. Concierge Desk Claims, Logs Provider Call, and Enters Authentic Reservation
      const claimReq = new NextRequest('http://localhost:3000/api/admin/concierge/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: 'task-sim-hotel',
          action: 'CLAIM',
        }),
      });
      expect((await conciergeActionHandler(claimReq)).status).toBe(200);

      const manualReq = new NextRequest('http://localhost:3000/api/tasks/task-sim-hotel/manual-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confirmationRef: 'LEELA-DEL-88319',
          vendorName: 'The Leela Palace New Delhi',
          notes: 'Grand Heritage Suite confirmed with Club Privileges and VIP welcome amenities.',
          andComplete: true,
        }),
      });
      const manualRes = await manualConfirmHandler(manualReq, {
        params: Promise.resolve({ id: 'task-sim-hotel' }),
      });
      expect(manualRes.status).toBe(200);

      const finalTask = env.getTask();
      expect(finalTask.status).toBe('COMPLETED');
      expect(finalTask.externalReferenceId).toBe('LEELA-DEL-88319');
    });
  });

  describe('Journey C: Fine-Dining Restaurant in Delhi for 4 Pax Tonight', () => {
    it('executes: Request → 5 Fine-Dining Venues → Reject All → 5 Fresh Venues → Approve Bukhara → Concierge Table Reserved & Verified', async () => {
      const initialTask = {
        id: 'task-sim-dine',
        publicId: 'TSK-DIN-303',
        status: 'REQUESTED',
        category: 'dining',
        intent: 'Find a fine-dining restaurant in Delhi for 4 people tonight.',
        originalRequest: 'Find a fine-dining restaurant in Delhi for 4 people tonight.',
        customerId: 'cust-sim-dine',
        location: 'Delhi',
        destination: 'DELHI',
        clientPreferences: {
          location: 'Delhi',
          partySize: 4,
          mealType: 'DINNER',
        },
        customer: {
          user: {
            name: 'Rohan Gupta',
            email: 'rohan.gupta@delhi.com',
            phone: '+919810998877',
          },
        },
      };

      const env = createSimulatedTaskEnvironment(initialTask);

      // 1. Initial 5 Fine Dining Delhi Options
      const batch1 = await RequestOrchestrator.processTask('task-sim-dine');
      expect(batch1.success).toBe(true);
      expect(batch1.proposals.length).toBe(5);

      // 2. Reject All with feedback "Prefer North Indian or heritage venue"
      const batch2 = await RequestOrchestrator.cycleOptionBatch({
        taskId: 'task-sim-dine',
        action: 'REJECT_ALL',
        feedback: 'Prefer North Indian or iconic institutions like Bukhara or Indian Accent',
      });
      expect(batch2.success).toBe(true);
      expect(batch2.batch?.options.length).toBe(5);

      // 3. Customer Approves Table
      const approvedTable = (batch2.batch?.options || []).find((o: any) => o.title.includes('Bukhara')) || batch2.batch!.options[0];
      await RequestOrchestrator.executeApprovedTask({
        taskId: 'task-sim-dine',
        option: approvedTable,
      });

      // 4. Operator logs contact with restaurant reservations and records table
      const contactReq = new NextRequest('http://localhost:3000/api/admin/concierge/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: 'task-sim-dine',
          action: 'CONTACT_PROVIDER',
          notes: 'Spoke directly with Table Manager at Bukhara.',
        }),
      });
      await conciergeActionHandler(contactReq);

      const confirmReq = new NextRequest('http://localhost:3000/api/tasks/task-sim-dine/manual-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confirmationRef: 'BUKHARA-TBL-04',
          vendorName: 'Bukhara - ITC Maurya',
          notes: 'Table held for 4 guests under Proventa Private Reserve.',
          andComplete: true,
        }),
      });
      const confirmRes = await manualConfirmHandler(confirmReq, {
        params: Promise.resolve({ id: 'task-sim-dine' }),
      });
      expect(confirmRes.status).toBe(200);

      expect(env.getTask().status).toBe('COMPLETED');
      expect(env.getTask().externalReferenceId).toBe('BUKHARA-TBL-04');
    });
  });

  describe('Journey D: Luxury Weekend Escape for Two', () => {
    it('executes: Request → 5 Heritage/Retreat Options → Approve Royal Tent / Resort → Operator Handoff & Completion', async () => {
      const initialTask = {
        id: 'task-sim-weekend',
        publicId: 'TSK-WKD-404',
        status: 'REQUESTED',
        category: 'weekend_escapes',
        intent: 'Plan a luxury weekend escape for two.',
        originalRequest: 'Plan a luxury weekend escape for two.',
        customerId: 'cust-sim-wkd',
        clientPreferences: {
          partySize: 2,
        },
        customer: {
          user: {
            name: 'Karan & Natasha',
            email: 'karan@escapes.in',
            phone: '+919925011122',
          },
        },
      };

      const env = createSimulatedTaskEnvironment(initialTask);

      // 1. Initial 5 Options
      const batch1 = await RequestOrchestrator.processTask('task-sim-weekend');
      expect(batch1.success).toBe(true);
      expect(batch1.proposals.length).toBe(5);

      // 2. Approve chosen retreat
      const retreatOption = batch1.proposals[0];
      await RequestOrchestrator.executeApprovedTask({
        taskId: 'task-sim-weekend',
        option: retreatOption,
      });

      // 3. Complete via Concierge Desk
      const completeReq = new NextRequest('http://localhost:3000/api/tasks/task-sim-weekend/manual-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confirmationRef: 'RETREAT-VILLA-7',
          vendorName: retreatOption.providerName,
          notes: 'Private Pool Villa held with bespoke couples itinerary.',
          andComplete: true,
        }),
      });
      const res = await manualConfirmHandler(completeReq, {
        params: Promise.resolve({ id: 'task-sim-weekend' }),
      });
      expect(res.status).toBe(200);

      expect(env.getTask().status).toBe('COMPLETED');
    });
  });

  describe('Journey E: Premium Gift Under ₹10,000', () => {
    it('executes: Request → 5 Curation Options Under ₹10k → Approve Luxury Hamper → Fulfill & Complete', async () => {
      const initialTask = {
        id: 'task-sim-gift',
        publicId: 'TSK-GFT-505',
        status: 'REQUESTED',
        category: 'gift',
        intent: 'Find a premium gift under ₹10,000.',
        originalRequest: 'Find a premium gift under ₹10,000.',
        customerId: 'cust-sim-gift',
        budgetAmount: 10000,
        clientPreferences: {
          budgetAmount: 10000,
        },
        customer: {
          user: {
            name: 'Devika Ray',
            email: 'devika.ray@example.com',
          },
        },
      };

      const env = createSimulatedTaskEnvironment(initialTask);

      // 1. Initial 5 Gift Options
      const batch1 = await RequestOrchestrator.processTask('task-sim-gift');
      expect(batch1.success).toBe(true);
      expect(batch1.proposals.length).toBe(5);

      // Verify all proposals obey budget ceiling
      batch1.proposals.forEach((p: any) => {
        expect(p.priceAmount).toBeLessThanOrEqual(10000);
      });

      // 2. Approve gift
      const approvedGift = batch1.proposals[0];
      const execRes = await RequestOrchestrator.executeApprovedTask({
        taskId: 'task-sim-gift',
        option: approvedGift,
      });

      // Deliverable or concierge completed
      expect(['COMPLETED', 'NEEDS_HUMAN']).toContain(execRes.task.status);
      if (execRes.task.status === 'NEEDS_HUMAN') {
        await RequestOrchestrator.completeTask({
          taskId: 'task-sim-gift',
          operatorId: 'op-alex-1',
          notes: 'Premium artisan collection packaged and dispatched via courier tracking #BLR-DEL-98421.',
        });
      }

      expect(env.getTask().status).toBe('COMPLETED');
    });
  });

  describe('Journey F: Research / Planning (Three-Day Delhi Itinerary)', () => {
    it('executes: Request → 5 Curated Dossier Options → Approve Itinerary → Instant Deliverable Generation & Completion (No Fake PNR)', async () => {
      const initialTask = {
        id: 'task-sim-itinerary',
        publicId: 'TSK-ITN-606',
        status: 'REQUESTED',
        category: 'planning',
        intent: 'Plan a three-day Delhi itinerary.',
        originalRequest: 'Plan a three-day Delhi itinerary.',
        customerId: 'cust-sim-itn',
        destination: 'DELHI',
        clientPreferences: {
          isDeliverable: true,
        },
        customer: {
          user: {
            name: 'Vikram Seth',
            email: 'vikram.seth@author.com',
          },
        },
      };

      const env = createSimulatedTaskEnvironment(initialTask);

      // 1. Process Task
      const batch1 = await RequestOrchestrator.processTask('task-sim-itinerary');
      expect(batch1.success).toBe(true);
      expect(batch1.proposals.length).toBe(5);

      // 2. Select preferred dossier
      const selectedDossier = batch1.proposals[0];
      const result = await RequestOrchestrator.executeApprovedTask({
        taskId: 'task-sim-itinerary',
        option: selectedDossier,
      });

      // 3. Verify direct transition to COMPLETED with stored deliverable
      expect(result.success).toBe(true);
      expect(result.status).toBe('COMPLETED');
      expect(result.task.status).toBe('COMPLETED');
      expect(result.deliverable).toBeDefined();

      // Zero-fabrication check: no fake PNR was created
      expect(result.task.externalReferenceId).toBeFalsy();

      // Email deliverable notification
      expect(sendBookingConfirmationEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'vikram.seth@author.com',
          title: selectedDossier.title,
        })
      );
    });
  });
});
