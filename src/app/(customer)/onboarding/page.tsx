'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Utensils, Plane, ShoppingBag, Ticket, Calendar, Home, User, Briefcase, Sparkles, Check } from 'lucide-react';

const CATEGORIES = [
  { id: 'dining', name: 'Dining', desc: 'Restaurants & reservations', icon: Utensils },
  { id: 'travel', name: 'Travel', desc: 'Getaways, flights & itineraries', icon: Plane },
  { id: 'shopping', name: 'Shopping', desc: 'Gifts & hard-to-find items', icon: ShoppingBag },
  { id: 'experiences', name: 'Experiences', desc: 'Events, cinema & activities', icon: Ticket },
  { id: 'appointments', name: 'Appointments', desc: 'Salons, spas & wellness', icon: Calendar },
  { id: 'home', name: 'Home', desc: 'Repairs & home services', icon: Home },
  { id: 'personal', name: 'Personal', desc: 'Errands, planning & research', icon: User },
  { id: 'business', name: 'Business', desc: 'Corporate gifting & meetings', icon: Briefcase },
  { id: 'other', name: 'Anything Else', desc: 'Whatever needs taking care of', icon: Sparkles },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>(['dining']);
  const [commPref, setCommPref] = useState<'IN_APP' | 'EMAIL' | 'WHATSAPP' | 'SMS'>('IN_APP');
  const [loading, setLoading] = useState(false);

  const toggleCategory = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? (prev.length > 1 ? prev.filter((x) => x !== id) : prev) : [...prev, id]
    );
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/customer/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          primaryUseCases: selected,
          communicationPref: commPref,
          city: 'Global',
        }),
      });
      if (res.ok) {
        router.push('/dashboard?welcome=true');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-2xl w-full bg-white rounded-2xl border border-neutral-200 p-6 sm:p-10 shadow-sm">
        <div className="text-center mb-8">
          <p className="text-xs tracking-[0.15em] uppercase text-neutral-400 font-semibold mb-1">PROVENTA ONBOARDING</p>
          <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-900">What would you most like handled?</h1>
          <p className="text-sm text-neutral-500 mt-2">Select the areas where having a concierge is most valuable to you.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selected.includes(cat.id);
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggleCategory(cat.id)}
                className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-neutral-900 bg-neutral-50 shadow-sm ring-1 ring-neutral-900'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <Icon className={`h-5 w-5 ${isSelected ? 'text-neutral-900' : 'text-neutral-500'}`} />
                  {isSelected && <Check className="h-4 w-4 text-neutral-900" />}
                </div>
                <p className="text-sm font-semibold text-neutral-900">{cat.name}</p>
                <p className="text-xs text-neutral-500 mt-0.5">{cat.desc}</p>
              </button>
            );
          })}
        </div>

        <div className="border-t border-neutral-100 pt-6 mb-8">
          <label className="block text-sm font-semibold text-neutral-900 mb-3">
            How should your concierge communicate updates with you?
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: 'IN_APP', label: 'In-App Message' },
              { id: 'EMAIL', label: 'Email' },
              { id: 'WHATSAPP', label: 'WhatsApp' },
              { id: 'SMS', label: 'SMS' },
            ].map((method) => (
              <button
                key={method.id}
                type="button"
                onClick={() => setCommPref(method.id as any)}
                className={`py-2.5 px-3 rounded-lg border text-xs font-medium transition-colors text-center ${
                  commPref === method.id
                    ? 'border-neutral-900 bg-neutral-900 text-white'
                    : 'border-neutral-200 text-neutral-700 hover:border-neutral-300'
                }`}
              >
                {method.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={handleFinish}
          className="w-full py-3.5 bg-neutral-900 text-white rounded-xl text-sm font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving preferences...' : 'Enter Proventa'}
        </button>
      </div>
    </div>
  );
}
