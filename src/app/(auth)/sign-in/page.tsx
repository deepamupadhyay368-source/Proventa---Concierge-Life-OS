import type { Metadata } from 'next';
import { SignInForm } from '@/components/auth/sign-in-form';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sign In | PROVENTA — Industrial Procurement Platform',
  description:
    'Sign in to your PROVENTA Industrial Procurement Platform command portal with your credentials.',
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
    <div className="min-h-screen bg-[#292F3D] text-[#F1F2F4] flex items-center justify-center px-4 py-16 font-sans selection:bg-[#536B88] selection:text-white">
      <div className="w-full max-w-md space-y-8">
        {/* Architectural Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-10 h-10 bg-[#536B88] text-[#FFFFFF] flex items-center justify-center font-heading font-black text-lg shadow-sm rounded-sm">
              P
            </div>
            <span className="font-heading text-2xl tracking-[0.14em] uppercase font-black text-[#FFFFFF]">
              PROVENTA
            </span>
          </Link>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#A8ADB7] font-semibold">
            Industrial Procurement Platform
          </p>
        </div>

        {params.registered && (
          <div className="p-4 bg-[#252B38] border border-[#4A7C59] text-xs text-[#4A7C59] font-mono text-center font-bold rounded-sm">
            Registration complete. Please sign in using your registered email and 12-digit Pass Key.
          </div>
        )}

        {params.recovered && (
          <div className="p-4 bg-[#252B38] border border-[#4A7C59] text-xs text-[#4A7C59] font-mono text-center font-bold rounded-sm">
            Pass Key updated successfully. Sign in with your new 12-digit Pass Key.
          </div>
        )}

        {params.verified && (
          <div className="p-4 bg-[#252B38] border border-[#4A7C59] text-xs text-[#4A7C59] font-mono text-center font-bold rounded-sm">
            Account verified. Sign in with your registered email and 12-digit Pass Key.
          </div>
        )}

        {errorMessage && (
          <div
            role="alert"
            className="p-4 bg-[#252B38] border border-[#D9534F] text-xs text-[#D9534F] font-mono text-center font-bold rounded-sm"
          >
            {errorMessage}
          </div>
        )}

        {/* Clean Auth Card */}
        <div className="border border-[#414957] bg-[#303746] p-8 shadow-sm space-y-6 rounded-sm">
          <div className="border-b border-[#414957] pb-4">
            <h1 className="font-heading font-black text-2xl uppercase tracking-tight text-[#FFFFFF]">
              Sign In
            </h1>
            <p className="text-xs text-[#A8ADB7] mt-1">
              Access your buyer dashboard, RFQ comparison matrices, and delivery trackers.
            </p>
          </div>

          <SignInForm callbackUrl={params.callbackUrl} />
        </div>

        {/* Bottom Registration Switcher */}
        <div className="border border-[#414957] bg-[#303746] p-4 font-mono text-xs text-[#F1F2F4] shadow-sm rounded-sm">
          <div className="flex items-center justify-between">
            <span className="text-[#A8ADB7]">NEW TO PROVENTA?</span>
            <Link
              href={
                params.callbackUrl
                  ? `/sign-up?callbackUrl=${encodeURIComponent(params.callbackUrl)}`
                  : '/sign-up'
              }
              className="text-[#C66A42] hover:underline font-bold"
            >
              CREATE ACCOUNT →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
