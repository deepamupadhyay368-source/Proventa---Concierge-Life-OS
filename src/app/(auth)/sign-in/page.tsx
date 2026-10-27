import type { Metadata } from 'next';
import { SignInForm } from '@/components/auth/sign-in-form';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sign In | PROVENTA — Every Business. One Place.',
  description:
    'Sign in to PROVENTA to manage your customer enquiries, quotations, or business digital storefront.',
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams:
    | Promise<{ error?: string; verified?: string; registered?: string; callbackUrl?: string }>
    | { error?: string; verified?: string; registered?: string; callbackUrl?: string };
}) {
  const params = await Promise.resolve(searchParams);
  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#15171B] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* Brand Wordmark */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-1.5 group">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#15171B] text-[14px] font-bold text-white group-hover:bg-[#304FFE] transition-colors">
                P
              </span>
              <span className="text-[22px] font-bold tracking-[-0.03em] text-[#15171B]">
                PROVENTA
              </span>
            </div>
            <p className="text-[11px] tracking-[0.14em] uppercase text-[#696D76] font-semibold">
              Every Business. One Place.
            </p>
          </Link>
        </div>

        {/* Verified or Registered message */}
        {(params.verified || params.registered) && (
          <div className="mb-6 p-4 bg-[#ECFDF5] border border-[#16845B]/25 rounded-[10px] text-[13px] text-[#16845B]">
            Credentials configured and account activated. You can now sign in with your email and password.
          </div>
        )}

        {/* Error message */}
        {params.error && (
          <div className="mb-6 p-4 bg-[#FEF2F2] border border-[#C53B43]/25 rounded-[10px] text-[13px] text-[#C53B43]">
            {params.error === 'invalid_token'
              ? 'Invalid or expired verification link.'
              : params.error === 'invalid_or_expired_token'
                ? 'This verification link has expired. Please request a new one.'
                : 'Authentication was not completed. Please try again.'}
          </div>
        )}

        <div className="surface-card p-8 sm:p-9">
          <div className="mb-6">
            <h1 className="text-[22px] font-bold tracking-tight text-[#15171B]">
              Sign In to PROVENTA
            </h1>
            <p className="text-[13px] text-[#696D76] mt-1">
              Access your customer enquiry workspace or business storefront dashboard.
            </p>
          </div>
          <SignInForm callbackUrl={params.callbackUrl} />
        </div>

        <div className="text-center text-[13px] text-[#696D76] mt-7 space-y-2">
          <p>
            New to PROVENTA?{' '}
            <Link
              href="/sign-up"
              className="text-[#304FFE] hover:underline font-semibold"
            >
              Create your account
            </Link>
          </p>
          <p>
            Want to list a business?{' '}
            <Link
              href="/business/register"
              className="text-[#15171B] hover:text-[#304FFE] hover:underline font-semibold"
            >
              Register your business storefront
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
