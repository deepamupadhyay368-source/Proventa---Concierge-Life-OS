/**
 * PROVENTA — Family Protection & Insurance Records Module
 * 
 * Administrative recordkeeping for life, health, property, and vehicle policies.
 * Informational only: does NOT sell policies or provide personalized investment advice.
 */

import {
  InsurancePolicyDTO,
  InsuranceType,
  RepaymentFrequency,
} from './types';
import { formatInr } from './engine';

interface ProtectionStore {
  policies: Map<string, InsurancePolicyDTO>;
}

declare global {
  // eslint-disable-next-line no-var
  var __proventaProtectionStore: ProtectionStore | undefined;
}

function getProtectionStore(): ProtectionStore {
  if (!globalThis.__proventaProtectionStore) {
    const store: ProtectionStore = {
      policies: new Map(),
    };

    if (process.env.NODE_ENV !== 'test') {
      globalThis.__proventaProtectionStore = store;
      return store;
    }

    const demoFamilyId = 'fam_sharma_heritage';

    const demoPolicies: InsurancePolicyDTO[] = [
      {
        id: 'pol_term_life',
        workspaceId: demoFamilyId,
        familyId: demoFamilyId,
        policyholderId: 'usr_rajesh_sharma',
        policyholderName: 'Rajesh Sharma',
        insurerName: 'HDFC Life Insurance Co Ltd',
        policyNumberMasked: 'HDFC-TERM-****-882',
        policyType: 'LIFE_TERM',
        sumAssuredPaise: 10000000000, // ₹10 Crore term cover
        formattedSumAssured: '₹10,00,00,000',
        premiumAmountPaise: 14500000, // ₹1.45 Lakh / year
        formattedPremium: '₹1,45,000',
        premiumFrequency: 'ANNUALLY',
        renewalDate: '2026-06-15',
        maturityDate: '2050-06-15',
        nominees: [
          { name: 'Sunita Sharma', relationship: 'SPOUSE', sharePercentage: 70 },
          { name: 'Aarav Sharma', relationship: 'CHILD', sharePercentage: 30 },
        ],
        coveredMembers: ['Rajesh Sharma'],
        status: 'ACTIVE',
        supportingDocumentId: 'doc_term_policy',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2026-01-15T00:00:00.000Z',
      },
      {
        id: 'pol_family_health',
        workspaceId: demoFamilyId,
        familyId: demoFamilyId,
        policyholderId: 'usr_rajesh_sharma',
        policyholderName: 'Rajesh Sharma',
        insurerName: 'Care Health Insurance',
        policyNumberMasked: 'CARE-FLT-****-419',
        policyType: 'HEALTH_FAMILY_FLOATER',
        sumAssuredPaise: 500000000, // ₹50 Lakh floater cover
        formattedSumAssured: '₹50,00,000',
        premiumAmountPaise: 6800000, // ₹68,000 / year
        formattedPremium: '₹68,000',
        premiumFrequency: 'ANNUALLY',
        renewalDate: '2026-04-20',
        nominees: [
          { name: 'Sunita Sharma', relationship: 'SPOUSE', sharePercentage: 100 },
        ],
        coveredMembers: ['Rajesh Sharma', 'Sunita Sharma', 'Aarav Sharma'],
        status: 'ACTIVE',
        supportingDocumentId: 'doc_health_policy',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2026-01-15T00:00:00.000Z',
      },
    ];

    for (const pol of demoPolicies) {
      store.policies.set(pol.id, pol);
    }
    globalThis.__proventaProtectionStore = store;
  }
  return globalThis.__proventaProtectionStore;
}

export function listInsurancePolicies(workspaceId: string): InsurancePolicyDTO[] {
  const store = getProtectionStore();
  const results: InsurancePolicyDTO[] = [];
  for (const pol of store.policies.values()) {
    if (pol.workspaceId === workspaceId) {
      results.push(pol);
    }
  }
  return results.sort((a, b) => new Date(a.renewalDate).getTime() - new Date(b.renewalDate).getTime());
}

export function createInsurancePolicy(
  params: Omit<InsurancePolicyDTO, 'id' | 'formattedSumAssured' | 'formattedPremium' | 'createdAt' | 'updatedAt'>,
): InsurancePolicyDTO {
  const store = getProtectionStore();
  const id = `pol_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const newPolicy: InsurancePolicyDTO = {
    ...params,
    id,
    formattedSumAssured: formatInr(params.sumAssuredPaise),
    formattedPremium: formatInr(params.premiumAmountPaise),
    createdAt: now,
    updatedAt: now,
  };

  store.policies.set(id, newPolicy);
  return newPolicy;
}

export function getProtectionSummary(workspaceId: string): {
  totalLifeCoverPaise: number;
  formattedLifeCover: string;
  totalHealthCoverPaise: number;
  formattedHealthCover: string;
  annualTotalPremiumsPaise: number;
  formattedAnnualPremiums: string;
  policiesExpiringSoon: InsurancePolicyDTO[];
} {
  const policies = listInsurancePolicies(workspaceId);
  let totalLife = 0;
  let totalHealth = 0;
  let totalPremiums = 0;

  const now = new Date();
  const thirtyDaysOut = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const expiringSoon: InsurancePolicyDTO[] = [];

  for (const pol of policies) {
    if (pol.policyType.startsWith('LIFE')) {
      totalLife += pol.sumAssuredPaise;
    } else if (pol.policyType.startsWith('HEALTH')) {
      totalHealth += pol.sumAssuredPaise;
    }
    totalPremiums += pol.premiumAmountPaise;

    const renewal = new Date(pol.renewalDate);
    if (renewal <= thirtyDaysOut && renewal >= now) {
      expiringSoon.push(pol);
    }
  }

  return {
    totalLifeCoverPaise: totalLife,
    formattedLifeCover: formatInr(totalLife),
    totalHealthCoverPaise: totalHealth,
    formattedHealthCover: formatInr(totalHealth),
    annualTotalPremiumsPaise: totalPremiums,
    formattedAnnualPremiums: formatInr(totalPremiums),
    policiesExpiringSoon: expiringSoon,
  };
}
