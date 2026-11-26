import { db } from '../src/lib/db';

async function runForensicAudit() {
  console.log('=== PROVENTA PHASE 6.5 FORENSIC READ-ONLY AUDIT ===');
  console.log(`Execution Timestamp: ${new Date().toISOString()}`);

  // 1. Projects Audit
  const totalProjects = await db.project.count();
  console.log(`\n1. TOTAL PROJECTS IN DATABASE: ${totalProjects}`);

  const projects = await db.project.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      reraNumber: true,
      publicationStatus: true,
      isPubliclyVisible: true,
      canonicalProjectId: true,
      locality: { select: { slug: true, name: true } },
    },
    orderBy: { name: 'asc' },
  });

  const byStatus: Record<string, number> = {};
  projects.forEach((p) => {
    byStatus[p.publicationStatus] = (byStatus[p.publicationStatus] || 0) + 1;
    console.log(
      ` - [${p.publicationStatus}] "${p.name}" (${p.slug}) | Visible: ${p.isPubliclyVisible} | Canonical: ${p.canonicalProjectId || 'NONE'} | Locality: ${p.locality?.name} | RERA: ${p.reraNumber || 'NONE'}`
    );
  });
  console.log('\nProject Breakdown by Publication Status:', byStatus);

  // 2. Transactions Audit
  const totalTransactions = await db.propertyTransaction.count();
  console.log(`\n2. TOTAL TRANSACTIONS IN DATABASE: ${totalTransactions}`);

  const transactions = await db.propertyTransaction.findMany({
    select: {
      id: true,
      deedId: true,
      verificationStatus: true,
      confidenceScore: true,
      rejectionReason: true,
      transactedPriceLakhs: true,
      pricePerSqFtCarpet: true,
      carpetAreaSqFt: true,
      registrationDate: true,
      project: { select: { name: true, publicationStatus: true } },
      locality: { select: { name: true, slug: true } },
    },
    orderBy: { registrationDate: 'asc' },
  });

  const txByStatus: Record<string, number> = {};
  transactions.forEach((tx) => {
    txByStatus[tx.verificationStatus] = (txByStatus[tx.verificationStatus] || 0) + 1;
    console.log(
      ` - [${tx.verificationStatus}] Deed: ${tx.deedId} | Rate: ₹${tx.pricePerSqFtCarpet}/sq.ft | Price: ₹${tx.transactedPriceLakhs}L | Score: ${tx.confidenceScore} | Proj: "${tx.project?.name || 'N/A'}" (${tx.project?.publicationStatus || 'N/A'}) | Loc: ${tx.locality?.name} | Reason: ${tx.rejectionReason || 'NONE'}`
    );
  });
  console.log('\nTransaction Breakdown by Verification Status:', txByStatus);

  // 3. Evidence Audit Logs
  const auditLogsCount = await db.evidenceAuditLog.count();
  console.log(`\n3. TOTAL EVIDENCE AUDIT LOGS: ${auditLogsCount}`);
  const recentLogs = await db.evidenceAuditLog.findMany({
    take: 15,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      action: true,
      entityType: true,
      entityId: true,
      performedByUserId: true,
      createdAt: true,
      reason: true,
      changeSummary: true,
    },
  });
  recentLogs.forEach((log) => {
    console.log(
      ` - [${log.action}] ${log.entityType} ${log.entityId} by ${log.performedByUserId} at ${log.createdAt.toISOString()} | Reason: ${log.reason}`
    );
  });

  // 4. Locality Audit
  const localities = await db.locality.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      valuationEligibility: true,
      valuationReady: true,
      transactions: {
        where: { verificationStatus: 'VERIFIED' },
        select: { id: true },
      },
      projects: {
        where: { publicationStatus: 'PUBLISHED' },
        select: { id: true },
      },
    },
    orderBy: { name: 'asc' },
  });
  console.log('\n4. LOCALITY COVERAGE & ELIGIBILITY:');
  localities.forEach((l) => {
    console.log(
      ` - "${l.name}" (${l.slug}): Verified Comps: ${l.transactions.length} | Published Projects: ${l.projects.length} | Eligibility: ${l.valuationEligibility} | Valuation Ready: ${l.valuationReady}`
    );
  });

  // 5. Valuation Requests, Valuations & Reports
  const requestCount = await db.valuationRequest.count();
  const valCount = await db.valuation.count();
  const reportCount = await db.valuationReport.count();
  console.log(`\n5. VALUATIONS IN DB: Requests: ${requestCount}, Valuations: ${valCount}, Reports: ${reportCount}`);
}

runForensicAudit()
  .catch((err) => {
    console.error('Forensic audit failed:', err);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
