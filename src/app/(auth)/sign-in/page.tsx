import type { Metadata } from 'next';
import { SignInForm } from '@/components/auth/sign-in-form';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Member Access | Proventa — Concierge Life OS',
  description: 'Sign in to your Proventa private concierge dashboard.',
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; verified?: string; callbackUrl?: string }> | { error?: string; verified?: string; callbackUrl?: string };
}) {
  const params = await Promise.resolve(searchParams);
  return (
    <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block group">
            <p className="text-3xl font-serif tracking-tight text-[#141312]">Proventa</p>
            <p className="text-[11px] tracking-[0.2em] uppercase text-[#8a7053] mt-1 font-medium">Concierge Life OS</p>
          </Link>
        </div>

        {/* Verified message */}
        {params.verified && (
          <div className="mb-6 p-4 bg-green-50/80 border border-green-200 rounded-xl text-xs text-green-800 font-sans">
            Email verified successfully. You can now access your member portal.
          </div>
        )}

        {/* Error message */}
        {params.error && (
          <div className="mb-6 p-4 bg-red-50/80 border border-red-200 rounded-xl text-xs text-red-800 font-sans">
            {params.error === 'invalid_token' ? 'Invalid or expired verification link.' :
             params.error === 'invalid_or_expired_token' ? 'This verification link has expired. Please request a new one.' :
             'Authentication was not completed. Please try again.'}
          </div>
        )}

        <div className="luxury-card rounded-2xl p-8 sm:p-9 shadow-lg border border-[#e8e2d8]">
          <div className="mb-6">
            <h1 className="text-2xl font-serif font-normal text-[#141312]">Member Sign In</h1>
            <p className="text-xs text-[#6e6b65] mt-1 font-sans">
              Enter using your verified email, phone number, or SSO provider.
            </p>
          </div>
          <SignInForm callbackUrl={params.callbackUrl} />
        </div>

        <p className="text-center text-xs text-[#8a7053] mt-8 font-sans">
          Don't have an active account?{' '}
          <Link href="/wave1" className="text-[#141312] hover:underline font-semibold">Apply for Cohort 1 Access</Link>
        </p>
      </div>
    </div>
  );
}
