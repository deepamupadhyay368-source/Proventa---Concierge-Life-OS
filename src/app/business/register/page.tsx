'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Building2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { BRAND_CONFIG, INITIAL_MARKETPLACE_CATEGORIES } from '@/lib/brand';
import { MarketingNav } from '@/components/marketing/nav';
import { MarketingFooter } from '@/components/marketing/footer';

export default function BusinessRegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [legalName, setLegalName] = useState('');
  const [slug, setSlug] = useState('');
  const [tagline, setTagline] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [businessType, setBusinessType] = useState<'PRODUCT' | 'SERVICE' | 'HYBRID'>('HYBRID');
  const [primaryCategoryId, setPrimaryCategoryId] = useState(
    INITIAL_MARKETPLACE_CATEGORIES[0].slug,
  );
  const [city, setCity] = useState('Ahmedabad');
  const [state, setState] = useState('Gujarat');
  const [area, setArea] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [serviceAreasText, setServiceAreasText] = useState('Ahmedabad, Gandhinagar');
  const [servesPanIndia, setServesPanIndia] = useState(false);
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [website, setWebsite] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [yearEstablished, setYearEstablished] = useState('');
  const [highlightsText, setHighlightsText] = useState('');
  const [tagsText, setTagsText] = useState('');
  const [publishImmediately, setPublishImmediately] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const serviceAreas = serviceAreasText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const highlights = highlightsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const tags = tagsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await fetch('/api/businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          legalName: legalName || undefined,
          slug: slug.trim() || undefined,
          tagline: tagline || undefined,
          shortDescription,
          description,
          businessType,
          primaryCategoryId,
          city,
          state,
          area: area || undefined,
          postalCode: postalCode || undefined,
          serviceAreas,
          servesPanIndia,
          contactEmail: contactEmail || undefined,
          contactPhone: contactPhone || undefined,
          whatsappNumber: whatsappNumber || undefined,
          website: website || undefined,
          gstNumber: gstNumber.trim().toUpperCase() || undefined,
          yearEstablished: yearEstablished ? Number(yearEstablished) : undefined,
          highlights,
          tags,
          publishImmediately,
        }),
      });

      const data = await res.json();
      if (res.status === 401) {
        router.push(
          `/sign-in?callbackUrl=${encodeURIComponent('/business/register')}`,
        );
        return;
      }

      if (!res.ok) {
        setError(data.message || data.error || 'Could not register business profile');
        setSubmitting(false);
        return;
      }

      router.push('/business/dashboard?onboarded=true');
    } catch {
      setError('A network error occurred. Please try again.');
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <MarketingNav />

      <main className="flex-1 pt-24 pb-20">
        <div className="container-wide max-w-4xl">
          <div className="mb-8">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
              <Building2 className="w-3.5 h-3.5" />
              Guided Storefront Onboarding
            </span>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mt-1">
              Create Your Business Storefront on {BRAND_CONFIG.name}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1.5">
              Set up your official digital storefront, select your industry
              categories and service areas, and start receiving matched customer
              enquiries.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-8"
          >
            {error && (
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Section 1: Business Identity */}
            <div className="space-y-4">
              <h2 className="font-display text-xl font-bold text-foreground border-b border-border pb-2">
                1. Business Identity &amp; Category
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Business / Brand Name *
                  </label>
                  <input
                    type="text"
                    required
                    minLength={2}
                    maxLength={120}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Apex Industrial Engineering"
                    className="w-full px-3.5 py-2.5 text-sm bg-background border border-border rounded-lg text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Registered Legal Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={legalName}
                    onChange={(e) => setLegalName(e.target.value)}
                    placeholder="e.g., Apex Industrial Engineering Pvt. Ltd."
                    className="w-full px-3.5 py-2.5 text-sm bg-background border border-border rounded-lg text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Primary Category *
                  </label>
                  <select
                    value={primaryCategoryId}
                    onChange={(e) => setPrimaryCategoryId(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-background border border-border rounded-lg text-foreground"
                  >
                    {INITIAL_MARKETPLACE_CATEGORIES.map((cat) => (
                      <option key={cat.slug} value={cat.slug}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Business Type *
                  </label>
                  <select
                    value={businessType}
                    onChange={(e) =>
                      setBusinessType(
                        e.target.value as 'PRODUCT' | 'SERVICE' | 'HYBRID',
                      )
                    }
                    className="w-full px-3.5 py-2.5 text-sm bg-background border border-border rounded-lg text-foreground"
                  >
                    <option value="HYBRID">Product + Service (Hybrid)</option>
                    <option value="PRODUCT">Product / Manufacturer / Trader</option>
                    <option value="SERVICE">Service Provider / Agency / Consultant</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Custom URL Slug (Optional)
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) =>
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))
                    }
                    placeholder="apex-industrial-ahmedabad"
                    className="w-full px-3.5 py-2.5 text-sm bg-background border border-border rounded-lg text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Tagline (Optional)
                </label>
                <input
                  type="text"
                  maxLength={140}
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="Precision fabrication & turnkey automation across Gujarat"
                  className="w-full px-3.5 py-2.5 text-sm bg-background border border-border rounded-lg text-foreground"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Short Summary (15–300 chars) *
                </label>
                <input
                  type="text"
                  required
                  minLength={15}
                  maxLength={300}
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="Brief summary displayed on directory search cards…"
                  className="w-full px-3.5 py-2.5 text-sm bg-background border border-border rounded-lg text-foreground"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Full Business Description &amp; Capabilities (Min 30 chars) *
                </label>
                <textarea
                  rows={4}
                  required
                  minLength={30}
                  maxLength={5000}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your products, services, experience, industries served, and quality standards…"
                  className="w-full px-3.5 py-2.5 text-sm bg-background border border-border rounded-lg text-foreground"
                />
              </div>
            </div>

            {/* Section 2: Location & Service Areas */}
            <div className="space-y-4">
              <h2 className="font-display text-xl font-bold text-foreground border-b border-border pb-2">
                2. Location &amp; Service Coverage
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Primary City *
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg text-foreground"
                  >
                    {BRAND_CONFIG.initialCities.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Area / Locality
                  </label>
                  <input
                    type="text"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="e.g., Prahlad Nagar / GIDC Vatva"
                    className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    PIN Code
                  </label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="380015"
                    className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Cities / Regions Served (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={serviceAreasText}
                    onChange={(e) => setServiceAreasText(e.target.value)}
                    placeholder="Ahmedabad, Surat, Vadodara, Rajkot"
                    className="w-full px-3.5 py-2.5 text-sm bg-background border border-border rounded-lg text-foreground"
                  />
                </div>

                <div className="pt-4">
                  <label className="inline-flex items-center gap-2 text-sm font-medium text-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={servesPanIndia}
                      onChange={(e) => setServesPanIndia(e.target.checked)}
                      className="rounded border-border"
                    />
                    We also serve customers Pan-India (Delivery or Remote)
                  </label>
                </div>
              </div>
            </div>

            {/* Section 3: Contact, Credentials & Keywords */}
            <div className="space-y-4">
              <h2 className="font-display text-xl font-bold text-foreground border-b border-border pb-2">
                3. Contact Channels &amp; Business Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Business Email
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="contact@yourcompany.in"
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Business Phone (10-digit)
                  </label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://yourcompany.in"
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    GSTIN (Optional — 15 characters)
                  </label>
                  <input
                    type="text"
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value)}
                    placeholder="24AAAAA0000A1Z5"
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Year Established (Optional)
                  </label>
                  <input
                    type="number"
                    min="1900"
                    max={new Date().getFullYear()}
                    value={yearEstablished}
                    onChange={(e) => setYearEstablished(e.target.value)}
                    placeholder="2018"
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Key Highlights (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={highlightsText}
                    onChange={(e) => setHighlightsText(e.target.value)}
                    placeholder="ISO 9001 Certified, On-time Delivery, Custom Fabrication"
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Search Keywords / Tags (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={tagsText}
                    onChange={(e) => setTagsText(e.target.value)}
                    placeholder="cnc machining, steel fabrication, industrial automation"
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground"
                  />
                </div>
              </div>
            </div>

            {/* Honest Verification & Publication Notice */}
            <div className="p-4 rounded-xl bg-secondary/40 border border-border flex items-start gap-3 text-xs">
              <ShieldCheck className="w-5 h-5 text-foreground shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-semibold text-foreground">
                  Honest Verification &amp; Publication Policy
                </div>
                <p className="text-muted-foreground mt-0.5 leading-relaxed">
                  Newly registered storefronts are labeled{' '}
                  <strong className="text-foreground">Self-Reported Profile</strong>{' '}
                  until contact and business documents are independently reviewed.
                </p>
                <label className="inline-flex items-center gap-2 mt-2.5 font-medium text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={publishImmediately}
                    onChange={(e) => setPublishImmediately(e.target.checked)}
                    className="rounded border-border"
                  />
                  Publish my storefront immediately so customers can discover my
                  business and send enquiries
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Link
                href="/for-businesses"
                className="text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                &larr; Back to For Businesses
              </Link>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 bg-foreground text-background font-semibold text-sm px-6 py-3 rounded-lg hover:bg-foreground/90 transition-colors disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating Storefront…
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Create Business Storefront
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
