import type { Metadata } from 'next';
import { HomeSignInForm } from '@/components/auth/home-sign-in-form';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sign In | PROVENTA Real Estate Intelligence',
  description: 'Sign in to access your Personal Property Vault, valuation dossiers, and market intelligence.',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    registered?: string;
    callbackUrl?: string;
  }>;
}) {
  const params = await searchParams;

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#202B38] flex items-center justify-center px-4 py-16 font-sans selection:bg-[#29465F] selection:text-white">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex flex-col items-center">
            <span className="font-editorial text-3xl font-normal tracking-tight text-[#202B38]">PROVENTA</span>
            <span className="text-[10px] font-mono tracking-widest text-[#29465F] uppercase font-bold">
              Real Estate Intelligence
            </span>
          </Link>
          <p className="text-xs text-[#697586]">
            Know your property. Know its value.
          </p>
        </div>

        {params.registered && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 text-xs text-emerald-800 font-medium text-center">
            Account created successfully. Please sign in with your email and password.
          </div>
        )}

        <div className="border border-[#E8EBEF] bg-white p-8 space-y-6">
          <div className="border-b border-[#E8EBEF]/50 pb-4">
            <h1 className="font-editorial text-2xl font-normal text-[#202B38]">
              Member Sign In
            </h1>
            <p className="text-xs text-[#697586] mt-1">
              Access your Property Vault, tracked assets & valuation dossiers.
            </p>
          </div>

          <HomeSignInForm
            callbackUrl={params.callbackUrl || '/dashboard'}
            initialError={params.error}
          />
        </div>

        <div className="border border-[#E8EBEF] bg-white p-4 text-xs text-[#202B38] flex items-center justify-between shadow-xs">
          <span className="text-[#697586]">New to PROVENTA?</span>
          <Link
            href={
              params.callbackUrl
                ? `/signup?callbackUrl=${encodeURIComponent(params.callbackUrl)}`
                : '/signup'
            }
            className="text-[#29465F] hover:underline font-bold"
          >
            Create Account →
          </Link>
        </div>

        <div className="text-center text-[11px] text-[#697586]">
          <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
          <span className="mx-2">•</span>
          <Link href="/terms" className="hover:underline">Terms of Service</Link>
        </div>
      </div>
    </div>
  );
}
