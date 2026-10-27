'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check, ShieldCheck } from 'lucide-react';
import { BRAND_CONFIG } from '@/lib/brand';

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

interface TargetBusinessSummary {
  id: string;
  name: string;
  slug: string;
  city: string;
  primaryCategoryId: string;
  primaryCategoryName: string;
}

function BuyerEnquiryFormInner() {
  const searchParams = useSearchParams();
  const preselectedBusinessId = searchParams.get('businessId') || '';
  const preselectedListingId = searchParams.get('listingId') || '';
  const preselectedCategoryId = searchParams.get('categoryId') || '';

  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [targetBusiness, setTargetBusiness] = useState<TargetBusinessSummary | null>(
    null,
  );

  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState(preselectedCategoryId);
  const [requirements, setRequirements] = useState('');
  const [quantityOrScope, setQuantityOrScope] = useState('');
  const [budgetRange, setBudgetRange] = useState('');
  const [timeline, setTimeline] = useState('Within 2 weeks');
  const [city, setCity] = useState('Ahmedabad');
  const [deliveryPreference, setDeliveryPreference] = useState('Any / Flexible');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerCompany, setCustomerCompany] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedRef, setSubmittedRef] = useState<{
    referenceCode: string;
    id: string;
  } | null>(null);

  useEffect(() => {
    fetch('/api/marketplace/categories')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.categories)) {
          setCategories(data.categories);
          if (!categoryId && data.categories.length > 0) {
            setCategoryId(data.categories[0].id);
          }
        }
      })
      .catch(() => {});
  }, [categoryId]);

  useEffect(() => {
    if (!preselectedBusinessId) return;
    fetch('/api/marketplace/businesses?limit=50')
      .then((r) => r.json())
      .then((data) => {
        const match = (data.items || []).find(
          (b: TargetBusinessSummary) => b.id === preselectedBusinessId,
        );
        if (match) {
          setTargetBusiness(match);
          if (match.primaryCategoryId) {
            setCategoryId(match.primaryCategoryId);
          }
        }
      })
      .catch(() => {});
  }, [preselectedBusinessId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/marketplace/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetBusinessId: preselectedBusinessId || undefined,
          targetListingId: preselectedListingId || undefined,
          categoryId: categoryId || 'cat-business-services',
          title,
          requirements,
          quantityOrScope,
          budgetRange,
          timeline,
          city,
          deliveryPreference,
          customerName,
          customerEmail,
          customerPhone,
          customerCompany,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Unable to dispatch enquiry. Please check all fields.');
        setSubmitting(false);
        return;
      }

      setSubmittedRef({
        referenceCode: data.enquiry?.referenceCode || 'ENQ-DISPATCHED',
        id: data.enquiry?.id || '',
      });
    } catch {
      setErrorMessage('Network error while submitting enquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (submittedRef) {
    return (
      <div className="min-h-screen bg-[#F4F1EA] py-16">
        <div className="container-narrow">
          <div className="border-2 border-[#0D0E11] bg-[#FAF8F3] p-8 sm:p-12">
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="index-code-lime">DISPATCH CONFIRMED</span>
              <span className="font-mono text-xs font-bold text-[#0D0E11]">
                REF // {submittedRef.referenceCode}
              </span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl font-bold uppercase tracking-[-0.03em] text-[#0D0E11]">
              YOUR BUYER ENQUIRY HAS BEEN RECORDED IN THE LEDGER.
            </h1>

            <p className="mt-4 text-sm text-[#52514E] leading-relaxed">
              {targetBusiness
                ? `Your requirement has been routed directly to ${targetBusiness.name}. You can track incoming quotations and manage correspondence from your buyer workspace.`
                : 'Your requirement is now active in the sector quotation ledger. Verified businesses in your selected sector can submit structured proposals.'}
            </p>

            <dl className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 border-y border-[#0D0E11] py-4 font-mono text-xs">
              <div>
                <dt className="text-[#52514E]">REFERENCE CODE</dt>
                <dd className="mt-1 font-bold text-[#0D0E11]">{submittedRef.referenceCode}</dd>
              </div>
              <div>
                <dt className="text-[#52514E]">CONTACT PRIVACY</dt>
                <dd className="mt-1 font-bold text-[#0D0E11]">
                  PROTECTED UNTIL QUOTE REVIEW
                </dd>
              </div>
            </dl>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/dashboard" className="btn-primary">
                <span>OPEN BUYER WORKSPACE</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/businesses" className="btn-secondary">
                <span>RETURN TO DIRECTORY</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F1EA] text-[#0D0E11] py-12 lg:py-16">
      <div className="container-wide">
        {/* Top Header */}
        <div className=" pb-6 mb-8 border-b-2 border-[#0D0E11]">
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
                <span className="index-code-lime">FORM // RFQ-01</span>
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#52514E]">
                  {targetBusiness
                    ? `DIRECT DISPATCH TO ${targetBusiness.name.toUpperCase()}`
                    : 'OPEN SECTOR QUOTATION REQUEST'}
                </span>
              </div>
              <h1 className="font-display text-3xl sm:text-5xl font-bold uppercase tracking-[-0.04em] text-[#0D0E11] leading-[0.95]">
                DISPATCH A BUYER ENQUIRY.
              </h1>
            </div>
            <div className="lg:col-span-4 font-mono text-xs text-[#52514E]">
              Specify your product or service requirement once. Receive structured quotations with
              transparent pricing and delivery commitments.
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Form (8 Cols) */}
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-8 border-2 border-[#0D0E11] bg-[#FAF8F3] divide-y divide-[#0D0E11]"
          >
            {targetBusiness && (
              <div className="p-6 bg-[#0D0E11] text-[#F4F1EA] flex items-center justify-between">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#C8F904]">
                    TARGET RECIPIENT ENTITY
                  </span>
                  <div className="font-display text-xl font-bold text-[#F4F1EA]">
                    {targetBusiness.name} ({targetBusiness.city})
                  </div>
                </div>
                <span className="index-code-lime">DIRECT RFQ</span>
              </div>
            )}

            {errorMessage && (
              <div className="p-4 bg-[#B8232A] text-[#FAF8F3] font-mono text-xs">
                ERROR // {errorMessage}
              </div>
            )}

            {/* Part 01: Requirement Classification */}
            <div className="p-6 sm:p-8 space-y-5">
              <div className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-[#0D0E11]">
                01 // REQUIREMENT CLASSIFICATION &amp; SCOPE
              </div>

              <div>
                <label className="block font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-[#0D0E11] mb-1.5">
                  ENQUIRY HEADLINE / SUBJECT *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., 500 units custom anodized aluminum enclosures / Corporate catering for 150 guests"
                  className="input-enterprise"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-[#0D0E11] mb-1.5">
                    SECTOR CLASSIFICATION *
                  </label>
                  <select
                    required
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="input-enterprise font-mono text-xs"
                  >
                    {categories.map((c, idx) => (
                      <option key={c.id} value={c.id}>
                        [{String(idx + 1).padStart(2, '0')}] {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-[#0D0E11] mb-1.5">
                    DELIVERY / OPERATING CITY *
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
                    <option value="Pan-India">Pan-India / Remote</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-[#0D0E11] mb-1.5">
                  DETAILED SPECIFICATIONS &amp; DELIVERABLES *
                </label>
                <textarea
                  rows={4}
                  required
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder="Include technical specifications, dimensions, service expectations, quality standards, or reference models..."
                  className="input-enterprise"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-[#0D0E11] mb-1.5">
                    QUANTITY / VOLUME
                  </label>
                  <input
                    type="text"
                    value={quantityOrScope}
                    onChange={(e) => setQuantityOrScope(e.target.value)}
                    placeholder="e.g., 250 units / 3-month retainer"
                    className="input-enterprise"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-[#0D0E11] mb-1.5">
                    INDICATIVE BUDGET
                  </label>
                  <input
                    type="text"
                    value={budgetRange}
                    onChange={(e) => setBudgetRange(e.target.value)}
                    placeholder="e.g., ₹50,000 – ₹1,50,000"
                    className="input-enterprise"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-[#0D0E11] mb-1.5">
                    TARGET TIMELINE
                  </label>
                  <select
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                    className="input-enterprise font-mono text-xs"
                  >
                    <option value="Immediate / Urgent">Immediate / Urgent</option>
                    <option value="Within 1 week">Within 1 week</option>
                    <option value="Within 2 weeks">Within 2 weeks</option>
                    <option value="Within 1 month">Within 1 month</option>
                    <option value="Flexible">Flexible</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Part 02: Buyer Coordinates */}
            <div className="p-6 sm:p-8 space-y-5">
              <div className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-[#0D0E11]">
                02 // BUYER IDENTIFICATION &amp; CONTACT LEDGER
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-[#0D0E11] mb-1.5">
                    YOUR FULL NAME *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Full name"
                    className="input-enterprise"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-[#0D0E11] mb-1.5">
                    ORGANIZATION / COMPANY (OPTIONAL)
                  </label>
                  <input
                    type="text"
                    value={customerCompany}
                    onChange={(e) => setCustomerCompany(e.target.value)}
                    placeholder="Company or individual buyer"
                    className="input-enterprise"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-[#0D0E11] mb-1.5">
                    EMAIL ADDRESS *
                  </label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="input-enterprise"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-[#0D0E11] mb-1.5">
                    PHONE / WHATSAPP
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="input-enterprise"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-[#0D0E11] mb-1.5">
                  FULFILLMENT PREFERENCE
                </label>
                <input
                  type="text"
                  value={deliveryPreference}
                  onChange={(e) => setDeliveryPreference(e.target.value)}
                  placeholder="On-site service, door delivery, warehouse pickup, or remote"
                  className="input-enterprise"
                />
              </div>
            </div>

            {/* Submit Bar */}
            <div className="p-6 bg-[#EAE5DA] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="font-mono text-[11px] text-[#52514E]">
                PROTOCOL: DIRECT DISPATCH · ZERO BUYER COMMISSION
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="btn-accent w-full sm:w-auto"
              >
                <span>{submitting ? 'DISPATCHING ENQUIRY...' : 'DISPATCH ENQUIRY →'}</span>
              </button>
            </div>
          </form>

          {/* Right Sidebar: Protocol Guarantees */}
          <aside className="lg:col-span-4 border border-[#0D0E11] bg-[#FAF8F3] p-6 sm:p-8 space-y-6">
            <div className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-[#0D0E11] pb-3 border-b border-[#0D0E11]">
              QUOTATION PROTOCOL GUARANTEES
            </div>

            <ul className="space-y-4 text-xs text-[#0D0E11]">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center bg-[#C8F904] border border-[#0D0E11]">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#0D0E11]" />
                </span>
                <div>
                  <strong className="block font-mono uppercase">Contact Redaction</strong>
                  <span className="text-[#52514E]">
                    Your personal phone and email remain masked from public view while vendors
                    prepare structured quotations.
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center bg-[#C8F904] border border-[#0D0E11]">
                  <Check className="h-3.5 w-3.5 text-[#0D0E11]" />
                </span>
                <div>
                  <strong className="block font-mono uppercase">Standardized Quotations</strong>
                  <span className="text-[#52514E]">
                    Every vendor response includes clear pricing, scope inclusions, delivery
                    timelines, and validity dates.
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center bg-[#C8F904] border border-[#0D0E11]">
                  <Check className="h-3.5 w-3.5 text-[#0D0E11]" />
                </span>
                <div>
                  <strong className="block font-mono uppercase">Direct Award</strong>
                  <span className="text-[#52514E]">
                    Compare proposals side by side in your buyer dashboard and accept the winning
                    quotation with one click.
                  </span>
                </div>
              </li>
            </ul>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default function NewBuyerEnquiryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F4F1EA] p-12 font-mono text-xs uppercase tracking-[0.14em]">
          INITIALIZING ENQUIRY TERMINAL...
        </div>
      }
    >
      <BuyerEnquiryFormInner />
    </Suspense>
  );
}
