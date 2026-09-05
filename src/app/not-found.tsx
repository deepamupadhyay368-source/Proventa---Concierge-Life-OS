import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Page Not Found' };

export default function NotFound() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-xs font-medium text-neutral-400 uppercase tracking-widest mb-6">404</p>
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 mb-4">
          Looks like this page took a detour.
        </h1>
        <p className="text-neutral-500 mb-8">We couldn't find what you were looking for. It may have moved or never existed.</p>
        <Link href="/" className="inline-flex items-center px-5 py-2.5 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors">
          Back to Proventa
        </Link>
      </div>
    </div>
  );
}
