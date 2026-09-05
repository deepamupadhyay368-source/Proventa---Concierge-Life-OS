import type { Metadata } from 'next';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Set New Password' };

export default function ResetPasswordPage({ searchParams }: { searchParams: { token?: string } }) {
  if (!searchParams.token) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <p className="text-neutral-600">Invalid reset link. <Link href="/forgot-password" className="text-brand-700 underline">Request a new one</Link>.</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/"><p className="text-2xl font-semibold tracking-tight text-neutral-900">Proventa</p></Link>
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-neutral-900 mb-6">Set a new password</h1>
          <ResetPasswordForm token={searchParams.token} />
        </div>
      </div>
    </div>
  );
}
