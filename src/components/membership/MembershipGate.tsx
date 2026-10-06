'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, Sparkles, ShieldCheck, ArrowRight, X } from 'lucide-react';
import {
  CANONICAL_MEMBERSHIP_PLANS,
  MEMBERSHIP_PLANS_LIST,
  MembershipTierSlug,
} from '@/lib/membership/plans';

interface MembershipGateProps {
  mode?: 'modal' | 'inline';
  isOpen?: boolean;
  onClose?: () => void;
  title?: string;
  subtitle?: string;
}

export function MembershipGate({
  mode = 'inline',
  isOpen = true,
  onClose,
  title = 'You have enjoyed your 3 complimentary Proventa requests.',
  subtitle = 'Choose a membership to continue having Proventa handle more of your life.',
}: MembershipGateProps) {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<MembershipTierSlug>('private');

  if (mode === 'modal' && !isOpen) return null;

  const content = (
    <div className="bg-white border border-[#E1E5E8] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 text-left max-w-3xl mx-auto">
      {/* Header Banner */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F1F3F5] text-[#1F2933] border border-[#E1E5E8] text-xs font-medium mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#1F2933]" />
            <span>Choose a membership to continue</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-medium text-[#111820]">
            {title}
          </h2>
          <p className="text-sm text-[#66717C] mt-1.5 leading-relaxed">
            {subtitle}
          </p>
        </div>

        {mode === 'modal' && onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#66717C] hover:text-[#111820] hover:bg-[#F7F8FA] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* 3 Canonical Plans Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2">
        {MEMBERSHIP_PLANS_LIST.map((p) => {
          const isSelected = selectedPlan === p.id;
          return (
            <div
              key={p.id}
              onClick={() => setSelectedPlan(p.id)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                isSelected
                  ? 'bg-white border-[#111820] ring-1 ring-[#111820] shadow-sm'
                  : 'bg-[#F7F8FA] border-[#E1E5E8] hover:border-[#A7B0B8] hover:bg-white'
              }`}
            >
              {p.recommended && (
                <span className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full bg-[#111820] text-white text-[10px] font-medium tracking-wide">
                  Recommended
                </span>
              )}

              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-medium text-base text-[#111820]">{p.name}</h3>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected
                        ? 'border-[#111820] bg-[#111820]'
                        : 'border-[#A7B0B8] bg-white'
                    }`}
                  >
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>

                <div className="mt-2.5">
                  <span className="text-2xl font-serif font-medium text-[#111820]">{p.formattedPrice}</span>
                  <span className="text-xs text-[#66717C] font-mono">{p.cadence}</span>
                </div>

                <p className="text-xs text-[#525F6C] font-medium mt-1.5 leading-snug">
                  &ldquo;{p.positioning}&rdquo;
                </p>

                <p className="text-[11px] text-[#66717C] mt-2 leading-relaxed">
                  {p.description}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-[#E1E5E8] text-[11px] text-[#525F6C] space-y-1">
                {p.benefits.slice(0, 3).map((b, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span className="truncate">{b}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA Footer */}
      <div className="pt-4 border-t border-[#E1E5E8] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-[#66717C]">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>No commitment · Cancel or switch plans anytime</span>
        </div>

        <Link
          href={`/membership/checkout?plan=${selectedPlan}`}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#111820] hover:bg-[#1F2933] text-white text-xs font-medium shadow-sm transition-all text-center"
        >
          <span>Choose your membership</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );

  if (mode === 'modal') {
    return (
      <div className="fixed inset-0 bg-[#111820]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="relative w-full max-w-3xl my-8">
          {content}
        </div>
      </div>
    );
  }

  return content;
}
