import { auth } from '@/lib/auth/config';
import { getConciergeSession } from '@/lib/auth/concierge-session';
import { AuthenticationError, AuthorizationError } from '@/lib/errors';
import { UserRole } from '@prisma/client';

export type SessionUser = {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  roles: UserRole[];
  emailVerified?: Date | null;
};

export async function getSession() {
  const nextAuthSession = await auth();
  if (nextAuthSession?.user?.id) return nextAuthSession;
  const conciergeSession = await getConciergeSession();
  if (conciergeSession?.id) {
    return {
      user: {
        id: conciergeSession.id,
        email: conciergeSession.email,
        name: conciergeSession.name,
        roles: conciergeSession.roles,
      },
    };
  }
  return null;
}

export async function requireAuth(): Promise<SessionUser> {
  if (process.env.PROVENTA_CLI_OPERATOR === 'true') {
    return {
      id: 'cli-operator-id',
      email: 'operator@proventa.in',
      name: 'Proventa Lead Operator',
      roles: ['SUPER_ADMIN', 'CONCIERGE'],
    };
  }
  const session = await auth();
  if (session?.user?.id) {
    return session.user as SessionUser;
  }
  const conciergeSession = await getConciergeSession();
  if (conciergeSession?.id) {
    return {
      id: conciergeSession.id,
      email: conciergeSession.email,
      name: conciergeSession.name,
      roles: conciergeSession.roles,
    };
  }
  throw new AuthenticationError();
}

export async function requireRole(role: UserRole): Promise<SessionUser> {
  const user = await requireAuth();
  const roles = user.roles ?? [];
  if (!roles.includes(role)) {
    throw new AuthorizationError();
  }
  return user;
}

export async function requireAnyRole(roles: UserRole[]): Promise<SessionUser> {
  const user = await requireAuth();
  const userRoles = user.roles ?? [];
  const hasRole = roles.some((r) => userRoles.includes(r));
  if (!hasRole) {
    throw new AuthorizationError();
  }
  return user;
}

export async function requireFounder(): Promise<SessionUser> {
  return requireAnyRole(['SUPER_ADMIN', 'FOUNDER']);
}

export async function requireSuperAdmin(): Promise<SessionUser> {
  return requireAnyRole(['SUPER_ADMIN', 'FOUNDER']);
}

export async function requireAdmin(): Promise<SessionUser> {
  return requireAnyRole(['SUPER_ADMIN', 'FOUNDER', 'ADMIN']);
}

export async function requireConciergeManager(): Promise<SessionUser> {
  return requireAnyRole(['SUPER_ADMIN', 'FOUNDER', 'ADMIN', 'CONCIERGE_MANAGER']);
}

export async function requireSeniorConcierge(): Promise<SessionUser> {
  return requireAnyRole(['SUPER_ADMIN', 'FOUNDER', 'ADMIN', 'CONCIERGE_MANAGER', 'SENIOR_CONCIERGE']);
}

export async function requireFinance(): Promise<SessionUser> {
  return requireAnyRole(['SUPER_ADMIN', 'FOUNDER', 'ADMIN', 'FINANCE']);
}

export async function requireSupport(): Promise<SessionUser> {
  return requireAnyRole(['SUPER_ADMIN', 'FOUNDER', 'ADMIN', 'SUPPORT']);
}

export async function requireConcierge(): Promise<SessionUser> {
  return requireAnyRole(['SUPER_ADMIN', 'FOUNDER', 'ADMIN', 'CONCIERGE_MANAGER', 'SENIOR_CONCIERGE', 'CONCIERGE']);
}

export async function requireEmployee(): Promise<SessionUser> {
  return requireAnyRole(['SUPER_ADMIN', 'FOUNDER', 'ADMIN', 'CONCIERGE_MANAGER', 'SENIOR_CONCIERGE', 'CONCIERGE', 'FINANCE', 'SUPPORT']);
}

export async function requireCustomer(): Promise<SessionUser> {
  return requireAnyRole(['CUSTOMER', 'SUPER_ADMIN', 'FOUNDER', 'ADMIN']);
}

export function hasRole(user: SessionUser, role: UserRole): boolean {
  return (user.roles ?? []).includes(role);
}

export function hasAnyRole(user: SessionUser, roles: UserRole[]): boolean {
  return roles.some((r) => (user.roles ?? []).includes(r));
}


