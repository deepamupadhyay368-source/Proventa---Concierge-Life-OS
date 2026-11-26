import { db } from '@/lib/db';
import { DataSourceType } from '@prisma/client';

export interface OfficialSourceDescriptor {
  code: string;
  name: string;
  sourceType: DataSourceType;
  officialDomain: string;
  sourceCategory: string;
  dataCategories: string[];
  accessMethod: string;
  collectionMethod: 'MANUAL_STATUTORY_RESEARCH' | 'GAZETTE_EXTRACTION' | 'ON_DEMAND_ADMIN_TRIGGERED';
  statutoryEvidenceTier: 'PRIMARY_REGULATORY' | 'GOVERNMENT_GAZETTE' | 'MUNICIPAL_RECORD' | 'DEVELOPER_COLLATERAL';
  permissionStatus: string;
  provenanceUrl: string;
  verificationProtocol: string;
  collectionFrequency: string;
}

export const CANONICAL_OFFICIAL_SOURCES: OfficialSourceDescriptor[] = [
  {
    code: 'GUJRERA_OFFICIAL',
    name: 'Gujarat Real Estate Regulatory Authority (GujRERA)',
    sourceType: DataSourceType.RERA_FILING,
    officialDomain: 'gujrera.gujarat.gov.in',
    sourceCategory: 'RERA_REGULATORY',
    dataCategories: ['PROJECT_REGISTRATION', 'FORM_B_CARPET_AREA', 'QPR_PROGRESS', 'SANCTIONED_PLANS', 'REGULATORY_ORDERS'],
    accessMethod: 'MANUAL_PUBLIC_PORTAL_RESEARCH',
    collectionMethod: 'MANUAL_STATUTORY_RESEARCH',
    statutoryEvidenceTier: 'PRIMARY_REGULATORY',
    permissionStatus: 'PUBLIC_STATUTORY_DISCLOSURE_RERA_ACT_2016',
    provenanceUrl: 'https://gujrera.gujarat.gov.in',
    verificationProtocol: 'Manual inspection of GujRERA Project Registration Certificate & Quarterly Progress Report Audit. (No automated crawler or CAPTCHA bypass).',
    collectionFrequency: 'PERIODIC_AUDIT',
  },
  {
    code: 'GARVI_REVENUE_DEPT',
    name: 'Gujarat Revenue Dept. Inspector General of Registration (Garvi)',
    sourceType: DataSourceType.STATUTORY_REGISTRY,
    officialDomain: 'garvi.gujarat.gov.in',
    sourceCategory: 'REVENUE_SRO_DEED',
    dataCategories: ['REGISTERED_SALE_DEEDS', 'INDEX_II_EXTRACTS', 'STAMP_DUTY_RECORD'],
    accessMethod: 'SUB_REGISTRAR_INSPECTION_RECORDS',
    collectionMethod: 'MANUAL_STATUTORY_RESEARCH',
    statutoryEvidenceTier: 'PRIMARY_REGULATORY',
    permissionStatus: 'STATUTORY_PUBLIC_INSPECTION_INDIAN_REGISTRATION_ACT',
    provenanceUrl: 'https://garvi.gujarat.gov.in',
    verificationProtocol: 'Indexed Deed Document & Stamp Duty Verification via SRO Jurisdiction upon lawful procurement.',
    collectionFrequency: 'MONTHLY_INDEXING',
  },
  {
    code: 'AUDA_PLANNING_AUTHORITY',
    name: 'Ahmedabad Urban Development Authority (AUDA)',
    sourceType: DataSourceType.STATUTORY_REGISTRY,
    officialDomain: 'auda.org.in',
    sourceCategory: 'PLANNING_AUTHORITY_AUDA',
    dataCategories: ['DEVELOPMENT_PLAN', 'TP_SCHEME_MAPS', 'ZONING_REGULATIONS', 'INFRASTRUCTURE_RESERVATIONS'],
    accessMethod: 'SANCTIONED_DEVELOPMENT_PLAN_GAZETTE',
    collectionMethod: 'GAZETTE_EXTRACTION',
    statutoryEvidenceTier: 'GOVERNMENT_GAZETTE',
    permissionStatus: 'GOVERNMENT_OPEN_TOWN_PLANNING_RECORDS',
    provenanceUrl: 'https://auda.org.in',
    verificationProtocol: 'Sanctioned Comprehensive Development Plan 2021/2031 & TP Scheme Gazette',
    collectionFrequency: 'ON_REVISION',
  },
  {
    code: 'GUDA_PLANNING_AUTHORITY',
    name: 'Gandhinagar Urban Development Authority (GUDA)',
    sourceType: DataSourceType.STATUTORY_REGISTRY,
    officialDomain: 'guda.gujarat.gov.in',
    sourceCategory: 'PLANNING_AUTHORITY_GUDA',
    dataCategories: ['DEVELOPMENT_PLAN_GANDHINAGAR', 'TP_SCHEMES_KUDASAN_RAYSAN', 'SECTOR_PLANNING'],
    accessMethod: 'GUDA_DEVELOPMENT_PLAN_DISCLOSURE',
    collectionMethod: 'GAZETTE_EXTRACTION',
    statutoryEvidenceTier: 'GOVERNMENT_GAZETTE',
    permissionStatus: 'GOVERNMENT_STATUTORY_PLANNING_RECORDS',
    provenanceUrl: 'https://guda.gujarat.gov.in',
    verificationProtocol: 'Official Gandhinagar Urban Development Scheme and TP Verification',
    collectionFrequency: 'ON_REVISION',
  },
  {
    code: 'JANTRI_OFFICIAL_GAZETTE',
    name: 'Gujarat Revenue Dept. Annual Statement of Rates (Jantri)',
    sourceType: DataSourceType.STATUTORY_REGISTRY,
    officialDomain: 'revenuedepartment.gujarat.gov.in',
    sourceCategory: 'STATUTORY_JANTRI',
    dataCategories: ['JANTRI_CIRCLE_RATES', 'TP_SCHEME_RATES', 'SURVEY_NUMBER_VALUATIONS'],
    accessMethod: 'OFFICIAL_STATE_GAZETTE_RATE_SCHEDULE',
    collectionMethod: 'GAZETTE_EXTRACTION',
    statutoryEvidenceTier: 'GOVERNMENT_GAZETTE',
    permissionStatus: 'STATUTORY_MINIMUM_GUIDELINE_BENCHMARK',
    provenanceUrl: 'https://revenuedepartment.gujarat.gov.in',
    verificationProtocol: 'Superintendent of Stamps Circle Rate Schedule Notification',
    collectionFrequency: 'ON_REVISION',
  },
  {
    code: 'AMC_URBAN_CIVIC_PORTAL',
    name: 'Ahmedabad Municipal Corporation (AMC Building Permission)',
    sourceType: DataSourceType.STATUTORY_REGISTRY,
    officialDomain: 'ahmedabadcity.gov.in',
    sourceCategory: 'MUNICIPAL_AMC',
    dataCategories: ['BUILDING_PERMIT_SANCTIONS', 'COMMENCEMENT_CERTIFICATES', 'FIRE_SAFETY_NOC'],
    accessMethod: 'MUNICIPAL_TOWN_DEVELOPMENT_REGISTER',
    collectionMethod: 'GAZETTE_EXTRACTION',
    statutoryEvidenceTier: 'MUNICIPAL_RECORD',
    permissionStatus: 'PUBLIC_MUNICIPAL_RECORD',
    provenanceUrl: 'https://ahmedabadcity.gov.in',
    verificationProtocol: 'AMC Urban Development Sanction Order Inspection',
    collectionFrequency: 'BI_MONTHLY',
  },
  {
    code: 'OFFICIAL_DEVELOPER_DISCLOSURE',
    name: 'Verified Developer Statutory Marketing Disclosures & Brochures',
    sourceType: DataSourceType.DIRECT_SURVEY,
    officialDomain: 'proventa.in/sources/developer',
    sourceCategory: 'DEVELOPER_OFFICIAL',
    dataCategories: ['FLOOR_PLANS', 'SPECIFICATIONS_SHEETS', 'AMENITIES_DISCLOSURES'],
    accessMethod: 'AUTHORIZED_PROMOTER_COLLATERAL_VERIFICATION',
    collectionMethod: 'MANUAL_STATUTORY_RESEARCH',
    statutoryEvidenceTier: 'DEVELOPER_COLLATERAL',
    permissionStatus: 'PROMOTER_PUBLIC_MARKETING_COLLATERAL',
    provenanceUrl: 'https://proventa.in',
    verificationProtocol: 'Promoter-published architectural specifications cross-referenced with RERA Form B',
    collectionFrequency: 'ON_DEMAND',
  },
];

/**
 * Initializes and synchronizes canonical official sources with database
 */
export async function initializeOfficialSources() {
  const synced: any[] = [];
  for (const src of CANONICAL_OFFICIAL_SOURCES) {
    const record = await db.dataSource.upsert({
      where: { code: src.code },
      update: {
        name: src.name,
        sourceType: src.sourceType,
        officialDomain: src.officialDomain,
        sourceCategory: src.sourceCategory,
        dataCategories: src.dataCategories,
        accessMethod: src.accessMethod,
        permissionStatus: src.permissionStatus,
        provenanceUrl: src.provenanceUrl,
        verificationProtocol: src.verificationProtocol,
        reliabilityScore: 1.0,
        collectionFrequency: src.collectionFrequency,
        isApproved: true,
        healthStatus: 'HEALTHY',
        lastCheckedAt: new Date(),
      },
      create: {
        code: src.code,
        name: src.name,
        sourceType: src.sourceType,
        officialDomain: src.officialDomain,
        sourceCategory: src.sourceCategory,
        dataCategories: src.dataCategories,
        accessMethod: src.accessMethod,
        permissionStatus: src.permissionStatus,
        provenanceUrl: src.provenanceUrl,
        verificationProtocol: src.verificationProtocol,
        reliabilityScore: 1.0,
        collectionFrequency: src.collectionFrequency,
        isApproved: true,
        healthStatus: 'HEALTHY',
        lastCheckedAt: new Date(),
      },
    });
    synced.push(record);
  }
  return synced;
}

/**
 * Discovers and registers a newly discovered potential official source
 */
export async function registerDiscoveredSource(params: {
  code: string;
  name: string;
  sourceType: DataSourceType;
  officialDomain: string;
  sourceCategory: string;
  dataCategories: string[];
  accessMethod: string;
  permissionStatus: string;
  provenanceUrl: string;
  verificationProtocol?: string;
  reliabilityScore?: number;
  collectionFrequency?: string;
  requiresAdminApproval?: boolean;
}) {
  return await db.dataSource.upsert({
    where: { code: params.code },
    update: {
      name: params.name,
      officialDomain: params.officialDomain,
      sourceCategory: params.sourceCategory,
      dataCategories: params.dataCategories,
      accessMethod: params.accessMethod,
      permissionStatus: params.permissionStatus,
      provenanceUrl: params.provenanceUrl,
      lastCheckedAt: new Date(),
    },
    create: {
      code: params.code,
      name: params.name,
      sourceType: params.sourceType,
      officialDomain: params.officialDomain,
      sourceCategory: params.sourceCategory,
      dataCategories: params.dataCategories,
      accessMethod: params.accessMethod,
      permissionStatus: params.permissionStatus,
      provenanceUrl: params.provenanceUrl,
      verificationProtocol: params.verificationProtocol || 'Pending initial institutional verification protocol',
      reliabilityScore: params.reliabilityScore || 0.8,
      collectionFrequency: params.collectionFrequency || 'MONTHLY',
      isApproved: !params.requiresAdminApproval,
      healthStatus: 'HEALTHY',
      lastCheckedAt: new Date(),
    },
  });
}

/**
 * Checks health status of all registered sources
 */
export async function auditSourcesHealth() {
  const sources = await db.dataSource.findMany({
    orderBy: { reliabilityScore: 'desc' },
  });

  const summary = {
    totalSources: sources.length,
    healthyCount: sources.filter((s) => s.healthStatus === 'HEALTHY').length,
    approvedCount: sources.filter((s) => s.isApproved).length,
    sources: sources.map((s) => ({
      code: s.code,
      name: s.name,
      domain: s.officialDomain || s.provenanceUrl,
      category: s.sourceCategory,
      dataCategories: s.dataCategories,
      accessMethod: s.accessMethod,
      reliabilityScore: s.reliabilityScore,
      healthStatus: s.healthStatus,
      isApproved: s.isApproved,
      lastCheckedAt: s.lastCheckedAt,
      lastSuccessfulCollection: s.lastSuccessfulCollection,
    })),
  };

  return summary;
}
