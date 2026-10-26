import Link from 'next/link';
import type { Metadata } from 'next';
import {
  Building2,
  CheckCircle2,
  ArrowRight,
  Layers,
  Target,
  BarChart3,
  ShieldCheck,
} from 'lucide-react';
import { BRAND_CONFIG, BUSINESS_SUBSCRIPTION_PLANS } from '@/lib/brand';

export const metadata: Metadata = {
  title: 'For Businesses — Digital Storefronts & Enquiry Marketplace',
  description:
    'Create your digital storefront on PROVENTA, showcase your products and services, and receive matched customer enquiries across Gujarat and India.',
};

export default function ForBusinessesPage() {
  const plans = Object.values(BUSINESS_SUBSCRIPTION_PLANS);

  return (
    <div className="pt-20 md:pt-24 pb-20 bg-background">
      {/* Hero */}
      <section className="border-b border-border bg-card py-16 md:py-24">
        <div className="container-wide text-center max-w-4xl mx-auto">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-secondary border border-border text-foreground mb-5">
            <Building2 className="w-3.5 h-3.5 text-primary" />
            Built for Manufacturers, Agencies, Retailers, Consultants &amp; Suppliers
          </span>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-foreground tracking-tight">
            Make your business discoverable.
          </h1>
          <p className="mt-5 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Create your digital storefront, list your products and services, and
            receive relevant customer enquiries on {BRAND_CONFIG.name}. Start with a
            free storefront and scale as you grow.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/business/register"
              className="inline-flex items-center gap-2 bg-foreground text-background font-semibold px-6 py-3.5 rounded-lg hover:bg-foreground/90 transition-colors"
            >
              Create Your Business Profile
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/business/dashboard"
              className="inline-flex items-center gap-2 border border-border bg-background text-foreground font-medium px-6 py-3.5 rounded-lg hover:bg-secondary transition-colors"
            >
              Open Business Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Core Capabilities */}
      <section className="py-16 md:py-24 border-b border-border">
        <div className="container-wide">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-card border border-border rounded-xl p-6">
              <Building2 className="w-7 h-7 text-primary mb-4" />
              <h2 className="font-display text-lg font-bold text-foreground">
                Shareable Digital Storefront
              </h2>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Get a clean, SEO-indexed `/business/[slug]` page showcasing your
                brand, service areas, operating hours, and honest verification
                status.
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <Layers className="w-7 h-7 text-primary mb-4" />
              <h2 className="font-display text-lg font-bold text-foreground">
                Product &amp; Service Catalog
              </h2>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Publish offerings with fixed pricing, indicative ranges, price on
                request, or custom quote requirements.
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <Target className="w-7 h-7 text-primary mb-4" />
              <h2 className="font-display text-lg font-bold text-foreground">
                Intelligent Enquiry Matching
              </h2>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Receive deduplicated notifications when customers post requirements
                matching your category, specialties, and cities served.
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <BarChart3 className="w-7 h-7 text-primary mb-4" />
              <h2 className="font-display text-lg font-bold text-foreground">
                Structured Quotations &amp; Analytics
              </h2>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Send professional proposals with timelines, validity, and terms, and
                track views, shortlists, and accepted quotes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Freemium Plans */}
      <section className="py-16 md:py-24">
        <div className="container-wide">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Transparent Freemium Pricing
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mt-1">
              Plans Built for Every Stage of Business Growth
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Every business can register and publish a digital storefront for free.
              Upgrade to Pro or Premium for higher listing limits, more monthly
              quotation responses, and multi-user team collaboration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan) => {
              const isHighlighted = plan.tier === 'PRO';
              return (
                <div
                  key={plan.tier}
                  className={`rounded-2xl p-7 flex flex-col justify-between border ${
                    isHighlighted
                      ? 'bg-foreground text-background border-foreground shadow-lg'
                      : 'bg-card text-foreground border-border'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider">
                        {plan.name}
                      </span>
                      {isHighlighted && (
                        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-background/15 text-background font-semibold">
                          Most Popular
                        </span>
                      )}
                    </div>

                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="font-display text-4xl font-bold">
                        ₹{plan.monthlyPriceInr.toLocaleString('en-IN')}
                      </span>
                      <span
                        className={`text-xs ${
                          isHighlighted ? 'text-background/70' : 'text-muted-foreground'
                        }`}
                      >
                        / month
                      </span>
                    </div>

                    <p
                      className={`text-xs mt-3 leading-relaxed ${
                        isHighlighted ? 'text-background/80' : 'text-muted-foreground'
                      }`}
                    >
                      {plan.description}
                    </p>

                    <ul className="mt-6 space-y-2.5 text-xs">
                      {plan.features.map((feat) => (
                        <li key={feat} className="flex items-start gap-2">
                          <CheckCircle2
                            className={`w-4 h-4 shrink-0 mt-0.5 ${
                              isHighlighted ? 'text-emerald-400' : 'text-emerald-600'
                            }`}
                          />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-8">
                    <Link
                      href={`/business/register?plan=${plan.tier}`}
                      className={`w-full inline-flex items-center justify-center gap-1.5 text-sm font-semibold px-4 py-3 rounded-lg transition-colors ${
                        isHighlighted
                          ? 'bg-background text-foreground hover:bg-background/90'
                          : 'bg-foreground text-background hover:bg-foreground/90'
                      }`}
                    >
                      {plan.monthlyPriceInr === 0
                        ? 'Start Free Storefront'
                        : `Choose ${plan.name}`}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-10 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>
              Verification badges are awarded based on contact and document review —
              never sold as a paid claim without review.
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
