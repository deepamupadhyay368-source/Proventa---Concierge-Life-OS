'use client';

import { useState } from 'react';
import { MessageSquare, Sparkles, X, ShieldCheck, ArrowRight } from 'lucide-react';

export function FloatingConcierge() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Popover Panel */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-96 rounded-2xl bg-[#faf8f5] border border-[#e8e2d8] shadow-2xl p-5 backdrop-blur-xl animate-fade-up text-[#141312]">
          <div className="flex items-start justify-between pb-3 border-b border-[#e8e2d8]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#141312] text-amber-100 flex items-center justify-center font-serif font-bold text-xs shadow-xs">
                P
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#141312]">Private Concierge Desk</h4>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                </div>
                <p className="text-[11px] text-[#6e6b65]">Early Access · Cohort 1</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-[#928f88] hover:text-[#141312] rounded-lg hover:bg-[#ebe9e6]/60 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="py-4 space-y-3">
            <p className="text-xs text-[#3a3835] leading-relaxed">
              Welcome, Member. Your dedicated concierge team is active. How would you prefer to connect today?
            </p>

            <div className="space-y-2">
              <a
                href="/dashboard#new-request"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-white border border-[#e8e2d8] hover:border-[#8a7053] hover:shadow-xs transition-all group text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#f5f3ef] text-[#8a7053] group-hover:bg-[#8a7053] group-hover:text-white transition-colors">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#141312] block">Submit Life OS Request</span>
                    <span className="text-[10px] text-[#928f88]">AI brief + Verified Concierge execution</span>
                  </div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-[#928f88] group-hover:translate-x-0.5 transition-transform" />
              </a>

              <a
                href="https://wa.me/919876543210?text=Hello%20Proventa%20Concierge%2C%20I%20am%20a%20Cohort%201%20Member%20and%20need%20assistance."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-white border border-[#e8e2d8] hover:border-[#25D366] hover:shadow-xs transition-all group text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#141312] block">WhatsApp Private Hotline</span>
                    <span className="text-[10px] text-[#928f88]">Direct instant messaging with desk</span>
                  </div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-[#928f88] group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>
          </div>

          <div className="pt-3 border-t border-[#e8e2d8] flex items-center justify-between text-[10px] text-[#928f88]">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-[#8a7053]" />
              End-to-end encrypted
            </span>
            <span>Operating 24 / 7</span>
          </div>
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#141312] text-[#faf8f5] shadow-xl hover:bg-[#242321] transition-all border border-[#8a7053]/40 group"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-300"></span>
        </span>
        <span className="font-serif italic text-xs tracking-wide text-amber-100 font-medium">Concierge Desk</span>
        <Sparkles className="h-3.5 w-3.5 text-amber-200 group-hover:rotate-12 transition-transform" />
      </button>
    </div>
  );
}