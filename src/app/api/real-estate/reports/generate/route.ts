import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import {
  buildRealEstateReport,
  type RealEstateReportType,
} from '@/lib/real-estate-intelligence/report-generator';
import { renderIntelligenceReportPdf } from '@/lib/real-estate-intelligence/pdf-builder';
import { computeLocalityMarketBenchmark } from '@/lib/real-estate-intelligence/market-engine';
import {
  runFullInvestmentAnalysis,
  type InvestmentAnalysisInput,
} from '@/lib/real-estate-intelligence/investment-engine';
import { computeOwnerPortfolioSummary } from '@/lib/real-estate-intelligence/property-os-service';
import { checkMonthlyReportEntitlement } from '@/lib/real-estate-intelligence/entitlements';

const generateReportRequestSchema = z.object({
  reportType: z.enum([
    'PROPERTY_INTELLIGENCE',
    'PROJECT_INTELLIGENCE',
    'LOCALITY_INTELLIGENCE',
    'INVESTMENT_FEASIBILITY',
    'PROPERTY_VALUATION',
    'PORTFOLIO_PERFORMANCE',
    'MARKET_COMPARISON',
  ]),
  propertyId: z.string().trim().optional(),
  projectSlug: z.string().trim().optional(),
  locality: z.string().trim().optional(),
  localities: z.array(z.string().trim().min(1)).max(4).optional(),
  segment: z.enum(['RESIDENTIAL', 'COMMERCIAL', 'LAND']).default('RESIDENTIAL'),
  carpetAreaSqFt: z.number().positive().optional(),
  investmentInput: z
    .object({
      purchasePriceRupees: z.number().positive(),
      stampDutyPercent: z.number().min(0).max(20).default(4.9),
      registrationPercent: z.number().min(0).max(10).default(1.0),
      brokeragePercent: z.number().min(0).max(10).default(1.0),
      renovationCostRupees: z.number().min(0).default(0),
      monthlyRentRupees: z.number().min(0),
      annualMaintenanceRupees: z.number().min(0).default(0),
      annualPropertyTaxRupees: z.number().min(0).optional(),
      vacancyRatePercent: z.number().min(0).max(100).default(8),
      loanToValuePercent: z.number().min(0).max(95).default(70),
      interestRatePercent: z.number().min(0).max(30).default(8.75),
      loanTenureYears: z.number().int().min(1).max(40).default(20),
      holdingPeriodYears: z.number().int().min(1).max(40).default(7),
      annualAppreciationPercent: z.number().min(-20).max(40).default(8),
      annualRentEscalationPercent: z.number().min(-10).max(25).optional(),
    })
    .optional(),
});

/**
 * POST /api/real-estate/reports/generate
 * Server-side trusted PDF report generation for all 7 institutional report types.
 * - NEVER trusts client-supplied metrics or dataSources.
 * - Enforces centralised monthly report entitlements.
 * - Persists RealEstateReport (with ownerUserId + PDF binary + SHA-256) in PostgreSQL.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required to generate institutional PDF reports.' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const userRoles = (session.user as { roles?: string[] }).roles ?? [];
    const entitlement = await checkMonthlyReportEntitlement(userId, userRoles);
    if (!entitlement.allowed) {
      return NextResponse.json(
        {
          error: `Monthly PDF report limit reached (${entitlement.used}/${entitlement.limit} on ${entitlement.tier} plan).`,
          entitlement,
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = generateReportRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid report generation request.', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const d = parsed.data;
    const reportType = d.reportType as RealEstateReportType;

    let subjectTitle = '';
    let geography = 'Ahmedabad & Gandhinagar, Gujarat';
    let metrics: Record<string, unknown> = {};
    let methodology = '';
    let dataSources: string[] = [];
    let confidenceLevel: 'HIGH' | 'MODERATE' | 'LOW' | 'INSUFFICIENT_DATA' = 'INSUFFICIENT_DATA';
    let assumptions: string[] = [];
    let limitations: string[] = [];

    if (reportType === 'PROPERTY_INTELLIGENCE') {
      if (!d.propertyId) {
        return NextResponse.json({ error: 'propertyId is required for PROPERTY_INTELLIGENCE report.' }, { status: 400 });
      }
      const prop = await db.registryProperty.findFirst({
        where: {
          deletedAt: null,
          isPublicRegistry: true,
          OR: [{ id: d.propertyId }, { proventaPropertyId: d.propertyId }],
        },
        include: { lifecycleEvents: { orderBy: { eventDate: 'desc' }, take: 5 } },
      });
      if (!prop) {
        return NextResponse.json({ error: 'Public registry property not found.' }, { status: 404 });
      }
      subjectTitle = `${prop.title} (${prop.proventaPropertyId})`;
      geography = `${prop.locality}, ${prop.city}, ${prop.state}`;
      metrics = {
        proventaPropertyId: prop.proventaPropertyId,
        propertyCategory: prop.propertyCategory,
        propertyType: prop.propertyType,
        carpetAreaSqFt: prop.carpetAreaSqFt ?? 'Not verified',
        constructionStatus: prop.constructionStatus,
        reraNumber: prop.reraNumber ?? 'Not verified on file',
        verificationStatus: prop.verificationStatus,
        lifecycleEventCount: prop.lifecycleEvents.length,
      };
      methodology = 'Direct retrieval from PROVENTA Living Property Registry with explicit provenance verification.';
      dataSources = [`PROVENTA Living Property Registry (${prop.sourceProvenance})`];
      confidenceLevel = prop.verificationStatus === 'VERIFIED' ? 'HIGH' : 'LOW';
      assumptions = ['Public registry attributes reflect recorded filings as of generation timestamp.'];
      limitations = ['Does not replace statutory title search or sub-registrar encumbrance certificate.'];
    } else if (reportType === 'PROJECT_INTELLIGENCE') {
      if (!d.projectSlug) {
        return NextResponse.json({ error: 'projectSlug is required for PROJECT_INTELLIGENCE report.' }, { status: 400 });
      }
      const project = await db.project.findUnique({
        where: { slug: d.projectSlug },
        include: { locality: { select: { name: true } } },
      });
      if (!project) {
        return NextResponse.json({ error: 'Project not found in PROVENTA database.' }, { status: 404 });
      }
      subjectTitle = `${project.name} (${project.slug})`;
      geography = `${project.locality?.name || project.district || 'Ahmedabad'}, Gujarat`;
      metrics = {
        projectSlug: project.slug,
        developer: project.developer ?? 'Unverified',
        reraNumber: project.reraNumber ?? 'Not verified on file',
        possessionStatus: project.possessionStatus ?? 'UNSPECIFIED',
        totalUnits: project.totalUnits ?? 'Not recorded',
        carpetAreaRangeSqFt:
          project.carpetAreaRangeMin && project.carpetAreaRangeMax
            ? `${project.carpetAreaRangeMin} - ${project.carpetAreaRangeMax}`
            : 'Not recorded',
        verificationBadge: project.verificationBadge,
      };
      methodology = 'Direct retrieval from PROVENTA RERA Project Intelligence database.';
      dataSources = ['PROVENTA Project Database (Gujarat RERA & verified developer filings)'];
      confidenceLevel = project.reraNumber ? 'MODERATE' : 'LOW';
      assumptions = ['Project milestones reflect latest verified database record.'];
      limitations = ['Construction progress should be independently verified via Gujarat RERA quarterly filings.'];
    } else if (reportType === 'LOCALITY_INTELLIGENCE') {
      const loc = d.locality || 'Bopal';
      const [obs, infra] = await Promise.all([
        db.marketObservation.findMany({
          where: { locality: { equals: loc, mode: 'insensitive' }, segment: d.segment },
          orderBy: { observationDate: 'desc' },
          take: 500,
        }),
        db.infrastructureAsset.findMany({
          where: { locality: { equals: loc, mode: 'insensitive' } },
          take: 100,
        }),
      ]);
      const benchmark = computeLocalityMarketBenchmark(loc, d.segment, obs);
      subjectTitle = `${loc} — ${d.segment} Locality Intelligence`;
      geography = `${loc}, Ahmedabad/Gandhinagar, Gujarat`;
      metrics = {
        benchmarkStatus: benchmark.status,
        medianPricePerSqFt: benchmark.formattedMedianPriceSqFt ?? 'INSUFFICIENT_DATA',
        observationCount: benchmark.observationCount,
        averageRentalYieldPct: benchmark.averageRentalYieldPct ?? 'INSUFFICIENT_DATA',
        totalRecordedTransactions: benchmark.totalRecordedTransactions,
        latestReportingPeriod: benchmark.latestReportingPeriod ?? 'N/A',
        infrastructureOperational: infra.filter((i) => i.status === 'OPERATIONAL').length,
        infrastructureUnderConstruction: infra.filter((i) => i.status === 'UNDER_CONSTRUCTION').length,
        infrastructureProposed: infra.filter((i) => i.status === 'PROPOSED').length,
      };
      methodology =
        'Median INR/sq ft computed strictly from VERIFIED, EXTERNALLY_SOURCED, and ADMIN_SUBMITTED database observations (min 3 required; synthetic/user records excluded).';
      dataSources = benchmark.sources.length
        ? benchmark.sources
        : ['PROVENTA Market Observations Database (INSUFFICIENT_DATA — fewer than 3 sourced records)'];
      confidenceLevel = benchmark.confidenceLevel;
      assumptions = ['Carpet-area basis normalization where available.'];
      limitations = ['Corridors with < 3 qualifying observations report INSUFFICIENT_DATA rather than estimates.'];
    } else if (reportType === 'INVESTMENT_FEASIBILITY') {
      if (!d.investmentInput) {
        return NextResponse.json(
          { error: 'investmentInput is required for INVESTMENT_FEASIBILITY report.' },
          { status: 400 }
        );
      }
      const analysis = runFullInvestmentAnalysis(d.investmentInput as InvestmentAnalysisInput);
      subjectTitle = `Investment Feasibility (${d.investmentInput.holdingPeriodYears}Y Hold, INR ${d.investmentInput.purchasePriceRupees.toLocaleString('en-IN')})`;
      metrics = {
        totalAcquisitionCostRupees: analysis.base.totalAcquisitionCostRupees,
        equityInvestedRupees: analysis.base.equityInvestedRupees,
        baseIrrPercent: analysis.base.irrPercent ?? analysis.base.irrStatus,
        baseMirrPercent: analysis.base.mirrPercent ?? 'N/A',
        baseRoiPercent: analysis.base.roiPercent,
        equityMultiple: analysis.base.equityMultiple,
        grossRentalYieldPercent: analysis.base.grossRentalYieldPercent,
        netRentalYieldPercent: analysis.base.netRentalYieldPercent,
        financingInterestPaidRupees: analysis.base.financingInterestPaidRupees,
        totalEconomicOwnershipCostRupees: analysis.base.totalOwnershipCostRupees,
        conservativeIrrPercent: analysis.scenarios.conservative.irrPercent ?? analysis.scenarios.conservative.irrStatus,
        optimisticIrrPercent: analysis.scenarios.optimistic.irrPercent ?? analysis.scenarios.optimistic.irrStatus,
        scorecardStatus: analysis.scorecard.status,
      };
      methodology =
        'Server-side deterministic discounted cash flow (bracketed IRR + MIRR) with exact monthly loan amortisation and zero principal double-counting.';
      dataSources = ['User-supplied financial underwriting assumptions (computed server-side by PROVENTA Investment Engine)'];
      confidenceLevel = 'MODERATE';
      assumptions = [
        `Stamp duty ${d.investmentInput.stampDutyPercent}%, registration ${d.investmentInput.registrationPercent}%, LTV ${d.investmentInput.loanToValuePercent}%, interest ${d.investmentInput.interestRatePercent}%.`,
      ];
      limitations = [analysis.disclaimer];
    } else if (reportType === 'PROPERTY_VALUATION') {
      const loc = d.locality || 'Bopal';
      const carpetArea = d.carpetAreaSqFt || 1200;
      const obs = await db.marketObservation.findMany({
        where: { locality: { equals: loc, mode: 'insensitive' }, segment: d.segment },
        orderBy: { observationDate: 'desc' },
        take: 500,
      });
      const benchmark = computeLocalityMarketBenchmark(loc, d.segment, obs);
      const indicativeValueRupees =
        benchmark.status === 'RELIABLE' && benchmark.medianPriceSqFtPaise !== null
          ? Math.round((Number(benchmark.medianPriceSqFtPaise) / 100) * carpetArea)
          : null;

      subjectTitle = `Indicative Property Valuation — ${loc} (${carpetArea} sq ft carpet)`;
      geography = `${loc}, Ahmedabad/Gandhinagar, Gujarat`;
      metrics = {
        benchmarkStatus: benchmark.status,
        carpetAreaSqFt: carpetArea,
        medianPricePerSqFt: benchmark.formattedMedianPriceSqFt ?? 'INSUFFICIENT_DATA',
        indicativeValueRupees: indicativeValueRupees ?? 'INSUFFICIENT_DATA',
        qualifyingObservations: benchmark.observationCount,
      };
      methodology = 'Carpet-area benchmark valuation derived strictly from qualifying database market observations.';
      dataSources = benchmark.sources.length
        ? benchmark.sources
        : ['PROVENTA Market Observations Database (INSUFFICIENT_DATA)'];
      confidenceLevel = benchmark.confidenceLevel;
      assumptions = ['Indicative estimate only; unit-level floor/facing/age adjustments require full 12-factor dossier.'];
      limitations = ['Not a statutory valuation under the Wealth Tax Act or bank mortgage appraisal.'];
    } else if (reportType === 'PORTFOLIO_PERFORMANCE') {
      const passports = await db.propertyPassport.findMany({
        where: { ownerUserId: userId, deletedAt: null },
        include: { expenses: true, leases: true, maintenanceRecords: true },
      });
      const summary = computeOwnerPortfolioSummary(passports);
      subjectTitle = `Private Owner Portfolio Performance (${summary.totalProperties} Properties)`;
      metrics = {
        totalProperties: summary.totalProperties,
        vacantProperties: summary.vacantProperties,
        totalAcquisitionCost: summary.totalAcquisitionFormatted,
        totalEstimatedValue: summary.totalEstimatedValueFormatted,
        appreciationPercent: summary.appreciationPercent,
        annualRentalIncome: summary.annualRentalIncomeFormatted,
        annualExpenses: summary.annualExpensesFormatted,
        netRentalYieldPercent: summary.netRentalYieldPercent,
        upcomingAlertsCount: summary.upcomingAlerts.length,
      };
      methodology = 'Aggregated strictly from authenticated owner private Property OS records in PostgreSQL.';
      dataSources = ['PROVENTA Private Property OS (strictly owner-isolated records)'];
      confidenceLevel = passports.length > 0 ? 'MODERATE' : 'INSUFFICIENT_DATA';
      assumptions = ['Estimated values reflect owner-recorded valuations inside Property OS.'];
      limitations = ['Private portfolio data is confidential and isolated to the owning user account.'];
    } else if (reportType === 'MARKET_COMPARISON') {
      const locs = d.localities && d.localities.length >= 2 ? d.localities : ['Bopal', 'GIFT City'];
      const obs = await db.marketObservation.findMany({
        where: { segment: d.segment },
        orderBy: { observationDate: 'desc' },
        take: 1000,
      });
      const results = locs.map((loc) => computeLocalityMarketBenchmark(loc, d.segment, obs));
      subjectTitle = `Market Comparison: ${locs.join(' vs ')} (${d.segment})`;
      metrics = Object.fromEntries(
        results.map((b) => [
          b.locality,
          `${b.status} | Median: ${b.formattedMedianPriceSqFt ?? 'N/A'} | Obs: ${b.observationCount} | Yield: ${b.averageRentalYieldPct ?? 'N/A'}%`,
        ])
      );
      methodology = 'Side-by-side comparison of qualifying database observations across selected Gujarat corridors.';
      const allSources = Array.from(new Set(results.flatMap((r) => r.sources)));
      dataSources = allSources.length ? allSources : ['PROVENTA Market Observations Database (INSUFFICIENT_DATA)'];
      confidenceLevel = results.every((r) => r.status === 'RELIABLE') ? 'MODERATE' : 'INSUFFICIENT_DATA';
      assumptions = ['All localities evaluated on identical segment filter and >=3 observation threshold.'];
      limitations = ['Unverified and synthetic observations are strictly excluded.'];
    }

    const structured = buildRealEstateReport({
      reportType,
      subjectTitle,
      geography,
      metrics,
      methodology,
      dataSources,
      confidenceLevel,
      assumptions,
      limitations,
    });

    const { pdfBuffer, sha256, pageCount } = renderIntelligenceReportPdf(structured);

    const saved = await db.realEstateReport.create({
      data: {
        reportReference: structured.reportReference,
        ownerUserId: userId,
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
      select: {
        id: true,
        reportReference: true,
        reportType: true,
        subjectTitle: true,
        confidenceLevel: true,
        sha256Checksum: true,
        pageCount: true,
        createdAt: true,
      },
    });

    await db.realEstateNotification.create({
      data: {
        userId,
        category: 'REPORT_READY',
        title: `PDF Report Ready: ${saved.reportReference}`,
        message: `${saved.subjectTitle} (${saved.pageCount} page PDF) is ready for secure download.`,
        targetUrl: `/api/real-estate/reports/${saved.id}/download`,
      },
    });

    return NextResponse.json(
      {
        reportId: saved.id,
        reportReference: saved.reportReference,
        downloadUrl: `/api/real-estate/reports/${saved.id}/download`,
        sha256Checksum: saved.sha256Checksum,
        pageCount: saved.pageCount,
        report: structured,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('[POST /api/real-estate/reports/generate]', err);
    return NextResponse.json({ error: 'Failed to generate institutional PDF report.' }, { status: 500 });
  }
}
