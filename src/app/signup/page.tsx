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
    <div className="min-h-screen bg-[#F5F3ED] text-[#202B3C] flex items-center justify-center px-4 py-16 font-sans selection:bg-[#547568] selection:text-white">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex flex-col items-center">
            <span className="font-display text-3xl font-bold tracking-tight text-[#202B3C]">PROVENTA</span>
            <span className="text-[10px] font-mono tracking-widest text-[#547568] uppercase font-semibold">
              Real Estate Intelligence
            </span>
          </Link>
          <p className="text-xs text-[#69717B]">
            Independent, evidence-based property intelligence.
          </p>
        </div>

        {params.plan && (
          <div className="p-3 bg-[#547568]/10 border border-[#547568]/30 text-xs text-[#202B3C] font-medium text-center">
            Selected Tier: <strong className="uppercase font-mono text-[#547568]">{params.plan}</strong> ({params.billing || 'monthly'})
          </div>
        )}

        <div className="border border-[#C8C4BA] bg-white p-8 shadow-xs space-y-6">
          <div className="border-b border-[#C8C4BA]/50 pb-4">
            <h1 className="font-display text-2xl font-bold text-[#202B3C]">
              Create Member Account
            </h1>
            <p className="text-xs text-[#69717B] mt-1">
              Start building your Personal Property Vault and access Ahmedabad benchmarks.
            </p>
          </div>

          <HomeSignUpForm callbackUrl={params.callbackUrl || '/dashboard'} />
        </div>

        <div className="border border-[#C8C4BA] bg-white p-4 text-xs text-[#202B3C] flex items-center justify-between shadow-xs">
          <span className="text-[#69717B]">Already have an account?</span>
          <Link
            href={
              params.callbackUrl
                ? `/login?callbackUrl=${encodeURIComponent(params.callbackUrl)}`
                : '/login'
            }
            className="text-[#547568] hover:underline font-bold"
          >
            Sign In →
          </Link>
        </div>

        <div className="text-center text-[11px] text-[#69717B]">
          <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
          <span className="mx-2">•</span>
          <Link href="/terms" className="hover:underline">Terms of Service</Link>
        </div>
      </div>
    </div>
  );
}
