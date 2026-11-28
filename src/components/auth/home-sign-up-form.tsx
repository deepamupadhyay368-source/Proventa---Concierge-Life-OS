'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { User, Mail, Phone, Lock, Loader2, ArrowRight } from 'lucide-react';
import { sanitizeCallbackPath } from '@/lib/auth/callback-url';

export function HomeSignUpForm({ callbackUrl }: { callbackUrl?: string }) {
  const router = useRouter();
  const safeCallback = sanitizeCallbackPath(callbackUrl);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Register customer account via API
      const res = await fetch('/api/auth/register-customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          password: password.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create customer account');
      }

      // Automatically sign in on successful registration
      const loginRes = await signIn('credentials', {
        email: email.trim().toLowerCase(),
        password: password.trim(),
        redirect: false,
        callbackUrl: safeCallback,
      });

      if (loginRes?.error) {
        // Redirect to login if auto-signin has an edge condition
        router.push(`/login?registered=true&callbackUrl=${encodeURIComponent(safeCallback)}`);
      } else {
        router.push(safeCallback);
        router.refresh();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed.');
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
      setError(err instanceof Error ? err.message : 'Google sign in failed.');
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
        className="w-full h-10 flex items-center justify-center gap-3 px-4 border border-[#C8C4BA] bg-white hover:bg-[#F5F3ED] text-xs font-bold uppercase tracking-wider text-[#202B3C] transition-colors disabled:opacity-60"
      >
        {oauthLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-[#202B3C]" />
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
        <span>Register with Google</span>
      </button>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#C8C4BA]/50" />
        </div>
        <div className="relative flex justify-center text-[10px] uppercase font-mono tracking-wider">
          <span className="bg-white px-2 text-[#69717B]">Or sign up with details</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="block text-xs font-semibold text-[#202B3C] mb-1">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-[#69717B]" />
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Rajiv Mehta"
              required
              className="w-full h-10 pl-9 pr-3 bg-white border border-[#C8C4BA] text-xs text-[#202B3C] placeholder-[#69717B] focus:outline-hidden focus:border-[#202B3C]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#202B3C] mb-1">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-[#69717B]" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@domain.com"
              required
              className="w-full h-10 pl-9 pr-3 bg-white border border-[#C8C4BA] text-xs text-[#202B3C] placeholder-[#69717B] focus:outline-hidden focus:border-[#202B3C]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#202B3C] mb-1">
            Mobile Number
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-4 w-4 text-[#69717B]" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              required
              className="w-full h-10 pl-9 pr-3 bg-white border border-[#C8C4BA] text-xs text-[#202B3C] placeholder-[#69717B] focus:outline-hidden focus:border-[#202B3C]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#202B3C] mb-1">
            Password (Min. 8 characters)
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-[#69717B]" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={8}
              className="w-full h-10 pl-9 pr-3 bg-white border border-[#C8C4BA] text-xs text-[#202B3C] placeholder-[#69717B] focus:outline-hidden focus:border-[#202B3C]"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || oauthLoading}
          className="w-full h-10 px-4 bg-[#202B3C] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#202B3C]/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <span>Create Account</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
