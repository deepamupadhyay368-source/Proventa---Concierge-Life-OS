'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Send,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { BRAND_CONFIG, INITIAL_MARKETPLACE_CATEGORIES } from '@/lib/brand';

function NewEnquiryFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'manufacturing-industrial';
  const targetBusinessId = searchParams.get('businessId') || searchParams.get('business') || '';
  const targetListingId = searchParams.get('listingId') || searchParams.get('listing') || '';

  const [categorySlug, setCategorySlug] = useState(initialCategory);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requirementType, setRequirementType] = useState<'PRODUCT' | 'SERVICE' | 'HYBRID'>('HYBRID');
  const [city, setCity] = useState('Ahmedabad');
  const [state, setState] = useState('Gujarat');
  const [deliveryMode, setDeliveryMode] = useState<'ON_SITE' | 'REMOTE' | 'DELIVERY' | 'EITHER'>('EITHER');
  const [quantity, setQuantity] = useState('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [timeline, setTimeline] = useState('Within 2 weeks');
  const [urgency] = useState<'STANDARD' | 'URGENT' | 'FLEXIBLE'>('STANDARD');
  const [preferredContactMethod] = useState<'PLATFORM' | 'EMAIL' | 'PHONE' | 'WHATSAPP'>('PLATFORM');
  const [shareContactWithShortlistedOnly, setShareContactWithShortlistedOnly] = useState(true);
  const [categoryAttributes, setCategoryAttributes] = useState<Record<string, string>>({});

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdResult, setCreatedResult] = useState<{
    referenceCode: string;
    enquiryId: string;
    matchedBusinessesCount: number;
  } | null>(null);

  const activeCategoryConfig =
    INITIAL_MARKETPLACE_CATEGORIES.find((c) => c.slug === categorySlug) ??
    INITIAL_MARKETPLACE_CATEGORIES[0];

  useEffect(() => {
    setCategoryAttributes({});
  }, [categorySlug]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId: categorySlug,
          targetBusinessId: targetBusinessId || undefined,
          targetListingId: targetListingId || undefined,
          title,
          description,
          requirementType,
          city,
          state,
          deliveryMode,
          quantity: quantity || undefined,
          budgetMin: budgetMin ? Number(budgetMin) : undefined,
          budgetMax: budgetMax ? Number(budgetMax) : undefined,
          timeline,
          urgency,
          categoryAttributes:
            Object.keys(categoryAttributes).length > 0
              ? categoryAttributes
              : undefined,
          preferredContactMethod,
          shareContactWithShortlistedOnly,
        }),
      });

      const data = await res.json();
      if (res.status === 401) {
        router.push(
          `/sign-in?callbackUrl=${encodeURIComponent('/enquiries/new')}`,
        );
        return;
      }

      if (!res.ok) {
        setError(data.message || data.error || 'Failed to submit enquiry');
        setSubmitting(false);
        return;
      }

      setCreatedResult({
        referenceCode: data.enquiry.referenceCode,
        enquiryId: data.enquiry.id,
        matchedBusinessesCount: data.matchedBusinessesCount,
      });
    } catch {
      setError('A network error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (createdResult) {
    return (
      <div className="surface-card p-8 md:p-10 text-center max-w-2xl mx-auto">
        <div className="w-12 h-12 rounded-full bg-[#ECFDF5] text-[#16845B] flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#16845B]">
          Enquiry Published &middot; {createdResult.referenceCode}
        </span>
        <h2 className="text-[24px] sm:text-[28px] font-bold text-[#15171B] mt-1">
          Your Requirement Has Been Posted
        </h2>
        <p className="text-[14px] text-[#696D76] mt-2 max-w-lg mx-auto leading-relaxed">
          Our matching engine evaluated published businesses in your category and
          location and notified{' '}
          <strong className="text-[#15171B]">
            {createdResult.matchedBusinessesCount} eligible business(es)
          </strong>
          . You can track responses, compare quotations, and shortlist offers from
          your Customer Dashboard.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link href="/dashboard" className="btn-accent">
            <span>Go to My Enquiries Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/businesses" className="btn-secondary">
            Continue Exploring Businesses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="surface-card p-6 sm:p-8 space-y-6"
    >
      {error && (
        <div className="p-4 rounded-[10px] bg-[#FEF2F2] border border-[#C53B43]/30 text-[#C53B43] text-[13px] flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* 1. Category & Requirement Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-[12px] font-semibold uppercase tracking-[0.06em] text-[#15171B] mb-2">
            Primary Category *
          </label>
          <select
            value={categorySlug}
            onChange={(e) => setCategorySlug(e.target.value)}
            className="input-enterprise"
            required
          >
            {INITIAL_MARKETPLACE_CATEGORIES.map((cat) => (
              <option key={cat.slug} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[12px] font-semibold uppercase tracking-[0.06em] text-[#15171B] mb-2">
            What do you need? *
          </label>
          <select
            value={requirementType}
            onChange={(e) =>
              setRequirementType(e.target.value as 'PRODUCT' | 'SERVICE' | 'HYBRID')
            }
            className="input-enterprise"
          >
            <option value="HYBRID">Product + Service / Turnkey Solution</option>
            <option value="PRODUCT">Products / Materials / Supply Only</option>
            <option value="SERVICE">Service / Consultation / Execution Only</option>
          </select>
        </div>
      </div>

      {/* 2. Title & Detailed Description */}
      <div>
        <label className="block text-[12px] font-semibold uppercase tracking-[0.06em] text-[#15171B] mb-2">
          Requirement Title *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., 50 kW Commercial Rooftop Solar Installation in Ahmedabad"
          required
          minLength={5}
          maxLength={160}
          className="input-enterprise"
        />
      </div>

      <div>
        <label className="block text-[12px] font-semibold uppercase tracking-[0.06em] text-[#15171B] mb-2">
          Detailed Requirement &amp; Specifications *
        </label>
        <textarea
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe specifications, scope of work, quality expectations, or delivery conditions so matched businesses can provide accurate quotations…"
          required
          minLength={20}
          maxLength={5000}
          className="input-enterprise"
        />
      </div>

      {/* 3. Category-Specific Optional Fields */}
      {activeCategoryConfig.enquiryAttributes &&
        activeCategoryConfig.enquiryAttributes.length > 0 && (
          <div className="p-5 rounded-[10px] bg-[#FAFAF8] border border-[#E8E9ED] space-y-4">
            <div>
              <h3 className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#15171B]">
                {activeCategoryConfig.name} — Specific Details (Optional)
              </h3>
              <p className="text-[12px] text-[#696D76] mt-0.5">
                Providing these details helps businesses prepare sharper quotes.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activeCategoryConfig.enquiryAttributes.map((field) => (
                <div key={field.key}>
                  <label className="block text-[12px] font-medium text-[#15171B] mb-1.5">
                    {field.label}
                  </label>
                  {field.type === 'select' && field.options ? (
                    <select
                      value={categoryAttributes[field.key] || ''}
                      onChange={(e) =>
                        setCategoryAttributes((prev) => ({
                          ...prev,
                          [field.key]: e.target.value,
                        }))
                      }
                      className="input-enterprise"
                    >
                      <option value="">Select option…</option>
                      {field.options.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={categoryAttributes[field.key] || ''}
                      placeholder={field.placeholder || ''}
                      onChange={(e) =>
                        setCategoryAttributes((prev) => ({
                          ...prev,
                          [field.key]: e.target.value,
                        }))
                      }
                      className="input-enterprise"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      {/* 4. Location, Delivery Mode & Timeline */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-[12px] font-semibold uppercase tracking-[0.06em] text-[#15171B] mb-2">
            City *
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
          <label className="block text-[12px] font-semibold uppercase tracking-[0.06em] text-[#15171B] mb-2">
            State *
          </label>
          <input
            type="text"
            value={state}
            onChange={(e) => setState(e.target.value)}
            required
            className="input-enterprise"
          />
        </div>

        <div>
          <label className="block text-[12px] font-semibold uppercase tracking-[0.06em] text-[#15171B] mb-2">
            Delivery / Execution Mode
          </label>
          <select
            value={deliveryMode}
            onChange={(e) =>
              setDeliveryMode(
                e.target.value as 'ON_SITE' | 'REMOTE' | 'DELIVERY' | 'EITHER',
              )
            }
            className="input-enterprise"
          >
            <option value="EITHER">On-Site, Delivery, or Remote</option>
            <option value="ON_SITE">On-Site Execution Required</option>
            <option value="DELIVERY">Physical Delivery to Location</option>
            <option value="REMOTE">Remote / Digital Delivery</option>
          </select>
        </div>
      </div>

      {/* 5. Budget Range, Quantity & Timeline */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div>
          <label className="block text-[12px] font-semibold uppercase tracking-[0.06em] text-[#15171B] mb-2">
            Quantity / Scale
          </label>
          <input
            type="text"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="e.g., 200 units / 1 project"
            className="input-enterprise"
          />
        </div>

        <div>
          <label className="block text-[12px] font-semibold uppercase tracking-[0.06em] text-[#15171B] mb-2">
            Min Budget (INR)
          </label>
          <input
            type="number"
            min="0"
            value={budgetMin}
            onChange={(e) => setBudgetMin(e.target.value)}
            placeholder="Optional"
            className="input-enterprise"
          />
        </div>

        <div>
          <label className="block text-[12px] font-semibold uppercase tracking-[0.06em] text-[#15171B] mb-2">
            Max Budget (INR)
          </label>
          <input
            type="number"
            min="0"
            value={budgetMax}
            onChange={(e) => setBudgetMax(e.target.value)}
            placeholder="Optional"
            className="input-enterprise"
          />
        </div>

        <div>
          <label className="block text-[12px] font-semibold uppercase tracking-[0.06em] text-[#15171B] mb-2">
            Expected Timeline
          </label>
          <select
            value={timeline}
            onChange={(e) => setTimeline(e.target.value)}
            className="input-enterprise"
          >
            <option value="Immediate (Within days)">Immediate (Within days)</option>
            <option value="Within 2 weeks">Within 2 weeks</option>
            <option value="Within 1 month">Within 1 month</option>
            <option value="1 to 3 months">1 to 3 months</option>
            <option value="Flexible / Exploring options">
              Flexible / Exploring options
            </option>
          </select>
        </div>
      </div>

      {/* 6. Contact Privacy Protection */}
      <div className="p-4 sm:p-5 rounded-[10px] bg-[#FAFAF8] border border-[#E8E9ED] flex items-start gap-3.5">
        <Lock className="w-5 h-5 text-[#304FFE] shrink-0 mt-0.5" />
        <div className="flex-1 text-[13px]">
          <div className="font-semibold text-[#15171B]">
            Customer Contact Privacy Protection
          </div>
          <p className="text-[#696D76] mt-0.5 leading-relaxed">
            By default, matched businesses can view your requirement and submit
            quotations on PROVENTA without seeing your personal phone number or
            email address until you shortlist or accept their quotation.
          </p>
          <label className="inline-flex items-center gap-2 mt-3 font-medium text-[#15171B] cursor-pointer">
            <input
              type="checkbox"
              checked={shareContactWithShortlistedOnly}
              onChange={(e) =>
                setShareContactWithShortlistedOnly(e.target.checked)
              }
              className="rounded border-[#D1D4DC] text-[#304FFE] focus:ring-[#304FFE]"
            />
            <span>
              Keep my direct contact details hidden until I shortlist or accept a quotation (Recommended)
            </span>
          </label>
        </div>
      </div>

      <div className="pt-2 flex items-center justify-end gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="btn-accent px-6 py-3"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Matching Businesses…</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Post Enquiry &amp; Notify Matched Businesses</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export default function NewEnquiryPage() {
  return (
    <div className="py-12 md:py-16 min-h-screen bg-[#FAFAF8] text-[#15171B]">
      <div className="container-wide max-w-4xl">
        <div className="mb-8">
          <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#304FFE]">
            <ShieldCheck className="w-3.5 h-3.5" />
            Customer Enquiry Marketplace
          </span>
          <h1 className="text-[28px] sm:text-[36px] font-bold tracking-[-0.03em] text-[#15171B] mt-1">
            Post a Requirement or Business Enquiry
          </h1>
          <p className="text-[15px] text-[#696D76] mt-1.5">
            Describe the product, service, or custom solution you need. Relevant
            published businesses will be matched and invited to submit structured
            quotations.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="surface-card p-12 text-center text-[14px] text-[#696D76]">
              Loading enquiry form…
            </div>
          }
        >
          <NewEnquiryFormContent />
        </Suspense>
      </div>
    </div>
  );
}
