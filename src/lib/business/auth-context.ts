/**
 * PROVENTA — Industrial Procurement Platform
 * Multi-Business Authorization & Supplier Context Resolution Engine
 */

import { db } from '@/lib/db';
import type { SessionUser } from '@/lib/auth/session';

export interface AuthorizedBusinessInfo {
  id: string;
  name: string;
  slug: string;
  platformRole: string;
  verificationStatus: string;
  isOwner: boolean;
  memberRole?: string;
}

export interface ResolvedSupplierContext {
  supplierId: string;
  supplierName: string;
  businessId?: string;
  isAuthorized: boolean;
  authorizedBusinesses: AuthorizedBusinessInfo[];
}

/**
 * Fetch all businesses the user is authorized to represent (as owner or active member)
 */
export async function getUserAuthorizedBusinesses(userId: string): Promise<AuthorizedBusinessInfo[]> {
  try {
    // 1. Owned businesses
    const ownedBusinesses = await db.business.findMany({
      where: { ownerId: userId },
      select: {
        id: true,
        name: true,
        slug: true,
        platformRole: true,
        verificationStatus: true,
      },
    });

    // 2. Member businesses
    const memberships = await db.businessMembership.findMany({
      where: { userId, active: true },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            slug: true,
            platformRole: true,
            verificationStatus: true,
          },
        },
      },
    });

    const result: AuthorizedBusinessInfo[] = [];
    const seenIds = new Set<string>();

    for (const ob of ownedBusinesses) {
      seenIds.add(ob.id);
      result.push({
        id: ob.id,
        name: ob.name || 'Enterprise Business',
        slug: ob.slug,
        platformRole: ob.platformRole || 'BUYER',
        verificationStatus: ob.verificationStatus || 'DRAFT',
        isOwner: true,
      });
    }

    for (const mem of memberships) {
      if (mem.business && !seenIds.has(mem.business.id)) {
        seenIds.add(mem.business.id);
        result.push({
          id: mem.business.id,
          name: mem.business.name || 'Enterprise Business',
          slug: mem.business.slug,
          platformRole: mem.business.platformRole || 'BUYER',
          verificationStatus: mem.business.verificationStatus || 'DRAFT',
          isOwner: false,
          memberRole: mem.role,
        });
      }
    }

    return result;
  } catch (error) {
    console.error('[getUserAuthorizedBusinesses] Error querying businesses:', error);
    return [];
  }
}

/**
 * Resolve supplier context for the authenticated user.
 * Supports explicit supplierId query/header switching for multi-business accounts.
 */
export async function resolveSupplierContext(params: {
  user: any;
  requestedSupplierId?: string | null;
}): Promise<ResolvedSupplierContext> {
  const { user, requestedSupplierId } = params;
  const isAdmin = Boolean(user?.roles && Array.isArray(user.roles) && user.roles.some((r: any) => ['SUPER_ADMIN', 'ADMIN', 'CONCIERGE'].includes(r)));

  // If user is Admin or CLI Operator, they have universal access to any requested supplier
  if (isAdmin && requestedSupplierId) {
    return {
      supplierId: requestedSupplierId,
      supplierName: `Supplier (${requestedSupplierId})`,
      businessId: requestedSupplierId,
      isAuthorized: true,
      authorizedBusinesses: [],
    };
  }

  const authorizedBusinesses = await getUserAuthorizedBusinesses(user.id);
  const supplierBusinesses = authorizedBusinesses.filter(
    (b) => b.platformRole === 'SUPPLIER' || b.platformRole === 'BOTH'
  );

  // If user requested a specific supplierId (business id or slug)
  if (requestedSupplierId) {
    const match = authorizedBusinesses.find(
      (b) => b.id === requestedSupplierId || b.slug === requestedSupplierId
    );

    if (match) {
      return {
        supplierId: match.id,
        supplierName: match.name,
        businessId: match.id,
        isAuthorized: true,
        authorizedBusinesses,
      };
    }

    // Check if requestedSupplierId matches user.id (for single-user direct testing)
    if (requestedSupplierId === user.id) {
      return {
        supplierId: user.id,
        supplierName: user.name || 'Registered Supplier',
        isAuthorized: true,
        authorizedBusinesses,
      };
    }

    // Not authorized to represent this supplier
    return {
      supplierId: requestedSupplierId,
      supplierName: '',
      isAuthorized: false,
      authorizedBusinesses,
    };
  }

  // If no specific supplierId requested, default to primary supplier business or user identity
  if (supplierBusinesses.length > 0) {
    const primary = supplierBusinesses[0];
    return {
      supplierId: primary.id,
      supplierName: primary.name,
      businessId: primary.id,
      isAuthorized: true,
      authorizedBusinesses,
    };
  }

  // Fallback to user identity
  return {
    supplierId: user.id,
    supplierName: user.name || 'Supplier Account',
    isAuthorized: true,
    authorizedBusinesses,
  };
}
