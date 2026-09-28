'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Download,
  Send,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Trash2,
  Edit3,
  HelpCircle,
  Lock,
} from 'lucide-react';
import { LegalHeader, LegalNav } from '@/components/legal/legal-nav';
import { POLICY_VERSIONS, POLICY_EFFECTIVE_DATES } from '@/lib/legal/versions';

export default function PrivacyRequestsPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    requestType: 'DATA_ACCESS',
    details: '',
  });
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const handleExport = async () => {
    setExportLoading(true);
    setExportError(null);
    try {
      const res = await fetch('/api/customer/data-export');
      if (res.status === 401) {
        setExportError('You must be signed in to your Proventa member account to instantly export data.');
        return;
      }
      if (!res.ok) {
        throw new Error('Failed to generate export dossier');
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `proventa-data-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setExportError(err.message || 'Export failed. Please submit a request below.');
    } finally {
      setExportLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/legal/privacy-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit privacy request');
      }

      setStatusMessage({
        type: 'success',
        text: `Request recorded successfully (ID: ${data.requestId}). Our privacy desk will process and reply to ${formData.email}.`,
      });
      setFormData({ name: '', email: '', requestType: 'DATA_ACCESS', details: '' });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'An error occurred while submitting your request.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#141312] pt-24 pb-20 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* Sidebar Navigation */}
          <aside className="hidden lg:block lg:col-span-1 space-y-4">
            <div className="sticky top-28 p-4 bg-white rounded-2xl border border-[#ded7cc] shadow-xs space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#8a7053]">
                Legal &amp; Trust Index
              </p>
              <LegalNav />
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="lg:col-span-3 bg-white p-8 sm:p-12 rounded-3xl border border-[#ded7cc] shadow-sm space-y-10">
            <LegalHeader
              title="Data Rights &amp; Privacy Requests"
              subtitle="Exercise your sovereign data rights. Instantly download your full personal data dossier or submit formal requests for data access, correction, deletion, or consent withdrawal."
              version={POLICY_VERSIONS.privacy}
              effectiveDate={POLICY_EFFECTIVE_DATES.privacy}
            />

            <div className="space-y-10 text-sm text-[#3b3834] leading-relaxed">
              {/* Sovereign Data Export Box */}
              <section className="p-6 rounded-2xl bg-[#faf8f5] border border-[#ded7cc] space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white rounded-xl border border-[#e8e2d8] text-[#8a7053] shrink-0">
                    <Download className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-semibold text-[#141312]">
                      Instant Sovereign Data Export (JSON)
                    </h3>
                    <p className="text-xs text-[#6e6b65]">
                      Download a machine-readable JSON dossier containing all your profile information, lifestyle preferences, task history, timeline events, and consent records.
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <button
                    type="button"
                    onClick={handleExport}
                    disabled={exportLoading}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#141312] text-white text-xs font-medium hover:bg-[#2b2825] transition-colors disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    {exportLoading ? 'Generating Export...' : 'Download My Data Dossier (.json)'}
                  </button>
                  <span className="text-[11px] text-[#8a857e]">
                    Requires active session. No third-party data broker dependencies.
                  </span>
                </div>

                {exportError && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>{exportError}</span>
                  </div>
                )}
              </section>

              {/* Interactive Request Form */}
              <section className="space-y-6">
                <div className="space-y-1">
                  <h2 className="text-lg font-serif font-semibold text-[#141312] tracking-tight">
                    Submit a Formal Privacy Request
                  </h2>
                  <p className="text-xs text-[#6e6b65]">
                    Our privacy desk will acknowledge and review your request under standard operating timelines.
                  </p>
                </div>

                {statusMessage && (
                  <div
                    className={`p-4 rounded-xl text-xs flex items-start gap-3 ${
                      statusMessage.type === 'success'
                        ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                        : 'bg-rose-50 border border-rose-200 text-rose-900'
                    }`}
                  >
                    {statusMessage.type === 'success' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="font-semibold">
                        {statusMessage.type === 'success' ? 'Request Submitted' : 'Submission Error'}
                      </p>
                      <p className="mt-0.5">{statusMessage.text}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label htmlFor="name" className="block text-xs font-semibold text-[#141312]">
                        Your Name
                      </label>
                      <input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#ded7cc] bg-white text-[#141312] focus:outline-hidden focus:ring-2 focus:ring-[#8a7053]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="email" className="block text-xs font-semibold text-[#141312]">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="rahul@example.com"
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#ded7cc] bg-white text-[#141312] focus:outline-hidden focus:ring-2 focus:ring-[#8a7053]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="requestType" className="block text-xs font-semibold text-[#141312]">
                      Request Category <span className="text-rose-500">*</span>
                    </label>
                    <select
                      id="requestType"
                      value={formData.requestType}
                      onChange={(e) => setFormData({ ...formData, requestType: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#ded7cc] bg-white text-[#141312] focus:outline-hidden focus:ring-2 focus:ring-[#8a7053]"
                    >
                      <option value="DATA_ACCESS">Data Access / Information Inquiry</option>
                      <option value="DATA_CORRECTION">Data Correction / Profile Update</option>
                      <option value="DATA_DELETION">Account Erasure / Data Deletion</option>
                      <option value="WITHDRAW_CONSENT">Withdraw Marketing / Optional Consent</option>
                      <option value="PRIVACY_COMPLAINT">Privacy or Security Complaint</option>
                      <option value="OTHER">Other Sovereign Data Inquiry</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="details" className="block text-xs font-semibold text-[#141312]">
                      Specific Details / Instructions
                    </label>
                    <textarea
                      id="details"
                      rows={4}
                      value={formData.details}
                      onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                      placeholder="Please specify any specific tasks, records, or preferences you wish to review, update, or remove..."
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#ded7cc] bg-white text-[#141312] focus:outline-hidden focus:ring-2 focus:ring-[#8a7053]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#8a7053] text-white text-xs font-semibold hover:bg-[#6d5941] transition-colors disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    {loading ? 'Submitting Request...' : 'Submit Privacy Request'}
                  </button>
                </form>
              </section>

              {/* Sovereign Rights Explanation */}
              <section className="space-y-4 pt-4 border-t border-[#ded7cc]">
                <h3 className="text-base font-semibold text-[#141312]">
                  Summary of Sovereign Member Rights
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1">
                    <strong className="text-neutral-900 block font-semibold">Right to Know &amp; Access</strong>
                    <p className="text-neutral-600">
                      Understand what personal preferences, task histories, and communications Proventa maintains on file.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1">
                    <strong className="text-neutral-900 block font-semibold">Right to Rectification</strong>
                    <p className="text-neutral-600">
                      Ensure your contact information, dietary requirements, and cabin preferences remain accurate and up-to-date.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1">
                    <strong className="text-neutral-900 block font-semibold">Right to Erasure</strong>
                    <p className="text-neutral-600">
                      Request permanent deletion of your account and associated concierge history (subject to mandatory statutory tax retention).
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1">
                    <strong className="text-neutral-900 block font-semibold">Right to Grievance Redressal</strong>
                    <p className="text-neutral-600">
                      Direct escalation to our Grievance Desk via <a href="mailto:privacy@proventa.in" className="text-[#8a7053] underline">privacy@proventa.in</a>.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
