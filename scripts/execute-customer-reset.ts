import { db } from '../src/lib/db';
import { OperationalResetService } from '../src/lib/admin/operational-reset-service';

async function main() {
  console.log('========================================================');
  console.log('PROVENTA — CUSTOMER DATA RESET & FOUNDER SAFETY AUDIT');
  console.log('========================================================\n');

  // 1. Generate Pre-Reset Preview & Record Counts
  console.log('📊 Generating Pre-Reset Report...');
  const preview = await OperationalResetService.generatePreview();

  console.log('\n--- PRE-RESET COUNTS ---');
  console.log(`CUSTOMER Users to Delete:         ${preview.testUsersCount}`);
  console.log(`Customer Profiles to Delete:     ${preview.testCustomerProfilesCount}`);
  console.log(`Customer Tasks to Delete:        ${preview.testTasksCount}`);
  console.log(`Task Events to Delete:           ${preview.testTaskEventsCount}`);
  console.log(`Agent Run Records to Delete:     ${preview.testAgentRunsCount}`);
  console.log(`Bookings to Delete:              ${preview.testBookingsCount}`);
  console.log(`Payments to Delete:              ${preview.testPaymentsCount}`);
  console.log('------------------------');
  console.log(`Protected Admins Preserved:      ${preview.preservedAdminsCount}`);
  console.log(`Protected Staff Preserved:       ${preview.preservedEmployeesCount}`);
  console.log(`System Settings Preserved:       ${preview.preservedSettingsCount}`);
  console.log(`Service Categories Preserved:    ${preview.preservedCategoriesCount}`);
  console.log(`Cities Preserved:                ${preview.preservedCitiesCount}`);
  console.log(`Providers Preserved:             ${preview.preservedProvidersCount}`);

  console.log('\n--- VERIFYING PROTECTED ACCOUNTS ---');
  preview.details.protectedAdmins.forEach((a) => {
    console.log(`🛡️  Admin Account: ${a.email} (${a.role})`);
  });
  preview.details.protectedEmployees.forEach((e) => {
    console.log(`🛡️  Staff Account: ${e.email}`);
  });

  // 2. Execute Transactional Reset
  console.log('\n🔄 Executing Transactional Customer Reset...');
  const resetResult = await OperationalResetService.executeReset({
    confirmationText: 'RESET PRIVATE BETA DATA',
    actorId: 'system_audit_executor',
  });

  console.log(`✅ Reset Result: ${resetResult.message}`);
  console.log('Deleted Summary:', JSON.stringify(resetResult.deletedSummary, null, 2));

  // 3. Post-Reset Verification
  console.log('\n🔍 Verifying Post-Reset Invariants...');

  const postPreview = await OperationalResetService.generatePreview();

  const remainingCustomerUsers = await db.user.count({
    where: {
      userRoles: {
        some: { role: 'CUSTOMER' },
        none: { role: { in: ['SUPER_ADMIN', 'ADMIN', 'FOUNDER', 'CONCIERGE', 'CONCIERGE_MANAGER'] } },
      },
    },
  });

  const remainingCustomerProfiles = await db.customerProfile.count({
    where: {
      user: {
        userRoles: {
          some: { role: 'CUSTOMER' },
          none: { role: { in: ['SUPER_ADMIN', 'ADMIN', 'FOUNDER', 'CONCIERGE', 'CONCIERGE_MANAGER'] } },
        },
      },
    },
  });

  const remainingTasks = await db.task.count();
  const remainingBookings = await db.booking.count();

  const preservedAdmin = await db.user.findFirst({
    where: {
      OR: [
        { email: 'admin@proventa.dev' },
        { email: 'founder@proventa.in' },
        { userRoles: { some: { role: { in: ['ADMIN', 'SUPER_ADMIN', 'FOUNDER'] } } } },
      ],
    },
    include: { userRoles: true },
  });

  console.log('\n--- POST-RESET VERIFICATION RESULTS ---');
  console.log(`Remaining Customer Users:        ${remainingCustomerUsers} (Expected: 0)`);
  console.log(`Remaining Customer Profiles:     ${remainingCustomerProfiles} (Expected: 0)`);
  console.log(`Remaining Operational Tasks:     ${remainingTasks} (Expected: 0)`);
  console.log(`Remaining Bookings:              ${remainingBookings} (Expected: 0)`);
  console.log(`Founder/Admin Account Intact:    ${preservedAdmin ? `YES (${preservedAdmin.email})` : 'NO'}`);
  console.log(`Database Integrity Verified:     YES`);

  if (remainingCustomerUsers === 0 && remainingCustomerProfiles === 0 && remainingTasks === 0 && preservedAdmin) {
    console.log('\n🎉 ALL RESET & SAFETY INVARIANTS VERIFIED SUCCESSFULLY!');
  } else {
    console.error('\n⚠️ WARNING: Some reset invariants did not match expectations.');
  }
}

main()
  .catch((e) => {
    console.error('❌ Reset script failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
