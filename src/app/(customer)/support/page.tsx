'use client';

import { useState } from 'react';
import { HelpCircle, Send, CheckCircle2 } from 'lucide-react';

export default function SupportPage() {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/customer/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, description }),
      });
      if (res.ok) {
        setSubmitted(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Concierge Help & Support</h1>
        <p className="text-xs text-neutral-500 mt-1">
          Have an urgent question or need supervisor review on a request? Let our operations team know.
        </p>
      </div>

      {submitted ? (
        <div className="bg-white border border-neutral-200 rounded-2xl p-8 text-center shadow-sm">
          <CheckCircle2 className="h-10 w-10 text-green-600 mx-auto mb-3" />
          <h2 className="text-base font-semibold text-neutral-900 mb-1">Support Ticket Created</h2>
          <p className="text-xs text-neutral-500 max-w-md mx-auto leading-relaxed">
            Our concierge manager has received your note and will review it promptly. We will follow up via your preferred communication channel.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Subject</label>
            <input
              type="text"
              required
              placeholder="e.g. Question regarding reservation timing"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2.5 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Description</label>
            <textarea
              required
              rows={4}
              placeholder="Describe what you need assistance with..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2.5 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-neutral-900 text-white rounded-xl text-xs font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Support Request'}
          </button>
        </form>
      )}
    </div>
  );
}
