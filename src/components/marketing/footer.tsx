import Link from 'next/link';
import { ArrowUpRight, ShieldCheck, Lock, Compass } from 'lucide-react';
import { BRAND_CONFIG } from '@/lib/brand';

const FOOTER_SECTIONS = [
  {
    code: '01 // CAPITAL MATRIX',
    title: 'Platform Registers',
    links: [
      { label: 'Family Wealth Command Cockpit', href: '/dashboard' },
      { label: 'Capital Asset Inventory', href: '/assets' },
      { label: 'Debt & Facility Register', href: '/liabilities' },
      { label: 'Encrypted Family Vault', href: '/vault' },
      { label: 'Treasury & Cashflow Stream', href: '/cashflow' },
      { label: 'Analytical Research Workspace', href: '/intelligence' },
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
      { label: 'Multi-Agent Desks', href: '/intelligence' },
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
    <footer className="bg-[#080A0F] text-[#F4F2ED] border-t border-[#B9C1CC]/15 font-sans">
      {/* Living Financial Universe Banner */}
      <div className="border-b border-[#B9C1CC]/15 bg-[#171B23]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
            <div className="lg:col-span-8 space-y-4">
              <div className="font-mono text-xs uppercase tracking-wider text-[#2457E8] font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#2457E8] animate-pulse" />
                <span>EXPERIMENTAL DIGITAL ART // FAMILY WEALTH OS</span>
              </div>
              <h2 className="font-heading font-black text-3xl sm:text-5xl uppercase tracking-tight text-[#F4F2ED] leading-tight">
                Your wealth. One living system.
              </h2>
              <p className="text-sm sm:text-base text-[#B9C1CC] max-w-2xl leading-relaxed">
                Transform disparate bank accounts, unlisted shares, private equity stakes, and physical deeds into a single, unified, living architecture.
              </p>
            </div>
            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 font-mono text-xs">
              <Link
                href="/onboarding"
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 bg-[#2457E8] text-[#F4F2ED] hover:bg-[#1D4ED8] uppercase tracking-wider font-bold rounded-xs shadow-md transition-all text-center"
              >
                <span>Commence Institutional Intake</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
              <Link
                href="/dashboard"
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 bg-[#080A0F] text-[#F4F2ED] hover:bg-[#252C38] uppercase tracking-wider font-bold border border-[#B9C1CC]/30 rounded-xs transition-all text-center"
              >
                Launch Cockpit Platform
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main 4-Column Codex Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {FOOTER_SECTIONS.map((section) => (
            <div key={section.code} className="space-y-4">
              <div className="space-y-1">
                <div className="font-mono text-[10px] uppercase tracking-wider text-[#A9D8F5] font-semibold">
                  {section.code}
                </div>
                <h3 className="font-heading font-bold text-base text-[#F4F2ED] uppercase tracking-wide">
                  {section.title}
                </h3>
              </div>
              <ul className="space-y-2.5 font-mono text-xs">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[#B9C1CC] hover:text-[#F4F2ED] transition-colors flex items-center justify-between group"
                    >
                      <span>{link.label}</span>
                      <ArrowUpRight className="w-3 h-3 text-[#B9C1CC]/40 group-hover:text-[#2457E8] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar: Fiduciary Compliance & DPDP Act */}
        <div className="mt-16 pt-8 border-t border-[#B9C1CC]/15 flex flex-col md:flex-row items-center justify-between gap-6 font-mono text-[11px] text-[#B9C1CC]/70">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-[#F4F2ED] font-bold">© 2026 {BRAND_CONFIG.name} INC.</span>
            <span>•</span>
            <span className="flex items-center gap-1.5 text-[#D5A85D]">
              <ShieldCheck className="w-3.5 h-3.5" /> DPDP Act 2023 Compliant
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 text-[#A9D8F5]">
              <Lock className="w-3.5 h-3.5" /> Client-Side AES-GCM-256
            </span>
          </div>

          <div className="flex items-center gap-6">
            <span>INTEGER PAISE ACCURATE (0 FLOAT DRIFT)</span>
            <span>MUMBAI, IN</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export const PublicFooter = MarketingFooter;
