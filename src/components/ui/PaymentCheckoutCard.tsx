'use client';

import { useState } from 'react';
import { CreditCard, CheckCircle2, Shield, Lock, X } from 'lucide-react';

interface PaymentCardProps {
  bookingId: string;
  amount: number;
  currency?: string;
  itemDescription: string;
  onSuccess?: () => void;
}

export function PaymentCheckoutCard({
  bookingId,
  amount,
  currency = 'INR',
  itemDescription,
  onSuccess,
}: PaymentCardProps) {
  const [loading, setLoading] = useState(false);
  const [paid, setPaid] = useState(false);

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && (window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePay = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          amountPaise: amount * 100,
          idempotencyKey: `pay_${bookingId}_${Date.now()}`,
        }),
      });
      const data = await res.json();

      const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

      // If Razorpay live key is configured and browser available, launch official checkout
      if (razorpayKey && typeof window !== 'undefined') {
        const loaded = await loadRazorpayScript();
        if (loaded && (window as any).Razorpay) {
          const rzp = new (window as any).Razorpay({
            key: razorpayKey,
            amount: amount * 100,
            currency,
            name: 'Proventa Concierge',
            description: itemDescription,
            handler: async (response: any) => {
              setPaid(true);
              if (onSuccess) onSuccess();
            },
            theme: { color: '#141312' },
          });
          rzp.open();
          setLoading(false);
          return;
        }
      }

      // Default sandbox / concierge direct authorization
      if (data.success || data.result) {
        setPaid(true);
        if (onSuccess) onSuccess();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (paid) {
    return (
      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>Payment Authorized & Settled</span>
        </div>
        <span className="font-mono text-xs font-bold text-emerald-700">₹{amount.toLocaleString('en-IN')}</span>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl bg-white border border-[#e8e2d8] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-[#141312]">
          <CreditCard className="h-4 w-4 text-[#8a7053]" />
          <span>{itemDescription}</span>
        </div>
        <p className="text-[11px] text-[#6e6b65] mt-0.5">
          Direct concierge disbursement via UPI, NetBanking, or Card
        </p>
      </div>

      <div className="flex items-center gap-3 self-end sm:self-auto">
        <span className="font-serif text-sm font-bold text-[#141312]">
          ₹{amount.toLocaleString('en-IN')}
        </span>
        <button
          onClick={handlePay}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#141312] hover:bg-[#242321] text-amber-100 text-xs font-semibold transition-all shadow-xs disabled:opacity-50"
        >
          <Lock className="h-3 w-3 text-amber-300" />
          <span>{loading ? 'Processing...' : 'Authorize Payment'}</span>
        </button>
      </div>
    </div>
  );
}