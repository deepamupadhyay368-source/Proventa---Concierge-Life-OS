import type { Metadata } from 'next';
import { SignUpForm } from '@/components/auth/sign-up-form';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Create Account | PROVENTA — The Business Index',
  description:
    'Create your PROVENTA account to discover businesses, dispatch buyer enquiries, or publish your business storefront.',
};

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[#F4F1EA] text-[#0D0E11] flex items-center justify-center px-4 py-14">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-between border-b-2 border-[#0D0E11] pb-4">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <span className="flex h-10 w-10 items-center justify-center bg-[#0D0E11] text-[#C8F904] font-mono text-xs font-bold group-hover:bg-[#C8F904] group-hover:text-[#0D0E11] border border-[#0D0E11] transition-colors">
              PV/I
            </span>
            <div>
              <span className="font-display text-xl font-bold tracking-[-0.04em] text-[#0D0E11] block leading-none">
                PROVENTA
              </span>
              <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#52514E]">
                THE BUSINESS INDEX
              </span>
            </div>
          </Link>
          <span className="index-code-lime">AUTH // 02</span>
        </div>

        <div className="border-2 border-[#0D0E11] bg-[#FAF8F3] p-8">
          <div className="mb-6 pb-4 border-b border-[#CFCAC0]">
            <h1 className="font-display text-2xl font-bold uppercase tracking-[-0.03em] text-[#0D0E11]">
              CREATE REGISTRY ACCOUNT
            </h1>
            <p className="text-xs text-[#52514E] mt-1 font-mono">
              DISPATCH BUYER RFQS, COMPARE QUOTES, OR PUBLISH YOUR STOREFRONT
            </p>
          </div>
          <SignUpForm />
        </div>

        <div className="mt-6 border border-[#0D0E11] bg-[#EAE5DA] p-4 font-mono text-xs text-[#0D0E11] flex items-center justify-between">
          <span className="text-[#52514E]">ALREADY REGISTERED?</span>
          <Link href="/sign-in" className="font-bold underline">
            SIGN IN →
          </Link>
        </div>
      </div>
    </div>
  );
}
