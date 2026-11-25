'use client';

import { useState } from 'react';
import { User, Mail, Phone, MapPin, Save, CheckCircle2 } from 'lucide-react';

export default function ProfileSettingsPage() {
  const [name, setName] = useState('Rajiv Mehta');
  const [email, setEmail] = useState('rajiv.mehta@example.com');
  const [phone, setPhone] = useState('+91 98250 12345');
  const [city, setCity] = useState('Ahmedabad, Gujarat');
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="border-b border-[#C8C4BA] pb-4">
        <span className="text-[10px] font-mono uppercase tracking-wider text-[#547568] font-bold">
          Account Settings
        </span>
        <h1 className="font-editorial text-2xl font-normal text-[#202B3C]">
          Personal Profile & Preferences
        </h1>
        <p className="text-xs text-[#69717B] mt-1">
          Manage your contact credentials and preferred Gujarat micro-market focus.
        </p>
      </div>

      {saved && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>Profile changes saved successfully.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-[#C8C4BA] p-6 space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-[#202B3C] mb-1">Full Legal Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full h-10 px-3 border border-[#C8C4BA] bg-white text-[#202B3C] focus:outline-hidden"
          />
        </div>

        <div>
          <label className="block font-semibold text-[#202B3C] mb-1">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full h-10 px-3 border border-[#C8C4BA] bg-white text-[#202B3C] focus:outline-hidden"
          />
        </div>

        <div>
          <label className="block font-semibold text-[#202B3C] mb-1">Mobile Contact</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className="w-full h-10 px-3 border border-[#C8C4BA] bg-white text-[#202B3C] focus:outline-hidden"
          />
        </div>

        <div>
          <label className="block font-semibold text-[#202B3C] mb-1">Primary Market City</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
            className="w-full h-10 px-3 border border-[#C8C4BA] bg-white text-[#202B3C] focus:outline-hidden"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="h-10 px-5 bg-[#202B3C] text-white font-bold uppercase tracking-wider text-xs inline-flex items-center gap-2 hover:bg-[#202B3C]/90"
          >
            <Save className="h-4 w-4" />
            <span>Save Profile</span>
          </button>
        </div>
      </form>
    </div>
  );
}
