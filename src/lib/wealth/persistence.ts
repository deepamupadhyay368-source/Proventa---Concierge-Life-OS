/**
 * PROVENTA — Wealth OS Persistent Database Storage & Tenant Isolation
 * 
 * Persists assets, liabilities, and workspaces per user in PostgreSQL,
 * ensuring complete isolation between accounts.
 */

import { db } from '@/lib/db';
import { AssetDTO, LiabilityDTO, FamilyWorkspaceDTO } from './types';
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
 * Loads persisted assets for a specific workspace and user.
 */
export async function loadPersistedAssets(workspaceId: string, userId: string): Promise<AssetDTO[]> {
  if (process.env.NODE_ENV === 'test') return [];
  try {
    const profileId = await getOrCreateProfileId(userId);
    if (!profileId) return [];

    const record = await db.customerPreference.findUnique({
      where: {
        customerId_category_key: {
          customerId: profileId,
          category: 'wealth_assets',
          key: workspaceId,
        },
      },
    });

    if (record && Array.isArray(record.value)) {
      return record.value as unknown as AssetDTO[];
    }
    return [];
  } catch (err) {
    console.error('[Persistence] loadPersistedAssets error:', err);
    return [];
  }
}

/**
 * Saves assets for a specific workspace and user.
 */
export async function savePersistedAssets(workspaceId: string, userId: string, assets: AssetDTO[]): Promise<void> {
  if (process.env.NODE_ENV === 'test') return;
  try {
    const profileId = await getOrCreateProfileId(userId);
    if (!profileId) return;

    await db.customerPreference.upsert({
      where: {
        customerId_category_key: {
          customerId: profileId,
          category: 'wealth_assets',
          key: workspaceId,
        },
      },
      create: {
        customerId: profileId,
        category: 'wealth_assets',
        key: workspaceId,
        value: assets as unknown as Prisma.InputJsonValue,
        source: 'explicit',
      },
      update: {
        value: assets as unknown as Prisma.InputJsonValue,
      },
    });
  } catch (err) {
    console.error('[Persistence] savePersistedAssets error:', err);
  }
}

/**
 * Loads persisted liabilities for a specific workspace and user.
 */
export async function loadPersistedLiabilities(workspaceId: string, userId: string): Promise<LiabilityDTO[]> {
  if (process.env.NODE_ENV === 'test') return [];
  try {
    const profileId = await getOrCreateProfileId(userId);
    if (!profileId) return [];

    const record = await db.customerPreference.findUnique({
      where: {
        customerId_category_key: {
          customerId: profileId,
          category: 'wealth_liabilities',
          key: workspaceId,
        },
      },
    });

    if (record && Array.isArray(record.value)) {
      return record.value as unknown as LiabilityDTO[];
    }
    return [];
  } catch (err) {
    console.error('[Persistence] loadPersistedLiabilities error:', err);
    return [];
  }
}

/**
 * Saves liabilities for a specific workspace and user.
 */
export async function savePersistedLiabilities(workspaceId: string, userId: string, liabilities: LiabilityDTO[]): Promise<void> {
  if (process.env.NODE_ENV === 'test') return;
  try {
    const profileId = await getOrCreateProfileId(userId);
    if (!profileId) return;

    await db.customerPreference.upsert({
      where: {
        customerId_category_key: {
          customerId: profileId,
          category: 'wealth_liabilities',
          key: workspaceId,
        },
      },
      create: {
        customerId: profileId,
        category: 'wealth_liabilities',
        key: workspaceId,
        value: liabilities as unknown as Prisma.InputJsonValue,
        source: 'explicit',
      },
      update: {
        value: liabilities as unknown as Prisma.InputJsonValue,
      },
    });
  } catch (err) {
    console.error('[Persistence] savePersistedLiabilities error:', err);
  }
}
