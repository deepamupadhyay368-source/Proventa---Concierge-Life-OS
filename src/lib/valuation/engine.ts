import { db } from '../db';
import {
  RealEstateType,
  PropertyCondition,
  FurnishingStatus,
  TransactionContext,
  ValuationRequestStatus,
  ValuationConfidenceLevel,
  ComparableEvidenceType,
  ValuationReportStatus,
} from '@prisma/client';
import {
  evaluateAll12Factors,
  FactorAnalysisResult,
  ValuationPropertyInput,
  ValuationContextInput,
  OwnershipCostSummary,
  ProjectIntelligenceData,
} from './factors';

export interface ComparableAdjustmentLedger {
  carpetAreaDiffPercent: number;
  areaAdjustmentPercent: number;
  floorDiff: number;
  floorAdjustmentPercent: number;
  ageDiffYears: number;
  ageAdjustmentPercent: number;
  conditionAdjustmentPercent: number;
  askingHaircutPercent: number;
  netAdjustmentPercent: number;
}

export interface MatchedComparableItem {
  id: string;
  sourceType: 'REGISTERED_TRANSACTION' | 'ASKING_LISTING';
  evidenceType: ComparableEvidenceType;
  deedOrListingId: string;
  sourceName: string;
  date: Date;
  localityName: string;
  projectName?: string;
  bhk: number;
  carpetAreaSqFt: number;
  transactedOrAskingPriceLakhs: number;
  baselineRateSqFt: number;
  adjustedRateSqFt: number;
  floor?: number;
  matchScore: number;
  matchTier: 'PROJECT_IDENTICAL' | 'LOCALITY_CORE' | 'LOCALITY_PROXIMATE';
  selectionRationale: string;
  adjustments: ComparableAdjustmentLedger;
  weight: number;
  excluded: boolean;
  exclusionReason?: string;
}

export interface ValuationEngineResult {
  requestId: string;
  valuationId: string;
  reportReference: string;
  methodologyVersion: string;
  propertySummary: {
    address: string;
    localityName: string;
    projectName?: string;
    propertyType: string;
    bhk: number;
    carpetAreaSqFt: number;
    builtUpAreaSqFt?: number;
    floor?: number;
    totalFloors?: number;
    buildingAgeYears?: number;
    condition?: string;
    furnishingStatus?: string;
    parkingSpaces: number;
  };
  valuation: {
    estimatedMidpointLakhs: number;
    estimatedValueMinLakhs: number;
    estimatedValueMaxLakhs: number;
    estimatedPricePerSqFtCarpet: number;
    jantriBenchmarkLakhs: number;
    grossRentalYieldPercent: number;
    indicativeMonthlyRentRupees: number;
    confidenceScore: number;
    confidenceLevel: ValuationConfidenceLevel;
    confidenceRationale: string;
    eligibleCompsCount: number;
    dispersionCoefficientPercent: number;
    calculatedAt: Date;
  };
  comparableEvidence: {
    registeredTransactions: MatchedComparableItem[];
    askingListings: MatchedComparableItem[];
  };
  askingPriceAssessment?: {
    sellerPriceLakhs: number;
    differenceLakhs: number;
    differencePercent: number;
    verdict: 'PREMIUM_ASKING' | 'FAIR_MARKET' | 'VALUE_BUY';
    analysis: string;
  };
  twelveFactorResults: FactorAnalysisResult[];
  ownershipCostSummary: OwnershipCostSummary;
  layeredArchitecture: {
    layerA_marketBaseline: {
      baselineRateSqFt: number;
      compsCount: number;
      dispersionCoeff: number;
    };
    layerB_propertyAdjustments: {
      netAdjustmentPercent: number;
    };
    layerC_locationContext: {
      locality: string;
      district: string;
    };
    layerD_riskGates: {
      gateTriggered: boolean;
      blockingReasons: string[];
    };
    layerE_financialContext: OwnershipCostSummary;
    layerF_confidence: {
      score: number;
      level: ValuationConfidenceLevel;
      rationale: string;
    };
  };
  methodologyHighlights: {
    carpetAreaNormalisation: string;
    floorAdjustmentRule: string;
    ageDepreciationRule: string;
    askingPriceHaircutRule: string;
    statutoryJantriReference: string;
  };
  disclaimers: string[];
}

/**
 * Deterministic Comparable Matching & Valuation Engine
 */
export async function calculateValuationForRequest(
  requestId: string,
  options: { bypassPaymentCheck?: boolean; lockToken?: string } = {}
): Promise<ValuationEngineResult> {
  // 1. Fetch Request with Locality and Project
  const request = await db.valuationRequest.findUnique({
    where: { id: requestId },
    include: {
      locality: true,
      project: true,
      payment: true,
    },
  });

  if (!request) {
    throw new Error(`Valuation request not found for ID: ${requestId}`);
  }

  // 2. Strict Paywall Enforcement
  if (!options.bypassPaymentCheck) {
    if (!request.payment || request.payment.status !== 'CAPTURED') {
      throw new Error('ACCESS_DENIED: Valuation cannot be generated without verified payment confirmation.');
    }
  }

  // 2B. Asset Class Protection: Reject Commercial Properties
  if ((request.propertyType as string) === 'COMMERCIAL') {
    throw new Error('UNSUPPORTED_ASSET_CLASS: Commercial properties cannot be evaluated using residential valuation engine.');
  }

  // 3. Methodology Parameters
  const activeMethodology = await db.valuationMethodologyVersion.findFirst({
    where: { active: true },
    orderBy: { createdAt: 'desc' },
  });

  const methodologyVersion = activeMethodology?.versionNumber || 'v1.0.0';
  const params = (activeMethodology?.parametersJson as Record<string, number>) || {
    carpetAreaTolerancePercent: 30.0,
    sameProjectBonusPoints: 35.0,
    sameLocalityBonusPoints: 20.0,
    maxFloorAdjustmentPerFloorPercent: 0.35,
    maxAgeDepreciationPerYearPercent: 0.75,
    askingPriceNegotiationDiscountPercent: 6.5,
    minEligibleCompsForValuation: 3,
  };

  // Ensure minimum eligible comps is at least 3
  if (!params.minEligibleCompsForValuation || params.minEligibleCompsForValuation < 3) {
    params.minEligibleCompsForValuation = 3;
  }

  const subjectCarpet = request.carpetAreaSqFt;
  const minCarpet = subjectCarpet * (1 - params.carpetAreaTolerancePercent / 100);
  const maxCarpet = subjectCarpet * (1 + params.carpetAreaTolerancePercent / 100);

  // 4. Retrieve Registered Transactions from Database
  // Exclude test artifacts, duplicate transactions, and quarantined/unverified projects
  const registeredCandidates = await db.propertyTransaction.findMany({
    where: {
      localityId: request.localityId,
      carpetAreaSqFt: { gte: minCarpet, lte: maxCarpet },
      verificationStatus: 'VERIFIED',
      flagReason: null,
      duplicateOfId: null,
      NOT: {
        deedId: { startsWith: 'DEED-ACTION-TEST' },
      },
      OR: [
        {
          project: {
            publicationStatus: 'PUBLISHED',
            isPubliclyVisible: true,
          },
        },
        {
          projectId: null,
        },
      ],
    },
    include: {
      source: true,
      locality: true,
      project: true,
    },
    orderBy: { registrationDate: 'desc' },
    take: 15,
  });

  // 5. Retrieve Advertised Listings from Database
  const listingCandidates = await db.propertyListing.findMany({
    where: {
      localityId: request.localityId,
      carpetAreaSqFt: { gte: minCarpet, lte: maxCarpet },
      listingStatus: 'ACTIVE',
    },
    include: {
      source: true,
      locality: true,
      project: true,
    },
    orderBy: { listingDate: 'desc' },
    take: 8,
  });

  const matchedRegistered: MatchedComparableItem[] = [];
  const matchedListings: MatchedComparableItem[] = [];

  // Match and score registered transactions
  for (const cand of registeredCandidates) {
    const isSameProject = Boolean(request.projectId && cand.projectId === request.projectId);
    let matchScore = isSameProject ? 90 : 75;

    // BHK compatibility
    const bhkDiff = Math.abs(cand.bhk - request.bhk);
    if (bhkDiff === 0) matchScore += 5;
    else if (bhkDiff > 1) matchScore -= 15;

    // Carpet Area difference
    const areaDiffPct = ((cand.carpetAreaSqFt - subjectCarpet) / subjectCarpet) * 100;
    const areaAdjPct = -0.08 * areaDiffPct; // -0.08% adjustment per 1% size variance

    // Floor difference
    const subjectFloor = request.floor ?? 5;
    const compFloor = cand.floor ?? 5;
    const floorDiff = subjectFloor - compFloor;
    const floorAdjPct = Math.min(Math.max(floorDiff * 0.35, -3.5), 3.5);

    // Age difference
    const ageDiff = (request.propertyAgeYears ?? 4) - (cand.project?.completionYear ? (2026 - cand.project.completionYear) : 4);
    const ageAdjPct = -0.5 * ageDiff;

    // Net adjustments
    const netAdjPct = Math.round((areaAdjPct + floorAdjPct + ageAdjPct) * 100) / 100;
    const baselineRate = cand.pricePerSqFtCarpet;
    const adjustedRate = Math.round(baselineRate * (1 + netAdjPct / 100));

    // Weight based on recency and score
    const monthsAgo = Math.max(1, (new Date().getTime() - new Date(cand.registrationDate).getTime()) / (1000 * 60 * 60 * 24 * 30));
    const recencyDecay = Math.max(0.6, 1 - (monthsAgo / 36) * 0.4);
    const weight = Math.round((matchScore / 100) * recencyDecay * 100) / 100;

    matchedRegistered.push({
      id: cand.id,
      sourceType: 'REGISTERED_TRANSACTION',
      evidenceType: 'REGISTERED_TRANSACTION',
      deedOrListingId: cand.deedId || `REG-${cand.id.slice(-6)}`,
      sourceName: cand.source.name,
      date: cand.registrationDate,
      localityName: cand.locality.name,
      projectName: cand.project?.name,
      bhk: cand.bhk,
      carpetAreaSqFt: cand.carpetAreaSqFt,
      transactedOrAskingPriceLakhs: cand.transactedPriceLakhs,
      baselineRateSqFt: baselineRate,
      adjustedRateSqFt: adjustedRate,
      floor: cand.floor ?? undefined,
      matchScore,
      matchTier: isSameProject ? 'PROJECT_IDENTICAL' : 'LOCALITY_CORE',
      selectionRationale: isSameProject
        ? `Registered deed from identical project (${cand.project?.name}) registered on ${cand.registrationDate.toISOString().split('T')[0]}.`
        : `Registered deed from core micro-market within ${Math.abs(Math.round(areaDiffPct))}% carpet area tolerance.`,
      adjustments: {
        carpetAreaDiffPercent: Math.round(areaDiffPct * 10) / 10,
        areaAdjustmentPercent: Math.round(areaAdjPct * 10) / 10,
        floorDiff,
        floorAdjustmentPercent: Math.round(floorAdjPct * 10) / 10,
        ageDiffYears: ageDiff,
        ageAdjustmentPercent: Math.round(ageAdjPct * 10) / 10,
        conditionAdjustmentPercent: 0,
        askingHaircutPercent: 0,
        netAdjustmentPercent: netAdjPct,
      },
      weight,
      excluded: false,
    });
  }

  // Match and score asking listings (separately tracked)
  for (const list of listingCandidates) {
    const isSameProject = Boolean(request.projectId && list.projectId === request.projectId);
    let matchScore = isSameProject ? 75 : 60;

    const areaDiffPct = ((list.carpetAreaSqFt - subjectCarpet) / subjectCarpet) * 100;
    const areaAdjPct = -0.08 * areaDiffPct;

    const subjectFloor = request.floor ?? 5;
    const compFloor = list.floor ?? 5;
    const floorDiff = subjectFloor - compFloor;
    const floorAdjPct = Math.min(Math.max(floorDiff * 0.35, -3.5), 3.5);

    // Advertised listings undergo a mandatory market negotiation haircut
    const askingHaircutPct = -params.askingPriceNegotiationDiscountPercent;

    const netAdjPct = Math.round((areaAdjPct + floorAdjPct + askingHaircutPct) * 100) / 100;
    const baselineRate = list.pricePerSqFtCarpet;
    const adjustedRate = Math.round(baselineRate * (1 + netAdjPct / 100));

    matchedListings.push({
      id: list.id,
      sourceType: 'ASKING_LISTING',
      evidenceType: 'ASKING_LISTING',
      deedOrListingId: `LIST-${list.id.slice(-6)}`,
      sourceName: list.source.name,
      date: list.listingDate,
      localityName: list.locality.name,
      projectName: list.project?.name,
      bhk: list.bhk,
      carpetAreaSqFt: list.carpetAreaSqFt,
      transactedOrAskingPriceLakhs: list.askingPriceLakhs,
      baselineRateSqFt: baselineRate,
      adjustedRateSqFt: adjustedRate,
      floor: list.floor ?? undefined,
      matchScore,
      matchTier: isSameProject ? 'PROJECT_IDENTICAL' : 'LOCALITY_CORE',
      selectionRationale: `Active advertised asking listing on ${list.source.name}; adjusted with statutory -${params.askingPriceNegotiationDiscountPercent}% negotiation haircut.`,
      adjustments: {
        carpetAreaDiffPercent: Math.round(areaDiffPct * 10) / 10,
        areaAdjustmentPercent: Math.round(areaAdjPct * 10) / 10,
        floorDiff,
        floorAdjustmentPercent: Math.round(floorAdjPct * 10) / 10,
        ageDiffYears: 0,
        ageAdjustmentPercent: 0,
        conditionAdjustmentPercent: 0,
        askingHaircutPercent: askingHaircutPct,
        netAdjustmentPercent: netAdjPct,
      },
      weight: 0.35, // Listings receive lower weight than registered deeds
      excluded: false,
    });
  }

  // 6. Insufficient Evidence Check
  const eligibleRegistered = matchedRegistered.filter((m) => !m.excluded);
  if (eligibleRegistered.length < params.minEligibleCompsForValuation) {
    // Transition request to MANUAL_REVIEW
    await db.valuationRequest.update({
      where: { id: requestId },
      data: {
        status: 'MANUAL_REVIEW',
        rejectionReason: `Insufficient verified registered deeds (${eligibleRegistered.length} found, minimum required: ${params.minEligibleCompsForValuation}). Case assigned to senior research analyst.`,
      },
    });

    throw new Error(
      `INSUFFICIENT_EVIDENCE: Only ${eligibleRegistered.length} verified comparable transactions found in ${request.locality.name} within carpet area limits. Minimum 2 required for defensible automated valuation.`
    );
  }

  // 7. Weighted Unit Rate Calculation
  // We prioritize registered deeds (80% aggregate weight) and asking listings (20% aggregate weight)
  let totalWeightedRate = 0;
  let totalWeights = 0;
  const ratesForDispersion: number[] = [];

  for (const comp of eligibleRegistered) {
    totalWeightedRate += comp.adjustedRateSqFt * comp.weight;
    totalWeights += comp.weight;
    ratesForDispersion.push(comp.adjustedRateSqFt);
  }

  // Incorporate listings with capped influence
  for (const comp of matchedListings.filter((m) => !m.excluded)) {
    const listWeight = comp.weight * 0.25;
    totalWeightedRate += comp.adjustedRateSqFt * listWeight;
    totalWeights += listWeight;
    ratesForDispersion.push(comp.adjustedRateSqFt);
  }

  const finalRatePerSqFt = Math.round(totalWeightedRate / totalWeights);

  // 8. Dispersion and Value Range Calculation
  const meanRate = ratesForDispersion.reduce((a, b) => a + b, 0) / ratesForDispersion.length;
  const variance = ratesForDispersion.reduce((sum, r) => sum + Math.pow(r - meanRate, 2), 0) / ratesForDispersion.length;
  const standardDev = Math.sqrt(variance);
  const dispersionCoeff = Math.round((standardDev / meanRate) * 1000) / 10; // CV %

  // Value bounds: $\pm 4.5\%$ for tight dispersion, up to $\pm 7.5\%$ for wider dispersion
  const spreadPercent = Math.min(Math.max(dispersionCoeff * 0.6, 4.0), 8.0);
  const midpointLakhs = Math.round(((finalRatePerSqFt * subjectCarpet) / 100000) * 10) / 10;
  const minLakhs = Math.round((midpointLakhs * (1 - spreadPercent / 100)) * 10) / 10;
  const maxLakhs = Math.round((midpointLakhs * (1 + spreadPercent / 100)) * 10) / 10;

  // Jantri statutory benchmark
  const jantriRate = request.locality.jantriRateSqFt || 3200;
  const jantriLakhs = Math.round(((jantriRate * subjectCarpet) / 100000) * 10) / 10;

  // Rental estimates
  const yieldPct = request.locality.grossRentalYield || 3.8;
  const annualRentRupees = midpointLakhs * 100000 * (yieldPct / 100);
  const monthlyRentRupees = Math.round(annualRentRupees / 12 / 500) * 500;

  // 9. Confidence Assessment
  let confidenceScore = 88;
  let confidenceLevel: ValuationConfidenceLevel = 'HIGH';
  let confidenceRationale = `High evidence density: ${eligibleRegistered.length} verified registered deeds indexed with low rate dispersion (${dispersionCoeff}% CV).`;

  if (dispersionCoeff > 14 || eligibleRegistered.length < 3) {
    confidenceScore = 72;
    confidenceLevel = 'MODERATE';
    confidenceRationale = `Moderate evidence density: ${eligibleRegistered.length} registered deeds with moderate price spread (${dispersionCoeff}% CV).`;
  } else if (dispersionCoeff > 22) {
    confidenceScore = 58;
    confidenceLevel = 'LIMITED';
    confidenceRationale = `Limited evidence consistency: High price variance (${dispersionCoeff}% CV) across comparable deeds.`;
  }

  // 10. Asking Price Assessment (if provided)
  let askingAssessment: ValuationEngineResult['askingPriceAssessment'] | undefined;
  if (request.askingPriceLakhs) {
    const sellerPrice = request.askingPriceLakhs;
    const diffLakhs = Math.round((sellerPrice - midpointLakhs) * 10) / 10;
    const diffPct = Math.round(((sellerPrice - midpointLakhs) / midpointLakhs) * 1000) / 10;

    let verdict: 'PREMIUM_ASKING' | 'FAIR_MARKET' | 'VALUE_BUY' = 'FAIR_MARKET';
    let analysis = `Seller asking price of ₹${sellerPrice} Lakhs is within the fair market valuation band (₹${minLakhs}L - ₹${maxLakhs}L).`;

    if (diffPct > 6.0) {
      verdict = 'PREMIUM_ASKING';
      analysis = `Seller asking price of ₹${sellerPrice} Lakhs commands a +${diffPct}% premium above estimated market value midpoint of ₹${midpointLakhs} Lakhs. Recommended offer range: ₹${minLakhs}L - ₹${midpointLakhs}L.`;
    } else if (diffPct < -5.0) {
      verdict = 'VALUE_BUY';
      analysis = `Seller asking price of ₹${sellerPrice} Lakhs is priced at a attractive ${Math.abs(diffPct)}% discount below estimated market value midpoint.`;
    }

    askingAssessment = {
      sellerPriceLakhs: sellerPrice,
      differenceLakhs: diffLakhs,
      differencePercent: diffPct,
      verdict,
      analysis,
    };
  }

  // 11. Run 12-Factor Valuation Intelligence Framework
  const propertyInput: ValuationPropertyInput = {
    carpetAreaSqFt: request.carpetAreaSqFt,
    builtUpAreaSqFt: request.builtUpAreaSqFt,
    superBuiltUpAreaSqFt: request.superBuiltUpAreaSqFt,
    bhk: request.bhk,
    floor: request.floor,
    totalFloors: request.totalFloors,
    propertyAgeYears: request.propertyAgeYears,
    condition: request.condition,
    furnishingStatus: request.furnishingStatus,
    parkingSpaces: request.parkingSpaces,
  };

  const contextInput: ValuationContextInput = {
    propertyType: request.propertyType,
    localityId: request.localityId,
    localitySlug: request.locality.slug,
    localityName: request.locality.name,
    district: request.locality.city,
    address: request.address,
    pincode: request.pincode,
    projectId: request.projectId,
    projectName: request.project?.name,
    askingPriceLakhs: request.askingPriceLakhs,
    targetOfferLakhs: request.targetOfferLakhs,
    verifiedTransactions: eligibleRegistered.map((c) => ({
      id: c.id,
      deedId: c.deedOrListingId,
      date: c.date,
      carpetAreaSqFt: c.carpetAreaSqFt,
      transactedPriceLakhs: c.transactedOrAskingPriceLakhs,
      pricePerSqFtCarpet: c.baselineRateSqFt,
      projectName: c.projectName,
    })),
  };

  const projectData: ProjectIntelligenceData | null = request.project
    ? {
        id: request.project.id,
        name: request.project.name,
        reraNumber: request.project.reraNumber,
        developer: request.project.developer,
        publicationStatus: request.project.publicationStatus,
        possessionStatus: request.project.possessionStatus,
        totalTowers: request.project.totalTowers,
        totalUnits: request.project.totalUnits,
        openSpaceRatioPercent: request.project.openSpaceRatioPercent,
      }
    : null;

  const twelveFactors = evaluateAll12Factors(
    propertyInput,
    contextInput,
    projectData,
    midpointLakhs
  );

  if (twelveFactors.riskGateTriggered) {
    await db.valuationRequest.update({
      where: { id: requestId },
      data: {
        status: 'MANUAL_REVIEW',
        rejectionReason: `Valuation blocked by risk gate: ${twelveFactors.blockingReasons.join('; ')}`,
      },
    });

    throw new Error(`VALUATION_RISK_GATE_BLOCKED: ${twelveFactors.blockingReasons.join('; ')}`);
  }

  const layeredArchitecture = {
    layerA_marketBaseline: {
      baselineRateSqFt: finalRatePerSqFt,
      compsCount: eligibleRegistered.length,
      dispersionCoeff,
    },
    layerB_propertyAdjustments: {
      netAdjustmentPercent: twelveFactors.netDirectAdjustmentPercent,
    },
    layerC_locationContext: {
      locality: request.locality.name,
      district: request.locality.city,
    },
    layerD_riskGates: {
      gateTriggered: twelveFactors.riskGateTriggered,
      blockingReasons: twelveFactors.blockingReasons,
    },
    layerE_financialContext: twelveFactors.costSummary,
    layerF_confidence: {
      score: confidenceScore,
      level: confidenceLevel,
      rationale: confidenceRationale,
    },
  };

  // 12. Reference Codes & Report Generation
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  const reportReference = `PVI-VAL-${new Date().getFullYear()}-${randomSuffix}`;

  // 13. Save Valuation Record to Database
  const valuation = await db.valuation.upsert({
    where: { requestId },
    update: {
      methodologyVersion,
      estimatedValueMinLakhs: minLakhs,
      estimatedValueMaxLakhs: maxLakhs,
      estimatedMidpointLakhs: midpointLakhs,
      pricePerSqFtCarpet: finalRatePerSqFt,
      jantriBenchmarkLakhs: jantriLakhs,
      confidenceScore,
      confidenceLevel,
      confidenceRationale,
      eligibleCompsCount: eligibleRegistered.length + matchedListings.length,
      calculatedAt: new Date(),
      calculationDetailsJson: {
        ratesForDispersion,
        dispersionCoeff,
        spreadPercent,
        meanRate,
        weightsUsed: totalWeights,
        layeredArchitecture,
        twelveFactors: twelveFactors.factors,
      } as any,
    },
    create: {
      requestId,
      methodologyVersion,
      estimatedValueMinLakhs: minLakhs,
      estimatedValueMaxLakhs: maxLakhs,
      estimatedMidpointLakhs: midpointLakhs,
      pricePerSqFtCarpet: finalRatePerSqFt,
      jantriBenchmarkLakhs: jantriLakhs,
      confidenceScore,
      confidenceLevel,
      confidenceRationale,
      eligibleCompsCount: eligibleRegistered.length + matchedListings.length,
      calculationDetailsJson: {
        ratesForDispersion,
        dispersionCoeff,
        spreadPercent,
        meanRate,
        weightsUsed: totalWeights,
        layeredArchitecture,
        twelveFactors: twelveFactors.factors,
      } as any,
    },
  });

  // Save ValuationEvidence entries
  await db.valuationEvidence.deleteMany({ where: { valuationId: valuation.id } });
  for (const comp of eligibleRegistered) {
    await db.valuationEvidence.create({
      data: {
        valuationId: valuation.id,
        evidenceType: 'REGISTERED_TRANSACTION',
        transactionId: comp.id,
        weight: comp.weight,
        baselineRateSqFt: comp.baselineRateSqFt,
        adjustedRateSqFt: comp.adjustedRateSqFt,
        adjustmentDetailsJson: comp.adjustments as any,
        notes: comp.selectionRationale,
      },
    });
  }

  for (const list of matchedListings) {
    await db.valuationEvidence.create({
      data: {
        valuationId: valuation.id,
        evidenceType: 'ASKING_LISTING',
        listingId: list.id,
        weight: list.weight,
        baselineRateSqFt: list.baselineRateSqFt,
        adjustedRateSqFt: list.adjustedRateSqFt,
        adjustmentDetailsJson: list.adjustments as any,
        notes: list.selectionRationale,
      },
    });
  }

  // Save ComparableMatch entries
  await db.comparableMatch.deleteMany({ where: { valuationId: valuation.id } });
  for (const comp of eligibleRegistered) {
    await db.comparableMatch.create({
      data: {
        valuationId: valuation.id,
        transactionId: comp.id,
        matchScore: comp.matchScore,
        matchType: comp.matchTier,
        selectionRationale: comp.selectionRationale,
        carpetAreaDiffPercent: comp.adjustments.carpetAreaDiffPercent,
        floorAdjustmentPercent: comp.adjustments.floorAdjustmentPercent,
        ageAdjustmentPercent: comp.adjustments.ageAdjustmentPercent,
        netAdjustmentPercent: comp.adjustments.netAdjustmentPercent,
      },
    });
  }

  const resultPayload: ValuationEngineResult = {
    requestId: request.id,
    valuationId: valuation.id,
    reportReference,
    methodologyVersion,
    propertySummary: {
      address: request.address,
      localityName: request.locality.name,
      projectName: request.project?.name,
      propertyType: request.propertyType,
      bhk: request.bhk,
      carpetAreaSqFt: request.carpetAreaSqFt,
      builtUpAreaSqFt: request.builtUpAreaSqFt ?? undefined,
      floor: request.floor ?? undefined,
      totalFloors: request.totalFloors ?? undefined,
      buildingAgeYears: request.propertyAgeYears ?? undefined,
      condition: request.condition ?? undefined,
      furnishingStatus: request.furnishingStatus ?? undefined,
      parkingSpaces: request.parkingSpaces,
    },
    valuation: {
      estimatedMidpointLakhs: midpointLakhs,
      estimatedValueMinLakhs: minLakhs,
      estimatedValueMaxLakhs: maxLakhs,
      estimatedPricePerSqFtCarpet: finalRatePerSqFt,
      jantriBenchmarkLakhs: jantriLakhs,
      grossRentalYieldPercent: yieldPct,
      indicativeMonthlyRentRupees: monthlyRentRupees,
      confidenceScore,
      confidenceLevel,
      confidenceRationale,
      eligibleCompsCount: eligibleRegistered.length + matchedListings.length,
      dispersionCoefficientPercent: dispersionCoeff,
      calculatedAt: valuation.calculatedAt,
    },
    comparableEvidence: {
      registeredTransactions: eligibleRegistered,
      askingListings: matchedListings,
    },
    twelveFactorResults: twelveFactors.factors,
    ownershipCostSummary: twelveFactors.costSummary,
    layeredArchitecture,
    askingPriceAssessment: askingAssessment,
    methodologyHighlights: {
      carpetAreaNormalisation: 'All valuation calculations normalise strictly on verified RERA Carpet Area. Built-up and super built-up loadings are excluded from base rate computation.',
      floorAdjustmentRule: '+0.35% per floor upward adjustment applied to high-rise units, capped at ±3.5%.',
      ageDepreciationRule: '-0.50% per year building age depreciation applied relative to micro-market average age baseline.',
      askingPriceHaircutRule: '-6.50% empirical negotiation haircut applied to advertised listings to align asking rates with executed deed closures.',
      statutoryJantriReference: 'Government Jantri Rate indexed from Gujarat Revenue Department Gazette notifications for the relevant survey number.',
    },
    disclaimers: [
      'This valuation report is an independent empirical statistical estimate based on registered deed instruments and observed verified market evidence.',
      'This report does NOT constitute a statutory valuation under the Wealth Tax Act or a legal title verification. Title search and encumbrance certificates must be independently verified through a qualified legal advocate.',
      'Valuation estimates reflect current market transaction conditions as of the generation date and are subject to micro-market economic fluctuations.',
    ],
  };

  // 13. Create or Update ValuationReport & 14. Mark Request as COMPLETED atomically
  // Finding 06 (Phase 6.8.3): Distributed lease fencing token validation at write boundary
  await db.$transaction(async (tx) => {
    if (options.lockToken) {
      const lockCheck = await tx.valuationRequest.updateMany({
        where: {
          id: requestId,
          processingLockToken: options.lockToken,
        },
        data: {
          status: 'COMPLETED',
          processingLockToken: null,
        },
      });

      if (lockCheck.count === 0) {
        throw new Error(
          `STALE_PROCESSING_LEASE: Failed to commit completion; lock token was revoked, expired or stolen for request: ${requestId}`
        );
      }
    } else {
      await tx.valuationRequest.update({
        where: { id: requestId },
        data: { status: 'COMPLETED' },
      });
    }

    await tx.valuationReport.upsert({
      where: { requestId },
      update: {
        valuationId: valuation.id,
        reportReference,
        status: 'READY',
        reportDataJson: resultPayload as any,
        generatedAt: new Date(),
      },
      create: {
        requestId,
        valuationId: valuation.id,
        reportReference,
        status: 'READY',
        reportDataJson: resultPayload as any,
        generatedAt: new Date(),
      },
    });
  });

  return resultPayload;
}
