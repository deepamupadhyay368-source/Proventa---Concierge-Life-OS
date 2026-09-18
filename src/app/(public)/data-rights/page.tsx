import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Download, Trash2, Edit3, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Member Data Rights & DPDP Portal | Proventa',
  description: 'Exercise your rights under the Digital Personal Data Protection (DPDP) Act 2023: data export, correction, erasure, and grievance redressal.',
};

export default function DataRightsPage() {
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
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-[#e8f2ea] text-[#1e5e2e]">
              DPDP Act 2023 Self-Service
            </span>
            <span className="text-xs text-[#8a8680]">Effective Date: September 18, 2026</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-normal text-[#141312] tracking-tight">
            Your Member Data Rights
          </h1>
          <p className="mt-2 text-sm text-[#6e6b65]">
            As a Proventa member, you possess statutory rights over your digital personal data under India&rsquo;s Digital Personal Data Protection Act, 2023.
          </p>
        </div>

        <div className="space-y-10 text-sm text-[#3b3834] leading-relaxed">
          {/* Action Cards */}
          <div className="grid grid-cols-1 gap-4">
            {/* Right to Access & Portability */}
            <div className="p-6 bg-white rounded-2xl border border-[#ded7cc] space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#f5ede0] rounded-xl text-[#8a7053]">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-[#141312]">1. Right to Access &amp; Portability</h2>
                  <p className="text-xs text-[#6e6b65]">Download a complete, machine-readable record of your personal data.</p>
                </div>
              </div>
              <p className="text-xs text-[#524e48]">
                You can download an end-to-end JSON file containing your registered profile, lifestyle preferences, concierge request history, proposals, approved bookings, and security events.
              </p>
              <div className="pt-2">
                <Link
                  href="/api/customer/export"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#faf8f5] hover:bg-[#f0ece4] border border-[#ded7cc] text-xs font-semibold text-[#141312] rounded-xl transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-[#8a7053]" />
                  Download Complete Data Archive (JSON)
                </Link>
                <span className="block text-[11px] text-[#8a8680] mt-1.5">
                  Requires active member login session.
                </span>
              </div>
            </div>

            {/* Right to Correction */}
            <div className="p-6 bg-white rounded-2xl border border-[#ded7cc] space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#f5ede0] rounded-xl text-[#8a7053]">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-[#141312]">2. Right to Correction &amp; Updating</h2>
                  <p className="text-xs text-[#6e6b65]">Ensure your personal and preference data is accurate.</p>
                </div>
              </div>
              <p className="text-xs text-[#524e48]">
                Update your contact numbers, preferred addresses, and lifestyle preferences directly within your account settings, or instruct your concierge desk via the Tell Proventa console.
              </p>
              <div className="pt-2">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#faf8f5] hover:bg-[#f0ece4] border border-[#ded7cc] text-xs font-semibold text-[#141312] rounded-xl transition-colors"
                >
                  Go to Member Dashboard
                </Link>
              </div>
            </div>

            {/* Right to Erasure */}
            <div className="p-6 bg-white rounded-2xl border border-[#ded7cc] space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#fdf2f0] rounded-xl text-[#c44d34]">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-[#141312]">3. Right to Erasure (&ldquo;Right to be Forgotten&rdquo;)</h2>
                  <p className="text-xs text-[#6e6b65]">Request irreversible deletion of your account and personal identifiers.</p>
                </div>
              </div>
              <p className="text-xs text-[#524e48]">
                When you invoke your right to erasure, Proventa instantly scrubs and anonymizes your name, email, phone number, and preferences from our production databases, and revokes all active authentication sessions.
              </p>
              <div className="p-3 bg-[#fbf9f6] rounded-xl border border-[#e8e2d8] text-xs text-[#6e6b65]">
                <strong className="text-[#141312] block mb-1">Erasure Procedure:</strong>
                To execute deletion, send a POST request to <code className="bg-white px-1 py-0.5 rounded border text-[11px]">/api/customer/delete</code> with payload <code className="bg-white px-1 py-0.5 rounded border text-[11px]">{`{"confirmation": "DELETE_MY_ACCOUNT"}`}</code> or contact your concierge desk.
              </div>
            </div>
          </div>

          {/* Grievance Redressal */}
          <section className="space-y-3 pt-4">
            <h2 className="text-lg font-serif font-semibold text-[#141312] tracking-tight">
              4. Statutory Grievance Redressal
            </h2>
            <p className="text-xs text-[#524e48]">
              If you have any questions, unresolved concerns, or wish to register a formal grievance under the DPDP Act 2023, please contact our designated Grievance Officer:
            </p>
            <div className="p-5 bg-white rounded-2xl border border-[#ded7cc] text-xs space-y-2">
              <div>
                <span className="font-semibold text-[#141312]">Grievance Officer: </span>
                <span className="text-[#8a8680] italic">TODO [Founder Configuration: Grievance Officer Name]</span>
              </div>
              <div>
                <span className="font-semibold text-[#141312]">Designation: </span>
                <span className="text-[#6e6b65]">Data Protection &amp; Compliance Officer</span>
              </div>
              <div>
                <span className="font-semibold text-[#141312]">Email: </span>
                <a href="mailto:privacy@proventa.in" className="text-[#8a7053] underline">privacy@proventa.in</a> (copy to <a href="mailto:proventa.in@gmail.com" className="text-[#8a7053] underline">proventa.in@gmail.com</a>)
              </div>
              <div>
                <span className="font-semibold text-[#141312]">Statutory Response Window: </span>
                <span className="text-[#6e6b65]">Acknowledgment within 24 hours; formal resolution within 30 days.</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
