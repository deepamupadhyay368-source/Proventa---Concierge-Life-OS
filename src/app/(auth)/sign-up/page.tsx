import type { Metadata } from 'next';
import { SignUpForm } from '@/components/auth/sign-up-form';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Create Account | PROVENTA — Every Business. One Place.',
  description:
    'Create your PROVENTA account to discover businesses, post customer enquiries, or register your business storefront.',
};

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#15171B] flex items-center justify-center px-4 py-14">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-1.5 group">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#15171B] text-[14px] font-bold text-white group-hover:bg-[#304FFE] transition-colors">
                P
              </span>
              <span className="text-[22px] font-bold tracking-[-0.03em] text-[#15171B]">
                PROVENTA
              </span>
            </div>
            <p className="text-[11px] tracking-[0.14em] uppercase text-[#696D76] font-semibold">
              Every Business. One Place.
            </p>
          </Link>
        </div>

        <div className="surface-card p-8 sm:p-9">
          <h1 className="text-[22px] font-bold tracking-tight text-[#15171B] mb-1.5">
            Create your PROVENTA account
          </h1>
          <p className="text-[13px] text-[#696D76] mb-6">
            Discover businesses, post enquiries, compare quotations, or launch your digital storefront.
          </p>
          <SignUpForm />
        </div>

        <p className="text-center text-[13px] text-[#696D76] mt-7">
          Already have an account?{' '}
          <Link href="/sign-in" className="text-[#304FFE] hover:underline font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
