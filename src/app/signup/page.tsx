import type { Metadata } from 'next';
import { HomeSignUpForm } from '@/components/auth/home-sign-up-form';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Create Account | PROVENTA HOME',
  description: 'Register for PROVENTA Home to manage your household maintenance membership.',
};

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{
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

        <div className="border border-[#D5CBB8] bg-white p-8 shadow-xs rounded-xl space-y-6">
          <div className="border-b border-[#E5E3DB] pb-4">
            <h1 className="font-display text-2xl font-bold text-[#171A17]">
              Create Customer Account
            </h1>
            <p className="text-xs text-[#6B7280] mt-1">
              Join PROVENTA Home for routine maintenance and verified local technicians.
            </p>
          </div>

          <HomeSignUpForm callbackUrl={params.callbackUrl} />
        </div>

        <div className="border border-[#D5CBB8] bg-white p-4 text-xs text-[#171A17] flex items-center justify-between rounded-xl shadow-xs">
          <span className="text-[#6B7280]">Already have an account?</span>
          <Link
            href={
              params.callbackUrl
                ? `/login?callbackUrl=${encodeURIComponent(params.callbackUrl)}`
                : '/login'
            }
            className="text-[#53634A] hover:underline font-bold"
          >
            Sign In →
          </Link>
        </div>
      </div>
    </div>
  );
}
