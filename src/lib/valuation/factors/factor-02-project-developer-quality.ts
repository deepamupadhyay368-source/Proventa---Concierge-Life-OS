import { FactorAnalysisResult, ValuationContextInput } from './types';

export interface ProjectIntelligenceData {
  id: string;
  name: string;
  reraNumber?: string | null;
  developer?: string | null;
  publicationStatus?: string | null;
  possessionStatus?: string | null;
  totalTowers?: number | null;
  totalUnits?: number | null;
  openSpaceRatioPercent?: number | null;
  amenitiesCount?: number;
  specificationsCount?: number;
}

/**
 * FACTOR 02 — PROJECT & DEVELOPER QUALITY
 * Evaluates GujRERA statutory compliance, promoter execution track record,
 * architectural specifications, open space density, and clubhouse amenities.
 */
export function evaluateProjectDeveloperQuality(
  context: ValuationContextInput,
  projectData?: ProjectIntelligenceData | null
): FactorAnalysisResult {
  const findings: string[] = [];
  const riskFlags: string[] = [];
  const limitations: string[] = [];
  const sources = [];

  let adjustmentPercent = 0.0;
  let assessmentStatus: FactorAnalysisResult['assessmentStatus'] = 'UNVERIFIED';
  let gateAction: 'ALLOW' | 'RESTRICT' | 'BLOCK' = 'ALLOW';

  // 1. Standalone property without specific project
  if (!projectData && !context.projectId && !context.projectName) {
    findings.push('Property is located in a standalone residential building or individual society scheme.');
    limitations.push('No master GujRERA scheme profile indexed; neutral project quality baseline applied.');
    return {
      factorId: 'FACTOR_02_PROJECT_DEVELOPER_QUALITY',
      factorName: 'Project & Developer Quality',
      implementationStatus: 'IMPLEMENTED',
      assessmentStatus: 'PARTIALLY_VERIFIED',
      inputCompleteness: 0.5,
      evidenceCount: 0,
      verifiedEvidenceCount: 0,
      sourceReferences: [],
      lastVerifiedAt: new Date().toISOString(),
      findings,
      riskFlags,
      calculationMethod: 'Locality baseline without developer-specific brand premium.',
      valuationImpactType: 'CONTEXTUAL_ONLY',
      valuationImpact: {
        adjustmentPercent: 0.0,
        gateAction: 'ALLOW',
        rationale: 'Neutral project baseline applied for standalone / non-scheme residential property.',
      },
      confidenceContribution: 50,
      limitations,
    };
  }

  // 2. Project Data Present
  const projectName = projectData?.name || context.projectName || 'Unspecified Scheme';
  findings.push(`Residential Project: "${projectName}".`);

  // Quarantined Project Check
  if (projectData?.publicationStatus === 'QUARANTINED') {
    riskFlags.push(`CRITICAL STATUTORY QUARANTINE: Project "${projectName}" is formally quarantined due to statutory contradiction or jurisdictional mismatch.`);
    gateAction = 'BLOCK';
    return {
      factorId: 'FACTOR_02_PROJECT_DEVELOPER_QUALITY',
      factorName: 'Project & Developer Quality',
      implementationStatus: 'IMPLEMENTED',
      assessmentStatus: 'INSUFFICIENT_DATA',
      inputCompleteness: 1.0,
      evidenceCount: 1,
      verifiedEvidenceCount: 0,
      sourceReferences: [
        {
          sourceName: 'PROVENTA Project Intelligence Quarantine Ledger',
          sourceType: 'STATUTORY_QUARANTINE_REGISTER',
          documentRef: projectData.id,
          verified: true,
        },
      ],
      lastVerifiedAt: new Date().toISOString(),
      findings,
      riskFlags,
      calculationMethod: 'Statutory quarantine screening rule.',
      valuationImpactType: 'RISK_GATE',
      valuationImpact: {
        gateAction: 'BLOCK',
        rationale: 'Valuation blocked due to association with a quarantined or contradicted real estate entity.',
      },
      confidenceContribution: 0,
      limitations: ['Quarantined projects are strictly barred from market valuation matching.'],
    };
  }

  // GujRERA Registration
  if (projectData?.reraNumber) {
    assessmentStatus = 'VERIFIED';
    findings.push(`Statutory GujRERA Registration verified: ${projectData.reraNumber}.`);
    sources.push({
      sourceName: 'Gujarat Real Estate Regulatory Authority (GujRERA)',
      sourceType: 'STATUTORY_REGULATORY_REGISTER',
      documentRef: projectData.reraNumber,
      retrievalDate: new Date().toISOString().split('T')[0],
      verified: true,
    });
    adjustmentPercent += 2.0;
  } else {
    limitations.push('No verified Gujarat RERA certificate number matched for this scheme name.');
  }

  // Promoter / Developer
  if (projectData?.developer) {
    findings.push(`Registered Promoter / Legal Entity: ${projectData.developer}.`);
  }

  // Possession Status
  if (projectData?.possessionStatus) {
    findings.push(`Project Development Status: ${projectData.possessionStatus}.`);
    if (projectData.possessionStatus.toUpperCase().includes('UNDER_CONSTRUCTION')) {
      adjustmentPercent -= 3.0;
      findings.push('Under-construction development stage: -3.0% discount for execution and delivery timeline risk.');
    } else if (projectData.possessionStatus.toUpperCase().includes('READY') || projectData.possessionStatus.toUpperCase().includes('COMPLETED')) {
      adjustmentPercent += 1.5;
      findings.push('Ready-to-move occupancy status: +1.5% immediate delivery utility premium.');
    }
  }

  // Amenities and Open Space Density
  if (projectData?.openSpaceRatioPercent && projectData.openSpaceRatioPercent >= 60) {
    adjustmentPercent += 1.5;
    findings.push(`Generous open space allocation (${projectData.openSpaceRatioPercent}%): +1.5% premium for low ground coverage.`);
  }

  if (projectData?.amenitiesCount && projectData.amenitiesCount >= 10) {
    adjustmentPercent += 1.0;
    findings.push(`Comprehensive lifestyle amenities (${projectData.amenitiesCount} verified facilities): +1.0% shared infrastructure premium.`);
  }

  adjustmentPercent = Math.round(adjustmentPercent * 10) / 10;

  return {
    factorId: 'FACTOR_02_PROJECT_DEVELOPER_QUALITY',
    factorName: 'Project & Developer Quality',
    implementationStatus: 'IMPLEMENTED',
    assessmentStatus,
    inputCompleteness: projectData ? 0.9 : 0.6,
    evidenceCount: sources.length,
    verifiedEvidenceCount: sources.filter((s) => s.verified).length,
    sourceReferences: sources,
    lastVerifiedAt: new Date().toISOString(),
    findings,
    riskFlags,
    calculationMethod: 'RERA statutory verification, construction progress audit, and amenity density scoring.',
    valuationImpactType: 'DIRECT_ADJUSTMENT',
    valuationImpact: {
      adjustmentPercent,
      gateAction,
      rationale: `Net project adjustment of ${adjustmentPercent >= 0 ? '+' : ''}${adjustmentPercent}% derived from statutory RERA compliance and possession status.`,
    },
    confidenceContribution: assessmentStatus === 'VERIFIED' ? 80 : 45,
    limitations,
  };
}
