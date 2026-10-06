import type { Metadata } from 'next';
import Link from 'next/link';
import { Bot, Sparkles, UserCheck, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { LegalHeader, LegalNav } from '@/components/legal/legal-nav';
import { POLICY_VERSIONS, POLICY_EFFECTIVE_DATES } from '@/lib/legal/versions';

export const metadata: Metadata = {
  title: 'AI & Automation Disclosure | Proventa Legal & Trust Center',
  description:
    'Full transparency into how artificial intelligence is used within Proventa, recommendation boundaries, and human concierge oversight.',
};

export default function AIDisclosurePage() {
  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#141312] pt-24 pb-20 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* Sidebar Navigation */}
          <aside className="hidden lg:block lg:col-span-1 space-y-4">
            <div className="sticky top-28 p-4 bg-white rounded-2xl border border-[#ded7cc] shadow-xs space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#8a7053]">
                Legal &amp; Trust Index
              </p>
              <LegalNav />
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="lg:col-span-3 bg-white p-8 sm:p-12 rounded-3xl border border-[#ded7cc] shadow-sm space-y-10">
            <LegalHeader
              title="AI &amp; Automation Disclosure"
              subtitle="A transparent, technical explanation of how artificial intelligence operates within Proventa, what it handles, and where human verification is strictly enforced."
              version={POLICY_VERSIONS.aiDisclosure}
              effectiveDate={POLICY_EFFECTIVE_DATES.aiDisclosure}
            />

            <div className="space-y-10 text-sm text-[#3b3834] leading-relaxed">
              {/* Section 1: System Purpose */}
              <section className="space-y-3">
                <h2 className="text-lg font-serif font-semibold text-[#141312] tracking-tight">
                  1. Hybrid Architecture: Technology + Human Concierge
                </h2>
                <p>
                  Proventa is built as a hybrid intelligence platform. We combine state-of-the-art language processing technology (Google Gemini models) for rapid unstructured request parsing with human concierge professionals for real-world verification and booking execution.
                </p>
                <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#ded7cc] space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-xs text-[#141312]">
                    <Sparkles className="w-4 h-4 text-[#8a7053]" />
                    <span>How AI Enhances the Member Experience:</span>
                  </div>
                  <ul className="list-disc list-inside text-xs text-[#6e6b65] space-y-1 pl-1">
                    <li><strong>Intent Parsing:</strong> Extracts destination, dates, preferences, party size, and dietary restrictions from conversational voice or text prompts.</li>
                    <li><strong>Category Routing:</strong> Automatically classifies requests into dining, travel, wellness, shopping, or home logistics.</li>
                    <li><strong>Option Synthesis:</strong> Generates recommendation batches of up to 25 genuine options matching stored lifestyle preferences.</li>
                  </ul>
                </div>
              </section>

              {/* Section 2: What AI Does NOT Do */}
              <section className="space-y-3">
                <h2 className="text-lg font-serif font-semibold text-[#141312] tracking-tight">
                  2. Critical Operational Limitations &amp; Zero-Fabrication Safeguards
                </h2>
                <p>
                  To ensure member trust and prevent hallucinations or unverified reservations, Proventa adheres to strict architectural boundaries:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
                  <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-1.5 text-amber-950">
                    <strong className="block font-semibold">AI Does NOT Execute Autonomous Bookings</strong>
                    <p>
                      The AI agent cannot charge member credit cards, finalize reservations, or bind customers financially without explicit customer approval and concierge verification.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-1.5 text-amber-950">
                    <strong className="block font-semibold">AI Outputs Are Research Proposals</strong>
                    <p>
                      Recommendation batches represent curated proposals. Real availability, live pricing, and table/seat inventory require real-time validation by our concierge team or direct provider APIs.
                    </p>
                  </div>
                </div>
              </section>

              {/* Section 3: Data Privacy & Model Training */}
              <section className="space-y-3">
                <h2 className="text-lg font-serif font-semibold text-[#141312] tracking-tight">
                  3. Zero Public Model Training Commitment
                </h2>
                <p>
                  Member privacy is paramount. When requests or preferences are processed via our AI engine:
                </p>
                <ul className="list-disc list-inside space-y-1.5 text-xs text-[#524e48] pl-2">
                  <li>Your private prompts and task details are processed strictly within enterprise-grade, encrypted API sessions.</li>
                  <li>Your communications and personal information are <strong>NEVER</strong> used to train or fine-tune public third-party foundation models.</li>
                  <li>Sensitive personal data is filtered prior to automated processing.</li>
                </ul>
              </section>

              {/* Section 4: Human Review & Escalation */}
              <section className="space-y-3">
                <h2 className="text-lg font-serif font-semibold text-[#141312] tracking-tight">
                  4. Human Concierge Oversight &amp; Escalation Triggers
                </h2>
                <p>
                  Automated processing automatically yields to human concierge managers when:
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs text-[#524e48] pl-2">
                  <li>A request exceeds standard confidence thresholds or involves complex multi-city coordination.</li>
                  <li>The estimated financial commitment exceeds threshold amounts (&gt; ₹10,000).</li>
                  <li>A member requests bespoke negotiation, private chartering, or customized offline services.</li>
                  <li>The member explicitly asks to communicate directly with a human concierge.</li>
                </ul>
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
