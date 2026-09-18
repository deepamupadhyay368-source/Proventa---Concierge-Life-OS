import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Cpu, UserCheck, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'AI Concierge Disclosure & Operational Safeguards | Proventa',
  description: 'Transparent disclosure of AI capabilities, autonomous boundaries, human concierge intervention, and model privacy at Proventa.',
};

export default function AiConciergeDisclosurePage() {
  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#141312] pt-24 pb-20 font-sans">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/legal"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#8a7053] hover:text-[#5a4733] mb-8 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Legal &amp; Compliance Center
        </Link>

        <div className="border-b border-[#e8e2d8] pb-8 mb-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-[#f5ede0] text-[#8a7053]">
              AI Transparency
            </span>
            <span className="text-xs text-[#8a8680]">Effective Date: September 18, 2026</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-normal text-[#141312] tracking-tight">
            AI Concierge Disclosure &amp; Operational Safeguards
          </h1>
          <p className="mt-2 text-sm text-[#6e6b65]">
            How Proventa blends autonomous intelligence with senior human concierge execution to deliver flawless life management.
          </p>
        </div>

        <div className="space-y-10 text-sm text-[#3b3834] leading-relaxed">
          {/* Core Architecture */}
          <section className="space-y-3">
            <h2 className="text-lg font-serif font-semibold text-[#141312] tracking-tight">
              1. The Dual Architecture: Intelligence Engine + Human Desk
            </h2>
            <p>
              Proventa is built on a hybrid operational model. We combine advanced language models (powered by enterprise Google Gemini APIs) with a dedicated on-the-ground human concierge desk.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-5 bg-white rounded-2xl border border-[#ded7cc] space-y-2">
                <div className="flex items-center gap-2 font-semibold text-[#141312]">
                  <Cpu className="w-4 h-4 text-[#8a7053]" />
                  <span>Autonomous AI Engine</span>
                </div>
                <p className="text-[#6e6b65]">
                  Extracts structured intents from unstructured natural language requests, decomposes complex itineraries into actionable subtasks, compares options across providers, and monitors delivery milestones.
                </p>
              </div>

              <div className="p-5 bg-white rounded-2xl border border-[#ded7cc] space-y-2">
                <div className="flex items-center gap-2 font-semibold text-[#141312]">
                  <UserCheck className="w-4 h-4 text-[#8a7053]" />
                  <span>Senior Human Concierge Desk</span>
                </div>
                <p className="text-[#6e6b65]">
                  Conducts offline phone calls with maître d&rsquo;s and flight charter desks, verifies real-time venue availability, handles high-value procurement, and executes delicate negotiations.
                </p>
              </div>
            </div>
          </section>

          {/* Autonomy Boundaries */}
          <section className="space-y-3">
            <h2 className="text-lg font-serif font-semibold text-[#141312] tracking-tight">
              2. Strict Boundaries: What AI Never Does
            </h2>
            <div className="p-5 bg-white rounded-2xl border border-[#ded7cc] space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#141312]">
                <ShieldAlert className="w-4 h-4 text-[#c44d34]" />
                <span>Non-Negotiable System Safeguards:</span>
              </div>
              <ul className="list-disc list-inside text-xs text-[#524e48] space-y-1.5 pl-1">
                <li><strong>No Autonomous Financial Charges:</strong> AI models have zero programmatic authority to deduct payments, charge cards, or bind member finances.</li>
                <li><strong>No Synthetic Confirmations:</strong> Proventa strictly prohibits AI from fabricating or guessing reservation confirmation codes. Every confirmation code provided to you is a genuine provider reference verified by human operators or official APIs.</li>
                <li><strong>No Unsupervised Provider Commitments:</strong> When a task requires external phone calls or manual human coordination, the system transitions to <code className="bg-[#faf8f5] px-1 py-0.5 rounded text-[11px]">AWAITING_CONCIERGE_CALL</code> or <code className="bg-[#faf8f5] px-1 py-0.5 rounded text-[11px]">NEEDS_HUMAN</code>, routing the call sheet directly to human operators.</li>
              </ul>
            </div>
          </section>

          {/* Provider Independence */}
          <section className="space-y-3">
            <h2 className="text-lg font-serif font-semibold text-[#141312] tracking-tight">
              3. Provider Independence &amp; Real-World Coordination
            </h2>
            <p className="text-xs text-[#524e48]">
              Proventa coordinates with third-party providers such as dining venues, hotel groups, global flight distribution channels, and chauffeur fleets. We do not control their proprietary booking engines or inventory algorithms. AI suggestions are cross-checked against actual provider status prior to presentation in proposal options.
            </p>
          </section>

          {/* Data Sovereignty & Model Training */}
          <section className="space-y-3">
            <h2 className="text-lg font-serif font-semibold text-[#141312] tracking-tight">
              4. Foundation Model Privacy
            </h2>
            <div className="p-4 bg-white rounded-xl border border-[#ded7cc] text-xs space-y-2 text-[#524e48]">
              <div className="flex items-center gap-2 font-semibold text-[#141312]">
                <CheckCircle2 className="w-4 h-4 text-[#1e5e2e]" />
                <span>Zero Model Training on Member Data</span>
              </div>
              <p>
                Proventa utilizes enterprise-tier Google Gemini API endpoints. Under our enterprise data processing agreements:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-2 text-[#6e6b65]">
                <li>Your request text, preferences, and personal details are <strong>never</strong> logged by foundation model providers for model training or tuning.</li>
                <li>Prompts are processed ephemerally in transit with TLS 1.3 encryption.</li>
              </ul>
            </div>
          </section>

          {/* Contact */}
          <div className="pt-6 border-t border-[#e8e2d8] text-xs text-[#8a8680]">
            For inquiries regarding our AI architecture and safeguards, contact our technical desk at{' '}
            <a href="mailto:ai@proventa.in" className="text-[#8a7053] underline">ai@proventa.in</a> (copy to <a href="mailto:proventa.in@gmail.com" className="text-[#8a7053] underline">proventa.in@gmail.com</a>).
          </div>
        </div>
      </div>
    </div>
  );
}
