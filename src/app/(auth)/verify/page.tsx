import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Verify Email' };

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-8">
          <Link href="/">
            <p className="text-2xl font-semibold tracking-tight text-neutral-900">Proventa</p>
            <p className="text-xs tracking-[0.15em] uppercase text-neutral-400 mt-0.5">Concierge Life OS</p>
          </Link>
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-neutral-900 mb-3">Check your email</h1>
          <p className="text-neutral-500 text-sm leading-relaxed">
            We've sent a verification link to your email address. Please check your inbox and click the link to activate your account.
          </p>
          <p className="text-neutral-400 text-xs mt-4">The link expires in 24 hours. Check your spam folder if you don't see it.</p>
        </div>
        <p className="text-center text-sm text-neutral-500 mt-6">
          <Link href="/sign-in" className="text-brand-700 hover:underline">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
