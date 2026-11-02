import type { Metadata } from 'next';
import { SignUpForm } from '@/components/auth/sign-up-form';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Create Account | PROVENTA — Family Wealth OS',
  description:
    'Create your PROVENTA Family Wealth OS account to organise, monitor, and preserve your complete financial universe.',
};

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[#090B10] text-[#F4F6FA] flex items-center justify-center px-4 py-16 font-sans selection:bg-[#2457FF] selection:text-white">
      <div className="w-full max-w-md space-y-8">
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

        <div className="rounded-xs border border-[#252C38] bg-[#171C26] p-8 shadow-2xl space-y-6">
          <div className="border-b border-[#252C38] pb-4">
            <h1 className="font-heading font-black text-2xl uppercase tracking-tight text-[#F4F6FA]">
              Create Account
            </h1>
            <p className="text-xs text-[#C5CAD3] mt-1">
              Start with Google or create an encrypted family wealth workspace.
            </p>
          </div>
          <SignUpForm />
        </div>

        <div className="rounded-xs border border-[#252C38] bg-[#171C26]/60 p-4 font-mono text-xs text-[#C5CAD3] flex items-center justify-between">
          <span className="text-[#858D9B]">ALREADY REGISTERED?</span>
          <Link
            href="/sign-in"
            className="text-[#2457FF] hover:underline font-bold"
          >
            SIGN IN →
          </Link>
        </div>
      </div>
    </div>
  );
}
