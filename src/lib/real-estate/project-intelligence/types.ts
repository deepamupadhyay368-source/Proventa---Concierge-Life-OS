/**
 * PROVENTA — Residential Project Intelligence Engine Types
 * Phase 2 Official Data Collection & AI Research Services
 */

export type ProjectSourceCategory =
  | 'RERA_REGULATORY'
  | 'REVENUE_SRO_DEED'
  | 'STATUTORY_JANTRI'
  | 'PLANNING_AUTHORITY_AUDA'
  | 'PLANNING_AUTHORITY_GUDA'
  | 'MUNICIPAL_AMC'
  | 'MUNICIPAL_GMC'
  | 'DEVELOPER_OFFICIAL';

export type TransparencyBadge =
  | 'OFFICIALLY_SOURCED'
  | 'OFFICIALLY_VERIFIED'
  | 'DEVELOPER_PROVIDED'
  | 'PENDING_VERIFICATION'
  | 'NOT_AVAILABLE'
  | 'OUTDATED_RECHECK_REQUIRED';

export interface DiscoveredProjectCandidate {
  externalReferenceId: string;
  sourceCode: string;
  rawProjectName: string;
  rawDeveloperName?: string;
  rawLocalityName: string;
  rawDistrictName: string;
  rawReraNumber?: string;
  rawData: Record<string, any>;
  matchConfidence?: number;
  duplicateOfProjectId?: string;
}

export interface ExtractedProjectProfile {
  projectName: string;
  developerName?: string;
  developerLegalEntity?: string;
  localitySlug: string;
  localityName: string;
  district: string;
  registeredAddress?: string;
  pincode?: string;
  reraRegistrationNumber: string;
  gujreraId?: string;
  reraApprovalDate?: Date;
  registrationValidityDate?: Date;
  completionYear?: number;
  buildingType?: string;
  projectType?: string;
  totalTowers?: number;
  totalUnits?: number;
  carpetAreaRangeMin?: number;
  carpetAreaRangeMax?: number;
  priceRangeMinLakhs?: number;
  priceRangeMaxLakhs?: number;
  openSpaceRatioPercent?: number;
  possessionStatus?: string;
  latitude?: number;
  longitude?: number;
  brochureUrl?: string;
  officialWebsiteUrl?: string;
  verificationBadge: TransparencyBadge;
  sourceCode: string;
  sourceDocumentRefs?: Array<{
    title: string;
    documentType: string;
    fileUrl: string;
    fileName: string;
    checksum?: string;
  }>;
  configurations: Array<{
    bhk: number;
    typology: string;
    carpetAreaSqFt: number;
    carpetAreaMinSqFt?: number;
    carpetAreaMaxSqFt?: number;
    superBuiltUpAreaSqFt?: number;
    totalUnitsInConfig?: number;
    bathroomsCount?: number;
    balconyCount?: number;
    indicativePriceMinLakhs?: number;
    indicativePriceMaxLakhs?: number;
  }>;
  specifications: Array<{
    category: string;
    featureName: string;
    specificationDetails: string;
    sourceType?: string;
  }>;
  amenities: Array<{
    category: string;
    amenityName: string;
    isVerifiedInRera: boolean;
  }>;
  constructionProgress?: Array<{
    reportingQuarter: string;
    asOfDate: Date;
    overallPercentage: number;
    structuralCompletionPct?: number;
    brickworkCompletionPct?: number;
    internalFinishingPct?: number;
    externalFinishingPct?: number;
    mepCompletionPct?: number;
    occupancyCertificateStatus?: string;
    inspectorNotes?: string;
  }>;
  regulatoryEvents?: Array<{
    eventType: string;
    eventDate: Date;
    regulatoryAuthority: string;
    orderNumber?: string;
    description: string;
    orderDocumentUrl?: string;
    impactAssessment?: string;
  }>;
}

export interface DuplicateDetectionResult {
  isDuplicate: boolean;
  matchType: 'EXACT_RERA' | 'EXACT_NAME_LOCALITY' | 'FUZZY_NAME_PROXIMITY' | 'NONE';
  confidenceScore: number;
  existingProjectId?: string;
  existingProjectName?: string;
  reasons: string[];
}

export interface MonitoringDiffResult {
  hasChanges: boolean;
  projectId: string;
  changedFields: string[];
  previousValues: Record<string, any>;
  newValues: Record<string, any>;
  changeSummary: string;
}
