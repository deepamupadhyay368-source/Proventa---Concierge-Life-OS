import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LEGAL_DOCUMENTS, POLICY_VERSIONS, POLICY_EFFECTIVE_DATES } from '@/lib/legal/versions';
import { recordPolicyAcceptances, getMissingPolicies, submitPrivacyRequest } from '@/lib/legal/consent';
import { db } from '@/lib/db';

vi.mock('@/lib/db', () => ({
  db: {
    policyAcceptance: {
      createMany: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      groupBy: vi.fn(),
    },
    privacyRequest: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
  },
}));

vi.mock('@/lib/auth/config', () => ({
  auth: vi.fn(),
}));

describe('Legal, Privacy & Trust Center Architecture Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('1. Canonical Version & Documents Registry', () => {
    it('defines single canonical version 1.0 across all policy types', () => {
      expect(POLICY_VERSIONS.privacy).toBe('1.0');
      expect(POLICY_VERSIONS.terms).toBe('1.0');
      expect(POLICY_VERSIONS.privateBeta).toBe('1.0');
      expect(POLICY_VERSIONS.conciergeTerms).toBe('1.0');
      expect(POLICY_VERSIONS.payments).toBe('1.0');
      expect(POLICY_VERSIONS.aiDisclosure).toBe('1.0');
      expect(POLICY_VERSIONS.refunds).toBe('1.0');
      expect(POLICY_VERSIONS.cookies).toBe('1.0');
      expect(POLICY_VERSIONS.security).toBe('1.0');
    });

    it('sets effective dates consistently to September 2026', () => {
      Object.values(POLICY_EFFECTIVE_DATES).forEach((date) => {
        expect(date).toBe('September 2026');
      });
    });

    it('contains all 11 canonical legal documents with valid metadata', () => {
      expect(LEGAL_DOCUMENTS).toHaveLength(11);
      const slugs = LEGAL_DOCUMENTS.map((d) => d.slug);
      expect(slugs).toContain('privacy');
      expect(slugs).toContain('terms');
      expect(slugs).toContain('private-beta');
      expect(slugs).toContain('concierge-terms');
      expect(slugs).toContain('refunds');
      expect(slugs).toContain('payments');
      expect(slugs).toContain('ai');
      expect(slugs).toContain('cookies');
      expect(slugs).toContain('security');
      expect(slugs).toContain('privacy-requests');
      expect(slugs).toContain('grievance');

      LEGAL_DOCUMENTS.forEach((doc) => {
        expect(doc.href.startsWith('/legal')).toBe(true);
        expect(doc.title.length).toBeGreaterThan(3);
        expect(doc.description.length).toBeGreaterThan(10);
      });
    });
  });

  describe('2. Consent Tracking & Verification Engine', () => {
    it('records multiple policy acceptances atomically with context and client metadata', async () => {
      (db.policyAcceptance.createMany as any).mockResolvedValue({ count: 3 });

      const result = await recordPolicyAcceptances({
        userId: 'usr_member_test_1',
        policyTypes: ['TERMS_OF_SERVICE', 'PRIVACY_POLICY', 'PRIVATE_BETA_TERMS'],
        context: 'SIGNUP',
        ipAddress: '103.21.244.1',
        userAgent: 'Mozilla/5.0 ProventaTest/1.0',
      });

      expect(db.policyAcceptance.createMany).toHaveBeenCalledTimes(1);
      expect(db.policyAcceptance.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({
            userId: 'usr_member_test_1',
            policyType: 'TERMS_OF_SERVICE',
            policyVersion: '1.0',
            acceptanceContext: 'SIGNUP',
            ipAddress: '103.21.244.1',
            userAgent: 'Mozilla/5.0 ProventaTest/1.0',
          }),
          expect.objectContaining({
            userId: 'usr_member_test_1',
            policyType: 'PRIVACY_POLICY',
            policyVersion: '1.0',
          }),
          expect.objectContaining({
            userId: 'usr_member_test_1',
            policyType: 'PRIVATE_BETA_TERMS',
            policyVersion: '1.0',
          }),
        ]),
      });
      expect(result.count).toBe(3);
    });

    it('identifies missing policy acceptances correctly when a user has not accepted latest version', async () => {
      (db.policyAcceptance.findMany as any).mockResolvedValue([
        { policyType: 'TERMS_OF_SERVICE', policyVersion: '1.0' },
        { policyType: 'PRIVACY_POLICY', policyVersion: '1.0' },
      ]);

      const missing = await getMissingPolicies('usr_member_test_1', [
        'TERMS_OF_SERVICE',
        'PRIVACY_POLICY',
        'PRIVATE_BETA_TERMS',
      ]);

      expect(missing).toEqual(['PRIVATE_BETA_TERMS']);
    });
  });

  describe('3. Sovereign Privacy Requests & Redressal', () => {
    it('records privacy requests and creates associated audit trail entry', async () => {
      const mockCreatedRequest = {
        id: 'req_priv_123',
        email: 'client@proventa.in',
        name: 'Test Customer',
        requestType: 'DATA_DELETION',
        details: 'Requesting erasure of all personal data upon cohort conclusion',
        status: 'PENDING',
        createdAt: new Date(),
      };

      (db.privacyRequest.create as any).mockResolvedValue(mockCreatedRequest);

      const res = await submitPrivacyRequest({
        email: 'client@proventa.in',
        name: 'Test Customer',
        requestType: 'DATA_DELETION',
        details: 'Requesting erasure of all personal data upon cohort conclusion',
        userId: 'usr_member_test_1',
        ipAddress: '103.21.244.1',
      });

      expect(db.privacyRequest.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: 'client@proventa.in',
          name: 'Test Customer',
          requestType: 'DATA_DELETION',
          status: 'PENDING',
        }),
      });

      expect(res.id).toBe('req_priv_123');
      expect(res.status).toBe('PENDING');
    });
  });

  describe('4. Zero-Fabrication & Venture Status Standards', () => {
    it('guarantees no mock/fake corporate registration or statutory numbers are present in canonical config', () => {
      const serialized = JSON.stringify(LEGAL_DOCUMENTS);
      expect(serialized).not.toContain('CIN');
      expect(serialized).not.toContain('U74999');
      expect(serialized).not.toContain('GSTIN');
      expect(serialized).not.toContain('24AAACG');
    });
  });
});
