import Link from 'next/link';
import { ArrowUpRight, ShieldCheck, Lock } from 'lucide-react';
import { BRAND_CONFIG } from '@/lib/brand';

const FOOTER_SECTIONS = [
  {
    code: '01 // WEALTH UNIVERSE',
    title: 'Platform Modules',
    links: [
      { label: 'Family Wealth Command Cockpit', href: '/dashboard' },
      { label: 'Capital Asset Inventory', href: '/assets' },
      { label: 'Debt & Facility Register', href: '/liabilities' },
      { label: 'Encrypted Family Vault', href: '/vault' },
      { label: 'Treasury & Cashflow Stream', href: '/cashflow' },
      { label: 'Analytical Research Console', href: '/intelligence' },
    ],
  },
  {
    code: '02 // CONTINUITY & TOPOLOGY',
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
    code: '03 // LICENSING & TIERS',
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
    <footer className="bg-[#FAFBFC] text-[#0F172A] border-t border-[#E2E8F0] font-sans">
      {/* Living Financial Universe Banner */}
      <div className="border-b border-[#E2E8F0] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
            <div className="lg:col-span-8 space-y-4">
              <div className="font-mono text-xs uppercase tracking-wider text-[#2563EB] font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-pulse" />
                <span>PROVENTA // LIVING FINANCIAL UNIVERSE</span>
              </div>
              <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#0F172A] leading-tight">
                Your wealth. One living system.
              </h2>
              <p className="font-sans text-sm sm:text-base text-[#475569] max-w-2xl leading-relaxed">
                An intelligent, connected financial universe for high-net-worth Indian families. Real-time consolidated net worth, multi-generational continuity, encrypted family deed vaults, and deterministic scenarios.
              </p>
            </div>
            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 font-mono text-xs">
              <Link
                href="/onboarding"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#2563EB] text-white hover:bg-[#1D4ED8] uppercase tracking-wider font-semibold rounded-lg shadow-sm shadow-blue-500/25 transition-all"
              >
                <span>Commence Institutional Intake</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#F8FAFC] text-[#334155] hover:text-[#0F172A] hover:bg-white uppercase tracking-wider font-semibold border border-[#CBD5E1] rounded-lg transition-colors"
              >
                Review Licensing Schedules
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Directory Columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {FOOTER_SECTIONS.map((sec) => (
            <div key={sec.code} className="space-y-4">
              <div className="border-b border-[#E2E8F0] pb-2">
                <div className="font-mono text-[10px] uppercase tracking-wider text-[#94A3B8]">
                  {sec.code}
                </div>
                <h4 className="font-display text-sm font-bold text-[#0F172A] mt-0.5">
                  {sec.title}
                </h4>
              </div>
              <ul className="space-y-2.5 font-mono text-xs">
                {sec.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[#64748B] hover:text-[#2563EB] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Fiduciary Notice & Legal Sub-footer */}
        <div className="mt-14 pt-8 border-t border-[#E2E8F0] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-xs text-[#64748B]">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-[#2563EB] text-white rounded-md flex items-center justify-center font-display font-bold text-xs">
              P
            </div>
            <div>
              <span className="font-bold text-[#0F172A]">PROVENTA PLATFORM TECHNOLOGIES PRIVATE LIMITED</span>
              <span className="mx-2">•</span>
              <span>CIN: U72200MH2024PTC419821</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-[#0D9488]">
              <ShieldCheck className="w-3.5 h-3.5" /> DPDP ACT COMPLIANT
            </span>
            <span className="flex items-center gap-1.5 text-[#2563EB]">
              <Lock className="w-3.5 h-3.5" /> AES-GCM-256 ENCRYPTED
            </span>
            <span>© {new Date().getFullYear()} PROVENTA. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export const PublicFooter = MarketingFooter;
export default MarketingFooter;

