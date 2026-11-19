import Link from 'next/link';
import { ShieldCheck, Truck, Building2, ArrowUpRight } from 'lucide-react';
import { BRAND_CONFIG } from '@/lib/brand';

const FOOTER_SECTIONS = [
  {
    title: 'Platform',
    links: [
      { label: 'Start Procuring', href: '/rfq/new' },
      { label: 'How It Works', href: '/how-it-works' },
      { label: 'Supplier Discovery', href: '/suppliers' },
      { label: 'Buyer Dashboard', href: '/buyer/dashboard' },
      { label: 'Supplier Portal', href: '/supplier/dashboard' },
      { label: 'Payment Intelligence', href: '/payment-intelligence' },
    ],
  },
  {
    title: 'Materials & Taxonomy',
    links: [
      { label: 'Steel & TMT Rebars', href: '/categories#steel-metals' },
      { label: 'Cement & Concrete', href: '/categories#cement-concrete' },
      { label: 'Crushed Aggregates & Sand', href: '/categories#building-materials' },
      { label: 'Pipes & Drainage Systems', href: '/categories#pipes-plumbing' },
      { label: 'Electrical Cables & Switchgear', href: '/categories#electrical' },
      { label: 'Construction Chemicals', href: '/categories#chemicals' },
    ],
  },
  {
    title: 'Suppliers & Trust',
    links: [
      { label: 'Become a Supplier', href: '/supplier/register' },
      { label: 'Supplier Verification', href: '/settings/business-profile?tab=tax' },
      { label: 'Landed Cost Matrix', href: '/how-it-works#comparison' },
      { label: 'Corridor Logistics Hubs', href: '/about#corridors' },
      { label: 'Terms of Procurement', href: '/terms' },
      { label: 'Privacy Policy', href: '/privacy' },
    ],
  },
  {
    title: 'Corporate & Contact',
    links: [
      { label: 'About PROVENTA', href: '/about' },
      { label: 'Commercial Desk', href: '/contact' },
      { label: 'Compliance & Audits', href: '/legal/security' },
      { label: 'Payment Governance', href: '/legal/payments' },
      { label: 'Grievance Redressal', href: '/legal/grievance' },
    ],
  },
];

export function MarketingFooter() {
  return (
    <footer className="bg-[#FFFFFF] text-[#243447] border-t border-[#E2E8EF] font-sans">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">
          {/* Brand Column (2 cols) */}
          <div className="lg:col-span-2 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#315F91] text-[#FFFFFF] flex items-center justify-center font-mono font-bold text-sm rounded-xs">
                P
              </div>
              <div className="flex flex-col">
                <span className="font-heading text-lg uppercase font-black text-[#243447] tracking-[0.16em] leading-none">
                  {BRAND_CONFIG.name}
                </span>
                <span className="text-[10px] font-mono tracking-wider text-[#6B7785] uppercase">
                  Industrial Procurement
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#6B7785] max-w-sm leading-relaxed">
              Industrial procurement platform connecting builders, contractors, developers, and certified material suppliers through unified digital requirements, transparent quotations, and verifiable payment intelligence.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-mono text-[#6B7785]">
              <span className="flex items-center gap-1.5 text-[#243447] font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-[#315F91]" /> GST &amp; BIS Verified
              </span>
              <span className="text-[#AEBBC6]">•</span>
              <span className="flex items-center gap-1.5 text-[#243447] font-medium">
                <Truck className="w-3.5 h-3.5 text-[#315F91]" /> Tracked Logistics
              </span>
              <span className="text-[#AEBBC6]">•</span>
              <span className="flex items-center gap-1.5 text-[#243447] font-medium">
                <Building2 className="w-3.5 h-3.5 text-[#315F91]" /> Gujarat &amp; PAN India
              </span>
            </div>
          </div>

          {/* Links Columns (4 cols) */}
          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title} className="space-y-4">
              <h3 className="font-heading font-semibold text-xs uppercase tracking-wider text-[#243447]">
                {section.title}
              </h3>
              <ul className="space-y-2.5 text-xs">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[#6B7785] hover:text-[#315F91] transition-colors inline-flex items-center gap-1"
                    >
                      <span>{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-[#E2E8EF] flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-[#6B7785]">
          <div>
            © 2026 {BRAND_CONFIG.name} — Industrial Procurement Platform. Ahmedabad, Gujarat, India.
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[#315F91] font-semibold">{BRAND_CONFIG.tagline}</span>
            <span className="text-[#AEBBC6]">|</span>
            <span className="text-[#6B7785]">ISO 9001:2015 Compliant Workflow</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export const PublicFooter = MarketingFooter;
