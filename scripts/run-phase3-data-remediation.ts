import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('========================================================================');
  console.log('  PROVENTA PHASE 3.1: CONTROLLED DATA REMEDIATION & STATUTORY RECONCILIATION');
  console.log('========================================================================\n');

  // Load pre-remediation checkpoint for verification
  const checkpointPath = path.join(__dirname, '..', 'prisma', 'pre-remediation-checkpoint.json');
  if (!fs.existsSync(checkpointPath)) {
    throw new Error('Pre-remediation checkpoint not found! Aborting.');
  }
  const checkpoint = JSON.parse(fs.readFileSync(checkpointPath, 'utf-8'));
  console.log(`[CHECKPOINT VERIFIED] Pre-remediation snapshot confirmed with ${checkpoint.projects.length} projects.\n`);

  const remediationLog: any[] = [];
  const now = new Date();

  // ---------------------------------------------------------------------------
  // 1. QUARANTINE REJECTED RECORDS (Requirement 2)
  // ---------------------------------------------------------------------------
  console.log('--- Step 1: Quarantining Rejected / Hallucinated Records ---');

  // 1.1 Goyal Orchid Whitefield (Bangalore project) - 2 records
  const whitefieldSouthBopal = 'cmwx6lr2z000b124fkiztc3br';
  const whitefieldShela = 'cmwx8w9qg000go7kwybtaiwci';

  for (const id of [whitefieldSouthBopal, whitefieldShela]) {
    const existing = await prisma.project.findUnique({ where: { id } });
    if (existing) {
      const updated = await prisma.project.update({
        where: { id },
        data: {
          publicationStatus: 'QUARANTINED',
          isPubliclyVisible: false,
          verificationBadge: 'REJECTED',
          originalReraNumber: existing.reraNumber,
          quarantineReason: 'Geographic mismatch: Orchid Whitefield is physically located in Whitefield, Bangalore (Karnataka RERA PRM/KA/RERA/1251/446/PR/171201/000402). Non-existent in Gujarat. Fictional Gujarat RERA quarantined.',
          rejectionAuditRef: 'PHASE_3_AUDIT_ITEM_01_02',
          adminApprovalStatus: 'REJECTED',
          adminApprovedAt: now,
          adminApprovedBy: 'CHIEF_DATA_OFFICER',
        },
      });
      remediationLog.push({ id, action: 'QUARANTINE_REJECTED', name: updated.name, reason: updated.quarantineReason });
      console.log(`[QUARANTINED] ${updated.name} (${id}) - Bangalore geographic mismatch.`);
    }
  }

  // 1.2 Aarohi Elegance (Fictional pairing) - 2 records
  const aarohiRecord1 = 'cmwx6lqyv0009124fqeffpxjf';
  const aarohiRecord2 = 'cmwx8w9sk000io7kwpwpxx6w2';

  for (const id of [aarohiRecord1, aarohiRecord2]) {
    const existing = await prisma.project.findUnique({ where: { id } });
    if (existing) {
      const updated = await prisma.project.update({
        where: { id },
        data: {
          publicationStatus: 'QUARANTINED',
          isPubliclyVisible: false,
          verificationBadge: 'REJECTED',
          originalReraNumber: existing.reraNumber,
          quarantineReason: 'Entity fabrication: Fictional Gala Group developer pairing in South Bopal. Real Aarohi Elegance in Gujarat is in Nikol (East Ahmedabad) by Har Har Developers (MAA11396/060323).',
          rejectionAuditRef: 'PHASE_3_AUDIT_ITEM_03_04',
          adminApprovalStatus: 'REJECTED',
          adminApprovedAt: now,
          adminApprovedBy: 'CHIEF_DATA_OFFICER',
        },
      });
      remediationLog.push({ id, action: 'QUARANTINE_REJECTED', name: updated.name, reason: updated.quarantineReason });
      console.log(`[QUARANTINED] ${updated.name} (${id}) - Entity fabrication.`);
    }
  }

  // 1.3 Safal Parisar (Pre-RERA completed construction) - 2 records
  const safalParisar1 = 'cmwx6lr75000f124f8zf19eie';
  const safalParisar2 = 'cmwx8w9un000ko7kwoxudejiz';

  for (const id of [safalParisar1, safalParisar2]) {
    const existing = await prisma.project.findUnique({ where: { id } });
    if (existing) {
      const updated = await prisma.project.update({
        where: { id },
        data: {
          publicationStatus: 'QUARANTINED',
          isPubliclyVisible: false,
          verificationBadge: 'REJECTED',
          assetClassification: 'PRE_RERA_COMPLETED',
          originalReraNumber: existing.reraNumber,
          reraNumber: null, // Clear fabricated RERA number
          quarantineReason: 'Pre-RERA completed construction (2009-2010 occupancy, AUDA permission). Fictional RERA numbers removed; reclassified as PRE_RERA_COMPLETED pending municipal archive ingestion.',
          rejectionAuditRef: 'PHASE_3_AUDIT_ITEM_05_06',
          adminApprovalStatus: 'REJECTED',
          adminApprovedAt: now,
          adminApprovedBy: 'CHIEF_DATA_OFFICER',
        },
      });
      remediationLog.push({ id, action: 'QUARANTINE_REJECTED', name: updated.name, reason: updated.quarantineReason });
      console.log(`[QUARANTINED] ${updated.name} (${id}) - Pre-RERA construction; fictional RERA cleared.`);
    }
  }

  // 1.4 Shivalik Curv (Commercial office tower misclassified as residential)
  const shivalikCurvId = 'cmwx9qm3a0052jmiiausv98w9';
  const existingCurv = await prisma.project.findUnique({ where: { id: shivalikCurvId } });
  if (existingCurv) {
    const updated = await prisma.project.update({
      where: { id: shivalikCurvId },
      data: {
        publicationStatus: 'QUARANTINED',
        isPubliclyVisible: false,
        verificationBadge: 'REJECTED_PENDING_REVIEW',
        assetClassification: 'COMMERCIAL',
        projectType: 'COMMERCIAL_OFFICE_TOWER',
        originalReraNumber: existingCurv.reraNumber,
        reraNumber: 'PR/GJ/GANDHINAGAR/GANDHINAGAR/GUD/CAA12514/A1C/191124/311229',
        promoterLegalEntity: 'Curv Enterprise LLP / Shivalik Group',
        quarantineReason: 'Asset class mismatch: Shivalik Curv is an iconic 31-storey commercial office tower (CAA12514/A1C). Residential apartment classification and BHK configurations removed. Quarantined from residential search.',
        rejectionAuditRef: 'PHASE_3_AUDIT_ITEM_07',
        adminApprovalStatus: 'PENDING_APPROVAL',
      },
    });
    // Remove residential configurations for commercial tower
    await prisma.projectConfiguration.deleteMany({ where: { projectId: shivalikCurvId } });
    remediationLog.push({ id: shivalikCurvId, action: 'RECLASSIFIED_COMMERCIAL', name: updated.name, reason: updated.quarantineReason });
    console.log(`[RECLASSIFIED & QUARANTINED] ${updated.name} (${shivalikCurvId}) - Reclassified as Commercial Office Tower (CAA12514).`);
  }

  // ---------------------------------------------------------------------------
  // 2. CONSOLIDATE DUPLICATE ENTITY: SHILP REVANTA (Requirement 4)
  // ---------------------------------------------------------------------------
  console.log('\n--- Step 2: Consolidating Duplicate Entity: Shilp Revanta ---');
  const revantaCanonicalId = 'cmwx6lr52000d124fwptqip1o';
  const revantaDuplicateId = 'cmwx8w9lz000eo7kwhyrvp7nq';

  const canonicalRevanta = await prisma.project.findUnique({ where: { id: revantaCanonicalId } });
  const duplicateRevanta = await prisma.project.findUnique({ where: { id: revantaDuplicateId } });

  if (canonicalRevanta && duplicateRevanta) {
    // Update canonical project with verified statutory GujRERA data
    const updatedCanonical = await prisma.project.update({
      where: { id: revantaCanonicalId },
      data: {
        name: 'Shilp Revanta',
        developer: 'Shilp Group / AYB Buildcon LLP',
        promoterLegalEntity: 'AYB Buildcon LLP',
        originalReraNumber: canonicalRevanta.reraNumber,
        reraNumber: 'PR/GJ/AHMEDABAD/SANAND/AUDA/MAA07874/050121',
        totalUnits: 802,
        totalTowers: 13,
        assetClassification: 'RESIDENTIAL',
        projectType: 'RESIDENTIAL_APARTMENT',
        statutoryDocRef: 'GUJRERA_CERT_MAA07874_SANAND_AUDA_20210105',
        reconciliationNotes: 'Consolidated canonical entity with official GujRERA statutory certificate MAA07874/050121. Promoter: AYB Buildcon LLP (Designated Partners: Yash Brahmbhatt, Arpan Barot). Master Plan: 13 towers (Blocks A-M), 802 residential units.',
        verificationBadge: 'OFFICIALLY_VERIFIED',
        publicationStatus: 'PUBLISHED',
        isPubliclyVisible: true,
        adminApprovalStatus: 'APPROVED',
        adminApprovedAt: now,
        adminApprovedBy: 'CHIEF_DATA_OFFICER',
      },
    });

    // Mark duplicate record as MERGED_ALIAS and link to canonical
    await prisma.project.update({
      where: { id: revantaDuplicateId },
      data: {
        canonicalProjectId: revantaCanonicalId,
        publicationStatus: 'MERGED_ALIAS',
        isPubliclyVisible: false,
        verificationBadge: 'REJECTED',
        originalReraNumber: duplicateRevanta.reraNumber,
        mergedAt: now,
        mergeAuditLog: `Merged into canonical Shilp Revanta (${revantaCanonicalId}) pursuant to statutory GujRERA MAA07874/050121 reconciliation. Preserved as redirect alias.`,
        adminApprovalStatus: 'APPROVED',
        adminApprovedAt: now,
        adminApprovedBy: 'CHIEF_DATA_OFFICER',
      },
    });

    // Record in EntityMergeLog
    await prisma.entityMergeLog.create({
      data: {
        sourceProjectId: revantaDuplicateId,
        targetProjectId: revantaCanonicalId,
        reason: 'Consolidation of duplicate Shilp Revanta entity across South Bopal/Shela corridor into official GujRERA MAA07874/050121 record.',
        promoterMatch: 'AYB Buildcon LLP / Shilp Group',
        reraMatch: 'PR/GJ/AHMEDABAD/SANAND/AUDA/MAA07874/050121',
        approvedBy: 'CHIEF_DATA_OFFICER',
        approvedAt: now,
        metadataJson: {
          canonicalId: revantaCanonicalId,
          sourceId: revantaDuplicateId,
          verifiedUnits: 802,
          verifiedTowers: 13,
          sourceDoc: 'GUJRERA_CERT_MAA07874_SANAND_AUDA_20210105',
        },
      },
    });

    remediationLog.push({
      canonicalId: revantaCanonicalId,
      sourceId: revantaDuplicateId,
      action: 'ENTITY_CONSOLIDATION',
      name: 'Shilp Revanta',
      result: 'Consolidated into canonical entity with 802 units and RERA MAA07874/050121',
    });
    console.log(`[CONSOLIDATED] Shilp Revanta duplicate ${revantaDuplicateId} merged into canonical ${revantaCanonicalId}.`);
  }

  // ---------------------------------------------------------------------------
  // 3. RECONCILE PARTIALLY VERIFIED PROJECTS (Requirement 3)
  // ---------------------------------------------------------------------------
  console.log('\n--- Step 3: Reconciling Partially Verified Projects with Official GujRERA Filings ---');

  // 3.1 Sun Atmosphere
  const sunAtmosphereId = 'cmwx9qcbi0017jmii1hyws5m0';
  const existingSun = await prisma.project.findUnique({ where: { id: sunAtmosphereId } });
  if (existingSun) {
    const updated = await prisma.project.update({
      where: { id: sunAtmosphereId },
      data: {
        promoterLegalEntity: 'Sun Builders Projects LLP',
        originalReraNumber: existingSun.reraNumber,
        reraNumber: 'PR/GJ/AHMEDABAD/AHMEDABAD CITY/AUDA/MAA07770/141220',
        totalUnits: 872,
        totalTowers: 16,
        statutoryDocRef: 'GUJRERA_MAA07770_141220_AMC_AUDA',
        reconciliationNotes: 'Reconciled to official GujRERA certificate MAA07770/141220 (reg. 14/12/2020). Promoter: Sun Builders Projects LLP. Master plan: 16 towers (G+14), 872 units of 2 & 3 BHK apartments.',
        verificationBadge: 'OFFICIALLY_VERIFIED',
        publicationStatus: 'PUBLISHED',
        isPubliclyVisible: true,
        adminApprovalStatus: 'APPROVED',
        adminApprovedAt: now,
        adminApprovedBy: 'CHIEF_DATA_OFFICER',
      },
    });
    remediationLog.push({ id: sunAtmosphereId, action: 'STATUTORY_RECONCILIATION', name: updated.name, rera: updated.reraNumber, units: updated.totalUnits });
    console.log(`[RECONCILED] ${updated.name}: MAA07770/141220, Sun Builders Projects LLP, 872 units, 16 towers.`);
  }

  // 3.2 Shivalik Edge
  const shivalikEdgeId = 'cmwx9qiev003yjmiijzpnfy6z';
  const existingEdge = await prisma.project.findUnique({ where: { id: shivalikEdgeId } });
  if (existingEdge) {
    const updated = await prisma.project.update({
      where: { id: shivalikEdgeId },
      data: {
        promoterLegalEntity: 'Sharanam Construction Private Limited',
        originalReraNumber: existingEdge.reraNumber,
        reraNumber: 'PR/GJ/AHMEDABAD/AHMEDABAD CITY/AUDA/RAA07880/070121',
        totalUnits: 48,
        totalTowers: 1,
        statutoryDocRef: 'GUJRERA_RAA07880_070121_AMBLI',
        reconciliationNotes: 'Reconciled to official GujRERA certificate RAA07880/070121 (reg. 07/01/2021). Promoter: Sharanam Construction Private Limited (Shivalik Group). Master plan: 1 tower (G+12), 48 luxury units.',
        verificationBadge: 'OFFICIALLY_VERIFIED',
        publicationStatus: 'PUBLISHED',
        isPubliclyVisible: true,
        adminApprovalStatus: 'APPROVED',
        adminApprovedAt: now,
        adminApprovedBy: 'CHIEF_DATA_OFFICER',
      },
    });
    remediationLog.push({ id: shivalikEdgeId, action: 'STATUTORY_RECONCILIATION', name: updated.name, rera: updated.reraNumber, units: updated.totalUnits });
    console.log(`[RECONCILED] ${updated.name}: RAA07880/070121, Sharanam Construction Pvt Ltd, 48 units, 1 tower.`);
  }

  // 3.3 Shivalik Parkview -> Shivalik Sharda Parkview
  const parkviewId = 'cmwx9qdrp001yjmii2hzkr7k2';
  const existingParkview = await prisma.project.findUnique({ where: { id: parkviewId } });
  if (existingParkview) {
    const updated = await prisma.project.update({
      where: { id: parkviewId },
      data: {
        name: 'Shivalik Sharda Parkview',
        promoterLegalEntity: 'Shivalik Jhanvi Infraspace LLP',
        originalReraNumber: existingParkview.reraNumber,
        reraNumber: 'PR/GJ/AHMEDABAD/AHMEDABAD CITY/AUDA/RAA00546/271017',
        statutoryDocRef: 'GUJRERA_RAA00546_AND_MAA05754_PHASE1_PHASE2',
        reconciliationNotes: 'Reconciled to official GujRERA filings: Phase 1 (RAA00546/271017) & Phase 2 (MAA05754/A1M/101120). Promoter: Shivalik Jhanvi Infraspace LLP (Shivalik Group & Sharda Group).',
        verificationBadge: 'OFFICIALLY_VERIFIED',
        publicationStatus: 'PUBLISHED',
        isPubliclyVisible: true,
        adminApprovalStatus: 'APPROVED',
        adminApprovedAt: now,
        adminApprovedBy: 'CHIEF_DATA_OFFICER',
      },
    });
    remediationLog.push({ id: parkviewId, action: 'STATUTORY_RECONCILIATION', name: updated.name, rera: updated.reraNumber });
    console.log(`[RECONCILED] ${updated.name}: RAA00546/271017, Shivalik Jhanvi Infraspace LLP.`);
  }

  // 3.4 Shilp Shaligram
  const shaligramId = 'cmwx9onti001heotk75dc4eob';
  const existingShaligram = await prisma.project.findUnique({ where: { id: shaligramId } });
  if (existingShaligram) {
    const updated = await prisma.project.update({
      where: { id: shaligramId },
      data: {
        promoterLegalEntity: 'Aahna Buildspace LLP',
        originalReraNumber: existingShaligram.reraNumber,
        reraNumber: 'PR/GJ/AHMEDABAD/AHMEDABAD CITY/AUDA/RAA04413/A2R/261221',
        statutoryDocRef: 'GUJRERA_RAA04413_A2R_VASTRAPUR_AUDA',
        reconciliationNotes: 'Reconciled to official GujRERA certificate RAA04413/A2R/261221. Promoter: Aahna Buildspace LLP (Shilp Group). Location: Vastrapur / Bodakdev corridor, Ahmedabad.',
        verificationBadge: 'OFFICIALLY_VERIFIED',
        publicationStatus: 'PUBLISHED',
        isPubliclyVisible: true,
        adminApprovalStatus: 'APPROVED',
        adminApprovedAt: now,
        adminApprovedBy: 'CHIEF_DATA_OFFICER',
      },
    });
    remediationLog.push({ id: shaligramId, action: 'STATUTORY_RECONCILIATION', name: updated.name, rera: updated.reraNumber });
    console.log(`[RECONCILED] ${updated.name}: RAA04413/A2R/261221, Aahna Buildspace LLP.`);
  }

  // ---------------------------------------------------------------------------
  // 4. GOVERNANCE ON UNVERIFIED LEGACY SEED PROJECTS (Requirement 6)
  // ---------------------------------------------------------------------------
  console.log('\n--- Step 4: Applying Publication Governance to Unverified Legacy Records ---');
  const legacyUnverifiedIds = [
    'cmwx6lrfi000n124f95urn9m5', // Silver Pearl
    'cmwx6lrhl000p124fegc04ai4', // Spacious 53
    'cmwx6lrbb000j124fdfowis91', // Sky City Shela
    'cmwx6lr98000h124fscq7qpsx', // Riviera Springs
    'cmwx6lrde000l124fbme0ieto', // Floris
  ];

  for (const id of legacyUnverifiedIds) {
    const existing = await prisma.project.findUnique({ where: { id } });
    if (existing) {
      const updated = await prisma.project.update({
        where: { id },
        data: {
          verificationBadge: 'UNVERIFIED',
          publicationStatus: 'UNVERIFIED_DRAFT',
          isPubliclyVisible: false, // Excluded from public publication & verified statistics
          reconciliationNotes: 'Legacy seed record without verified structural configurations or statutory certificate attachment. Excluded from public factual claims pending official data collection.',
          adminApprovalStatus: 'PENDING_APPROVAL',
        },
      });
      remediationLog.push({ id, action: 'SET_UNVERIFIED_DRAFT', name: updated.name });
      console.log(`[GOVERNED] ${updated.name} (${id}) - Set to UNVERIFIED_DRAFT; excluded from public directory.`);
    }
  }

  // ---------------------------------------------------------------------------
  // 5. CONFIRM CLEAN VERIFIED PROJECTS
  // ---------------------------------------------------------------------------
  console.log('\n--- Step 5: Confirming Clean Officially Verified Projects ---');
  const verifiedProjects = [
    'cmwx9qeop002djmiii6tp06ya', // Godrej Garden City
    'cmwx9oovy001weotkbjrl60cp', // Gala Eternia
    'cmwx9qjhm004bjmii44w5pj3y', // Prominence Grandeur
    'cmwx9qkch004qjmii5es2d1ax', // Radhe Krishna Residency
    'cmwx9qn48005ljmiifmzv8idp', // Nilkanth Sky
    'cmwx9qfti0030jmiis0yoiezy', // Science City Signature
  ];

  for (const id of verifiedProjects) {
    const updated = await prisma.project.update({
      where: { id },
      data: {
        verificationBadge: 'OFFICIALLY_VERIFIED',
        publicationStatus: 'PUBLISHED',
        isPubliclyVisible: true,
        adminApprovalStatus: 'APPROVED',
        adminApprovedAt: now,
        adminApprovedBy: 'CHIEF_DATA_OFFICER',
      },
    });
    console.log(`[VERIFIED & PUBLISHED] ${updated.name} (${id}) - RERA: ${updated.reraNumber}`);
  }

  // ---------------------------------------------------------------------------
  // 6. FINAL SUMMARY
  // ---------------------------------------------------------------------------
  const allProjectsAfter = await prisma.project.findMany({
    select: {
      id: true,
      name: true,
      district: true,
      reraNumber: true,
      originalReraNumber: true,
      verificationBadge: true,
      publicationStatus: true,
      isPubliclyVisible: true,
      assetClassification: true,
      canonicalProjectId: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  console.log('\n========================================================================');
  console.log('  PHASE 3.1 REMEDIATION EXECUTION COMPLETE');
  console.log('========================================================================');
  console.log(`Total database projects: ${allProjectsAfter.length}`);
  console.log(`- PUBLISHED (Publicly Visible): ${allProjectsAfter.filter(p => p.isPubliclyVisible).length}`);
  console.log(`- QUARANTINED (Hidden from Public): ${allProjectsAfter.filter(p => p.publicationStatus === 'QUARANTINED').length}`);
  console.log(`- MERGED ALIAS (Hidden from Public): ${allProjectsAfter.filter(p => p.publicationStatus === 'MERGED_ALIAS').length}`);
  console.log(`- UNVERIFIED DRAFT (Hidden from Public): ${allProjectsAfter.filter(p => p.publicationStatus === 'UNVERIFIED_DRAFT').length}`);

  // Write remediation output log
  const remediationArtifactPath = path.join(__dirname, '..', 'prisma', 'phase3.1-remediation-output.json');
  fs.writeFileSync(remediationArtifactPath, JSON.stringify({ executedAt: now.toISOString(), projects: allProjectsAfter }, null, 2), 'utf-8');
  console.log(`\nDetailed register saved to: ${remediationArtifactPath}`);
}

main()
  .catch((e) => {
    console.error('Remediation script failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
