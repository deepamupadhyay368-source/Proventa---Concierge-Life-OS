import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  importEvidenceCsv,
  checkTransactionDuplicate,
  checkListingDuplicate,
  checkJantriDuplicate,
  processEvidenceAction,
  assessLocalityCoverage,
  exportApprovedEvidenceCsv,
} from '@/lib/real-estate/evidence-service';
import { db } from '@/lib/db';
import { EvidenceVerificationStatus, ValuationEligibilityStatus } from '@prisma/client';

// Mock auth session module for API tests
vi.mock('@/lib/auth/session', () => ({
  getSession: vi.fn(),
  requireAuth: vi.fn(),
}));

import { getSession } from '@/lib/auth/session';
import { POST as importApi } from '@/app/api/admin/evidence/import/route';
import { POST as actionApi } from '@/app/api/admin/evidence/action/route';
import { GET as coverageApi } from '@/app/api/admin/evidence/coverage/route';
import { NextRequest } from 'next/server';

describe('PROVENTA Phase 1: Real Estate Data Intelligence Infrastructure Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('1. CSV Parsing, Validation & Default Status Guard', () => {
    it('validates and parses valid transaction CSV, defaulting to PENDING_VERIFICATION', async () => {
      const csv = `registrationDate,localitySlug,projectName,bhk,carpetAreaSqFt,transactedPriceLakhs,floor,totalFloors,subRegistrarOffice,deedId,sourceReference,remarks
2026-07-15,south-bopal,Aarohi Elegance,3,1150,68.5,4,12,Sanand SRO,TEST-DEED-001,VOL-12/PG-45,Arms-length secondary transfer`;

      const result = await importEvidenceCsv({
        entityType: 'TRANSACTIONS',
        csvText: csv,
        sourceId: (await db.dataSource.findFirst())?.id || 'src_sro_registry',
        userId: 'usr_admin_test',
        userEmail: 'admin@proventa.dev',
      });

      expect(result.success).toBe(true);
      expect(result.importedCount).toBe(1);
      expect(result.errorCount).toBe(0);

      const created = await db.propertyTransaction.findUnique({
        where: { id: result.importedIds[0] },
      });

      expect(created).toBeDefined();
      expect(created?.verificationStatus).toBe(EvidenceVerificationStatus.PENDING_VERIFICATION);
      expect(created?.carpetAreaSqFt).toBe(1150);
      expect(created?.transactedPriceLakhs).toBe(68.5);
      expect(created?.totalPriceRupees).toBe(6850000);
      expect(created?.derivedRateSqFt).toBe(Math.round(6850000 / 1150));

      // Clean up test record
      await db.propertyTransaction.delete({ where: { id: result.importedIds[0] } });
    });

    it('rejects invalid CSV rows with missing required columns or negative values', async () => {
      const badCsv = `registrationDate,localitySlug,carpetAreaSqFt,transactedPriceLakhs
2026-07-15,invalid-nonexistent-locality,1150,68.5
invalid-date,south-bopal,1150,68.5
2026-07-15,south-bopal,-500,68.5
2026-07-15,south-bopal,1150,-10`;

      const result = await importEvidenceCsv({
        entityType: 'TRANSACTIONS',
        csvText: badCsv,
        sourceId: 'src_sro_registry',
        userId: 'usr_admin_test',
      });

      expect(result.importedCount).toBe(0);
      expect(result.errorCount).toBe(4);
      expect(result.errors.length).toBe(4);
    });
  });

  describe('2. Duplicate Detection Engine', () => {
    it('detects duplicate transactions by exact Deed ID match', async () => {
      // Create primary transaction
      const source = await db.dataSource.findFirst();
      const locality = await db.locality.findFirst({ where: { slug: 'shela' } });

      const primary = await db.propertyTransaction.create({
        data: {
          deedId: 'DEED-DUP-TEST-001',
          registrationDate: new Date('2026-05-10'),
          localityId: locality!.id,
          bhk: 3,
          carpetAreaSqFt: 1400,
          transactedPriceLakhs: 85.0,
          totalPriceRupees: 8500000,
          pricePerSqFtCarpet: 6071,
          derivedRateSqFt: 6071,
          sourceId: source!.id,
          verificationStatus: EvidenceVerificationStatus.PENDING_VERIFICATION,
        },
      });

      // Check duplicate
      const dupCheck = await checkTransactionDuplicate({
        localityId: locality!.id,
        deedId: 'DEED-DUP-TEST-001',
        carpetAreaSqFt: 1400,
        transactedPriceLakhs: 85.0,
        registrationDate: new Date('2026-05-10'),
      });

      expect(dupCheck.isDuplicate).toBe(true);
      expect(dupCheck.duplicateOfId).toBe(primary.id);
      expect(dupCheck.similarityScore).toBe(1.0);

      // Clean up
      await db.propertyTransaction.delete({ where: { id: primary.id } });
    });

    it('detects duplicate transactions by asset parameter tolerance match', async () => {
      const source = await db.dataSource.findFirst();
      const locality = await db.locality.findFirst({ where: { slug: 'shela' } });

      const primary = await db.propertyTransaction.create({
        data: {
          deedId: 'DEED-TOLERANCE-001',
          registrationDate: new Date('2026-06-01'),
          localityId: locality!.id,
          bhk: 3,
          carpetAreaSqFt: 1500,
          transactedPriceLakhs: 90.0,
          totalPriceRupees: 9000000,
          pricePerSqFtCarpet: 6000,
          derivedRateSqFt: 6000,
          floor: 5,
          sourceId: source!.id,
          verificationStatus: EvidenceVerificationStatus.PENDING_VERIFICATION,
        },
      });

      // Query with 1% variation in carpet area and price, 2 days apart
      const dupCheck = await checkTransactionDuplicate({
        localityId: locality!.id,
        carpetAreaSqFt: 1510,
        transactedPriceLakhs: 90.5,
        registrationDate: new Date('2026-06-03'),
        floor: 5,
      });

      expect(dupCheck.isDuplicate).toBe(true);
      expect(dupCheck.duplicateOfId).toBe(primary.id);

      // Clean up
      await db.propertyTransaction.delete({ where: { id: primary.id } });
    });
  });

  describe('3. Operational Verification Workflow & Audit Trail', () => {
    it('executes APPROVE, REJECT, FLAG, and CORRECT actions with audit logging', async () => {
      const source = await db.dataSource.findFirst();
      const locality = await db.locality.findFirst({ where: { slug: 'south-bopal' } });

      const tx = await db.propertyTransaction.create({
        data: {
          deedId: 'DEED-ACTION-TEST-99',
          registrationDate: new Date('2026-04-12'),
          localityId: locality!.id,
          bhk: 2,
          carpetAreaSqFt: 950,
          transactedPriceLakhs: 55.0,
          totalPriceRupees: 5500000,
          pricePerSqFtCarpet: 5789,
          derivedRateSqFt: 5789,
          sourceId: source!.id,
          verificationStatus: EvidenceVerificationStatus.PENDING_VERIFICATION,
        },
      });

      // 1. FLAG action
      await processEvidenceAction({
        entityType: 'TRANSACTION',
        entityId: tx.id,
        action: 'FLAG',
        reason: 'Suspected carpet area mismatch with developer plan',
        reviewerUserId: 'usr_officer_1',
      });

      const flagged = await db.propertyTransaction.findUnique({ where: { id: tx.id } });
      expect(flagged?.verificationStatus).toBe(EvidenceVerificationStatus.FLAGGED);
      expect(flagged?.flagReason).toContain('carpet area mismatch');

      // 2. CORRECT action
      await processEvidenceAction({
        entityType: 'TRANSACTION',
        entityId: tx.id,
        action: 'CORRECT',
        correctionData: {
          carpetAreaSqFt: 980,
          transactedPriceLakhs: 56.0,
        },
        reason: 'Updated carpet area based on scanned deed schedule',
        reviewerUserId: 'usr_officer_1',
      });

      const corrected = await db.propertyTransaction.findUnique({ where: { id: tx.id } });
      expect(corrected?.carpetAreaSqFt).toBe(980);
      expect(corrected?.transactedPriceLakhs).toBe(56.0);
      expect(corrected?.derivedRateSqFt).toBe(Math.round(5600000 / 980));

      // 3. APPROVE action
      await processEvidenceAction({
        entityType: 'TRANSACTION',
        entityId: tx.id,
        action: 'APPROVE',
        reviewerUserId: 'usr_officer_1',
      });

      const approved = await db.propertyTransaction.findUnique({ where: { id: tx.id } });
      expect(approved?.verificationStatus).toBe(EvidenceVerificationStatus.VERIFIED);
      expect(approved?.reviewedByUserId).toBe('usr_officer_1');
      expect(approved?.reviewedAt).toBeDefined();

      // Check Audit Trail
      const logs = await db.evidenceAuditLog.findMany({
        where: { transactionId: tx.id },
      });
      expect(logs.length).toBeGreaterThanOrEqual(3);

      // Clean up
      await db.evidenceAuditLog.deleteMany({ where: { transactionId: tx.id } });
      await db.propertyTransaction.delete({ where: { id: tx.id } });
    });
  });

  describe('4. Deterministic Coverage & Valuation Eligibility Rules', () => {
    it('accurately calculates evidence gaps and eligibility status based on explicit rules', async () => {
      const locality = await db.locality.findFirst({ where: { slug: 'shela' } });
      expect(locality).toBeDefined();

      const assessment = await assessLocalityCoverage(locality!.id);

      expect(assessment.localitySlug).toBe('shela');
      expect(assessment.totalRecords).toBeGreaterThanOrEqual(0);
      expect(assessment.valuationEligibility).toBeDefined();
      expect(Array.isArray(assessment.evidenceGaps)).toBe(true);

      // If verified transactions < 3, must report explicit gap
      if (assessment.verifiedTransactionsCount < 3) {
        expect(
          assessment.evidenceGaps.some((g) => g.includes('verified transaction density'))
        ).toBe(true);
        expect(assessment.valuationEligibility).not.toBe(
          ValuationEligibilityStatus.VERIFIED_VALUATION_ELIGIBLE
        );
      }
    });
  });

  describe('5. CSV Export Engine', () => {
    it('generates valid RFC-compliant CSV with full provenance metadata', async () => {
      const csv = await exportApprovedEvidenceCsv({
        entityType: 'TRANSACTIONS',
      });

      expect(typeof csv).toBe('string');
      const lines = csv.split('\n');
      expect(lines.length).toBeGreaterThanOrEqual(1);

      // Header verification
      const header = lines[0];
      expect(header).toContain('Record ID');
      expect(header).toContain('Registration Date');
      expect(header).toContain('Locality');
      expect(header).toContain('Carpet Area');
      expect(header).toContain('Derived Rate');
      expect(header).toContain('Source Name');
      expect(header).toContain('Status');
    });
  });

  describe('6. Admin Evidence APIs Security', () => {
    it('rejects unauthenticated requests to /api/admin/evidence/import with 401', async () => {
      vi.mocked(getSession).mockResolvedValue(null);

      const req = new NextRequest('https://proventa.in/api/admin/evidence/import', {
        method: 'POST',
        body: JSON.stringify({ entityType: 'TRANSACTIONS', csvText: 'test' }),
      });

      const res = await importApi(req);
      const json = await res.json();

      expect(res.status).toBe(401);
      expect(json.code).toBe('UNAUTHORIZED');
    });

    it('rejects non-admin requests to /api/admin/evidence/action with 403', async () => {
      vi.mocked(getSession).mockResolvedValue({
        user: { id: 'usr_regular_customer', roles: ['CUSTOMER'] },
      } as any);

      const req = new NextRequest('https://proventa.in/api/admin/evidence/action', {
        method: 'POST',
        body: JSON.stringify({ entityType: 'TRANSACTION', entityId: 'tx_123', action: 'APPROVE' }),
      });

      const res = await actionApi(req);
      const json = await res.json();

      expect(res.status).toBe(403);
      expect(json.code).toBe('FORBIDDEN');
    });

    it('rejects unauthenticated requests to /api/admin/evidence/coverage with 401', async () => {
      vi.mocked(getSession).mockResolvedValue(null);

      const req = new NextRequest('https://proventa.in/api/admin/evidence/coverage');
      const res = await coverageApi(req);
      const json = await res.json();

      expect(res.status).toBe(401);
      expect(json.code).toBe('UNAUTHORIZED');
    });
  });
});
