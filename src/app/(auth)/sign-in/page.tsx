import type { Metadata } from 'next';
import { SignInForm } from '@/components/auth/sign-in-form';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sign In | PROVENTA — Construction Procurement Platform',
  description:
    'Sign in to your PROVENTA Construction Procurement Platform command portal with your credentials.',
};

function getAuthErrorMessage(errorCode?: string): string | null {
  if (!errorCode) return null;
  switch (errorCode) {
    case 'PassKeyRequired':
      return 'Existing PROVENTA account detected. For your security, please sign in with your registered email and 12-digit Pass Key.';
    case 'SessionExpired':
      return 'Your session has expired. Please authenticate with your 12-digit Pass Key.';
    case 'AccessDenied':
      return 'Authentication was cancelled or access was denied.';
    case 'OAuthAccountNotLinked':
      return 'This email is already registered under an existing account. Please sign in with your email and 12-digit Pass Key.';
    case 'unverified_oauth_email':
      return 'Your Google account email address must be verified before signing in.';
    case 'account_suspended':
      return 'This account has been suspended. Please contact support@proventa.in.';
    case 'OAuthSignin':
    case 'OAuthCallback':
    case 'Callback':
      return 'Authentication could not be completed. Please enter your email and 12-digit Pass Key.';
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
    recovered?: string;
    callbackUrl?: string;
  }>;
}) {
  const params = await searchParams;
  const errorMessage = getAuthErrorMessage(params.error);

  return (
    <div className="min-h-screen bg-[#F2F0E9] text-[#171A17] flex items-center justify-center px-4 py-16 font-sans selection:bg-[#53634A] selection:text-white">
      <div className="w-full max-w-md space-y-8">
        {/* Architectural Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-10 h-10 bg-[#53634A] text-[#FFFFFF] flex items-center justify-center font-heading font-black text-lg shadow-sm">
              P
            </div>
            <span className="font-heading text-2xl tracking-[0.14em] uppercase font-black text-[#171A17]">
              PROVENTA
            </span>
          </Link>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#777970] font-semibold">
            Construction Procurement Platform
          </p>
        </div>

        {params.registered && (
          <div className="p-4 bg-[#EEF1EC] border border-[#53634A] text-xs text-[#53634A] font-mono text-center font-bold">
            Registration complete. Please sign in using your registered email and 12-digit Pass Key.
          </div>
        )}

        {params.recovered && (
          <div className="p-4 bg-[#EEF1EC] border border-[#53634A] text-xs text-[#53634A] font-mono text-center font-bold">
            Pass Key updated successfully. Sign in with your new 12-digit Pass Key.
          </div>
        )}

        {params.verified && (
          <div className="p-4 bg-[#EEF1EC] border border-[#53634A] text-xs text-[#53634A] font-mono text-center font-bold">
            Account verified. Sign in with your registered email and 12-digit Pass Key.
          </div>
        )}

        {errorMessage && (
          <div
            role="alert"
            className="p-4 bg-[#A9433B]/10 border border-[#A9433B] text-xs text-[#A9433B] font-mono text-center font-bold"
          >
            {errorMessage}
          </div>
        )}

        {/* Clean Auth Card */}
        <div className="border border-[#D9D8CF] bg-[#FFFFFF] p-8 shadow-sm space-y-6">
          <div className="border-b border-[#D9D8CF] pb-4">
            <h1 className="font-heading font-black text-2xl uppercase tracking-tight text-[#171A17]">
              Sign In
            </h1>
            <p className="text-xs text-[#777970] mt-1">
              Access your buyer dashboard, RFQ comparison matrices, and delivery trackers.
            </p>
          </div>

          <SignInForm callbackUrl={params.callbackUrl} />
        </div>

        {/* Bottom Registration Switcher */}
        <div className="border border-[#D9D8CF] bg-[#FFFFFF] p-4 font-mono text-xs text-[#171A17] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[#777970]">NEW TO PROVENTA?</span>
            <Link
              href="/sign-up"
              className="text-[#53634A] hover:underline font-bold"
            >
              CREATE ACCOUNT →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
