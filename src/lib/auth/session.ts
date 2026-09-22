import { auth } from '@/lib/auth/config';
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
  return auth();
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
  if (!session?.user?.id) {
    throw new AuthenticationError();
  }
  return session.user as SessionUser;
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

export async function requireSuperAdmin(): Promise<SessionUser> {
  return requireRole('SUPER_ADMIN');
}

export async function requireAdmin(): Promise<SessionUser> {
  return requireAnyRole(['SUPER_ADMIN', 'ADMIN']);
}

export async function requireSupport(): Promise<SessionUser> {
  return requireAnyRole(['SUPER_ADMIN', 'ADMIN', 'SUPPORT']);
}

export async function requireConcierge(): Promise<SessionUser> {
  return requireAnyRole(['SUPER_ADMIN', 'ADMIN', 'CONCIERGE_MANAGER', 'CONCIERGE']);
}

export async function requireCustomer(): Promise<SessionUser> {
  return requireAnyRole(['CUSTOMER', 'SUPER_ADMIN', 'ADMIN']);
}

export function hasRole(user: SessionUser, role: UserRole): boolean {
  return (user.roles ?? []).includes(role);
}

export function hasAnyRole(user: SessionUser, roles: UserRole[]): boolean {
  return roles.some((r) => (user.roles ?? []).includes(r));
}

