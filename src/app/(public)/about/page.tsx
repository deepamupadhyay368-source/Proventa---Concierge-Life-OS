import type { Metadata } from 'next';
import Link from 'next/link';
import { Building2, ArrowRight, Globe, ShieldCheck, Handshake } from 'lucide-react';
import { BRAND_CONFIG } from '@/lib/brand';

export const metadata: Metadata = {
  title: `About ${BRAND_CONFIG.name} — ${BRAND_CONFIG.tagline}`,
  description: `${BRAND_CONFIG.supportingStatement} ${BRAND_CONFIG.centralValueProposition}`,
};

export default function AboutPage() {
  return (
    <div className="pt-20 md:pt-24 pb-20 min-h-screen bg-background">
      <div className="container-wide max-w-4xl">
        <span className="text-xs font-semibold uppercase tracking-wider text-primary">
          About {BRAND_CONFIG.name}
        </span>
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mt-1">
          {BRAND_CONFIG.tagline}
        </h1>
        <p className="text-lg text-muted-foreground mt-4 leading-relaxed">
          {BRAND_CONFIG.supportingStatement}{' '}
          {BRAND_CONFIG.centralValueProposition}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          <div className="bg-card border border-border rounded-xl p-6">
            <Globe className="w-6 h-6 text-primary mb-3" />
            <h2 className="font-display text-lg font-bold text-foreground">
              Universal Discovery
            </h2>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
              Whether a business sells industrial machinery, construction
              materials, software services, legal consulting, or retail products,
              PROVENTA gives it a structured, searchable digital storefront.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <Handshake className="w-6 h-6 text-primary mb-3" />
            <h2 className="font-display text-lg font-bold text-foreground">
              Enquiry &amp; Quotation Engine
            </h2>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
              Customers post what they need once. Our deterministic matching
              engine notifies relevant businesses by category, specialty, and
              service area so customers can compare structured quotes.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <ShieldCheck className="w-6 h-6 text-primary mb-3" />
            <h2 className="font-display text-lg font-bold text-foreground">
              Honest Verification
            </h2>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
              We never fabricate business listings or claim a business is legally
              verified merely because it registered. Verification badges reflect
              real contact and document review.
            </p>
          </div>
        </div>

        <div className="mt-12 bg-card border border-border rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">
              Ready to join {BRAND_CONFIG.name}?
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Explore published businesses across Gujarat and India or register
              your own storefront.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <Link
              href="/businesses"
              className="inline-flex items-center gap-1.5 bg-foreground text-background text-sm font-semibold px-5 py-2.5 rounded-lg"
            >
              Explore Businesses
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/business/register"
              className="inline-flex items-center gap-1.5 border border-border bg-background text-foreground text-sm font-medium px-5 py-2.5 rounded-lg"
            >
              <Building2 className="w-4 h-4" />
              Register Business
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
