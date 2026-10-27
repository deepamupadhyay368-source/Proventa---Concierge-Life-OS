import type { Metadata } from 'next';
import { SignInForm } from '@/components/auth/sign-in-form';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sign In | PROVENTA — The Business Index',
  description:
    'Sign in to PROVENTA — The Business Index to manage your buyer enquiries, quotations, or business storefront dossier.',
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams:
    | Promise<{ error?: string; verified?: string; registered?: string; callbackUrl?: string }>
    | { error?: string; verified?: string; registered?: string; callbackUrl?: string };
}) {
  const params = await Promise.resolve(searchParams);
  return (
    <div className="min-h-screen bg-[#F4F1EA] text-[#0D0E11] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* Brand Masthead */}
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
          <span className="index-code-lime">AUTH // 01</span>
        </div>

        {(params.verified || params.registered) && (
          <div className="mb-6 p-4 bg-[#C8F904] border border-[#0D0E11] font-mono text-xs font-bold text-[#0D0E11]">
            ✓ CREDENTIALS CONFIGURED. YOU CAN NOW SIGN IN BELOW.
          </div>
        )}

        {params.error && (
          <div className="mb-6 p-4 bg-[#B8232A] border border-[#0D0E11] font-mono text-xs text-[#FAF8F3]">
            {params.error === 'invalid_token'
              ? 'INVALID OR EXPIRED VERIFICATION LINK.'
              : params.error === 'invalid_or_expired_token'
                ? 'THIS VERIFICATION LINK HAS EXPIRED. PLEASE REQUEST A NEW ONE.'
                : 'AUTHENTICATION FAILED. PLEASE VERIFY YOUR CREDENTIALS.'}
          </div>
        )}

        <div className="border-2 border-[#0D0E11] bg-[#FAF8F3] p-8">
          <div className="mb-6 pb-4 border-b border-[#CFCAC0]">
            <h1 className="font-display text-2xl font-bold uppercase tracking-[-0.03em] text-[#0D0E11]">
              SIGN IN TO THE REGISTRY
            </h1>
            <p className="text-xs text-[#52514E] mt-1 font-mono">
              ACCESS YOUR BUYER LEDGER OR VENDOR STOREFRONT CONSOLE
            </p>
          </div>
          <SignInForm callbackUrl={params.callbackUrl} />
        </div>

        <div className="mt-6 border border-[#0D0E11] bg-[#EAE5DA] p-4 font-mono text-xs text-[#0D0E11] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[#52514E]">NEW TO PROVENTA?</span>
            <Link href="/sign-up" className="font-bold underline">
              CREATE ACCOUNT →
            </Link>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-[#CFCAC0]">
            <span className="text-[#52514E]">PUBLISHING AN ENTITY?</span>
            <Link href="/business/register" className="font-bold underline">
              REGISTER STOREFRONT →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
