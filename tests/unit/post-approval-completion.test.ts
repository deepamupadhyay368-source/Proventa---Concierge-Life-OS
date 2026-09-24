import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RequestOrchestrator } from '@/lib/orchestration/orchestrator';
import { validateTransition } from '@/lib/orchestration/state-machine';
import { db } from '@/lib/db';
import { sendBookingConfirmationEmail } from '@/lib/email/sender';
import { sendWhatsAppNotification } from '@/lib/notifications/whatsapp';
import { POST as manualConfirmHandler } from '@/app/api/tasks/[id]/manual-confirm/route';
import { POST as conciergeActionHandler } from '@/app/api/admin/concierge/action/route';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('@/lib/db', () => ({
  db: {
    task: {
      findUnique: vi.fn(),
      update: vi.fn(),
      findFirst: vi.fn(),
    },
    taskEvent: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
    conciergeRequest: {
      count: vi.fn().mockResolvedValue(10),
      create: vi.fn().mockResolvedValue({ id: 'cr-101' }),
    },
    booking: {
      create: vi.fn().mockResolvedValue({ id: 'bkg-101' }),
    },
    city: {
      findFirst: vi.fn().mockResolvedValue({ id: 'city-amd', name: 'Ahmedabad', active: true }),
    },
    customer: {
      findUnique: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('@/lib/auth/session', () => ({
  requireConcierge: vi.fn().mockResolvedValue({
    id: 'user-concierge-1',
    email: 'concierge@proventa.in',
    name: 'Senior Concierge Alex',
    role: 'CONCIERGE',
  }),
  requireSuperAdmin: vi.fn().mockResolvedValue({
    id: 'user-admin-1',
    email: 'admin@proventa.in',
    name: 'Admin User',
    role: 'SUPERADMIN',
  }),
}));

vi.mock('@/lib/email/sender', () => ({
  sendBookingConfirmationEmail: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock('@/lib/notifications/whatsapp', () => ({
  sendWhatsAppNotification: vi.fn().mockResolvedValue({ success: true }),
}));

describe('Post-Approval Task Completion Engine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('1. Approval & Option Locking', () => {
    it('locks selected option in clientPreferences and logs CUSTOMER_APPROVED', async () => {
      const mockTask: any = {
        id: 'task-lock-1',
        publicId: 'TSK-1001',
        status: 'AWAITING_APPROVAL',
        category: 'dining',
        intent: 'Table at Agashiye for 2',
        originalRequest: 'Table at Agashiye Ahmedabad tomorrow 8pm for 2 guests',
        customerId: 'cust-1',
        clientPreferences: {
          requestedDate: '2026-10-15',
          partySize: 2,
        },
        proposedOptions: [
          {
            id: 'opt-agashiye-1',
            title: 'Agashiye Heritage Rooftop Thali',
            providerName: 'Agashiye',
            providerId: 'ahmedabad-verified-network',
            priceAmount: 4200,
            priceFormatted: '₹4,200',
            bookingMethod: 'PHONE',
            metadata: {
              venue: 'Agashiye',
              city: 'Ahmedabad',
            },
          },
        ],
        customer: {
          user: {
            name: 'Vikram Patel',
            email: 'vikram@example.com',
            phone: '+919876543210',
          },
        },
      };

      vi.mocked(db.task.findUnique).mockResolvedValue(mockTask);
      (db.task.update as any).mockImplementation(async ({ data }: any) => ({
        ...mockTask,
        ...data,
      }));

      const result = await RequestOrchestrator.executeApprovedTask({
        taskId: 'task-lock-1',
        optionId: 'opt-agashiye-1',
      });

      expect(result.success).toBe(true);
      expect(db.task.update).toHaveBeenCalled();

      // Verify task status transitioned to NEEDS_HUMAN (assisted phone booking)
      expect(result.task.status).toBe('NEEDS_HUMAN');
      expect(result.task.approvalStatus).toBe('APPROVED');

      // Verify option locked in clientPreferences
      const updatedPrefs = result.task.clientPreferences as any;
      expect(updatedPrefs.approvedOption).toBeDefined();
      expect(updatedPrefs.approvedOption.id).toBe('opt-agashiye-1');
      expect(updatedPrefs.approvedOption.title).toBe('Agashiye Heritage Rooftop Thali');

      // Verify CUSTOMER_APPROVED event logged
      expect(db.taskEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            taskId: 'task-lock-1',
            eventType: 'CUSTOMER_APPROVED',
            actorRole: 'CUSTOMER',
          }),
        })
      );
    });

    it('enforces Entity Integrity pre-execution constraint gate against mismatching options', async () => {
      const mockTask: any = {
        id: 'task-constraint-fail',
        publicId: 'TSK-1002',
        status: 'AWAITING_APPROVAL',
        category: 'dining',
        intent: 'Table in Ahmedabad',
        originalRequest: 'Table at Agashiye Ahmedabad tomorrow 8pm for 2 guests',
        customerId: 'cust-1',
        clientPreferences: {},
        proposedOptions: [
          {
            id: 'opt-mismatch-city',
            title: 'Bukhara New Delhi',
            providerName: 'Bukhara',
            priceAmount: 8000,
            metadata: {
              city: 'Delhi', // Mismatched destination
            },
          },
        ],
      };

      vi.mocked(db.task.findUnique).mockResolvedValue(mockTask);
      (db.task.update as any).mockImplementation(async ({ data }: any) => ({
        ...mockTask,
        ...data,
      }));

      await expect(
        RequestOrchestrator.executeApprovedTask({
          taskId: 'task-constraint-fail',
          optionId: 'opt-mismatch-city',
        })
      ).rejects.toThrow();

      // Verify task was escalated to NEEDS_HUMAN with mismatch event
      expect(db.taskEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            taskId: 'task-constraint-fail',
            eventType: 'INTENT_CONSTRAINT_MISMATCH',
          }),
        })
      );
    });
  });

  describe('2. Non-Booking Deliverable Task Completion', () => {
    it('fulfills research/curation task directly to COMPLETED with stored deliverable and notification', async () => {
      const mockTask: any = {
        id: 'task-research-1',
        publicId: 'TSK-1003',
        status: 'AWAITING_APPROVAL',
        category: 'research',
        intent: 'Curate Top IB Schools in Delhi NCR',
        originalRequest: 'Curate top 3 International Baccalaureate schools in South Delhi with admission deadlines',
        customerId: 'cust-2',
        clientPreferences: {
          curationScope: 'delhi-ib-schools',
        },
        proposedOptions: [
          {
            id: 'opt-ib-schools',
            title: 'Comprehensive IB Schools Advisory & Comparison Report',
            providerName: 'Proventa Education Advisory Desk',
            priceAmount: 0,
            bookingMethod: 'DELIVERABLE',
            metadata: {
              isDeliverable: true,
              deliverableType: 'Advisory Dossier',
              reportText: '1. The British School, Chanakyapuri\n2. Pathways World School\n3. American Embassy School',
            },
          },
        ],
        customer: {
          user: {
            name: 'Ananya Sharma',
            email: 'ananya@example.com',
            phone: '+919811122233',
          },
        },
      };

      vi.mocked(db.task.findUnique).mockResolvedValue(mockTask);
      (db.task.update as any).mockImplementation(async ({ data }: any) => ({
        ...mockTask,
        ...data,
      }));

      const result = await RequestOrchestrator.executeApprovedTask({
        taskId: 'task-research-1',
        optionId: 'opt-ib-schools',
      });

      expect(result.success).toBe(true);
      expect(result.status).toBe('COMPLETED');
      expect(result.task.status).toBe('COMPLETED');

      // Verify deliverable stored in clientPreferences
      const prefs = result.task.clientPreferences as any;
      expect(prefs.deliverable).toBeDefined();
      expect(prefs.deliverable.title).toBe('Comprehensive IB Schools Advisory & Comparison Report');
      expect(prefs.deliverable.content).toContain('The British School');

      // Verify DELIVERABLE_PREPARED and TASK_COMPLETED events
      expect(db.taskEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            taskId: 'task-research-1',
            eventType: 'DELIVERABLE_PREPARED',
          }),
        })
      );
      expect(db.taskEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            taskId: 'task-research-1',
            eventType: 'TASK_COMPLETED',
          }),
        })
      );

      // Verify email was dispatched
      expect(sendBookingConfirmationEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'ananya@example.com',
          name: 'Ananya Sharma',
          title: 'Comprehensive IB Schools Advisory & Comparison Report',
        })
      );
    });
  });

  describe('3. Automated Execution & Confirmation', () => {
    it('executes via genuine provider API, marks CONFIRMED with PROVIDER_CONFIRMED event and notifies member', async () => {
      const mockTask: any = {
        id: 'task-auto-1',
        publicId: 'TSK-1004',
        status: 'AWAITING_APPROVAL',
        category: 'travel',
        intent: 'Flight BOM to DEL',
        originalRequest: 'Book flight BOM to DEL business class tomorrow',
        customerId: 'cust-3',
        clientPreferences: {},
        proposedOptions: [
          {
            id: 'opt-air-india-1',
            title: 'Air India AI-805 Business Class',
            providerName: 'Air India GDS',
            providerId: 'air-india-gds',
            priceAmount: 24500,
            bookingMethod: 'API',
            metadata: {
              flightNumber: 'AI-805',
              origin: 'BOM',
              destination: 'DEL',
            },
          },
        ],
        customer: {
          user: {
            name: 'Rajesh Khanna',
            email: 'rajesh@example.com',
            phone: '+919988776655',
          },
        },
      };

      const { AdapterRegistry } = await import('@/lib/orchestration/adapters');
      vi.spyOn(AdapterRegistry, 'getAdapterById').mockReturnValue({
        providerId: 'air-india-gds',
        name: 'Air India GDS',
        environment: 'REAL',
        supportedCategories: ['travel', 'flights'],
        search: vi.fn(),
        execute: vi.fn().mockResolvedValue({
          success: true,
          status: 'CONFIRMED',
          providerId: 'air-india-gds',
          providerName: 'Air India GDS',
          externalReferenceId: 'AI-CONF-8899',
          environment: 'REAL',
          isMock: false,
          confirmedDetails: {
            pnr: 'AI-CONF-8899',
          },
        }),
        verify: vi.fn().mockResolvedValue({ verified: true, isValid: true, isMock: false, environment: 'REAL' }),
      } as any);

      vi.mocked(db.task.findUnique).mockResolvedValue(mockTask);
      (db.task.update as any).mockImplementation(async ({ data }: any) => ({
        ...mockTask,
        ...data,
      }));

      const result = await RequestOrchestrator.executeApprovedTask({
        taskId: 'task-auto-1',
        optionId: 'opt-air-india-1',
        skipPaymentGate: true,
      });

      expect(result.success).toBe(true);
      expect(result.task.status).toBe('CONFIRMED');
      expect(result.task.externalReferenceId).toBeDefined();

      // Verify PROVIDER_CONFIRMED timeline event
      expect(db.taskEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            taskId: 'task-auto-1',
            eventType: 'PROVIDER_CONFIRMED',
          }),
        })
      );

      // Verify email confirmation dispatched
      expect(sendBookingConfirmationEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'rajesh@example.com',
        })
      );
    });
  });

  describe('4. Human Concierge Fallback & Operator Desk', () => {
    it('falls back to NEEDS_HUMAN with HUMAN_CONCIERGE and preserves full customer mandate', async () => {
      const mockTask: any = {
        id: 'task-phone-1',
        publicId: 'TSK-1005',
        status: 'AWAITING_APPROVAL',
        category: 'dining',
        intent: 'Table at Agashiye',
        originalRequest: 'Table at Agashiye Ahmedabad 8pm for 4 guests',
        customerId: 'cust-4',
        clientPreferences: {
          requestedDate: '2026-10-18',
          partySize: 4,
        },
        proposedOptions: [
          {
            id: 'opt-phone-aga',
            title: 'Agashiye Grand Thali',
            providerName: 'Agashiye',
            providerId: 'ahmedabad-verified-network',
            priceAmount: 8400,
            bookingMethod: 'PHONE',
            metadata: {
              venue: 'Agashiye',
              phone: '+917925506997',
              city: 'Ahmedabad',
            },
          },
        ],
        customer: {
          user: {
            name: 'Sneha Shah',
            email: 'sneha@example.com',
            phone: '+919825012345',
          },
        },
      };

      vi.mocked(db.task.findUnique).mockResolvedValue(mockTask);
      (db.task.update as any).mockImplementation(async ({ data }: any) => ({
        ...mockTask,
        ...data,
      }));

      const result = await RequestOrchestrator.executeApprovedTask({
        taskId: 'task-phone-1',
        optionId: 'opt-phone-aga',
        skipPaymentGate: true,
      });

      expect(result.success).toBe(true);
      expect(result.task.status).toBe('NEEDS_HUMAN');
      expect(result.task.executionMethod).toBe('HUMAN_CONCIERGE');
      expect(result.task.isEscalated).toBe(true);

      // Verify WhatsApp notification to customer explaining concierge placement
      expect(sendWhatsAppNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          phone: '+919825012345',
          template: 'AWAITING_CONCIERGE_CALL',
        })
      );
    });
  });

  describe('5. Zero-Fabrication Reference Verification in Manual Confirmation', () => {
    it('strictly rejects synthetic, mock, or sandbox references with HTTP 400', async () => {
      const invalidRefs = [
        'PV-12345',
        'PV-AMD-88',
        'MOCK-BKG-01',
        'TEST-REFERENCE',
        'DEMO-CONFIRM',
        'FAKE-999',
        'SANDBOX-101',
        'none',
        'n/a',
        'na',
        'test',
      ];

      for (const badRef of invalidRefs) {
        const req = new NextRequest('http://localhost:3000/api/tasks/task-phone-1/manual-confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            confirmationRef: badRef,
            vendorName: 'Agashiye',
          }),
        });

        const res = await manualConfirmHandler(req, { params: Promise.resolve({ id: 'task-phone-1' }) });
        expect(res.status).toBe(400);
        const json = await res.json();
        expect(json.error).toBeDefined();
      }
    });

    it('accepts genuine provider confirmation, records PROVIDER_CONFIRMED, and creates Authoritative Booking', async () => {
      const mockTask: any = {
        id: 'task-manual-ok',
        publicId: 'TSK-1006',
        status: 'NEEDS_HUMAN',
        category: 'dining',
        intent: 'Table at Agashiye',
        originalRequest: 'Table at Agashiye Ahmedabad 8pm for 4 guests',
        customerId: 'cust-4',
        clientPreferences: {
          approvedOption: {
            title: 'Agashiye Grand Thali',
            providerName: 'Agashiye',
          },
        },
        customer: {
          user: {
            name: 'Sneha Shah',
            email: 'sneha@example.com',
            phone: '+919825012345',
          },
        },
      };

      vi.mocked(db.task.findUnique).mockResolvedValue(mockTask);
      let currentTask = { ...mockTask };
      (db.task.update as any).mockImplementation(async ({ data }: any) => {
        currentTask = { ...currentTask, ...data };
        return currentTask;
      });

      const req = new NextRequest('http://localhost:3000/api/tasks/task-manual-ok/manual-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confirmationRef: 'AGS-TABLE-14',
          vendorName: 'Agashiye Heritage Hotel',
          notes: 'Confirmed directly with Maître d Farhan.',
          andComplete: true, // test immediate completion
        }),
      });

      const res = await manualConfirmHandler(req, { params: Promise.resolve({ id: 'task-manual-ok' }) });
      expect(res.status).toBe(200);
      const json = await res.json();

      expect(json.success).toBe(true);
      expect(json.task.status).toBe('COMPLETED');
      expect(json.task.externalReferenceId).toBe('AGS-TABLE-14');

      // Verify PROVIDER_CONFIRMED & TASK_COMPLETED events
      expect(db.taskEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            taskId: 'task-manual-ok',
            eventType: 'PROVIDER_CONFIRMED',
          }),
        })
      );
      expect(db.taskEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            taskId: 'task-manual-ok',
            eventType: 'TASK_COMPLETED',
          }),
        })
      );

      // Verify Authoritative Booking record created
      expect(db.booking.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            customerId: 'cust-4',
            confirmationRef: 'AGS-TABLE-14',
            status: 'CONFIRMED',
          }),
        })
      );
    });
  });

  describe('6. RequestOrchestrator.completeTask Method', () => {
    it('transitions task from CONFIRMED to COMPLETED and logs TASK_COMPLETED event', async () => {
      const mockTask: any = {
        id: 'task-comp-1',
        publicId: 'TSK-1007',
        status: 'CONFIRMED',
        category: 'dining',
        intent: 'Table at Agashiye',
        externalReferenceId: 'AGS-TABLE-14',
        clientPreferences: {},
        customer: {
          user: {
            name: 'Sneha Shah',
            email: 'sneha@example.com',
          },
        },
      };

      vi.mocked(db.task.findUnique).mockResolvedValue(mockTask);
      (db.task.update as any).mockImplementation(async ({ data }: any) => ({
        ...mockTask,
        ...data,
      }));

      const completed = await RequestOrchestrator.completeTask({
        taskId: 'task-comp-1',
        operatorId: 'user-concierge-1',
        notes: 'Member attended dinner and reported outstanding experience.',
      });

      expect(completed.status).toBe('COMPLETED');
      expect((completed.clientPreferences as any).completionNotes).toBe(
        'Member attended dinner and reported outstanding experience.'
      );

      expect(db.taskEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            taskId: 'task-comp-1',
            eventType: 'TASK_COMPLETED',
            actorRole: 'CONCIERGE',
          }),
        })
      );
    });

    it('rejects invalid state transition to COMPLETED if task is in REQUESTED state', async () => {
      const mockTask: any = {
        id: 'task-bad-state',
        status: 'REQUESTED',
      };

      vi.mocked(db.task.findUnique).mockResolvedValue(mockTask);

      await expect(
        RequestOrchestrator.completeTask({
          taskId: 'task-bad-state',
        })
      ).rejects.toThrow();
    });
  });

  describe('7. Operator Desk Lifecycle Actions', () => {
    it('handles CLAIM, CONTACT_PROVIDER, COMPLETE, and CANCEL actions properly', async () => {
      const mockTask: any = {
        id: 'task-desk-actions',
        publicId: 'TSK-1008',
        status: 'NEEDS_HUMAN',
        category: 'travel',
        vendorName: 'Taj Skyline',
        clientPreferences: {},
        customer: {
          user: { email: 'client@example.com' },
        },
      };

      vi.mocked(db.task.findUnique).mockResolvedValue(mockTask);
      (db.task.update as any).mockImplementation(async ({ data }: any) => ({
        ...mockTask,
        ...data,
      }));

      // 1. CLAIM
      const claimReq = new NextRequest('http://localhost:3000/api/admin/concierge/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: 'task-desk-actions',
          action: 'CLAIM',
        }),
      });
      const claimRes = await conciergeActionHandler(claimReq);
      expect(claimRes.status).toBe(200);
      expect(db.taskEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            eventType: 'OPERATOR_CLAIMED',
          }),
        })
      );

      // 2. CONTACT_PROVIDER
      const contactReq = new NextRequest('http://localhost:3000/api/admin/concierge/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: 'task-desk-actions',
          action: 'CONTACT_PROVIDER',
          notes: 'Reached out to hotel front office manager.',
        }),
      });
      const contactRes = await conciergeActionHandler(contactReq);
      expect(contactRes.status).toBe(200);
      expect(db.taskEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            eventType: 'PROVIDER_CONTACTED',
          }),
        })
      );

      // 3. COMPLETE
      const completeReq = new NextRequest('http://localhost:3000/api/admin/concierge/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: 'task-desk-actions',
          action: 'COMPLETE',
          notes: 'Fulfilled and verified by concierge desk.',
        }),
      });
      const completeRes = await conciergeActionHandler(completeReq);
      expect(completeRes.status).toBe(200);
      const completeJson = await completeRes.json();
      expect(completeJson.data.status).toBe('COMPLETED');
      expect(db.taskEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            eventType: 'TASK_COMPLETED',
          }),
        })
      );

      // 4. CANCEL
      const cancelReq = new NextRequest('http://localhost:3000/api/admin/concierge/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: 'task-desk-actions',
          action: 'CANCEL',
          notes: 'Cancelled upon member request.',
        }),
      });
      const cancelRes = await conciergeActionHandler(cancelReq);
      expect(cancelRes.status).toBe(200);
      const cancelJson = await cancelRes.json();
      expect(cancelJson.data.status).toBe('CANCELLED');
    });
  });

  describe('8. State Machine Direct Transition Verification', () => {
    it('allows valid direct transitions: EXECUTING -> COMPLETED and CONFIRMED -> COMPLETED', () => {
      expect(() => validateTransition('EXECUTING', 'COMPLETED')).not.toThrow();
      expect(() => validateTransition('CONFIRMED', 'COMPLETED')).not.toThrow();
      expect(() => validateTransition('APPROVED', 'EXECUTING')).not.toThrow();
      expect(() => validateTransition('NEEDS_HUMAN', 'CONFIRMED')).not.toThrow();
      expect(() => validateTransition('NEEDS_HUMAN', 'COMPLETED')).not.toThrow();
    });
  });
});
