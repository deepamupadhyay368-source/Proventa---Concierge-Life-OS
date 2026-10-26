import type { Metadata } from 'next';
import { SignInForm } from '@/components/auth/sign-in-form';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sign In | PROVENTA — Every Business. One Place.',
  description: 'Sign in to PROVENTA to manage your customer enquiries, quotations, or business digital storefront.',
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
            <p className="text-3xl font-serif tracking-tight text-[#141312]">PROVENTA</p>
            <p className="text-[11px] tracking-[0.2em] uppercase text-[#8a7053] mt-1 font-medium">Every Business. One Place.</p>
          </Link>
        </div>

        {/* Verified or Registered message */}
        {(params.verified || (params as any).registered) && (
          <div className="mb-6 p-4 bg-green-50/80 border border-green-200 rounded-xl text-xs text-green-800 font-sans">
            Credentials configured and account activated. You can now sign in with your email and password.
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
            <h1 className="text-2xl font-serif font-normal text-[#141312]">Sign In to PROVENTA</h1>
            <p className="text-xs text-[#6e6b65] mt-1 font-sans">
              Access your customer enquiry workspace or business storefront dashboard.
            </p>
          </div>
          <SignInForm callbackUrl={params.callbackUrl} />
        </div>

        <div className="text-center text-xs text-[#8a7053] mt-8 font-sans space-y-2">
          <p>
            New to PROVENTA?{' '}
            <Link href="/sign-up" className="text-[#141312] hover:underline font-semibold">Create your account</Link>
          </p>
          <p>
            Want to list a business?{' '}
            <Link href="/business/register" className="text-[#141312] hover:underline font-semibold">Register your business storefront</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
