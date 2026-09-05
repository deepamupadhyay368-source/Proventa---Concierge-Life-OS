import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';

export function FinalCTASection() {
  return (
    <section className="py-24 bg-white border-t border-neutral-200 text-center">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neutral-100 border border-neutral-300 text-xs font-bold text-neutral-800 mb-6">
          <span>AHMEDABAD WAVE 1 · LIMITED ACCESS</span>
        </div>

        <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-neutral-900 mb-6 leading-tight uppercase">
          Ready to get your time back?
        </h2>

        <p className="text-base sm:text-xl text-neutral-600 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
          Join the founding cohort of Ahmedabad members delegating reservations, travel, errands, and lifestyle tasks to Proventa.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/wave1"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-base rounded-xl transition-colors shadow-sm"
          >
            <span>Apply for Wave 1 Access</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/how-it-works"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-900 font-bold text-base rounded-xl transition-colors"
          >
            <span>How It Works</span>
          </Link>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-neutral-500">
          <div className="flex items-center gap-1.5">
            <Check className="h-4 w-4 text-neutral-900" />
            <span>No subscription fee during Wave 1</span>
          </div>
          <span>&bull;</span>
          <div className="flex items-center gap-1.5">
            <Check className="h-4 w-4 text-neutral-900" />
            <span>Pay only for approved bookings</span>
          </div>
          <span>&bull;</span>
          <div className="flex items-center gap-1.5">
            <Check className="h-4 w-4 text-neutral-900" />
            <span>Ahmedabad-based operations</span>
          </div>
        </div>
      </div>
    </section>
  );
}
