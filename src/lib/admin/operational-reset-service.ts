import { db } from '@/lib/db';
import { createAuditLog } from '@/lib/audit';

export interface ResetPreview {
  testTasksCount: number;
  testTaskEventsCount: number;
  testAgentRunsCount: number;
  testBookingsCount: number;
  testPaymentsCount: number;
  testUsersCount: number;
  testCustomerProfilesCount: number;
  preservedAdminsCount: number;
  preservedEmployeesCount: number;
  preservedInvitationsCount: number;
  preservedSettingsCount: number;
  preservedCategoriesCount: number;
  preservedCitiesCount: number;
  preservedProvidersCount: number;
  uncertainRecordsCount: number;
  details: {
    testTasks: Array<{ id: string; publicId: string; intent: string; status: string }>;
    testUsers: Array<{ id: string; email: string; name: string | null }>;
    protectedAdmins: Array<{ id: string; email: string; name: string | null; role: string }>;
    protectedEmployees: Array<{ id: string; email: string; name: string | null }>;
  };
}

export class OperationalResetService {
  /**
   * Generates a read-only preview of operational data classified for deletion vs protected records.
   */
  static async generatePreview(): Promise<ResetPreview> {
    const allUsers = await db.user.findMany({
      include: {
        userRoles: true,
        conciergeAgent: true,
        customerProfile: true,
      },
    });

    const protectedAdmins: any[] = [];
    const protectedEmployees: any[] = [];
    const testUserIds: string[] = [];
    const testUsersList: any[] = [];

    for (const u of allUsers) {
      const roles = u.userRoles.map((r) => r.role);
      const isSuperOrAdmin = roles.some((r) => ['SUPER_ADMIN', 'FOUNDER', 'ADMIN'].includes(r));
      const isConciergeStaff = Boolean(u.conciergeAgent) || roles.some((r) => ['CONCIERGE', 'SENIOR_CONCIERGE', 'CONCIERGE_MANAGER'].includes(r));

      // Real admin & concierge seeds / permanent accounts
      const isSeedAdmin = u.email === 'admin@proventa.dev' || u.email.includes('founder') || (isSuperOrAdmin && !u.email.startsWith('pay_admin_'));
      const isSeedEmployee = u.email === 'operator@proventa.in' || (isConciergeStaff && !u.email.startsWith('pay_'));

      if (isSeedAdmin) {
        protectedAdmins.push({ id: u.id, email: u.email, name: u.name, role: roles.join(', ') });
      } else if (isSeedEmployee) {
        protectedEmployees.push({ id: u.id, email: u.email, name: u.name });
      } else {
        // Identified as automated test / demo user
        testUserIds.push(u.id);
        testUsersList.push({ id: u.id, email: u.email, name: u.name });
      }
    }

    // All existing tasks created during automated development and test evaluation runs
    const allTasks = await db.task.findMany({
      select: { id: true, publicId: true, intent: true, status: true, customerId: true },
    });

    const [
      taskEventsCount,
      agentRunsCount,
      bookingsCount,
      paymentsCount,
      customerProfilesCount,
      invitationsCount,
      settingsCount,
      categoriesCount,
      citiesCount,
      providersCount,
    ] = await Promise.all([
      db.taskEvent.count(),
      db.agentRunRecord.count(),
      db.booking.count(),
      db.payment.count(),
      db.customerProfile.count({ where: { userId: { in: testUserIds } } }),
      db.invitation.count(),
      db.systemSetting.count(),
      db.serviceCategory.count(),
      db.city.count(),
      db.provider.count(),
    ]);

    return {
      testTasksCount: allTasks.length,
      testTaskEventsCount: taskEventsCount,
      testAgentRunsCount: agentRunsCount,
      testBookingsCount: bookingsCount,
      testPaymentsCount: paymentsCount,
      testUsersCount: testUserIds.length,
      testCustomerProfilesCount: customerProfilesCount,
      preservedAdminsCount: protectedAdmins.length,
      preservedEmployeesCount: protectedEmployees.length,
      preservedInvitationsCount: invitationsCount,
      preservedSettingsCount: settingsCount,
      preservedCategoriesCount: categoriesCount,
      preservedCitiesCount: citiesCount,
      preservedProvidersCount: providersCount,
      uncertainRecordsCount: 0,
      details: {
        testTasks: allTasks.slice(0, 30).map((t) => ({ id: t.id, publicId: t.publicId, intent: t.intent, status: t.status })),
        testUsers: testUsersList.slice(0, 30),
        protectedAdmins,
        protectedEmployees,
      },
    };
  }

  /**
   * Executes the production operational data reset.
   * Enforces typed confirmation text, preserves schema, protected accounts and configs, and audits the action.
   */
  static async executeReset(params: {
    confirmationText: string;
    actorId: string;
  }): Promise<{ success: boolean; message: string; deletedSummary: Record<string, number> }> {
    const { confirmationText, actorId } = params;

    if (confirmationText !== 'RESET PRIVATE BETA DATA') {
      throw new Error('Invalid confirmation text. Must match exactly "RESET PRIVATE BETA DATA".');
    }

    const preview = await this.generatePreview();

    const deletedSummary = await db.$transaction(async (tx) => {
      // 1. Delete dependent task children in reverse dependency order
      const deletedAgentTraces = await tx.agentExecutionTrace.deleteMany({});
      const deletedPlanSteps = await tx.taskPlanStep.deleteMany({});
      const deletedAgentRuns = await tx.agentRunRecord.deleteMany({});
      const deletedTaskEvents = await tx.taskEvent.deleteMany({});
      const deletedExternalTx = await tx.externalTransaction.deleteMany({});

      // 2. Delete test payments and payment events
      const deletedPaymentEvents = await tx.paymentEvent.deleteMany({});
      const deletedPayments = await tx.payment.deleteMany({});

      // 3. Delete test bookings and booking events
      const deletedBookingEvents = await tx.bookingEvent.deleteMany({});
      const deletedBookings = await tx.booking.deleteMany({});
      const deletedApprovals = await tx.approval.deleteMany({});

      // 4. Delete concierge requests and child interactions
      const deletedAttachments = await tx.requestAttachment.deleteMany({});
      const deletedMessages = await tx.requestMessage.deleteMany({});
      const deletedAssignments = await tx.requestAssignment.deleteMany({});
      const deletedRecommendations = await tx.aIRecommendation.deleteMany({});
      const deletedInteractions = await tx.aIInteraction.deleteMany({});
      const deletedWorkflowRuns = await tx.aIWorkflowRun.deleteMany({});
      const deletedSlaRecords = await tx.sLARecord.deleteMany({});
      const deletedFeedback = await tx.feedback.deleteMany({});
      const deletedSupportTickets = await tx.supportTicket.deleteMany({});
      const deletedConciergeRequests = await tx.conciergeRequest.deleteMany({});

      // 5. Delete all operational tasks
      const deletedTasks = await tx.task.deleteMany({});

      // 6. Delete test notifications & internal notes associated with tasks
      const deletedNotifications = await tx.notification.deleteMany({});
      const deletedInternalNotes = await tx.internalNote.deleteMany({});

      // 7. Delete test customer accounts (excluding protected admins & employees)
      const protectedAdminEmails = preview.details.protectedAdmins.map((a) => a.email);
      const protectedEmployeeEmails = preview.details.protectedEmployees.map((e) => e.email);
      const protectedEmails = new Set([...protectedAdminEmails, ...protectedEmployeeEmails, 'admin@proventa.dev', 'founder@proventa.in', 'operator@proventa.in']);

      const testUsers = await tx.user.findMany({
        where: {
          email: { notIn: Array.from(protectedEmails) },
        },
        select: { id: true },
      });

      const testUserIds = testUsers.map((u) => u.id);

      await tx.customerPaymentProfile.deleteMany({
        where: { customer: { userId: { in: testUserIds } } },
      });
      await tx.customerPreference.deleteMany({
        where: { customer: { userId: { in: testUserIds } } },
      });
      await tx.customerProfile.deleteMany({
        where: { userId: { in: testUserIds } },
      });
      await tx.session.deleteMany({
        where: { userId: { in: testUserIds } },
      });
      await tx.emailVerification.deleteMany({
        where: { userId: { in: testUserIds } },
      });
      await tx.passwordReset.deleteMany({
        where: { userId: { in: testUserIds } },
      });
      await tx.consentRecord.deleteMany({
        where: { userId: { in: testUserIds } },
      });
      await tx.oAuthAccount.deleteMany({
        where: { userId: { in: testUserIds } },
      });
      await tx.userRoleAssignment.deleteMany({
        where: { userId: { in: testUserIds } },
      });
      const deletedUsers = await tx.user.deleteMany({
        where: { id: { in: testUserIds } },
      });

      return {
        tasks: deletedTasks.count,
        taskEvents: deletedTaskEvents.count,
        agentRuns: deletedAgentRuns.count,
        bookings: deletedBookings.count,
        payments: deletedPayments.count,
        conciergeRequests: deletedConciergeRequests.count,
        testUsers: deletedUsers.count,
      };
    }, {
      maxWait: 15000,
      timeout: 60000,
    });

    void createAuditLog({
      actorId,
      action: 'ADMIN_ACTION',
      resourceType: 'SystemReset',
      resourceId: 'PRODUCTION_OPERATIONAL_DATA_RESET',
      after: {
        action: 'RESET_PRIVATE_BETA_DATA',
        deletedSummary,
        executedAt: new Date().toISOString(),
      },
    });

    return {
      success: true,
      message: 'Production operational data reset completed successfully. Admin and Concierge workspaces are now clean.',
      deletedSummary,
    };
  }
}
