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
} from 'lucide-react';
import { BRAND_CONFIG, INITIAL_MARKETPLACE_CATEGORIES } from '@/lib/brand';

function NewEnquiryFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'manufacturing-industrial';
  const targetBusinessId = searchParams.get('businessId') || '';
  const targetListingId = searchParams.get('listingId') || '';

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
  const [urgency, setUrgency] = useState<'STANDARD' | 'URGENT' | 'FLEXIBLE'>('STANDARD');
  const [preferredContactMethod, setPreferredContactMethod] = useState<'PLATFORM' | 'EMAIL' | 'PHONE' | 'WHATSAPP'>('PLATFORM');
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
      <div className="bg-card border border-border rounded-2xl p-8 md:p-10 text-center max-w-2xl mx-auto shadow-sm">
        <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
          Enquiry Published &middot; {createdResult.referenceCode}
        </span>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mt-1">
          Your Requirement Has Been Posted
        </h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-lg mx-auto leading-relaxed">
          Our matching engine evaluated published businesses in your category and
          location and notified{' '}
          <strong className="text-foreground">
            {createdResult.matchedBusinessesCount} eligible business(es)
          </strong>
          . You can track responses, compare quotations, and shortlist offers from
          your Customer Dashboard.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="bg-foreground text-background text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-foreground/90 transition-colors"
          >
            Go to My Enquiries Dashboard
          </Link>
          <Link
            href="/businesses"
            className="border border-border bg-background text-foreground text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-secondary transition-colors"
          >
            Continue Exploring Businesses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-6"
    >
      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* 1. Category & Requirement Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Primary Category *
          </label>
          <select
            value={categorySlug}
            onChange={(e) => setCategorySlug(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm bg-background border border-border rounded-lg text-foreground"
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
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            What do you need? *
          </label>
          <select
            value={requirementType}
            onChange={(e) =>
              setRequirementType(e.target.value as 'PRODUCT' | 'SERVICE' | 'HYBRID')
            }
            className="w-full px-3.5 py-2.5 text-sm bg-background border border-border rounded-lg text-foreground"
          >
            <option value="HYBRID">Product + Service / Turnkey Solution</option>
            <option value="PRODUCT">Products / Materials / Supply Only</option>
            <option value="SERVICE">Service / Consultation / Execution Only</option>
          </select>
        </div>
      </div>

      {/* 2. Title & Detailed Description */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
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
          className="w-full px-3.5 py-2.5 text-sm bg-background border border-border rounded-lg text-foreground"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
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
          className="w-full px-3.5 py-2.5 text-sm bg-background border border-border rounded-lg text-foreground"
        />
      </div>

      {/* 3. Category-Specific Optional Fields */}
      {activeCategoryConfig.enquiryAttributes &&
        activeCategoryConfig.enquiryAttributes.length > 0 && (
          <div className="p-4 sm:p-5 rounded-xl bg-secondary/40 border border-border space-y-4">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                {activeCategoryConfig.name} — Specific Details (Optional)
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Providing these details helps businesses prepare sharper quotes.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activeCategoryConfig.enquiryAttributes.map((field) => (
                <div key={field.key}>
                  <label className="block text-xs font-medium text-foreground mb-1.5">
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
                      className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground"
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
                      className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground"
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
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            City *
          </label>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm bg-background border border-border rounded-lg text-foreground"
          >
            {BRAND_CONFIG.initialCities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            State *
          </label>
          <input
            type="text"
            value={state}
            onChange={(e) => setState(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 text-sm bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Delivery / Execution Mode
          </label>
          <select
            value={deliveryMode}
            onChange={(e) =>
              setDeliveryMode(
                e.target.value as 'ON_SITE' | 'REMOTE' | 'DELIVERY' | 'EITHER',
              )
            }
            className="w-full px-3.5 py-2.5 text-sm bg-background border border-border rounded-lg text-foreground"
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
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Quantity / Scale
          </label>
          <input
            type="text"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="e.g., 200 units / 1 project"
            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Min Budget (INR)
          </label>
          <input
            type="number"
            min="0"
            value={budgetMin}
            onChange={(e) => setBudgetMin(e.target.value)}
            placeholder="Optional"
            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Max Budget (INR)
          </label>
          <input
            type="number"
            min="0"
            value={budgetMax}
            onChange={(e) => setBudgetMax(e.target.value)}
            placeholder="Optional"
            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Expected Timeline
          </label>
          <select
            value={timeline}
            onChange={(e) => setTimeline(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground"
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
      <div className="p-4 rounded-xl bg-secondary/40 border border-border flex items-start gap-3">
        <Lock className="w-5 h-5 text-foreground shrink-0 mt-0.5" />
        <div className="flex-1 text-xs">
          <div className="font-semibold text-foreground">
            Customer Contact Privacy Protection
          </div>
          <p className="text-muted-foreground mt-0.5 leading-relaxed">
            By default, matched businesses can view your requirement and submit
            quotations on PROVENTA without seeing your personal phone number or
            email address until you shortlist or accept their quotation.
          </p>
          <label className="inline-flex items-center gap-2 mt-2.5 font-medium text-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={shareContactWithShortlistedOnly}
              onChange={(e) =>
                setShareContactWithShortlistedOnly(e.target.checked)
              }
              className="rounded border-border"
            />
            Keep my direct contact details hidden until I shortlist or accept a
            quotation (Recommended)
          </label>
        </div>
      </div>

      <div className="pt-2 flex items-center justify-end gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 bg-foreground text-background font-semibold text-sm px-6 py-3 rounded-lg hover:bg-foreground/90 transition-colors disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Matching Businesses…
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Post Enquiry &amp; Notify Matched Businesses
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export default function NewEnquiryPage() {
  return (
    <div className="pt-20 md:pt-24 pb-20 min-h-screen bg-background">
      <div className="container-wide max-w-4xl">
        <div className="mb-8">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            <ShieldCheck className="w-3.5 h-3.5" />
            Customer Enquiry Marketplace
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mt-1">
            Post a Requirement or Business Enquiry
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1.5">
            Describe the product, service, or custom solution you need. Relevant
            published businesses will be matched and invited to submit structured
            quotations.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="p-12 text-center text-sm text-muted-foreground">
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
