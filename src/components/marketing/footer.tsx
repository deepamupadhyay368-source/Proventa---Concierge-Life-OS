import Link from 'next/link';
import { ArrowUpRight, ShieldCheck, Lock } from 'lucide-react';
import { BRAND_CONFIG } from '@/lib/brand';

const FOOTER_SECTIONS = [
  {
    code: '01 // WEALTH OS',
    title: 'Platform Modules',
    links: [
      { label: 'Family Wealth Dashboard', href: '/dashboard' },
      { label: 'Asset Management', href: '/assets' },
      { label: 'Liability & Debt Register', href: '/liabilities' },
      { label: 'Family Vault & Documents', href: '/vault' },
      { label: 'Cashflow Intelligence', href: '/cashflow' },
      { label: 'Multi-Agent Intelligence', href: '/intelligence' },
    ],
  },
  {
    code: '02 // PLANNING',
    title: 'Continuity & Scenarios',
    links: [
      { label: 'Family Milestones & Goals', href: '/goals' },
      { label: 'Corporate Ownership Map', href: '/business-ownership' },
      { label: 'Insurance & Protection', href: '/protection' },
      { label: 'Continuity & Nominees', href: '/continuity' },
      { label: 'Reports & Statements', href: '/reports' },
    ],
  },
  {
    code: '03 // ACCOUNTS',
    title: 'Workspaces & Access',
    links: [
      { label: 'Sign In', href: '/sign-in' },
      { label: 'Begin Onboarding', href: '/onboarding' },
      { label: 'Family Subscriptions', href: '/pricing' },
      { label: 'Help & Operations', href: '/support' },
    ],
  },
  {
    code: '04 // GOVERNANCE',
    title: 'Trust & DPDP Privacy',
    links: [
      { label: 'DPDP Privacy Notice', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Security Architecture', href: '/trust' },
      { label: 'Data Rights & Export', href: '/data-rights' },
      { label: 'Grievance Officer', href: '/contact' },
    ],
  },
];

export function MarketingFooter() {
  return (
    <footer className="bg-[#070A12] text-[#F8F9FD] border-t border-[#1E293B]">
      {/* Banner */}
      <div className="border-b border-[#1E293B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
            <div className="lg:col-span-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1E1035] border border-[#3E236E] text-[11px] font-mono uppercase tracking-[0.2em] text-[#DDD0F7] mb-4">
                PROVENTA // FAMILY FINANCIAL INFRASTRUCTURE
              </div>
              <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-white leading-[1.05]">
                Your wealth. One living system.
              </h2>
              <p className="mt-4 text-base sm:text-lg text-[#9D8BC9] max-w-2xl font-light">
                Bring together individual accounts, joint family holdings, encrypted documents, and future generational continuity in one secure digital ecosystem.
              </p>
            </div>
            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3">
              <Link
                href="/onboarding"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-sm font-semibold uppercase tracking-wider text-white bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] hover:from-[#8B5CF6] hover:to-[#7C3AED] transition-all shadow-lg shadow-[#7C3AED]/25"
              >
                Set Up Family Workspace
                <ArrowUpRight className="w-4 h-4" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-sm font-semibold uppercase tracking-wider text-[#DDD0F7] bg-[#1E1035] hover:bg-[#2A164D] border border-[#3E236E] transition-all"
              >
                View Plans & Entitlements
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Matrix */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {FOOTER_SECTIONS.map((section) => (
            <div key={section.code} className="space-y-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#A78BFA]">
                {section.code}
              </div>
              <div className="text-sm font-semibold text-white tracking-wide">
                {section.title}
              </div>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-xs text-[#9D8BC9] hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Regulatory Boundaries & Disclaimer */}
        <div className="mt-14 pt-8 border-t border-[#1E293B]/60 text-[11px] text-[#64748B] leading-relaxed space-y-3">
          <p>
            <strong className="text-[#94A3B8]">Regulatory Notice & Product Scope:</strong> PROVENTA is an independent software-based family financial recordkeeping and wealth organization platform. PROVENTA is not an RBI-registered Account Aggregator, a SEBI-registered investment adviser, broker, portfolio manager, or regulated depository. The platform does not hold custody of funds or securities, execute financial transactions, sell insurance policies, or provide personalized securities investment advice or buy/sell signals. All valuations and compound scenario simulations are deterministic mathematical projections based on user-supplied parameters and verified documents.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#1E293B]/40">
            <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
              <Lock className="w-3.5 h-3.5 text-[#10B981]" />
              <span>AES-256 Encryption at Rest & TLS 1.3 in Transit · DPDP Act Compliant Architecture</span>
            </div>
            <div className="text-xs text-[#64748B]">
              © {new Date().getFullYear()} PROVENTA Technology Technologies Pvt. Ltd. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export const PublicFooter = MarketingFooter;
export default MarketingFooter;
