const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

(async () => {
  try {
    // 1. Verify existing data is intact
    const users = await db.user.count();
    const audit = await db.auditLog.count();
    console.log('=== DATA INTEGRITY CHECK ===');
    console.log('Users:', users);
    console.log('AuditLogs:', audit);

    // 2. List all tables including new Payment Intelligence ones
    const tables = await db.$queryRawUnsafe(
      "SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename"
    );
    console.log('\n=== ALL TABLES (' + tables.length + ') ===');
    tables.forEach(t => console.log('  ' + t.tablename));

    // 3. Check Payment Intelligence tables specifically
    const piTables = [
      'commercial_invoices', 'payment_ledger_entries', 'payment_schedule_instalments',
      'payment_verification_records', 'payment_disputes', 'payment_scores',
      'payment_score_snapshots', 'payment_audit_logs', 'payment_reminders', 'payment_consents',
      'procurement_rfqs', 'procurement_quotations', 'procurement_orders',
      'supplier_warehouses', 'supplier_service_areas', 'supplier_performances',
      'saved_suppliers', 'supplier_rfq_matches'
    ];

    console.log('\n=== PAYMENT INTELLIGENCE MIGRATION CHECK ===');
    let allFound = true;
    for (const tbl of piTables) {
      const exists = tables.some(t => t.tablename === tbl);
      console.log(`  ${exists ? '✓' : '✗'} ${tbl}`);
      if (!exists) allFound = false;
    }
    console.log(allFound ? '\nAll 18 Payment Intelligence tables: VERIFIED ✓' : '\nSome tables missing ✗');

    // 4. Verify migrations table
    const migrations = await db.$queryRawUnsafe(
      "SELECT migration_name, finished_at FROM _prisma_migrations ORDER BY finished_at DESC LIMIT 5"
    );
    console.log('\n=== RECENT MIGRATIONS ===');
    migrations.forEach(m => console.log(`  ${m.migration_name} (${m.finished_at})`));

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await db.$disconnect();
  }
})();
