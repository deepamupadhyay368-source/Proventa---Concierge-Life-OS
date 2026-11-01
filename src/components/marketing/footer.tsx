import Link from 'next/link';
import { ArrowUpRight, ShieldCheck, Lock } from 'lucide-react';
import { BRAND_CONFIG } from '@/lib/brand';

const FOOTER_SECTIONS = [
  {
    code: '01 // WEALTH REGISTERS',
    title: 'Platform Modules',
    links: [
      { label: 'Family Wealth Cockpit', href: '/dashboard' },
      { label: 'Capital Asset Inventory', href: '/assets' },
      { label: 'Debt & Facility Register', href: '/liabilities' },
      { label: 'Encrypted Family Vault', href: '/vault' },
      { label: 'Treasury & Cashflow', href: '/cashflow' },
      { label: 'Analytical Research Console', href: '/intelligence' },
    ],
  },
  {
    code: '02 // CONTINUITY & GRAPH',
    title: 'Succession Architecture',
    links: [
      { label: 'Capital Milestone Goals', href: '/goals' },
      { label: 'Corporate Cap-Table Map', href: '/business-ownership' },
      { label: 'Protection & Policy Records', href: '/protection' },
      { label: 'Intergenerational Directives', href: '/continuity' },
      { label: 'Audited Financial Statements', href: '/reports' },
    ],
  },
  {
    code: '03 // ENTITLEMENTS',
    title: 'Institutional Licenses',
    links: [
      { label: 'Institutional Tiers', href: '/pricing' },
      { label: 'Commence Intake Journey', href: '/onboarding' },
      { label: 'Family Trust Workspaces', href: '/family' },
      { label: 'Multi-Agent Orchestrator', href: '/intelligence' },
    ],
  },
  {
    code: '04 // STATUTORY GOVERNANCE',
    title: 'DPDP Act Compliance',
    links: [
      { label: 'DPDP Privacy Notice', href: '/settings' },
      { label: 'Data Portability Export', href: '/settings' },
      { label: 'Right to Erasure Protocol', href: '/settings' },
      { label: 'Cryptographic Architecture', href: '/vault' },
    ],
  },
];

export function MarketingFooter() {
  return (
    <footer className="bg-[#101010] text-[#F0EDE5] border-t border-[#101010] font-sans">
      {/* Monumental Banner */}
      <div className="border-b border-[#2A2925]">
        <div className="max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
            <div className="lg:col-span-8 space-y-4">
              <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#B6A68A]">
                PROVENTA // THE WEALTH INSTITUTION
              </div>
              <h2 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal tracking-tight text-[#F0EDE5] leading-none">
                Your wealth. One living system.
              </h2>
              <p className="font-sans text-sm sm:text-base text-[#85827B] max-w-2xl leading-relaxed">
                Independent family financial infrastructure designed for multi-generational wealth preservation, deterministic accounting, and private intelligence.
              </p>
            </div>
            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 font-mono text-xs">
              <Link
                href="/onboarding"
                className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-[#F0EDE5] text-[#101010] hover:bg-[#263B35] hover:text-[#FAF9F6] uppercase tracking-wider font-semibold border border-[#F0EDE5] transition-colors"
              >
                <span>Commence Institutional Intake</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-transparent text-[#F0EDE5] hover:bg-[#2A2925] uppercase tracking-wider font-semibold border border-[#2A2925] transition-colors"
              >
                Inspect Institutional Tiers
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Directory Grid */}
      <div className="max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {FOOTER_SECTIONS.map((section) => (
            <div key={section.code} className="space-y-4 font-mono">
              <div className="text-[10px] uppercase tracking-[0.2em] text-[#B6A68A]">
                {section.code}
              </div>
              <ul className="space-y-2.5 text-xs text-[#85827B]">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="hover:text-[#F0EDE5] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Regulatory Disclaimers & DPDP Notice */}
        <div className="mt-16 pt-8 border-t border-[#2A2925] font-mono text-[10px] text-[#85827B] space-y-2 leading-relaxed">
          <p>
            STATUTORY INDEPENDENCE NOTICE: PROVENTA is an independent digital family financial infrastructure and software platform. PROVENTA is not a registered investment advisor, stock broker, depository participant, or merchant banker under the Securities and Exchange Board of India (SEBI), nor an insurance repository or intermediary under IRDAI.
          </p>
          <p>
            DATA PRIVACY &amp; DPDP ACT 2023: All family documents, cap-table maps, and personal ledgers are processed under strict client-side encryption and tenant-level database separation in compliance with the Digital Personal Data Protection Act 2023.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[#85827B]">
            <div>© {new Date().getFullYear()} PROVENTA TECHNOLOGIES PRIVATE LIMITED. ALL RIGHTS RESERVED.</div>
            <div className="flex items-center gap-4">
              <span>JURISDICTION: INDIA</span>
              <span>ENGINE: DETERMINISTIC PAISE PRECISION</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default MarketingFooter;
export const PublicFooter = MarketingFooter;
