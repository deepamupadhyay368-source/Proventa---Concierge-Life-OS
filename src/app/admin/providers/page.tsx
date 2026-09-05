'use client';

import { useState, useEffect } from 'react';
import { Store, CheckCircle2, Plus, Phone, Globe, MapPin } from 'lucide-react';

export default function AdminProvidersPage() {
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [bookingMethod, setBookingMethod] = useState('PHONE');
  const [notes, setNotes] = useState('');
  const [adding, setAdding] = useState(false);

  const loadProviders = async () => {
    try {
      const res = await fetch('/api/admin/providers');
      const data = await res.json();
      if (data.providers) setProviders(data.providers);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProviders();
  }, []);

  const handleAddProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    try {
      const res = await fetch('/api/admin/providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          categoryId: categoryId || 'cat_dining',
          address,
          phone,
          bookingMethod,
          notes,
        }),
      });
      if (res.ok) {
        setName('');
        setAddress('');
        setPhone('');
        setNotes('');
        loadProviders();
      }
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-neutral-900">Ahmedabad Provider Network</h1>
        <p className="text-xs text-neutral-500 mt-0.5">Manage verified local service providers across dining, travel, wellness, and lifestyle.</p>
      </div>

      {/* Add Provider Form */}
      <form onSubmit={handleAddProvider} className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-700">Add & Verify New Provider</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block text-neutral-600 font-medium mb-1">Provider Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Agashiye, House of MG"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-neutral-600 font-medium mb-1">Direct Phone</label>
            <input
              type="tel"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-neutral-600 font-medium mb-1">Booking Method</label>
            <select
              value={bookingMethod}
              onChange={(e) => setBookingMethod(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg bg-white focus:outline-none"
            >
              <option value="PHONE">Phone Reservation</option>
              <option value="WHATSAPP">WhatsApp Business</option>
              <option value="EMAIL">Email Confirmation</option>
              <option value="API">API Integration</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-neutral-600 font-medium mb-1">Address / Venue</label>
            <input
              type="text"
              placeholder="Opp. Sidi Saiyyed Mosque, Ahmedabad"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-neutral-600 font-medium mb-1">Concierge Notes</label>
            <input
              type="text"
              placeholder="e.g. 24h notice needed for weekend dinner"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={adding}
          className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-xs font-medium hover:bg-neutral-800 disabled:opacity-50"
        >
          {adding ? 'Saving...' : 'Add Verified Provider'}
        </button>
      </form>

      {/* Providers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <p className="text-xs text-neutral-400 col-span-3">Loading network...</p>
        ) : (
          providers.map((p) => (
            <div key={p.id} className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-brand-800 bg-brand-50 px-2 py-0.5 rounded">
                  {p.category?.name || 'Category'}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="h-3 w-3" /> Score {p.reliabilityScore}%
                </span>
              </div>

              <h3 className="text-sm font-bold text-neutral-900">{p.name}</h3>
              {p.description && <p className="text-xs text-neutral-500 line-clamp-2">{p.description}</p>}

              <div className="text-xs text-neutral-600 space-y-1 pt-2 border-t border-neutral-100">
                {p.address && (
                  <p className="flex items-center gap-1.5 line-clamp-1">
                    <MapPin className="h-3 w-3 text-neutral-400 flex-shrink-0" />
                    <span>{p.address}</span>
                  </p>
                )}
                {p.phone && (
                  <p className="flex items-center gap-1.5">
                    <Phone className="h-3 w-3 text-neutral-400 flex-shrink-0" />
                    <span>{p.phone}</span>
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
