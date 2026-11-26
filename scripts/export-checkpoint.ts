import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('--- EXPORTING PRE-REMEDIATION CHECKPOINT ---');
  
  const projects = await prisma.project.findMany({
    include: {
      locality: true,
      developerRelation: true,
      configurations: true,
      specifications: true,
      amenities: true,
      sourceDocuments: true,
      constructionProgress: true,
      regulatoryEvents: true,
      historicalSnapshots: true,
      transactions: true,
      listings: true,
      jantriBenchmarks: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  const developers = await prisma.developer.findMany();
  const localities = await prisma.locality.findMany();
  const transactions = await prisma.propertyTransaction.findMany();
  const listings = await prisma.propertyListing.findMany();
  const jantri = await prisma.jantriBenchmark.findMany();

  const checkpointData = {
    metadata: {
      exportedAt: new Date().toISOString(),
      platform: 'PROVENTA Real Estate Intelligence',
      checkpointCommit: 'fb25b10',
      reason: 'Phase 3.1 Controlled Data Remediation & Statutory Reconciliation Checkpoint',
      totalProjects: projects.length,
      totalDevelopers: developers.length,
      totalLocalities: localities.length,
      totalTransactions: transactions.length,
      totalListings: listings.length,
      totalJantri: jantri.length,
    },
    projects,
    developers,
    localities,
    transactions,
    listings,
    jantri,
  };

  const outputPath = path.join(process.cwd(), 'prisma', 'pre-remediation-checkpoint.json');
  fs.writeFileSync(outputPath, JSON.stringify(checkpointData, null, 2), 'utf-8');

  // Also save a copy in the artifact/scratch directory
  const brainBackupPath = 'C:\\Users\\Deepam\\.gemini\\antigravity\\brain\\9928c1ae-39b0-4b96-989d-47b9d0899372\\scratch\\pre-remediation-checkpoint.json';
  fs.writeFileSync(brainBackupPath, JSON.stringify(checkpointData, null, 2), 'utf-8');

  console.log(`Successfully exported pre-remediation checkpoint with ${projects.length} projects to:`);
  console.log(`- ${outputPath}`);
  console.log(`- ${brainBackupPath}`);
  
  for (const p of projects) {
    console.log(`[${p.id}] ${p.name} (${p.locality?.name}) - RERA: ${p.reraNumber || 'NONE'} | Status: ${p.verificationBadge} | Configs: ${p.configurations.length}`);
  }
}

main()
  .catch((e) => {
    console.error('Export failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
