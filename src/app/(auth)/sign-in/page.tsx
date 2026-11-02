import type { Metadata } from 'next';
import { SignInForm } from '@/components/auth/sign-in-form';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sign In | PROVENTA — Family Wealth OS',
  description:
    'Sign in to your PROVENTA Family Wealth OS command cockpit with Google or your credentials.',
};

function getAuthErrorMessage(errorCode?: string): string | null {
  if (!errorCode) return null;
  switch (errorCode) {
    case 'AccessDenied':
      return 'Google sign-in was cancelled or access was denied.';
    case 'OAuthAccountNotLinked':
      return 'This email is already registered under an existing account. Please sign in with your email and password to link Google.';
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
    <div className="min-h-screen bg-[#090B10] text-[#F4F6FA] flex items-center justify-center px-4 py-16 font-sans selection:bg-[#2457FF] selection:text-white">
      <div className="w-full max-w-md space-y-8">
        {/* Architectural Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-10 h-10 bg-[#2457FF] text-[#F4F6FA] flex items-center justify-center font-heading font-black text-lg rounded-xs shadow-md">
              P
            </div>
            <span className="font-heading text-2xl tracking-[0.1em] uppercase font-black text-[#F4F6FA]">
              PROVENTA
            </span>
          </Link>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#858D9B]">
            Family Wealth OS · One Living System
          </p>
        </div>

        {params.verified && (
          <div className="p-4 bg-[#171C26] border border-[#2457FF] rounded-xs text-xs text-[#F4F6FA] font-mono text-center">
            Account verified. Sign in with Google or your credentials.
          </div>
        )}

        {errorMessage && (
          <div
            role="alert"
            className="p-4 bg-[#FF7A70]/10 border border-[#FF7A70] rounded-xs text-xs text-[#FF7A70] font-mono text-center"
          >
            {errorMessage}
          </div>
        )}

        {/* Clean Auth Card */}
        <div className="rounded-xs border border-[#252C38] bg-[#171C26] p-8 shadow-2xl space-y-6">
          <div className="border-b border-[#252C38] pb-4">
            <h1 className="font-heading font-black text-2xl uppercase tracking-tight text-[#F4F6FA]">
              Sign In
            </h1>
            <p className="text-xs text-[#C5CAD3] mt-1">
              Access your family balance sheet, encrypted vault, and wealth cockpits.
            </p>
          </div>

          <SignInForm callbackUrl={params.callbackUrl} />
        </div>

        {/* Bottom Registration & Demo Switcher */}
        <div className="rounded-xs border border-[#252C38] bg-[#171C26]/60 p-4 font-mono text-xs text-[#C5CAD3] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[#858D9B]">NEW TO PROVENTA?</span>
            <Link
              href="/sign-up"
              className="text-[#2457FF] hover:underline font-bold"
            >
              CREATE ACCOUNT →
            </Link>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-[#252C38]">
            <span className="text-[#858D9B]">EXPLORE PLATFORM?</span>
            <Link
              href="/dashboard"
              className="text-[#F4F6FA] hover:text-[#2457FF] transition-colors font-medium"
            >
              LAUNCH LIVE DEMO →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
