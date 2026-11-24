import type { Metadata } from 'next';
import { SignUpForm } from '@/components/auth/sign-up-form';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sign Up | PROVENTA — Home Platform',
  description: 'Create your PROVENTA Home account to manage your residential membership and visits.',
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
            Home Platform
          </p>
        </div>

        <div className="border border-[#414957] bg-[#303746] p-8 shadow-sm space-y-6 rounded-sm">
          <div className="border-b border-[#414957] pb-4">
            <h1 className="font-heading font-black text-2xl uppercase tracking-tight text-[#FFFFFF]">
              Create Account
            </h1>
            <p className="text-xs text-[#A8ADB7] mt-1">
              Join PROVENTA Home to access seamless household maintenance and emergency services.
            </p>
          </div>
          <SignUpForm callbackUrl={params.callbackUrl || '/customer/dashboard'} initialRole="CUSTOMER" />
        </div>

        <div className="border border-[#414957] bg-[#303746] p-4 font-mono text-xs text-[#F1F2F4] flex items-center justify-between shadow-sm rounded-sm">
          <span className="text-[#A8ADB7]">ALREADY REGISTERED?</span>
          <Link
            href={
              params.callbackUrl
                ? `/login?callbackUrl=${encodeURIComponent(params.callbackUrl)}`
                : '/login'
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
