import { describe, it, expect, beforeAll } from 'vitest';
import { db } from '@/lib/db';
import {
  initializeOfficialSources,
  auditSourcesHealth,
  detectProjectDuplicate,
  resolveCandidateDecision,
  parseOfficialDocument,
  ingestProjectProfile,
  monitorAndSyncProject,
} from '@/lib/real-estate/project-intelligence';
import { SourceDocumentType, EvidenceVerificationStatus } from '@prisma/client';

describe('PROVENTA Phase 2: Official Residential Project Intelligence Suite', () => {
  beforeAll(async () => {
    // Ensure canonical sources are initialized
    await initializeOfficialSources();
  });

  describe('1. Official Source Registry & Governance', () => {
    it('initializes statutory official data sources with correct provenance and categories', async () => {
      const summary = await auditSourcesHealth();
      expect(summary.totalSources).toBeGreaterThanOrEqual(7);
      expect(summary.healthyCount).toBe(summary.totalSources);

      const reraSource = summary.sources.find((s) => s.code === 'GUJRERA_OFFICIAL');
      expect(reraSource).toBeDefined();
      expect(reraSource?.category).toBe('RERA_REGULATORY');
      expect(reraSource?.reliabilityScore).toBeGreaterThanOrEqual(0.95);
      expect(reraSource?.isApproved).toBe(true);

      const audaSource = summary.sources.find((s) => s.code === 'AUDA_PLANNING_AUTHORITY');
      expect(audaSource).toBeDefined();
      expect(audaSource?.category).toBe('PLANNING_AUTHORITY_AUDA');
    });
  });

  describe('2. Duplicate Detection Engine (Service 4)', () => {
    it('detects duplicate projects by exact statutory Gujarat RERA number', async () => {
      const existing = await db.project.findFirst({
        where: { reraNumber: { not: null } },
      });
      expect(existing).toBeDefined();

      const result = await detectProjectDuplicate({
        projectName: 'Completely Different Name',
        reraNumber: existing!.reraNumber!,
      });

      expect(result.isDuplicate).toBe(true);
      expect(result.matchType).toBe('EXACT_RERA');
      expect(result.confidenceScore).toBe(1.0);
      expect(result.existingProjectId).toBe(existing!.id);
    });

    it('detects duplicate projects by exact name within same micro-market', async () => {
      const existing = await db.project.findFirst({
        include: { locality: true },
      });
      expect(existing).toBeDefined();

      const result = await detectProjectDuplicate({
        projectName: existing!.name,
        localityId: existing!.localityId,
      });

      expect(result.isDuplicate).toBe(true);
      expect(result.matchType).toBe('EXACT_NAME_LOCALITY');
      expect(result.confidenceScore).toBeGreaterThanOrEqual(0.95);
      expect(result.existingProjectId).toBe(existing!.id);
    });

    it('identifies unique candidate with no duplicates', async () => {
      const result = await detectProjectDuplicate({
        projectName: 'Non-Existent Futuristic Tower 999',
        reraNumber: 'PR/GJ/AHMEDABAD/UNIQUE/RAA99999/010129',
      });

      expect(result.isDuplicate).toBe(false);
      expect(result.matchType).toBe('NONE');
    });
  });

  describe('3. Official Document Research Agent (Service 2)', () => {
    it('extracts structured Form-B configurations and retains document provenance', async () => {
      const mockPayload = {
        configurations: [
          { bhk: 2, typology: '2 BHK Smart', carpetAreaSqFt: 840, superBuiltUpAreaSqFt: 1300 },
          { bhk: 3, typology: '3 BHK Grande', carpetAreaSqFt: 1220, superBuiltUpAreaSqFt: 1850 },
        ],
        specifications: [
          { category: 'STRUCTURE', featureName: 'Seismic RCC', specificationDetails: 'Zone 3 compliant' },
        ],
        amenities: ['Clubhouse', 'Swimming Pool'],
        progress: {
          reportingQuarter: 'Q4 2024',
          overallPercentage: 92,
          occupancyCertificateStatus: 'IN_PROGRESS',
        },
        pageSectionRef: 'Form B Schedule A',
      };

      const extracted = await parseOfficialDocument({
        documentType: SourceDocumentType.RERA_APPROVAL_CERTIFICATE,
        documentTitle: 'GujRERA Form B Filing',
        fileUrl: 'https://gujrera.gujarat.gov.in/doc/test.pdf',
        fileName: 'test.pdf',
        sourceCode: 'GUJRERA_OFFICIAL',
        rawContentOrPayload: mockPayload,
      });

      expect(extracted.documentTitle).toBe('GujRERA Form B Filing');
      expect(extracted.extractedConfigurations?.length).toBe(2);
      expect(extracted.extractedConfigurations![0].carpetAreaSqFt).toBe(840);
      expect(extracted.extractedSpecifications?.length).toBe(1);
      expect(extracted.extractedAmenities?.length).toBe(2);
      expect(extracted.extractedProgress?.overallPercentage).toBe(92);
      expect(extracted.provenance.sourceCode).toBe('GUJRERA_OFFICIAL');
      expect(extracted.provenance.pageSectionRef).toBe('Form B Schedule A');
    });
  });

  describe('4. Project Information Ingestion & Database Integrity (Service 3)', () => {
    it('ingests complete structured residential project profile with relations', async () => {
      const testSlug = `test-tower-${Date.now()}`;
      const profile = {
        projectName: 'Test Residency Elite',
        developerName: 'Shilp Group',
        localitySlug: 'south-bopal',
        localityName: 'South Bopal',
        district: 'Ahmedabad',
        reraRegistrationNumber: `PR/GJ/AHMEDABAD/TEST/RAA${Date.now().toString().slice(-5)}/010125`,
        completionYear: 2025,
        totalTowers: 2,
        totalUnits: 120,
        carpetAreaRangeMin: 850,
        carpetAreaRangeMax: 1350,
        priceRangeMinLakhs: 60,
        priceRangeMaxLakhs: 90,
        verificationBadge: 'OFFICIALLY_VERIFIED' as const,
        sourceCode: 'GUJRERA_OFFICIAL',
        configurations: [
          { bhk: 2, typology: '2 BHK Comfort', carpetAreaSqFt: 850 },
          { bhk: 3, typology: '3 BHK Luxury', carpetAreaSqFt: 1350 },
        ],
        specifications: [
          { category: 'FLOORING', featureName: 'Vitrified Tiles', specificationDetails: '800x800mm' },
        ],
        amenities: [
          { category: 'FITNESS', amenityName: 'Gymnasium', isVerifiedInRera: true },
        ],
      };

      const result = await ingestProjectProfile(profile);

      expect(result.projectId).toBeDefined();
      expect(result.configurationsCount).toBe(2);
      expect(result.specificationsCount).toBe(1);
      expect(result.amenitiesCount).toBe(1);
      expect(result.verificationBadge).toBe('OFFICIALLY_VERIFIED');

      // Verify in DB
      const inDb = await db.project.findUnique({
        where: { id: result.projectId },
        include: { configurations: true, specifications: true, amenities: true },
      });

      expect(inDb).toBeDefined();
      expect(inDb?.configurations.length).toBe(2);
      expect(inDb?.specifications.length).toBe(1);
      expect(inDb?.amenities.length).toBe(1);

      // Clean up test project
      await db.projectConfiguration.deleteMany({ where: { projectId: result.projectId } });
      await db.projectSpecification.deleteMany({ where: { projectId: result.projectId } });
      await db.projectAmenity.deleteMany({ where: { projectId: result.projectId } });
      await db.project.delete({ where: { id: result.projectId } });
    });
  });

  describe('5. Continuous Monitoring & Snapshot History (Service 5)', () => {
    it('detects field updates and creates immutable historical snapshots', async () => {
      const project = await db.project.findFirst();
      expect(project).toBeDefined();

      const diff = await monitorAndSyncProject({
        projectId: project!.id,
        sourceCode: 'GUJRERA_OFFICIAL',
        latestObservedData: {
          possessionStatus: 'Ready to Move — Possession Certified',
        },
        changeType: 'POSSESSION_UPDATE',
        reason: 'Automated test monitoring verification',
      });

      expect(diff.hasChanges).toBe(true);
      expect(diff.changedFields).toContain('possessionStatus');

      // Check snapshot in DB
      const snapshot = await db.projectHistoricalSnapshot.findFirst({
        where: { projectId: project!.id },
        orderBy: { snapshotDate: 'desc' },
      });

      expect(snapshot).toBeDefined();
      expect(snapshot?.changeType).toBe('POSSESSION_UPDATE');
    });
  });

  describe('6. Candidate Resolution Workflow', () => {
    it('resolves project candidate with administrative audit trail', async () => {
      const source = await db.dataSource.findFirst();
      const candidate = await db.projectCandidate.create({
        data: {
          sourceId: source!.id,
          rawProjectName: 'Candidate Test Tower',
          rawLocalityName: 'Shela',
          rawDistrictName: 'Ahmedabad',
          rawDataJson: { test: true },
        },
      });

      const updated = await resolveCandidateDecision({
        candidateId: candidate.id,
        decision: 'APPROVED_NEW',
        reviewerUserId: 'admin_officer_test',
        notes: 'Verified against official RERA gazette',
      });

      expect(updated.reviewStatus).toBe('APPROVED_NEW');
      expect(updated.reviewedByUserId).toBe('admin_officer_test');
      expect(updated.reviewerNotes).toBe('Verified against official RERA gazette');

      // Clean up
      await db.projectCandidate.delete({ where: { id: candidate.id } });
    });
  });
});
