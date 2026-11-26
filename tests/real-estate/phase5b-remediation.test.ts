import { describe, it, expect, vi } from 'vitest';
import { db } from '@/lib/db';
import { calculatePropertyValuation, UnsupportedAssetClassError } from '@/lib/real-estate/valuation';
import { checkEvidenceEligibility } from '@/lib/real-estate/eligibility';
import { GET as getProjects } from '@/app/api/projects/route';
import { GET as getProjectDetail } from '@/app/api/projects/[slug]/route';
import { POST as createOrder } from '@/app/api/price/pay/create-order/route';
import { NextRequest } from 'next/server';

describe('PROVENTA Phase 5B: Targeted Pre-Deployment Remediation Suite', () => {

  describe('1. Middleware & Public Route Authorisation Gates', () => {
    it('allows public access to published project dossiers and returns published data', async () => {
      const published = await db.project.findFirst({
        where: { publicationStatus: 'PUBLISHED', isPubliclyVisible: true },
      });
      expect(published).toBeDefined();

      const req = new NextRequest(`https://proventa.in/api/projects/${published!.slug}`, { method: 'GET' });
      const res = await getProjectDetail(req, { params: Promise.resolve({ slug: published!.slug }) });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.slug).toBe(published!.slug);
      expect(json.data.publicationStatus).toBe('PUBLISHED');
    });

    it('denies public access (404) to quarantined project dossiers', async () => {
      const quarantined = await db.project.findFirst({
        where: { publicationStatus: 'QUARANTINED' },
      });
      expect(quarantined).toBeDefined();

      const req = new NextRequest(`https://proventa.in/api/projects/${quarantined!.slug}`, { method: 'GET' });
      const res = await getProjectDetail(req, { params: Promise.resolve({ slug: quarantined!.slug }) });
      expect(res.status).toBe(404);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error).toContain('not found');
    });

    it('denies public access (404) to unverified draft project dossiers', async () => {
      const draft = await db.project.findFirst({
        where: { publicationStatus: 'UNVERIFIED_DRAFT' },
      });
      if (draft) {
        const req = new NextRequest(`https://proventa.in/api/projects/${draft.slug}`, { method: 'GET' });
        const res = await getProjectDetail(req, { params: Promise.resolve({ slug: draft.slug }) });
        expect(res.status).toBe(404);
      }
    });

    it('redirects merged aliases (307) to canonical published projects', async () => {
      const alias = await db.project.findFirst({
        where: { canonicalProjectId: { not: null } },
      });
      expect(alias).toBeDefined();

      const req = new NextRequest(`https://proventa.in/api/projects/${alias!.slug}`, { method: 'GET' });
      const res = await getProjectDetail(req, { params: Promise.resolve({ slug: alias!.slug }) });
      expect(res.status).toBe(307);
      const location = res.headers.get('location');
      expect(location).toBeDefined();
      expect(location).toContain('/api/projects/');
    });

    it('returns 404 for non-existent project slugs', async () => {
      const req = new NextRequest(`https://proventa.in/api/projects/non-existent-fictional-slug`, { method: 'GET' });
      const res = await getProjectDetail(req, { params: Promise.resolve({ slug: 'non-existent-fictional-slug' }) });
      expect(res.status).toBe(404);
    });

    it('allows public GET /api/projects returning strictly published projects without quarantined records', async () => {
      const req = new NextRequest('https://proventa.in/api/projects', { method: 'GET' });
      const res = await getProjects(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.length).toBeGreaterThan(0);

      // Verify no quarantined or merged aliases leak into directory
      for (const p of json.data) {
        expect(p.publicationStatus).toBe('PUBLISHED');
        expect(p.isPubliclyVisible).toBe(true);
        expect(p.canonicalProjectId).toBeNull();
      }
    });
  });

  describe('2. Blocker 03: Paid Valuation Evidence Eligibility Gate', () => {
    it('strictly rejects payment order creation for localities with insufficient verified deeds (<3)', async () => {
      // Find a locality with 0 or < 3 verified deeds (e.g., Gota, Science City, Bodakdev, or South Bopal [which now has 2])
      const southBopal = await db.locality.findFirst({ where: { slug: 'south-bopal' } });
      expect(southBopal).toBeDefined();

      const eligibility = await checkEvidenceEligibility(southBopal!.id, 'APARTMENT');
      expect(eligibility.eligible).toBe(false);
      expect(eligibility.code).toBe('INSUFFICIENT_LOCALITY_EVIDENCE');
      expect(eligibility.eligibleCount).toBeLessThan(3);
    });

    it('rejects commercial property valuation requests from payment eligibility', async () => {
      const southBopal = await db.locality.findFirst({ where: { slug: 'south-bopal' } });
      const eligibility = await checkEvidenceEligibility(southBopal!.id, 'COMMERCIAL');
      expect(eligibility.eligible).toBe(false);
      expect(eligibility.code).toBe('UNSUPPORTED_ASSET_CLASS');
    });

    it('blocks order creation via create-order route returning HTTP 422 with standard error', async () => {
      let testReq = await db.valuationRequest.findFirst({
        where: {
          payment: null,
          status: { notIn: ['COMPLETED', 'PAID'] },
        },
      });

      if (!testReq) {
        const locality = await db.locality.findFirst({ where: { slug: 'south-bopal' } });
        const user = await db.user.findFirst();
        if (locality && user) {
          testReq = await db.valuationRequest.create({
            data: {
              referenceNo: `VAL-TEST-${Date.now()}`,
              localityId: locality.id,
              userId: user.id,
              propertyType: 'APARTMENT',
              carpetAreaSqFt: 1100,
              bhk: 3,
              address: 'Flat 402, Block B, Test Residency, South Bopal',
              pincode: '380058',
              status: 'PENDING_PAYMENT',
            },
          });
        }
      }

      expect(testReq).toBeDefined();

      const req = new NextRequest('https://proventa.in/api/price/pay/create-order', {
        method: 'POST',
        body: JSON.stringify({ requestId: testReq!.id }),
      });
      const res = await createOrder(req);
      expect(res.status).toBe(422);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.code).toBe('INSUFFICIENT_LOCALITY_EVIDENCE');
      expect(json.error).toBe(
        'Paid valuation reports for this locality are temporarily disabled until sufficient verified registered transaction evidence is established.'
      );
    });

    it('excludes quarantined project transactions from eligible deed counts', async () => {
      const rejectedTx = await db.propertyTransaction.findMany({
        where: {
          verificationStatus: 'REJECTED',
        },
      });
      // 6 quarantined project transactions + 1 test artifact = 7
      expect(rejectedTx.length).toBe(7);
      for (const tx of rejectedTx) {
        expect(tx.confidenceScore).toBe(0.0);
        expect(tx.rejectionReason).toBeDefined();
      }
    });

    it('excludes test artifact DEED-ACTION-TEST-99 from eligible deeds', async () => {
      const testTx = await db.propertyTransaction.findFirst({
        where: { deedId: 'DEED-ACTION-TEST-99' },
      });
      expect(testTx).toBeDefined();
      expect(testTx!.verificationStatus).toBe('REJECTED');
      expect(testTx!.flagReason).toBe('TEST_ARTIFACT');
    });
  });

  describe('3. Valuation Confidence & Asset-Class Reconstruction', () => {
    it('throws UnsupportedAssetClassError when evaluating commercial properties', () => {
      expect(() => {
        calculatePropertyValuation({
          state: 'Gujarat',
          city: 'Ahmedabad',
          localitySlug: 'south-bopal',
          propertyType: 'COMMERCIAL',
          carpetAreaSqFt: 1200,
        });
      }).toThrow(UnsupportedAssetClassError);
    });

    it('sets valuationStatus to PRELIMINARY_RESEARCH and empirical confidence to 35% when verified transactions = 0', () => {
      const result = calculatePropertyValuation({
        state: 'Gujarat',
        city: 'Ahmedabad',
        localitySlug: 'bodakdev',
        propertyType: 'APARTMENT',
        carpetAreaSqFt: 1500,
        verifiedTransactionCount: 0,
      });

      expect(result.valuationStatus).toBe('PRELIMINARY_RESEARCH');
      expect(result.confidenceScore).toBe(35);
      expect(result.evidenceCount).toBe(0);
      expect(result.comparableTransactions.length).toBe(0);
      expect(result.evidenceBreakdown.length).toBe(7);

      const deedCategory = result.evidenceBreakdown.find((c) => c.category === 'PRIMARY_DEED_DOCUMENTS');
      expect(deedCategory).toBeDefined();
      expect(deedCategory!.observationCount).toBe(0);

      // Verify limitation warnings explicitly disclose preliminary research status
      expect(result.dataLimitations[0]).toContain('PRELIMINARY RESEARCH ESTIMATE');
    });

    it('does not report macro survey volume constants as registered deed counts', () => {
      const result = calculatePropertyValuation({
        state: 'Gujarat',
        city: 'Ahmedabad',
        localitySlug: 'shela',
        propertyType: 'APARTMENT',
        carpetAreaSqFt: 1200,
        verifiedTransactionCount: 0,
      });

      // evidenceCount must be 0 (actual verified deeds), NOT 410 (macro survey constant)
      expect(result.evidenceCount).toBe(0);
      expect(result.macroSurveyVolumeQuarter).toBe(410);
    });

    it('separates all 7 distinct evidence pillars in evidenceBreakdown', () => {
      const result = calculatePropertyValuation({
        state: 'Gujarat',
        city: 'Ahmedabad',
        localitySlug: 'south-bopal',
        propertyType: 'APARTMENT',
        carpetAreaSqFt: 1000,
        verifiedTransactionCount: 2,
      });

      const categories = result.evidenceBreakdown.map((e) => e.category);
      expect(categories).toContain('PRIMARY_DEED_DOCUMENTS');
      expect(categories).toContain('OFFICIAL_RECORD_CROSS_CHECKS');
      expect(categories).toContain('SECONDARY_MARKET_RESEARCH');
      expect(categories).toContain('ASKING_PRICE_OBSERVATIONS');
      expect(categories).toContain('JANTRI_BENCHMARKS');
      expect(categories).toContain('STATUTORY_PROJECT_INFORMATION');
      expect(categories).toContain('INFRASTRUCTURE_LOCALITY_RESEARCH');
    });

    it('scales empirical confidence dynamically when >= 3 verified transactions are provided', () => {
      const result = calculatePropertyValuation({
        state: 'Gujarat',
        city: 'Ahmedabad',
        localitySlug: 'south-bopal',
        propertyType: 'APARTMENT',
        carpetAreaSqFt: 1000,
        verifiedTransactionCount: 4,
      });

      expect(result.valuationStatus).toBe('VERIFIED_TRANSACTION_BACKED');
      expect(result.confidenceScore).toBe(75); // 55 + 4*5
      expect(result.evidenceCount).toBe(4);
    });
  });

  describe('4. Historical Database Integrity Preservation', () => {
    it('confirms all 24 historical project records are preserved in database', async () => {
      const count = await db.project.count();
      expect(count).toBe(24);
    });

    it('confirms all 16 transaction records are preserved in database', async () => {
      const count = await db.propertyTransaction.count();
      expect(count).toBe(16);
    });

    it('verifies evidence audit logs exist for all 7 reclassified transactions', async () => {
      const auditLogs = await db.evidenceAuditLog.findMany({
        where: { performedByUserId: 'system-phase5b-remediation' },
      });
      expect(auditLogs.length).toBe(7);
    });
  });
});
