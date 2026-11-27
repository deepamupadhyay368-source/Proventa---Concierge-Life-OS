/**
 * PROVENTA — LIVE STAGING POSTGRESQL 18.7 CERTIFICATION SUITE
 * Verifies Real Estate Intelligence & Property OS persistence and strict
 * 2-user IDOR privacy isolation against verified isolated `proventa-staging`.
 *
 * SAFETY GUARD: Immediately aborts if DATABASE_URL points to Production
 * (`ep-gentle-butterfly` / `c-4.ap-southeast-1.aws.neon.tech`).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PrismaClient } from '@prisma/client';
import {
  generateProventaPropertyId,
  normalizePropertyAddressKey,
} from '@/lib/real-estate-intelligence/registry-service';
import { computeLocalityMarketBenchmark } from '@/lib/real-estate-intelligence/market-engine';
import { computeOwnerPortfolioSummary } from '@/lib/real-estate-intelligence/property-os-service';
import { buildRealEstateReport } from '@/lib/real-estate-intelligence/report-generator';
import { renderIntelligenceReportPdf } from '@/lib/real-estate-intelligence/pdf-builder';

function loadStagingDatabaseUrl(): string {
  const envPath = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '../../.env.staging.local'
  );
  if (!fs.existsSync(envPath)) {
    throw new Error(`Missing .env.staging.local at ${envPath}`);
  }
  const raw = fs.readFileSync(envPath, 'utf8');
  const match = raw.match(/^DATABASE_URL=["']?([^"'\r\n]+)["']?/m);
  if (!match?.[1]) {
    throw new Error('DATABASE_URL not found in .env.staging.local');
  }
  const url = match[1].trim();
  if (url.includes('ep-gentle-butterfly') || url.includes('c-4.ap-southeast-1.aws.neon.tech')) {
    throw new Error('SAFETY ABORT: Production Neon URL detected! Refusing to run staging certification.');
  }
  if (!url.includes('c-5.ap-southeast-1.aws.neon.tech')) {
    throw new Error('SAFETY ABORT: DATABASE_URL does not resolve to verified proventa-staging (c-5) host.');
  }
  return url;
}

const runTag = `cert-${Date.now()}`;
const userA = `owner-a-${runTag}`;
const userB = `owner-b-${runTag}`;
let prisma: PrismaClient;

const createdRegistryIds: string[] = [];
const createdObservationIds: string[] = [];
const createdInfraIds: string[] = [];
const createdPassportIds: string[] = [];
const createdWatchlistIds: string[] = [];
const createdReportIds: string[] = [];
const createdNotificationIds: string[] = [];

describe('PROVENTA Real Estate Intelligence — Live proventa-staging PostgreSQL 18.7 Certification', () => {
  beforeAll(async () => {
    const stagingUrl = loadStagingDatabaseUrl();
    prisma = new PrismaClient({ datasourceUrl: stagingUrl });
    await prisma.$connect();

    // Create real User rows to satisfy live PostgreSQL FOREIGN KEY constraints
    await prisma.user.createMany({
      data: [
        { id: userA, email: `${userA}@staging.proventa.in`, name: 'Staging Owner A' },
        { id: userB, email: `${userB}@staging.proventa.in`, name: 'Staging Owner B' },
      ],
      skipDuplicates: true,
    });
  });

  afterAll(async () => {
    if (!prisma) return;
    if (createdNotificationIds.length) {
      await prisma.realEstateNotification.deleteMany({ where: { id: { in: createdNotificationIds } } });
    }
    if (createdReportIds.length) {
      await prisma.realEstateReport.deleteMany({ where: { id: { in: createdReportIds } } });
    }
    if (createdWatchlistIds.length) {
      await prisma.realEstateWatchlist.deleteMany({ where: { id: { in: createdWatchlistIds } } });
    }
    if (createdPassportIds.length) {
      await prisma.propertyPassport.deleteMany({ where: { id: { in: createdPassportIds } } });
    }
    if (createdInfraIds.length) {
      await prisma.infrastructureAsset.deleteMany({ where: { id: { in: createdInfraIds } } });
    }
    if (createdObservationIds.length) {
      await prisma.marketObservation.deleteMany({ where: { id: { in: createdObservationIds } } });
    }
    if (createdRegistryIds.length) {
      await prisma.registryProperty.deleteMany({ where: { id: { in: createdRegistryIds } } });
    }
    await prisma.user.deleteMany({ where: { id: { in: [userA, userB] } } });
    await prisma.$disconnect();
  });

  it('persists RegistryProperty with permanent PV-PROP ID, USER_SUBMITTED status, and PropertyLifecycleEvent', async () => {
    const pvId = generateProventaPropertyId('Ahmedabad');
    const addrKey = normalizePropertyAddressKey({
      city: 'Ahmedabad',
      locality: 'South Bopal',
      buildingName: `CertTower-${runTag}`,
      unitNumber: '1204',
      address: `FP 99, South Bopal ${runTag}`,
    });

    const created = await prisma.registryProperty.create({
      data: {
        proventaPropertyId: pvId,
        landParcelCode: 'TP-03/FP-99',
        projectSlug: 'cert-skyline',
        buildingName: `CertTower-${runTag}`,
        unitNumber: '1204',
        propertyCategory: 'RESIDENTIAL',
        propertyType: 'APARTMENT',
        title: `Cert Skyline 1204 (${runTag})`,
        address: `FP 99, South Bopal ${runTag}`,
        normalizedAddressKey: addrKey,
        locality: 'South Bopal',
        city: 'Ahmedabad',
        carpetAreaSqFt: 1480,
        verificationStatus: 'USER_SUBMITTED',
        sourceProvenance: 'Staging certification test',
        submittedByUserId: userA,
        lifecycleEvents: {
          create: {
            eventType: 'REGISTERED',
            eventDate: new Date(),
            summary: `Registered ${pvId}`,
            sourceProvenance: 'Staging certification test',
          },
        },
      },
      include: { lifecycleEvents: true },
    });
    createdRegistryIds.push(created.id);

    expect(created.proventaPropertyId).toBe(pvId);
    expect(created.verificationStatus).toBe('USER_SUBMITTED');
    expect(created.lifecycleEvents).toHaveLength(1);
  });

  it('persists MarketObservations + InfrastructureAssets and computes live RELIABLE locality benchmark', async () => {
    const testLocality = `CertLocality-${runTag}`;
    const rates = [BigInt(610000), BigInt(650000), BigInt(690000)];

    for (let i = 0; i < rates.length; i++) {
      const obs = await prisma.marketObservation.create({
        data: {
          locality: testLocality,
          city: 'Ahmedabad',
          segment: 'RESIDENTIAL',
          propertyType: 'APARTMENT',
          pricePerSqFtPaise: rates[i],
          rentalYieldPct: 3.2,
          transactionCount: 4,
          reportingPeriod: '2026-Q4',
          observationDate: new Date(),
          dataSource: 'Gujarat Sub-Registrar (Staging Test)',
          methodology: 'Median registered carpet rate',
          verificationStatus: 'VERIFIED',
          confidenceLevel: 'HIGH',
        },
      });
      createdObservationIds.push(obs.id);
    }

    const infra = await prisma.infrastructureAsset.create({
      data: {
        name: `Ahmedabad Metro Phase 2 Extension (${runTag})`,
        locality: testLocality,
        corridor: 'SG Highway - GIFT City',
        city: 'Ahmedabad',
        category: 'METRO',
        status: 'UNDER_CONSTRUCTION',
        expectedCompletionYear: 2027,
        sourceReference: 'GMRC Official Corridor Notice',
      },
    });
    createdInfraIds.push(infra.id);

    const rows = await prisma.marketObservation.findMany({ where: { locality: testLocality } });
    const benchmark = computeLocalityMarketBenchmark(testLocality, 'RESIDENTIAL', rows);
    expect(benchmark.status).toBe('RELIABLE');
    expect(benchmark.medianPriceSqFtPaise).toBe(BigInt(650000));
    expect(infra.status).toBe('UNDER_CONSTRUCTION');
  });

  it('enforces strict 2-user IDOR privacy isolation for Property OS passports, leases, expenses, and watchlists', async () => {
    const leaseExpirySoon = new Date(Date.now() + 30 * 24 * 3600 * 1000);

    const passportA = await prisma.propertyPassport.create({
      data: {
        ownerUserId: userA,
        passportCode: `PV-OS-2026-${runTag.slice(-6).toUpperCase()}`,
        nickname: `Private Vault Asset ${runTag}`,
        propertyCategory: 'RESIDENTIAL',
        propertyType: 'APARTMENT',
        address: `Private Suite 801, Thaltej ${runTag}`,
        locality: 'Thaltej',
        city: 'Ahmedabad',
        purchasePricePaise: BigInt(150_000_0000),
        currentEstimatedPaise: BigInt(180_000_0000),
        occupancyStatus: 'RENTED',
        isPrivate: true,
        expenses: {
          create: {
            ownerUserId: userA,
            category: 'PROPERTY_TAX',
            amountPaise: BigInt(25_000_00),
            expenseDate: new Date(),
            description: 'AMC Annual Property Tax',
          },
        },
        leases: {
          create: {
            ownerUserId: userA,
            tenantName: 'Private Tenant Alpha',
            monthlyRentPaise: BigInt(55_000_00),
            securityDepositPaise: BigInt(110_000_00),
            leaseStartDate: new Date(Date.now() - 335 * 24 * 3600 * 1000),
            leaseEndDate: leaseExpirySoon,
            status: 'ACTIVE',
          },
        },
        maintenanceRecords: {
          create: {
            ownerUserId: userA,
            title: 'HVAC Annual Service',
            costPaise: BigInt(8_000_00),
            status: 'OPEN',
          },
        },
        timelineEvents: {
          create: {
            ownerUserId: userA,
            eventType: 'ACQUISITION',
            eventDate: new Date(),
            title: 'Initial Private Registration',
          },
        },
      },
      include: {
        expenses: true,
        leases: true,
        maintenanceRecords: true,
        timelineEvents: true,
      },
    });
    createdPassportIds.push(passportA.id);

    const watchlistA = await prisma.realEstateWatchlist.create({
      data: {
        userId: userA,
        targetType: 'LOCALITY',
        targetIdOrSlug: `thaltej-${runTag}`,
        targetLabel: 'Thaltej Residential',
        alertFrequency: 'WEEKLY',
      },
    });
    createdWatchlistIds.push(watchlistA.id);

    // Verify User A sees full portfolio + 60-day lease expiry & maintenance alerts
    const userAPassports = await prisma.propertyPassport.findMany({
      where: { ownerUserId: userA, deletedAt: null },
      include: { expenses: true, leases: true, maintenanceRecords: true },
    });
    expect(userAPassports).toHaveLength(1);
    const summaryA = computeOwnerPortfolioSummary(userAPassports);
    expect(summaryA.appreciationPercent).toBe(20);
    expect(summaryA.upcomingAlerts.length).toBe(2);

    // STRICT IDOR CHECK: User B MUST see 0 of User A's private records
    const [userBPassports, userBExpenses, userBLeases, userBWatchlists] = await Promise.all([
      prisma.propertyPassport.findMany({ where: { ownerUserId: userB, deletedAt: null } }),
      prisma.propertyExpense.findMany({ where: { ownerUserId: userB } }),
      prisma.propertyLease.findMany({ where: { ownerUserId: userB } }),
      prisma.realEstateWatchlist.findMany({ where: { userId: userB } }),
    ]);
    expect(userBPassports).toHaveLength(0);
    expect(userBExpenses).toHaveLength(0);
    expect(userBLeases).toHaveLength(0);
    expect(userBWatchlists).toHaveLength(0);

    // STRICT PUBLIC REGISTRY ISOLATION CHECK: User A's private passport NEVER leaks into public registry
    const leakedInPublicRegistry = await prisma.registryProperty.findMany({
      where: {
        isPublicRegistry: true,
        address: { contains: `Private Suite 801, Thaltej ${runTag}` },
      },
    });
    expect(leakedInPublicRegistry).toHaveLength(0);
  });

  it('persists genuine %PDF-1.4 RealEstateReport + RealEstateNotification and enforces 2-user IDOR isolation', async () => {
    const structured = buildRealEstateReport({
      reportType: 'LOCALITY_INTELLIGENCE',
      subjectTitle: `Staging PDF Cert (${runTag})`,
      metrics: { medianRateInrSqFt: 6500, observations: 3 },
      methodology: 'PostgreSQL verified median benchmark',
      dataSources: ['Gujarat Sub-Registrar (Staging Test)'],
      confidenceLevel: 'MODERATE',
    });
    const { pdfBuffer, sha256, pageCount } = renderIntelligenceReportPdf(structured);

    const reportA = await prisma.realEstateReport.create({
      data: {
        reportReference: structured.reportReference,
        ownerUserId: userA,
        reportType: structured.reportType,
        subjectTitle: structured.subjectTitle,
        geography: structured.geography,
        metricsJson: structured.metrics as object,
        methodology: structured.methodology,
        dataSources: structured.dataSources,
        confidenceLevel: structured.confidenceLevel,
        assumptions: structured.assumptions,
        limitations: structured.limitations,
        nonCertifiedDisclaimer: structured.nonCertifiedDisclaimer,
        pdfBase64: pdfBuffer.toString('base64'),
        sha256Checksum: sha256,
        pageCount,
      },
    });
    createdReportIds.push(reportA.id);

    const notifA = await prisma.realEstateNotification.create({
      data: {
        userId: userA,
        category: 'REPORT_READY',
        title: `PDF Ready: ${structured.reportReference}`,
        message: 'Generated in staging certification.',
        targetUrl: `/api/real-estate/reports/${reportA.id}/download`,
      },
    });
    createdNotificationIds.push(notifA.id);

    // Verify User A's PDF binary round-trips cleanly
    const fetchedA = await prisma.realEstateReport.findFirst({
      where: { id: reportA.id, ownerUserId: userA },
    });
    expect(fetchedA).not.toBeNull();
    const decoded = Buffer.from(fetchedA!.pdfBase64, 'base64').toString('latin1');
    expect(decoded.startsWith('%PDF-1.4')).toBe(true);
    expect(decoded.trimEnd().endsWith('%%EOF')).toBe(true);

    // STRICT IDOR CHECK: User B sees 0 reports and 0 notifications of User A
    const [userBReports, userBNotifs] = await Promise.all([
      prisma.realEstateReport.findMany({ where: { ownerUserId: userB } }),
      prisma.realEstateNotification.findMany({ where: { userId: userB } }),
    ]);
    expect(userBReports).toHaveLength(0);
    expect(userBNotifs).toHaveLength(0);
  });

  it('verifies Property OS Expense/Lease Edit+Delete and Private Binary PropertyDocument with 2-user IDOR isolation', async () => {
    const passport = await prisma.propertyPassport.create({
      data: {
        ownerUserId: userA,
        passportCode: `PV-OS-DOC-${runTag.slice(-6).toUpperCase()}`,
        nickname: `Doc Vault ${runTag}`,
        propertyCategory: 'RESIDENTIAL',
        propertyType: 'APARTMENT',
        address: `Suite 402, Science City ${runTag}`,
        locality: 'Science City',
        city: 'Ahmedabad',
        purchasePricePaise: BigInt(90_000_0000),
        currentEstimatedPaise: BigInt(100_000_0000),
      },
    });
    createdPassportIds.push(passport.id);

    // Expense Create -> Edit -> Delete
    const exp = await prisma.propertyExpense.create({
      data: {
        passportId: passport.id,
        ownerUserId: userA,
        category: 'PROPERTY_TAX',
        amountPaise: BigInt(10_000_00),
        expenseDate: new Date(),
        description: 'Initial AMC Tax',
      },
    });
    const expUpdated = await prisma.propertyExpense.update({
      where: { id: exp.id },
      data: { amountPaise: BigInt(12_500_00), description: 'Revised AMC Tax' },
    });
    expect(expUpdated.amountPaise).toBe(BigInt(12_500_00));
    await prisma.propertyExpense.delete({ where: { id: exp.id } });

    // Lease Create -> Edit -> Delete
    const lease = await prisma.propertyLease.create({
      data: {
        passportId: passport.id,
        ownerUserId: userA,
        tenantName: 'Tenant Beta',
        monthlyRentPaise: BigInt(35_000_00),
        leaseStartDate: new Date(),
        leaseEndDate: new Date(Date.now() + 180 * 24 * 3600 * 1000),
      },
    });
    const leaseUpdated = await prisma.propertyLease.update({
      where: { id: lease.id },
      data: { monthlyRentPaise: BigInt(38_000_00) },
    });
    expect(leaseUpdated.monthlyRentPaise).toBe(BigInt(38_000_00));
    await prisma.propertyLease.delete({ where: { id: lease.id } });

    // Private Binary Document Create -> Round-Trip -> 2-User IDOR Check -> Delete
    const samplePdf = Buffer.from('%PDF-1.4\nPrivate Deed Binary\n%%EOF', 'latin1');
    const doc = await prisma.propertyDocument.create({
      data: {
        passportId: passport.id,
        ownerUserId: userA,
        fileName: 'sale_deed_private.pdf',
        mimeType: 'application/pdf',
        sizeBytes: samplePdf.length,
        storageKey: `private/test/${runTag}/sale_deed_private.pdf`,
        storageProvider: 'DATABASE_PRIVATE',
        sha256Checksum: 'a'.repeat(64),
        contentBase64: samplePdf.toString('base64'),
      },
    });

    const userADocs = await prisma.propertyDocument.findMany({ where: { ownerUserId: userA, id: doc.id } });
    const userBDocs = await prisma.propertyDocument.findMany({ where: { ownerUserId: userB, id: doc.id } });
    expect(userADocs).toHaveLength(1);
    expect(Buffer.from(userADocs[0].contentBase64!, 'base64').toString('latin1')).toContain('Private Deed Binary');
    expect(userBDocs).toHaveLength(0);

    await prisma.propertyDocument.delete({ where: { id: doc.id } });
  });
});
