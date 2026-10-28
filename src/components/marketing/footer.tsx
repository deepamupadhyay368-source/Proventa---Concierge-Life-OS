import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { BRAND_CONFIG } from '@/lib/brand';

const FOOTER_SECTIONS = [
  {
    code: '01 // DISCOVERY',
    title: 'Platform',
    links: [
      { label: 'Explore Businesses', href: '/businesses' },
      { label: 'Products Catalog', href: '/listings?type=PRODUCT' },
      { label: 'Services Directory', href: '/listings?type=SERVICE' },
      { label: 'All 18 Industries', href: '/#industries' },
      { label: 'Post Buyer Enquiry', href: '/enquiries/new' },
    ],
  },
  {
    code: '02 // FOR BUSINESSES',
    title: 'Growth & Storefronts',
    links: [
      { label: 'List Your Business', href: '/business/register' },
      { label: 'Why PROVENTA', href: '/for-businesses' },
      { label: 'Business Console', href: '/business/dashboard' },
      { label: 'How PROVENTA Works', href: '/how-it-works' },
    ],
  },
  {
    code: '03 // ACCOUNTS',
    title: 'Access & Workspace',
    links: [
      { label: 'Sign In', href: '/sign-in' },
      { label: 'Create Account', href: '/sign-up' },
      { label: 'Customer Dashboard', href: '/dashboard' },
      { label: 'Contact Support', href: '/contact' },
    ],
  },
  {
    code: '04 // GOVERNANCE',
    title: 'Trust & Legal',
    links: [
      { label: 'About PROVENTA', href: '/about' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Trust & Security', href: '/trust' },
    ],
  },
];

export function MarketingFooter() {
  return (
    <footer className="bg-[#171A14] text-[#F6F0E4] border-t border-[#4C4A40]">
      {/* Architectural Editorial Banner */}
      <div className="border-b border-[#4C4A40]/80">
        <div className="container-wide py-14 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
            <div className="lg:col-span-7">
              <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#A98253] mb-4">
                PROVENTA // EVERY BUSINESS. ONE PLACE.
              </div>
              <h2 className="font-display text-4xl sm:text-6xl lg:text-7xl font-normal tracking-tight text-[#F6F0E4] leading-[0.95]">
                Business{' '}
                <span className="italic text-[#B94E2D]">without limits.</span>
              </h2>
              <p className="mt-4 text-sm sm:text-base text-[#A7A194] max-w-xl">
                The complete business discovery and opportunity platform. Discover. Connect.
                Collaborate. Grow.
              </p>
            </div>

            <div className="lg:col-span-5 flex flex-col sm:flex-row lg:justify-end gap-3.5">
              <Link
                href="/business/register"
                className="inline-flex items-center justify-between gap-4 rounded-[2px] bg-[#B94E2D] px-6 py-4 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-[#F6F0E4] transition-colors hover:bg-[#A14122]"
              >
                <span>List Your Business</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link
                href="/enquiries/new"
                className="inline-flex items-center justify-between gap-4 rounded-[2px] border border-[#4C4A40] bg-[#20211C] px-6 py-4 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-[#F6F0E4] transition-colors hover:border-[#F5F0E5]"
              >
                <span>Post an Enquiry</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Structured 5-Column Directory */}
      <div className="border-b border-[#4C4A40]/80">
        <div className="container-wide">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-[#4C4A40]/70">
            <div className="lg:col-span-4 py-12 pr-0 md:pr-8">
              <div className="font-serif text-2xl tracking-[0.18em] uppercase text-[#F6F0E4]">
                {BRAND_CONFIG.name}
              </div>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#A98253]">
                Discover. Connect. Collaborate. Grow.
              </p>
              <p className="mt-4 text-xs leading-relaxed text-[#A7A194] max-w-sm">
                A universal platform where businesses showcase their products and services,
                customers discover verified providers across 18 industries, and buyers receive
                tailored quotations.
              </p>
              <div className="mt-6 pt-5 border-t border-[#4C4A40]/60 font-mono text-[11px] text-[#A7A194] space-y-1">
                <div>EDITION: INDIA &amp; GLOBAL TRADE</div>
                <div className="text-[#F6F0E4]">{BRAND_CONFIG.supportEmail}</div>
              </div>
            </div>

            {FOOTER_SECTIONS.map((sec) => (
              <div
                key={sec.code}
                className="lg:col-span-2 py-12 md:px-6 first:pl-0 last:pr-0"
              >
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#A98253] mb-1.5">
                  {sec.code}
                </div>
                <h3 className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-[#F6F0E4] mb-4">
                  {sec.title}
                </h3>
                <ul className="space-y-2.5">
                  {sec.links.map((link) => (
                    <li key={link.href + link.label}>
                      <Link
                        href={link.href}
                        className="text-xs text-[#A7A194] hover:text-[#F6F0E4] transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Legal Bar */}
      <div className="container-wide py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.18em] text-[#A7A194]">
        <div>
          © {new Date().getFullYear()} {BRAND_CONFIG.name} ({BRAND_CONFIG.domain}). All rights
          reserved.
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <span>Every Business. One Place.</span>
          <span className="text-[#4C4A40]">|</span>
          <span className="text-[#B94E2D]">Business without limits.</span>
        </div>
      </div>
    </footer>
  );
}

export const PublicFooter = MarketingFooter;
