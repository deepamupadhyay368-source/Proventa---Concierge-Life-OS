import type { Metadata } from 'next';
import { SignUpForm } from '@/components/auth/sign-up-form';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Create Account | PROVENTA — Business without limits.',
  description:
    'Create your PROVENTA account to discover businesses, post enquiries, or list your business storefront.',
};

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[#171A14] text-[#F6F0E4] flex items-center justify-center px-4 py-14">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block">
            <span className="font-serif text-3xl tracking-[0.18em] uppercase text-[#F6F0E4] hover:text-[#B94E2D] transition-colors">
              PROVENTA
            </span>
          </Link>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#A98253]">
            Business without limits. · Every Business. One Place.
          </p>
        </div>

        <div className="rounded-[2px] border border-[#D5CBB8] bg-[#F5F0E5] text-[#181914] p-8 shadow-elevated">
          <div className="mb-6 pb-4 border-b border-[#D5CBB8]">
            <h1 className="font-display text-3xl text-[#181914]">
              Create Your Account
            </h1>
            <p className="text-xs text-[#5C584F] mt-1">
              Discover businesses, post enquiries, compare quotations, or publish your storefront.
            </p>
          </div>
          <SignUpForm />
        </div>

        <div className="mt-6 rounded-[2px] border border-[#4C4A40] bg-[#20211C] p-4 font-mono text-xs text-[#E9DFCC] flex items-center justify-between">
          <span className="text-[#A7A194]">ALREADY REGISTERED?</span>
          <Link
            href="/sign-in"
            className="text-[#B94E2D] hover:underline font-medium"
          >
            SIGN IN →
          </Link>
        </div>
      </div>
    </div>
  );
}
