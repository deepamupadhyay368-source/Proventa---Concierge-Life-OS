'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { signIn, useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { registerSchema } from '@/lib/validation/schemas';
import {
  Loader2,
  KeyRound,
  Copy,
  Check,
  ArrowRight,
  ShoppingCart,
  Truck,
  Layers,
  Building2,
  ShieldCheck,
  LogOut,
} from 'lucide-react';
import type { z } from 'zod';

type FormData = z.infer<typeof registerSchema>;

interface SignUpFormProps {
  callbackUrl?: string;
  initialRole?: string;
}

export function SignUpForm({ callbackUrl, initialRole }: SignUpFormProps) {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();

  // Role selection: BUYER, SUPPLIER, or BOTH
  const normalizedInitialRole: 'BUYER' | 'SUPPLIER' | 'BOTH' =
    initialRole?.toUpperCase() === 'SUPPLIER'
      ? 'SUPPLIER'
      : initialRole?.toUpperCase() === 'BOTH'
      ? 'BOTH'
      : 'BUYER';

  const [accountType, setAccountType] = useState<'BUYER' | 'SUPPLIER' | 'BOTH'>(
    normalizedInitialRole,
  );

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);

  // Custom vs auto-generated passkey
  const [useCustomKey, setUseCustomKey] = useState(false);
  const [customKey, setCustomKey] = useState('');
  const [confirmKey, setConfirmKey] = useState('');

  // Key display success state
  const [generatedAuthKey, setGeneratedAuthKey] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<{
    email: string;
    password: string;
    passKey?: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [keyConfirmed, setKeyConfirmed] = useState(false);
  const [entering, setEntering] = useState(false);

  // Terms acceptance
  const [termsAccepted, setTermsAccepted] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      accountType: normalizedInitialRole,
      termsConsent: true,
    },
  });

  const handleCustomKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/[^0-9]/g, '').slice(0, 12);
    let formatted = digits;
    if (digits.length > 8) {
      formatted = `${digits.slice(0, 4)}-${digits.slice(4, 8)}-${digits.slice(8, 12)}`;
    } else if (digits.length > 4) {
      formatted = `${digits.slice(0, 4)}-${digits.slice(4, 8)}`;
    }
    setCustomKey(formatted);
  };

  const handleConfirmKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/[^0-9]/g, '').slice(0, 12);
    let formatted = digits;
    if (digits.length > 8) {
      formatted = `${digits.slice(0, 4)}-${digits.slice(4, 8)}-${digits.slice(8, 12)}`;
    } else if (digits.length > 4) {
      formatted = `${digits.slice(0, 4)}-${digits.slice(4, 8)}`;
    }
    setConfirmKey(formatted);
  };

  const onSubmit = async (data: FormData) => {
    if (!termsAccepted) {
      setError('Please accept the PROVENTA Terms of Service and Privacy Policy to proceed.');
      return;
    }

    if (useCustomKey) {
      const cleanCustom = customKey.replace(/[^0-9]/g, '');
      const cleanConfirm = confirmKey.replace(/[^0-9]/g, '');
      if (cleanCustom.length !== 12) {
        setError('Your custom passkey must be exactly 12 numeric digits.');
        return;
      }
      if (cleanCustom !== cleanConfirm) {
        setError('12-digit passkeys do not match. Please verify both entries.');
        return;
      }
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          businessName: data.businessName,
          email: data.email,
          phone: data.phone,
          password: data.password,
          confirmPassword: data.confirmPassword,
          passKey: useCustomKey ? customKey : undefined,
          confirmPassKey: useCustomKey ? confirmKey : undefined,
          accountType,
          termsConsent: true,
        }),
      });
      const json = await res.json();
      if (res.ok) {
        const returnedKey = json.authenticationKey || json.passKey;
        if (returnedKey) {
          setGeneratedAuthKey(returnedKey);
          setCredentials({
            email: data.email.trim().toLowerCase(),
            password: data.password,
            passKey: returnedKey,
          });
        } else {
          const dest = callbackUrl || `/onboarding/business?role=${accountType}`;
          router.push(dest);
        }
      } else {
        setError(json.error || 'Failed to create account.');
      }
    } catch {
      setError('An error occurred during registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyKey = () => {
    if (!generatedAuthKey) return;
    navigator.clipboard.writeText(generatedAuthKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleProceedToProventa = async () => {
    if (!credentials || !keyConfirmed) return;
    setEntering(true);
    try {
      const res = await signIn('passkey', {
        email: credentials.email,
        passKey: credentials.passKey || '',
        passkey: credentials.passKey || '',
        redirect: false,
      });

      const destination =
        callbackUrl || `/onboarding/business?role=${accountType}`;

      if (res?.ok) {
        router.push(destination);
        router.refresh();
      } else {
        // Fallback with credentials provider
        const credRes = await signIn('credentials', {
          email: credentials.email,
          password: credentials.password,
          redirect: false,
        });
        if (credRes?.ok) {
          router.push(destination);
          router.refresh();
        } else {
          router.push(
            `/sign-in?registered=true&callbackUrl=${encodeURIComponent(destination)}`,
          );
        }
      }
    } catch {
      const destination =
        callbackUrl || `/onboarding/business?role=${accountType}`;
      router.push(
        `/sign-in?registered=true&callbackUrl=${encodeURIComponent(destination)}`,
      );
    } finally {
      setEntering(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setOauthLoading('google');
    setError(null);
    try {
      const destination =
        callbackUrl || `/onboarding/business?role=${accountType}`;
      await signIn('google', {
        callbackUrl: destination,
      });
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Failed to continue with Google.',
      );
      setOauthLoading(null);
    }
  };

  if (generatedAuthKey) {
    return (
      <div className="space-y-6">
        <div className="p-6 bg-[#252B38] border border-[#414957] text-center space-y-4 rounded-sm">
          <div className="inline-flex p-3 bg-[#191B20] text-[#536B88] mx-auto border border-[#414957] rounded-sm">
            <KeyRound className="h-6 w-6 text-[#536B88]" />
          </div>

          <div className="space-y-1">
            <h2 className="font-heading font-bold text-sm tracking-widest uppercase text-[#FFFFFF]">
              YOUR 12-DIGIT PROVENTA PASS KEY
            </h2>
            <p className="text-xs text-[#A8ADB7]">
              Your permanent 12-digit numeric Pass Key. You will enter this key alongside your registered email whenever you sign in.
            </p>
          </div>

          <div className="p-3 bg-[#191B20] border border-[#414957] font-mono text-base tracking-widest break-all text-[#C66A42] select-all font-bold rounded-sm">
            {generatedAuthKey}
          </div>

          <button
            type="button"
            onClick={handleCopyKey}
            className="inline-flex items-center gap-2 px-4 py-2 border border-[#414957] bg-[#303746] hover:bg-[#252B38] text-xs font-mono uppercase tracking-wider text-[#F1F2F4] transition-colors rounded-sm"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-[#4A7C59]" />
                <span>Copied to Clipboard</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Key</span>
              </>
            )}
          </button>
        </div>

        <div className="space-y-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={keyConfirmed}
              onChange={(e) => setKeyConfirmed(e.target.checked)}
              className="mt-1 h-4 w-4 accent-[#C66A42]"
            />
            <span className="text-xs text-[#A8ADB7]">
              I have recorded my 12-digit PROVENTA Pass Key safely.
            </span>
          </label>

          <button
            type="button"
            onClick={handleProceedToProventa}
            disabled={!keyConfirmed || entering}
            className="w-full py-3.5 bg-[#C66A42] text-white hover:bg-[#B35A33] font-heading font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 disabled:opacity-50 rounded-sm shadow-sm"
          >
            {entering ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <span>PROCEED TO BUSINESS ONBOARDING</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Existing session notification with choice to continue or register new business */}
      {sessionStatus === 'authenticated' && session?.user?.email && (
        <div className="p-3.5 bg-[#252B38] border border-[#536B88] rounded-sm flex items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <span className="font-mono text-[#A8ADB7] text-[10px] uppercase tracking-wider block">
              Active Session Detected
            </span>
            <span className="text-[#FFFFFF] font-semibold">
              Signed in as {session.user.email}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={callbackUrl || `/onboarding/business?role=${accountType}`}
              className="px-2.5 py-1.5 bg-[#536B88] text-white hover:bg-[#435770] font-mono text-[10px] uppercase font-bold rounded-sm transition-colors"
            >
              Resume Onboarding
            </Link>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: '/sign-up' })}
              className="px-2.5 py-1.5 bg-[#191B20] text-[#A8ADB7] hover:text-white border border-[#414957] font-mono text-[10px] uppercase rounded-sm transition-colors flex items-center gap-1"
            >
              <LogOut className="w-3 h-3" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="p-3.5 bg-[#252B38] border border-[#D9534F] text-xs text-[#D9534F] font-medium rounded-sm"
        >
          {error}
        </div>
      )}

      {/* Account Type Selection */}
      <div className="space-y-2">
        <label className="block text-[11px] font-mono uppercase tracking-wider text-[#FFFFFF] font-bold">
          1. Select Your Platform Role
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setAccountType('BUYER')}
            className={`p-3 text-left border rounded-sm transition-all ${
              accountType === 'BUYER'
                ? 'border-[#C66A42] bg-[#252B38] text-[#FFFFFF]'
                : 'border-[#414957] bg-[#191B20] text-[#A8ADB7] hover:border-[#536B88]'
            }`}
          >
            <div className="flex items-center gap-2">
              <ShoppingCart
                className={`w-4 h-4 ${
                  accountType === 'BUYER' ? 'text-[#C66A42]' : 'text-[#A8ADB7]'
                }`}
              />
              <span className="font-heading text-xs uppercase font-bold text-[#FFFFFF]">
                Buyer
              </span>
            </div>
            <p className="text-[10px] text-[#A8ADB7] mt-1 line-clamp-2">
              Contractor, builder, or enterprise buyer
            </p>
          </button>

          <button
            type="button"
            onClick={() => setAccountType('SUPPLIER')}
            className={`p-3 text-left border rounded-sm transition-all ${
              accountType === 'SUPPLIER'
                ? 'border-[#C66A42] bg-[#252B38] text-[#FFFFFF]'
                : 'border-[#414957] bg-[#191B20] text-[#A8ADB7] hover:border-[#536B88]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Truck
                className={`w-4 h-4 ${
                  accountType === 'SUPPLIER'
                    ? 'text-[#C66A42]'
                    : 'text-[#A8ADB7]'
                }`}
              />
              <span className="font-heading text-xs uppercase font-bold text-[#FFFFFF]">
                Supplier
              </span>
            </div>
            <p className="text-[10px] text-[#A8ADB7] mt-1 line-clamp-2">
              Stockist, distributor, or manufacturer
            </p>
          </button>

          <button
            type="button"
            onClick={() => setAccountType('BOTH')}
            className={`p-3 text-left border rounded-sm transition-all ${
              accountType === 'BOTH'
                ? 'border-[#C66A42] bg-[#252B38] text-[#FFFFFF]'
                : 'border-[#414957] bg-[#191B20] text-[#A8ADB7] hover:border-[#536B88]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Layers
                className={`w-4 h-4 ${
                  accountType === 'BOTH' ? 'text-[#C66A42]' : 'text-[#A8ADB7]'
                }`}
              />
              <span className="font-heading text-xs uppercase font-bold text-[#FFFFFF]">
                Both
              </span>
            </div>
            <p className="text-[10px] text-[#A8ADB7] mt-1 line-clamp-2">
              Both procure and supply materials
            </p>
          </button>
        </div>
      </div>

      {/* Primary Action: Continue with Google */}
      <div>
        <button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={!!oauthLoading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-[#414957] bg-[#252B38] hover:bg-[#191B20] text-xs font-heading font-bold uppercase tracking-wider text-[#FFFFFF] transition-all shadow-sm disabled:opacity-50 rounded-sm"
        >
          {oauthLoading === 'google' ? (
            <Loader2 className="h-4 w-4 animate-spin text-[#FFFFFF]" />
          ) : (
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
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
      </div>

      <div className="relative flex items-center justify-center">
        <div className="border-t border-[#414957] w-full" />
        <span className="bg-[#303746] px-3 font-mono text-[10px] uppercase tracking-widest text-[#A8ADB7] absolute">
          Or Register with Business Details
        </span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Full Name */}
        <div className="space-y-1">
          <label className="block text-[11px] font-mono uppercase tracking-wider text-[#FFFFFF] font-bold">
            Full Name <span className="text-[#C66A42]">*</span>
          </label>
          <input
            {...register('name')}
            name="name"
            type="text"
            placeholder="Pravin Patel"
            className="w-full px-3.5 py-2.5 bg-[#191B20] border border-[#414957] focus:border-[#536B88] focus:outline-none text-sm text-[#FFFFFF] placeholder-[#A8ADB7] transition-colors rounded-sm"
          />
          {errors.name && (
            <p className="text-xs text-[#D9534F]">{errors.name.message}</p>
          )}
        </div>

        {/* Business Name */}
        <div className="space-y-1">
          <label className="block text-[11px] font-mono uppercase tracking-wider text-[#FFFFFF] font-bold">
            Business / Enterprise Name
          </label>
          <input
            {...register('businessName')}
            name="businessName"
            type="text"
            placeholder="Patel Infrastructure & Civil Projects Ltd"
            className="w-full px-3.5 py-2.5 bg-[#191B20] border border-[#414957] focus:border-[#536B88] focus:outline-none text-sm text-[#FFFFFF] placeholder-[#A8ADB7] transition-colors rounded-sm"
          />
          {errors.businessName && (
            <p className="text-xs text-[#D9534F]">{errors.businessName.message}</p>
          )}
        </div>

        {/* Business Email */}
        <div className="space-y-1">
          <label className="block text-[11px] font-mono uppercase tracking-wider text-[#FFFFFF] font-bold">
            Business Email Address <span className="text-[#C66A42]">*</span>
          </label>
          <input
            {...register('email')}
            name="email"
            type="email"
            placeholder="pravin@patelinfra.in"
            className="w-full px-3.5 py-2.5 bg-[#191B20] border border-[#414957] focus:border-[#536B88] focus:outline-none text-sm text-[#FFFFFF] placeholder-[#A8ADB7] transition-colors rounded-sm"
          />
          {errors.email && (
            <p className="text-xs text-[#D9534F]">{errors.email.message}</p>
          )}
        </div>

        {/* Mobile Number */}
        <div className="space-y-1">
          <label className="block text-[11px] font-mono uppercase tracking-wider text-[#FFFFFF] font-bold">
            Mobile Number (Optional)
          </label>
          <input
            {...register('phone')}
            name="phone"
            type="tel"
            placeholder="+91 98765 43210"
            className="w-full px-3.5 py-2.5 bg-[#191B20] border border-[#414957] focus:border-[#536B88] focus:outline-none text-sm text-[#FFFFFF] placeholder-[#A8ADB7] transition-colors rounded-sm font-mono"
          />
          {errors.phone && (
            <p className="text-xs text-[#D9534F]">{errors.phone.message}</p>
          )}
        </div>

        {/* Authentication Credential Mode */}
        <div className="space-y-3 pt-2 border-t border-[#414957]/60">
          <div className="flex items-center justify-between">
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[#FFFFFF] font-bold">
              12-Digit Pass Key Credential
            </label>
            <button
              type="button"
              onClick={() => setUseCustomKey(!useCustomKey)}
              className="text-[10px] font-mono uppercase text-[#C66A42] hover:underline font-bold"
            >
              {useCustomKey ? 'Auto-Generate Key' : 'Enter Custom Key'}
            </button>
          </div>

          {!useCustomKey ? (
            <div className="p-3 bg-[#191B20] border border-[#414957] rounded-sm text-xs text-[#A8ADB7] flex items-center gap-2.5">
              <KeyRound className="w-4 h-4 text-[#536B88] shrink-0" />
              <span>A secure 12-digit numeric Pass Key will be automatically created and presented upon registration.</span>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <input
                  type="text"
                  inputMode="numeric"
                  value={customKey}
                  onChange={handleCustomKeyChange}
                  placeholder="1234-5678-9012"
                  maxLength={14}
                  className="w-full px-3.5 py-2.5 bg-[#191B20] border border-[#414957] focus:border-[#536B88] focus:outline-none text-sm font-mono tracking-widest text-[#FFFFFF] placeholder-[#A8ADB7] rounded-sm"
                />
              </div>
              <div>
                <input
                  type="text"
                  inputMode="numeric"
                  value={confirmKey}
                  onChange={handleConfirmKeyChange}
                  placeholder="Confirm 12-Digit Key"
                  maxLength={14}
                  className="w-full px-3.5 py-2.5 bg-[#191B20] border border-[#414957] focus:border-[#536B88] focus:outline-none text-sm font-mono tracking-widest text-[#FFFFFF] placeholder-[#A8ADB7] rounded-sm"
                />
              </div>
            </div>
          )}
        </div>

        {/* Account Password */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="space-y-1">
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[#FFFFFF] font-bold">
              Password <span className="text-[#C66A42]">*</span>
            </label>
            <input
              {...register('password')}
              name="password"
              type="password"
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2.5 bg-[#191B20] border border-[#414957] focus:border-[#536B88] focus:outline-none text-sm text-[#FFFFFF] placeholder-[#A8ADB7] transition-colors rounded-sm"
            />
            {errors.password && (
              <p className="text-xs text-[#D9534F]">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[#FFFFFF] font-bold">
              Confirm Password <span className="text-[#C66A42]">*</span>
            </label>
            <input
              {...register('confirmPassword')}
              name="confirmPassword"
              type="password"
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2.5 bg-[#191B20] border border-[#414957] focus:border-[#536B88] focus:outline-none text-sm text-[#FFFFFF] placeholder-[#A8ADB7] transition-colors rounded-sm"
            />
            {errors.confirmPassword && (
              <p className="text-xs text-[#D9534F]">{errors.confirmPassword.message}</p>
            )}
          </div>
        </div>

        {/* Terms of Service & Privacy Policy Acceptance */}
        <div className="pt-2">
          <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#A8ADB7]">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-[#C66A42]"
            />
            <span>
              I accept the PROVENTA{' '}
              <Link href="/terms" target="_blank" className="text-[#C66A42] hover:underline font-semibold">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" target="_blank" className="text-[#C66A42] hover:underline font-semibold">
                Privacy Policy
              </Link>.
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-[#C66A42] text-white hover:bg-[#B35A33] font-heading font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 disabled:opacity-50 rounded-sm shadow-sm"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <span>CREATE {accountType} ACCOUNT</span>
          )}
        </button>
      </form>
    </div>
  );
}
