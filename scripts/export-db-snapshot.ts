import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

async function main() {
  const prisma = new PrismaClient();
  const backupDir = path.resolve(process.cwd(), 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(backupDir, `proventa_db_export_${timestamp}.json`);
  const checksumFile = path.join(backupDir, `proventa_db_export_${timestamp}.sha256`);

  console.log(`[Database Export] Initiating database snapshot to ${backupFile}...`);

  const snapshot: Record<string, any> = {
    exportTimestamp: new Date().toISOString(),
    schemaVersion: '2026-production-main',
    models: {},
  };

  try {
    // Attempt export of core entities
    const modelsToExport = [
      'user',
      'conciergeTask',
      'auditLog',
      'serviceProvider',
      'rateLimitRecord',
      'emergencyVaultEntry',
      'document',
    ];

    for (const model of modelsToExport) {
      if ((prisma as any)[model] && typeof (prisma as any)[model].findMany === 'function') {
        try {
          const records = await (prisma as any)[model].findMany();
          snapshot.models[model] = records;
          console.log(`[Export] Successfully exported ${records.length} records from ${model}.`);
        } catch (err: any) {
          console.warn(`[Export] Note: Could not query model ${model}: ${err.message}`);
          snapshot.models[model] = { error: err.message };
        }
      }
    }

    const serialized = JSON.stringify(snapshot, null, 2);
    fs.writeFileSync(backupFile, serialized, 'utf-8');
    const hash = crypto.createHash('sha256').update(serialized).digest('hex');
    fs.writeFileSync(checksumFile, hash, 'utf-8');

    console.log(`[Database Export] Snapshot completed successfully!`);
    console.log(`[Database Export] Backup file: ${backupFile}`);
    console.log(`[Database Export] SHA-256 Checksum: ${hash}`);
  } catch (error: any) {
    console.error(`[Database Export] Export failed:`, error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
