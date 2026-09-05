'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function AcceptForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!token) {
    return (
      <div className="max-w-md w-full text-center bg-white p-8 rounded-xl border border-neutral-200 shadow-sm">
        <h1 className="text-xl font-semibold text-neutral-900 mb-2">Invalid Invitation</h1>
        <p className="text-sm text-neutral-500 mb-6">No invitation token was provided.</p>
        <Link href="/" className="text-sm text-brand-700 hover:underline">Return to Proventa</Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/wave1/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password, confirmPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to accept invitation.');
      } else {
        router.push('/sign-in?verified=true&wave1=true');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-neutral-200 shadow-sm">
      <div className="text-center mb-8">
        <Link href="/" className="inline-block">
          <p className="text-2xl font-semibold tracking-tight text-neutral-900">Proventa</p>
          <p className="text-xs tracking-[0.15em] uppercase text-neutral-400 mt-0.5">Concierge Life OS</p>
        </Link>
        <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-brand-50 border border-brand-200 rounded-full text-xs text-brand-800 font-medium">
          Wave 1 Invitation
        </div>
      </div>

      <h1 className="text-xl font-semibold text-neutral-900 mb-2">Welcome to Wave 1</h1>
      <p className="text-sm text-neutral-500 mb-6 leading-relaxed">
        Set a secure password for your new Proventa account to activate your concierge access.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Create Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
            placeholder="At least 8 characters"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Confirm Password</label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-neutral-900 text-white rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50 mt-2"
        >
          {loading ? 'Activating account...' : 'Activate & Enter Proventa'}
        </button>
      </form>
    </div>
  );
}

export default function Wave1AcceptPage() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      <Suspense fallback={<div className="p-8 text-center text-sm text-neutral-400">Loading invitation...</div>}>
        <AcceptForm />
      </Suspense>
    </div>
  );
}
