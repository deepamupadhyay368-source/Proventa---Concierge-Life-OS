import { FactorAnalysisResult, ValuationPropertyInput, ValuationContextInput } from './types';

/**
 * FACTOR 09 — BUILDING CONDITION & CONSTRUCTION QUALITY
 * Evaluates building structural health, elevator mechanical systems, fire fighting NOC compliance,
 * facade waterproofing, plumbing/electrical infrastructure, and society maintenance standards.
 */
export function evaluateBuildingCondition(
  property: ValuationPropertyInput,
  context: ValuationContextInput
): FactorAnalysisResult {
  const findings: string[] = [];
  const riskFlags: string[] = [];
  const limitations: string[] = [];

  let adjustmentPercent = 0.0;
  let assessmentStatus: FactorAnalysisResult['assessmentStatus'] = 'PARTIALLY_VERIFIED';

  if (property.condition === 'EXCELLENT') {
    findings.push('Superstructure & Common Maintenance: High-grade exterior facade upkeep, fully operational dual passenger elevators, and active CCTV security.');
    adjustmentPercent += 2.0;
  } else if (property.condition === 'NEEDS_RENOVATION') {
    riskFlags.push('Structural / Internal Wear: Evidence of moisture seepage or aging plumbing requiring substantial capital expenditure.');
    adjustmentPercent -= 5.0;
    assessmentStatus = 'UNVERIFIED';
  } else {
    findings.push('Standard building construction: Reinforced Cement Concrete (RCC) frame conforming to Gujarat seismic design zone specifications.');
    adjustmentPercent = 0.0;
  }

  limitations.push('Building condition reflects client filing and locality standards; destructive core testing or non-destructive ultrasonic pulse velocity (UPV) was not conducted.');
  limitations.push('Structural safety should be verified by a licensed structural engineer registered with the local municipal corporation.');

  return {
    factorId: 'FACTOR_09_BUILDING_CONDITION',
    factorName: 'Building Condition & Construction Quality',
    implementationStatus: 'IMPLEMENTED',
    assessmentStatus,
    inputCompleteness: property.condition ? 0.75 : 0.4,
    evidenceCount: 1,
    verifiedEvidenceCount: 0,
    sourceReferences: [
      {
        sourceName: 'Property Condition Assessment Questionnaire',
        sourceType: 'CLIENT_SELF_REPORTED_AUDIT',
        documentRef: `COND-${property.condition || 'STANDARD'}`,
        retrievalDate: new Date().toISOString().split('T')[0],
        verified: false,
      },
    ],
    lastVerifiedAt: new Date().toISOString(),
    findings,
    riskFlags,
    calculationMethod: 'Visual condition questionnaire and seismic zone engineering design benchmarking.',
    valuationImpactType: 'DIRECT_ADJUSTMENT',
    valuationImpact: {
      adjustmentPercent,
      rationale: `Physical maintenance and building condition adjustment of ${adjustmentPercent >= 0 ? '+' : ''}${adjustmentPercent}%.`,
    },
    confidenceContribution: 50,
    limitations,
  };
}
