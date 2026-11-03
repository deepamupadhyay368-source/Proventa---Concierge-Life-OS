import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getWealthStore } from './service';

export type WorkspaceRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';

export interface AuthorizedSession {
  userId: string;
  userName?: string;
  userEmail?: string;
  role: WorkspaceRole;
}

export interface WorkspaceAuthResult {
  authorized: boolean;
  session?: AuthorizedSession;
  errorResponse?: NextResponse;
}

const ROLE_HIERARCHY: Record<WorkspaceRole, number> = {
  VIEWER: 1,
  MEMBER: 2,
  ADMIN: 3,
  OWNER: 4,
};

/**
 * PROVENTA Centralized Server-Side Workspace Authorization Guard
 * 
 * Guarantees zero BOLA (Broken Object Level Authorization):
 * 1. Rejects unauthenticated callers with 401 Unauthorized.
 * 2. Isolates personal workspaces (ind_*) strictly to matching userId.
 * 3. Enforces verified membership for all family workspaces (fam_*).
 * 4. Enforces role-based action privileges (VIEWER vs MEMBER vs ADMIN vs OWNER).
 */
export async function assertAuthorizedWorkspace(
  workspaceId: string,
  options?: {
    requiredRole?: WorkspaceRole;
    allowDirectSession?: { user: { id: string; name?: string | null; email?: string | null } } | null;
  },
): Promise<WorkspaceAuthResult> {
  let session = options?.allowDirectSession;

  if (session === undefined) {
    try {
      const { auth } = await import('@/lib/auth/config');
      session = await auth();
    } catch {
      session = null;
    }
  }

  // 1. Authentication check
  if (!session?.user?.id) {
    return {
      authorized: false,
      errorResponse: NextResponse.json(
        { success: false, error: 'Unauthorized: Valid session required' },
        { status: 401 },
      ),
    };
  }

  const activeUser = session.user;
  const userId = activeUser.id;

  // 2. Parameter validation
  if (!workspaceId || typeof workspaceId !== 'string') {
    return {
      authorized: false,
      errorResponse: NextResponse.json(
        { success: false, error: 'Workspace ID required' },
        { status: 400 },
      ),
    };
  }

  // 3. Individual personal workspace check
  if (workspaceId.startsWith('ind_')) {
    if (workspaceId !== `ind_${userId}`) {
      return {
        authorized: false,
        errorResponse: NextResponse.json(
          { success: false, error: 'Forbidden: Cannot access another user personal workspace' },
          { status: 403 },
        ),
      };
    }

    return {
      authorized: true,
      session: {
        userId,
        userName: activeUser.name ?? undefined,
        userEmail: activeUser.email ?? undefined,
        role: 'OWNER',
      },
    };
  }

  // 4. Family workspace check
  if (workspaceId.startsWith('fam_')) {
    const store = getWealthStore();
    const memWorkspace = store.workspaces.get(workspaceId);
    let userRole: WorkspaceRole | null = null;

    if (memWorkspace) {
      const member = memWorkspace.members.find((m) => m.userId === userId);
      if (member) {
        userRole = member.role;
      }
    }

    // If not found in in-memory store and not in test environment, query PostgreSQL
    if (!userRole && process.env.NODE_ENV !== 'test') {
      try {
        const profile = await db.customerProfile.findUnique({
          where: { userId },
          select: { id: true },
        });

        if (profile) {
          const pref = await db.customerPreference.findFirst({
            where: {
              customerId: profile.id,
              key: workspaceId,
            },
          });
          if (pref) {
            userRole = 'MEMBER';
          }
        }
      } catch (err) {
        console.error('[assertAuthorizedWorkspace] DB membership lookup failed:', err);
      }
    }

    if (!userRole) {
      return {
        authorized: false,
        errorResponse: NextResponse.json(
          { success: false, error: 'Forbidden: You do not have permission to access this family workspace' },
          { status: 403 },
        ),
      };
    }

    // Role hierarchy verification
    if (options?.requiredRole) {
      const currentLevel = ROLE_HIERARCHY[userRole] || 0;
      const requiredLevel = ROLE_HIERARCHY[options.requiredRole] || 0;

      if (currentLevel < requiredLevel) {
        return {
          authorized: false,
          errorResponse: NextResponse.json(
            { success: false, error: `Forbidden: Requires ${options.requiredRole} privileges` },
            { status: 403 },
          ),
        };
      }
    }

    return {
      authorized: true,
      session: {
        userId,
        userName: activeUser.name ?? undefined,
        userEmail: activeUser.email ?? undefined,
        role: userRole,
      },
    };
  }

  // Unrecognized workspace schema
  return {
    authorized: false,
    errorResponse: NextResponse.json(
      { success: false, error: 'Invalid workspace identifier' },
      { status: 400 },
    ),
  };
}
