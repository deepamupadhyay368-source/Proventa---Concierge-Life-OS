import Link from 'next/link';
import { ShieldCheck, Truck, Building2 } from 'lucide-react';
import { BRAND_CONFIG } from '@/lib/brand';

const FOOTER_SECTIONS = [
  {
    title: 'Materials',
    links: [
      { label: 'Building Materials (Cement & Steel)', href: '/categories#building-materials' },
      { label: 'Electrical Supplies & Cables', href: '/categories#electrical' },
      { label: 'Plumbing & Water Systems', href: '/categories#plumbing' },
      { label: 'Tiles, Marble & Flooring', href: '/categories#tiles-flooring' },
      { label: 'Finishing & Chemicals', href: '/categories#finishing-materials' },
      { label: 'Doors, Windows & Hardware', href: '/categories#doors-windows' },
    ],
  },
  {
    title: 'Platform',
    links: [
      { label: 'Post a requirement', href: '/rfq/new' },
      { label: 'How it works', href: '/how-it-works' },
      { label: 'For buyers', href: '/for-buyers' },
      { label: 'For suppliers', href: '/for-suppliers' },
      { label: 'Buyer Dashboard', href: '/buyer/dashboard' },
      { label: 'Supplier Portal', href: '/supplier/dashboard' },
    ],
  },
  {
    title: 'Infrastructure & Portals',
    links: [
      { label: 'Quotation Comparison Tool', href: '/buyer/dashboard' },
      { label: 'Delivery Tracking Desk', href: '/logistics/deliveries' },
      { label: 'Admin Procurement Desk', href: '/admin/procurement' },
      { label: 'Supplier Onboarding', href: '/supplier/register' },
      { label: 'Terms of Procurement', href: '/terms' },
      { label: 'Privacy Policy', href: '/privacy' },
    ],
  },
];

export function MarketingFooter() {
  return (
    <footer className="bg-[#191B20] text-[#F1F2F4] border-t border-[#414957] font-sans">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand Column (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#536B88] text-[#FFFFFF] flex items-center justify-center font-mono font-bold text-sm rounded-sm">
                P
              </div>
              <span className="font-heading text-xl uppercase font-black text-[#F1F2F4] tracking-wider">
                {BRAND_CONFIG.name}
              </span>
            </div>
            <p className="text-sm text-[#A8ADB7] max-w-sm leading-relaxed">
              Construction Procurement Platform. A smarter way to source construction materials, compare supplier quotations and coordinate deliveries across India.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-mono text-[#A8ADB7]">
              <span className="flex items-center gap-1.5 text-[#F1F2F4]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#536B88]" /> 100% GST Verified
              </span>
              <span className="text-[#414957]">•</span>
              <span className="flex items-center gap-1.5 text-[#F1F2F4]">
                <Truck className="w-3.5 h-3.5 text-[#536B88]" /> Tracked Site Delivery
              </span>
              <span className="text-[#414957]">•</span>
              <span className="flex items-center gap-1.5 text-[#F1F2F4]">
                <Building2 className="w-3.5 h-3.5 text-[#536B88]" /> Gujarat Network
              </span>
            </div>
          </div>

          {/* Links Columns (3 cols) */}
          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title} className="space-y-4">
              <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-[#F1F2F4]">
                {section.title}
              </h3>
              <ul className="space-y-2.5 text-xs">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[#A8ADB7] hover:text-[#FFFFFF] transition-colors"
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
        <div className="mt-16 pt-8 border-t border-[#414957] flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-[#A8ADB7]">
          <div>
            © 2026 {BRAND_CONFIG.name} — Construction Procurement Platform. Ahmedabad, Gujarat, India.
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#C66A42] font-semibold">Require. Compare. Select. Deliver.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export const PublicFooter = MarketingFooter;
