import type { Metadata } from 'next';
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Reset Password | PROVENTA — The Business Index',
};

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-[#F4F1EA] text-[#0D0E11] flex items-center justify-center px-4 py-14">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-between border-b-2 border-[#0D0E11] pb-4">
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center bg-[#0D0E11] text-[#C8F904] font-mono text-xs font-bold border border-[#0D0E11]">
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
          <span className="index-code">AUTH // 03</span>
        </div>

        <div className="border-2 border-[#0D0E11] bg-[#FAF8F3] p-8">
          <div className="mb-6 pb-4 border-b border-[#CFCAC0]">
            <h1 className="font-display text-2xl font-bold uppercase tracking-[-0.03em] text-[#0D0E11]">
              CREDENTIAL RECOVERY
            </h1>
            <p className="text-xs text-[#52514E] mt-1 font-mono">
              ENTER YOUR REGISTERED EMAIL TO RECEIVE A RESET LINK
            </p>
          </div>
          <ForgotPasswordForm />
        </div>

        <div className="mt-6 border border-[#0D0E11] bg-[#EAE5DA] p-4 font-mono text-xs text-[#0D0E11] flex items-center justify-between">
          <Link href="/sign-in" className="font-bold underline">
            ← RETURN TO SIGN IN
          </Link>
        </div>
      </div>
    </div>
  );
}
