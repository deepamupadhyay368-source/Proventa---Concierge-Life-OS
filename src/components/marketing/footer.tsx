import Link from 'next/link';
import { BRAND_CONFIG } from '@/lib/brand';

const footerNavigation = {
  explore: [
    { href: '/businesses', label: 'Business Directory' },
    { href: '/listings', label: 'Products & Services' },
    { href: '/#categories', label: 'Browse Categories' },
    { href: '/enquiries/new', label: 'Post a Customer Enquiry' },
  ],
  forBusinesses: [
    { href: '/business/register', label: 'List Your Business' },
    { href: '/for-businesses', label: 'For Businesses Overview' },
    { href: '/business/dashboard', label: 'Business Owner Portal' },
    { href: '/pricing', label: 'Platform Access & Plans' },
    { href: '/guidelines', label: 'Verification & Trust Standards' },
  ],
  company: [
    { href: '/about', label: 'About PROVENTA' },
    { href: '/how-it-works', label: 'How PROVENTA Works' },
    { href: '/faq', label: 'Frequently Asked Questions' },
    { href: '/contact', label: 'Contact & Support' },
  ],
  legal: [
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms of Service' },
    { href: '/cookies', label: 'Cookie Policy' },
    { href: '/data-deletion', label: 'Data & Account Deletion' },
  ],
};

export function MarketingFooter() {
  return (
    <footer className="border-t border-[#E8E9ED] bg-[#FFFFFF] text-[#15171B]">
      <div className="container-wide py-14 lg:py-16">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Column 1: Brand & Short Description */}
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-[#15171B] text-[13px] font-bold text-white">
                P
              </span>
              <span className="text-[17px] font-bold tracking-[-0.03em] text-[#15171B]">
                {BRAND_CONFIG.name}
              </span>
            </Link>
            <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[#304FFE]">
              {BRAND_CONFIG.tagline}
            </p>
            <p className="text-[14px] text-[#696D76] leading-relaxed max-w-sm">
              {BRAND_CONFIG.supportingStatement} Discover verified businesses, explore structured product and service catalogs, and request tailored quotations across India.
            </p>
            <div className="pt-2 space-y-1 text-[13px] text-[#696D76]">
              <p>
                <span className="font-medium text-[#15171B]">Support:</span>{' '}
                <a
                  href={`mailto:${BRAND_CONFIG.supportEmail}`}
                  className="hover:text-[#304FFE] transition-colors"
                >
                  {BRAND_CONFIG.supportEmail}
                </a>
              </p>
              <p>
                <span className="font-medium text-[#15171B]">Coverage:</span>{' '}
                Gujarat &amp; pan-India business network
              </p>
            </div>
          </div>

          {/* Column 2: Explore */}
          <div className=" sm:col-span-6 md:col-span-3 lg:col-span-2">
            <h3 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#15171B] mb-4">
              Explore
            </h3>
            <ul className="space-y-2.5">
              {footerNavigation.explore.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[14px] text-[#696D76] hover:text-[#15171B] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: For Businesses */}
          <div className="sm:col-span-6 md:col-span-3 lg:col-span-2">
            <h3 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#15171B] mb-4">
              For Businesses
            </h3>
            <ul className="space-y-2.5">
              {footerNavigation.forBusinesses.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[14px] text-[#696D76] hover:text-[#15171B] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Company */}
          <div className="sm:col-span-6 md:col-span-3 lg:col-span-2">
            <h3 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#15171B] mb-4">
              Company
            </h3>
            <ul className="space-y-2.5">
              {footerNavigation.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[14px] text-[#696D76] hover:text-[#15171B] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 5: Legal & Privacy */}
          <div className="sm:col-span-6 md:col-span-3 lg:col-span-2">
            <h3 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#15171B] mb-4">
              Legal &amp; Privacy
            </h3>
            <ul className="space-y-2.5">
              {footerNavigation.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[14px] text-[#696D76] hover:text-[#15171B] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-[#E8E9ED] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-[13px] text-[#696D76]">
            &copy; {new Date().getFullYear()} {BRAND_CONFIG.name}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-[13px] text-[#696D76]">
            <span>Universal Business Discovery &amp; Enquiry Marketplace</span>
            <span className="hidden sm:inline text-[#E8E9ED]">•</span>
            <Link href="/customer/dashboard" className="hover:text-[#15171B] transition-colors">
              Customer Portal
            </Link>
            <span className="text-[#E8E9ED]">•</span>
            <Link href="/business/dashboard" className="hover:text-[#15171B] transition-colors">
              Business Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export { MarketingFooter as PublicFooter };
