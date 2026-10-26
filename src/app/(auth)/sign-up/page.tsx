import type { Metadata } from 'next';
import { SignUpForm } from '@/components/auth/sign-up-form';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Create Account | PROVENTA — Every Business. One Place.',
  description: 'Create your PROVENTA account to discover businesses, post customer enquiries, or register your business storefront.',
};

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <p className="text-2xl font-semibold tracking-tight text-neutral-900">PROVENTA</p>
            <p className="text-xs tracking-[0.15em] uppercase text-neutral-500 mt-0.5">Every Business. One Place.</p>
          </Link>
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-neutral-900 mb-2">Create your PROVENTA account</h1>
          <p className="text-sm text-neutral-500 mb-6">Discover businesses, post enquiries, compare quotations, or launch your digital storefront.</p>
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
