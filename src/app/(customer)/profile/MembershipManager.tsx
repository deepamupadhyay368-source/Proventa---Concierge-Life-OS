'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Check,
  ArrowRight,
  Shield,
  CreditCard,
  RefreshCw,
  Info,
  Calendar,
  X,
} from 'lucide-react';
import {
  CANONICAL_MEMBERSHIP_PLANS,
  MEMBERSHIP_PLANS_LIST,
  MEMBERSHIP_PAYMENT_DISCLOSURE,
  normalizeMembershipPlan,
  MembershipTierSlug,
} from '@/lib/membership/plans';
import { toast } from 'sonner';

interface MembershipManagerProps {
  currentPlanSlug?: string | null;
  status?: string | null;
  startedAt?: Date | string | null;
  renewsAt?: Date | string | null;
}

export function MembershipManager({
  currentPlanSlug = 'SELECT',
  status = 'ACTIVE',
  startedAt,
  renewsAt,
}: MembershipManagerProps) {
  const router = useRouter();
  const activePlan = normalizeMembershipPlan(currentPlanSlug);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<MembershipTierSlug>(activePlan.id);
  const [loading, setLoading] = useState(false);

  async function handlePlanChange(tierId: MembershipTierSlug) {
    try {
      setLoading(true);
      const res = await fetch('/api/customer/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ membershipPlan: tierId.toUpperCase() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update membership plan');
      }

      toast.success(`Membership plan updated to ${CANONICAL_MEMBERSHIP_PLANS[tierId].name}`);
      setModalOpen(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Error updating membership');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white border border-[#E1E5E8] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E1E5E8]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-widest bg-[#F1F3F5] text-[#1F2933] border border-[#E1E5E8] px-2.5 py-0.5 rounded-full">
              Concierge Subscription
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
              {status || 'Active'}
            </span>
          </div>
          <h2 className="text-xl font-bold text-[#111820] mt-2">
            Proventa {activePlan.name} Membership
          </h2>
          <p className="text-xs text-[#66717C] mt-0.5">
            {activePlan.positioning} — {activePlan.description}
          </p>
        </div>

        <div className="text-left sm:text-right">
          <div className="text-2xl font-bold text-[#111820]">
            {activePlan.formattedPrice}
            <span className="text-xs text-[#66717C] font-normal uppercase tracking-wider">
              {activePlan.cadence}
            </span>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="mt-2 text-xs font-semibold text-[#1F2933] hover:text-[#111820] underline underline-offset-4 tracking-wider uppercase"
          >
            Change Plan →
          </button>
        </div>
      </div>

      {/* Subscription Metadata */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="p-3.5 rounded-xl bg-[#F7F8FA] border border-[#E1E5E8] space-y-1">
          <span className="text-[#66717C] font-medium block">Priority Level</span>
          <span className="font-semibold text-[#111820] uppercase tracking-wider">
            {activePlan.priorityLevel.replace('_', ' ')}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#F7F8FA] border border-[#E1E5E8] space-y-1">
          <span className="text-[#66717C] font-medium block">Member Since</span>
          <span className="font-semibold text-[#111820]">
            {startedAt
              ? new Date(startedAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
              : 'October 2024'}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#F7F8FA] border border-[#E1E5E8] space-y-1">
          <span className="text-[#66717C] font-medium block">Next Renewal</span>
          <span className="font-semibold text-[#111820]">
            {renewsAt
              ? new Date(renewsAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
              : 'Auto-renews monthly'}
          </span>
        </div>
      </div>

      {/* Plan Benefits Checklist */}
      <div className="space-y-3 pt-2">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-[#111820]">
          Active Tier Inclusions
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#525F6C]">
          {activePlan.benefits.map((b, i) => (
            <div key={i} className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
              <span className="font-medium text-[#1F2933]">{b}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Mandate & Third-Party Disclosure */}
      <div className="p-3 rounded-xl bg-[#F7F8FA] border border-[#E1E5E8] flex items-start gap-2.5 text-xs text-[#66717C]">
        <Info className="w-4 h-4 text-[#1F2933] shrink-0 mt-0.5" />
        <span className="leading-relaxed">{MEMBERSHIP_PAYMENT_DISCLOSURE}</span>
      </div>

      {/* Change Plan Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white border border-[#E1E5E8] rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#E1E5E8]">
              <div>
                <h3 className="text-lg font-bold text-[#111820]">
                  Select Your Proventa Membership
                </h3>
                <p className="text-xs text-[#66717C] mt-0.5">
                  Choose the tier that best matches your lifestyle and delegation needs.
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 text-[#66717C] hover:text-[#111820] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {MEMBERSHIP_PLANS_LIST.map((plan) => {
                const isSelected = selectedTier === plan.id;
                const isCurrent = activePlan.id === plan.id;
                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedTier(plan.id)}
                    className={`p-5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#1F2933] bg-[#F7F8FA] ring-1 ring-[#1F2933]'
                        : 'border-[#E1E5E8] bg-white hover:border-[#A7B0B8]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold text-[#111820]">
                            {plan.name}
                          </span>
                          {plan.recommended && (
                            <span className="text-[10px] font-semibold bg-[#1F2933] text-white px-2 py-0.5 rounded-full uppercase">
                              Recommended
                            </span>
                          )}
                          {isCurrent && (
                            <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full uppercase">
                              Current Plan
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#66717C]">{plan.positioning}</p>
                      </div>

                      <div className="text-right">
                        <span className="text-lg font-bold text-[#111820]">
                          {plan.formattedPrice}
                        </span>
                        <span className="text-xs text-[#66717C]">/mo</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-[#E1E5E8]/60 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[#525F6C]">
                      {plan.benefits.slice(0, 4).map((b, i) => (
                        <span key={i} className="flex items-center gap-1">
                          <Check className="w-3 h-3 text-[#10B981]" />
                          <span>{b}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E1E5E8]">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-[#E1E5E8] text-xs font-semibold text-[#525F6C] hover:bg-[#F1F3F5]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading || selectedTier === activePlan.id}
                onClick={() => handlePlanChange(selectedTier)}
                className="px-6 py-2.5 rounded-xl bg-[#1F2933] hover:bg-[#111820] text-white text-xs font-semibold tracking-wider uppercase disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm {CANONICAL_MEMBERSHIP_PLANS[selectedTier].name} Plan</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
