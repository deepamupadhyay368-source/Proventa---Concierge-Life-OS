import type { Metadata } from 'next';
import Link from 'next/link';
import { UserCheck, ShieldCheck, CheckCircle2, AlertCircle, Clock, Plane, Utensils } from 'lucide-react';
import { LegalHeader, LegalNav } from '@/components/legal/legal-nav';
import { POLICY_VERSIONS, POLICY_EFFECTIVE_DATES } from '@/lib/legal/versions';

export const metadata: Metadata = {
  title: 'Concierge Service Terms | Proventa Legal & Trust Center',
  description:
    'Operational framework for task delegation, 5-option recommendation cycles, approval gates, and zero-fabrication concierge execution.',
};

export default function ConciergeServiceTermsPage() {
  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#141312] pt-24 pb-20 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          <aside className="hidden lg:block lg:col-span-1 space-y-4">
            <div className="sticky top-28 p-4 bg-white rounded-2xl border border-[#ded7cc] shadow-xs space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#8a7053]">
                Legal &amp; Trust Index
              </p>
              <LegalNav />
            </div>
          </aside>

          <main className="lg:col-span-3 bg-white p-8 sm:p-12 rounded-3xl border border-[#ded7cc] shadow-sm space-y-10">
            <LegalHeader
              title="Concierge Service Terms"
              subtitle="Operational terms governing task delegation, multi-option curation, explicit member approval gating, and verified concierge fulfillment."
              version={POLICY_VERSIONS.conciergeTerms}
              effectiveDate={POLICY_EFFECTIVE_DATES.conciergeTerms}
            />

            <div className="space-y-10 text-sm text-[#3b3834] leading-relaxed">
              <section className="space-y-3">
                <h2 className="text-lg font-serif font-semibold text-[#141312] tracking-tight">
                  1. Mandate Delegation &amp; Understanding
                </h2>
                <p>
                  Members delegate requests by submitting natural language instructions via the &ldquo;Tell Proventa&rdquo; interface, structured categories, or concierge messaging.
                </p>
                <p>
                  Our agent platform extracts structured parameters (e.g. date, location, party size, cabin class, dietary preferences) and checks for missing mandatory information before initiating research.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-serif font-semibold text-[#141312] tracking-tight">
                  2. The 5-Option Iterative Curation Cycle
                </h2>
                <p>
                  For complex lifestyle, dining, travel, and experience requests, Proventa curates an initial batch of <strong>5 distinct, verified options</strong> (Batch-001) for member evaluation.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-1">
                  <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                    <strong className="text-neutral-900 block mb-1">Approve &amp; Execute</strong>
                    Member selects their single preferred option to authorize reservation dispatch immediately.
                  </div>
                  <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                    <strong className="text-neutral-900 block mb-1">Keep &amp; Replace Others</strong>
                    Member locks 1 to 4 favorite options and requests fresh alternatives for unselected items.
                  </div>
                  <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                    <strong className="text-neutral-900 block mb-1">Reject All &amp; Re-Curate</strong>
                    Member provides quick refinement feedback to generate a completely new batch of 5 tailored options.
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-serif font-semibold text-[#141312] tracking-tight">
                  3. Explicit Member Approval Gate
                </h2>
                <p>
                  Proventa strictly enforces an explicit approval gate. No provider booking is ever executed, and no financial charge is settled, without affirmative member approval of a specific proposal or active mandate.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-serif font-semibold text-[#141312] tracking-tight">
                  4. Execution Tier Routing &amp; Senior Concierge Handoff
                </h2>
                <p>
                  Upon member approval, the task execution tier is resolved:
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs text-[#524e48] pl-2">
                  <li><strong>Automated Execution:</strong> Dispatched immediately via verified API adapter for connected partner platforms.</li>
                  <li><strong>Assisted Concierge Execution:</strong> Handed seamlessly to our Senior Concierge Desk when direct provider negotiation or phone booking is required.</li>
                  <li><strong>Deliverable Preparation:</strong> Synthesized research dossiers, itineraries, or curatorial reports delivered directly into the member portal.</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-serif font-semibold text-[#141312] tracking-tight">
                  5. Zero-Fabrication Safeguard &amp; Provider Confirmation Standard
                </h2>
                <p>
                  Proventa adheres to a non-negotiable <strong>Zero-Fabrication Standard</strong>:
                </p>
                <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#ded7cc] space-y-2 text-xs">
                  <div className="flex items-center gap-2 font-semibold text-[#141312]">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>Our Authenticity Commitment:</span>
                  </div>
                  <ul className="list-disc list-inside text-neutral-600 space-y-1 pl-1">
                    <li>If a provider cannot confirm a requested time, seat, or table, Proventa will NEVER generate a fake or synthetic confirmation reference.</li>
                    <li>The task will transition transparently to concierge review, and our team will contact you with authentic alternatives.</li>
                    <li>A task is marked CONFIRMED or COMPLETED only upon verified external confirmation or genuine deliverable handover.</li>
                  </ul>
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
