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

export async function requireAdmin(): Promise<SessionUser> {
  return requireRole('ADMIN');
}

export async function requireConcierge(): Promise<SessionUser> {
  return requireAnyRole(['CONCIERGE', 'CONCIERGE_MANAGER', 'ADMIN']);
}

export async function requireCustomer(): Promise<SessionUser> {
  return requireAnyRole(['CUSTOMER', 'ADMIN']);
}

export function hasRole(user: SessionUser, role: UserRole): boolean {
  return (user.roles ?? []).includes(role);
}

export function hasAnyRole(user: SessionUser, roles: UserRole[]): boolean {
  return roles.some((r) => (user.roles ?? []).includes(r));
}
