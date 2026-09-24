const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkIndexes() {
  try {
    const indexes = await prisma.$queryRaw`
      SELECT indexname, tablename, indexdef
      FROM pg_indexes
      WHERE tablename IN ('orchestrated_tasks', 'task_events')
      ORDER BY tablename, indexname;
    `;
    console.log('--- PRODUCTION NEON DATABASE INDEXES ---');
    indexes.forEach(idx => console.log(`[${idx.tablename}] ${idx.indexname}: ${idx.indexdef}`));
    await prisma.$disconnect();
  } catch (err) {
    console.error('Error querying pg_indexes:', err);
    process.exit(1);
  }
}
checkIndexes();
