import type { Metadata } from 'next';
import { SignInForm } from '@/components/auth/sign-in-form';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sign In | PROVENTA — Home Platform',
  description: 'Access your PROVENTA Home account with email/password or Google.',
};

function getAuthErrorMessage(errorCode?: string): string | null {
  if (!errorCode) return null;
  switch (errorCode) {
    case 'PassKeyRequired':
      return 'Please enter your email and 12‑digit Pass Key.';
    case 'SessionExpired':
      return 'Your session has expired. Please sign in again.';
    case 'AccessDenied':
      return 'Authentication was cancelled or denied.';
    case 'OAuthAccountNotLinked':
      return 'This email is already linked to another account. Sign in with your Pass Key.';
    case 'unverified_oauth_email':
      return 'Your Google email must be verified before signing in.';
    case 'account_suspended':
      return 'Your account is suspended. Contact support.';
    case 'OAuthSignin':
    case 'OAuthCallback':
    case 'Callback':
      return 'Authentication could not be completed. Try again.';
    case 'invalid_token':
    case 'invalid_or_expired_token':
      return 'This verification link is invalid or expired.';
    default:
      return 'Authentication was not completed. Please try again.';
  }
}

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ error?: string; verified?: string; registered?: string; recovered?: string; callbackUrl?: string }> }) {
  const params = await searchParams;
  const errorMessage = getAuthErrorMessage(params.error);

  return (
    <div className="min-h-screen bg-[#292F3D] text-[#F1F2F4] flex items-center justify-center px-4 py-16 font-sans selection:bg-[#536B88] selection:text-white">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-10 h-10 bg-[#536B88] text-[#FFFFFF] flex items-center justify-center font-heading font-black text-lg shadow-sm rounded-sm">P</div>
            <span className="font-heading text-2xl tracking-[0.14em] uppercase font-black text-[#FFFFFF]">PROVENTA</span>
          </Link>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#A8ADB7] font-semibold">Home Platform</p>
        </div>

        {params.registered && (
          <div className="p-4 bg-[#252B38] border border-[#4A7C59] text-xs text-[#4A7C59] font-mono text-center font-bold rounded-sm">
            Registration complete. Please sign in.
          </div>
        )}
        {params.recovered && (
          <div className="p-4 bg-[#252B38] border border-[#4A7C59] text-xs text-[#4A7C59] font-mono text-center font-bold rounded-sm">
            Pass Key updated. Sign in with your new Pass Key.
          </div>
        )}
        {params.verified && (
          <div className="p-4 bg-[#252B38] border border-[#4A7C59] text-xs text-[#4A7C59] font-mono text-center font-bold rounded-sm">
            Account verified. Sign in now.
          </div>
        )}
        {errorMessage && (
          <div role="alert" className="p-4 bg-[#252B38] border border-[#D9534F] text-xs text-[#D9534F] font-mono text-center font-bold rounded-sm">
            {errorMessage}
          </div>
        )}

        {/* Card */}
        <div className="border border-[#414957] bg-[#303746] p-8 shadow-sm space-y-6 rounded-sm">
          <div className="border-b border-[#414957] pb-4">
            <h1 className="font-heading font-black text-2xl uppercase tracking-tight text-[#FFFFFF]">Sign In</h1>
            <p className="text-xs text-[#A8ADB7] mt-1">Access your Home dashboard and services.</p>
          </div>
          <SignInForm callbackUrl={params.callbackUrl} />
        </div>

        {/* Switch to Sign‑Up */}
        <div className="border border-[#414957] bg-[#303746] p-4 font-mono text-xs text-[#F1F2F4] shadow-sm rounded-sm">
          <div className="flex items-center justify-between">
            <span className="text-[#A8ADB7]">New to PROVENTA?</span>
            <Link href={params.callbackUrl ? `/signup?callbackUrl=${encodeURIComponent(params.callbackUrl)}` : '/signup'} className="text-[#C66A42] hover:underline font-bold">
              CREATE ACCOUNT →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
