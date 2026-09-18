import type { Metadata } from 'next';
import Link from 'next/link';
import { Shield, FileText, Lock, RefreshCw, Cpu, Database, AlertCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Legal & Compliance Center | Proventa',
  description: 'Legal terms, regulatory disclosures, DPDP Act 2023 compliance, and operational policies for Proventa Concierge Life OS.',
};

export default function LegalPage() {
  const policies = [
    {
      title: 'Terms of Membership & Service',
      href: '/terms',
      icon: FileText,
      description: 'The formal agreement governing access, approval gating, intermediary status, and member responsibilities.',
    },
    {
      title: 'Privacy Policy (DPDP Act 2023)',
      href: '/privacy',
      icon: Shield,
      description: 'Complete disclosures on data processing, zero-advertising guarantee, cloud sovereignty, and user rights.',
    },
    {
      title: 'AI Concierge Disclosure',
      href: '/ai-concierge-disclosure',
      icon: Cpu,
      description: 'Boundaries between autonomous AI intent parsing and senior human concierge intervention.',
    },
    {
      title: 'Refund & Cancellation Policy',
      href: '/refund-cancellation',
      icon: RefreshCw,
      description: 'Clear rules on Proventa service fees, third-party vendor non-refundable terms, and dispute resolution.',
    },
    {
      title: 'Member Data Rights & Erasure',
      href: '/data-rights',
      icon: Database,
      description: 'Self-service export (JSON), correction, and erasure procedures under Indian data protection law.',
    },
    {
      title: 'Cookie & Security Disclosures',
      href: '/cookie-policy',
      icon: Lock,
      description: 'Zero third-party tracking cookies. Transparent details on session authentication and CSRF tokens.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#141312] pt-24 pb-20 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="border-b border-[#e8e2d8] pb-10 mb-12">
          <p className="text-xs uppercase tracking-widest text-[#8a7053] font-semibold mb-2">
            Governance &amp; Trust
          </p>
          <h1 className="text-3xl sm:text-4xl font-serif font-normal text-[#141312] tracking-tight">
            Legal &amp; Compliance Center
          </h1>
          <p className="mt-3 text-sm sm:text-base text-[#6e6b65] leading-relaxed max-w-2xl">
            Proventa operates on an uncompromising mandate of privacy, sovereign data stewardship, explicit customer consent gating, and verified human execution.
          </p>
        </div>

        {/* Policy Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {policies.map((p) => {
            const Icon = p.icon;
            return (
              <Link
                key={p.href}
                href={p.href}
                className="group block p-6 bg-white rounded-2xl border border-[#ded7cc] hover:border-[#8a7053] transition-all shadow-xs hover:shadow-sm"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 rounded-xl bg-[#faf8f5] border border-[#e8e2d8] group-hover:bg-[#f5ede0] transition-colors text-[#8a7053]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h2 className="text-base font-semibold text-[#141312] group-hover:text-[#8a7053] transition-colors">
                    {p.title}
                  </h2>
                </div>
                <p className="text-xs text-[#6e6b65] leading-relaxed">
                  {p.description}
                </p>
              </Link>
            );
          })}
        </div>

        {/* Entity & Regulatory Notice */}
        <div className="bg-white rounded-2xl p-8 border border-[#ded7cc] space-y-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#8a7053] mt-0.5 shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-[#141312] uppercase tracking-wider mb-1">
                Corporate Entity &amp; Founder Mandate
              </h3>
              <p className="text-xs text-[#6e6b65] leading-relaxed">
                Proventa is developed and operated by Proventa Technologies Private Limited, founded by Deepam G Upadhyay.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#f0ece4] text-xs">
            <div>
              <span className="font-semibold text-[#141312] block mb-1">Registered Entity:</span>
              <span className="text-[#6e6b65]">Proventa Technologies Private Limited</span>
            </div>
            <div>
              <span className="font-semibold text-[#141312] block mb-1">Registered Jurisdiction:</span>
              <span className="text-[#6e6b65]">Ahmedabad, Gujarat, India</span>
            </div>
            <div>
              <span className="font-semibold text-[#141312] block mb-1">Corporate Identification Number (CIN):</span>
              <span className="text-[#8a8680] italic">TODO [Founder Configuration: CIN Registration Number]</span>
            </div>
            <div>
              <span className="font-semibold text-[#141312] block mb-1">GSTIN:</span>
              <span className="text-[#8a8680] italic">TODO [Founder Configuration: GSTIN Number]</span>
            </div>
            <div className="sm:col-span-2">
              <span className="font-semibold text-[#141312] block mb-1">Registered Office Address:</span>
              <span className="text-[#8a8680] italic">TODO [Founder Configuration: Registered Office Physical Address, Ahmedabad, Gujarat, India]</span>
            </div>
            <div className="sm:col-span-2">
              <span className="font-semibold text-[#141312] block mb-1">DPDP Act Grievance Officer:</span>
              <span className="text-[#6e6b65]">
                Grievance Officer: <span className="text-[#8a8680] italic">TODO [Founder Configuration: Grievance Officer Name]</span> · Direct inquiries to:{' '}
                <a href="mailto:privacy@proventa.in" className="text-[#8a7053] underline">privacy@proventa.in</a> (copy to <a href="mailto:proventa.in@gmail.com" className="text-[#8a7053] underline">proventa.in@gmail.com</a>)
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-[#8a8680]">
          Last reviewed and effective: September 18, 2026.
        </div>
      </div>
    </div>
  );
}
