/**
 * PROVENTA — Wealth OS Persistent Database Storage & Tenant Isolation
 * 
 * Persists assets, liabilities, cashflow, goals, insurance policies,
 * vault documents, and continuity data per user in PostgreSQL,
 * guaranteeing strict isolation between accounts.
 */

import { db } from '@/lib/db';
import {
  AssetDTO,
  LiabilityDTO,
  CashflowTransactionDTO,
  FinancialGoalDTO,
  InsurancePolicyDTO,
  DocumentDTO,
  BusinessOwnershipGraphDTO,
  FamilyContinuityDTO,
} from './types';
import { Prisma } from '@prisma/client';

async function getOrCreateProfileId(userId: string): Promise<string | null> {
  if (process.env.NODE_ENV === 'test') return null;
  try {
    const profile = await db.customerProfile.upsert({
      where: { userId },
      update: {},
      create: {
        userId,
        city: 'India',
        onboardingCompleted: true,
      },
      select: { id: true },
    });
    return profile.id;
  } catch (err) {
    console.error('[Persistence] getOrCreateProfileId error:', err);
    return null;
  }
}

/**
 * Generic loader for any user-scoped JSON entity
 */
export async function loadPersistedCategory<T>(
  category: string,
  key: string,
  userId: string,
): Promise<T | null> {
  if (process.env.NODE_ENV === 'test') return null;
  try {
    const profileId = await getOrCreateProfileId(userId);
    if (!profileId) return null;

    const record = await db.customerPreference.findUnique({
      where: {
        customerId_category_key: {
          customerId: profileId,
          category,
          key,
        },
      },
    });

    if (record && record.value !== null && record.value !== undefined) {
      return record.value as unknown as T;
    }
    return null;
  } catch (err) {
    console.error(`[Persistence] loadPersistedCategory (${category}) error:`, err);
    return null;
  }
}

/**
 * Generic saver for any user-scoped JSON entity
 */
export async function savePersistedCategory<T>(
  category: string,
  key: string,
  userId: string,
  data: T,
): Promise<void> {
  if (process.env.NODE_ENV === 'test') return;
  try {
    const profileId = await getOrCreateProfileId(userId);
    if (!profileId) return;

    await db.customerPreference.upsert({
      where: {
        customerId_category_key: {
          customerId: profileId,
          category,
          key,
        },
      },
      create: {
        customerId: profileId,
        category,
        key,
        value: data as unknown as Prisma.InputJsonValue,
        source: 'explicit',
      },
      update: {
        value: data as unknown as Prisma.InputJsonValue,
      },
    });
  } catch (err) {
    console.error(`[Persistence] savePersistedCategory (${category}) error:`, err);
  }
}

// ==========================================
// TYPED WRAPPERS FOR MODULES
// ==========================================

export async function loadPersistedAssets(workspaceId: string, userId: string): Promise<AssetDTO[]> {
  const data = await loadPersistedCategory<AssetDTO[]>('wealth_assets', workspaceId, userId);
  return Array.isArray(data) ? data : [];
}

export async function savePersistedAssets(workspaceId: string, userId: string, assets: AssetDTO[]): Promise<void> {
  await savePersistedCategory('wealth_assets', workspaceId, userId, assets);
}

export async function loadPersistedLiabilities(workspaceId: string, userId: string): Promise<LiabilityDTO[]> {
  const data = await loadPersistedCategory<LiabilityDTO[]>('wealth_liabilities', workspaceId, userId);
  return Array.isArray(data) ? data : [];
}

export async function savePersistedLiabilities(workspaceId: string, userId: string, liabilities: LiabilityDTO[]): Promise<void> {
  await savePersistedCategory('wealth_liabilities', workspaceId, userId, liabilities);
}

export async function loadPersistedCashflows(workspaceId: string, userId: string): Promise<CashflowTransactionDTO[]> {
  const data = await loadPersistedCategory<CashflowTransactionDTO[]>('wealth_cashflow', workspaceId, userId);
  return Array.isArray(data) ? data : [];
}

export async function savePersistedCashflows(workspaceId: string, userId: string, txs: CashflowTransactionDTO[]): Promise<void> {
  await savePersistedCategory('wealth_cashflow', workspaceId, userId, txs);
}

export async function loadPersistedGoals(workspaceId: string, userId: string): Promise<FinancialGoalDTO[]> {
  const data = await loadPersistedCategory<FinancialGoalDTO[]>('wealth_goals', workspaceId, userId);
  return Array.isArray(data) ? data : [];
}

export async function savePersistedGoals(workspaceId: string, userId: string, goals: FinancialGoalDTO[]): Promise<void> {
  await savePersistedCategory('wealth_goals', workspaceId, userId, goals);
}

export async function loadPersistedPolicies(workspaceId: string, userId: string): Promise<InsurancePolicyDTO[]> {
  const data = await loadPersistedCategory<InsurancePolicyDTO[]>('wealth_protection', workspaceId, userId);
  return Array.isArray(data) ? data : [];
}

export async function savePersistedPolicies(workspaceId: string, userId: string, policies: InsurancePolicyDTO[]): Promise<void> {
  await savePersistedCategory('wealth_protection', workspaceId, userId, policies);
}

export async function loadPersistedDocuments(workspaceId: string, userId: string): Promise<DocumentDTO[]> {
  const data = await loadPersistedCategory<DocumentDTO[]>('wealth_vault', workspaceId, userId);
  return Array.isArray(data) ? data : [];
}

export async function savePersistedDocuments(workspaceId: string, userId: string, docs: DocumentDTO[]): Promise<void> {
  await savePersistedCategory('wealth_vault', workspaceId, userId, docs);
}

export async function loadPersistedBusinessMap(familyId: string, userId: string): Promise<BusinessOwnershipGraphDTO | null> {
  return await loadPersistedCategory<BusinessOwnershipGraphDTO>('wealth_business', familyId, userId);
}

export async function savePersistedBusinessMap(familyId: string, userId: string, data: BusinessOwnershipGraphDTO): Promise<void> {
  await savePersistedCategory('wealth_business', familyId, userId, data);
}

export async function loadPersistedContinuity(familyId: string, userId: string): Promise<FamilyContinuityDTO | null> {
  return await loadPersistedCategory<FamilyContinuityDTO>('wealth_continuity', familyId, userId);
}

export async function savePersistedContinuity(familyId: string, userId: string, data: FamilyContinuityDTO): Promise<void> {
  await savePersistedCategory('wealth_continuity', familyId, userId, data);
}
