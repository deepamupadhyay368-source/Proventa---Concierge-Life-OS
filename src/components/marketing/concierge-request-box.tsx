'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Sparkles, AlertCircle, Loader2 } from 'lucide-react';

const ROTATING_EXAMPLES = [
  'Plan my weekend in Ahmedabad with dinner at Agashiye...',
  'Find me a great dinner table tonight for two at 8:30 PM...',
  'Arrange an airport transfer tomorrow morning at 6:00 AM...',
  'Send a handcrafted artisan gift to a partner in Mumbai...',
  'Book business class flights from Ahmedabad to Delhi...',
];

export function ConciergeRequestBox() {
  const router = useRouter();
  const [input, setInput] = useState('');
  const [exampleIndex, setExampleIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setExampleIndex((prev) => (prev + 1) % ROTATING_EXAMPLES.length);
    }, 4200);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const promptToSend = input.trim() || ROTATING_EXAMPLES[exampleIndex];
    if (!promptToSend || submitting) return;

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawInput: promptToSend, urgency: 'NORMAL' }),
      });

      if (res.status === 401) {
        // Save prompt in sessionStorage for instant retrieval after sign in
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('pending_concierge_prompt', promptToSend);
        }
        router.push(`/sign-in?callbackUrl=${encodeURIComponent('/dashboard')}`);
        return;
      }

      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.task?.id) {
        setInput('');
        router.push(`/tasks/${data.task.id}`);
        return;
      }

      setErrorMessage(data?.error || 'Unable to dispatch your concierge request. Please try again.');
    } catch (err: any) {
      setErrorMessage(err.message || 'A connection error occurred while reaching the concierge desk.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="request-section" className="py-32 px-6 sm:px-8 lg:px-12 bg-black text-white border-t border-[#171717]">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10 text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#141414] border border-[#262626] text-xs font-mono uppercase tracking-widest text-[#a3a3a3]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>DISPATCH MANDATE</span>
          </div>
          <h2 className="text-4xl sm:text-6xl font-bold tracking-tight uppercase font-sans">
            WHAT DO YOU NEED?
          </h2>
          <p className="text-sm sm:text-base text-[#737373] font-light max-w-lg mx-auto">
            Plain language. No category selection required. Your concierge reviews every detail immediately.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-red-950/40 border border-red-800/40 text-xs text-red-300 flex items-center gap-3">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span className="flex-1">{errorMessage}</span>
          </div>
        )}

        {/* Large Input Box */}
        <form onSubmit={handleSubmit} className="relative">
          <div className="p-3 sm:p-4 rounded-3xl bg-[#0f0f0f] border border-[#262626] focus-within:border-[#525252] transition-all shadow-2xl">
            <textarea
              rows={4}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={ROTATING_EXAMPLES[exampleIndex]}
              className="w-full bg-transparent p-4 sm:p-6 text-base sm:text-xl font-light text-white placeholder-[#404040] outline-none resize-none leading-relaxed"
            />

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#1a1a1a] px-2">
              <div className="flex items-center gap-2 text-xs font-mono text-[#525252]">
                <span>Senior Concierge Desk</span>
                <span>·</span>
                <span>Ahmedabad Hub</span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-3.5 rounded-full bg-white text-black text-xs font-mono font-semibold uppercase tracking-wider hover:bg-[#eaeaea] transition-all disabled:opacity-50 group"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Dispatching...</span>
                  </>
                ) : (
                  <>
                    <span>Send Request</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
