import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Search,
  Send,
  Handshake,
  Building2,
  PlusCircle,
  ArrowRight,
} from 'lucide-react';
import { BRAND_CONFIG } from '@/lib/brand';

export const metadata: Metadata = {
  title: `How It Works | ${BRAND_CONFIG.name}`,
  description:
    'Learn how customers discover businesses, post enquiries, compare quotations, and how businesses grow on PROVENTA.',
};

export default function HowItWorksPage() {
  return (
    <div className="pt-20 md:pt-24 pb-20 min-h-screen bg-background">
      <div className="container-wide max-w-5xl">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            Platform Workflow
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mt-1">
            How {BRAND_CONFIG.name} Works
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground mt-3">
            {BRAND_CONFIG.centralValueProposition}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
          <div className="bg-card border border-border rounded-xl p-7">
            <Search className="w-7 h-7 text-primary mb-4" />
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              1. Discover Businesses
            </div>
            <h2 className="font-display text-xl font-bold text-foreground mt-1">
              Search by Industry, Offering, or City
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
              Browse 18 universal industry categories, inspect digital
              storefronts, check verification badges, and compare products and
              services with clear pricing modes.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-7">
            <Send className="w-7 h-7 text-primary mb-4" />
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              2. Post What You Need
            </div>
            <h2 className="font-display text-xl font-bold text-foreground mt-1">
              Submit a Structured Requirement
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
              Post a customer enquiry with your category, city, budget range, and
              timeline. Our matching engine scores and notifies eligible
              published businesses while protecting your contact privacy.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-7">
            <Handshake className="w-7 h-7 text-primary mb-4" />
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              3. Connect &amp; Grow
            </div>
            <h2 className="font-display text-xl font-bold text-foreground mt-1">
              Compare Quotations &amp; Move Forward
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
              Matched businesses respond with structured quotations including
              pricing, delivery timelines, validity, and terms. Shortlist or
              accept the best offer directly from your dashboard.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/businesses"
            className="inline-flex items-center gap-2 bg-foreground text-background font-semibold text-sm px-6 py-3 rounded-lg"
          >
            Explore Businesses
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/enquiries/new"
            className="inline-flex items-center gap-2 border border-border bg-card text-foreground font-medium text-sm px-6 py-3 rounded-lg"
          >
            <PlusCircle className="w-4 h-4" />
            Post an Enquiry
          </Link>
          <Link
            href="/business/register"
            className="inline-flex items-center gap-2 border border-border bg-card text-foreground font-medium text-sm px-6 py-3 rounded-lg"
          >
            <Building2 className="w-4 h-4" />
            Register Your Business
          </Link>
        </div>
      </div>
    </div>
  );
}
