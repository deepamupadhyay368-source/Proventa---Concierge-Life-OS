import type { Metadata } from 'next';
import { HomeSignInForm } from '@/components/auth/home-sign-in-form';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sign In | PROVENTA HOME',
  description: 'Sign in to your PROVENTA Home customer membership account.',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    registered?: string;
    callbackUrl?: string;
  }>;
}) {
  const params = await searchParams;

  return (
    <div className="min-h-screen bg-[#F2F0E9] text-[#171A17] flex items-center justify-center px-4 py-16 font-sans selection:bg-[#53634A] selection:text-white">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="font-display text-3xl font-bold tracking-tight text-[#171A17]">PROVENTA</span>
            <span className="text-xs font-medium uppercase tracking-widest text-[#53634A]">Home</span>
          </Link>
          <p className="text-xs text-[#6B7280]">
            Household Maintenance Membership Portal
          </p>
        </div>

        {params.registered && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium text-center rounded-md">
            Account created successfully. Please sign in with your email and password.
          </div>
        )}

        <div className="border border-[#D5CBB8] bg-white p-8 shadow-xs rounded-xl space-y-6">
          <div className="border-b border-[#E5E3DB] pb-4">
            <h1 className="font-display text-2xl font-bold text-[#171A17]">
              Customer Sign In
            </h1>
            <p className="text-xs text-[#6B7280] mt-1">
              Access your maintenance bookings, passport & member benefits.
            </p>
          </div>

          <HomeSignInForm callbackUrl={params.callbackUrl} />
        </div>

        <div className="border border-[#D5CBB8] bg-white p-4 text-xs text-[#171A17] flex items-center justify-between rounded-xl shadow-xs">
          <span className="text-[#6B7280]">New to PROVENTA Home?</span>
          <Link
            href={
              params.callbackUrl
                ? `/signup?callbackUrl=${encodeURIComponent(params.callbackUrl)}`
                : '/signup'
            }
            className="text-[#53634A] hover:underline font-bold"
          >
            Create an Account →
          </Link>
        </div>
      </div>
    </div>
  );
}
