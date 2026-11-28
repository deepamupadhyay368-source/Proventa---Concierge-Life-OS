import type { Metadata } from 'next';
import { HomeSignUpForm } from '@/components/auth/home-sign-up-form';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Create Account | PROVENTA Real Estate Intelligence',
  description: 'Create a free PROVENTA account to start tracking properties, accessing locality reports, and valuing real estate.',
};

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{
    callbackUrl?: string;
    plan?: string;
    billing?: string;
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
            Independent, evidence-based property intelligence.
          </p>
        </div>

        {params.plan && (
          <div className="p-3 bg-[#29465F]/10 border border-[#547568]/30 text-xs text-[#FFFFFF] font-medium text-center">
            Selected Tier: <strong className="uppercase font-mono text-[#29465F]">{params.plan}</strong> ({params.billing || 'monthly'})
          </div>
        )}

        <div className="border border-[#E8EBEF] bg-white p-8 space-y-6">
          <div className="border-b border-[#E8EBEF]/50 pb-4">
            <h1 className="font-editorial text-2xl font-normal text-[#202B38]">
              Create Member Account
            </h1>
            <p className="text-xs text-[#697586] mt-1">
              Start building your Personal Property Vault and access Ahmedabad benchmarks.
            </p>
          </div>

          <HomeSignUpForm callbackUrl={params.callbackUrl || '/dashboard'} />
        </div>

        <div className="border border-[#E8EBEF] bg-white p-4 text-xs text-[#202B38] flex items-center justify-between shadow-xs">
          <span className="text-[#697586]">Already have an account?</span>
          <Link
            href={
              params.callbackUrl
                ? `/login?callbackUrl=${encodeURIComponent(params.callbackUrl)}`
                : '/login'
            }
            className="text-[#29465F] hover:underline font-bold"
          >
            Sign In →
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
