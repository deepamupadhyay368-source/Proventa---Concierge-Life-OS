'use client';

import { useState } from 'react';
import { Sparkles, X, ShieldCheck, ArrowRight } from 'lucide-react';

export function FloatingConcierge() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Popover Panel */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-96 rounded-2xl bg-white border border-[#E1E5E8] shadow-2xl p-5 backdrop-blur-xl animate-fade-up text-[#1F2933]">
          <div className="flex items-start justify-between pb-3 border-b border-[#E1E5E8]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#1F2933] text-white flex items-center justify-center font-serif font-bold text-xs shadow-xs">
                P
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#1F2933]">Private Concierge Desk</h4>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                </div>
                <p className="text-[11px] text-[#66717C]">Early Access · Cohort 1</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-[#66717C] hover:text-[#1F2933] rounded-lg hover:bg-[#F1F3F5] transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="py-4 space-y-3">
            <p className="text-xs text-[#303942] leading-relaxed">
              Welcome, Member. Your dedicated concierge team is active. Submit a Life OS request to initiate immediate arrangements.
            </p>

            <div className="space-y-2">
              <a
                href="/dashboard#new-request"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-[#F7F8FA] border border-[#E1E5E8] hover:border-[#1F2933] hover:bg-white hover:shadow-xs transition-all group text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#E5E9ED]/60 text-[#1F2933] group-hover:bg-[#1F2933] group-hover:text-white transition-colors">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#1F2933] block">Submit Life OS Request</span>
                    <span className="text-[10px] text-[#66717C]">AI brief + Verified Concierge execution</span>
                  </div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-[#66717C] group-hover:translate-x-0.5 group-hover:text-[#1F2933] transition-all" />
              </a>
            </div>
          </div>

          <div className="pt-3 border-t border-[#E1E5E8] flex items-center justify-between text-[10px] text-[#66717C]">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-[#1F2933]" />
              End-to-end encrypted
            </span>
            <span>Operating 24 / 7</span>
          </div>
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#1F2933] text-white shadow-xl hover:bg-[#111820] transition-all border border-[#E1E5E8]/30 group"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
        </span>
        <span className="font-sans text-xs tracking-wide text-white font-medium">Concierge Desk</span>
        <Sparkles className="h-3.5 w-3.5 text-[#A7B0B8] group-hover:rotate-12 transition-transform" />
      </button>
    </div>
  );
}