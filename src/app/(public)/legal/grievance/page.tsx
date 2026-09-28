import type { Metadata } from 'next';
import Link from 'next/link';
import { Mail, ShieldCheck, MapPin, Clock, FileText, CheckCircle2 } from 'lucide-react';
import { LegalHeader, LegalNav } from '@/components/legal/legal-nav';
import { POLICY_VERSIONS, POLICY_EFFECTIVE_DATES } from '@/lib/legal/versions';

export const metadata: Metadata = {
  title: 'Grievance & Redressal Desk | Proventa Legal & Trust Center',
  description:
    'Designated grievance redressal mechanisms, privacy escalations, and official contact channels for Proventa.',
};

export default function GrievanceDeskPage() {
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
              title="Grievance &amp; Redressal Desk"
              subtitle="Designated point of contact for privacy concerns, data protection inquiries, and formal grievance escalation."
              version={POLICY_VERSIONS.privacy}
              effectiveDate={POLICY_EFFECTIVE_DATES.privacy}
            />

            <div className="space-y-10 text-sm text-[#3b3834] leading-relaxed">
              {/* Section 1: Designated Contact Details */}
              <section className="space-y-4">
                <h2 className="text-lg font-serif font-semibold text-[#141312] tracking-tight">
                  1. Designated Privacy &amp; Grievance Officer
                </h2>
                <p>
                  In accordance with applicable Information Technology and Data Protection provisions under Indian law, the designated contact details for our Grievance Desk are provided below:
                </p>

                <div className="p-6 rounded-2xl bg-[#faf8f5] border border-[#ded7cc] space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 bg-white rounded-xl border border-[#e8e2d8] text-[#8a7053] shrink-0">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <strong className="text-neutral-900 block font-semibold">Official Privacy Desk Email</strong>
                        <a href="mailto:privacy@proventa.in" className="text-[#8a7053] underline font-medium">
                          privacy@proventa.in
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="p-2.5 bg-white rounded-xl border border-[#e8e2d8] text-[#8a7053] shrink-0">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <strong className="text-neutral-900 block font-semibold">Operational Location</strong>
                        <span className="text-neutral-600">Ahmedabad, Gujarat, India</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="p-2.5 bg-white rounded-xl border border-[#e8e2d8] text-[#8a7053] shrink-0">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <strong className="text-neutral-900 block font-semibold">Acknowledgment SLA</strong>
                        <span className="text-neutral-600">Within 24 to 48 business hours</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="p-2.5 bg-white rounded-xl border border-[#e8e2d8] text-[#8a7053] shrink-0">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <strong className="text-neutral-900 block font-semibold">Venture Status</strong>
                        <span className="text-neutral-600">Founder-Led Private Operation</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-600">
                  <em>Note:</em> Proventa is currently operating as a founder-led venture in Ahmedabad, Gujarat, India. Formal corporate incorporation details will be updated when applicable.
                </div>
              </section>

              {/* Section 2: Escalation Process */}
              <section className="space-y-4">
                <h2 className="text-lg font-serif font-semibold text-[#141312] tracking-tight">
                  2. Grievance Redressal Process
                </h2>
                <div className="space-y-3 text-xs">
                  <div className="p-4 rounded-xl bg-white border border-neutral-200 space-y-1">
                    <strong className="text-neutral-900 block font-semibold">Step 1: Submission</strong>
                    <p className="text-neutral-600">
                      Submit your concern or dispute details either through our interactive <Link href="/legal/privacy-requests" className="text-[#8a7053] underline font-medium">Privacy Requests Portal</Link> or by sending an email with subject line <em>&quot;Formal Grievance: [Summary]&quot;</em> to <a href="mailto:privacy@proventa.in" className="text-[#8a7053] underline">privacy@proventa.in</a>.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-neutral-200 space-y-1">
                    <strong className="text-neutral-900 block font-semibold">Step 2: Acknowledgment &amp; Ticket Tracking</strong>
                    <p className="text-neutral-600">
                      You will receive a formal acknowledgment and tracking reference within 48 hours containing the designated resolution timeline.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-neutral-200 space-y-1">
                    <strong className="text-neutral-900 block font-semibold">Step 3: Investigation &amp; Resolution</strong>
                    <p className="text-neutral-600">
                      Our core leadership will investigate operational logs, audit trails, and provider correspondences to provide a written resolution within 15 to 30 calendar days.
                    </p>
                  </div>
                </div>
              </section>

              {/* Section 3: Concierge Support vs Privacy Redressal */}
              <section className="space-y-3 pt-4 border-t border-[#ded7cc]">
                <h2 className="text-lg font-serif font-semibold text-[#141312] tracking-tight">
                  3. Operational vs. Legal/Privacy Inquiries
                </h2>
                <p className="text-xs text-[#6e6b65]">
                  For urgent day-to-day concierge assistance, flight adjustments, or restaurant reservation modifications, please contact your concierge team directly through the in-app chat or email <a href="mailto:concierge@proventa.in" className="text-[#8a7053] underline font-medium">concierge@proventa.in</a>.
                </p>
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
