import { generatePreResetReport } from './customer-reset-service';

async function main() {
  const report = await generatePreResetReport();
  console.log('=== PROVENTA PRE-DELETION SAFETY REPORT ===');
  console.log(JSON.stringify(report, null, 2));
}

main().catch(console.error).finally(() => process.exit(0));
