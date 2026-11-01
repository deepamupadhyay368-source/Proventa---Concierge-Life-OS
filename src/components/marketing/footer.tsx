import Link from 'next/link';
import { ArrowUpRight, ShieldCheck, Lock } from 'lucide-react';
import { BRAND_CONFIG } from '@/lib/brand';

const FOOTER_SECTIONS = [
  {
    code: '01 // WEALTH REGISTERS',
    title: 'Platform Modules',
    links: [
      { label: 'Family Wealth Command Cockpit', href: '/dashboard' },
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
      { label: 'Institutional Licensing Tiers', href: '/pricing' },
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
    <footer className="bg-[#090B10] text-[#F4F6FA] border-t border-[#252C38] font-sans">
      {/* Monumental Banner */}
      <div className="border-b border-[#252C38] bg-[#171C26]">
        <div className="max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
            <div className="lg:col-span-8 space-y-4">
              <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#7595FF] font-semibold flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#2457FF]" />
                <span>PROVENTA // TITANIUM FUTURE × DIGITAL COBALT</span>
              </div>
              <h2 className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#F4F6FA] leading-none">
                Your wealth. One living system.
              </h2>
              <p className="font-sans text-sm sm:text-base text-[#C5CAD3] max-w-2xl leading-relaxed">
                Next-generation family financial infrastructure built with titanium precision and digital cobalt intelligence. Consolidated net worth, asset registers, encrypted family vault, and private wealth telemetry.
              </p>
            </div>
            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 font-mono text-xs">
              <Link
                href="/onboarding"
                className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-[#2457FF] text-[#F4F6FA] hover:bg-[#1B46D9] uppercase tracking-wider font-semibold border border-[#7595FF]/40 rounded-[2px] shadow-[0_0_20px_rgba(36,87,255,0.3)] transition-all"
              >
                <span>Commence Institutional Intake</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-[#090B10] text-[#C5CAD3] hover:text-[#F4F6FA] hover:border-[#7595FF]/50 uppercase tracking-wider font-semibold border border-[#252C38] rounded-[2px] transition-colors"
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
              <div className="text-[10px] uppercase tracking-[0.2em] text-[#7595FF] font-semibold">
                {section.code}
              </div>
              <ul className="space-y-2.5 text-xs text-[#858D9B]">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="hover:text-[#F4F6FA] hover:underline transition-colors"
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
        <div className="mt-16 pt-8 border-t border-[#252C38] font-mono text-[10px] text-[#858D9B] space-y-2 leading-relaxed">
          <p>
            STATUTORY INDEPENDENCE NOTICE: PROVENTA is an independent digital family financial infrastructure and software platform. PROVENTA is not a registered investment advisor, stock broker, depository participant, or merchant banker under the Securities and Exchange Board of India (SEBI), nor an insurance repository or intermediary under IRDAI.
          </p>
          <p>
            DATA PRIVACY &amp; DPDP ACT 2023: All family documents, cap-table maps, and personal ledgers are processed under strict client-side encryption and tenant-level database separation in compliance with the Digital Personal Data Protection Act 2023.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[#858D9B]">
            <div>© {new Date().getFullYear()} PROVENTA TECHNOLOGIES PRIVATE LIMITED. ALL RIGHTS RESERVED.</div>
            <div className="flex items-center gap-4">
              <span>JURISDICTION: INDIA</span>
              <span className="text-[#7595FF]">ENGINE: DETERMINISTIC PAISE PRECISION</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default MarketingFooter;
export const PublicFooter = MarketingFooter;
