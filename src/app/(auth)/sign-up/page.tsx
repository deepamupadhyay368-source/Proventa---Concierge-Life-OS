import type { Metadata } from 'next';
import { SignUpForm } from '@/components/auth/sign-up-form';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Create Account | PROVENTA — Industrial Procurement Platform',
  description:
    'Create your PROVENTA account on the Industrial Procurement Platform for contractors, builders, enterprises, and suppliers.',
};

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{
    callbackUrl?: string;
    role?: string;
  }>;
}) {
  const params = await searchParams;

  return (
    <div className="min-h-screen bg-[#292F3D] text-[#F1F2F4] flex items-center justify-center px-4 py-16 font-sans selection:bg-[#536B88] selection:text-white">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-10 h-10 bg-[#536B88] text-[#FFFFFF] flex items-center justify-center font-heading font-black text-lg shadow-sm rounded-sm">
              P
            </div>
            <span className="font-heading text-2xl tracking-[0.14em] uppercase font-black text-[#FFFFFF]">
              PROVENTA
            </span>
          </Link>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#A8ADB7] font-semibold">
            Industrial Procurement Platform
          </p>
        </div>

        <div className="border border-[#414957] bg-[#303746] p-8 shadow-sm space-y-6 rounded-sm">
          <div className="border-b border-[#414957] pb-4">
            <h1 className="font-heading font-black text-2xl uppercase tracking-tight text-[#FFFFFF]">
              Create Account
            </h1>
            <p className="text-xs text-[#A8ADB7] mt-1">
              Select your role and initialize your verified business procurement workspace.
            </p>
          </div>
          <SignUpForm callbackUrl={params.callbackUrl} initialRole={params.role} />
        </div>

        <div className="border border-[#414957] bg-[#303746] p-4 font-mono text-xs text-[#F1F2F4] flex items-center justify-between shadow-sm rounded-sm">
          <span className="text-[#A8ADB7]">ALREADY REGISTERED?</span>
          <Link
            href={
              params.callbackUrl
                ? `/sign-in?callbackUrl=${encodeURIComponent(params.callbackUrl)}`
                : '/sign-in'
            }
            className="text-[#C66A42] hover:underline font-bold"
          >
            SIGN IN →
          </Link>
        </div>
      </div>
    </div>
  );
}
