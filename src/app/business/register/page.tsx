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
        setErrorMsg(data.error || 'Could not register business dossier.');
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
    <div className="min-h-screen flex flex-col bg-[#F4F1EA] text-[#0D0E11]">
      <MarketingNav />

      <main className="flex-1 py-12 lg:py-16">
        <div className="container-wide">
          {createdBusiness ? (
            <div className="max-w-3xl mx-auto border-2 border-[#0D0E11] bg-[#FAF8F3] p-8 sm:p-12">
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="index-code-lime">STOREFRONT PUBLISHED</span>
                <span className="font-mono text-xs font-bold text-[#0D0E11]">
                  SLUG // /business/{createdBusiness.slug}
                </span>
              </div>
              <h1 className="font-display text-3xl sm:text-5xl font-bold uppercase tracking-[-0.035em] text-[#0D0E11]">
                {createdBusiness.name} IS NOW INDEXED ON PROVENTA.
              </h1>
              <p className="mt-4 text-sm text-[#52514E] leading-relaxed">
                Your commercial dossier is live. You can now inspect your public storefront, add
                product and service listings, and respond to buyer enquiries from your vendor
                console.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={`/business/${createdBusiness.slug}`}
                  className="btn-accent"
                >
                  <span>VIEW PUBLIC STOREFRONT</span>
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link href="/business/dashboard" className="btn-primary">
                  <span>OPEN VENDOR CONSOLE</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="pb-6 mb-8 border-b-2 border-[#0D0E11]">
                <Link
                  href="/businesses"
                  className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-[0.12em] text-[#0D0E11] hover:underline mb-4"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>BACK TO THE BUSINESS INDEX</span>
                </Link>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
                  <div className="lg:col-span-8">
                    <div className="inline-flex items-center gap-2 mb-3">
                      <span className="index-code-lime">REGISTRY ONBOARDING // FORM-01</span>
                      <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#52514E]">
                        COMMERCIAL ENTITY DOSSIER
                      </span>
                    </div>
                    <h1 className="font-display text-3xl sm:text-5xl font-bold uppercase tracking-[-0.04em] text-[#0D0E11] leading-[0.95]">
                      PUBLISH YOUR BUSINESS IN THE INDEX.
                    </h1>
                  </div>
                  <div className="lg:col-span-4 font-mono text-xs text-[#52514E]">
                    Complete your commercial dossier to establish a canonical storefront URL,
                    publish offerings, and receive direct buyer enquiries.
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <form
                  onSubmit={handleSubmit}
                  className="lg:col-span-8 border-2 border-[#0D0E11] bg-[#FAF8F3] divide-y divide-[#0D0E11]"
                >
                  {errorMsg && (
                    <div className="p-4 bg-[#B8232A] text-[#FAF8F3] font-mono text-xs">
                      ERROR // {errorMsg}
                    </div>
                  )}

                  {/* Section 01: Entity Identity */}
                  <div className="p-6 sm:p-8 space-y-5">
                    <div className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-[#0D0E11]">
                      01 // ENTITY IDENTITY &amp; SECTOR CLASSIFICATION
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-[#0D0E11] mb-1.5">
                          LEGAL OR TRADING BUSINESS NAME *
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
                        <label className="block font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-[#0D0E11] mb-1.5">
                          PRIMARY SECTOR CODE *
                        </label>
                        <select
                          value={primaryCategoryId}
                          onChange={(e) => setPrimaryCategoryId(e.target.value)}
                          className="input-enterprise font-mono text-xs"
                        >
                          {categories.map((cat, idx) => (
                            <option key={cat.id} value={cat.id}>
                              [{String(idx + 1).padStart(2, '0')}] {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-[#0D0E11] mb-1.5">
                        ONE-LINE COMMERCIAL POSITIONING / TAGLINE *
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
                      <label className="block font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-[#0D0E11] mb-1.5">
                        OPERATING MODEL *
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {(['PRODUCT', 'SERVICE', 'HYBRID'] as const).map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setBusinessType(t)}
                            className={`py-3 px-4 font-mono text-xs font-bold uppercase tracking-[0.12em] border border-[#0D0E11] transition-colors ${
                              businessType === t
                                ? 'bg-[#0D0E11] text-[#C8F904]'
                                : 'bg-[#F4F1EA] text-[#0D0E11] hover:bg-[#EAE5DA]'
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-[#0D0E11] mb-1.5">
                        CAPABILITIES, PRODUCTS &amp; SERVICES OVERVIEW *
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
                    <div className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-[#0D0E11]">
                      02 // JURISDICTION &amp; COMMERCIAL CONTACT LEDGER
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-[#0D0E11] mb-1.5">
                          HEADQUARTERS CITY *
                        </label>
                        <select
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="input-enterprise font-mono text-xs"
                        >
                          {BRAND_CONFIG.initialCities.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-[#0D0E11] mb-1.5">
                          STATE / REGION
                        </label>
                        <input
                          type="text"
                          value={stateName}
                          onChange={(e) => setStateName(e.target.value)}
                          className="input-enterprise"
                        />
                      </div>
                      <div>
                        <label className="block font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-[#0D0E11] mb-1.5">
                          ESTABLISHED YEAR
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
                      <label className="block font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-[#0D0E11] mb-1.5">
                        SERVICE / DELIVERY COVERAGE AREAS (COMMA-SEPARATED)
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
                        <label className="block font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-[#0D0E11] mb-1.5">
                          BUSINESS EMAIL *
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
                        <label className="block font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-[#0D0E11] mb-1.5">
                          PRIMARY PHONE *
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
                        <label className="block font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-[#0D0E11] mb-1.5">
                          WEBSITE URL
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
                        <label className="block font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-[#0D0E11] mb-1.5">
                          SEARCH INDEX KEYWORDS (COMMA-SEPARATED)
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
                        <label className="block font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-[#0D0E11] mb-1.5">
                          KEY CREDENTIALS / HIGHLIGHTS
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
                        className="h-4 w-4 accent-[#0D0E11]"
                      />
                      <span className="font-mono text-xs text-[#0D0E11]">
                        PUBLISH IMMEDIATELY TO THE PUBLIC BUSINESS INDEX
                      </span>
                    </label>
                  </div>

                  <div className="p-6 bg-[#EAE5DA] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <span className="font-mono text-[11px] text-[#52514E]">
                      INSTANT STOREFRONT DOSSIER + CATALOG ACCESS
                    </span>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-accent w-full sm:w-auto"
                    >
                      <span>
                        {submitting ? 'PUBLISHING DOSSIER...' : 'PUBLISH BUSINESS STOREFRONT →'}
                      </span>
                    </button>
                  </div>
                </form>

                {/* Right Column: Specification Sheet */}
                <aside className="lg:col-span-4 border border-[#0D0E11] bg-[#0D0E11] text-[#F4F1EA] p-6 sm:p-8 space-y-6">
                  <div className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-[#C8F904] pb-3 border-b border-[#2B2D33]">
                    INCLUDED WITH YOUR ENTRY
                  </div>
                  <ul className="space-y-4 text-xs text-[#CFCAC0]">
                    <li className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center bg-[#C8F904] text-[#0D0E11]">
                        <Check className="h-3 w-3" />
                      </span>
                      <span>
                        <strong className="text-[#F4F1EA] block font-mono uppercase">
                          Permanent Storefront URL
                        </strong>
                        Dedicated publication page indexed by sector and city.
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center bg-[#C8F904] text-[#0D0E11]">
                        <Check className="h-3 w-3" />
                      </span>
                      <span>
                        <strong className="text-[#F4F1EA] block font-mono uppercase">
                          Structured Offerings Catalog
                        </strong>
                        Publish products, service packages, pricing tiers, and turnaround specs.
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center bg-[#C8F904] text-[#0D0E11]">
                        <Check className="h-3 w-3" />
                      </span>
                      <span>
                        <strong className="text-[#F4F1EA] block font-mono uppercase">
                          Quotation Dispatch Console
                        </strong>
                        Receive targeted buyer RFQs and issue formal quotations directly.
                      </span>
                    </li>
                  </ul>
                </aside>
              </div>
            </>
          )}
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
