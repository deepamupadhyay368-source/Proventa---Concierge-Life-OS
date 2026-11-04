import Link from 'next/link';
import { ShieldCheck, Truck, Building2, CheckCircle2 } from 'lucide-react';
import { BRAND_CONFIG } from '@/lib/brand';

const FOOTER_SECTIONS = [
  {
    title: 'Categories',
    links: [
      { label: 'Building Materials (Cement & Steel)', href: '/categories#building-materials' },
      { label: 'Electrical Supplies & Cables', href: '/categories#electrical' },
      { label: 'Plumbing & Water Systems', href: '/categories#plumbing' },
      { label: 'Tiles, Marble & Flooring', href: '/categories#tiles-flooring' },
      { label: 'Finishing & Waterproofing', href: '/categories#finishing-materials' },
      { label: 'Doors, Windows & Hardware', href: '/categories#doors-windows' },
    ],
  },
  {
    title: 'Platform',
    links: [
      { label: 'Post Requirement (RFQ)', href: '/rfq/new' },
      { label: 'How It Works (6-Step Engine)', href: '/how-it-works' },
      { label: 'For Contractors & Builders', href: '/for-buyers' },
      { label: 'For Material Suppliers', href: '/for-suppliers' },
      { label: 'Quotation Comparison Tool', href: '/buyer/dashboard' },
      { label: 'Delivery Tracking System', href: '/logistics/deliveries' },
    ],
  },
  {
    title: 'Portals & Legal',
    links: [
      { label: 'Buyer Dashboard', href: '/buyer/dashboard' },
      { label: 'Supplier Portal & Onboarding', href: '/supplier/register' },
      { label: 'Logistics Partner Portal', href: '/logistics/deliveries' },
      { label: 'Admin Procurement Desk', href: '/admin/procurement' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Privacy Policy', href: '/privacy' },
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
              <div className="w-9 h-9 bg-[#F25C05] text-[#FFFFFF] flex items-center justify-center font-heading font-black text-base rounded-xs shadow-sm">
                P
              </div>
              <span className="font-heading text-xl uppercase font-black text-[#F4F6FA] tracking-wider">
                {BRAND_CONFIG.name}
              </span>
            </div>
            <p className="text-sm text-[#C5CAD3] max-w-sm leading-relaxed">
              Digital construction procurement network connecting contractors, builders, and individual buyers with verified material suppliers through competitive quotations and coordinated site delivery.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-mono text-[#858D9B]">
              <span className="flex items-center gap-1.5 text-[#C5CAD3]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#F25C05]" /> 100% GST Verified
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 text-[#C5CAD3]">
                <Truck className="w-3.5 h-3.5 text-[#F25C05]" /> Tracked Site Delivery
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 text-[#C5CAD3]">
                <Building2 className="w-3.5 h-3.5 text-[#F25C05]" /> Ahmedabad & Gujarat
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
                      className="text-[#C5CAD3] hover:text-[#F25C05] transition-colors"
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
            © 2026 {BRAND_CONFIG.name} — Construction Procurement Platform. Ahmedabad, Gujarat, India.
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#F25C05] font-semibold">Require. Compare. Select. Deliver.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export const PublicFooter = MarketingFooter;
