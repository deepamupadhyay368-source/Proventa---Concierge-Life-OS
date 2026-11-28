'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, KeyRound, Loader2, ArrowRight } from 'lucide-react';

import { sanitizeCallbackPath } from '@/lib/auth/callback-url';

function formatAuthError(code?: string | null): string | null {
  if (!code) return null;
  const map: Record<string, string> = {
    CredentialsSignin: 'Invalid email or password. Please try again.',
    OAuthAccountNotLinked: 'This email is already registered. Please sign in with your email and password.',
    PassKeyRequired: 'Please sign in with your email and password or PROVENTA pass key.',
    account_suspended: 'Your account has been suspended. Please contact support.',
    unverified_oauth_email: 'Your OAuth provider email is not verified.',
    OAuthEmailMissing: 'Your OAuth provider did not return an email address.',
    OAuthCallback: 'Google sign-in could not be completed. Please try again.',
  };
  return map[code] || 'Sign-in could not be completed. Please try again.';
}

export function HomeSignInForm({
  callbackUrl,
  initialError,
}: {
  callbackUrl?: string;
  initialError?: string;
}) {
  const router = useRouter();
  const safeCallback = sanitizeCallbackPath(callbackUrl);

  const [mode, setMode] = useState<'password' | 'passkey'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passKey, setPassKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [error, setError] = useState<string | null>(() => formatAuthError(initialError));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'password') {
      if (!email.trim() || !password.trim()) {
        setError('Please provide both email and password.');
        return;
      }
    } else {
      if (!email.trim() || !passKey.trim()) {
        setError('Please provide both email and your 12-digit PROVENTA Pass Key.');
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const res =
        mode === 'password'
          ? await signIn('credentials', {
              email: email.trim().toLowerCase(),
              password: password.trim(),
              redirect: false,
              callbackUrl: safeCallback,
            })
          : await signIn('passkey', {
              email: email.trim().toLowerCase(),
              passKey: passKey.trim(),
              redirect: false,
              callbackUrl: safeCallback,
            });

      if (res?.error) {
        if (res.error === 'CredentialsSignin') {
          setError(
            mode === 'password'
              ? 'Invalid email or password. Please try again.'
              : 'Invalid email or PROVENTA Pass Key. Please try again.',
          );
        } else {
          setError(formatAuthError(res.error));
        }
      } else if (res?.ok) {
        router.push(safeCallback);
        router.refresh();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setOauthLoading(true);
    setError(null);
    try {
      await signIn('google', {
        callbackUrl: safeCallback,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Google authentication failed.');
      setOauthLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-300 text-xs text-red-700 font-medium">
          {error}
        </div>
      )}

      {/* Google OAuth Button */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={oauthLoading || loading}
        className="w-full h-10 flex items-center justify-center gap-3 px-4 border border-[#E8EBEF] bg-white hover:bg-[#F7F8FA] text-xs font-bold uppercase tracking-wider text-[#202B38] transition-colors disabled:opacity-60"
      >
        {oauthLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-[#202B38]" />
        ) : (
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
        )}
        <span>Continue with Google</span>
      </button>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#E8EBEF]" />
        </div>
        <div className="relative flex justify-center text-[10px] uppercase font-mono tracking-wider">
          <span className="bg-white px-2 text-[#697586]">Or sign in with credentials</span>
        </div>
      </div>

      {/* Mode Switcher: Email & Password vs 12-Digit PROVENTA Pass Key */}
      <div className="grid grid-cols-2 border border-[#E8EBEF] bg-[#F7F8FA] p-0.5 text-[11px] font-semibold">
        <button
          type="button"
          onClick={() => { setMode('password'); setError(null); }}
          className={`py-1.5 transition-colors ${
            mode === 'password'
              ? 'bg-[#FFFFFF] text-[#202B38] border border-[#E8EBEF]'
              : 'text-[#697586] hover:text-[#202B38]'
          }`}
        >
          Email &amp; Password
        </button>
        <button
          type="button"
          onClick={() => { setMode('passkey'); setError(null); }}
          className={`py-1.5 transition-colors ${
            mode === 'passkey'
              ? 'bg-[#FFFFFF] text-[#202B38] border border-[#E8EBEF]'
              : 'text-[#697586] hover:text-[#202B38]'
          }`}
        >
          PROVENTA Pass Key
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#202B38] mb-1">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-[#697586]" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@domain.com"
              required
              className="w-full h-10 pl-9 pr-3 bg-white border border-[#E8EBEF] text-xs text-[#202B38] placeholder-[#929BA6] focus:outline-none focus:border-[#29465F]"
            />
          </div>
        </div>

        {mode === 'password' ? (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-[#202B38]">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-[11px] text-[#29465F] hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-[#697586]" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full h-10 pl-9 pr-3 bg-white border border-[#E8EBEF] text-xs text-[#202B38] placeholder-[#929BA6] focus:outline-none focus:border-[#29465F]"
              />
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-[#202B38]">
                12-Digit PROVENTA Pass Key
              </label>
              <Link
                href="/recover-passkey"
                className="text-[11px] text-[#29465F] hover:underline"
              >
                Recover pass key?
              </Link>
            </div>
            <div className="relative">
              <KeyRound className="absolute left-3 top-3 h-4 w-4 text-[#697586]" />
              <input
                type="password"
                inputMode="numeric"
                value={passKey}
                onChange={(e) => setPassKey(e.target.value)}
                placeholder="XXXX-XXXX-XXXX"
                required
                className="w-full h-10 pl-9 pr-3 bg-white border border-[#E8EBEF] text-xs font-mono text-[#202B38] placeholder-[#929BA6] focus:outline-none focus:border-[#29465F]"
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || oauthLoading}
          className="w-full h-10 px-4 bg-[#29465F] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#29465F]/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <span>Sign In to PROVENTA</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
