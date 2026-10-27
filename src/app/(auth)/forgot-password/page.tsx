import type { Metadata } from 'next';
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Reset Password | PROVENTA',
};

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#15171B] flex items-center justify-center px-4 py-14">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#15171B] text-[14px] font-bold text-white">
              P
            </span>
            <span className="text-[22px] font-bold tracking-[-0.03em] text-[#15171B]">
              PROVENTA
            </span>
          </Link>
        </div>

        <div className="surface-card p-8 sm:p-9">
          <h1 className="text-[22px] font-bold tracking-tight text-[#15171B] mb-1.5">
            Reset your password
          </h1>
          <p className="text-[13px] text-[#696D76] mb-6">
            Enter your registered email address and we will send you a password reset link.
          </p>
          <ForgotPasswordForm />
        </div>

        <p className="text-center text-[13px] text-[#696D76] mt-7">
          <Link href="/sign-in" className="text-[#304FFE] hover:underline font-semibold">
            &larr; Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
