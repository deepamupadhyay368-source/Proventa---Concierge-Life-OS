import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, CheckCircle2, AlertTriangle } from 'lucide-react';
import { BRAND_CONFIG } from '@/lib/brand';

export const metadata: Metadata = {
  title: 'Community & Marketplace Guidelines',
  description:
    'Standards for honest business profiles, accurate product/service listings, respectful customer enquiries, and transparent verification on PROVENTA.',
};

export default function MarketplaceGuidelinesPage() {
  return (
    <div className="pt-20 md:pt-24 pb-20 min-h-screen bg-background">
      <div className="container-wide max-w-4xl">
        <div className="mb-10">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            <ShieldCheck className="w-3.5 h-3.5" />
            Trust, Safety &amp; Transparency
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mt-1">
            {BRAND_CONFIG.name} Community &amp; Marketplace Guidelines
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">
            {BRAND_CONFIG.name} connects businesses and customers across industries.
            These guidelines ensure every storefront, listing, enquiry, and
            quotation remains accurate, lawful, and trustworthy.
          </p>
        </div>

        <div className="space-y-6">
          <section className="bg-card border border-border rounded-xl p-6 sm:p-8">
            <h2 className="font-display text-xl font-bold text-foreground mb-3">
              1. Honest Business Representation &amp; Verification
            </h2>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Businesses must provide accurate legal or trade names, operating
                  locations, categories, and service areas.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Registration alone sets a profile to{' '}
                  <strong className="text-foreground">Self-Reported</strong>. Higher
                  verification badges (<strong className="text-foreground">Contact Verified</strong>,{' '}
                  <strong className="text-foreground">Document Reviewed</strong>, and{' '}
                  <strong className="text-foreground">Verified Business</strong>)
                  require actual verification steps and moderation review.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Impersonating another company, trademark, or government authority
                  results in immediate profile suspension.
                </span>
              </li>
            </ul>
          </section>

          <section className="bg-card border border-border rounded-xl p-6 sm:p-8">
            <h2 className="font-display text-xl font-bold text-foreground mb-3">
              2. Product &amp; Service Listing Standards
            </h2>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Clearly state whether a price is a{' '}
                  <strong className="text-foreground">Fixed Price</strong>,{' '}
                  <strong className="text-foreground">Indicative Price</strong>,{' '}
                  <strong className="text-foreground">Price on Request</strong>, or{' '}
                  <strong className="text-foreground">Quote Required</strong>.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Do not list illegal, counterfeit, hazardous, or prohibited goods or
                  services under Indian law.
                </span>
              </li>
            </ul>
          </section>

          <section className="bg-card border border-border rounded-xl p-6 sm:p-8">
            <h2 className="font-display text-xl font-bold text-foreground mb-3">
              3. Customer Enquiries, Quotations &amp; Privacy
            </h2>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Customers should post genuine product or service requirements with
                  clear specifications and locations.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Businesses must submit relevant, good-faith quotations with honest
                  delivery timelines, validity periods, and exclusions.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Unsolicited spam, scraping customer or business contact details, or
                  abusive communication is strictly prohibited.
                </span>
              </li>
            </ul>
          </section>
        </div>

        <div className="mt-8 flex items-center justify-between bg-secondary/40 border border-border rounded-xl p-5 text-xs text-muted-foreground">
          <span>
            Need to report a suspicious storefront, listing, or enquiry? Use the
            report button or contact our moderation team.
          </span>
          <Link
            href="/contact"
            className="font-semibold text-foreground hover:underline shrink-0 ml-4"
          >
            Contact Moderation &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
