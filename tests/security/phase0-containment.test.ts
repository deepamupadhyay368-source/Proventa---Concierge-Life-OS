import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculatePropertyValuation } from '@/lib/real-estate/valuation';
import { AHMEDABAD_LOCALITIES } from '@/lib/real-estate/constants';

// Mock auth session module
vi.mock('@/lib/auth/session', () => ({
  getSession: vi.fn(),
  requireAuth: vi.fn(),
}));

// Mock business auth-context module
vi.mock('@/lib/business/auth-context', () => ({
  getUserAuthorizedBusinesses: vi.fn(),
  resolveSupplierContext: vi.fn(),
}));

import { getSession } from '@/lib/auth/session';
import { getUserAuthorizedBusinesses } from '@/lib/business/auth-context';
import { GET as getRfqs } from '@/app/api/procurement/rfqs/route';
import { GET as getPaymentSummary } from '@/app/api/payment-intelligence/summary/route';
import { GET as getInvoices } from '@/app/api/payment-intelligence/invoices/route';
import { GET as getAuditLogs } from '@/app/api/payment-intelligence/audit/route';
import { NextRequest } from 'next/server';

describe('PROVENTA Phase 0: Production Integrity, Data Authenticity & Security Containment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('1. Data Authenticity & Removal of Synthetic Deeds', () => {
    it('does not generate synthetic sub-registrar deed numbers (DEED-2026-*)', () => {
      const result = calculatePropertyValuation({
        state: 'Gujarat',
        city: 'Ahmedabad',
        localitySlug: 'shela',
        propertyType: 'APARTMENT',
        carpetAreaSqFt: 1250,
      });

      // Assert no synthetic deed identifiers
      const transactionIds = result.comparableTransactions.map((t) => t.id);
      for (const id of transactionIds) {
        expect(id).not.toMatch(/^DEED-2026-/);
        expect(id).toMatch(/^BENCHMARK-SMPL-/);
      }

      // Assert comparable sources are qualified as benchmarks, not official SRO deeds
      for (const comp of result.comparableProperties) {
        expect(comp.source).not.toContain('AUDA Sub-Registrar / Market Registry Archive');
        expect(comp.verifiedStatus).not.toBe('VERIFIED');
        expect(['CALIBRATION_BENCHMARK', 'RESEARCH_OBSERVED', 'MODEL_BENCHMARK']).toContain(
          comp.verifiedStatus
        );
      }

      // Assert presence of micro-market calibration disclaimers
      const allDisclaimers = [...result.valuationAssumptions, ...result.dataLimitations].join(' ');
      expect(allDisclaimers).toContain('calibration');
      expect(allDisclaimers).toContain('Ahmedabad');
    });

    it('qualifies canonical localities with research calibration metadata', () => {
      for (const loc of AHMEDABAD_LOCALITIES) {
        expect(loc.dataFreshness).toContain('Calibration Benchmark');
        expect(loc.confidenceScore).toBeLessThanOrEqual(100);
      }
    });
  });

  describe('2. Legacy API Security Containment (Server-Side Auth Enforcement)', () => {
    it('blocks unauthenticated access to /api/procurement/rfqs with 401', async () => {
      vi.mocked(getSession).mockResolvedValue(null);

      const req = new Request('https://proventa.in/api/procurement/rfqs');
      const res = await getRfqs(req);
      const json = await res.json();

      expect(res.status).toBe(401);
      expect(json.success).toBe(false);
      expect(json.code).toBe('UNAUTHORIZED');
    });

    it('blocks non-admin users from accessing /api/procurement/rfqs?metrics=true with 403', async () => {
      vi.mocked(getSession).mockResolvedValue({
        user: { id: 'usr_buyer_1', email: 'buyer@test.in', roles: ['BUYER'] },
      } as any);

      const req = new Request('https://proventa.in/api/procurement/rfqs?metrics=true');
      const res = await getRfqs(req);
      const json = await res.json();

      expect(res.status).toBe(403);
      expect(json.success).toBe(false);
      expect(json.code).toBe('FORBIDDEN');
    });

    it('blocks unauthenticated access to /api/payment-intelligence/summary with 401', async () => {
      vi.mocked(getSession).mockResolvedValue(null);

      const req = new NextRequest('https://proventa.in/api/payment-intelligence/summary?buyerBusinessId=biz_123');
      const res = await getPaymentSummary(req);
      const json = await res.json();

      expect(res.status).toBe(401);
      expect(json.success).toBe(false);
      expect(json.code).toBe('UNAUTHORIZED');
    });

    it('blocks unauthorized access to /api/payment-intelligence/summary for a foreign business with 403', async () => {
      vi.mocked(getSession).mockResolvedValue({
        user: { id: 'usr_unauth', email: 'user@test.in', roles: ['BUYER'] },
      } as any);
      vi.mocked(getUserAuthorizedBusinesses).mockResolvedValue([
        { id: 'biz_own', businessName: 'Own Business' } as any,
      ]);

      const req = new NextRequest('https://proventa.in/api/payment-intelligence/summary?buyerBusinessId=biz_foreign');
      const res = await getPaymentSummary(req);
      const json = await res.json();

      expect(res.status).toBe(403);
      expect(json.success).toBe(false);
      expect(json.code).toBe('FORBIDDEN');
    });

    it('blocks unauthenticated access to /api/payment-intelligence/invoices with 401', async () => {
      vi.mocked(getSession).mockResolvedValue(null);

      const req = new NextRequest('https://proventa.in/api/payment-intelligence/invoices');
      const res = await getInvoices(req);
      const json = await res.json();

      expect(res.status).toBe(401);
      expect(json.success).toBe(false);
      expect(json.code).toBe('UNAUTHORIZED');
    });

    it('blocks unauthenticated access to /api/payment-intelligence/audit with 401', async () => {
      vi.mocked(getSession).mockResolvedValue(null);

      const req = new NextRequest('https://proventa.in/api/payment-intelligence/audit');
      const res = await getAuditLogs(req);
      const json = await res.json();

      expect(res.status).toBe(401);
      expect(json.success).toBe(false);
      expect(json.code).toBe('UNAUTHORIZED');
    });
  });
});
