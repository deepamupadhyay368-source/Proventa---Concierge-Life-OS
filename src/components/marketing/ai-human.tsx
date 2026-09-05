import { CheckCircle2, ShieldCheck, Clock, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function AIHumanSection() {
  return (
    <section className="py-24 bg-[#fafaf9] border-t border-neutral-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2 block">
              The Proventa Standard
            </span>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-neutral-900 mb-6 leading-tight">
              Smart Technology.<br />Real Human Care.
            </h2>
            <p className="text-base sm:text-lg text-neutral-700 leading-relaxed mb-6 font-medium">
              Pure AI chat bots make mistakes and can’t call venues. Traditional agencies are slow and rigid. Proventa gives you the speed of modern technology with dedicated human concierges on the ground in Ahmedabad.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-neutral-900 mt-0.5 shrink-0" />
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">Instant Understanding</h3>
                  <p className="text-xs text-neutral-600">Your requests are parsed immediately without filling out rigid web forms.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-neutral-900 mt-0.5 shrink-0" />
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">Real Human Verification</h3>
                  <p className="text-xs text-neutral-600">Our concierges speak directly with venue managers in Ahmedabad to guarantee availability.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-neutral-900 mt-0.5 shrink-0" />
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">Zero Unapproved Actions</h3>
                  <p className="text-xs text-neutral-600">You review the final details and exact pricing before any payment or booking happens.</p>
                </div>
              </div>
            </div>

            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-neutral-900 text-white font-bold text-sm hover:bg-neutral-800 transition-colors shadow-sm"
            >
              <span>See How It Works</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="space-y-6">
            <div className="p-8 rounded-2xl bg-white border border-neutral-200 shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-neutral-900 text-white flex items-center justify-center font-black text-lg">
                  AI
                </div>
                <div>
                  <h3 className="text-lg font-bold text-neutral-900">Instant Options</h3>
                  <p className="text-xs text-neutral-500">Speed &amp; Organization</p>
                </div>
              </div>
              <p className="text-sm text-neutral-600 leading-relaxed">
                Interprets your preferences, checks schedules, and filters the top choices in seconds so you don’t have to search through dozens of apps.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white border-2 border-neutral-900 shadow-md">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-neutral-100 border border-neutral-300 text-neutral-900 flex items-center justify-center font-bold">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-neutral-900">Human Concierge</h3>
                  <p className="text-xs text-neutral-500">Local Relationships &amp; Accountability</p>
                </div>
              </div>
              <p className="text-sm text-neutral-600 leading-relaxed">
                Our team in Ahmedabad picks up the phone, confirms table preferences, negotiates special requests, and verifies everything before presenting it to you.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
