import type { Metadata } from 'next';
import { SignUpForm } from '@/components/auth/sign-up-form';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Create Account | PROVENTA — Construction Procurement Platform',
  description:
    'Create your PROVENTA account on the Construction Procurement Platform for contractors, builders, and suppliers.',
};

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[#F2F0E9] text-[#171A17] flex items-center justify-center px-4 py-16 font-sans selection:bg-[#53634A] selection:text-white">
      <div className="w-full max-w-md space-y-8">
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

        <div className="border border-[#D9D8CF] bg-[#FFFFFF] p-8 shadow-sm space-y-6">
          <div className="border-b border-[#D9D8CF] pb-4">
            <h1 className="font-heading font-black text-2xl uppercase tracking-tight text-[#171A17]">
              Create Account
            </h1>
            <p className="text-xs text-[#777970] mt-1">
              Set up your procurement workspace to post requirements or submit quotations.
            </p>
          </div>
          <SignUpForm />
        </div>

        <div className="border border-[#D9D8CF] bg-[#FFFFFF] p-4 font-mono text-xs text-[#171A17] flex items-center justify-between shadow-sm">
          <span className="text-[#777970]">ALREADY REGISTERED?</span>
          <Link
            href="/sign-in"
            className="text-[#53634A] hover:underline font-bold"
          >
            SIGN IN →
          </Link>
        </div>
      </div>
    </div>
  );
}
