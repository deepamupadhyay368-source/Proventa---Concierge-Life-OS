import Link from 'next/link';
import { BRAND_CONFIG } from '@/lib/brand';

const footerLinks = {
  discover: [
    { href: '/businesses', label: 'Explore Businesses' },
    { href: '/listings', label: 'Products & Services' },
    { href: '/enquiries/new', label: 'Post an Enquiry' },
    { href: '/how-it-works', label: 'How It Works' },
  ],
  businesses: [
    { href: '/business/register', label: 'Business registration' },
    { href: '/for-businesses', label: 'For Businesses' },
    { href: '/pricing', label: 'Plans & Pricing' },
    { href: '/business/dashboard', label: 'Business Dashboard' },
  ],
  companyAndSupport: [
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
    { href: '/guidelines', label: 'Community and marketplace guidelines' },
    { href: '/faq', label: 'Help and support' },
  ],
  legal: [
    { href: '/privacy', label: 'Privacy policy' },
    { href: '/terms', label: 'Terms of service' },
    { href: '/cookie-policy', label: 'Cookie policy' },
    { href: '/data-rights', label: 'Data rights' },
  ],
};

export function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container-wide py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-md bg-foreground text-background flex items-center justify-center font-display font-bold text-base">
                P
              </div>
              <span className="font-display text-xl font-bold text-foreground tracking-tight">
                {BRAND_CONFIG.name}
              </span>
            </div>
            <p className="text-sm font-semibold text-foreground mb-1">
              {BRAND_CONFIG.tagline}
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              {BRAND_CONFIG.supportingStatement}{' '}
              {BRAND_CONFIG.centralValueProposition}
            </p>
            <div className="mt-5 flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="px-2.5 py-1 rounded-full bg-secondary border border-border text-foreground font-medium">
                Gujarat &amp; Pan-India
              </span>
              <span className="px-2.5 py-1 rounded-full bg-secondary border border-border">
                B2B &amp; B2C Discovery
              </span>
              <span className="px-2.5 py-1 rounded-full bg-secondary border border-border">
                Verified Storefronts
              </span>
            </div>
          </div>

          {/* Marketplace Discovery */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Marketplace
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.discover.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Businesses */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              For Businesses
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.businesses.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company, Guidelines & Legal */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Platform &amp; Policies
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.companyAndSupport.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
              {footerLinks.legal.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} {BRAND_CONFIG.name}. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            {BRAND_CONFIG.tagline} &middot; Universal Business Discovery &amp; Enquiry Marketplace
          </p>
        </div>
      </div>
    </footer>
  );
}

export const PublicFooter = MarketingFooter;

