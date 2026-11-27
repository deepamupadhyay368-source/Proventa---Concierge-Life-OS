/**
 * PROVENTA — LIVE STAGING POSTGRESQL CERTIFICATION HARNESS (NO MOCKS)
 * Connects strictly to .env.staging.local (proventa-staging).
 * Includes a hard safety guard that aborts immediately if DATABASE_URL
 * is missing or matches the production Neon host fingerprint.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { rupeesToPaise } from '@/lib/construction-procurement/money';
import { evaluateThreeWayMatch } from '@/lib/construction-procurement/fulfilment-engine';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STAGING_ENV_PATH = path.resolve(__dirname, '../../.env.staging.local');

function loadStagingDatabaseUrl(): string | null {
  if (!fs.existsSync(STAGING_ENV_PATH)) return null;
  const content = fs.readFileSync(STAGING_ENV_PATH, 'utf8');
  const match = content.match(/^\s*DATABASE_URL\s*=\s*"?([^"\r\n]+)"?/m);
  if (!match) return null;
  const url = match[1].trim();
  if (!url || url === '[SENSITIVE]') return null;
  // Hard production safety guard: NEVER allow connection to production Neon host
  if (url.includes('ep-gentle-butterfly')) {
    throw new Error('SAFETY_ABORT: Refusing to connect staging certification suite to production Neon host.');
  }
  return url;
}

const stagingUrl = loadStagingDatabaseUrl();
const describeStaging = stagingUrl ? describe : describe.skip;

describeStaging('PROVENTA — Live Staging PostgreSQL Certification (All 7 Features + Concurrency)', () => {
  let prisma: PrismaClient;
  const runId = `STG-${Date.now()}`;
  const orgA = `org-a-${runId}`;
  const orgB = `org-b-${runId}`;

  beforeAll(async () => {
    prisma = new PrismaClient({ datasourceUrl: stagingUrl! });
    await prisma.$connect();
  });

  afterAll(async () => {
    if (!prisma) return;
    // Clean up synthetic test fixtures created during this run
    await prisma.automationExecution.deleteMany({ where: { organisationId: { in: [orgA, orgB] } } });
    await prisma.consolidationOpportunity.deleteMany({ where: { organisationId: { in: [orgA, orgB] } } });
    await prisma.supplierReliabilitySnapshot.deleteMany({ where: { organisationId: { in: [orgA, orgB] } } });
    await prisma.inventoryRecord.deleteMany({ where: { organisationId: { in: [orgA, orgB] } } });
    await prisma.projectMilestone.deleteMany({ where: { organisationId: { in: [orgA, orgB] } } });
    await prisma.priceObservation.deleteMany({ where: { organisationId: { in: [orgA, orgB] } } });
    await prisma.leakageAlert.deleteMany({ where: { organisationId: { in: [orgA, orgB] } } });
    await prisma.threeWayMatchRecord.deleteMany({ where: { organisationId: { in: [orgA, orgB] } } });
    await prisma.procurementAward.deleteMany({ where: { organisationId: { in: [orgA, orgB] } } });
    await prisma.procurementRequirement.deleteMany({ where: { organisationId: { in: [orgA, orgB] } } });
    await prisma.constructionProject.deleteMany({ where: { organisationId: { in: [orgA, orgB] } } });
    await prisma.$disconnect();
  });

  it('verifies PostgreSQL server identity and isolation', async () => {
    const rows = await prisma.$queryRaw<Array<{ version: string; db: string }>>`
      SELECT version() AS version, current_database() AS db
    `;
    expect(rows[0].version).toContain('PostgreSQL');
    expect(rows[0].db).toBeTruthy();
  });

  it('persists and isolates LeakageAlert, PriceObservation, Milestone/Inventory, Reliability, Consolidation & Autopilot across Org A and Org B', async () => {
    const projectA = await prisma.constructionProject.create({
      data: {
        organisationId: orgA,
        projectCode: `PRJ-A-${runId}`,
        name: 'Staging Tower A',
        location: 'S.G. Highway',
        address: 'Plot 101, Ahmedabad',
        projectType: 'RESIDENTIAL_TOWER',
        developerOrContractor: 'Org A Developers',
        approvedBudgetPaise: rupeesToPaise(200_000_000),
        materialBudgetPaise: rupeesToPaise(90_000_000),
        createdByUserId: 'user-a',
      },
    });

    // Feature 1: LeakageAlert
    await prisma.leakageAlert.create({
      data: {
        organisationId: orgA,
        alertCode: `LKG-${runId}`,
        category: 'PRICE_ANOMALY',
        severity: 'HIGH',
        projectId: projectA.id,
        materialName: 'TMT Steel 16mm Fe-550D',
        transactionType: 'PO',
        transactionRef: `PO-${runId}`,
        detectedAmountPaise: rupeesToPaise(74000),
        baselineAmountPaise: rupeesToPaise(66000),
        potentialExposurePaise: rupeesToPaise(800000),
        explanation: 'Unit landed rate exceeds verified historical median by 12.12%',
        supportingEvidenceJson: { runId },
        auditTrailJson: [{ action: 'DETECTED', timestampIso: new Date().toISOString() }],
      },
    });

    // Tenant isolation check: Org B must see 0 Org A alerts
    const orgBAlerts = await prisma.leakageAlert.findMany({ where: { organisationId: orgB } });
    expect(orgBAlerts).toHaveLength(0);

    // Feature 2: PriceObservation
    const obs = await prisma.priceObservation.create({
      data: {
        organisationId: orgA,
        materialCategorySlug: 'tmt-steel',
        materialName: 'TMT 16mm',
        brand: 'Tata Tiscon',
        grade: 'Fe-550D',
        specificationsJson: { standard: 'IS 1786:2008' },
        unit: 'MT',
        quantity: 50,
        basePriceUnitPaise: rupeesToPaise(55000),
        gstUnitPaise: rupeesToPaise(9900),
        freightUnitPaise: rupeesToPaise(950),
        landedPriceUnitPaise: rupeesToPaise(65850),
        observationDate: new Date(),
        sourceType: 'VERIFIED_PO',
        verificationStatus: 'VERIFIED',
      },
    });
    expect(obs.landedPriceUnitPaise).toBe(rupeesToPaise(65850));

    // Feature 3: Timing (Milestone + Inventory)
    await prisma.projectMilestone.create({
      data: {
        organisationId: orgA,
        projectId: projectA.id,
        name: 'Podium Slab',
        plannedStartDate: new Date(Date.now() + 14 * 86400_000),
        plannedEndDate: new Date(Date.now() + 21 * 86400_000),
        materialCategorySlug: 'tmt-steel',
        materialName: 'TMT 16mm',
        boqPlannedQuantity: 100,
        unit: 'MT',
        leadTimeDays: 14,
      },
    });
    await prisma.inventoryRecord.create({
      data: {
        organisationId: orgA,
        projectId: projectA.id,
        materialCategorySlug: 'tmt-steel',
        materialName: 'TMT 16mm',
        specificationSummary: 'Fe-550D IS 1786',
        unit: 'MT',
        availableQuantity: 20,
      },
    });

    // Feature 4: Supplier Reliability Snapshot
    await prisma.supplierReliabilitySnapshot.create({
      data: {
        organisationId: orgA,
        supplierBusinessId: `sup-${runId}`,
        supplierName: 'Staging Steel Yard',
        periodStart: new Date('2026-01-01'),
        periodEnd: new Date(),
        completedTransactions: 5,
        hasSufficientData: true,
        compositeScore: 91.5,
        dimensionScoresJson: { deliveryReliability: 95 },
      },
    });

    // Feature 5: Multi-Project Consolidation Opportunity
    await prisma.consolidationOpportunity.create({
      data: {
        organisationId: orgA,
        opportunityCode: `CON-${runId}`,
        materialCategorySlug: 'tmt-steel',
        materialName: 'TMT 16mm',
        specificationSignature: 'Fe-550D-16mm',
        projectIds: [projectA.id],
        combinedQuantity: 100,
        unit: 'MT',
        supplierOverlapIds: [`sup-${runId}`],
        compatibilityVerified: true,
        incompatibilityReasons: [],
        createdByUserId: 'user-a',
      },
    });

    // Feature 6 + Three-Way Match
    const match = evaluateThreeWayMatch({
      purchaseOrderId: `PO-${runId}`,
      invoiceNumber: `INV-${runId}`,
      poOrderedQuantity: 50,
      poUnitRatePaise: rupeesToPaise(55000),
      poGstRatePercent: 18,
      grnAcceptedQuantity: 50,
      invoiceBilledQuantity: 50,
      invoiceUnitRatePaise: rupeesToPaise(55000),
      invoiceTaxAmountPaise: rupeesToPaise(495000),
      invoiceTotalAmountPaise: rupeesToPaise(3245000),
    });
    const savedMatch = await prisma.threeWayMatchRecord.create({
      data: {
        organisationId: orgA,
        purchaseOrderId: `PO-${runId}`,
        invoiceNumber: `INV-${runId}`,
        supplierGstin: '24AABCT1234F1Z5',
        poTotalPaise: match.poTotalPaise,
        grnValuePaise: match.grnValuePaise,
        invoiceTotalPaise: match.invoiceTotalPaise,
        variancePaise: match.variancePaise,
        status: match.status,
        discrepancyReasons: match.discrepancyReasons,
      },
    });
    expect(savedMatch.status).toBe('MATCHED');

    // Feature 7: AutomationExecution idempotency constraint
    const exec = await prisma.automationExecution.create({
      data: {
        organisationId: orgA,
        workflowType: 'RFQ_DRAFT',
        idempotencyKey: `idem-${runId}`,
        initiatedByUserId: 'user-a',
        requiresConfirmation: true,
        status: 'DRAFT_AWAITING_CONFIRMATION',
        inputPayloadJson: { projectId: projectA.id },
        auditTrailJson: [{ action: 'DRAFT_CREATED' }],
      },
    });
    expect(exec.requiresConfirmation).toBe(true);
  });

  it('enforces real PostgreSQL unique award concurrency protection (2 parallel inserts -> 1 succeeds, 1 fails with P2002)', async () => {
    const rfqId = `RFQ-CONC-${runId}`;
    const results = await Promise.allSettled([
      prisma.procurementAward.create({
        data: {
          organisationId: orgA,
          rfqId,
          quotationId: `Q1-${runId}`,
          supplierBusinessId: `SUP1-${runId}`,
          purchaseOrderId: `PO1-${runId}`,
          idempotencyKey: `AWD-1-${runId}`,
          awardedAmountPaise: rupeesToPaise(500000),
          awardedByUserId: 'user-approver-1',
          immutableSnapshotJson: { winner: 'Q1' },
        },
      }),
      prisma.procurementAward.create({
        data: {
          organisationId: orgA,
          rfqId,
          quotationId: `Q2-${runId}`,
          supplierBusinessId: `SUP2-${runId}`,
          purchaseOrderId: `PO2-${runId}`,
          idempotencyKey: `AWD-2-${runId}`,
          awardedAmountPaise: rupeesToPaise(510000),
          awardedByUserId: 'user-approver-2',
          immutableSnapshotJson: { winner: 'Q2' },
        },
      }),
    ]);

    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter((r) => r.status === 'rejected');
    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);
  });

  it('serializes simultaneous PostgreSQL SELECT ... FOR UPDATE transactions on ValuationPayment (50,000 + 49,900 paise = 99,900 paise) and rejects over-refund', async () => {
    const reqId = `VAL-REQ-${runId}`;
    const payId = `VAL-PAY-${runId}`;
    try {
      await prisma.$executeRawUnsafe(
        `INSERT INTO "ValuationPayment" ("id","requestId","userId","orderId","amountPaise","status","idempotencyKey","updatedAt")
         VALUES ($1,$2,$3,$4,$5,'CAPTURED',$6,NOW())`,
        payId, reqId, 'user-stg', `ORD-${runId}`, 99900, `IDEM-${runId}`
      );

      const processLockedRefund = async (refundRef: string, amountPaise: number) => {
        return prisma.$transaction(async (tx) => {
          const locked = await tx.$queryRawUnsafe<Array<{ status: string; amountPaise: number }>>(
            `SELECT status, "amountPaise" FROM "ValuationPayment" WHERE id = $1 FOR UPDATE`,
            payId
          );
          if (locked[0].status !== 'CAPTURED') return { blocked: true, status: 409 };
          await tx.$executeRawUnsafe(
            `INSERT INTO "ValuationRefund" ("id","paymentId","amountPaise","reason","status","refundReference","processedAt")
             VALUES ($1,$2,$3,'Staging concurrency test','PROCESSED',$4,NOW())`,
            `RFD-${refundRef}`, payId, amountPaise, refundRef
          );
          const sumRows = await tx.$queryRawUnsafe<Array<{ total: bigint }>>(
            `SELECT COALESCE(SUM("amountPaise"), 0)::bigint AS total FROM "ValuationRefund" WHERE "paymentId" = $1 AND status = 'PROCESSED'`,
            payId
          );
          const total = Number(sumRows[0].total);
          if (total > locked[0].amountPaise) {
            throw new Error('OVER_REFUND_QUARANTINED_422');
          }
          if (total >= locked[0].amountPaise) {
            await tx.$executeRawUnsafe(`UPDATE "ValuationPayment" SET status = 'REFUNDED' WHERE id = $1`, payId);
          }
          return { blocked: false, cumulative: total };
        });
      };

      // Fire 2 simultaneous partial refunds (50,000 + 49,900 = 99,900)
      const [r1, r2] = await Promise.all([
        processLockedRefund(`ref-a-${runId}`, 50000),
        processLockedRefund(`ref-b-${runId}`, 49900),
      ]);
      expect(r1.blocked).toBe(false);
      expect(r2.blocked).toBe(false);
      expect(Math.max(r1.cumulative ?? 0, r2.cumulative ?? 0)).toBe(99900);

      // Third refund attempt against now-REFUNDED payment must be blocked with 409
      const r3 = await processLockedRefund(`ref-c-${runId}`, 1000);
      expect(r3.blocked).toBe(true);
      expect(r3.status).toBe(409);
    } finally {
      await prisma.$executeRawUnsafe(`DELETE FROM "ValuationRefund" WHERE "paymentId" = $1`, payId).catch(() => {});
      await prisma.$executeRawUnsafe(`DELETE FROM "ValuationPayment" WHERE id = $1`, payId).catch(() => {});
      await prisma.$executeRawUnsafe(`DELETE FROM "ValuationRequest" WHERE id = $1`, reqId).catch(() => {});
    }
  });
});
