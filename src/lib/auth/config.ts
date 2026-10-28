import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import Apple from 'next-auth/providers/apple';
import MicrosoftEntraID from 'next-auth/providers/microsoft-entra-id';
import type { UserRole } from '@prisma/client';
import { db } from '@/lib/db';
import { verifyPassword } from '@/lib/auth/password';
import { sanitizeCallbackPath } from '@/lib/auth/callback-url';
import { loginSchema } from '@/lib/validation/schemas';
import { logger } from '@/lib/logger';
import { createSecurityEvent } from '@/lib/audit';
import bcrypt from 'bcryptjs';

export { sanitizeCallbackPath };

const googleClientId =
  process.env.GOOGLE_CLIENT_ID || process.env.AUTH_GOOGLE_ID || '';
const googleClientSecret =
  process.env.GOOGLE_CLIENT_SECRET || process.env.AUTH_GOOGLE_SECRET || '';

const PRIVILEGED_ROLES = new Set(['SUPER_ADMIN', 'FOUNDER', 'ADMIN']);

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/sign-in',
    error: '/sign-in',
  },
  providers: [
    // Standard Email, Password & Proventa Authentication Key
    Credentials({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        authenticationKey: { label: 'Authentication Key', type: 'password' },
        securityKey: { label: 'Security Key', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;
        const normalizedEmail = email.trim().toLowerCase();
        const authKey =
          parsed.data.authenticationKey || parsed.data.securityKey;

        const user = await db.user.findUnique({
          where: { email: normalizedEmail, deletedAt: null },
          include: { userRoles: true },
        });

        if (!user || !user.passwordHash) {
          await verifyPassword(
            'dummy',
            '$2b$12$aaaaaaaaaaaaaaaaaaaaaa.AAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          );
          void createSecurityEvent('LOGIN_PASSWORD_FAILURE', {
            data: { email: normalizedEmail, reason: 'user_not_found' },
          });
          void createSecurityEvent('LOGIN_FAILED', {
            data: { email: normalizedEmail, reason: 'user_not_found' },
          });
          return null;
        }

        if (user.status === 'SUSPENDED') {
          void createSecurityEvent('LOGIN_BLOCKED', {
            userId: user.id,
            data: { reason: 'suspended' },
          });
          void createSecurityEvent('LOGIN_FAILED', {
            userId: user.id,
            data: { reason: 'suspended' },
          });
          return null;
        }

        const isValidPassword = await verifyPassword(
          password,
          user.passwordHash,
        );
        if (!isValidPassword) {
          void createSecurityEvent('LOGIN_PASSWORD_FAILURE', {
            userId: user.id,
            data: { reason: 'invalid_password' },
          });
          void createSecurityEvent('LOGIN_FAILED', {
            userId: user.id,
            data: { reason: 'invalid_password' },
          });
          return null;
        }

        void createSecurityEvent('LOGIN_PASSWORD_SUCCESS', { userId: user.id });

        // Validate Proventa Authentication Key if configured on the user profile
        if (user.securityKeyHash) {
          if (!authKey) {
            void createSecurityEvent('AUTH_KEY_FAILED', {
              userId: user.id,
              data: { reason: 'missing_key' },
            });
            void createSecurityEvent('LOGIN_FAILED', {
              userId: user.id,
              data: { reason: 'missing_auth_key' },
            });
            return null;
          }
          const isValidKey = await verifyPassword(
            authKey,
            user.securityKeyHash,
          );
          if (!isValidKey) {
            void createSecurityEvent('AUTH_KEY_FAILED', {
              userId: user.id,
              data: { reason: 'invalid_key' },
            });
            void createSecurityEvent('LOGIN_FAILED', {
              userId: user.id,
              data: { reason: 'invalid_auth_key' },
            });
            return null;
          }
          void createSecurityEvent('AUTH_KEY_VERIFIED', { userId: user.id });
        } else if (authKey) {
          const newKeyHash = (await verifyPassword(authKey, '$2b$12$dummy'))
            ? null
            : await bcrypt.hash(authKey, 12);
          if (newKeyHash) {
            await db.user.update({
              where: { id: user.id },
              data: {
                securityKeyHash: newKeyHash,
                authKeyUpdatedAt: new Date(),
              },
            });
            void createSecurityEvent('AUTH_KEY_CREATED', {
              userId: user.id,
              data: { source: 'migration_login' },
            });
            void createSecurityEvent('AUTH_KEY_VERIFIED', { userId: user.id });
          }
        }

        if (user.status === 'PENDING_VERIFICATION') return null;

        void createSecurityEvent('LOGIN_COMPLETED', { userId: user.id });
        void createSecurityEvent('LOGIN_SUCCESS', { userId: user.id });
        logger.info(
          { userId: user.id },
          'User logged in with Authentication Key',
        );

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

        if (
          !isValidOtp &&
          process.env.NODE_ENV !== 'production' &&
          cleanOtp === '123456'
        ) {
          isValidOtp = true;
        }

        if (!isValidOtp) return null;

        let user: {
          id: string;
          email: string;
          name: string | null;
          phoneVerified: Date | null;
          userRoles?: Array<{ role: UserRole }>;
        } | null = null;
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
          logger.error(
            { error: userErr, phone: cleanPhone },
            '[auth/phone-otp] Error finding/creating user',
          );
        }

        if (!user) {
          logger.error(
            { phone: cleanPhone },
            '[auth/phone-otp] Failed to find or create database user',
          );
          return null;
        }

        void createSecurityEvent('LOGIN_SUCCESS', { userId: user.id });
        logger.info(
          { userId: user.id, phone: cleanPhone },
          'User logged in via phone OTP',
        );

        return {
          id: user.id,
          email: user.email,
          name: user.name || `Member (${cleanPhone.slice(-4)})`,
          roles: (user.userRoles?.map((r) => r.role) || ['CUSTOMER']) as UserRole[],
          phoneVerified: user.phoneVerified,
        };
      },
    }),

    // Official Google OIDC Provider (with PKCE + state verification)
    ...(googleClientId && googleClientSecret
      ? [
          Google({
            clientId: googleClientId,
            clientSecret: googleClientSecret,
            checks: ['pkce', 'state'],
            authorization: {
              params: {
                prompt: 'select_account',
                access_type: 'online',
                response_type: 'code',
              },
            },
          }),
        ]
      : []),

    // Apple OAuth
    ...(process.env.APPLE_ID && process.env.APPLE_SECRET
      ? [
          Apple({
            clientId: process.env.APPLE_ID,
            clientSecret: process.env.APPLE_SECRET,
          }),
        ]
      : []),

    // Microsoft Entra ID / Microsoft OAuth
    ...(process.env.AUTH_MICROSOFT_ENTRA_ID_ID &&
    process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET
      ? [
          MicrosoftEntraID({
            clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
            clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
            issuer: process.env.AUTH_MICROSOFT_ENTRA_ID_TENANT_ID
              ? `https://login.microsoftonline.com/${process.env.AUTH_MICROSOFT_ENTRA_ID_TENANT_ID}/v2.0`
              : 'https://login.microsoftonline.com/common/v2.0',
          }),
        ]
      : []),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (
        account?.provider &&
        account.provider !== 'credentials' &&
        account.provider !== 'phone-otp'
      ) {
        const rawEmail = user.email || (profile as { email?: string })?.email;
        if (!rawEmail) {
          return '/sign-in?error=OAuthEmailMissing';
        }
        const normalizedEmail = rawEmail.trim().toLowerCase();

        // Require verified email from Google / OIDC provider before creating or linking accounts
        if (account.provider === 'google') {
          const emailVerifiedByGoogle = Boolean(
            (profile as { email_verified?: boolean })?.email_verified,
          );
          if (!emailVerifiedByGoogle) {
            void createSecurityEvent('LOGIN_BLOCKED', {
              data: {
                email: normalizedEmail,
                provider: 'google',
                reason: 'unverified_provider_email',
              },
            });
            return '/sign-in?error=unverified_oauth_email';
          }
        }

        try {
          // 1. Check if this exact (provider, providerAccountId) is already linked
          const existingOAuthLink = await db.oAuthAccount.findUnique({
            where: {
              provider_providerAccountId: {
                provider: account.provider,
                providerAccountId: account.providerAccountId,
              },
            },
            include: {
              user: {
                include: {
                  userRoles: true,
                  customerProfile: true,
                },
              },
            },
          });

          if (existingOAuthLink?.user) {
            const linkedUser = existingOAuthLink.user;
            if (
              linkedUser.deletedAt ||
              linkedUser.status === 'SUSPENDED' ||
              linkedUser.status === 'DELETED'
            ) {
              void createSecurityEvent('LOGIN_BLOCKED', {
                userId: linkedUser.id,
                data: { provider: account.provider, reason: 'account_suspended' },
              });
              return '/sign-in?error=account_suspended';
            }

            user.id = linkedUser.id;
            (user as unknown as { roles: string[] }).roles =
              linkedUser.userRoles.map((r) => r.role);
            void createSecurityEvent('LOGIN_SUCCESS', {
              userId: linkedUser.id,
              data: { provider: account.provider, method: 'oauth_linked' },
            });
            return true;
          }

          // 2. Look up user by verified email
          let existingUser = await db.user.findUnique({
            where: { email: normalizedEmail, deletedAt: null },
            include: {
              userRoles: true,
              oauthAccounts: true,
              customerProfile: true,
            },
          });

          if (!existingUser) {
            // Create a new non-admin CUSTOMER account (never grant admin roles via OAuth)
            existingUser = await db.user.create({
              data: {
                email: normalizedEmail,
                name: user.name || normalizedEmail.split('@')[0],
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
                      tokenType: account.token_type,
                      scope: account.scope,
                    },
                  ],
                },
              },
              include: {
                userRoles: true,
                oauthAccounts: true,
                customerProfile: true,
              },
            });

            void createSecurityEvent('LOGIN_SUCCESS', {
              userId: existingUser.id,
              data: { provider: account.provider, method: 'oauth_created' },
            });
          } else {
            // Prevent suspended users from signing in via OAuth
            if (
              existingUser.status === 'SUSPENDED' ||
              existingUser.status === 'DELETED'
            ) {
              void createSecurityEvent('LOGIN_BLOCKED', {
                userId: existingUser.id,
                data: { provider: account.provider, reason: 'suspended' },
              });
              return '/sign-in?error=account_suspended';
            }

            // Never auto-link a privileged administrator account via email match alone
            const hasPrivilegedRole = existingUser.userRoles.some((r) =>
              PRIVILEGED_ROLES.has(r.role),
            );
            if (hasPrivilegedRole) {
              void createSecurityEvent('LOGIN_BLOCKED', {
                userId: existingUser.id,
                data: {
                  provider: account.provider,
                  reason: 'admin_auto_link_blocked',
                },
              });
              return '/sign-in?error=OAuthAccountNotLinked';
            }

            // Require existing user to be active/verified before linking
            if (
              existingUser.status === 'PENDING_VERIFICATION' &&
              !existingUser.emailVerified
            ) {
              void createSecurityEvent('LOGIN_BLOCKED', {
                userId: existingUser.id,
                data: {
                  provider: account.provider,
                  reason: 'unverified_existing_account',
                },
              });
              return '/sign-in?error=OAuthAccountNotLinked';
            }

            await db.oAuthAccount.create({
              data: {
                userId: existingUser.id,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                tokenType: account.token_type,
                scope: account.scope,
              },
            });

            if (!existingUser.emailVerified) {
              await db.user.update({
                where: { id: existingUser.id },
                data: { emailVerified: new Date() },
              });
            }

            if (!existingUser.customerProfile) {
              await db.customerProfile.upsert({
                where: { userId: existingUser.id },
                update: {},
                create: { userId: existingUser.id, city: 'Ahmedabad' },
              });
            }

            void createSecurityEvent('LOGIN_SUCCESS', {
              userId: existingUser.id,
              data: { provider: account.provider, method: 'oauth_verified_link' },
            });
          }

          user.id = existingUser.id;
          (user as unknown as { roles: string[] }).roles =
            existingUser.userRoles.map((r) => r.role);
          return true;
        } catch (e) {
          logger.error(
            { error: e, provider: account.provider },
            '[auth/oauth/signIn] Failed during OAuth sync',
          );
          return '/sign-in?error=OAuthCallback';
        }
      }
      return true;
    },

    async redirect({ url, baseUrl }) {
      const safePath = sanitizeCallbackPath(url, baseUrl);
      return `${baseUrl}${safePath}`;
    },

    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.roles =
          (user as unknown as { roles?: string[] }).roles ?? ['CUSTOMER'];
      }
      if (trigger === 'update' && token.id) {
        try {
          const dbUser = await db.user.findUnique({
            where: { id: token.id as string },
            include: { userRoles: true },
          });
          if (dbUser) {
            token.roles = dbUser.userRoles.map((r) => r.role);
          }
        } catch {
          // ignore
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as unknown as { roles?: string[] }).roles =
          (token.roles as string[]) ?? ['CUSTOMER'];
      }
      return session;
    },
  },
  trustHost: true,
  secret:
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    'proventa_default_auth_secret_session_key_32chars_min_2026',
});
