import type { Metadata } from 'next';
import { SignInForm } from '@/components/auth/sign-in-form';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your Proventa account.',
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; verified?: string; callbackUrl?: string }> | { error?: string; verified?: string; callbackUrl?: string };
}) {
  const params = await Promise.resolve(searchParams);
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <p className="text-2xl font-semibold tracking-tight text-neutral-900">Proventa</p>
            <p className="text-xs tracking-[0.15em] uppercase text-neutral-400 mt-0.5">Concierge Life OS</p>
          </Link>
        </div>

        {/* Verified message */}
        {params.verified && (
          <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-lg text-sm text-green-800">
            Email verified. You can now sign in.
          </div>
        )}

        {/* Error message */}
        {params.error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg text-sm text-red-800">
            {params.error === 'invalid_token' ? 'Invalid or expired verification link.' :
             params.error === 'invalid_or_expired_token' ? 'This link has expired. Please request a new one.' :
             'Something went wrong. Please try again.'}
          </div>
        )}

        <div className="bg-white border border-neutral-200 rounded-xl p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-neutral-900 mb-6">Sign in</h1>
          <SignInForm callbackUrl={params.callbackUrl} />
        </div>

        <p className="text-center text-sm text-neutral-500 mt-6">
          Don't have an account?{' '}
          <Link href="/sign-up" className="text-brand-700 hover:underline font-medium">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
