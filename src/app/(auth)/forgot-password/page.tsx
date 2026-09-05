import type { Metadata } from 'next';
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Reset Password' };

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/"><p className="text-2xl font-semibold tracking-tight text-neutral-900">Proventa</p></Link>
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-neutral-900 mb-2">Reset your password</h1>
          <p className="text-sm text-neutral-500 mb-6">Enter your email and we'll send you a reset link.</p>
          <ForgotPasswordForm />
        </div>
        <p className="text-center text-sm text-neutral-500 mt-6">
          <Link href="/sign-in" className="text-brand-700 hover:underline">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
