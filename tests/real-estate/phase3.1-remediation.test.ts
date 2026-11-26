import { describe, it, expect, beforeAll } from 'vitest';
import { db } from '@/lib/db';
import { calculatePropertyValuation } from '@/lib/real-estate/valuation';
import * as fs from 'fs';
import * as path from 'path';

describe('PROVENTA Phase 3.1: Controlled Data Remediation & Statutory Governance Suite', () => {
  let checkpoint: any;

  beforeAll(() => {
    const checkpointPath = path.join(process.cwd(), 'prisma', 'pre-remediation-checkpoint.json');
    expect(fs.existsSync(checkpointPath)).toBe(true);
    checkpoint = JSON.parse(fs.readFileSync(checkpointPath, 'utf-8'));
  });

  describe('1. Database Preservation & Zero-Deletion Verification', () => {
    it('preserves all 24 original database project records with zero deletions', async () => {
      const currentProjects = await db.project.findMany();
      expect(currentProjects.length).toBe(24);
      expect(checkpoint.metadata.totalProjects).toBe(24);

      // Verify every original ID still exists
      const originalIds = checkpoint.projects.map((p: any) => p.id);
      const currentIds = currentProjects.map((p) => p.id);
      for (const id of originalIds) {
        expect(currentIds).toContain(id);
      }
    });

    it('preserves historical pre-remediation values in originalReraNumber', async () => {
      const reconciledProjects = await db.project.findMany({
        where: { originalReraNumber: { not: null } },
      });
      expect(reconciledProjects.length).toBeGreaterThanOrEqual(8);
      for (const p of reconciledProjects) {
        expect(p.originalReraNumber).toBeDefined();
        expect(p.originalReraNumber?.length).toBeGreaterThan(0);
      }
    });
  });

  describe('2. Quarantine Governance on Rejected Records', () => {
    it('quarantines Goyal Orchid Whitefield due to geographic mismatch in Bangalore', async () => {
      const records = await db.project.findMany({
        where: { name: { contains: 'Orchid Whitefield', mode: 'insensitive' } },
      });
      expect(records.length).toBe(2);
      for (const r of records) {
        expect(r.publicationStatus).toBe('QUARANTINED');
        expect(r.isPubliclyVisible).toBe(false);
        expect(r.verificationBadge).toBe('REJECTED');
        expect(r.quarantineReason).toContain('Bangalore');
      }
    });

    it('quarantines Aarohi Elegance due to disputed promoter entity pairing', async () => {
      const records = await db.project.findMany({
        where: { name: { contains: 'Aarohi Elegance', mode: 'insensitive' } },
      });
      expect(records.length).toBe(2);
      for (const r of records) {
        expect(r.publicationStatus).toBe('QUARANTINED');
        expect(r.isPubliclyVisible).toBe(false);
        expect(r.verificationBadge).toBe('REJECTED');
        expect(r.quarantineReason).toContain('Entity fabrication');
      }
    });

    it('quarantines Safal Parisar and clears fabricated RERA as PRE_RERA_COMPLETED', async () => {
      const records = await db.project.findMany({
        where: { name: { contains: 'Safal Parisar', mode: 'insensitive' } },
      });
      expect(records.length).toBe(2);
      for (const r of records) {
        expect(r.publicationStatus).toBe('QUARANTINED');
        expect(r.isPubliclyVisible).toBe(false);
        expect(r.assetClassification).toBe('PRE_RERA_COMPLETED');
        expect(r.reraNumber).toBeNull(); // Fabricated RERA number cleared
        expect(r.originalReraNumber).toBeDefined(); // Historical value preserved
      }
    });
  });

  describe('3. Commercial Asset Reclassification: Shivalik Curv', () => {
    it('classifies Shivalik Curv strictly as COMMERCIAL and removes residential configs', async () => {
      const curv = await db.project.findFirst({
        where: { name: { contains: 'Shivalik Curv', mode: 'insensitive' } },
        include: { configurations: true },
      });
      expect(curv).toBeDefined();
      expect(curv?.assetClassification).toBe('COMMERCIAL');
      expect(curv?.projectType).toBe('COMMERCIAL_OFFICE_TOWER');
      expect(curv?.reraNumber).toBe('PR/GJ/GANDHINAGAR/GANDHINAGAR/GUD/CAA12514/A1C/191124/311229');
      expect(curv?.isPubliclyVisible).toBe(false); // Quarantined from residential search
      expect(curv?.configurations.length).toBe(0); // Zero residential configs
    });
  });

  describe('4. Entity Consolidation: Shilp Revanta', () => {
    it('links duplicate Shilp Revanta to canonical entity with audit trail', async () => {
      const canonical = await db.project.findUnique({
        where: { id: 'cmwx6lr52000d124fwptqip1o' },
      });
      const duplicate = await db.project.findUnique({
        where: { id: 'cmwx8w9lz000eo7kwhyrvp7nq' },
      });

      expect(canonical).toBeDefined();
      expect(canonical?.publicationStatus).toBe('PUBLISHED');
      expect(canonical?.isPubliclyVisible).toBe(true);
      expect(canonical?.totalUnits).toBe(802);
      expect(canonical?.totalTowers).toBe(13);
      expect(canonical?.reraNumber).toBe('PR/GJ/AHMEDABAD/SANAND/AUDA/MAA07874/050121');
      expect(canonical?.promoterLegalEntity).toBe('AYB Buildcon LLP');

      expect(duplicate).toBeDefined();
      expect(duplicate?.publicationStatus).toBe('MERGED_ALIAS');
      expect(duplicate?.isPubliclyVisible).toBe(false);
      expect(duplicate?.canonicalProjectId).toBe(canonical!.id);

      const mergeLog = await db.entityMergeLog.findFirst({
        where: { targetProjectId: canonical!.id },
      });
      expect(mergeLog).toBeDefined();
      expect(mergeLog?.approvedBy).toBe('CHIEF_DATA_OFFICER');
    });
  });

  describe('5. Statutory Reconciliation of Partially Verified Projects', () => {
    it('verifies Sun Atmosphere with official GujRERA MAA07770 and Sun Builders Projects LLP', async () => {
      const project = await db.project.findFirst({
        where: { name: { contains: 'Sun Atmosphere', mode: 'insensitive' } },
      });
      expect(project).toBeDefined();
      expect(project?.reraNumber).toBe('PR/GJ/AHMEDABAD/AHMEDABAD CITY/AUDA/MAA07770/141220');
      expect(project?.promoterLegalEntity).toBe('Sun Builders Projects LLP');
      expect(project?.totalUnits).toBe(872);
      expect(project?.totalTowers).toBe(16);
      expect(project?.verificationBadge).toBe('OFFICIALLY_VERIFIED');
      expect(project?.publicationStatus).toBe('PUBLISHED');
      expect(project?.isPubliclyVisible).toBe(true);
    });

    it('verifies Shivalik Edge with official GujRERA RAA07880 and 48 units', async () => {
      const project = await db.project.findFirst({
        where: { name: { contains: 'Shivalik Edge', mode: 'insensitive' } },
      });
      expect(project).toBeDefined();
      expect(project?.reraNumber).toBe('PR/GJ/AHMEDABAD/AHMEDABAD CITY/AUDA/RAA07880/070121');
      expect(project?.promoterLegalEntity).toBe('Sharanam Construction Private Limited');
      expect(project?.totalUnits).toBe(48);
      expect(project?.totalTowers).toBe(1);
      expect(project?.verificationBadge).toBe('OFFICIALLY_VERIFIED');
      expect(project?.publicationStatus).toBe('PUBLISHED');
      expect(project?.isPubliclyVisible).toBe(true);
    });

    it('verifies Shivalik Sharda Parkview with official GujRERA RAA00546', async () => {
      const project = await db.project.findFirst({
        where: { name: { contains: 'Parkview', mode: 'insensitive' } },
      });
      expect(project).toBeDefined();
      expect(project?.reraNumber).toBe('PR/GJ/AHMEDABAD/AHMEDABAD CITY/AUDA/RAA00546/271017');
      expect(project?.promoterLegalEntity).toBe('Shivalik Jhanvi Infraspace LLP');
      expect(project?.verificationBadge).toBe('OFFICIALLY_VERIFIED');
      expect(project?.publicationStatus).toBe('PUBLISHED');
    });

    it('verifies Shilp Shaligram with official GujRERA RAA04413 and Aahna Buildspace LLP', async () => {
      const project = await db.project.findFirst({
        where: { name: { contains: 'Shilp Shaligram', mode: 'insensitive' } },
      });
      expect(project).toBeDefined();
      expect(project?.reraNumber).toBe('PR/GJ/AHMEDABAD/AHMEDABAD CITY/AUDA/RAA04413/A2R/261221');
      expect(project?.promoterLegalEntity).toBe('Aahna Buildspace LLP');
      expect(project?.verificationBadge).toBe('OFFICIALLY_VERIFIED');
      expect(project?.publicationStatus).toBe('PUBLISHED');
    });
  });

  describe('6. Public Query Governance & Publication Rules', () => {
    it('returns only approved PUBLISHED projects in default public directory search', async () => {
      const publicProjects = await db.project.findMany({
        where: {
          isPubliclyVisible: true,
          publicationStatus: 'PUBLISHED',
        },
      });

      // Exactly 11 projects approved for publication
      expect(publicProjects.length).toBe(11);

      // Verify no quarantined or rejected project is in the public list
      const names = publicProjects.map((p) => p.name);
      expect(names).not.toContain('Goyal Orchid Whitefield');
      expect(names).not.toContain('Aarohi Elegance');
      expect(names).not.toContain('Safal Parisar');
      expect(names).not.toContain('Shivalik Curv');
      expect(names).not.toContain('Silver Pearl');
      expect(names).not.toContain('Spacious 53');
      expect(names).not.toContain('Sky City Shela');
    });
  });

  describe('7. PROVENTA PRICE Valuation Engine Protection', () => {
    it('excludes quarantined and rejected projects from valuation comparable matching', () => {
      // Query valuation with quarantined project name
      const result = calculatePropertyValuation({
        state: 'Gujarat',
        city: 'Ahmedabad',
        localitySlug: 'south-bopal',
        propertyType: 'APARTMENT',
        projectName: 'Aarohi Elegance', // Quarantined project
        carpetAreaSqFt: 1000,
        bedrooms: 3,
      });

      // Verify base rate is not warped by quarantined project
      expect(result.estimatedMidpointLakhs).toBeGreaterThan(0);
      // Verify comparables do not label quarantined project as verified
      for (const comp of result.comparableTransactions) {
        expect(comp.projectName).not.toContain('Aarohi Elegance');
      }
    });

    it('preserves verified transaction records and rejects synthetic fabrication', async () => {
      const transactions = await db.propertyTransaction.findMany();
      expect(transactions.length).toBe(16);
      for (const tx of transactions) {
        expect(tx.verificationStatus).toBe('VERIFIED');
        expect(tx.deedId || tx.sourceReference).toBeDefined();
      }
    });
  });
});
