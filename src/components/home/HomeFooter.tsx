import Link from 'next/link';

const FOOTER_LINKS = {
  Company: [
    { label: 'About PROVENTA', href: '/about' },
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'Service Areas', href: '/service-areas' },
    { label: 'Societies', href: '/societies' },
    { label: 'Become a Partner', href: '/partners' },
  ],
  Services: [
    { label: 'All Services', href: '/services' },
    { label: 'Membership Plans', href: '/membership' },
    { label: 'Join PROVENTA', href: '/join' },
    { label: 'FAQ', href: '/faq' },
  ],
  Legal: [
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Refund Policy', href: '/refund-policy' },
  ],
  Contact: [
    { label: 'hello@proventa.in', href: 'mailto:hello@proventa.in' },
    { label: 'Contact Us', href: '/contact' },
  ],
};

export function HomeFooter() {
  return (
    <footer className="border-t border-[#E5E3DB] bg-[#F2F0E9]">
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <div className="mb-4">
              <span className="font-display text-2xl font-bold text-[#171A17]">PROVENTA</span>
              <p className="text-xs font-medium uppercase tracking-widest text-[#53634A]">Home</p>
            </div>
            <p className="text-sm text-[#6B7280] leading-relaxed max-w-xs">
              Your Home. Always Taken Care Of.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#53634A]">
                {heading}
              </h4>
              <ul className="flex flex-col gap-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-[#6B7280] hover:text-[#53634A] transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-[#E5E3DB] pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#9CA3AF]">
            &copy; {new Date().getFullYear()} PROVENTA Technologies Pvt. Ltd. All rights reserved.
          </p>
          <p className="text-xs text-[#9CA3AF]">
            Payments processed in sandbox mode. No real transactions occur.
          </p>
        </div>
      </div>
    </footer>
  );
}
