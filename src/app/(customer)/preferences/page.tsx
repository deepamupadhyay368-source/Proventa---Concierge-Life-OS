'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Shield } from 'lucide-react';

export default function PreferencesPage() {
  const [preferences, setPreferences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('dining');
  const [key, setKey] = useState('');
  const [val, setVal] = useState('');
  const [saving, setSaving] = useState(false);

  const loadPrefs = async () => {
    try {
      const res = await fetch('/api/customer/preferences');
      const data = await res.json();
      if (data.preferences) setPreferences(data.preferences);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrefs();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim() || !val.trim()) return;

    setSaving(true);
    try {
      const res = await fetch('/api/customer/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, key: key.trim(), value: val.trim() }),
      });
      if (res.ok) {
        setKey('');
        setVal('');
        loadPrefs();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await fetch('/api/customer/preferences', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    loadPrefs();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Your Explicit Preferences</h1>
        <p className="text-xs text-neutral-500 mt-1">
          Proventa uses these to tailor recommendations to your taste. You have 100% control to view, add, or delete them.
        </p>
      </div>

      <div className="p-4 bg-brand-50 border border-brand-200 rounded-xl flex items-start gap-3 text-xs text-brand-900 leading-relaxed">
        <Shield className="h-4 w-4 text-brand-700 flex-shrink-0 mt-0.5" />
        <span>
          <strong>Privacy Guarantee:</strong> We never infer sensitive characteristics or share your preferences with third parties without your explicit approval during booking.
        </span>
      </div>

      {/* Add Preference Form */}
      <form onSubmit={handleAdd} className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-semibold text-neutral-900">Add a Preference</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-xs bg-white focus:outline-none"
            >
              <option value="dining">Dining & Dietary</option>
              <option value="travel">Travel & Airlines</option>
              <option value="shopping">Shopping & Gifting</option>
              <option value="home">Home & Service</option>
              <option value="general">General Lifestyle</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">Preference Title</label>
            <input
              type="text"
              placeholder="e.g. Dietary requirement, Seating preference"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-xs focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">Details</label>
            <input
              type="text"
              placeholder="e.g. Pure Vegetarian, Window seat, Quiet corner"
              value={val}
              onChange={(e) => setVal(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-xs focus:outline-none"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-900 text-white text-xs font-medium rounded-lg hover:bg-neutral-800 disabled:opacity-50"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Save Preference</span>
        </button>
      </form>

      {/* Preferences List */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-neutral-900 mb-4">Saved Preferences ({preferences.length})</h2>

        {loading ? (
          <p className="text-xs text-neutral-400">Loading...</p>
        ) : preferences.length === 0 ? (
          <p className="text-xs text-neutral-400">No preferences added yet. Add one above.</p>
        ) : (
          <div className="divide-y divide-neutral-100">
            {preferences.map((p) => (
              <div key={p.id} className="py-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-semibold px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded">
                    {p.category}
                  </span>
                  <p className="text-xs font-semibold text-neutral-900 mt-1">{p.key}</p>
                  <p className="text-xs text-neutral-500">{typeof p.value === 'object' ? JSON.stringify(p.value) : p.value}</p>
                </div>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="p-1.5 text-neutral-400 hover:text-red-600 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
