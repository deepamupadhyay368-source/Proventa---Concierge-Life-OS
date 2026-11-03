import Link from 'next/link';
import { ShieldCheck, Lock } from 'lucide-react';
import { BRAND_CONFIG } from '@/lib/brand';

const FOOTER_SECTIONS = [
  {
    title: 'Platform',
    links: [
      { label: 'Capital Assets', href: '/assets' },
      { label: 'Debt & Facilities', href: '/liabilities' },
      { label: 'Encrypted Vault', href: '/vault' },
      { label: 'Treasury & Cashflow', href: '/cashflow' },
      { label: 'Financial Cockpit', href: '/dashboard' },
    ],
  },
  {
    title: 'Continuity',
    links: [
      { label: 'Intergenerational Directives', href: '/continuity' },
      { label: 'Business Ownership Map', href: '/business-ownership' },
      { label: 'Insurance & Protection', href: '/protection' },
      { label: 'Scenario Simulations', href: '/goals' },
      { label: 'Audited Statements', href: '/reports' },
    ],
  },
  {
    title: 'Membership',
    links: [
      { label: 'Pricing & Plans', href: '/pricing' },
      { label: 'Sign In with Google', href: '/sign-in' },
      { label: 'Family Workspaces', href: '/family' },
      { label: 'Settings & Security', href: '/settings' },
    ],
  },
];

export function MarketingFooter() {
  return (
    <footer className="bg-[#090B10] text-[#F4F6FA] border-t border-[#252C38] font-sans">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand Column (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#2457FF] text-[#F4F6FA] flex items-center justify-center font-heading font-black text-base rounded-xs">
                P
              </div>
              <span className="font-heading text-xl uppercase font-black text-[#F4F6FA] tracking-wider">
                {BRAND_CONFIG.name}
              </span>
            </div>
            <p className="text-sm text-[#C5CAD3] max-w-sm leading-relaxed">
              Comprehensive Financial Intelligence Platform for individuals and families.
            </p>
            <div className="pt-2 flex items-center gap-4 text-xs font-mono text-[#858D9B]">
              <span className="flex items-center gap-1.5 text-[#C5CAD3]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2457FF]" /> DPDP Act 2023
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 text-[#C5CAD3]">
                <Lock className="w-3.5 h-3.5 text-[#2457FF]" /> AES-GCM-256
              </span>
            </div>
          </div>

          {/* Links Columns (3 cols) */}
          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title} className="space-y-4">
              <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-[#F4F6FA]">
                {section.title}
              </h3>
              <ul className="space-y-2.5 text-sm">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[#C5CAD3] hover:text-[#F4F6FA] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-[#252C38] flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-[#858D9B]">
          <div>
            © 2026 {BRAND_CONFIG.name}. All rights reserved. Mumbai, India.
          </div>
          <div>
            Zero Commissions • Integer Paise Arithmetic • 100% Fiduciary
          </div>
        </div>
      </div>
    </footer>
  );
}

export const PublicFooter = MarketingFooter;
