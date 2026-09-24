'use client';

import { useState } from 'react';
import { User, Phone, MapPin, MessageSquare, Check, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function ProfileEditForm({
  initialUser,
}: {
  initialUser: {
    name: string | null;
    email: string;
    phone: string | null;
    city?: string | null;
    preferredComm?: string | null;
  };
}) {
  const router = useRouter();
  const [name, setName] = useState(initialUser.name || '');
  const [phone, setPhone] = useState(initialUser.phone || '');
  const [city, setCity] = useState(initialUser.city || 'Ahmedabad');
  const [preferredComm, setPreferredComm] = useState(initialUser.preferredComm || 'IN_APP');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch('/api/customer/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          city,
          preferredComm,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to update profile');
      }

      setSuccess(true);
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Network error updating profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
      {error && (
        <div className="p-3 text-xs bg-red-50 text-red-700 border border-red-200 rounded-xl">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl flex items-center gap-2">
          <Check className="h-4 w-4" />
          <span>Profile updated successfully</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-neutral-600 font-medium mb-1 flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-neutral-400" />
            <span>Full Name</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:border-brand-500 text-neutral-900 bg-neutral-50/50"
          />
        </div>

        <div>
          <label className="block text-neutral-600 font-medium mb-1 flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5 text-neutral-400" />
            <span>Contact Phone</span>
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 9876543210"
            className="w-full px-3 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:border-brand-500 text-neutral-900 bg-neutral-50/50"
          />
        </div>

        <div>
          <label className="block text-neutral-600 font-medium mb-1 flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-neutral-400" />
            <span>Primary Location / City</span>
          </label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full px-3 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:border-brand-500 text-neutral-900 bg-neutral-50/50"
          />
        </div>

        <div>
          <label className="block text-neutral-600 font-medium mb-1 flex items-center gap-1.5">
            <MessageSquare className="h-3.5 w-3.5 text-neutral-400" />
            <span>Preferred Communication Channel</span>
          </label>
          <select
            value={preferredComm}
            onChange={(e) => setPreferredComm(e.target.value)}
            className="w-full px-3 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:border-brand-500 text-neutral-900 bg-neutral-50/50"
          >
            <option value="IN_APP">In-App Chat &amp; Notifications</option>
            <option value="WHATSAPP">WhatsApp Priority Channel</option>
            <option value="EMAIL">Email Dispatch</option>
            <option value="SMS">Direct SMS</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-medium transition-colors disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Saving Changes...</span>
            </>
          ) : (
            <span>Save Profile Settings</span>
          )}
        </button>
      </div>
    </form>
  );
}
