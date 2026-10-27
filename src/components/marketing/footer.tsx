import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { BRAND_CONFIG } from '@/lib/brand';

const COLOPHON_COLUMNS = [
  {
    code: 'SEC // 01',
    title: 'INDEX DIRECTORY',
    links: [
      { label: 'All Registered Entities', href: '/businesses' },
      { label: 'Products & Services Catalog', href: '/listings' },
      { label: '18 Sector Classifications', href: '/#categories' },
      { label: 'Dispatch Buyer Enquiry', href: '/enquiries/new' },
    ],
  },
  {
    code: 'SEC // 02',
    title: 'FOR ENTERPRISES',
    links: [
      { label: 'Publish Business Storefront', href: '/business/register' },
      { label: 'Why The Business Index', href: '/for-businesses' },
      { label: 'Vendor Console & Ledger', href: '/business/dashboard' },
      { label: 'Trade Protocol Overview', href: '/how-it-works' },
    ],
  },
  {
    code: 'SEC // 03',
    title: 'BUYER & VENDOR ACCESS',
    links: [
      { label: 'Sign In to Registry', href: '/sign-in' },
      { label: 'Create Buyer Account', href: '/sign-up' },
      { label: 'Buyer Enquiry Workspace', href: '/dashboard' },
      { label: 'Contact Registry Desk', href: '/contact' },
    ],
  },
  {
    code: 'SEC // 04',
    title: 'GOVERNANCE & LEGAL',
    links: [
      { label: 'About PROVENTA', href: '/about' },
      { label: 'Privacy Architecture', href: '/privacy' },
      { label: 'Terms of Commerce', href: '/terms' },
      { label: 'Security & Trust Protocol', href: '/security' },
    ],
  },
];

export function MarketingFooter() {
  return (
    <footer className="bg-[#0D0E11] text-[#F4F1EA] border-t-2 border-[#0D0E11]">
      {/* Upper Colophon Statement Band */}
      <div className="border-b border-[#26282E]">
        <div className="container-wide py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8">
              <div className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[#C8F904] mb-4">
                <span>COLOPHON // PROVENTA REGISTRY</span>
                <span>—</span>
                <span>EDITION {new Date().getFullYear()}</span>
              </div>
              <h2 className="font-display text-3xl sm:text-5xl lg:text-6xl font-bold tracking-[-0.04em] text-[#F4F1EA] leading-[0.96]">
                EVERY BUSINESS.
                <br />
                <span className="text-[#C8F904]">ONE PLACE.</span>
              </h2>
            </div>
            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-end gap-3">
              <Link
                href="/business/register"
                className="inline-flex items-center justify-between w-full sm:w-auto gap-4 bg-[#C8F904] text-[#0D0E11] px-5 py-3.5 font-mono text-xs font-bold uppercase tracking-[0.12em] hover:bg-[#FAF8F3] transition-colors"
              >
                <span>PUBLISH STOREFRONT DOSSIER</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link
                href="/enquiries/new"
                className="inline-flex items-center justify-between w-full sm:w-auto gap-4 border border-[#3A3D45] bg-[#15171C] text-[#F4F1EA] px-5 py-3 font-mono text-xs font-semibold uppercase tracking-[0.12em] hover:border-[#C8F904] hover:text-[#C8F904] transition-colors"
              >
                <span>DISPATCH BUYER ENQUIRY</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Structured 5-Column Swiss Index Grid */}
      <div className="border-b border-[#26282E]">
        <div className="container-wide">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-[#26282E]">
            {/* Column 1: Registry Specs */}
            <div className="lg:col-span-4 py-10 pr-0 md:pr-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-9 w-9 items-center justify-center bg-[#C8F904] text-[#0D0E11] font-mono text-xs font-bold">
                  PV/I
                </div>
                <div>
                  <div className="font-display text-base font-bold tracking-tight text-[#F4F1EA]">
                    {BRAND_CONFIG.name}
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#9E998E]">
                    THE BUSINESS INDEX
                  </div>
                </div>
              </div>
              <p className="text-xs leading-relaxed text-[#CFCAC0] max-w-sm">
                A universal commercial index built for structured discovery. Businesses publish
                verified storefronts and catalog specifications; buyers search by sector and
                dispatch direct quotation enquiries.
              </p>
              <dl className="mt-6 grid grid-cols-2 gap-3 border-t border-[#26282E] pt-5 font-mono text-[10px]">
                <div>
                  <dt className="text-[#78756F] uppercase tracking-[0.14em]">JURISDICTION</dt>
                  <dd className="mt-1 text-[#F4F1EA] font-semibold">INDIA // PAN-NATIONAL</dd>
                </div>
                <div>
                  <dt className="text-[#78756F] uppercase tracking-[0.14em]">REGISTRY DESK</dt>
                  <dd className="mt-1 text-[#C8F904] font-semibold">{BRAND_CONFIG.supportEmail}</dd>
                </div>
              </dl>
            </div>

            {/* Columns 2-5: Navigation Matrices */}
            {COLOPHON_COLUMNS.map((col) => (
              <div key={col.code} className="lg:col-span-2 py-10 md:px-5 first:pl-0 last:pr-0">
                <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#C8F904] mb-1">
                  {col.code}
                </div>
                <h3 className="font-mono text-xs font-bold uppercase tracking-[0.1em] text-[#F4F1EA] mb-4">
                  {col.title}
                </h3>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-xs text-[#CFCAC0] hover:text-[#C8F904] transition-colors inline-flex items-center gap-1"
                      >
                        <span>{link.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Legal & Technical Coordinates */}
      <div className="container-wide py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.14em] text-[#9E998E]">
        <div>
          © {new Date().getFullYear()} {BRAND_CONFIG.name} ({BRAND_CONFIG.domain}). ALL RIGHTS
          RESERVED.
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <span>SYSTEM: THE BUSINESS INDEX v2.4</span>
          <span className="text-[#52514E]">//</span>
          <span>ZERO FABRICATED METRICS</span>
          <span className="text-[#52514E]">//</span>
          <span className="text-[#C8F904]">STATUS: OPERATIONAL</span>
        </div>
      </div>
    </footer>
  );
}

export const PublicFooter = MarketingFooter;

