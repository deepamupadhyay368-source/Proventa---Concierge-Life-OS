import { db } from '../lib/db';

export async function generatePreResetReport() {
  const allUsers = await db.user.findMany({
    include: { userRoles: true, customerProfile: true },
  });

  const staffRoles = [
    'SUPER_ADMIN',
    'FOUNDER',
    'ADMIN',
    'SUPPORT',
    'CONCIERGE_MANAGER',
    'SENIOR_CONCIERGE',
    'CONCIERGE',
    'FINANCE',
  ];

  const customerUsers = allUsers.filter(
    (u) =>
      u.userRoles.some((r) => r.role === 'CUSTOMER') &&
      !u.userRoles.some((r) => staffRoles.includes(r.role))
  );

  const staffUsers = allUsers.filter((u) =>
    u.userRoles.some((r) => staffRoles.includes(r.role))
  );

  const customerUserIds = customerUsers.map((u) => u.id);
  const customerProfileIds = customerUsers
    .map((u) => u.customerProfile?.id)
    .filter(Boolean) as string[];

  const profilesCount = await db.customerProfile.count({
    where: { userId: { in: customerUserIds } },
  });

  const tasksCount = await db.task.count({
    where: { customerId: { in: customerProfileIds } },
  });

  const requestsCount = await db.conciergeRequest.count({
    where: { customerId: { in: customerProfileIds } },
  });

  const bookingsCount = await db.booking.count({
    where: { customerId: { in: customerProfileIds } },
  });

  const approvalsCount = await db.approval.count({
    where: { customerId: { in: customerProfileIds } },
  });

  const paymentsCount = await db.payment.count({
    where: { customerId: { in: customerProfileIds } },
  });

  const notificationsCount = await db.notification.count({
    where: { userId: { in: customerUserIds } },
  });

  const paymentProfilesCount = await db.customerPaymentProfile.count({
    where: { customerId: { in: customerProfileIds } },
  });

  const preferencesCount = await db.customerPreference.count({
    where: { customerId: { in: customerProfileIds } },
  });

  const feedbackCount = await db.feedback.count({
    where: { customerId: { in: customerProfileIds } },
  });

  const supportTicketsCount = await db.supportTicket.count({
    where: { customerId: { in: customerUserIds } },
  });

  const sessionsCount = await db.session.count({
    where: { userId: { in: customerUserIds } },
  });

  const consentRecordsCount = await db.consentRecord.count({
    where: { userId: { in: customerUserIds } },
  });

  const policyAcceptancesCount = await db.policyAcceptance.count({
    where: { userId: { in: customerUserIds } },
  });

  const externalTransactionsCount = await db.externalTransaction.count({
    where: { userId: { in: customerUserIds } },
  });

  const connectedIntegrationsCount = await db.connectedIntegration.count({
    where: { userId: { in: customerUserIds } },
  });

  const otherRecordsCount =
    paymentProfilesCount +
    preferencesCount +
    feedbackCount +
    supportTicketsCount +
    sessionsCount +
    consentRecordsCount +
    policyAcceptancesCount +
    externalTransactionsCount +
    connectedIntegrationsCount;

  return {
    customerUsersCount: customerUsers.length,
    customerProfilesCount: profilesCount,
    customerTasksCount: tasksCount,
    customerRequestsCount: requestsCount,
    customerBookingsCount: bookingsCount,
    customerMembershipsCount: profilesCount, // Each customer profile holds membership details
    customerRemindersCount: 0, // Reminder records if any
    otherCustomerOwnedRecordsCount: otherRecordsCount,
    adminFounderConciergeUsersCount: staffUsers.length,
    staffUsersList: staffUsers.map((s) => ({
      id: s.id,
      email: s.email,
      name: s.name,
      roles: s.userRoles.map((r) => r.role),
    })),
    customerUserIds,
    customerProfileIds,
  };
}

export async function executeSafeCustomerReset() {
  const report = await generatePreResetReport();

  if (report.customerUsersCount === 0) {
    return {
      deletedCustomerUsers: 0,
      deletedCustomerProfiles: 0,
      deletedDependentRecords: 0,
      preservedStaffUsers: report.adminFounderConciergeUsersCount,
      message: 'No customer accounts to delete.',
    };
  }

  const { customerUserIds, customerProfileIds } = report;

  // Execute safe deletion in strict foreign key order
  let totalDeletedDependents = 0;

  // 1. Task dependent records
  if (customerProfileIds.length > 0) {
    const tasks = await db.task.findMany({
      where: { customerId: { in: customerProfileIds } },
      select: { id: true },
    });
    const taskIds = tasks.map((t) => t.id);

    if (taskIds.length > 0) {
      const delTaskEvents = await db.taskEvent.deleteMany({ where: { taskId: { in: taskIds } } });
      const delAgentRuns = await db.agentRunRecord.deleteMany({ where: { taskId: { in: taskIds } } });
      const delPlanSteps = await db.taskPlanStep.deleteMany({ where: { taskId: { in: taskIds } } });
      const delTraces = await db.agentExecutionTrace.deleteMany({ where: { taskId: { in: taskIds } } });
      totalDeletedDependents += delTaskEvents.count + delAgentRuns.count + delPlanSteps.count + delTraces.count;
    }

    // 2. ConciergeRequest dependent records
    const requests = await db.conciergeRequest.findMany({
      where: { customerId: { in: customerProfileIds } },
      select: { id: true },
    });
    const requestIds = requests.map((r) => r.id);

    if (requestIds.length > 0) {
      const delHist = await db.requestStatusHistory.deleteMany({ where: { requestId: { in: requestIds } } });
      const delAssign = await db.requestAssignment.deleteMany({ where: { requestId: { in: requestIds } } });
      const delAttach = await db.requestAttachment.deleteMany({ where: { requestId: { in: requestIds } } });
      const delNotes = await db.internalNote.deleteMany({ where: { requestId: { in: requestIds } } });
      const delAIInteract = await db.aIInteraction.deleteMany({ where: { requestId: { in: requestIds } } });
      const delAIWorkflows = await db.aIWorkflowRun.deleteMany({ where: { requestId: { in: requestIds } } });
      const delAIRec = await db.aIRecommendation.deleteMany({ where: { requestId: { in: requestIds } } });
      const delSLA = await db.sLARecord.deleteMany({ where: { requestId: { in: requestIds } } });
      totalDeletedDependents +=
        delHist.count +
        delAssign.count +
        delAttach.count +
        delNotes.count +
        delAIInteract.count +
        delAIWorkflows.count +
        delAIRec.count +
        delSLA.count;
    }

    // 3. Bookings, Payments, Approvals, Feedback
    const bookings = await db.booking.findMany({
      where: { customerId: { in: customerProfileIds } },
      select: { id: true },
    });
    const bookingIds = bookings.map((b) => b.id);
    if (bookingIds.length > 0) {
      const delBkEvents = await db.bookingEvent.deleteMany({ where: { bookingId: { in: bookingIds } } });
      totalDeletedDependents += delBkEvents.count;
    }

    const payments = await db.payment.findMany({
      where: { customerId: { in: customerProfileIds } },
      select: { id: true },
    });
    const paymentIds = payments.map((p) => p.id);
    if (paymentIds.length > 0) {
      const delPayEvents = await db.paymentEvent.deleteMany({ where: { paymentId: { in: paymentIds } } });
      totalDeletedDependents += delPayEvents.count;
    }

    const delPayments = await db.payment.deleteMany({ where: { customerId: { in: customerProfileIds } } });
    const delBookings = await db.booking.deleteMany({ where: { customerId: { in: customerProfileIds } } });
    const delApprovals = await db.approval.deleteMany({ where: { customerId: { in: customerProfileIds } } });
    const delFeedback = await db.feedback.deleteMany({ where: { customerId: { in: customerProfileIds } } });
    const delTasks = await db.task.deleteMany({ where: { customerId: { in: customerProfileIds } } });
    const delReqs = await db.conciergeRequest.deleteMany({ where: { customerId: { in: customerProfileIds } } });
    const delPayProfiles = await db.customerPaymentProfile.deleteMany({ where: { customerId: { in: customerProfileIds } } });
    const delPrefs = await db.customerPreference.deleteMany({ where: { customerId: { in: customerProfileIds } } });
    const delProfiles = await db.customerProfile.deleteMany({ where: { id: { in: customerProfileIds } } });

    totalDeletedDependents +=
      delPayments.count +
      delBookings.count +
      delApprovals.count +
      delFeedback.count +
      delTasks.count +
      delReqs.count +
      delPayProfiles.count +
      delPrefs.count;
  }

  // 4. User-level customer records
  if (customerUserIds.length > 0) {
    const delMessages = await db.requestMessage.deleteMany({ where: { senderId: { in: customerUserIds } } });
    const delNotifications = await db.notification.deleteMany({ where: { userId: { in: customerUserIds } } });
    const delNotifPrefs = await db.notificationPreference.deleteMany({ where: { userId: { in: customerUserIds } } });
    const delSupportTickets = await db.supportTicket.deleteMany({ where: { customerId: { in: customerUserIds } } });
    const delConsent = await db.consentRecord.deleteMany({ where: { userId: { in: customerUserIds } } });
    const delPolicy = await db.policyAcceptance.deleteMany({ where: { userId: { in: customerUserIds } } });
    const delPrivacy = await db.privacyRequest.deleteMany({ where: { userId: { in: customerUserIds } } });
    const delExtTxn = await db.externalTransaction.deleteMany({ where: { userId: { in: customerUserIds } } });
    const delConnInt = await db.connectedIntegration.deleteMany({ where: { userId: { in: customerUserIds } } });
    const delSessions = await db.session.deleteMany({ where: { userId: { in: customerUserIds } } });
    const delEmailVer = await db.emailVerification.deleteMany({ where: { userId: { in: customerUserIds } } });
    const delPwReset = await db.passwordReset.deleteMany({ where: { userId: { in: customerUserIds } } });
    const delAuthKeyReset = await db.authKeyReset.deleteMany({ where: { userId: { in: customerUserIds } } });
    const delPhoneVer = await db.phoneVerification.deleteMany({ where: { userId: { in: customerUserIds } } });
    const delOAuth = await db.oAuthAccount.deleteMany({ where: { userId: { in: customerUserIds } } });
    const delRoles = await db.userRoleAssignment.deleteMany({ where: { userId: { in: customerUserIds } } });

    // Unlink early access conversions
    await db.earlyAccessRegistration.updateMany({
      where: { convertedUserId: { in: customerUserIds } },
      data: { convertedUserId: null, status: 'WAITLISTED' },
    });

    totalDeletedDependents +=
      delMessages.count +
      delNotifications.count +
      delNotifPrefs.count +
      delSupportTickets.count +
      delConsent.count +
      delPolicy.count +
      delPrivacy.count +
      delExtTxn.count +
      delConnInt.count +
      delSessions.count +
      delEmailVer.count +
      delPwReset.count +
      delAuthKeyReset.count +
      delPhoneVer.count +
      delOAuth.count +
      delRoles.count;

    // 5. Finally delete customer User records
    const delUsers = await db.user.deleteMany({ where: { id: { in: customerUserIds } } });

    return {
      deletedCustomerUsers: delUsers.count,
      deletedCustomerProfiles: report.customerProfilesCount,
      deletedDependentRecords: totalDeletedDependents,
      preservedStaffUsers: report.adminFounderConciergeUsersCount,
      message: 'Customer accounts and all dependent records deleted cleanly.',
    };
  }

  return {
    deletedCustomerUsers: 0,
    deletedCustomerProfiles: 0,
    deletedDependentRecords: 0,
    preservedStaffUsers: report.adminFounderConciergeUsersCount,
    message: 'No customer accounts deleted.',
  };
}
