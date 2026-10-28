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
        setErrorMessage(
          data.error || 'Unable to dispatch enquiry. Please check all fields.',
        );
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
      <div className="min-h-screen bg-[#F5F0E5] text-[#181914] py-16">
        <div className="container-narrow">
          <div className="border border-[#D5CBB8] bg-[#FAF6EC] p-8 sm:p-12">
            <div className="inline-flex items-center gap-2.5 mb-5">
              <span className="badge-verified">Enquiry Dispatched</span>
              <span className="font-mono text-xs font-medium text-[#6B675E]">
                REF · {submittedRef.referenceCode}
              </span>
            </div>

            <h1 className="font-display text-3xl sm:text-5xl font-normal tracking-[-0.02em] text-[#181914]">
              Your enquiry has been recorded and routed.
            </h1>

            <p className="mt-4 text-sm sm:text-base text-[#5C584F] leading-relaxed">
              {targetBusiness
                ? `Your requirement has been routed directly to ${targetBusiness.name}. You can track incoming quotations and manage correspondence from your customer workspace.`
                : 'Your requirement is now active in the industry enquiry network. Relevant businesses in your selected category and city can submit structured quotations.'}
            </p>

            <dl className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 border-y border-[#D5CBB8] py-4 font-mono text-xs">
              <div>
                <dt className="text-[#6B675E]">REFERENCE CODE</dt>
                <dd className="mt-1 font-semibold text-[#181914]">
                  {submittedRef.referenceCode}
                </dd>
              </div>
              <div>
                <dt className="text-[#6B675E]">CONTACT PRIVACY</dt>
                <dd className="mt-1 font-semibold text-[#181914]">
                  Protected Until Quote Review
                </dd>
              </div>
            </dl>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/dashboard" className="btn-terracotta">
                <span>Open Customer Workspace</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/businesses" className="btn-secondary">
                <span>Return to Business Directory</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F0E5] text-[#181914]">
      {/* Architectural Header */}
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
                  Customer Requirement &amp; Quotation Request
                </span>
                <span className="text-[#4C4A40]">·</span>
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#A7A194]">
                  {targetBusiness
                    ? `Direct Enquiry to ${targetBusiness.name}`
                    : 'Open Category Matchmaking'}
                </span>
              </div>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-normal tracking-[-0.02em] text-[#F6F0E4] leading-[1.02]">
                Post a business <span className="text-[#B94E2D]">enquiry.</span>
              </h1>
            </div>
            <div className="lg:col-span-4 text-sm text-[#A7A194] leading-relaxed">
              Describe the product, service, or project you need once. Receive structured
              quotations with transparent pricing and delivery timelines.
            </div>
          </div>
        </div>
      </section>

      <div className="container-wide py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Form (8 Cols) */}
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-8 border border-[#D5CBB8] bg-[#FAF6EC] divide-y divide-[#D5CBB8]"
          >
            {targetBusiness && (
              <div className="p-6 bg-[#20211C] text-[#F6F0E4] flex items-center justify-between">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#A98253]">
                    Direct Recipient Business
                  </span>
                  <div className="font-display text-2xl text-[#F6F0E4] mt-0.5">
                    {targetBusiness.name} ({targetBusiness.city})
                  </div>
                </div>
                <span className="badge-verified">Direct Enquiry</span>
              </div>
            )}

            {errorMessage && (
              <div className="p-4 bg-[#9E2A2B] text-[#F6F0E4] font-mono text-xs">
                {errorMessage}
              </div>
            )}

            {/* Part 01: Requirement Classification */}
            <div className="p-6 sm:p-8 space-y-5">
              <div className="font-mono text-xs uppercase tracking-[0.16em] text-[#A98253]">
                01 — Requirement Scope &amp; Category
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-[0.08em] text-[#181914] mb-1.5">
                  Enquiry Title / Subject *
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
                  <label className="block text-xs font-medium uppercase tracking-[0.08em] text-[#181914] mb-1.5">
                    Industry Category *
                  </label>
                  <select
                    required
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="input-enterprise"
                  >
                    {categories.map((c, idx) => (
                      <option key={c.id} value={c.id}>
                        {String(idx + 1).padStart(2, '0')} — {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium uppercase tracking-[0.08em] text-[#181914] mb-1.5">
                    Delivery / Service City *
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
                    <option value="Pan-India">Pan-India / Remote</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-[0.08em] text-[#181914] mb-1.5">
                  Detailed Specifications &amp; Deliverables *
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
                  <label className="block text-xs font-medium uppercase tracking-[0.08em] text-[#181914] mb-1.5">
                    Quantity / Scope
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
                  <label className="block text-xs font-medium uppercase tracking-[0.08em] text-[#181914] mb-1.5">
                    Indicative Budget
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
                  <label className="block text-xs font-medium uppercase tracking-[0.08em] text-[#181914] mb-1.5">
                    Target Timeline
                  </label>
                  <select
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                    className="input-enterprise"
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
              <div className="font-mono text-xs uppercase tracking-[0.16em] text-[#A98253]">
                02 — Contact &amp; Delivery Details
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-[0.08em] text-[#181914] mb-1.5">
                    Your Full Name *
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
                  <label className="block text-xs font-medium uppercase tracking-[0.08em] text-[#181914] mb-1.5">
                    Company / Organization (Optional)
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
                  <label className="block text-xs font-medium uppercase tracking-[0.08em] text-[#181914] mb-1.5">
                    Email Address *
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
                  <label className="block text-xs font-medium uppercase tracking-[0.08em] text-[#181914] mb-1.5">
                    Phone / WhatsApp
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
                <label className="block text-xs font-medium uppercase tracking-[0.08em] text-[#181914] mb-1.5">
                  Delivery / Service Preference
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
            <div className="p-6 bg-[#E9DFCC] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#5C584F]">
                Direct Matching · Zero Buyer Commission
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="btn-terracotta w-full sm:w-auto"
              >
                <span>{submitting ? 'Submitting Enquiry...' : 'Submit Enquiry'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>

          {/* Right Sidebar: Protocol Guarantees */}
          <aside className="lg:col-span-4 border border-[#4C4A40]/70 bg-[#171A14] text-[#F6F0E4] p-6 sm:p-8 space-y-6">
            <div className="font-mono text-xs uppercase tracking-[0.16em] text-[#A98253] pb-3 border-b border-[#4C4A40]/70">
              Enquiry &amp; Quotation Safeguards
            </div>

            <ul className="space-y-5 text-sm">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center bg-[#B94E2D] text-[#F6F0E4]">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </span>
                <div>
                  <strong className="block font-medium text-[#F6F0E4]">
                    Protected Contact Privacy
                  </strong>
                  <span className="text-xs text-[#A7A194] leading-relaxed block mt-0.5">
                    Your personal phone and email remain masked from public view while
                    businesses prepare structured quotations.
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center bg-[#20211C] border border-[#4C4A40] text-[#A98253]">
                  <Check className="h-3.5 w-3.5" />
                </span>
                <div>
                  <strong className="block font-medium text-[#F6F0E4]">
                    Structured Quotations
                  </strong>
                  <span className="text-xs text-[#A7A194] leading-relaxed block mt-0.5">
                    Every vendor response includes clear pricing, scope inclusions,
                    delivery timelines, and validity dates.
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center bg-[#20211C] border border-[#4C4A40] text-[#A98253]">
                  <Check className="h-3.5 w-3.5" />
                </span>
                <div>
                  <strong className="block font-medium text-[#F6F0E4]">
                    Compare, Shortlist &amp; Accept
                  </strong>
                  <span className="text-xs text-[#A7A194] leading-relaxed block mt-0.5">
                    Review proposals side by side in your customer dashboard and shortlist
                    or accept the right quotation.
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
        <div className="min-h-screen bg-[#F5F0E5] p-12 font-mono text-xs uppercase tracking-[0.14em] text-[#181914]">
          Loading enquiry form...
        </div>
      }
    >
      <BuyerEnquiryFormInner />
    </Suspense>
  );
}
