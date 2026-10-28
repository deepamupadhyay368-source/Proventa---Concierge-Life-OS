import type { Metadata } from 'next';
import { SignInForm } from '@/components/auth/sign-in-form';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sign In | PROVENTA — Business without limits.',
  description:
    'Sign in to PROVENTA to manage your customer enquiries, quotations, or business storefront.',
};

function getAuthErrorMessage(errorCode?: string): string | null {
  if (!errorCode) return null;
  switch (errorCode) {
    case 'AccessDenied':
      return 'Google sign-in was cancelled or access was denied.';
    case 'OAuthAccountNotLinked':
      return 'This email is already registered under an existing account that cannot be automatically linked. Please sign in with your email, password, and Authentication Key.';
    case 'unverified_oauth_email':
      return 'Your Google account email address must be verified before signing in.';
    case 'account_suspended':
      return 'This account has been suspended. Please contact support@proventa.in.';
    case 'OAuthSignin':
    case 'OAuthCallback':
    case 'Callback':
      return 'Google authentication could not be completed. Please try again.';
    case 'invalid_token':
    case 'invalid_or_expired_token':
      return 'This verification link is invalid or has expired.';
    default:
      return 'Authentication was not completed. Please try again.';
  }
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    verified?: string;
    registered?: string;
    callbackUrl?: string;
  }>;
}) {
  const params = await searchParams;
  const errorMessage = getAuthErrorMessage(params.error);

  return (
    <div className="min-h-screen bg-[#171A14] text-[#F6F0E4] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* Architectural Header */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block">
            <span className="font-serif text-3xl tracking-[0.18em] uppercase text-[#F6F0E4] hover:text-[#B94E2D] transition-colors">
              PROVENTA
            </span>
          </Link>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#A98253]">
            Business without limits. · Every Business. One Place.
          </p>
        </div>

        {(params.verified || params.registered) && (
          <div className="mb-6 p-4 bg-[#20211C] border border-[#A98253] rounded-[2px] text-xs text-[#E9DFCC] font-mono">
            Account activated. You can now sign in with Google or your credentials.
          </div>
        )}

        {errorMessage && (
          <div
            role="alert"
            className="mb-6 p-4 bg-[#B94E2D]/20 border border-[#B94E2D] rounded-[2px] text-xs text-[#F6F0E4]"
          >
            {errorMessage}
          </div>
        )}

        {/* Warm Ivory Auth Card */}
        <div className="rounded-[2px] border border-[#D5CBB8] bg-[#F5F0E5] text-[#181914] p-8 shadow-elevated">
          <div className="mb-6 pb-4 border-b border-[#D5CBB8]">
            <h1 className="font-display text-3xl text-[#181914]">
              Sign In to PROVENTA
            </h1>
            <p className="text-xs text-[#5C584F] mt-1">
              Access your customer enquiry workspace or business storefront console.
            </p>
          </div>
          <SignInForm callbackUrl={params.callbackUrl} />
        </div>

        <div className="mt-6 rounded-[2px] border border-[#4C4A40] bg-[#20211C] p-4 font-mono text-xs text-[#E9DFCC] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[#A7A194]">NEW TO PROVENTA?</span>
            <Link
              href="/sign-up"
              className="text-[#B94E2D] hover:underline font-medium"
            >
              CREATE ACCOUNT →
            </Link>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-[#4C4A40]">
            <span className="text-[#A7A194]">LISTING A BUSINESS?</span>
            <Link
              href="/business/register"
              className="text-[#F6F0E4] hover:text-[#B94E2D] hover:underline font-medium"
            >
              REGISTER STOREFRONT →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
