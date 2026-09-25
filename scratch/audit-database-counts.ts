import { db } from '../src/lib/db';

async function auditData() {
  console.log('Auditing database records...\n');

  try {
    const [
      users,
      userRoles,
      sessions,
      customerProfiles,
      conciergeAgents,
      tasks,
      taskEvents,
      agentRuns,
      bookings,
      payments,
      earlyAccessRegistrations,
      invitations,
      auditLogs,
      securityEvents,
      notifications,
      providers,
      cities,
      categories,
    ] = await Promise.all([
      db.user.count(),
      db.userRoleAssignment.count(),
      db.session.count(),
      db.customerProfile.count(),
      db.conciergeAgent.count(),
      db.task.count(),
      db.taskEvent.count(),
      db.agentRunRecord.count(),
      db.booking.count(),
      db.payment.count(),
      db.earlyAccessRegistration.count(),
      db.invitation.count(),
      db.auditLog.count(),
      db.securityEvent.count(),
      db.notification.count(),
      db.provider.count(),
      db.city.count(),
      db.serviceCategory.count(),
    ]);

    console.log('--- DATABASE RECORD COUNTS ---');
    console.log(`Users: ${users}`);
    console.log(`UserRoleAssignments: ${userRoles}`);
    console.log(`Sessions: ${sessions}`);
    console.log(`CustomerProfiles: ${customerProfiles}`);
    console.log(`ConciergeAgents: ${conciergeAgents}`);
    console.log(`Tasks: ${tasks}`);
    console.log(`TaskEvents: ${taskEvents}`);
    console.log(`AgentRuns: ${agentRuns}`);
    console.log(`Bookings: ${bookings}`);
    console.log(`Payments: ${payments}`);
    console.log(`EarlyAccessRegistrations: ${earlyAccessRegistrations}`);
    console.log(`Invitations: ${invitations}`);
    console.log(`AuditLogs: ${auditLogs}`);
    console.log(`SecurityEvents: ${securityEvents}`);
    console.log(`Notifications: ${notifications}`);
    console.log(`Providers: ${providers}`);
    console.log(`Cities: ${cities}`);
    console.log(`ServiceCategories: ${categories}`);

    // Inspect user roles & accounts
    const allUsers = await db.user.findMany({
      include: { userRoles: true, conciergeAgent: true, customerProfile: true },
    });

    console.log('\n--- EXISTING USERS ---');
    for (const u of allUsers) {
      console.log(`- [${u.id}] ${u.email} (${u.name || 'No Name'}) | Status: ${u.status} | Roles: ${u.userRoles.map(r => r.role).join(', ')}`);
    }

    // Inspect tasks
    const allTasks = await db.task.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      select: { id: true, publicId: true, intent: true, status: true, executionMethod: true, createdAt: true },
    });

    console.log(`\n--- RECENT TASKS (Total: ${tasks}) ---`);
    for (const t of allTasks) {
      console.log(`- [${t.id}] ${t.publicId} | Status: ${t.status} | Method: ${t.executionMethod} | Intent: ${t.intent.slice(0, 40)}`);
    }
  } catch (err) {
    console.error('Audit query error:', err);
  } finally {
    await db.$disconnect();
  }
}

auditData();
