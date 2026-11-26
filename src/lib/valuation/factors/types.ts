export type FactorId =
  | 'FACTOR_01_PROPERTY_CHARACTERISTICS'
  | 'FACTOR_02_PROJECT_DEVELOPER_QUALITY'
  | 'FACTOR_03_LOCATION_MICRO_MARKET'
  | 'FACTOR_04_EXISTING_INFRASTRUCTURE'
  | 'FACTOR_05_UPCOMING_INFRASTRUCTURE'
  | 'FACTOR_06_REGISTERED_TRANSACTIONS'
  | 'FACTOR_07_MARKET_SUPPLY_DEMAND'
  | 'FACTOR_08_LEGAL_STATUTORY'
  | 'FACTOR_09_BUILDING_CONDITION'
  | 'FACTOR_10_ENVIRONMENTAL_RISKS'
  | 'FACTOR_11_FINANCIAL_OWNERSHIP_COSTS'
  | 'FACTOR_12_ECONOMIC_MARKET_TRENDS';

export type ImplementationStatus =
  | 'IMPLEMENTED'
  | 'PARTIALLY_IMPLEMENTED'
  | 'DATA_UNAVAILABLE'
  | 'AWAITING_VERIFICATION';

export type AssessmentStatus =
  | 'VERIFIED'
  | 'PARTIALLY_VERIFIED'
  | 'UNVERIFIED'
  | 'INSUFFICIENT_DATA'
  | 'NOT_APPLICABLE';

export type ValuationImpactType =
  | 'DIRECT_ADJUSTMENT'
  | 'CONTEXTUAL_ONLY'
  | 'RISK_GATE'
  | 'OWNERSHIP_COST'
  | 'VALIDATION_ONLY'
  | 'NOT_ASSESSED';

export interface SourceReference {
  sourceName: string;
  sourceType: string;
  documentRef?: string;
  retrievalDate?: string;
  verified: boolean;
}

export interface ValuationImpact {
  adjustmentPercent?: number; // e.g. +3.5%
  adjustmentLakhs?: number;
  costEstimateRupees?: number; // For Factor 11
  gateAction?: 'ALLOW' | 'RESTRICT' | 'BLOCK'; // For Factor 08 & risk gates
  rationale: string;
}

export interface FactorAnalysisResult {
  factorId: FactorId;
  factorName: string;
  implementationStatus: ImplementationStatus;
  assessmentStatus: AssessmentStatus;
  inputCompleteness: number; // 0.0 - 1.0 (proportion of required inputs supplied)
  evidenceCount: number;
  verifiedEvidenceCount: number;
  sourceReferences: SourceReference[];
  lastVerifiedAt: string;
  findings: string[];
  riskFlags: string[];
  calculationMethod: string;
  valuationImpactType: ValuationImpactType;
  valuationImpact: ValuationImpact;
  confidenceContribution: number; // 0 - 100
  limitations: string[];
}

export interface ValuationPropertyInput {
  carpetAreaSqFt: number;
  builtUpAreaSqFt?: number | null;
  superBuiltUpAreaSqFt?: number | null;
  bhk: number;
  floor?: number | null;
  totalFloors?: number | null;
  propertyAgeYears?: number | null;
  condition?: string | null;
  furnishingStatus?: string | null;
  parkingSpaces?: number | null;
  facing?: string | null;
  balconies?: number | null;
  layoutEfficiency?: 'EFFICIENT' | 'STANDARD' | 'IRREGULAR' | null;
  hasTerrace?: boolean | null;
}

export interface ValuationContextInput {
  propertyType: string;
  localityId: string;
  localitySlug: string;
  localityName: string;
  district: string;
  address: string;
  pincode: string;
  projectId?: string | null;
  projectName?: string | null;
  askingPriceLakhs?: number | null;
  targetOfferLakhs?: number | null;
  titleClearanceSelfReported?: boolean | null;
  occupancyCertificateStatus?: string | null;
  buildingUsePermissionStatus?: string | null;
  verifiedTransactions?: Array<{
    id: string;
    deedId: string | null;
    date: Date;
    carpetAreaSqFt: number;
    transactedPriceLakhs: number;
    pricePerSqFtCarpet: number;
    projectName?: string | null;
  }>;
}
