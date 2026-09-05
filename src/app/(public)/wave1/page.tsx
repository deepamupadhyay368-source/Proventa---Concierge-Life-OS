import type { Metadata } from 'next';
import { Wave1Form } from '@/components/marketing/wave1-form';

export const metadata: Metadata = {
  title: 'Join Wave 1',
  description: 'Join the Proventa Wave 1 waitlist. First in Ahmedabad.',
};

export default async function Wave1Page({ searchParams }: { searchParams: Promise<{ intent?: string }> | { intent?: string } }) {
  const params = await Promise.resolve(searchParams);
  return (
    <div className="min-h-screen bg-neutral-50 pt-16">
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-10">
          <p className="text-xs font-medium text-brand-700 tracking-widest uppercase mb-4">Wave 1 · Ahmedabad</p>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-neutral-900 mb-4">Join Wave 1</h1>
          <p className="text-neutral-500 leading-relaxed">
            Register your interest. We'll review applications and reach out with an invitation when you're next in line.
          </p>
        </div>
        <div className="bg-white border border-neutral-200 rounded-2xl p-8 shadow-sm">
          <Wave1Form prefilledIntent={params.intent} />
        </div>
        <p className="text-xs text-neutral-400 text-center mt-6">
          No spam. No commitment. Just an invitation when we're ready for you.
        </p>
      </div>
    </div>
  );
}
