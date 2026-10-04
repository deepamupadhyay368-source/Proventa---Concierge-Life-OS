import { generatePreResetReport, executeSafeCustomerReset } from './customer-reset-service';

async function main() {
  console.log('--- PRE-RESET INSPECTION ---');
  const preReport = await generatePreResetReport();
  console.log('Customer Users to delete:', preReport.customerUsersCount);
  console.log('Customer Profiles to delete:', preReport.customerProfilesCount);
  console.log('Staff Users to preserve:', preReport.adminFounderConciergeUsersCount);
  console.log('Staff Accounts:', preReport.staffUsersList.map(s => `${s.email} (${s.roles.join(', ')})`).join('\n'));

  console.log('\n--- EXECUTING SAFE RESET ---');
  const result = await executeSafeCustomerReset();
  console.log('Reset Result:', JSON.stringify(result, null, 2));

  console.log('\n--- POST-RESET VERIFICATION ---');
  const postReport = await generatePreResetReport();
  console.log('Remaining Customer Users:', postReport.customerUsersCount);
  console.log('Remaining Customer Profiles:', postReport.customerProfilesCount);
  console.log('Remaining Staff Users:', postReport.adminFounderConciergeUsersCount);
}

main().catch(console.error).finally(() => process.exit(0));
