import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { db } from '@/lib/db';
import { verifyPassword } from '@/lib/auth/password';
import { loginSchema } from '@/lib/validation/schemas';
import { logger } from '@/lib/logger';
import { createSecurityEvent } from '@/lib/audit';

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/sign-in',
    error: '/sign-in',
  },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, request) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;
        const user = await db.user.findUnique({
          where: { email, deletedAt: null },
          include: { userRoles: true },
        });
        if (!user || !user.passwordHash) {
          await verifyPassword('dummy', '$2b$12$aaaaaaaaaaaaaaaaaaaaaa.AAAAAAAAAAAAAAAAAAAAAAAAAAAA');
          void createSecurityEvent('LOGIN_FAILED', { data: { email, reason: 'user_not_found' } });
          return null;
        }
        if (user.status === 'SUSPENDED') {
          void createSecurityEvent('LOGIN_FAILED', { userId: user.id, data: { reason: 'suspended' } });
          return null;
        }
        const isValid = await verifyPassword(password, user.passwordHash);
        if (!isValid) {
          void createSecurityEvent('LOGIN_FAILED', { userId: user.id, data: { reason: 'invalid_password' } });
          return null;
        }
        if (user.status === 'PENDING_VERIFICATION') return null;
        void createSecurityEvent('LOGIN_SUCCESS', { userId: user.id });
        logger.info({ userId: user.id }, 'User logged in');
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          roles: user.userRoles.map((r) => r.role),
          emailVerified: user.emailVerified,
        };
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [Google({ clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET })]
      : []),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.roles = (user as unknown as { roles?: any[] }).roles ?? [];
      }
      if (trigger === 'update' && token.id) {
        const dbUser = await db.user.findUnique({
          where: { id: token.id as string },
          include: { userRoles: true },
        });
        if (dbUser) token.roles = dbUser.userRoles.map((r) => r.role);
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as unknown as { roles?: any[] }).roles = (token.roles as any[]) ?? [];
      }
      return session;
    },
  },
  trustHost: true,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'proventa_default_auth_secret_session_key_32chars_min_2026',
});
