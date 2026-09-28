import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Shield,
  FileText,
  Lock,
  RefreshCw,
  Cpu,
  Database,
  CreditCard,
  Building,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';
import { LEGAL_DOCUMENTS, POLICY_EFFECTIVE_DATES } from '@/lib/legal/versions';

export const metadata: Metadata = {
  title: 'Legal & Trust Center | Proventa',
  description:
    'Legal framework, sovereign privacy disclosures, concierge service terms, and transparency policies for Proventa Concierge Life OS.',
};

export default function LegalHubPage() {
  const coreDocs = LEGAL_DOCUMENTS.filter((d) => d.category === 'CORE');
  const serviceDocs = LEGAL_DOCUMENTS.filter((d) => d.category === 'SERVICES');
  const transparencyDocs = LEGAL_DOCUMENTS.filter((d) => d.category === 'TRANSPARENCY');
  const rightsDocs = LEGAL_DOCUMENTS.filter((d) => d.category === 'RIGHTS');

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#141312] pt-24 pb-20 font-sans">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header Banner */}
        <div className="border-b border-[#e8e2d8] pb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#f5ede0] text-[#8a7053] border border-[#e8e2d8] mb-4">
            <Shield className="w-3.5 h-3.5" />
            <span>Sovereign Trust &amp; Governance</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-normal text-[#141312] tracking-tight">
            Legal &amp; Trust Center
          </h1>
          <p className="mt-4 text-sm sm:text-base text-[#6e6b65] leading-relaxed max-w-3xl">
            Proventa operates as an exclusive, private Concierge Life OS combining intelligent request coordination with verified human execution. Our legal foundation is built on explicit consent gating, non-custodial payment safety, zero behavioral advertising, and absolute data stewardship.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-[#8a8680]">
            <span>Active Cohort: Wave 1 Private Beta</span>
            <span>·</span>
            <span>Effective: {POLICY_EFFECTIVE_DATES.privacy}</span>
            <span>·</span>
            <span>Jurisdiction: Ahmedabad, Gujarat, India</span>
          </div>
        </div>

        {/* Section: Core Membership Agreements */}
        <div className="space-y-4">
          <h2 className="text-xs uppercase tracking-widest font-bold text-[#8a7053]">
            Core Membership Agreements
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {coreDocs.map((doc) => (
              <Link
                key={doc.href}
                href={doc.href}
                className="group p-6 bg-white rounded-2xl border border-[#ded7cc] hover:border-[#8a7053] transition-all shadow-xs hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-neutral-100 text-neutral-600">
                      v{doc.version}
                    </span>
                    <ArrowRight className="w-4 h-4 text-neutral-300 group-hover:text-[#8a7053] transition-colors" />
                  </div>
                  <h3 className="text-base font-serif font-semibold text-[#141312] group-hover:text-[#8a7053] transition-colors mb-2">
                    {doc.title}
                  </h3>
                  <p className="text-xs text-[#6e6b65] leading-relaxed">
                    {doc.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Section: Concierge Services & Transactions */}
        <div className="space-y-4">
          <h2 className="text-xs uppercase tracking-widest font-bold text-[#8a7053]">
            Concierge Operations &amp; Settlements
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {serviceDocs.map((doc) => (
              <Link
                key={doc.href}
                href={doc.href}
                className="group p-6 bg-white rounded-2xl border border-[#ded7cc] hover:border-[#8a7053] transition-all shadow-xs hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-neutral-100 text-neutral-600">
                      v{doc.version}
                    </span>
                    <ArrowRight className="w-4 h-4 text-neutral-300 group-hover:text-[#8a7053] transition-colors" />
                  </div>
                  <h3 className="text-base font-serif font-semibold text-[#141312] group-hover:text-[#8a7053] transition-colors mb-2">
                    {doc.title}
                  </h3>
                  <p className="text-xs text-[#6e6b65] leading-relaxed">
                    {doc.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Section: Technology & Transparency */}
        <div className="space-y-4">
          <h2 className="text-xs uppercase tracking-widest font-bold text-[#8a7053]">
            Technology, AI &amp; Privacy Safeguards
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {transparencyDocs.map((doc) => (
              <Link
                key={doc.href}
                href={doc.href}
                className="group p-6 bg-white rounded-2xl border border-[#ded7cc] hover:border-[#8a7053] transition-all shadow-xs hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-neutral-100 text-neutral-600">
                      v{doc.version}
                    </span>
                    <ArrowRight className="w-4 h-4 text-neutral-300 group-hover:text-[#8a7053] transition-colors" />
                  </div>
                  <h3 className="text-base font-serif font-semibold text-[#141312] group-hover:text-[#8a7053] transition-colors mb-2">
                    {doc.title}
                  </h3>
                  <p className="text-xs text-[#6e6b65] leading-relaxed">
                    {doc.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Section: Sovereign Rights & Redressal */}
        <div className="space-y-4">
          <h2 className="text-xs uppercase tracking-widest font-bold text-[#8a7053]">
            Data Rights, Redressal &amp; Grievance Desk
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {rightsDocs.map((doc) => (
              <Link
                key={doc.href}
                href={doc.href}
                className="group p-6 bg-white rounded-2xl border border-[#ded7cc] hover:border-[#8a7053] transition-all shadow-xs hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-neutral-100 text-neutral-600">
                      v{doc.version}
                    </span>
                    <ArrowRight className="w-4 h-4 text-neutral-300 group-hover:text-[#8a7053] transition-colors" />
                  </div>
                  <h3 className="text-base font-serif font-semibold text-[#141312] group-hover:text-[#8a7053] transition-colors mb-2">
                    {doc.title}
                  </h3>
                  <p className="text-xs text-[#6e6b65] leading-relaxed">
                    {doc.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Entity & Venture Transparency Notice */}
        <div className="bg-white rounded-3xl p-8 border border-[#ded7cc] space-y-6">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-[#faf8f5] border border-[#e8e2d8] text-[#8a7053] shrink-0">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#141312] uppercase tracking-wider">
                Venture Operations &amp; Legal Entity Disclosure
              </h3>
              <p className="text-xs text-[#6e6b65] mt-1 leading-relaxed">
                Proventa is currently operating as a founder-led technology venture founded by Deepam G Upadhyay in Ahmedabad, Gujarat, India. Formal corporate incorporation details and statutory registration numbers will be updated upon finalization.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#f0ece4] text-xs">
            <div>
              <span className="font-semibold text-[#141312] block mb-1">Venture Brand:</span>
              <span className="text-[#6e6b65]">Proventa — Concierge Life OS</span>
            </div>
            <div>
              <span className="font-semibold text-[#141312] block mb-1">Operational Location:</span>
              <span className="text-[#6e6b65]">Ahmedabad, Gujarat, India</span>
            </div>
            <div>
              <span className="font-semibold text-[#141312] block mb-1">Privacy &amp; Legal Desk:</span>
              <a href="mailto:privacy@proventa.in" className="text-[#8a7053] underline font-medium">
                privacy@proventa.in
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
