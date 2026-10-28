'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check } from 'lucide-react';
import { MarketingNav } from '@/components/marketing/nav';
import { MarketingFooter } from '@/components/marketing/footer';
import { BRAND_CONFIG } from '@/lib/brand';

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

export default function BusinessRegisterPage() {
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [businessType, setBusinessType] = useState<'PRODUCT' | 'SERVICE' | 'HYBRID'>('HYBRID');
  const [primaryCategoryId, setPrimaryCategoryId] = useState('cat-business-services');
  const [city, setCity] = useState('Ahmedabad');
  const [stateName, setStateName] = useState('Gujarat');
  const [serviceAreasInput, setServiceAreasInput] = useState('Ahmedabad, Gandhinagar, Mumbai');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [establishedYear, setEstablishedYear] = useState('2020');
  const [keywordsInput, setKeywordsInput] = useState('');
  const [highlightsInput, setHighlightsInput] = useState('');
  const [publishImmediately, setPublishImmediately] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [createdBusiness, setCreatedBusiness] = useState<{
    name: string;
    slug: string;
  } | null>(null);

  useEffect(() => {
    fetch('/api/marketplace/categories')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.categories) && data.categories.length > 0) {
          setCategories(data.categories);
          setPrimaryCategoryId(data.categories[0].id);
        }
      })
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/marketplace/businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          tagline,
          description,
          businessType,
          primaryCategoryId,
          city,
          state: stateName,
          serviceAreas: serviceAreasInput
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          contactEmail,
          contactPhone,
          whatsappNumber: whatsappNumber || contactPhone,
          websiteUrl: websiteUrl || undefined,
          establishedYear: parseInt(establishedYear, 10) || undefined,
          keywords: keywordsInput
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          highlights: highlightsInput
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          publishImmediately,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Could not register business profile.');
        setSubmitting(false);
        return;
      }

      setCreatedBusiness({
        name: data.business.name,
        slug: data.business.slug,
      });
    } catch {
      setErrorMsg('Network error while publishing storefront.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F0E5] text-[#181914]">
      <MarketingNav />

      <main className="flex-1">
        {createdBusiness ? (
          <div className="container-wide py-16">
            <div className="max-w-3xl mx-auto border border-[#D5CBB8] bg-[#FAF6EC] p-8 sm:p-12">
              <div className="inline-flex items-center gap-2.5 mb-4">
                <span className="badge-verified">Storefront Published</span>
                <span className="font-mono text-xs text-[#6B675E]">
                  /business/{createdBusiness.slug}
                </span>
              </div>
              <h1 className="font-display text-3xl sm:text-5xl font-normal tracking-[-0.02em] text-[#181914]">
                {createdBusiness.name} is now live on PROVENTA.
              </h1>
              <p className="mt-4 text-sm sm:text-base text-[#5C584F] leading-relaxed">
                Your digital storefront is published. You can now view your public business
                page, add product and service listings, and respond to customer enquiries
                from your business dashboard.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={`/business/${createdBusiness.slug}`}
                  className="btn-terracotta"
                >
                  <span>View Public Storefront</span>
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link href="/business/dashboard" className="btn-primary">
                  <span>Open Business Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <>
            <section className="bg-[#171A14] text-[#F6F0E4] border-b border-[#4C4A40]/70 py-12 lg:py-16">
              <div className="container-wide">
                <Link
                  href="/businesses"
                  className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.14em] text-[#A7A194] hover:text-[#F6F0E4] mb-5"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back to Business Directory</span>
                </Link>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
                  <div className="lg:col-span-8">
                    <div className="inline-flex items-center gap-2.5 mb-3">
                      <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#B94E2D]">
                        Business Onboarding
                      </span>
                      <span className="text-[#4C4A40]">·</span>
                      <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#A7A194]">
                        Digital Storefront &amp; Lead Engine
                      </span>
                    </div>
                    <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-normal tracking-[-0.02em] text-[#F6F0E4] leading-[1.02]">
                      List your business on <span className="text-[#B94E2D]">PROVENTA.</span>
                    </h1>
                  </div>
                  <div className="lg:col-span-4 text-sm text-[#A7A194] leading-relaxed">
                    Create your business profile to establish a permanent storefront URL,
                    publish products and services, and receive direct customer enquiries.
                  </div>
                </div>
              </div>
            </section>

            <div className="container-wide py-12 lg:py-16">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <form
                  onSubmit={handleSubmit}
                  className="lg:col-span-8 border border-[#D5CBB8] bg-[#FAF6EC] divide-y divide-[#D5CBB8]"
                >
                  {errorMsg && (
                    <div className="p-4 bg-[#9E2A2B] text-[#F6F0E4] font-mono text-xs">
                      {errorMsg}
                    </div>
                  )}

                  {/* Section 01: Entity Identity */}
                  <div className="p-6 sm:p-8 space-y-5">
                    <div className="font-mono text-xs uppercase tracking-[0.16em] text-[#A98253]">
                      01 — Business Identity &amp; Industry Category
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium uppercase tracking-[0.08em] text-[#181914] mb-1.5">
                          Business / Brand Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g., Aether Precision Engineering Pvt. Ltd."
                          className="input-enterprise"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium uppercase tracking-[0.08em] text-[#181914] mb-1.5">
                          Primary Industry Category *
                        </label>
                        <select
                          value={primaryCategoryId}
                          onChange={(e) => setPrimaryCategoryId(e.target.value)}
                          className="input-enterprise"
                        >
                          {categories.map((cat, idx) => (
                            <option key={cat.id} value={cat.id}>
                              {String(idx + 1).padStart(2, '0')} — {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium uppercase tracking-[0.08em] text-[#181914] mb-1.5">
                        Short Tagline / Value Proposition *
                      </label>
                      <input
                        type="text"
                        required
                        value={tagline}
                        onChange={(e) => setTagline(e.target.value)}
                        placeholder="e.g., ISO-certified CNC machining, sheet metal fabrication & rapid prototyping"
                        className="input-enterprise"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium uppercase tracking-[0.08em] text-[#181914] mb-1.5">
                        Offering Type *
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {(['PRODUCT', 'SERVICE', 'HYBRID'] as const).map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setBusinessType(t)}
                            className={`py-3 px-4 font-mono text-xs font-medium uppercase tracking-[0.14em] border transition-colors ${
                              businessType === t
                                ? 'bg-[#171A14] text-[#F6F0E4] border-[#171A14]'
                                : 'bg-[#F5F0E5] text-[#181914] border-[#D5CBB8] hover:bg-[#E9DFCC]'
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium uppercase tracking-[0.08em] text-[#181914] mb-1.5">
                        Business Overview, Products &amp; Services *
                      </label>
                      <textarea
                        rows={4}
                        required
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe what your business manufactures, supplies, or delivers, typical client profiles, and quality standards..."
                        className="input-enterprise"
                      />
                    </div>
                  </div>

                  {/* Section 02: Jurisdiction & Coordinates */}
                  <div className="p-6 sm:p-8 space-y-5">
                    <div className="font-mono text-xs uppercase tracking-[0.16em] text-[#A98253]">
                      02 — Location &amp; Business Contact Information
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium uppercase tracking-[0.08em] text-[#181914] mb-1.5">
                          Primary City *
                        </label>
                        <select
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="input-enterprise"
                        >
                          {BRAND_CONFIG.initialCities.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium uppercase tracking-[0.08em] text-[#181914] mb-1.5">
                          State / Region
                        </label>
                        <input
                          type="text"
                          value={stateName}
                          onChange={(e) => setStateName(e.target.value)}
                          className="input-enterprise"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium uppercase tracking-[0.08em] text-[#181914] mb-1.5">
                          Year Established
                        </label>
                        <input
                          type="number"
                          value={establishedYear}
                          onChange={(e) => setEstablishedYear(e.target.value)}
                          className="input-enterprise font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium uppercase tracking-[0.08em] text-[#181914] mb-1.5">
                        Service / Delivery Areas (Comma-Separated)
                      </label>
                      <input
                        type="text"
                        value={serviceAreasInput}
                        onChange={(e) => setServiceAreasInput(e.target.value)}
                        placeholder="Ahmedabad, Mumbai, Pan-India"
                        className="input-enterprise"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium uppercase tracking-[0.08em] text-[#181914] mb-1.5">
                          Business Email *
                        </label>
                        <input
                          type="email"
                          required
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          placeholder="desk@company.com"
                          className="input-enterprise"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium uppercase tracking-[0.08em] text-[#181914] mb-1.5">
                          Primary Phone *
                        </label>
                        <input
                          type="tel"
                          required
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="input-enterprise"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium uppercase tracking-[0.08em] text-[#181914] mb-1.5">
                          Website URL
                        </label>
                        <input
                          type="url"
                          value={websiteUrl}
                          onChange={(e) => setWebsiteUrl(e.target.value)}
                          placeholder="https://company.com"
                          className="input-enterprise"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium uppercase tracking-[0.08em] text-[#181914] mb-1.5">
                          Search Keywords / Tags (Comma-Separated)
                        </label>
                        <input
                          type="text"
                          value={keywordsInput}
                          onChange={(e) => setKeywordsInput(e.target.value)}
                          placeholder="cnc machining, laser cutting, industrial parts"
                          className="input-enterprise"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium uppercase tracking-[0.08em] text-[#181914] mb-1.5">
                          Key Credentials / Highlights
                        </label>
                        <input
                          type="text"
                          value={highlightsInput}
                          onChange={(e) => setHighlightsInput(e.target.value)}
                          placeholder="ISO 9001:2015, Pan-India Dispatch, 48h Quotes"
                          className="input-enterprise"
                        />
                      </div>
                    </div>

                    <label className="flex items-center gap-3 pt-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={publishImmediately}
                        onChange={(e) => setPublishImmediately(e.target.checked)}
                        className="h-4 w-4 accent-[#B94E2D]"
                      />
                      <span className="text-xs font-medium text-[#181914]">
                        Publish immediately to the PROVENTA business directory
                      </span>
                    </label>
                  </div>

                  <div className="p-6 bg-[#E9DFCC] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#5C584F]">
                      Instant Digital Storefront + Catalog Access
                    </span>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-terracotta w-full sm:w-auto"
                    >
                      <span>
                        {submitting
                          ? 'Publishing Storefront...'
                          : 'Publish Business Storefront'}
                      </span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </form>

                {/* Right Column: Specification Sheet */}
                <aside className="lg:col-span-4 border border-[#4C4A40]/70 bg-[#171A14] text-[#F6F0E4] p-6 sm:p-8 space-y-6">
                  <div className="font-mono text-xs uppercase tracking-[0.16em] text-[#A98253] pb-3 border-b border-[#4C4A40]/70">
                    Included With Your Storefront
                  </div>
                  <ul className="space-y-5 text-sm">
                    <li className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center bg-[#B94E2D] text-[#F6F0E4]">
                        <Check className="h-3 w-3" />
                      </span>
                      <span>
                        <strong className="text-[#F6F0E4] block font-medium">
                          Permanent Storefront URL
                        </strong>
                        <span className="text-xs text-[#A7A194] block mt-0.5">
                          Dedicated business page indexed by industry category and city.
                        </span>
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center bg-[#B94E2D] text-[#F6F0E4]">
                        <Check className="h-3 w-3" />
                      </span>
                      <span>
                        <strong className="text-[#F6F0E4] block font-medium">
                          Product &amp; Service Catalog
                        </strong>
                        <span className="text-xs text-[#A7A194] block mt-0.5">
                          Publish products, service packages, pricing tiers, and turnaround
                          times.
                        </span>
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center bg-[#B94E2D] text-[#F6F0E4]">
                        <Check className="h-3 w-3" />
                      </span>
                      <span>
                        <strong className="text-[#F6F0E4] block font-medium">
                          Quotation &amp; Lead Desk
                        </strong>
                        <span className="text-xs text-[#A7A194] block mt-0.5">
                          Receive targeted customer enquiries and submit formal quotations
                          directly.
                        </span>
                      </span>
                    </li>
                  </ul>
                </aside>
              </div>
            </div>
          </>
        )}
      </main>

      <MarketingFooter />
    </div>
  );
}
