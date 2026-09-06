import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import Apple from 'next-auth/providers/apple';
import MicrosoftEntraID from 'next-auth/providers/microsoft-entra-id';
import { db } from '@/lib/db';
import { verifyPassword } from '@/lib/auth/password';
import { loginSchema } from '@/lib/validation/schemas';
import { logger } from '@/lib/logger';
import { createSecurityEvent } from '@/lib/audit';
import bcrypt from 'bcryptjs';

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/sign-in',
    error: '/sign-in',
  },
  providers: [
    // Standard Email & Password
    Credentials({
      id: 'credentials',
      name: 'Credentials',
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

    // Phone OTP Credentials Provider
    Credentials({
      id: 'phone-otp',
      name: 'Phone OTP',
      credentials: {
        phone: { label: 'Phone', type: 'text' },
        otp: { label: 'OTP', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.otp) return null;
        const cleanPhone = String(credentials.phone).replace(/\s+/g, '');
        const cleanOtp = String(credentials.otp).trim();

        // Check PhoneVerification record
        let isValidOtp = false;
        try {
          const record = await db.phoneVerification.findFirst({
            where: {
              phone: cleanPhone,
              usedAt: null,
              expiresAt: { gt: new Date() },
            },
            orderBy: { createdAt: 'desc' },
          });

          if (record) {
            isValidOtp = await bcrypt.compare(cleanOtp, record.otpHash);
            if (isValidOtp) {
              await db.phoneVerification.update({
                where: { id: record.id },
                data: { usedAt: new Date() },
              });
            }
          }
        } catch (dbErr) {
          console.warn('[auth/phone-otp] DB verification fallback:', dbErr);
        }

        // Allow preview/dev OTP
        if (!isValidOtp && process.env.NODE_ENV !== 'production' && cleanOtp === '123456') {
          isValidOtp = true;
        }

        if (!isValidOtp) return null;

        // Provision or fetch user by phone
        let user: any = null;
        try {
          user = await db.user.findFirst({
            where: { phone: cleanPhone, deletedAt: null },
            include: { userRoles: true },
          });

          if (!user) {
            const placeholderEmail = `phone_${cleanPhone.replace(/[^0-9]/g, '')}@proventa.in`;
            user = await db.user.create({
              data: {
                phone: cleanPhone,
                phoneVerified: new Date(),
                email: placeholderEmail,
                name: `Member (${cleanPhone.slice(-4)})`,
                status: 'ACTIVE',
                userRoles: {
                  create: [{ role: 'CUSTOMER' }],
                },
              },
              include: { userRoles: true },
            });
          }
        } catch (userErr) {
          console.warn('[auth/phone-otp] DB user fetch fallback:', userErr);
        }

        const userId = user?.id || `phone_user_${cleanPhone.slice(-4)}`;
        void createSecurityEvent('LOGIN_SUCCESS', { userId });
        logger.info({ userId, phone: cleanPhone }, 'User logged in via phone OTP');

        return {
          id: userId,
          email: user?.email || `phone_${cleanPhone.replace(/[^0-9]/g, '')}@proventa.in`,
          name: user?.name || `Member (${cleanPhone.slice(-4)})`,
          roles: user?.userRoles?.map((r: any) => r.role) || ['CUSTOMER'],
          phoneVerified: new Date(),
        };
      },
    }),

    // Google OAuth
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),

    // Apple OAuth
    ...(process.env.APPLE_ID && process.env.APPLE_SECRET
      ? [
          Apple({
            clientId: process.env.APPLE_ID,
            clientSecret: process.env.APPLE_SECRET,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),

    // Microsoft Entra ID / Microsoft OAuth
    ...(process.env.AUTH_MICROSOFT_ENTRA_ID_ID && process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET
      ? [
          MicrosoftEntraID({
            clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
            clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
            issuer: process.env.AUTH_MICROSOFT_ENTRA_ID_TENANT_ID 
              ? `https://login.microsoftonline.com/${process.env.AUTH_MICROSOFT_ENTRA_ID_TENANT_ID}/v2.0`
              : 'https://login.microsoftonline.com/common/v2.0',
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider && account.provider !== 'credentials' && account.provider !== 'phone-otp') {
        const email = user.email;
        if (!email) return false;

        try {
          let existingUser = await db.user.findUnique({
            where: { email, deletedAt: null },
            include: { userRoles: true, oauthAccounts: true, customerProfile: true },
          });

          if (!existingUser) {
            existingUser = await db.user.create({
              data: {
                email,
                name: user.name || email.split('@')[0],
                image: user.image,
                status: 'ACTIVE',
                emailVerified: new Date(),
                userRoles: {
                  create: [{ role: 'CUSTOMER' }],
                },
                customerProfile: {
                  create: {
                    city: 'Ahmedabad',
                  },
                },
                oauthAccounts: {
                  create: [
                    {
                      provider: account.provider,
                      providerAccountId: account.providerAccountId,
                      accessToken: account.access_token,
                      refreshToken: account.refresh_token,
                      expiresAt: account.expires_at,
                      tokenType: account.token_type,
                      scope: account.scope,
                      idToken: account.id_token,
                    },
                  ],
                },
              },
              include: { userRoles: true, oauthAccounts: true, customerProfile: true },
            });
          } else {
            const hasOAuth = existingUser.oauthAccounts.some((oa) => oa.provider === account.provider);
            if (!hasOAuth) {
              await db.oAuthAccount.create({
                data: {
                  userId: existingUser.id,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  accessToken: account.access_token,
                  refreshToken: account.refresh_token,
                  expiresAt: account.expires_at,
                  tokenType: account.token_type,
                  scope: account.scope,
                  idToken: account.id_token,
                },
              });
            }
            if (!existingUser.customerProfile) {
              await db.customerProfile.upsert({
                where: { userId: existingUser.id },
                update: {},
                create: { userId: existingUser.id, city: 'Ahmedabad' },
              });
            }
          }

          user.id = existingUser.id;
          (user as any).roles = existingUser.userRoles.map((r) => r.role);
          return true;
        } catch (e) {
          console.warn('[auth/oauth/signIn] Fallback during OAuth sync:', e);
          if (!user.id) {
            user.id = `oauth_${account.provider}_${account.providerAccountId}`;
          }
          if (!(user as any).roles) {
            (user as any).roles = ['CUSTOMER'];
          }
          return true;
        }
      }
      return true;
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.roles = (user as unknown as { roles?: any[] }).roles ?? ['CUSTOMER'];
      }
      if (trigger === 'update' && token.id) {
        try {
          const dbUser = await db.user.findUnique({
            where: { id: token.id as string },
            include: { userRoles: true },
          });
          if (dbUser) token.roles = dbUser.userRoles.map((r) => r.role);
        } catch (e) {
          // ignore
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as unknown as { roles?: any[] }).roles = (token.roles as any[]) ?? ['CUSTOMER'];
      }
      return session;
    },
  },
  trustHost: true,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'proventa_default_auth_secret_session_key_32chars_min_2026',
});
