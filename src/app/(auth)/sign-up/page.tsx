import type { Metadata } from 'next';
import { SignUpForm } from '@/components/auth/sign-up-form';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Create your Proventa account.',
};

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <p className="text-2xl font-semibold tracking-tight text-neutral-900">Proventa</p>
            <p className="text-xs tracking-[0.15em] uppercase text-neutral-400 mt-0.5">Concierge Life OS</p>
          </Link>
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-neutral-900 mb-2">Create account</h1>
          <p className="text-sm text-neutral-500 mb-6">Join Proventa and experience life, handled.</p>
          <SignUpForm />
        </div>
        <p className="text-center text-sm text-neutral-500 mt-6">
          Already have an account?{' '}
          <Link href="/sign-in" className="text-brand-700 hover:underline font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
